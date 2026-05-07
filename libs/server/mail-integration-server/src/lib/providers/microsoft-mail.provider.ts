import type { MicrosoftMailConnection, UserUuid } from "@optee/models";
import crypto from "node:crypto";
import {
  createSignedStateCodec,
  createTokenExpiry,
  decryptSecret,
  encryptSecret,
  exchangeOAuthTokens,
  getScopes,
  hasUsableAccessToken,
  parseJson,
  requireEnv,
  resolveRefreshToken,
} from "./oauth-provider.utils";
import { MailConnectionRepository } from "../repositories/mail-connection.repository";

const MICROSOFT_AUTHORIZE_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const MICROSOFT_TOKEN_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const MICROSOFT_ME_URL =
  "https://graph.microsoft.com/v1.0/me?$select=id,mail,userPrincipalName";
const MICROSOFT_SEND_MAIL_URL = "https://graph.microsoft.com/v1.0/me/sendMail";
const MICROSOFT_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "User.Read",
  "Mail.Send",
] as const;
const MICROSOFT_STATE_TTL_MS = 10 * 60 * 1000;

type MicrosoftMeResponse = {
  id?: string;
  mail?: string | null;
  userPrincipalName?: string | null;
};

const microsoftStateCodec = createSignedStateCodec("Microsoft", () =>
  requireEnv("MICROSOFT_CLIENT_SECRET"),
);

const exchangeCodeForTokens = async (code: string) => {
  return exchangeOAuthTokens({
    url: MICROSOFT_TOKEN_URL,
    errorMessage: "Failed to exchange Microsoft authorization code",
    body: new URLSearchParams({
      client_id: requireEnv("MICROSOFT_CLIENT_ID"),
      client_secret: requireEnv("MICROSOFT_CLIENT_SECRET"),
      code,
      redirect_uri: requireEnv("MICROSOFT_REDIRECT_URI"),
      grant_type: "authorization_code",
      scope: MICROSOFT_SCOPES.join(" "),
    }),
  });
};

const refreshAccessToken = async (connection: MicrosoftMailConnection) => {
  const tokens = await exchangeOAuthTokens({
    url: MICROSOFT_TOKEN_URL,
    errorMessage: "Failed to refresh Microsoft token",
    body: new URLSearchParams({
      client_id: requireEnv("MICROSOFT_CLIENT_ID"),
      client_secret: requireEnv("MICROSOFT_CLIENT_SECRET"),
      refresh_token: decryptSecret(connection.refreshTokenEncrypted),
      grant_type: "refresh_token",
      redirect_uri: requireEnv("MICROSOFT_REDIRECT_URI"),
      scope: MICROSOFT_SCOPES.join(" "),
    }),
  });

  const updated = await MailConnectionRepository.saveForUser(
    connection.userUuid,
    "microsoft",
    {
      email: connection.email,
      providerAccountId: connection.providerAccountId,
      emailVerified: connection.emailVerified,
      scope: tokens.scope ?? connection.scope,
      accessTokenEncrypted: encryptSecret(tokens.access_token),
      refreshTokenEncrypted:
        tokens.refresh_token != null
          ? encryptSecret(tokens.refresh_token)
          : connection.refreshTokenEncrypted,
      tokenExpiresAt: createTokenExpiry(tokens.expires_in),
      lastValidatedAt: new Date(),
    },
  );

  if (!updated) {
    throw new Error("Failed to persist refreshed Microsoft token");
  }

  return {
    accessToken: tokens.access_token,
    connection: updated,
  };
};

const fetchMicrosoftMe = async (accessToken: string) => {
  const response = await fetch(MICROSOFT_ME_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = await parseJson<MicrosoftMeResponse>(response);
  const microsoftEmail = (json.mail ?? json.userPrincipalName ?? "").trim();

  if (!response.ok || !json.id || !microsoftEmail) {
    throw new Error("Failed to fetch Microsoft user profile");
  }

  return {
    microsoftUserId: json.id,
    microsoftEmail: microsoftEmail.toLowerCase(),
  };
};

export const MicrosoftMailProvider = {
  createAuthorizationUrl(userUuid: UserUuid) {
    const state = microsoftStateCodec.encode({
      nonce: crypto.randomUUID(),
      userUuid,
      issuedAt: Date.now(),
      expiresAt: Date.now() + MICROSOFT_STATE_TTL_MS,
    });
    const params = new URLSearchParams({
      client_id: requireEnv("MICROSOFT_CLIENT_ID"),
      redirect_uri: requireEnv("MICROSOFT_REDIRECT_URI"),
      response_type: "code",
      response_mode: "query",
      scope: MICROSOFT_SCOPES.join(" "),
      state,
      prompt: "select_account",
    });

    return `${MICROSOFT_AUTHORIZE_URL}?${params.toString()}`;
  },

  async handleCallback(input: { code: string; state: string }) {
    const decodedState = microsoftStateCodec.decode(input.state);
    const tokens = await exchangeCodeForTokens(input.code);
    const me = await fetchMicrosoftMe(tokens.access_token);
    const existingByEmail = await MailConnectionRepository.getMicrosoftByEmail(
      me.microsoftEmail,
    );
    const existingByUserId =
      await MailConnectionRepository.getMicrosoftByUserId(me.microsoftUserId);
    const conflictingConnection =
      existingByUserId?.userUuid !== decodedState.userUuid
        ? existingByUserId
        : existingByEmail?.userUuid !== decodedState.userUuid
          ? existingByEmail
          : null;

    if (conflictingConnection) {
      throw new Error(
        "This Microsoft mailbox is already connected to another user",
      );
    }

    const existingForUser =
      await MailConnectionRepository.getMicrosoftByUserUuid(
        decodedState.userUuid,
      );
    const refreshToken = resolveRefreshToken(
      tokens.refresh_token,
      existingForUser?.refreshTokenEncrypted,
    );

    if (!refreshToken) {
      throw new Error("Missing Microsoft refresh token");
    }

    const saved = await MailConnectionRepository.saveForUser(
      decodedState.userUuid,
      "microsoft",
      {
        email: me.microsoftEmail,
        providerAccountId: me.microsoftUserId,
        emailVerified: false,
        scope: tokens.scope ?? MICROSOFT_SCOPES.join(" "),
        accessTokenEncrypted: encryptSecret(tokens.access_token),
        refreshTokenEncrypted: encryptSecret(refreshToken),
        tokenExpiresAt: createTokenExpiry(tokens.expires_in),
        lastValidatedAt: new Date(),
      },
    );

    if (!saved) {
      throw new Error("Failed to save Microsoft mailbox connection");
    }

    return {
      userUuid: decodedState.userUuid,
      microsoftEmail: saved.email,
      scopes: getScopes(saved.scope),
      connectedAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  },

  async getConnectionStatus(userUuid: UserUuid) {
    const connection =
      await MailConnectionRepository.getMicrosoftByUserUuid(userUuid);

    if (!connection) {
      return null;
    }

    const freshConnection = hasUsableAccessToken(connection.tokenExpiresAt)
      ? connection
      : (await refreshAccessToken(connection)).connection;

    return {
      microsoftEmail: freshConnection.email,
      scopes: getScopes(freshConnection.scope),
      tokenExpiresAt: freshConnection.tokenExpiresAt,
      connectedAt: freshConnection.createdAt,
      updatedAt: freshConnection.updatedAt,
    };
  },

  async disconnect(userUuid: UserUuid) {
    return MailConnectionRepository.deleteByUserUuid(userUuid, "microsoft");
  },

  async getValidAccessToken(userUuid: UserUuid) {
    const connection =
      await MailConnectionRepository.getMicrosoftByUserUuid(userUuid);

    if (!connection) {
      throw new Error("No Microsoft mailbox connection found for this user");
    }

    if (hasUsableAccessToken(connection.tokenExpiresAt)) {
      return {
        accessToken: decryptSecret(connection.accessTokenEncrypted),
        microsoftEmail: connection.email,
      };
    }

    const refreshed = await refreshAccessToken(connection);

    return {
      accessToken: refreshed.accessToken,
      microsoftEmail: refreshed.connection.email,
    };
  },

  async sendTestEmail(userUuid: UserUuid) {
    const { accessToken, microsoftEmail } =
      await MicrosoftMailProvider.getValidAccessToken(userUuid);
    const response = await fetch(MICROSOFT_SEND_MAIL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: "Test de messagerie Optee",
          body: {
            contentType: "HTML",
            content:
              "<p>Votre messagerie <strong>Microsoft</strong> est bien connectee a Optee.</p><p>Cet email confirme que l'envoi fonctionne.</p>",
          },
          toRecipients: [
            {
              emailAddress: {
                address: microsoftEmail,
              },
            },
          ],
        },
        saveToSentItems: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to send Microsoft test email");
    }

    return {
      sentTo: microsoftEmail,
    };
  },
};

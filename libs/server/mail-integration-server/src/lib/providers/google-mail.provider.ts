import type { GoogleMailConnection, UserUuid } from "@optee/models";
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

const GOOGLE_OAUTH_AUTHORIZE_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_GMAIL_SEND_URL =
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const GOOGLE_GMAIL_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.send",
] as const;
const GOOGLE_STATE_TTL_MS = 10 * 60 * 1000;

type GoogleUserInfoResponse = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
};

const googleStateCodec = createSignedStateCodec("Google", () =>
  requireEnv("GOOGLE_CLIENT_SECRET"),
);

const exchangeCodeForTokens = async (code: string) => {
  return exchangeOAuthTokens({
    url: GOOGLE_OAUTH_TOKEN_URL,
    errorMessage: "Failed to exchange Google authorization code",
    body: new URLSearchParams({
      code,
      client_id: requireEnv("GOOGLE_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: requireEnv("GOOGLE_REDIRECT_URI"),
      grant_type: "authorization_code",
    }),
  });
};

const refreshAccessToken = async (connection: GoogleMailConnection) => {
  const tokens = await exchangeOAuthTokens({
    url: GOOGLE_OAUTH_TOKEN_URL,
    errorMessage: "Failed to refresh Google token",
    body: new URLSearchParams({
      client_id: requireEnv("GOOGLE_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
      refresh_token: decryptSecret(connection.refreshTokenEncrypted),
      grant_type: "refresh_token",
    }),
  });
  const nextExpiry = createTokenExpiry(tokens.expires_in);

  const updated = await MailConnectionRepository.saveForUser(
    connection.userUuid,
    "google",
    {
      email: connection.email,
      providerAccountId: connection.providerAccountId,
      emailVerified: connection.emailVerified,
      scope: tokens.scope ?? connection.scope,
      accessTokenEncrypted: encryptSecret(tokens.access_token),
      refreshTokenEncrypted: connection.refreshTokenEncrypted,
      tokenExpiresAt: nextExpiry,
      lastValidatedAt: new Date(),
    },
  );

  if (!updated) {
    throw new Error("Failed to persist refreshed Google token");
  }

  return {
    accessToken: tokens.access_token,
    connection: updated,
  };
};

const fetchGoogleUserInfo = async (accessToken: string) => {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = await parseJson<GoogleUserInfoResponse>(response);

  if (!response.ok || !json.sub || !json.email) {
    throw new Error("Failed to fetch Google user profile");
  }

  return {
    googleSubject: json.sub,
    gmailEmail: json.email.toLowerCase(),
    emailVerified: Boolean(json.email_verified),
  };
};

const createGoogleTestMessage = (email: string) => {
  const subject = "Test de messagerie Optee";
  const text =
    "Votre messagerie Gmail est bien connectee a Optee. Cet email confirme que l'envoi fonctionne.";

  return Buffer.from(
    [
      `To: ${email}`,
      `From: ${email}`,
      "Content-Type: text/plain; charset=utf-8",
      "MIME-Version: 1.0",
      `Subject: ${subject}`,
      "",
      text,
    ].join("\r\n"),
  ).toString("base64url");
};

export const GoogleMailProvider = {
  createAuthorizationUrl(userUuid: UserUuid) {
    const state = googleStateCodec.encode({
      nonce: crypto.randomUUID(),
      userUuid,
      issuedAt: Date.now(),
      expiresAt: Date.now() + GOOGLE_STATE_TTL_MS,
    });
    const params = new URLSearchParams({
      client_id: requireEnv("GOOGLE_CLIENT_ID"),
      redirect_uri: requireEnv("GOOGLE_REDIRECT_URI"),
      response_type: "code",
      access_type: "offline",
      include_granted_scopes: "true",
      prompt: "consent",
      scope: GOOGLE_GMAIL_SCOPES.join(" "),
      state,
    });

    return `${GOOGLE_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
  },

  async handleCallback(input: { code: string; state: string }) {
    const decodedState = googleStateCodec.decode(input.state);
    const tokens = await exchangeCodeForTokens(input.code);
    const userInfo = await fetchGoogleUserInfo(tokens.access_token);
    const existingByEmail = await MailConnectionRepository.getGoogleByEmail(
      userInfo.gmailEmail,
    );
    const existingBySubject = await MailConnectionRepository.getGoogleBySubject(
      userInfo.googleSubject,
    );
    const conflictingConnection =
      existingBySubject?.userUuid !== decodedState.userUuid
        ? existingBySubject
        : existingByEmail?.userUuid !== decodedState.userUuid
          ? existingByEmail
          : null;

    if (conflictingConnection) {
      throw new Error(
        "This Gmail address is already connected to another user",
      );
    }

    const existingForUser = await MailConnectionRepository.getGoogleByUserUuid(
      decodedState.userUuid,
    );
    const refreshToken = resolveRefreshToken(
      tokens.refresh_token,
      existingForUser?.refreshTokenEncrypted,
    );

    if (!refreshToken) {
      throw new Error("Missing Google refresh token");
    }

    const saved = await MailConnectionRepository.saveForUser(
      decodedState.userUuid,
      "google",
      {
        email: userInfo.gmailEmail,
        providerAccountId: userInfo.googleSubject,
        emailVerified: userInfo.emailVerified,
        scope: tokens.scope ?? GOOGLE_GMAIL_SCOPES.join(" "),
        accessTokenEncrypted: encryptSecret(tokens.access_token),
        refreshTokenEncrypted: encryptSecret(refreshToken),
        tokenExpiresAt: createTokenExpiry(tokens.expires_in),
        lastValidatedAt: new Date(),
      },
    );

    if (!saved) {
      throw new Error("Failed to save Gmail connection");
    }

    return {
      userUuid: decodedState.userUuid,
      gmailEmail: saved.email,
      scopes: getScopes(saved.scope),
      connectedAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  },

  async getConnectionStatus(userUuid: UserUuid) {
    const connection =
      await MailConnectionRepository.getGoogleByUserUuid(userUuid);

    if (!connection) {
      return null;
    }

    const freshConnection = hasUsableAccessToken(connection.tokenExpiresAt)
      ? connection
      : (await refreshAccessToken(connection)).connection;

    return {
      gmailEmail: freshConnection.email,
      emailVerified: freshConnection.emailVerified,
      scopes: getScopes(freshConnection.scope),
      tokenExpiresAt: freshConnection.tokenExpiresAt,
      connectedAt: freshConnection.createdAt,
      updatedAt: freshConnection.updatedAt,
    };
  },

  async disconnect(userUuid: UserUuid) {
    return MailConnectionRepository.deleteByUserUuid(userUuid, "google");
  },

  async getValidAccessToken(userUuid: UserUuid) {
    const connection =
      await MailConnectionRepository.getGoogleByUserUuid(userUuid);

    if (!connection) {
      throw new Error("No Gmail connection found for this user");
    }

    if (hasUsableAccessToken(connection.tokenExpiresAt)) {
      return {
        accessToken: decryptSecret(connection.accessTokenEncrypted),
        gmailEmail: connection.email,
      };
    }

    const refreshed = await refreshAccessToken(connection);

    return {
      accessToken: refreshed.accessToken,
      gmailEmail: refreshed.connection.email,
    };
  },

  async sendTestEmail(userUuid: UserUuid) {
    const { accessToken, gmailEmail } =
      await GoogleMailProvider.getValidAccessToken(userUuid);
    const response = await fetch(GOOGLE_GMAIL_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: createGoogleTestMessage(gmailEmail),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to send Gmail test email");
    }

    return {
      sentTo: gmailEmail,
    };
  },
};

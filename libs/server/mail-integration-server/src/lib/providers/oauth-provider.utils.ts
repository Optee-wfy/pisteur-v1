import type { UserUuid } from "@optee/models";
import crypto from "node:crypto";

export const ACCESS_TOKEN_REFRESH_SKEW_MS = 10 * 60 * 1000;
export const OAUTH_NETWORK_TIMEOUT_MS = 10 * 1000;
const OAUTH_TOKEN_ENCRYPTION_PREFIX = "enc:v1";
const OAUTH_TOKEN_ENCRYPTION_ALGORITHM = "aes-256-gcm";
const OAUTH_TOKEN_ENCRYPTION_IV_LENGTH = 12;
const OAUTH_TOKEN_ENCRYPTION_AUTH_TAG_LENGTH = 16;

let cachedOAuthTokenEncryptionKey: Buffer | null = null;
let cachedOAuthTokenEncryptionKeyValue: string | null = null;

export type OAuthState = {
  nonce: string;
  userUuid: UserUuid;
  issuedAt: number;
  expiresAt: number;
};

export type OAuthTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

export type OAuthTokenSuccessResponse = {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

export const requireEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const getOAuthTokenEncryptionKey = () => {
  const keyValue = requireEnv("OAUTH_TOKEN_ENCRYPTION_KEY");

  if (
    cachedOAuthTokenEncryptionKey != null &&
    cachedOAuthTokenEncryptionKeyValue === keyValue
  ) {
    return cachedOAuthTokenEncryptionKey;
  }

  cachedOAuthTokenEncryptionKeyValue = keyValue;
  cachedOAuthTokenEncryptionKey = crypto
    .createHash("sha256")
    .update(keyValue)
    .digest();

  return cachedOAuthTokenEncryptionKey;
};

export const encryptSecret = (value: string) => {
  const iv = crypto.randomBytes(OAUTH_TOKEN_ENCRYPTION_IV_LENGTH);
  const cipher = crypto.createCipheriv(
    OAUTH_TOKEN_ENCRYPTION_ALGORITHM,
    getOAuthTokenEncryptionKey(),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${OAUTH_TOKEN_ENCRYPTION_PREFIX}.${iv.toString("base64url")}.${authTag.toString("base64url")}.${encrypted.toString("base64url")}`;
};

export const decryptSecret = (value: string) => {
  if (!value.startsWith(`${OAUTH_TOKEN_ENCRYPTION_PREFIX}.`)) {
    return value;
  }

  const payload = value.slice(OAUTH_TOKEN_ENCRYPTION_PREFIX.length + 1);
  const [ivBase64Url, authTagBase64Url, encryptedBase64Url] =
    payload.split(".");

  if (!ivBase64Url || !authTagBase64Url || !encryptedBase64Url) {
    throw new Error("Invalid encrypted OAuth token format");
  }

  const iv = Buffer.from(ivBase64Url, "base64url");
  const authTag = Buffer.from(authTagBase64Url, "base64url");
  const encrypted = Buffer.from(encryptedBase64Url, "base64url");

  if (iv.length !== OAUTH_TOKEN_ENCRYPTION_IV_LENGTH) {
    throw new Error("Invalid encrypted OAuth token IV");
  }

  if (authTag.length !== OAUTH_TOKEN_ENCRYPTION_AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted OAuth token auth tag");
  }

  const decipher = crypto.createDecipheriv(
    OAUTH_TOKEN_ENCRYPTION_ALGORITHM,
    getOAuthTokenEncryptionKey(),
    iv,
  );
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
};

export const parseJson = async <T>(response: Response) => {
  return (await response.json()) as T;
};

export const fetchWithNetworkTimeout = async (
  input: string | URL | globalThis.Request,
  init?: RequestInit,
) => {
  const controller = new AbortController();
  // eslint-disable-next-line @rx-angular/no-zone-critical-browser-apis
  const timeout = setTimeout(
    () => controller.abort(),
    OAUTH_NETWORK_TIMEOUT_MS,
  );

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `OAuth network timeout after ${OAUTH_NETWORK_TIMEOUT_MS}ms`,
      );
    }

    throw error;
  } finally {
    // eslint-disable-next-line @rx-angular/no-zone-critical-browser-apis
    clearTimeout(timeout);
  }
};

export const exchangeOAuthTokens = async (input: {
  url: string;
  body: URLSearchParams;
  errorMessage: string;
}) => {
  const response = await fetchWithNetworkTimeout(input.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: input.body,
  });

  const json = await parseJson<OAuthTokenResponse>(response);

  if (!response.ok || !json.access_token) {
    throw new Error(json.error_description ?? json.error ?? input.errorMessage);
  }

  return {
    access_token: json.access_token,
    expires_in: json.expires_in,
    refresh_token: json.refresh_token,
    scope: json.scope,
    token_type: json.token_type,
  } satisfies OAuthTokenSuccessResponse;
};

export const createSignedStateCodec = (
  providerName: string,
  getSecret: () => string,
) => {
  const signState = (payload: string) => {
    return crypto
      .createHmac("sha256", getSecret())
      .update(payload)
      .digest("base64url");
  };

  const timingSafeStateEquals = (left: string, right: string) => {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
  };

  return {
    encode(state: OAuthState) {
      const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
      const signature = signState(payload);

      return `${payload}.${signature}`;
    },

    decode(state: string): OAuthState {
      const [payload, signature] = state.split(".");

      if (!payload || !signature) {
        throw new Error(`Invalid ${providerName} OAuth state`);
      }

      const expectedSignature = signState(payload);

      if (!timingSafeStateEquals(signature, expectedSignature)) {
        throw new Error(`Invalid ${providerName} OAuth state signature`);
      }

      const parsed = JSON.parse(
        Buffer.from(payload, "base64url").toString("utf8"),
      ) as OAuthState;

      if (
        !parsed.userUuid ||
        !parsed.expiresAt ||
        Date.now() > parsed.expiresAt
      ) {
        throw new Error(`Expired ${providerName} OAuth state`);
      }

      return parsed;
    },
  };
};

export const createTokenExpiry = (expiresInSeconds?: number) => {
  return expiresInSeconds
    ? new Date(Date.now() + expiresInSeconds * 1000)
    : null;
};

export const getScopes = (scope: string) => {
  return scope.split(" ").filter(Boolean);
};

export const resolveRefreshToken = (
  refreshToken: string | null | undefined,
  fallbackEncryptedRefreshToken?: string | null,
) => {
  return (
    refreshToken ??
    (fallbackEncryptedRefreshToken
      ? decryptSecret(fallbackEncryptedRefreshToken)
      : null)
  );
};

export const hasUsableAccessToken = (tokenExpiresAt: Date | null) => {
  return (
    tokenExpiresAt != null &&
    tokenExpiresAt.getTime() > Date.now() + ACCESS_TOKEN_REFRESH_SKEW_MS
  );
};

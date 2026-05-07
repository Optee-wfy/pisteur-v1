import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@optee/env";
import { firstValueFrom } from "rxjs";
import { SupabaseService } from "../supabase.service";

export type MailConnectionStatus = "connected" | "disconnected";

export type GoogleMailConnection = {
  gmailEmail: string;
  emailVerified: boolean;
  scopes: string[];
  tokenExpiresAt: string | null;
  connectedAt: string;
  updatedAt: string;
};

export type MicrosoftMailConnection = {
  microsoftEmail: string;
  scopes: string[];
  tokenExpiresAt: string | null;
  connectedAt: string;
  updatedAt: string;
};

export type GoogleMailStatusResponse = {
  connected: boolean;
  connection: GoogleMailConnection | null;
};

export type MicrosoftMailStatusResponse = {
  connected: boolean;
  connection: MicrosoftMailConnection | null;
};

type MailStatusResponse<TConnection> = {
  connected: boolean;
  connection: TConnection | null;
};

type GoogleConnectResponse = {
  authorizationUrl: string;
};

type SendTestMailResponse = {
  sent: boolean;
  sentTo: string;
};

type GooglePopupMessage =
  | {
      source: "google-gmail-oauth";
      status: "success";
      connection: {
        gmailEmail: string;
      };
    }
  | {
      source: "google-gmail-oauth";
      status: "error";
      message?: string;
    };

type MicrosoftConnectResponse = {
  authorizationUrl: string;
};

type MicrosoftPopupMessage =
  | {
      source: "microsoft-mail-oauth";
      status: "success";
      connection: {
        microsoftEmail: string;
      };
    }
  | {
      source: "microsoft-mail-oauth";
      status: "error";
      message?: string;
    };

type PopupMessage = GooglePopupMessage | MicrosoftPopupMessage;

@Injectable({ providedIn: "root" })
export class MailIntegrationService {
  private readonly http = inject(HttpClient);

  private getApiUrl(path: string) {
    const baseUrl =
      environment.slug === "development" ? environment.apiUrl : "";
    return `${baseUrl}${path}`;
  }

  private async getHeaders() {
    const headers = await SupabaseService.getHeaders();
    return headers.authorization
      ? { authorization: headers.authorization }
      : undefined;
  }

  private async openOAuthPopup<TMessage extends PopupMessage>({
    authorizationUrl,
    windowName,
    source,
    expectedOrigin,
    blockedMessage,
    expiredMessage,
    closedMessage,
    failedMessage,
  }: {
    authorizationUrl: string;
    windowName: string;
    source: TMessage["source"];
    expectedOrigin: string;
    blockedMessage: string;
    expiredMessage: string;
    closedMessage: string;
    failedMessage: string;
  }) {
    const popup = window.open(
      authorizationUrl,
      windowName,
      "popup=yes,width=560,height=720,menubar=no,toolbar=no,status=no",
    );

    if (!popup) {
      throw new Error(blockedMessage);
    }

    return new Promise<TMessage>((resolve, reject) => {
      // eslint-disable-next-line @rx-angular/no-zone-critical-browser-apis
      const timeout = window.setTimeout(
        () => {
          cleanup();
          reject(new Error(expiredMessage));
        },
        10 * 60 * 1000,
      );

      // eslint-disable-next-line @rx-angular/no-zone-critical-browser-apis
      const closeWatcher = window.setInterval(() => {
        if (popup.closed) {
          cleanup();
          reject(new Error(closedMessage));
        }
      }, 400);

      const onMessage = (event: MessageEvent<TMessage>) => {
        if (
          event.origin !== expectedOrigin ||
          event.source !== popup ||
          event.data?.source !== source
        ) {
          return;
        }

        cleanup();

        if (event.data.status === "error") {
          reject(new Error(event.data.message ?? failedMessage));
          return;
        }

        resolve(event.data);
      };

      const cleanup = () => {
        // eslint-disable-next-line @rx-angular/no-zone-critical-browser-apis
        window.clearTimeout(timeout);
        // eslint-disable-next-line @rx-angular/no-zone-critical-browser-apis
        window.clearInterval(closeWatcher);
        window.removeEventListener("message", onMessage);
        if (!popup.closed) {
          popup.close();
        }
      };

      window.addEventListener("message", onMessage);
    });
  }

  async getGoogleStatus(): Promise<GoogleMailStatusResponse> {
    const headers = await this.getHeaders();
    return firstValueFrom(
      this.http.get<GoogleMailStatusResponse>(
        this.getApiUrl("/api/v1/integrations/google/status"),
        { headers, responseType: "json" },
      ),
    );
  }

  async disconnectGoogle(): Promise<{ disconnected: boolean }> {
    const headers = await this.getHeaders();
    return firstValueFrom(
      this.http.delete<{ disconnected: boolean }>(
        this.getApiUrl("/api/v1/integrations/google/disconnect"),
        { headers, responseType: "json" },
      ),
    );
  }

  async sendGoogleTestEmail(): Promise<SendTestMailResponse> {
    const headers = await this.getHeaders();
    return firstValueFrom(
      this.http.post<SendTestMailResponse>(
        this.getApiUrl("/api/v1/integrations/google/test"),
        {},
        { headers, responseType: "json" },
      ),
    );
  }

  async connectGoogleWithPopup(): Promise<GooglePopupMessage> {
    const headers = await this.getHeaders();
    const { authorizationUrl } = await firstValueFrom(
      this.http.post<GoogleConnectResponse>(
        this.getApiUrl("/api/v1/integrations/google/connect"),
        { mode: "json" },
        { headers, responseType: "json" },
      ),
    );

    if (!authorizationUrl) {
      throw new Error("URL Google OAuth manquante");
    }

    return this.openOAuthPopup<GooglePopupMessage>({
      authorizationUrl,
      windowName: "google-gmail-oauth",
      source: "google-gmail-oauth",
      expectedOrigin: new URL(this.getApiUrl("/"), window.location.origin)
        .origin,
      blockedMessage: "La fenêtre de connexion Google a été bloquée",
      expiredMessage: "La connexion Google a expiré",
      closedMessage: "La fenêtre Google a été fermée",
      failedMessage: "La connexion Google a échoué",
    });
  }

  async getMicrosoftStatus(): Promise<MicrosoftMailStatusResponse> {
    const headers = await this.getHeaders();
    return firstValueFrom(
      this.http.get<MicrosoftMailStatusResponse>(
        this.getApiUrl("/api/v1/integrations/microsoft/status"),
        { headers, responseType: "json" },
      ),
    );
  }

  async disconnectMicrosoft(): Promise<{ disconnected: boolean }> {
    const headers = await this.getHeaders();
    return firstValueFrom(
      this.http.delete<{ disconnected: boolean }>(
        this.getApiUrl("/api/v1/integrations/microsoft/disconnect"),
        { headers, responseType: "json" },
      ),
    );
  }

  async sendMicrosoftTestEmail(): Promise<SendTestMailResponse> {
    const headers = await this.getHeaders();
    return firstValueFrom(
      this.http.post<SendTestMailResponse>(
        this.getApiUrl("/api/v1/integrations/microsoft/test"),
        {},
        { headers, responseType: "json" },
      ),
    );
  }

  async connectMicrosoftWithPopup(): Promise<MicrosoftPopupMessage> {
    const headers = await this.getHeaders();
    const { authorizationUrl } = await firstValueFrom(
      this.http.post<MicrosoftConnectResponse>(
        this.getApiUrl("/api/v1/integrations/microsoft/connect"),
        { mode: "json" },
        { headers, responseType: "json" },
      ),
    );

    if (!authorizationUrl) {
      throw new Error("URL Microsoft OAuth manquante");
    }

    return this.openOAuthPopup<MicrosoftPopupMessage>({
      authorizationUrl,
      windowName: "microsoft-mail-oauth",
      source: "microsoft-mail-oauth",
      expectedOrigin: new URL(this.getApiUrl("/"), window.location.origin)
        .origin,
      blockedMessage: "La fenêtre de connexion Microsoft a été bloquée",
      expiredMessage: "La connexion Microsoft a expiré",
      closedMessage: "La fenêtre Microsoft a été fermée",
      failedMessage: "La connexion Microsoft a échoué",
    });
  }

  getConnectionStatus<TConnection extends { tokenExpiresAt: string | null }>(
    response: MailStatusResponse<TConnection> | undefined,
  ): MailConnectionStatus {
    if (!response?.connected || !response.connection) {
      return "disconnected";
    }

    const expiresAt = response.connection.tokenExpiresAt;

    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      return "disconnected";
    }

    return "connected";
  }
}

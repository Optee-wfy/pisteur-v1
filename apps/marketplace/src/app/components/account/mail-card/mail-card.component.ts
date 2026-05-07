import {
  ChangeDetectionStrategy,
  Component,
  inject,
  resource,
  signal,
} from "@angular/core";
import { DialogService } from "@optee/dialog";
import {
  IconGoogleLogoComponent,
  IconInfoComponent,
  IconMailComponent,
  IconMicrosoftLogoComponent,
} from "@optee/icons";
import type { MailProvider, PendingAction } from "@optee/models";
import { DividerHorizontalComponent } from "@optee/ui/components/atoms/divider/divider-horizontal/divider-horizontal.component";
import { ToastService } from "@optee/ui/services/toast.service";
import type {
  GoogleMailStatusResponse,
  MailConnectionStatus,
  MicrosoftMailStatusResponse,
} from "../../../services/mail-integration.service";
import { MailIntegrationService } from "../../../services/mail-integration.service";
import { MailConnectDialogComponent } from "./mail-connect.dialog";

@Component({
  selector: "mkp-mail-card",
  host: { class: "flex w-full" },
  template: `
    <section class="w-full rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
      <div class="flex flex-col gap-5">
        <div class="flex items-start gap-4">
          <div
            class="flex size-10 items-center justify-center rounded-2xl bg-purple-100"
          >
            <icon-mail class="size-4 text-purple-600" />
          </div>

          <div class="min-w-0">
            <h2 class="text-primary-900 text-base font-semibold md:text-[1.2rem]">
              Connexion boite mail
            </h2>
            <p class="text-granite-400 mt-1 text-sm">
              Connectez votre messagerie pour recevoir et envoyer des emails
            </p>
          </div>
        </div>

        <oui-divider-horizontal />

        <div class="mt-1 grid gap-4 lg:grid-cols-2">
          @for (provider of providers; track provider) {
            @let loading = isLoading(provider);
            @let status = connectionStatus(provider);
            @let pendingAction = currentPendingAction(provider);

            <article
              class="border-granite-200 flex min-h-40 flex-1 flex-col rounded-2xl border bg-white p-5"
            >
              <div class="flex h-full flex-col">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex min-w-0 gap-4">
                    <div
                      class="flex size-10 shrink-0 items-center justify-center rounded-lg"
                      [class]="iconWrapperClasses(provider)"
                    >
                      @if (provider === "google") {
                        <icon-google-logo
                          class="size-5"
                          [class]="iconClasses(provider)"
                        />
                      } @else {
                        <icon-microsoft-logo
                          class="size-5"
                          [class]="iconClasses(provider)"
                        />
                      }
                    </div>
                    <div class="min-w-0">
                      <h2 class="truncate text-lg font-semibold text-slate-950">
                        {{ title(provider) }}
                      </h2>
                      <span class="mt-1 block text-sm text-slate-500">
                        {{ subtitle(provider) }}
                      </span>
                    </div>
                  </div>
                  <span
                    class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                    [class]="statusClasses(status, loading)"
                  >
                    {{ statusLabel(status, loading) }}
                  </span>
                </div>
                <p class="mt-5 text-sm leading-6 text-slate-600">
                  {{ description(provider) }}
                </p>

                <div class="mt-5 pt-5">
                  <button
                    class="flex w-full items-center justify-center gap-4 rounded-xl px-6 py-3 text-base font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    (click)="handleProviderAction(provider)"
                    [class]="buttonClasses(provider, status)"
                    [disabled]="isDisabled(loading, pendingAction)"
                  >
                    <icon-mail class="size-4 text-current" />
                    <span>{{ actionLabel(provider, status, loading) }}</span>
                  </button>
                </div>
              </div>
            </article>
          }
        </div>

        <article
          class="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-6 py-5 text-blue-800"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-600"
            >
              <icon-info class="size-3.5 text-white" />
            </div>

            <div class="min-w-0">
              <h3 class="text-base font-semibold text-blue-900">
                Pourquoi connecter ma boite mail ?
              </h3>

              <ul class="mt-3 list-disc space-y-1.5 pl-5 text-sm text-blue-700">
                <li>
                  Envoyez des emails personnalisés directement depuis la
                  plateforme
                </li>
                <li>Recevez automatiquement vos listes de leads par email</li>
                <li>Synchronisez vos échanges avec vos prospects</li>
                <li>Gagnez du temps avec l'envoi en masse sécurisé</li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
  imports: [
    DividerHorizontalComponent,
    IconGoogleLogoComponent,
    IconInfoComponent,
    IconMailComponent,
    IconMicrosoftLogoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MailCardComponent {
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
  private readonly mailIntegrationService = inject(MailIntegrationService);

  protected readonly providers: MailProvider[] = ["google", "microsoft"];
  protected readonly pendingAction = signal<
    Record<MailProvider, PendingAction | null>
  >({
    google: null,
    microsoft: null,
  });

  protected readonly googleStatus = resource({
    loader: () => this.mailIntegrationService.getGoogleStatus(),
  });

  protected readonly microsoftStatus = resource({
    loader: () => this.mailIntegrationService.getMicrosoftStatus(),
  });

  protected title(provider: MailProvider): string {
    return provider === "google" ? "Gmail" : "Outlook";
  }

  protected subtitle(provider: MailProvider): string {
    return provider === "google" ? "Google Workspace" : "Microsoft 365";
  }

  protected description(provider: MailProvider): string {
    return provider === "google"
      ? "Connectez votre compte Gmail pour envoyer et recevoir des emails directement depuis Pisteur."
      : "Connectez votre compte Outlook pour envoyer et recevoir des emails directement depuis Pisteur.";
  }

  protected statusLabel(
    status: MailConnectionStatus,
    isLoading: boolean,
  ): string {
    if (isLoading) {
      return "Chargement";
    }

    return status === "connected" ? "Connecté" : "Non connecté";
  }

  protected statusClasses(
    status: MailConnectionStatus,
    isLoading: boolean,
  ): string {
    if (isLoading) {
      return "bg-slate-100 text-slate-500";
    }

    return status === "connected"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700";
  }

  protected iconWrapperClasses(provider: MailProvider): string {
    return provider === "google" ? "bg-red-50" : "bg-blue-50";
  }

  protected iconClasses(provider: MailProvider): string {
    return provider === "google" ? "text-red-500" : "text-blue-600";
  }

  protected actionLabel(
    provider: MailProvider,
    status: MailConnectionStatus,
    isLoading: boolean,
  ): string {
    if (isLoading) {
      return "Chargement...";
    }

    const providerLabel = this.title(provider);
    return status === "connected"
      ? `Déconnecter ${providerLabel}`
      : `Connecter ${providerLabel}`;
  }

  protected buttonClasses(
    provider: MailProvider,
    status: MailConnectionStatus,
  ): string {
    if (status === "connected") {
      return "bg-granite-900 hover:bg-black";
    }

    return provider === "google"
      ? "bg-[#ea0000] hover:bg-[#d00000]"
      : "bg-[#2563eb] hover:bg-[#1d4ed8]";
  }

  protected isDisabled(
    isLoading: boolean,
    pendingAction: PendingAction | null,
  ): boolean {
    return isLoading || pendingAction !== null;
  }

  protected isLoading(provider: MailProvider): boolean {
    return provider === "google"
      ? this.googleStatus.isLoading()
      : this.microsoftStatus.isLoading();
  }

  protected connectionStatus(provider: MailProvider): MailConnectionStatus {
    return this.getConnectionStatus(this.statusResponse(provider));
  }

  protected currentPendingAction(provider: MailProvider): PendingAction | null {
    return this.pendingAction()[provider];
  }

  protected async handleProviderAction(provider: MailProvider) {
    if (this.connectionStatus(provider) === "connected") {
      await this.disconnectProvider(provider);
      return;
    }

    const { res: confirmed } = await this.dialogService.open(
      MailConnectDialogComponent,
      {
        data: { provider },
      },
    );

    if (!confirmed) {
      return;
    }

    await this.connectProvider(provider);
  }

  private async connectProvider(provider: MailProvider) {
    await this.runProviderAction(provider, "connect", async () => {
      if (provider === "google") {
        await this.mailIntegrationService.connectGoogleWithPopup();
      } else {
        await this.mailIntegrationService.connectMicrosoftWithPopup();
      }
    });
  }

  private async disconnectProvider(provider: MailProvider) {
    await this.runProviderAction(provider, "disconnect", async () => {
      if (provider === "google") {
        await this.mailIntegrationService.disconnectGoogle();
      } else {
        await this.mailIntegrationService.disconnectMicrosoft();
      }
    });
  }

  private async runProviderAction(
    provider: MailProvider,
    action: Exclude<PendingAction, "sendTest">,
    execute: () => Promise<void>,
  ) {
    this.setPendingAction(provider, action);

    try {
      await execute();
      await this.reloadStatus(provider);

      this.toastService.open(
        "success",
        `${action === "connect" ? "Connexion" : "Déconnexion"} ${this.getProviderLabel(provider)}`,
        action === "connect"
          ? `La boîte ${this.getProviderLabel(provider)} a été connectée avec succès.`
          : `La boîte ${this.getProviderLabel(provider)} a été déconnectée.`,
      );
    } catch (error) {
      this.handleActionError(provider, action, error);
    } finally {
      this.setPendingAction(provider, null);
    }
  }

  private handleActionError(
    provider: MailProvider,
    action: Exclude<PendingAction, "sendTest">,
    error: unknown,
  ) {
    if (action === "disconnect") {
      this.toastService.openError(
        `Déconnexion ${this.getProviderLabel(provider)}`,
        error,
      );
      return;
    }

    const message =
      error instanceof Error ? error.message : "La connexion a échoué.";

    if (!message.toLowerCase().includes("fermée")) {
      this.toastService.open(
        "error",
        `Connexion ${this.getProviderLabel(provider)}`,
        message,
      );
    }
  }

  private async reloadStatus(provider: MailProvider) {
    if (provider === "google") {
      await this.googleStatus.reload();
      return;
    }

    await this.microsoftStatus.reload();
  }

  private setPendingAction(
    provider: MailProvider,
    action: PendingAction | null,
  ) {
    this.pendingAction.update((current) => ({
      ...current,
      [provider]: action,
    }));
  }

  private getProviderLabel(provider: MailProvider): string {
    return provider === "google" ? "Gmail" : "Microsoft";
  }

  private getConnectionStatus(
    response:
      | GoogleMailStatusResponse
      | MicrosoftMailStatusResponse
      | undefined,
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

  private statusResponse(
    provider: MailProvider,
  ): GoogleMailStatusResponse | MicrosoftMailStatusResponse | undefined {
    return provider === "google"
      ? this.googleStatusResponse()
      : this.microsoftStatusResponse();
  }

  private googleStatusResponse(): GoogleMailStatusResponse | undefined {
    try {
      return this.googleStatus.value();
    } catch (err) {
      console.error("googleStatusResponse error", err);
      return undefined;
    }
  }

  private microsoftStatusResponse(): MicrosoftMailStatusResponse | undefined {
    try {
      return this.microsoftStatus.value();
    } catch (err) {
      console.error("microsoftStatusResponse error", err);
      return undefined;
    }
  }
}

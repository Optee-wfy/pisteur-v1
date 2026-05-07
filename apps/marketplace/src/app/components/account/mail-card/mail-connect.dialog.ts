import { ChangeDetectionStrategy, Component, computed } from "@angular/core";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import { IconMailComponent } from "@optee/icons";
import type { MailProvider } from "@optee/models";

type MailConnectDialogData = {
  provider: MailProvider;
};

@Component({
  selector: "mkp-mail-connect-dialog",
  template: `
    <op-dialog-wrapper
      class="!w-[640px] !max-w-[calc(100vw-2rem)]"
      (crossClick)="dialogRef.close(false)"
    >
      <div class="flex items-start gap-5">
        <div
          class="flex size-14 items-center justify-center rounded-[24px]"
          [class]="iconBoxClasses()"
        >
          <icon-mail class="size-7" [class]="iconClasses()" />
        </div>

        <div class="flex flex-col gap-1">
          <h2 class="text-2xl font-semibold text-slate-950">
            Connexion {{ providerLabel() }}
          </h2>
          <p class="text-sm text-slate-500">{{ providerSubtitle() }}</p>
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-6">
        <p class="text-sm leading-snug text-slate-700">
          Pisteur aura accès aux fonctionnalités suivantes :
        </p>

        <ul class="flex flex-col gap-3">
          @for (feature of features(); track feature) {
            <li
              class="flex items-start gap-3 text-sm leading-snug text-slate-900"
            >
              <span class="font-semibold text-green-600">✓</span>
              <span>{{ feature }}</span>
            </li>
          }
        </ul>

        <div
          class="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-600"
        >
          Vos données sont sécurisées. Pisteur ne stocke jamais vos identifiants
          et utilise le protocole OAuth 2.0 pour une connexion sécurisée.
        </div>

        <button
          class="inline-flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold text-white transition"
          type="button"
          (click)="dialogRef.close(true)"
          [class]="actionButtonClasses()"
        >
          <icon-mail class="size-5" />
          Autoriser l'accès à {{ providerLabel() }}
        </button>
      </div>
    </op-dialog-wrapper>
  `,
  imports: [DialogWrapperComponent, IconMailComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MailConnectDialogComponent extends StronglyTypedDialog<
  MailConnectDialogData,
  boolean
> {
  protected readonly providerLabel = computed(() => {
    return this.data.provider === "google" ? "Gmail" : "Outlook";
  });

  protected readonly providerSubtitle = computed(() => {
    return this.data.provider === "google"
      ? "Google Workspace"
      : "Microsoft 365";
  });

  protected readonly features = computed(() => {
    const provider = this.providerLabel();

    return [
      `Envoi d'emails depuis votre compte ${provider}`,
      "Réception automatique des listes de leads",
      "Synchronisation des échanges avec vos prospects",
    ];
  });

  protected readonly iconBoxClasses = computed(() => {
    return this.data.provider === "google" ? "bg-red-50" : "bg-blue-50";
  });

  protected readonly iconClasses = computed(() => {
    return this.data.provider === "google" ? "text-red-500" : "text-blue-600";
  });

  protected readonly actionButtonClasses = computed(() => {
    return this.data.provider === "google"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-blue-600 hover:bg-blue-700";
  });
}

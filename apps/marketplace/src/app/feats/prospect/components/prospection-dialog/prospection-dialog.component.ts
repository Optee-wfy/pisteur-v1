import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { EMAIL_PROSPECTION_BASE_PROMPT } from "@optee/constants";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import {
  IconInfoComponent,
  IconMagicWandComponent,
  IconPaperPlaneComponent,
  IconSpinnerComponent,
} from "@optee/icons";
import type {
  ExternalContactUuid,
  LegalEntityUuid,
  LocationBdnbUuid,
} from "@optee/models";
import { Location } from "@optee/models";
import { ToastService } from "@optee/ui/services/toast.service";
import { Button } from "primeng/button";
import { Checkbox } from "primeng/checkbox";
import { FloatLabel } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { Select } from "primeng/select";
import { Tooltip } from "primeng/tooltip";
import trpcClient from "../../../../../trpc-client";
import { AuthService } from "../../../../services/auth.service";
import { ProService } from "../../../../services/pro.service";

@Component({
  selector: "mkp-prospection-dialog",
  template: `
    <op-dialog-wrapper
      class="!max-h-[unset] !w-[80vw] max-w-screen-xl !gap-4 !p-3"
      (crossClick)="dialogRef.close(null)"
    >
      <header class="flex flex-col items-start justify-center gap-2 px-6 py-2">
        <h1
          class="flex items-center justify-start gap-2 text-2xl font-semibold"
        >
          <icon-paper-plane class="text-primary-600 size-4" />
          <span>Prospection intelligente</span>
        </h1>
        <p class="max-w-prose text-sm text-gray-600">
          Nous récupérons l’ensemble des informations du bâtiment, de
          l’entreprise et du contact, pour générer un message de prospection
          intelligent en quelques secondes.
        </p>
      </header>

      <section class="flex h-[70dvh] w-full">
        <!-- Parameters -->
        <form class="flex w-60 flex-col items-start gap-4 px-6 py-2 md:w-80">
          <div class="flex max-h-full w-full flex-col gap-4 overflow-y-auto">
            <!-- Select location -->
            <div class="flex flex-col gap-1">
              <label class="text-granite-500 text-sm font-medium">
                Bâtiment à cibler
              </label>

              <p-select
                class="ng-dirty w-full"
                appendTo="body"
                emptyMessage="Aucun bâtiment disponible."
                placeholder="Choisissez un bâtiment"
                [class.ng-invalid]="
                  prospectionForm.controls.locationBdnbUuid.invalid &&
                  prospectionForm.controls.locationBdnbUuid.touched
                "
                [formControl]="prospectionForm.controls.locationBdnbUuid"
                [options]="locations.value() ?? []"
              />

              @if (locations.value()?.length === 0) {
                <div class="px-1 text-xs text-red-500">
                  Veuillez débloquer au moins un bâtiment depuis la fiche
                  entreprise du destinataire.
                </div>
              }
            </div>

            <!-- Select Operation -->
            <div class="flex flex-col gap-1">
              <label class="text-granite-500 text-sm font-medium">
                Opération à promouvoir
                <icon-info
                  class="ml-1 inline-block size-3"
                  pTooltip="Nous réutilisons ici les prestations renseignées dans votre modale de compte (onglet expertise)."
                  tooltipPosition="bottom"
                />
              </label>

              <p-select
                class="w-full"
                appendTo="body"
                emptyMessage="Aucune prestation disponible."
                placeholder="Choisissez un type d'opération"
                [formControl]="prospectionForm.controls.prestation"
                [options]="prestationsOptions()"
              />

              @if (prestationsOptions().length === 0) {
                <div class="px-1 text-xs text-orange-500">
                  Pensez à renseigner au moins une prestation depuis la modale
                  de compte (onglet expertise).
                </div>
              }
            </div>

            <!-- Select prospection Type -->
            <div class="flex flex-col gap-1">
              <label class="text-granite-500 text-sm font-medium">
                Contexte du message
              </label>

              <p-select
                class="w-full"
                appendTo="body"
                placeholder="Choisissez un contexte de message"
                [formControl]="prospectionForm.controls.prospectionType"
                [options]="prospectionTypes"
              />
            </div>

            <!-- Select prospection Goal -->
            <div class="flex flex-col gap-1">
              <label class="text-granite-500 text-sm font-medium">
                Intention du message
              </label>

              <p-select
                class="w-full"
                appendTo="body"
                placeholder="Choisissez une intention de message"
                [formControl]="prospectionForm.controls.prospectionGoal"
                [options]="prospectionGoals"
              />
            </div>

            <!-- Include calendar link -->

            <div class="flex flex-col gap-1">
              <label class="text-granite-500 text-sm font-medium">
                Inclure un lien vers mon calendrier
                <icon-info
                  class="ml-1 inline-block size-3"
                  pTooltip="Nous réutilisons ici le lien renseigné dans votre modale de compte (onglet entreprise)."
                  tooltipPosition="bottom"
                />
              </label>

              <div class="flex items-center gap-2">
                <p-checkbox
                  binary
                  [formControl]="prospectionForm.controls.showCalendarLink"
                />
                <label class="cursor-pointer text-sm">
                  {{
                    prospectionForm.controls.showCalendarLink.value
                      ? "Oui"
                      : "Non"
                  }}
                </label>
              </div>

              @if (!currentPro()?.calendarSite) {
                <div class="px-1 pt-1 text-xs text-orange-500">
                  Aucun lien de calendrier n'est renseigné dans votre profil.
                </div>
              }
            </div>

            <!-- Configure prompt -->
            @if (auth.isOpteeTester()) {
              <div class="flex w-full flex-col gap-2">
                <label class="text-granite-500 text-sm font-medium">
                  Prompt de génération (Admin Optee)
                </label>
                <textarea
                  class="scrollable-shadow-zone max-h-48 w-full flex-1 overflow-y-auto p-3"
                  fluid
                  pTextarea
                  rows="7"
                  [formControl]="prospectionForm.controls.prompt"
                ></textarea>
              </div>
            }
          </div>
          <p-button
            class="mt-auto w-full"
            fluid
            severity="primary"
            type="button"
            (click)="generateEmailContent()"
            [disabled]="prospectionForm.invalid || generationInProgress()"
            [loading]="generationInProgress()"
            [variant]="mailBody() ? 'outlined' : undefined"
          >
            <icon-magic-wand class="size-4" />
            {{ mailBody() ? "Régénérer" : "Générer" }}
          </p-button>
        </form>

        <!-- Preview -->
        <div
          class="border-granite-200 relative flex h-full flex-1 flex-col border-l px-6 py-2"
        >
          @if (!generationInProgress() && mailBody()) {
            <div class="flex h-full flex-col gap-4">
              <p
                class="text-granite-400 border-granite-200 w-full border-b pb-2"
              >
                À : {{ data.contact.email }}
              </p>
              <div
                class="border-granite-200 flex items-center gap-1 border-b pb-2"
              >
                <p-floatlabel class="w-full" variant="on">
                  <input
                    class="w-full"
                    id="emailSubjectInput"
                    autocomplete="off"
                    pInputText
                    [(ngModel)]="mailSubject"
                  />
                  <label for="emailSubjectInput">Objet</label>
                </p-floatlabel>
              </div>
              <div
                class="scrollable-shadow-zone flex h-full max-h-[65dvh] flex-col gap-1 overflow-y-auto p-3"
              >
                <textarea
                  class="h-full"
                  cols="30"
                  fluid
                  pTextarea
                  rows="5"
                  [(ngModel)]="mailBody"
                ></textarea>
              </div>

              <p-button
                class="ml-auto mt-auto"
                severity="success"
                type="submit"
                (click)="
                  newEmail({
                    subject: mailSubject(),
                    body: mailBody(),
                    to: data.contact.email,
                  });
                  dialogRef.close(null)
                "
                [disabled]="prospectionForm.invalid"
              >
                <icon-paper-plane class="size-4 text-white" />
                Ouvrir l’application Mail
              </p-button>
            </div>
          } @else {
            <div
              class="mx-auto my-auto flex flex-col items-center justify-center gap-2 md:pb-40"
            >
              <icon-paper-plane
                class="text-granite-300 bg-granite-100 mx-auto mb-6 mt-12 size-16 rounded-full p-4"
              />
              <p
                class="text-granite-500 flex max-w-md items-center gap-2 text-center"
              >
                @if (generationInProgress()) {
                  <icon-spinner class="inline-block size-4 animate-spin" />
                  Génération de l'email en cours...
                } @else {
                  Renseignez les paramètres dans le formulaire pour générer
                  l'email de prospection.
                }
              </p>
            </div>
          }
        </div>
      </section>
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    Select,
    ReactiveFormsModule,
    FormsModule,
    Button,
    IconPaperPlaneComponent,
    IconSpinnerComponent,
    IconMagicWandComponent,
    InputTextModule,
    IconInfoComponent,
    FloatLabel,
    Checkbox,
    Tooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProspectionDialogComponent extends StronglyTypedDialog<
  {
    legalEntityUuid: LegalEntityUuid;
    locationBdnbUuid?: LocationBdnbUuid | null;
    contact: {
      uuid: ExternalContactUuid;
      email: string;
    };
  },
  LocationBdnbUuid | null
> {
  protected readonly toastService = inject(ToastService);
  protected readonly auth = inject(AuthService);
  protected readonly proService = inject(ProService);

  protected readonly prospectionTypes = [
    "Premier contact",
    "Relance",
    "Opportunité identifiée ",
    "Relation client – Suivi",
    "Relation client – Relance suite à interaction",
    "Message libre",
  ];

  protected readonly prospectionGoals = [
    "Proposer une étude gratuite / pré-diagnostic",
    "Proposer un devis / estimation rapide",
    "Obtenir un rendez-vous découverte",
  ];

  protected readonly prestationsOptions = computed(() => {
    const prestations = this.currentPro()?.prestations?.split(";") ?? [];
    return prestations.map((prestation) => ({
      label: prestation
        .split(" ")
        .map((word) => {
          const lower = word.toLowerCase();
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join(" "),
      value: prestation,
    }));
  });

  protected readonly prospectionForm = new FormGroup({
    locationBdnbUuid: new FormControl<LocationBdnbUuid | null>(null, {
      validators: [Validators.required],
    }),
    prestation: new FormControl<string | null>(null),
    prospectionType: new FormControl<string | null>(
      this.prospectionTypes[0] ?? null,
    ),
    prospectionGoal: new FormControl<string | null>(
      this.prospectionGoals[0] ?? null,
    ),
    showCalendarLink: new FormControl<boolean>(true),
    prompt: new FormControl<string>(EMAIL_PROSPECTION_BASE_PROMPT, {
      validators: [Validators.required],
    }),
  });

  protected readonly currentPro = toSignal(this.proService.pro$, {
    initialValue: null,
  });

  protected readonly locations = resource({
    loader: async () => {
      const res = await trpcClient.locationsBdnb.getAllPaginatedForPro.mutate({
        legalEntityUuid: this.data.legalEntityUuid,
        pageSize: 100,
        show: "unlocked",
      });

      const locations = res.items.map((item) => ({
        label: item.location.name ?? Location.makeAddress(item.location),
        value: item.location.uuid,
      }));

      if (locations.length > 0) {
        const preferredLocation =
          locations.find(
            (location) => location.value === this.data.locationBdnbUuid,
          )?.value ?? null;

        this.prospectionForm.controls.locationBdnbUuid.setValue(
          preferredLocation ?? locations[0]?.value ?? null,
        );
      } else {
        this.prospectionForm.controls.locationBdnbUuid.markAsTouched();
      }

      return locations;
    },
  });

  protected readonly generationInProgress = signal(false);

  protected readonly mailSubject = signal<string>("");
  protected readonly mailBody = signal<string>("");

  async generateEmailContent() {
    this.generationInProgress.set(true);
    const contactUuid = this.data.contact.uuid;
    const {
      locationBdnbUuid,
      prompt: promptInput,
      showCalendarLink,
      prospectionGoal,
      prospectionType,
      prestation,
    } = this.prospectionForm.getRawValue();

    const promptSections = [
      promptInput,
      `- **Contexte d'envoi :**`,
      `  Type de contact : ${prospectionType}`,
      `  Objectif : ${prospectionGoal}`,
      prestation
        ? `  Opération mise en avant : "${prestation}"`
        : "  Opération mise en avant : N/A",
      `  Inclure un lien vers mon calendrier : "${showCalendarLink ? "Oui" : "Non"}"`,
    ].filter(Boolean);

    const prompt = promptSections.join("\n");

    const ctxMessage = "Génération d'un email de prospection";

    try {
      if (!locationBdnbUuid) {
        throw new Error("Veuillez sélectionner un bâtiment.");
      }

      const mailContent = await trpcClient.prospect.prospectContact.query({
        contactUuid,
        locationBdnbUuid,
        prompt,
      });

      if (!mailContent.body || !mailContent.subject) {
        this.toastService.open(
          "error",
          ctxMessage,
          "Le service de génération n'a pas retourné de contenu valide. Merci de réessayer.",
        );
        return;
      }

      this.mailBody.set(mailContent.body);
      this.mailSubject.set(mailContent.subject);
    } catch (error) {
      this.toastService.open(
        "error",
        ctxMessage,
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      this.generationInProgress.set(false);
    }
  }

  protected newEmail({
    subject,
    body,
    to,
  }: {
    subject: string;
    body: string;
    to: string;
  }) {
    const mailtoLink = `mailto:${encodeURIComponent(
      to,
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const anchor = document.createElement("a");
    anchor.href = mailtoLink;
    anchor.target = "_blank";
    anchor.click();
  }
}

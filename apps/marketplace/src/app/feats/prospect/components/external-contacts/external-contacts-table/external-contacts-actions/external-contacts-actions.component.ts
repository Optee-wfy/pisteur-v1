import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";

import {
  AssociationProExternalContactType,
  fullEnrichFeatureEnabled,
  MAIL_CONTACT_ENRICHMENT_COST,
  PHONE_CONTACT_ENRICHMENT_COST,
} from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconInfoComponent,
  IconMailComponent,
  IconPhoneComponent,
  IconRocketComponent,
  IconUploadFileComponent,
} from "@optee/icons";
import type { ExternalContact } from "@optee/models";
import { Tooltip } from "primeng/tooltip";
import { FullEnrichService } from "../../../../../../services/fullenrich.service";
import { EnrichmentExplanationDialogComponent } from "../../../enrichment/enrichment-explanation/enrichment-explanation-dialog.component";
import { PillCreditsComponent } from "../../../pill-credits/pill-credits.component";

type EnrichmentUnlockedKey = "emailUnlocked" | "phoneUnlocked";

type EnrichmentOption = {
  type: AssociationProExternalContactType;
  label: string;
  icon: "mail" | "phone";
  cost: number;
  unlockedKey: EnrichmentUnlockedKey;
  disabledMessage: string;
};

type ExternalContactEnriched = ExternalContact & {
  emailUnlocked?: boolean;
  phoneUnlocked?: boolean;
};

@Component({
  selector: "mkp-external-contacts-actions",
  template: `
    <section
      class="border-granite-100 flex min-h-10 w-full items-center justify-between gap-2 rounded-[16px] border bg-white px-4 py-2 shadow-sm"
    >
      <div class="flex items-center gap-2">
        <span class="text-granite-500 text-xs font-medium">Mode</span>
        <div class="bg-granite-100 inline-flex rounded-lg p-0.5">
          <button
            class="rounded-md px-2.5 py-1 text-xs font-medium transition-all"
            type="button"
            (click)="setSelectionMode('enrich')"
            [class.bg-white]="isEnrichmentMode()"
            [class.shadow-sm]="isEnrichmentMode()"
            [class.text-granite-500]="!isEnrichmentMode()"
            [class.text-granite-900]="isEnrichmentMode()"
          >
            Enrichissement
          </button>
          <button
            class="rounded-md px-2.5 py-1 text-xs font-medium transition-all"
            type="button"
            (click)="setSelectionMode('export')"
            [class.bg-white]="!isEnrichmentMode()"
            [class.shadow-sm]="!isEnrichmentMode()"
            [class.text-granite-500]="isEnrichmentMode()"
            [class.text-granite-900]="!isEnrichmentMode()"
          >
            Export
          </button>
        </div>
      </div>
      @if (isEnrichmentMode()) {
        <div class="flex items-center gap-2">
          @let contacts = selectedContactsForEnrichmentContacts();
          @if (!isFullEnrichFeatureEnabled) {
            <span class="text-granite-700 text-xs italic">
              La fonctionnalité d'enrichissement de contacts est désactivée pour
              cet environnement.
            </span>
          } @else {
            <button
              class="text-granite-400 hover:bg-granite-100 hover:text-granite-700 flex cursor-pointer items-center justify-start gap-2 rounded-lg bg-white px-2 py-1 text-sm"
              (click)="openExplanationDialog()"
            >
              <icon-info class="size-3" />
              Comment fonctionne l'enrichissement ?
            </button>
            @if (canEnrichSelectedContacts()) {
              @if (!hasSelectedEnrichmentContacts()) {
                <button
                  class="prospect-button"
                  pTooltip="Sélectionnez au moins un contact."
                  type="button"
                  [disabled]="true"
                >
                  <icon-rocket class="size-4" />
                  Enrichir...
                </button>
              } @else if (contacts.length > 1) {
                <button
                  class="prospect-button"
                  type="button"
                  (click)="
                    fullEnrichService.enrichSelectedContacts(
                      associationType.BOTH
                    )
                  "
                  [disabled]="isEnrichAllDisabled()"
                  [pTooltip]="enrichAllDisabledTooltip()"
                >
                  <icon-rocket class="size-4" />
                  Enrichir {{ contacts.length }} personnes
                  <mkp-pill-credits
                    colorVariant="granite"
                    label="Coût de la connexion"
                    [credits]="enrichAllCredits()"
                  />
                </button>
              } @else {
                @for (option of enrichmentOptions; track option.type) {
                  @if (!isEnrichmentHidden(option)) {
                    <button
                      class="prospect-button"
                      type="button"
                      (click)="
                        fullEnrichService.enrichSelectedContacts(option.type)
                      "
                      [disabled]="isEnrichmentDisabled(option)"
                      [pTooltip]="enrichmentDisabledTooltip(option)"
                    >
                      @switch (option.icon) {
                        @case ("mail") {
                          <icon-mail class="size-4" />
                        }
                        @case ("phone") {
                          <icon-phone class="size-4" />
                        }
                      }
                      {{ option.label }}
                      <mkp-pill-credits
                        colorVariant="granite"
                        label="Coût de la connexion"
                        [credits]="enrichmentOptionCredits(option)"
                      />
                    </button>
                  }
                }
              }
            }
          }
        </div>
      } @else {
        <!-- Export button to CSV -->
        <button
          class="prospect-button ml-auto"
          (click)="exportContacts.emit()"
          [disabled]="disableExport()"
          [pTooltip]="disabledExportButtonTooltip()"
        >
          <icon-upload-file class="size-4 text-white" />
          Exporter
        </button>
      }
    </section>
  `,
  imports: [
    IconInfoComponent,
    IconMailComponent,
    IconPhoneComponent,
    IconRocketComponent,
    PillCreditsComponent,
    IconUploadFileComponent,
    Tooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalContactsActionsComponent {
  readonly selectionMode = input<"enrich" | "export">("enrich");
  readonly selectionModeChange = output<"enrich" | "export">();
  readonly exportContacts = output<void>();
  readonly disableExport = input<boolean>(true);

  protected readonly fullEnrichService = inject(FullEnrichService);
  private readonly dialogService = inject(DialogService);

  protected readonly associationType = AssociationProExternalContactType;
  protected readonly isFullEnrichFeatureEnabled =
    fullEnrichFeatureEnabled.isEnabled;

  protected readonly isEnrichmentMode = computed(
    () => this.selectionMode() === "enrich",
  );

  protected readonly selectedContactsForEnrichmentContacts = computed(() =>
    this.fullEnrichService
      .selectedContactsForEnrichment()
      .map((item) => item.contact),
  );

  protected readonly disabledExportButtonTooltip = computed(() => {
    if (!this.disableExport()) {
      return undefined;
    }
    return "Merci de sélectionner au moins un contact pour pouvoir exporter.";
  });

  protected readonly hasSelectedEnrichmentContacts = computed(
    () => this.selectedContactsForEnrichmentContacts().length > 0,
  );

  protected readonly enrichmentOptions: EnrichmentOption[] = [
    {
      type: AssociationProExternalContactType.MAIL,
      label: "Enrichir",
      icon: "mail",
      cost: MAIL_CONTACT_ENRICHMENT_COST,
      unlockedKey: "emailUnlocked",
      disabledMessage:
        "L'email a déjà été enrichi pour au moins un contact sélectionné. Merci de désélectionner ce contact pour continuer.",
    },
    {
      type: AssociationProExternalContactType.PHONE,
      label: "Enrichir",
      icon: "phone",
      cost: PHONE_CONTACT_ENRICHMENT_COST,
      unlockedKey: "phoneUnlocked",
      disabledMessage:
        "Le numéro de téléphone a déjà été enrichi pour au moins un contact sélectionné. Merci de désélectionner ce contact pour continuer.",
    },
  ];

  protected readonly canEnrichSelectedContacts = computed(() => {
    if (!this.isFullEnrichFeatureEnabled) {
      return false;
    }
    return this.enrichmentOptions.some(
      (option) =>
        !this.isEnrichmentHidden(option) || !this.isEnrichmentDisabled(option),
    );
  });

  protected setSelectionMode(mode: "enrich" | "export") {
    if (this.selectionMode() === mode) {
      return;
    }
    this.selectionModeChange.emit(mode);
  }

  protected openExplanationDialog() {
    this.dialogService.open(EnrichmentExplanationDialogComponent);
  }

  protected isEnrichmentDisabled(option: EnrichmentOption) {
    const selectedContacts = this.selectedContactsForEnrichmentContacts();
    return selectedContacts.some((contact) =>
      this.contactHasUnlocked(contact, option.unlockedKey),
    );
  }

  protected isEnrichmentHidden(option: EnrichmentOption) {
    const selectedContacts = this.selectedContactsForEnrichmentContacts();
    return selectedContacts.every((contact) =>
      this.contactHasUnlocked(contact, option.unlockedKey),
    );
  }

  protected enrichmentDisabledTooltip(option: EnrichmentOption) {
    return this.isEnrichmentDisabled(option)
      ? option.disabledMessage
      : undefined;
  }

  protected isEnrichAllDisabled() {
    const selectedContacts = this.selectedContactsForEnrichmentContacts();
    return selectedContacts.every(
      (contact) => contact.emailUnlocked && contact.phoneUnlocked,
    );
  }

  protected enrichAllDisabledTooltip() {
    return this.isEnrichAllDisabled()
      ? "L'email et le téléphone ont déjà été enrichis pour tous les contacts sélectionnés."
      : undefined;
  }

  protected enrichmentOptionCredits(option: EnrichmentOption) {
    const selectedContacts = this.selectedContactsForEnrichmentContacts();
    const contactsToEnrich = selectedContacts.filter(
      (contact) => !this.contactHasUnlocked(contact, option.unlockedKey),
    );
    return contactsToEnrich.length * option.cost;
  }

  protected enrichAllCredits() {
    const selectedContacts = this.selectedContactsForEnrichmentContacts();
    const mailCost =
      selectedContacts.filter((contact) => !contact.emailUnlocked).length *
      MAIL_CONTACT_ENRICHMENT_COST;
    const phoneCost =
      selectedContacts.filter((contact) => !contact.phoneUnlocked).length *
      PHONE_CONTACT_ENRICHMENT_COST;
    return mailCost + phoneCost;
  }

  private contactHasUnlocked(
    contact: ExternalContactEnriched,
    key: EnrichmentUnlockedKey,
  ) {
    return contact[key] === true;
  }
}

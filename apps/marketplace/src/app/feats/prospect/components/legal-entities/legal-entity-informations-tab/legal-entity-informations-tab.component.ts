import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import type { LegalFormToExcludeFromGoogleAndHunterSearch } from "@optee/constants";
import {
  buildAssetUrl,
  isGroupEntity as isGroupEntityWebsite,
  LEGAL_FORM_TO_EXCLUDE_FROM_GOOGLE_AND_HUNTER_SEARCH,
  nafToCategoryLabel,
  nafToInfo,
} from "@optee/constants";
import {
  IconBuildingComponent,
  IconChevronRightComponent,
  IconDevisComponent,
  IconPappersLogoComponent,
  IconUserComponent,
} from "@optee/icons";
import type { LegalEntityUuid } from "@optee/models";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import type trpcClient from "../../../../../../trpc-client";
import { BlockedLegalEntityCardComponent } from "../../blocked-legal-entity-card/blocked-legal-entity-card.component";

import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { LegalEntityContactCardComponent } from "../../legal-entity-contact-card/legal-entity-contact-card.component";

type LegalEntityWithAddress =
  | Awaited<ReturnType<typeof trpcClient.legalEntities.get.query>>
  | Awaited<ReturnType<typeof trpcClient.legalEntities.getBasicData.query>>;

const FALLBACK_PREVIEW_SRC = buildAssetUrl("batiment.png");

@Component({
  selector: "mkp-legal-entity-informations-tab",
  host: {
    class:
      "flex max-w-screen-xl flex-wrap-reverse items-center justify-around gap-6 p-4 lg:items-end",
  },
  template: `
    @let legalEntityData = legalEntity();

    <!-- General Information -->
    <div class="flex min-w-80 flex-col gap-4 lg:mr-auto lg:flex-1">
      <div class="flex flex-col gap-4">
        <div class="flex max-w-xl items-center justify-between">
          <h2
            class="text-granite-900 flex items-center gap-2 text-sm font-medium"
          >
            <div
              class="bg-granite-100 flex size-7 items-center justify-center rounded-lg"
            >
              <icon-devis class="text-granite-700 size-4" />
            </div>
            Informations générales
          </h2>

          @if (legalEntityData?.siren && hasAccessToGlobalData()) {
            <a
              class="hover:bg-granite-100 text-granite-600 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium"
              rel="noopener noreferrer"
              target="_blank"
              [href]="
                'https://www.pappers.fr/entreprise/' + legalEntityData?.siren
              "
            >
              Voir plus
              <icon-pappers-logo class="h-5 w-5" />
            </a>
          }
        </div>

        @if (legalEntityData?.purpose; as description) {
          <oui-message class="max-w-xl" severity="info" [showIcon]="false">
            {{ description }}
          </oui-message>
        }

        <section
          class="border-granite-100 max-w-xl rounded-lg border bg-white p-4"
        >
          <div class="grid grid-cols-2 gap-3">
            @for (data of generalInfoData(); track data.key) {
              <p class="text-granite-400 text-sm font-medium">
                {{ data.label }}
              </p>
              @if (data.key === "address") {
                @if (hasAccessToGlobalData()) {
                  @let address = fullAddress();
                  @if (address) {
                    <span class="flex items-center gap-2 text-xs">
                      <icon-building class="size-4" slot="icon" />
                      {{ address }}
                    </span>
                  } @else {
                    <span class="text-granite-300 text-sm italic">
                      Non connu
                    </span>
                  }
                } @else {
                  <span class="text-granite-400 text-xs italic">
                    Débloquez la fiche entreprise pour voir l'adresse
                  </span>
                }
              } @else if (data.key === "businessStatus") {
                <div class="flex items-center gap-2">
                  <div
                    class="bg-granite-300 size-2 rounded-full"
                    [class.bg-green-600]="data.value === 'En activité'"
                    [class.bg-red-600]="data.value === 'Fermé définitivement'"
                    [class.bg-yellow-600]="
                      data.value === 'Fermé temporairement'
                    "
                  ></div>

                  @if (data.value) {
                    <span class="whitespace-pre-line">
                      {{ data.value }}
                    </span>
                  } @else {
                    <span class="text-granite-300 text-sm italic">
                      Non connu
                    </span>
                  }
                </div>
              } @else if (data.key === "siret" || data.key === "siren") {
                @if (hasAccessToGlobalData()) {
                  @if (data.value) {
                    <p>{{ data.value }}</p>
                  } @else {
                    <span class="text-granite-300 text-sm italic">
                      Non connu
                    </span>
                  }
                } @else {
                  <span class="text-granite-400 text-xs italic">
                    Débloquez la fiche entreprise pour voir le
                    {{ data.label.toUpperCase() }}
                  </span>
                }
              } @else {
                @if (data.value) {
                  <p>{{ data.value }}</p>
                } @else {
                  <span class="text-granite-300 text-sm italic">Non connu</span>
                }
              }
            }
          </div>
        </section>
      </div>
    </div>

    <!-- Contact Information -->
    <div class="flex max-w-xl flex-1 flex-col gap-4">
      @let data = legalEntity();
      @if (isLoading()) {
        <oui-loader label="Chargement des données..." />
      } @else if (data && data.noContactCanBeFound) {
        <span class="italic text-gray-600">
          Désolé, aucune information de contact n’a été trouvée.
        </span>
      } @else if (data && data.type) {
        <mkp-legal-entity-contact-card
          [contactInformation]="data"
          [nbRelatedPros]="nbRelatedPros()"
        />
      } @else {
        <mkp-blocked-legal-entity-card
          (refetchData)="refetchData.emit()"
          [isGroupEntity]="isGroupEntity()"
          [isLegalEntityExcluded]="isLegalEntityExcluded()"
          [legalEntityName]="legalEntityData?.name"
          [legalEntityUuid]="legalEntityUuid()"
          [nbRelatedPros]="nbRelatedPros()"
        />
      }

      @if (hasAccessToGlobalData()) {
        <div
          class="pister-link flex !justify-between"
          (click)="goToContacts.emit()"
        >
          <div class="flex items-center gap-1">
            <icon-user
              class="size-4 rounded-[4px] bg-yellow-200 p-[3px] text-yellow-600"
            />
            <span class="text-granite-900 text-sm font-medium">Personnes</span>
          </div>
          <span
            class="text-granite-900 flex items-center gap-2 text-sm font-medium"
          >
            {{ externalContactsCount() }}
            <icon-chevron-right class="size-3" />
          </span>
        </div>

        @if (fullAddress()) {
          <div class="relative max-w-xl">
            <span
              class="absolute left-2 top-2 rounded-lg bg-white/50 p-2 backdrop-blur-sm"
            >
              Siège social
            </span>
            <img
              class="w-full rounded-lg object-cover"
              alt="Vue du siège social"
              [src]="streetView()"
              [style.height.px]="streetViewHeight"
              [style.width.px]="streetViewWidth"
            />
          </div>
        }
      }
    </div>
  `,
  imports: [
    BlockedLegalEntityCardComponent,
    IconBuildingComponent,
    IconChevronRightComponent,
    IconDevisComponent,
    IconPappersLogoComponent,
    IconUserComponent,
    LegalEntityContactCardComponent,
    MessageComponent,
    LoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntityInformationsTabComponent {
  readonly legalEntity = input.required<LegalEntityWithAddress | null>();
  readonly isLoading = input.required<boolean>();
  readonly hasAccessToGlobalData = input.required<boolean>();
  readonly externalContactsCount = input.required<number>();
  readonly nbRelatedPros = input.required<number>();
  readonly legalEntityUuid = input.required<LegalEntityUuid>();

  readonly refetchData = output<void>();
  readonly goToContacts = output<void>();

  protected readonly streetViewHeight = 342;
  protected readonly streetViewWidth = 608;

  protected readonly streetView = computed(() => {
    const entity = this.legalEntity();
    if (!entity) {
      return FALLBACK_PREVIEW_SRC;
    }
    if ("streetViewUrl" in entity && entity.streetViewUrl) {
      return entity.streetViewUrl;
    }

    return FALLBACK_PREVIEW_SRC;
  });

  protected readonly generalInfoData = computed(() => {
    const entity = this.legalEntity();
    if (!entity) {
      return [];
    }
    const nafInfo = entity.mainBusinessActivity
      ? nafToInfo(entity.mainBusinessActivity)
      : null;
    const nafCategoryLabel = entity.mainBusinessActivity
      ? nafToCategoryLabel(entity.mainBusinessActivity)
      : null;
    return [
      {
        key: "name",
        label: "Raison sociale",
        value: entity.name,
      },
      {
        key: "address",
        label: "Siège social",
        value: "address" in entity && entity.address ? entity.address : null,
      },
      {
        key: "nafCode",
        label: "Code NAF",
        value: entity.mainBusinessActivity,
      },
      {
        key: "fieldOfActivity",
        label: "Domaine d'activité",
        value: nafCategoryLabel,
      },
      {
        key: "mainBusinessActivity",
        label: "Activité principale",
        value: nafInfo?.field,
      },
      {
        key: "siren",
        label: "SIREN",
        value: entity.siren,
      },
      {
        key: "siret",
        label: "SIRET",
        value: entity.siret,
      },
      {
        key: "legalForm",
        label: "Forme juridique",
        value: entity.legalForm,
      },
      {
        key: "employeesCount",
        label: "Taille",
        value: entity.nbEmployeesRange,
      },
      {
        key: "businessStatus",
        label: "Etat administratif",
        value: this.businessStatusFormatted(),
      },
    ];
  });

  protected readonly businessStatusFormatted = computed(() => {
    const entity = this.legalEntity();
    if (!entity || !entity.businessStatus) {
      return null;
    }
    switch (entity.businessStatus) {
      case "OPERATIONAL":
        return "En activité";
      case "CLOSED_TEMPORARILY":
        return "Fermé temporairement";
      case "CLOSED_PERMANENTLY":
        return "Fermé définitivement";
      case "BUSINESS_STATUS_UNSPECIFIED":
        return "Non spécifié";
      default:
        return null;
    }
  });

  protected readonly isLegalEntityExcluded = computed(() => {
    const entity = this.legalEntity();
    if (!entity) {
      return false;
    }
    if (!entity.legalForm) {
      return false;
    }
    return LEGAL_FORM_TO_EXCLUDE_FROM_GOOGLE_AND_HUNTER_SEARCH.includes(
      entity.legalForm as LegalFormToExcludeFromGoogleAndHunterSearch,
    );
  });

  protected readonly fullAddress = computed(() => {
    const entity = this.legalEntity();
    if (!entity) {
      return null;
    }
    const parts = [entity.streetNumber, entity.streetType, entity.streetName]
      .filter(Boolean)
      .join(" ");
    const cityParts = [entity.zipCode, entity.city].filter(Boolean).join(" ");
    const composed = [parts, cityParts].filter(Boolean).join(", ");
    if (composed) {
      return composed;
    }
    if ("address" in entity && entity.address) {
      return entity.address;
    }
    return null;
  });

  protected readonly isGroupEntity = computed(() => {
    const entity = this.legalEntity();
    if (!entity || !entity.website) {
      return false;
    }
    return isGroupEntityWebsite(entity.website);
  });
}

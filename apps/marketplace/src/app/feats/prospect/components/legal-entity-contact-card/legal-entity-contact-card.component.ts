import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  CONFIDENCE_SCORE_GROUP_ENTITY,
  CONFIDENCE_SCORE_PAPPERS,
  isGroupEntity,
  LEGAL_FORM_TO_EXCLUDE_FROM_GOOGLE_AND_HUNTER_SEARCH,
} from "@optee/constants";
import { IconDevisComponent } from "@optee/icons";
import type { LegalEntity } from "@optee/models";
import { CirclePercentComponent } from "@optee/ui/components/atoms/circle-percent/circle-percent/circle-percent.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { RatingScoreComponent } from "@optee/ui/components/molecules/rating-score/rating-score.component";
import {
  currentStatus,
  formatOpeningHours,
  type OpeningHours,
} from "@optee/utils";
import { Tooltip } from "primeng/tooltip";
import { SolicitationIndicatorComponent } from "../solicitation-indicator/solicitation-indicator.component";

@Component({
  selector: "mkp-legal-entity-contact-card",
  host: {
    class:
      "flex-2 flex flex-col flex-wrap items-start gap-4 rounded-lg md:flex-row min-w-80",
    "[class.justify-between]": "!noInfosFound()",
  },
  template: `
    @let contact = contactInformation();

    @if (!noInfosFound() && contact.lastFetchedAtForGoogle) {
      <div class="flex flex-1 flex-col gap-4">
        <mkp-solicitation-indicator
          displayMode="message"
          entityType="company"
          [count]="nbRelatedPros()"
        />
        <h2
          class="text-granite-900 flex items-center gap-2 text-sm font-medium"
        >
          <div
            class="bg-granite-100 flex size-7 items-center justify-center rounded-lg"
          >
            <icon-devis class="text-granite-700 size-4" />
          </div>
          Fiche Entreprise
          <oui-circle-percent
            class="size-10"
            pTooltip="Score de confiance"
            [value]="
              isGroupEntity()
                ? CONFIDENCE_SCORE_GROUP_ENTITY
                : CONFIDENCE_SCORE_PAPPERS
            "
          />
          @if (isGroupEntity()) {
            <span
              pTooltip="⚠️ Il s’agit d’une entreprise intégrée à un groupe. Les contacts proposés peuvent ne pas remonter vers une personne identifiable."
            >
              ⚠️
            </span>
          }
        </h2>
        <section class="border-granite-100 rounded-lg border bg-white p-4">
          <div class="grid grid-cols-[200px_1fr] gap-2">
            @for (data of googleData(); track data.key) {
              @if (data.value !== null && data.value !== undefined) {
                <p class="text-granite-400 text-sm font-medium">
                  {{ data.label }}
                </p>

                @switch (data.key) {
                  @case ("email") {
                    @if (contact.email) {
                      <a
                        class="text-primary-700 hover:underline"
                        href="mailto:{{ data.value }}"
                      >
                        {{ data.value }}
                      </a>
                    }
                  }
                  @case ("rating") {
                    @if (contact.rating && contact.userRatingCount) {
                      <oui-rating-score
                        [rating]="contact.rating"
                        [userRatingCount]="contact.userRatingCount"
                      />
                    }
                  }
                  @case ("mapsItineraryUrl") {
                    @if (data.value) {
                      <a
                        class="text-primary-700 hover:underline"
                        rel="noopener noreferrer"
                        target="_blank"
                        [href]="data.value"
                      >
                        Lien vers l'itinéraire
                      </a>
                    }
                  }
                  @case ("website") {
                    @if (data.value) {
                      <a
                        class="text-primary-700 hover:underline"
                        rel="noopener noreferrer"
                        target="_blank"
                        [href]="data.value"
                      >
                        Lien vers le site web
                      </a>
                    }
                  }
                  @case ("currentStatus") {
                    <div class="flex items-center gap-2">
                      @if (data.value === "Ouvert") {
                        <div class="size-2 rounded-full bg-green-600"></div>
                      } @else {
                        <div class="size-2 rounded-full bg-red-600"></div>
                      }
                      <span class="whitespace-pre-line">
                        {{ data.value || "Non connu" }}
                      </span>
                    </div>
                  }
                  @default {
                    <span class="whitespace-pre-line">
                      {{ data.value || "Non connu" }}
                    </span>
                  }
                }
              }
            }
          </div>
        </section>
        @if (contact.noContactCanBeFound) {
          <oui-message class="max-w-xl" severity="warn">
            Aucune personne physique n’a été trouvée pour cette entité
            juridique.
          </oui-message>
        }
      </div>
    } @else if (isLegalEntityExcluded()) {
      <oui-message class="max-w-xl" severity="info">
        Les informations de contact ne sont pas disponibles pour ce type
        d'entité juridique.
      </oui-message>
    } @else if (contact.lastFetchedAtForGoogle) {
      <oui-message
        class="max-w-xl"
        severity="warn"
        summary="Fiche entreprise incomplète"
      >
        Cette fiche entreprise est incomplète, les informations de contact
        générique (horaire d'ouverture, site internet) n'ont pas pu être
        récupérées.
      </oui-message>
    } @else {
      <oui-message
        class="max-w-xl"
        severity="error"
        summary="Fiche entreprise indisponible"
      >
        Cette fiche entreprise est corrompue ou indisponible. Merci de contacter
        le support.
      </oui-message>
    }
  `,
  imports: [
    RatingScoreComponent,
    IconDevisComponent,
    SolicitationIndicatorComponent,
    MessageComponent,
    CirclePercentComponent,
    Tooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntityContactCardComponent {
  readonly contactInformation = input.required<Partial<LegalEntity>>();
  readonly nbRelatedPros = input.required<number>();

  protected readonly CONFIDENCE_SCORE_PAPPERS = CONFIDENCE_SCORE_PAPPERS;
  protected readonly CONFIDENCE_SCORE_GROUP_ENTITY =
    CONFIDENCE_SCORE_GROUP_ENTITY;

  protected readonly noInfosFound = computed(() => {
    const contact = this.contactInformation();
    return (
      contact.openingHours == null &&
      contact.website == null &&
      contact.userRatingCount == null &&
      contact.rating == null &&
      contact.mapsItineraryUrl == null &&
      contact.phone == null &&
      contact.email == null
    );
  });

  protected readonly currentOpeningHours = computed(() => {
    const openingHours = this.contactInformation().openingHours as OpeningHours;
    return formatOpeningHours(openingHours);
  });

  protected readonly currentStatus = computed(() => {
    const openingHours = this.contactInformation().openingHours as OpeningHours;
    return currentStatus(openingHours);
  });

  protected readonly googleData = computed(() => {
    const contact = this.contactInformation();
    return [
      {
        key: "phone",
        label: "Téléphone",
        value: contact.phone,
      },
      {
        key: "email",
        label: "e-mail",
        value: contact.email,
      },
      {
        key: "openingHours",
        label: "Horaires d'ouverture",
        value: this.currentOpeningHours(),
      },
      {
        key: "website",
        label: "Site web",
        value: contact.website,
      },
      {
        key: "rating",
        label: "Avis",
        value:
          contact.rating !== null && contact.userRatingCount !== null
            ? `${contact.rating} (${contact.userRatingCount} avis)`
            : null,
      },
      {
        key: "mapsItineraryUrl",
        label: "Itinéraire",
        value: contact.mapsItineraryUrl,
      },
      {
        key: "currentStatus",
        label: "Statut",
        value: this.currentStatus(),
      },
    ];
  });

  protected readonly isLegalEntityExcluded = computed(() => {
    const entity = this.contactInformation();
    if (!entity.legalForm) {
      return false;
    }
    return LEGAL_FORM_TO_EXCLUDE_FROM_GOOGLE_AND_HUNTER_SEARCH.find(
      (form) => form === entity.legalForm,
    )
      ? true
      : false;
  });

  protected readonly isGroupEntity = computed(() => {
    const entity = this.contactInformation();
    return isGroupEntity(entity.website);
  });
}

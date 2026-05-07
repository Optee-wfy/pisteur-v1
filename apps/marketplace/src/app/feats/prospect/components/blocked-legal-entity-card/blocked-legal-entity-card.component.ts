import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import {
  CONFIDENCE_SCORE_GROUP_ENTITY,
  CONFIDENCE_SCORE_PAPPERS,
  CONTACT_DETAILS_ENRICHMENT_COST,
} from "@optee/constants";
import { DialogConfirmationComponent, DialogService } from "@optee/dialog";
import { IconDevisComponent, IconSpinnerComponent } from "@optee/icons";
import type { LegalEntityUuid } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { CirclePercentComponent } from "@optee/ui/components/atoms/circle-percent/circle-percent/circle-percent.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { Tooltip } from "primeng/tooltip";
import trpcClient from "../../../../../trpc-client";
import { ProService } from "../../../../services/pro.service";
import { TrackingService } from "../../../../services/tracking.service";
import { PillCreditsComponent } from "../pill-credits/pill-credits.component";
import { SolicitationIndicatorComponent } from "../solicitation-indicator/solicitation-indicator.component";

@Component({
  selector: "mkp-blocked-legal-entity-card",
  host: {
    class: "flex flex-1 flex-col gap-4",
  },
  template: `
    <div class="flex max-w-lg flex-col items-center gap-4">
      <mkp-solicitation-indicator
        class="w-full"
        displayMode="message"
        entityType="company"
        [count]="nbRelatedPros()"
      />

      <div class="flex w-full justify-between">
        <h2
          class="text-granite-900 flex w-full items-center gap-2 text-sm font-medium"
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
            [value]="confidenceScore()"
          />
          @if (isGroupEntity()) {
            <span
              pTooltip="⚠️ Il s’agit d’une entreprise intégrée à un groupe. Les contacts proposés peuvent ne pas remonter vers une personne identifiable."
            >
              ⚠️
            </span>
          }
        </h2>

        <div
          class="flex items-center gap-2"
          tooltipPosition="bottom"
          [pTooltip]="unlockTooltip()"
        >
          <oui-button
            full
            size="small"
            variant="green"
            (click)="connectProWithLegalEntity()"
            (keydown.enter)="isDialogOpen() ? $event.preventDefault() : null"
            [disabled]="!canAfford() || loading() || isDialogOpen()"
          >
            Débloquer
            @if (loading(); as isLoading) {
              <icon-spinner
                class="size-4 animate-spin text-transparent"
                colorMode="colored"
              />
            } @else {
              <mkp-pill-credits
                colorVariant="green"
                [credits]="CONTACT_DETAILS_ENRICHMENT_COST"
              />
            }
          </oui-button>
        </div>
      </div>
      @if (isLegalEntityExcluded()) {
        <oui-message class="max-w-xl" severity="info">
          <p>
            Les informations de contact ne sont pas disponibles pour ce type
            d'entité juridique.
          </p>
        </oui-message>
      } @else {
        <section
          class="border-granite-100 w-full rounded-lg border bg-white p-4"
        >
          <div class="grid grid-cols-2 gap-2 overflow-hidden">
            @for (data of fakeData(); track data.key) {
              <p class="text-granite-400 text-sm font-medium">
                {{ data.label }}:
              </p>

              <p class="text-granite-700 whitespace-pre-line text-sm blur-sm">
                {{ data.value || "N/C" }}
              </p>
            }
          </div>
        </section>
      }
    </div>
  `,
  imports: [
    IconDevisComponent,
    ButtonComponent,
    PillCreditsComponent,
    IconSpinnerComponent,
    Tooltip,
    MessageComponent,
    CirclePercentComponent,
    SolicitationIndicatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockedLegalEntityCardComponent {
  readonly legalEntityUuid = input.required<LegalEntityUuid>();
  readonly legalEntityName = input<string | null | undefined>();
  readonly nbRelatedPros = input.required<number>();
  readonly isLegalEntityExcluded = input.required<boolean>();
  readonly isGroupEntity = input.required<boolean>();
  readonly refetchData = output<void>();

  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  protected readonly proService = inject(ProService);
  private readonly trackingService = inject(TrackingService);

  protected readonly loading = signal(false);
  protected readonly isDialogOpen = signal(false);
  protected readonly CONTACT_DETAILS_ENRICHMENT_COST =
    CONTACT_DETAILS_ENRICHMENT_COST;

  protected readonly CONFIDENCE_SCORE_PAPPERS = CONFIDENCE_SCORE_PAPPERS;
  protected readonly CONFIDENCE_SCORE_GROUP_ENTITY =
    CONFIDENCE_SCORE_GROUP_ENTITY;

  protected readonly fakeData = computed(() => {
    return [
      {
        key: "phone",
        label: "Téléphone",
        value: "0123456789",
      },
      {
        key: "openingHours",
        label: "Horaires d'ouverture",
        value: "Lu-Ve 9:00-18:00",
      },
      {
        key: "website",
        label: "Site web",
        value: "https://www.example.com",
      },
      {
        key: "rating",
        label: "Avis",
        value: "4.5 (200 avis)",
      },
      {
        key: "mapsItineraryUrl",
        label: "Itinéraire",
        value: "https://www.google.com/maps",
      },
      {
        key: "businessStatus",
        label: "Statut",
        value: "Inactif",
      },
    ];
  });

  protected readonly unlockTooltip = computed(() => {
    if (!this.canAfford()) {
      return `Vous n'avez pas assez de crédits restants. Il vous faut au moins ${CONTACT_DETAILS_ENRICHMENT_COST} crédits pour débloquer cette fiche entreprise.`;
    }
    return "Débloquez la fiche entreprise pour accéder à ses informations complètes et aux coordonnées des personnes qui y travaillent.";
  });

  protected readonly canAfford = computed(() => {
    const credits = this.proService.remainingCredits();
    return credits !== null && credits >= this.CONTACT_DETAILS_ENRICHMENT_COST;
  });

  protected readonly confidenceScore = computed(() =>
    this.isGroupEntity()
      ? this.CONFIDENCE_SCORE_GROUP_ENTITY
      : this.CONFIDENCE_SCORE_PAPPERS,
  );

  async connectProWithLegalEntity() {
    if (!this.canAfford()) {
      return false;
    }
    const credits = this.proService.remainingCredits();
    if (credits === null) {
      return false;
    }
    this.isDialogOpen.set(true);
    const description =
      "En validant votre intérêt, vous aurez accès aux données de la fiche entreprise. Vous serez débité de " +
      this.CONTACT_DETAILS_ENRICHMENT_COST +
      " crédits. Ce qui vous fera un solde de " +
      (credits - this.CONTACT_DETAILS_ENRICHMENT_COST) +
      " crédits.";
    const { res: confirmed } = await this.dialogService.open(
      DialogConfirmationComponent,
      {
        data: {
          icon: "person",
          title: "Débloquer la fiche entreprise",
          description,
          actionColor: "green",
        },
      },
    );

    if (!confirmed) {
      this.isDialogOpen.set(false);
      return false;
    }

    this.loading.set(true);
    try {
      await trpcClient.pros.connectProWithLegalEntity.mutate({
        legalEntityUuid: this.legalEntityUuid(),
        associationType: "GLOBAL",
      });
      this.refetchData.emit();
      this.toastService.open(
        "success",
        "Fiche entreprise débloquée avec succès.",
        "Vous pouvez accéder aux informations de contact des personnes liées à cette entreprise",
      );
      const legalEntityName = this.legalEntityName();
      this.trackingService.trackPro("pro_credits_consumed", {
        credits_used: this.CONTACT_DETAILS_ENRICHMENT_COST,
        type: "entreprise",
        source_page: "entreprise",
        entity_id: this.legalEntityUuid(),
        ...(legalEntityName ? { entity_name: legalEntityName } : {}),
        action: "Déblocage fiche entreprise",
      });
      return true;
    } catch (err) {
      console.error("Enrichment failed:", err);
      this.toastService.openError(
        "Enrichissement échoué",
        err instanceof Error ? err.message : String(err),
      );
      return false;
    } finally {
      this.loading.set(false);
      this.isDialogOpen.set(false);
    }
  }
}

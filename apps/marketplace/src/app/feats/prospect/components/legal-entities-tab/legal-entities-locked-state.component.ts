import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { CONTACT_CONNECTION_COST } from "@optee/constants";
import { IconCompanyComponent, IconSpinnerComponent } from "@optee/icons";
import type { LocationBdnbUuid } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { Tooltip } from "primeng/tooltip";
import trpcClient from "../../../../../trpc-client";
import { ProService } from "../../../../services/pro.service";
import { TrackingService } from "../../../../services/tracking.service";
import { PillCreditsComponent } from "../pill-credits/pill-credits.component";
import { SolicitationIndicatorComponent } from "../solicitation-indicator/solicitation-indicator.component";

@Component({
  selector: "mkp-legal-entities-locked-state",
  host: {
    class:
      "flex h-full flex-col items-center justify-center gap-6 bg-green-50 p-4",
  },
  template: `
    <div class="rounded-xl bg-green-200 p-4">
      <icon-company
        class="size-20 text-green-600 opacity-40"
        displayMode="full"
      />
    </div>
    @if (legalEntitiesCount() > 0) {
      <div class="flex flex-col gap-2">
        <p class="text-center text-lg font-semibold">
          Découvrez
          <span class="text-green-600">
            {{ nbLegalEntitiesAvailableLabel() }}
          </span>
          à cette adresse
        </p>
        <p class="text-sm text-gray-600">
          @if (legalEntitiesCount() > 1) {
            Les entreprises associées seront directement ajoutées à votre carnet
            d’adresse.
          } @else {
            L'entreprise associée sera directement ajoutée à votre carnet
            d’adresse.
          }
        </p>
      </div>
      <mkp-solicitation-indicator
        displayMode="message"
        entityType="building"
        [count]="solicitationCount()"
      />
      <div
        tooltipPosition="bottom"
        [pTooltip]="
          !canAfford()
            ? 'Crédits insuffisants'
            : isUnlocking()
              ? 'Déblocage en cours...'
              : ''
        "
      >
        <oui-button
          full
          size="small"
          variant="green"
          (click)="buyLocationContact()"
          [disabled]="!canAfford() || isUnlocking()"
        >
          @if (isUnlocking()) {
            <icon-spinner class="size-4 animate-spin" />
          }

          <span>
            @if (legalEntitiesCount() > 1) {
              Débloquer les entreprises associées
            } @else {
              Débloquer l'entreprise associée
            }
          </span>
          <mkp-pill-credits
            colorVariant="green"
            [credits]="CONTACT_CONNECTION_COST"
          />
        </oui-button>
      </div>
    } @else {
      <p>Aucune entreprise n'est encore associée à cette adresse</p>
    }
  `,
  imports: [
    ButtonComponent,
    IconCompanyComponent,
    IconSpinnerComponent,
    PillCreditsComponent,
    SolicitationIndicatorComponent,
    Tooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntitiesLockedStateComponent {
  readonly locationBdnbUuid = input.required<LocationBdnbUuid>();
  readonly legalEntitiesCount = input.required<number>();
  readonly address = input.required<string>();
  readonly solicitationCount = input<number | null>(null);

  readonly unlocked = output<void>();

  private readonly trackingService = inject(TrackingService);
  private readonly proService = inject(ProService);
  private readonly toastService = inject(ToastService);

  protected readonly isUnlocking = signal(false);

  protected readonly CONTACT_CONNECTION_COST = CONTACT_CONNECTION_COST;

  protected readonly nbLegalEntitiesAvailableLabel = computed(() => {
    const count = this.legalEntitiesCount() || 0;
    if (count === 0) {
      return "Aucune entreprise associée";
    } else if (count === 1) {
      return "l'entreprise associée";
    }
    return `les ${count} entreprises associées`;
  });

  protected readonly canAfford = computed(() => {
    const credits = this.proService.remainingCredits();
    return credits !== null && credits >= this.CONTACT_CONNECTION_COST;
  });

  protected async buyLocationContact() {
    if (this.isUnlocking()) {
      return;
    }
    const locationUuid = this.locationBdnbUuid();
    try {
      this.isUnlocking.set(true);
      await trpcClient.locationsBdnb.connectWithLocation.mutate(locationUuid);

      this.trackingService.trackPro("pro_credits_consumed", {
        credits_used: this.CONTACT_CONNECTION_COST,
        type: "batiment",
        source_page: "batiment",
        entity_id: locationUuid,
        entity_name: this.address(),
        action: "Déblocage entreprises associées (bâtiment)",
      });
      this.proService.refresh();
      this.unlocked.emit();
    } catch (error) {
      this.toastService.openError("Demande de contact", error);
    } finally {
      this.isUnlocking.set(false);
    }
  }
}

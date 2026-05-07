import { CurrencyPipe, DatePipe, DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  resource,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import type {
  BriefPageQueryParams,
  OperationHubspotPrestationId,
} from "@optee/constants";
import {
  BRIEF_PAGE_SOURCE_QUERY_PARAM,
  getTypeByHubspotPrestationId,
} from "@optee/constants";
import { IconAnalysisComponent, IconPlusComponent } from "@optee/icons";
import type { Location, OperationRow } from "@optee/models";
import { simulateOperationFromLocationAndOperationSubType } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { sleep } from "@optee/utils";
import { Tooltip } from "primeng/tooltip";
import { OperationProjectIndexComponent } from "../operation-project-index/operation-project-index.component";
import { OperationStatusPillComponent } from "../operation-status-pill/operation-status-pill.component";
import { OperationTypesSelectComponent } from "../operation-types-select/operation-types-select.component";

// Simulation delay constants (in milliseconds)
const SIMULATION_MIN_DELAY = 1000;
const SIMULATION_MAX_DELAY = 2000;

@Component({
  selector: "mkp-operation-analysis-pro",
  host: { class: "flex flex-col gap-8" },
  template: `
    @if (this.operationLead(); as operation) {
      <div class="flex flex-col gap-4">
        <section
          class="font-display text-primary-900 flex items-center justify-between gap-4 text-2xl font-semibold"
        >
          <div class="flex items-center gap-2">
            <icon-plus [class]="iconClasses" />
            Détails de l'opération
          </div>
          <oui-button
            variant="primary"
            (click)="redirectToBrief()"
            [disabled]="!operationLead()?.prestationId"
          >
            Brief technique détaillé
          </oui-button>
        </section>

        <oui-eve class="flex flex-col gap-4 px-4 md:px-6">
          <div class="flex flex-wrap items-start justify-around gap-4">
            @if (displayStatus()) {
              <div class="flex flex-col gap-2">
                <span class="text-sm font-medium text-gray-600">Statut</span>
                <mkp-operation-status-pill
                  [isMissingProQuote]="isMissingProQuote()"
                  [operation]="operation"
                />
              </div>
            }

            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium text-gray-600">
                Date de la commande
              </span>
              <p class="text-xl font-bold">
                {{ operation.createdAt | date }}
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium text-gray-600">Coût estimé</span>
              <p
                class="text-xl font-bold"
                [pTooltip]="estimatedBudgetTooltip()"
              >
                @if (
                  operation.cost.value !== null &&
                  operation.cost.value !== undefined
                ) {
                  {{
                    operation.cost.value | currency: "EUR" : "symbol" : "1.0-0"
                  }}
                } @else {
                  inconnu
                }
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium text-gray-600">Type</span>
              <p class="text-xl font-bold">
                {{ operation.location.mainSectorLabel }}
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium text-gray-600">
                Surface Chauffée
              </span>
              <p class="text-xl font-bold">
                @if (operation.location.surfaceThatRequiresHeating !== null) {
                  {{
                    operation.location.surfaceThatRequiresHeating
                      | number: "1.0-0"
                  }}
                  m²
                } @else {
                  inconnu
                }
              </p>
            </div>
          </div>
        </oui-eve>
      </div>
    }

    @let locationValue = location();
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between gap-5">
        <span
          class="font-display text-primary-900 flex gap-2 text-2xl font-semibold"
        >
          <icon-analysis [class]="iconClasses" />
          Simulation d’opération
        </span>

        @if (!operationLead() && locationValue) {
          <mkp-operation-types-select
            class="flex-1 lg:max-w-lg"
            hideClearButton
            [(activeOperation)]="activeOperation"
            [location]="locationValue"
          />
        }
      </div>

      <div class="flex w-full items-start justify-between gap-4">
        <p class="max-w-prose text-sm text-gray-600 lg:text-base">
          @if (!locationValue) {
            Renseignez l'adresse de votre projet pour récupérer les informations
            de votre prospect. Si besoin, modifiez manuellement les informations
            récupérées par notre système pour améliorer vos préconisations.
          } @else {
            Les données ci-dessous ont été calculées en fonction des
            informations disponibles sur le bâtiment, permettant d’apporter une
            estimation de la rentabilité potentielle de ce projet.
          }
        </p>

        @let ope = simulatedOperation.value();
        @if (!operationLead()) {
          <oui-button
            variant="primary"
            (click)="generateBrief(ope)"
            [disabled]="!activeOperation()"
          >
            Brief technique détaillé
          </oui-button>
        }
      </div>

      <mkp-operation-project-index
        [loading]="loading()"
        [operation]="ope ?? null"
      />
    </div>
  `,
  imports: [
    OperationProjectIndexComponent,
    OperationTypesSelectComponent,
    OperationStatusPillComponent,
    EveComponent,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    ButtonComponent,
    IconPlusComponent,
    IconAnalysisComponent,
    Tooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationAnalysisProComponent {
  readonly operationLead = input.required<OperationRow | null>();
  readonly location = input.required<Location | null>();
  readonly operationForBrief = model.required<OperationRow | null>();

  readonly displayStatus = input(false);
  readonly isMissingProQuote = input<boolean>(false);

  private readonly router = inject(Router);
  readonly activeOperation = model<OperationHubspotPrestationId | null>(null);

  protected readonly iconClasses =
    "bg-primary-700 size-8 rounded-lg border-2 p-1.5 text-white";

  readonly loading = signal(false);

  protected readonly simulatedOperation = resource({
    params: () => ({
      location: this.location(),
      activeOperation:
        this.operationLead()?.prestationId || this.activeOperation(),
      hasAlreadyBeenSimulated: !!this.operationLead()?.id,
    }),
    loader: async ({ params }) => {
      this.loading.set(true);
      const { location, activeOperation, hasAlreadyBeenSimulated } = params;
      if (!location || !activeOperation) {
        this.loading.set(false);
        return null;
      }
      const operationSubType = getTypeByHubspotPrestationId(activeOperation);
      if (!operationSubType) {
        return null;
      }

      // If the lead already exists, we don't need to simulate a loading time
      if (!hasAlreadyBeenSimulated) {
        // Simulate a loading time of 1 to 2 seconds
        const randomDelay =
          Math.floor(
            Math.random() * (SIMULATION_MAX_DELAY - SIMULATION_MIN_DELAY + 1),
          ) + SIMULATION_MIN_DELAY;
        await sleep(randomDelay);
      }
      this.loading.set(false);

      return simulateOperationFromLocationAndOperationSubType({
        location,
        operationSubType,
      });
    },
  });

  protected readonly estimatedBudgetTooltip = computed(() => {
    const operation = this.operationLead();
    if (!operation) {
      return undefined;
    }

    return operation.plannedBudgetRange
      ? `Budget prévu par le client : ${operation.plannedBudgetRange} €`
      : undefined;
  });

  protected generateBrief(operation: OperationRow | null | undefined) {
    if (!operation) {
      return;
    }

    this.operationForBrief.set(operation);
  }

  protected redirectToBrief() {
    const existingLead = this.operationLead();

    if (!existingLead?.id) {
      this.generateBrief(existingLead);
      return;
    }
    const briefQueryParam: BriefPageQueryParams = {
      [BRIEF_PAGE_SOURCE_QUERY_PARAM]: "Outil cyclope",
    };
    const url = this.router.serializeUrl(
      this.router.createUrlTree(["/brief", existingLead.id], {
        queryParams: briefQueryParam,
      }),
    );
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

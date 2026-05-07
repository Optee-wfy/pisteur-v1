import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  PercentPipe,
} from "@angular/common";
import type { ElementRef } from "@angular/core";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  viewChild,
} from "@angular/core";
import type { XFactorsKey } from "@optee/constants";
import {
  contactSupport,
  CTA,
  getDpeLabel,
  KWH_PRICE,
  OperationPhaseEnum,
  OperationType,
  PRO_MARKETPLACE_PHASES,
} from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconCirclePlusComponent,
  IconInfoComponent,
  IconSpinnerComponent,
} from "@optee/icons";
import type { HubspotClient, QuoteUuid } from "@optee/models";
import { isOpteeLocation, OperationRow } from "@optee/models";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { CirclePercentComponent } from "@optee/ui/components/atoms/circle-percent/circle-percent/circle-percent.component";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { BicolorPillComponent } from "@optee/ui/components/atoms/pill/bicolor-pill/bicolor-pill.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { observeSize } from "@optee/ui/utils/observers/observe-size";
import { hostBinding } from "ngxtension/host-binding";
import { ProgressBarModule } from "primeng/progressbar";
import { Tooltip } from "primeng/tooltip";
import { combineLatest, distinctUntilChanged, map } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { AuthService } from "../../../services/auth.service";
import { CyclopeMode, CyclopeService } from "../../../services/cyclope.service";
import { OperationService } from "../../../services/operation.service";
import { PermissionService } from "../../../services/permission.service";
import { ProService } from "../../../services/pro.service";
import { LocationEditFormDialogComponent } from "../../location/location-form-dialog/location-edit-form-dialog.component";
import { QuoteUploadComponent } from "../../quote/quote-upload.component";
import { IconOperationLaunchComponent } from "../icon-operation-launch/icon-operation-launch.component";
import { LaunchOperationComponent } from "../launch-operation.component/launch-operation.component";
import { NewOperationByClientComponent } from "../new-operation-by-client/new-operation-by-client.component";
import { OperationScoreDetailsComponent } from "../operation-score-details/operation-score-details.component";
import { OperationStatusPillComponent } from "../operation-status-pill/operation-status-pill.component";
import { OperationTagComponent } from "../operation-tag/operation-tag.component";

export type OperationListColumn =
  | Extract<
      keyof OperationRow,
      | "locationBdnbStatus"
      | "sortablePhase"
      | "sortableCost"
      | "sortableEstimatedCostComparison"
      | "sortableFunding"
      | "sortableEstimatedFundingComparison"
      | "sortableRemainingAmount"
      | "estimatedEnergyImpact"
      | "score"
      | "plannedBudgetRange"
      | "createdAt"
      | "sortableSector"
      | "locationCreationDate"
      | "dpeLabel"
      | "phaseEnum"
    >
  | "clientName";

export type OperationRowAction =
  | "launch"
  | "details"
  | "buy-lead"
  | "upload-quote";

@Component({
  selector: "mkp-operations-group-row",
  host: {
    class: "table-row align-middle border border-gray-300 last:round-b-lg",
  },
  template: `
    <td>
      <div
        class="flex w-[320px] cursor-pointer flex-col items-start gap-2"
        (click)="categoryClick.emit()"
      >
        <mkp-operation-tag
          class="max-w-full"
          (click)="
            authService.isLoggedAsClient() &&
              operationService.showPanel(operation())
          "
          [operationGroup]="operation().phase.category"
          [operationSubType]="operation().typeInfo"
          [operationType]="operation().parentTypeInfo"
          [operationTypeCategory]="operation().typeCategory"
          [styleMode]="displayMode() === 'leads' ? 'leads' : 'default'"
        />

        @if (displayMode() !== "leads") {
          <div class="subtext max-w-full truncate">
            <span class="font-semibold">
              {{ operation().location.shortAddress }}
            </span>

            {{ operation().location.zipcode }}
            {{ operation().location.city }}
          </div>
        }
      </div>
    </td>

    @if (visibleColumns().includes("score")) {
      <td>
        @if (!operation().score || !operation().estimatedEnergyImpact) {
          <span
            class="unavailable"
            pTooltip=" Cette opération ne génère pas d’économie d’énergie"
          >
            N/A
          </span>
        } @else {
          <oui-circle-percent
            class="shadow-o2 size-10 bg-white"
            tooltipPosition="top"
            tooltipStyleClass="p-tooltip--reset"
            [fitContent]="true"
            [pTooltip]="toolTipContent"
            [value]="operation().score"
          />

          <ng-template #toolTipContent>
            <mkp-operations-score-details
              class="shadow-o2 border-primary-200 w-80 rounded-2xl border bg-white p-4"
              [operation]="operation()"
            />
          </ng-template>
        }
      </td>
    }

    @if (visibleColumns().includes("locationBdnbStatus")) {
      <td class="text-sm">
        {{ operation().locationBdnbStatus }}
      </td>
    }

    @if (visibleColumns().includes("sortablePhase")) {
      <td>
        <div class="flex flex-col items-start gap-2">
          <mkp-operation-status-pill
            [isMissingProQuote]="!!operation().missingProQuoteUuid"
            [operation]="operation()"
          />

          @if (!hideLaunchDate()) {
            <div class="subtext">
              @if (!operation().started) {
                @if (operation().plannedLaunchDate) {
                  Prévue le
                  {{ operation().plannedLaunchDate | date: "dd/MM/yy" }}
                }
              } @else if (operation().launchingDate) {
                Lancée le
                {{ operation().launchingDate | date: "dd/MM/yy" }}
              }
            </div>
          }
        </div>
      </td>
    }

    @if (visibleColumns().includes("phaseEnum")) {
      <td>
        <span
          class="whitespace-nowrap rounded-lg px-2 py-1 text-sm"
          [class]="proMarketplaceStatusData().class"
          [pTooltip]="proMarketplaceStatusData().tooltip"
          [tooltipDisabled]="!proMarketplaceStatusData().tooltip"
        >
          {{ proMarketplaceStatusData().label }}
        </span>
      </td>
    }

    @if (visibleColumns().includes("sortableCost")) {
      <td class="relative" #tdCost>
        @if (operation().needsSimulation) {
          @if (operation().location.needsBdnbCheck) {
            <div
              class="simulator"
              (click)="updateBdnb()"
              [style.width.px]="simulationW$ | async"
            >
              Analyser le site
            </div>
          } @else if (operation().missingXFactors.length > 0) {
            <div
              class="indicator indicator--floating"
              tooltipPosition="top"
              tooltipStyleClass="p-tooltip--long"
              (click)="
                authService.isLoggedAsClient()
                  ? editLocation(operation().missingXFactors)
                  : undefined
              "
              [class.!cursor-help]="authService.isLoggedAsPro()"
              [pTooltip]="missingCostFactorsTooltip"
              [style.width.px]="indicatorW$ | async"
            >
              <div class="text-xs">Donnée(s) manquante(s) pour estimation:</div>
              <strong class="truncate">
                {{ operation().missingXFactorsLabel }}
              </strong>
            </div>

            <ng-template #missingCostFactorsTooltip>
              @if (authService.isLoggedAsPro()) {
                {{ proMessageWhenMissingXFactors }}
              } @else {
                <div class="text-xs">Cliquez pour renseigner:</div>
                <strong>
                  {{ operation().missingXFactorsLabel }}
                </strong>
              }
            </ng-template>
          } @else if (!preventSimulation()) {
            <div
              class="simulator"
              (click)="updateSimulation()"
              [class.isSimulating]="isSimulating()"
              [style.width.px]="simulationW$ | async"
            >
              @if (isSimulating()) {
                <icon-spinner
                  class="size-4 animate-spin text-transparent"
                  colorMode="colored"
                />
                Simulation en cours...
              } @else {
                Simuler l’opération pour afficher les données estimatives
              }
            </div>
          }
        }

        <div class="flex flex-col">
          @if (operation().isFunding) {
            <span class="unavailable">N/A</span>
          } @else if (operation().cost.value !== null) {
            <span
              class="text-primary-900 font-display whitespace-nowrap text-sm"
            >
              {{
                operation().cost.value | currency: "EUR" : "symbol" : "1.0-0"
              }}
            </span>
            @if (operation().cost.isEstimated) {
              <div class="subtext">Estimation</div>
            }
          } @else {
            <span class="unavailable">N/A</span>
          }
        </div>
      </td>
    }

    @if (visibleColumns().includes("sortableEstimatedCostComparison")) {
      <td>
        @let storedEstimatedCost = operation().storedEstimatedCost;
        @let projectedEstimatedCost = operation().projectedEstimatedCost;

        @if (storedEstimatedCost === projectedEstimatedCost) {
          ✅
        } @else {
          <div class="flex flex-col">
            <span
              class="text-primary-900 font-display whitespace-nowrap text-sm"
            >
              {{ storedEstimatedCost | currency: "EUR" : "symbol" : "1.0-0" }}

              ➡️

              @if (projectedEstimatedCost !== null) {
                {{
                  projectedEstimatedCost | currency: "EUR" : "symbol" : "1.0-0"
                }}
              } @else {
                Impossible
              }
            </span>
            <div class="subtext">Estimation</div>
          </div>
        }
      </td>
    }

    @if (visibleColumns().includes("sortableFunding")) {
      <td #tdFunding>
        <div class="flex flex-col">
          @if (operation().isFunding) {
            <span class="unavailable">N/A</span>
          } @else if (operation().funding.value !== null) {
            <span class="font-display whitespace-nowrap text-sm text-green-700">
              {{
                operation().funding.value | currency: "EUR" : "symbol" : "1.0-0"
              }}
            </span>
            @if (operation().funding.isEstimated) {
              <div class="subtext">Estimation</div>
            }
          } @else {
            <span class="unavailable">
              @if (operation().cost.value === null) {
                N/A
              } @else {
                {{ 0 | currency: "EUR" : "symbol" : "1.0-0" }}
              }
            </span>
          }
        </div>
      </td>
    }

    @if (visibleColumns().includes("sortableEstimatedFundingComparison")) {
      <td>
        @let projectedEstimatedFunding = operation().projectedEstimatedFunding;
        @let storedEstimatedFunding = operation().storedEstimatedFunding;

        @if (storedEstimatedFunding === projectedEstimatedFunding) {
          ✅
        } @else {
          <div class="flex flex-col">
            <span
              class="text-primary-900 font-display whitespace-nowrap text-sm"
            >
              {{
                storedEstimatedFunding | currency: "EUR" : "symbol" : "1.0-0"
              }}

              ➡️

              @if (projectedEstimatedFunding !== null) {
                {{
                  projectedEstimatedFunding
                    | currency: "EUR" : "symbol" : "1.0-0"
                }}
              } @else {
                Impossible
              }
            </span>
            <div class="subtext">Estimation</div>
          </div>
        }
      </td>
    }

    @if (visibleColumns().includes("sortableRemainingAmount")) {
      <td #tdRemainingAmount>
        <div class="flex flex-col">
          @if (operation().isFunding) {
            <span class="unavailable">N/A</span>
          } @else if (operation().remainingAmount.value !== null) {
            <span
              class="text-primary-900 font-display whitespace-nowrap text-sm"
            >
              {{
                operation().remainingAmount.value
                  | currency: "EUR" : "symbol" : "1.0-0"
              }}
            </span>
            @if (operation().remainingAmount.isEstimated) {
              <div class="subtext">Estimation</div>
            }
          } @else {
            <span class="unavailable">N/A</span>
          }
        </div>
      </td>
    }

    @if (visibleColumns().includes("clientName")) {
      <td class="w-1/5">
        @if (operation().client; as client) {
          <span class="text-primary-900 text-xs">
            {{ client.name }}
          </span>
        } @else {
          <span class="unavailable">N/A</span>
        }
      </td>
    }

    @if (visibleColumns().includes("estimatedEnergyImpact")) {
      <td class="relative" #tdEstimatedEnergyImpact>
        @if (operation().isFunding) {
          <span class="unavailable">N/A</span>
        } @else if (
          operation().location.missingXFactorsForEnergyImpact.length > 0
        ) {
          <div
            class="indicator"
            tooltipPosition="top"
            tooltipStyleClass="p-tooltip--long"
            (click)="
              authService.isLoggedAsClient()
                ? editLocation(
                    operation().location.missingXFactorsForEnergyImpact
                  )
                : undefined
            "
            [pTooltip]="missingImpactFactorsTooltip"
          >
            <div class="text-xs">Donnée manquante:</div>
            <strong class="max-w-[160px] truncate">
              {{ operation().location.missingXFactorsForEnergyImpactLabel }}
            </strong>
          </div>

          <ng-template #missingImpactFactorsTooltip>
            @if (authService.isLoggedAsPro()) {
              {{ proMessageWhenMissingXFactors }}
            } @else {
              <div class="text-xs">Cliquez pour renseigner:</div>
              <strong>
                {{ operation().location.missingXFactorsForEnergyImpactLabel }}
              </strong>
            }
          </ng-template>
        } @else if (!operation().estimatedEnergyImpact) {
          <span class="unavailable">N/A</span>
        } @else {
          <oui-bicolor-pill
            class="!justify-start"
            tooltipPosition="top"
            tooltipStyleClass="p-tooltip--long"
            [pTooltip]="energyImpactTooltip()"
            [values]="[
              operation().estimatedEnergyImpact | percent: '1.0-0',
              visibleColumns().includes('estimatedEnergyImpact')
                ? null
                : ((operation().estimatedAnnualSavings
                    | currency: 'EUR' : 'symbol' : '1.0-0') ?? 'N/A') + '/an',
              operation().estimatedPaybackPeriodFormatted,
            ]"
          />
        }
      </td>
    }

    @if (visibleColumns().includes("createdAt")) {
      @if (operation().createdAt) {
        <td class="text-sm">
          {{ operation().createdAt | date: "dd/MM/yy" }}
        </td>
      } @else {
        <td class="unavailable text-sm">N/A</td>
      }
    }

    @if (visibleColumns().includes("plannedBudgetRange")) {
      @if (operation().plannedBudgetRange) {
        <td
          class="text-sm"
          tooltipPosition="top"
          [pTooltip]="plannedBudgetTooltip()"
        >
          {{ operation().plannedBudgetRange }}
          €
        </td>
      } @else {
        <td class="unavailable text-sm">N/A</td>
      }
    }

    @if (visibleColumns().includes("sortableSector")) {
      <td class="text-sm">{{ operation().sortableSector }}</td>
    }

    @if (visibleColumns().includes("locationCreationDate")) {
      @if (operation().location.creationDate) {
        <td class="text-sm">
          {{ operation().location.creationDate | date: "yyyy" }}
        </td>
      } @else {
        <td class="unavailable text-sm">Non renseignée</td>
      }
    }

    @if (visibleColumns().includes("dpeLabel")) {
      <td class="text-sm">
        <oui-dpe-label
          variant="round"
          [letter]="
            operation().location.dpeLabel ??
            getDpeLabel(
              operation().location.electricityConsumptionPerSquareMeter
            )
          "
        />
      </td>
    }

    @if (actions().length > 0) {
      <td>
        <div class="flex items-center justify-end gap-2">
          @if (
            actions().includes("upload-quote") &&
            operation().missingProQuoteUuid
          ) {
            <oui-button
              size="small"
              variant="litePrimary"
              (click)="openUploadQuoteDialog()"
            >
              Déposer devis
            </oui-button>
          }
          @if (actions().includes("details")) {
            <oui-button-icon
              class="text-primary-500"
              tooltipPosition="top"
              (click)="
                authService.isLoggedAsClient()
                  ? operationService.showPanel(operation())
                  : cyclopeService.openCyclope({
                      mode: CyclopeMode.BOUGHT_LEAD,
                      locationUuid: operation().location.uuid,
                      operationUuid: operation().uuid,
                    })
              "
              [pTooltip]="CTA.seeThisOperation"
            >
              <icon-info class="size-5" />
            </oui-button-icon>
          }

          @if (actions().includes("buy-lead")) {
            @let hasImpactSubscription = proService.subscription() === "Impact";
            <span
              tooltipPosition="left"
              [pTooltip]="
                hasImpactSubscription
                  ? 'Se positionner'
                  : CTA.buyFeatureWithImpactSubscription
              "
            >
              <oui-button-icon
                variant="primary"
                (click)="
                  cyclopeService.openCyclope({
                    mode: CyclopeMode.BUY_LEAD,
                    locationUuid: operation().location.uuid,
                    operationUuid: operation().uuid,
                  })
                "
                [disabled]="!hasImpactSubscription"
              >
                <icon-circle-plus class="size-5" />
              </oui-button-icon>
            </span>
          }

          @if (
            actions().includes("launch") &&
            authService.isLoggedAsClient() &&
            permissionService.can("DEAL_LAUNCH")
          ) {
            @if (operation().isSimulation) {
              <oui-button-icon
                tooltipPosition="top"
                variant="primary"
                (click)="startOperation()"
                [pTooltip]="CTA.newProject"
              >
                <icon-circle-plus class="size-5" />
              </oui-button-icon>
            } @else {
              <oui-button-icon
                tooltipPosition="top"
                variant="primary"
                (click)="launchOperation()"
                [pTooltip]="CTA.launchThisOperation"
              >
                <mkp-icon-operation-launch class="size-4" />
              </oui-button-icon>
            }
          }
        </div>
      </td>
    }
  `,
  styles: `
    .unavailable {
      @apply text-sm text-gray-300;
    }

    .subtext {
      @apply text-xs font-normal leading-none tracking-tight text-gray-600;
    }

    .simulator {
      @apply font-display absolute inset-3 left-0 z-10 flex cursor-pointer select-none items-center justify-center gap-2 rounded-lg border border-transparent p-3 text-sm transition-opacity;

      :host:not(:hover) &:not(.isSimulating) {
        @apply opacity-0;
      }

      &:not(.missingData) {
        @apply text-primary-700 bg-gray-100;
      }

      &.missingData {
        @apply bg-red-100 text-red-500;
      }
    }

    .indicator {
      @apply text-primary-700 font-display flex cursor-pointer select-none flex-col items-center justify-center rounded-lg bg-gray-100 p-3 text-sm;
    }

    .indicator--floating {
      @apply absolute inset-3 left-0;
    }

    td {
      @apply p-2;
    }

    :host(.leads-row) td {
      @apply bg-white;
    }

    :host(.leads-row):hover td {
      @apply bg-amber-50;
    }
  `,
  imports: [
    CirclePercentComponent,
    IconSpinnerComponent,
    IconOperationLaunchComponent,
    BicolorPillComponent,
    CurrencyPipe,
    ProgressBarModule,
    IconCirclePlusComponent,
    Tooltip,
    PercentPipe,
    ButtonIconComponent,
    OperationTagComponent,
    OperationStatusPillComponent,
    OperationScoreDetailsComponent,
    CommonModule,
    DatePipe,
    IconInfoComponent,
    DpeLabelComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsGroupRowComponent {
  readonly categoryClick = output<void>();

  readonly operation = model.required<
    OperationRow & { missingProQuoteUuid?: QuoteUuid | null }
  >();

  readonly client = input<HubspotClient>();
  readonly visibleColumns = input.required<OperationListColumn[]>();
  readonly actions = input.required<OperationRowAction[]>();
  readonly hideLaunchDate = input(false, { transform: booleanAttribute }); // Replace with slot
  readonly preventSimulation = input(false, { transform: booleanAttribute });
  displayMode = input<"leads" | "marketplace">("marketplace");
  leadsModeBinding = hostBinding(
    "class.leads-row",
    computed(() => this.displayMode() === "leads"),
  );

  protected readonly tdCost = viewChild<ElementRef>("tdCost");
  protected readonly tdFunding = viewChild<ElementRef>("tdFunding");
  protected readonly tdRemainingAmount =
    viewChild<ElementRef>("tdRemainingAmount");

  protected readonly tdEstimatedEnergyImpact = viewChild<ElementRef>(
    "tdEstimatedEnergyImpact",
  );

  protected readonly CTA = CTA;
  protected readonly OperationType = OperationType;
  protected readonly getDpeLabel = getDpeLabel;
  protected readonly CyclopeMode = CyclopeMode;

  protected readonly proMessageWhenMissingXFactors =
    "Le client peut mettre à jour ces données pour obtenir les estimations de coût et de subventions";

  protected readonly authService = inject(AuthService);
  protected readonly permissionService = inject(PermissionService);
  protected readonly cyclopeService = inject(CyclopeService);
  protected readonly operationService = inject(OperationService);
  protected readonly proService = inject(ProService);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  protected readonly energyImpactTooltip = computed(() => {
    const estimatedEnergyImpact = this.operation().estimatedEnergyImpact;
    const electricityConsumptionPerSquareMeter =
      this.operation().location.electricityConsumptionPerSquareMeter;
    const remainingAmountEuro = this.operation().remainingAmount.value;
    if (estimatedEnergyImpact === null) {
      return "Aucune donnée d'impact énergétique disponible";
    }

    if (electricityConsumptionPerSquareMeter === null) {
      return "Aucune donnée de consommation disponible";
    }

    if (remainingAmountEuro === null) {
      return "Aucune donnée de reste à charge disponible";
    }

    return (
      "ROI basé sur une consommation actuelle de " +
      electricityConsumptionPerSquareMeter +
      "Kwh/m2/an, un coût de " +
      KWH_PRICE +
      "€/Kwh, un impact de " +
      estimatedEnergyImpact * 100 +
      "% et un reste à charge de " +
      Math.round(remainingAmountEuro) +
      "€"
    );
  });

  protected readonly proMarketplaceStatusData = computed(() => {
    const phase = this.operation().phase.enum;
    const inScope = PRO_MARKETPLACE_PHASES.includes(phase);
    const isFromDtg = this.operation().isFromDtg;

    if (phase === OperationPhaseEnum.PROJECT_PHASE) {
      if (isFromDtg) {
        return {
          label: "Opération préconisée",
          tooltip:
            "Opération identifiée à la suite d’un Diagnostic Technique Global (DTG). Le client n’a pas encore lancé d’appel d’offres, mais le projet est préconisé dans le rapport technique.",
          class: "text-blue-600 bg-blue-100",
        } as const;
      }
      return {
        label: "Opération prévue",
        tooltip:
          "Opération déclarée par un client, mais dont l’appel d’offres n’a pas encore été lancé.",
        class: "text-yellow-500 bg-yellow-100",
      } as const;
    }

    if (inScope) {
      return {
        label: "Appel d'offres",
        tooltip:
          "Opération lancée par un client et ouverte à un appel d’offres.",
        class: "text-green-600 bg-green-300",
      } as const;
    }

    return {
      label: "",
      tooltip: "",
      class: "text-yellow-500 bg-yellow-100",
    } as const;
  });

  protected readonly isSimulating = signal(false);
  protected readonly isAlreadyOrderedManual = signal(false);

  protected readonly isAlreadyOrdered = linkedSignal(
    () => this.operation().isAlreadyOrdered || this.isAlreadyOrderedManual(),
  );

  protected readonly plannedBudgetTooltip = computed(() => {
    const op = this.operation();
    return `Budget prévu par le client : ${op.plannedBudgetRange}€\nEstimation Optee : ${op.projectedEstimatedCost}€`;
  });

  protected readonly simulationW$ = combineLatest([
    observeSize(this.tdCost, "width"),
    observeSize(this.tdFunding, "width"),
    observeSize(this.tdRemainingAmount, "width"),
    observeSize(this.tdEstimatedEnergyImpact, "width"),
  ]).pipe(
    map((widths) => widths.reduce((acc, width) => acc + width, 0)),
    distinctUntilChanged(),
  );

  protected readonly indicatorW$ = combineLatest([
    observeSize(this.tdCost, "width"),
    observeSize(this.tdFunding, "width"),
    observeSize(this.tdRemainingAmount, "width"),
  ]).pipe(
    map((widths) => widths.reduce((acc, width) => acc + width, 0)),
    distinctUntilChanged(),
  );

  startOperation() {
    const operation = this.operation();

    return this.dialogService.open(NewOperationByClientComponent, {
      data: {
        operation,
      },
    });
  }

  async launchOperation() {
    const operation = this.operation();

    const location = operation.location;

    if (!isOpteeLocation(location)) {
      this.toastService.open(
        "warn",
        "Opération non disponible",
        "Lancement impossible depuis un lieu externe (BDNB). Associez ou créez un site Optee pour continuer. " +
          contactSupport,
      );
      return;
    }

    const canLaunch = await this.operationService.canLaunchOperation({
      hsPrestationId: operation.prestationId,
      locationUuid: location.uuid,
      operationUuid: operation.uuid,
    });

    if (!canLaunch) {
      return;
    }

    return this.dialogService.open(LaunchOperationComponent, {
      data: {
        operationUuid: operation.uuid,
        locationUuid: location.uuid,
        contactOnSite: location.contactOnSite,
        hsPrestationId: operation.prestationId,
      },
    });
  }

  async updateSimulation() {
    if (this.isSimulating()) {
      return;
    }

    this.isSimulating.set(true);

    const actionAttempted = "Simulation de l'opération";

    try {
      const hsOperation = await trpcClient.operations.updateCalculation.mutate({
        operationUuid: this.operation().uuid,
      });

      if (!hsOperation) {
        throw new Error("Impossible de mettre à jour l'opération");
      }

      const updatedOperation = OperationRow.initWithAssociations({
        input: hsOperation,
        location: this.operation().location,
        client: this.operation().client,
      });

      if (!updatedOperation) {
        throw new Error(
          "Impossible de mettre à jour l'opération. Celle-ci semble mal formatée",
        );
      }

      this.operation.set(updatedOperation);

      this.toastService.open(
        "success",
        actionAttempted,
        "La simulation a bien été effectuée",
      );
    } catch (error) {
      this.toastService.openError(actionAttempted, error);
    } finally {
      this.isSimulating.set(false);
    }
  }

  async updateBdnb() {
    const actionAttempted = "Analyse du site";

    try {
      await trpcClient.locations.updateBdnbData.mutate({
        uuid: this.operation().location.uuid,
      });

      this.toastService.open(
        "success",
        actionAttempted,
        "Les données du site ont été mises à jour",
      );
    } catch (e) {
      await trpcClient.locations.markAsBdnbFailure.mutate({
        uuid: this.operation().location.uuid,
      });

      this.toastService.open(
        "error",
        actionAttempted,
        "L'adresse du site n'a pas pu être analysée",
      );
    }

    this.operationService.refresh();
  }

  async editLocation(highlightXFactors?: XFactorsKey[]) {
    const location = this.operation().location;

    if (!isOpteeLocation(location)) {
      this.toastService.open(
        "warn",
        "Action indisponible",
        "L’édition n’est possible que pour les sites Optee. " + contactSupport,
      );
      return;
    }

    if (
      !this.permissionService.can("LOCATION_UPDATE") ||
      !this.authService.isAdminOptee()
    ) {
      this.toastService.open(
        "warn",
        "Permissions insuffisantes",
        "Vous n’avez pas l’autorisation de modifier ce site.",
      );
      return;
    }

    await this.dialogService.open(LocationEditFormDialogComponent, {
      data: {
        location,
        highlightXFactors,
        mode: "edit",
      },
    });
  }

  async openUploadQuoteDialog() {
    const { res } = await this.dialogService.open(QuoteUploadComponent, {
      data: {
        quoteUuid: this.operation().missingProQuoteUuid,
      },
    });
    if (res) {
      this.operationService.refresh();
    }
  }
}

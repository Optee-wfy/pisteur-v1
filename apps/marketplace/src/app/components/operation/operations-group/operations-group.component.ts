import { CurrencyPipe, PercentPipe } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from "@angular/core";
import type { OperationGroupKey } from "@optee/constants";
import { IconPlotComponent } from "@optee/icons";
import type { OperationRow, QuoteUuid } from "@optee/models";
import { isNotNullish } from "@optee/utils";
import type { PaginatorState } from "primeng/paginator";
import { Paginator } from "primeng/paginator";
import { OperationsGroupHeadComponent } from "../operations-group-head/operations-group-head.component";
import type {
  OperationListColumn,
  OperationRowAction,
} from "../operations-group-row/operations-group-row.component";
import { OperationsGroupRowComponent } from "../operations-group-row/operations-group-row.component";

@Component({
  selector: "mkp-operations-group",
  template: `
    @if (showTable()) {
      <div
        class="overflow-auto rounded-lg"
        [class.border-2]="displayMode() === 'leads'"
        [class.border-amber-200]="displayMode() === 'leads'"
      >
        <table class="table-fixed">
          <thead
            class="font-display text-left text-sm tracking-tight"
            [class.bg-amber-100]="displayMode() === 'leads'"
            [class.border-amber-200]="displayMode() === 'leads'"
            [class.border-b-2]="displayMode() === 'leads'"
            [class.text-black]="displayMode() === 'leads'"
            [class.text-gray-600]="displayMode() !== 'leads'"
          >
            <tr>
              <mkp-operations-group-head
                class="w-[320px]"
                [displayMode]="displayMode()"
              >
                Type d'opération
              </mkp-operations-group-head>

              @if (visibleColumns().includes("score")) {
                <mkp-operations-group-head
                  class="w-[60px]"
                  criteria="score"
                  (click)="toggleSort('score')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Score
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("locationBdnbStatus")) {
                <mkp-operations-group-head
                  class="w-[80px]"
                  criteria="locationBdnbStatus"
                  (click)="toggleSort('locationBdnbStatus')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  BDNB
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("sortablePhase")) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  [displayMode]="displayMode()"
                >
                  Statut
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("phaseEnum")) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="phaseEnum"
                  (click)="toggleSort('phaseEnum')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Statut
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("sortableCost")) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="sortableCost"
                  (click)="toggleSort('sortableCost')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Coût
                </mkp-operations-group-head>
              }

              @if (
                visibleColumns().includes("sortableEstimatedCostComparison")
              ) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="sortableEstimatedCostComparison"
                  (click)="toggleSort('sortableEstimatedCostComparison')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Coût estimé
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("sortableFunding")) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="sortableFunding"
                  (click)="toggleSort('sortableFunding')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Subventions
                </mkp-operations-group-head>
              }

              @if (
                visibleColumns().includes("sortableEstimatedFundingComparison")
              ) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="sortableEstimatedFundingComparison"
                  (click)="toggleSort('sortableEstimatedFundingComparison')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Subventions estimées
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("sortableRemainingAmount")) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="sortableRemainingAmount"
                  (click)="toggleSort('sortableRemainingAmount')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Reste à charge
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("estimatedEnergyImpact")) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="estimatedEnergyImpact"
                  (click)="toggleSort('estimatedEnergyImpact')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Impact/ROI
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("clientName")) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="clientName"
                  (click)="toggleSort('clientName')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Client
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("createdAt")) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="createdAt"
                  (click)="toggleSort('createdAt')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Date de commande
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("plannedBudgetRange")) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="plannedBudgetRange"
                  (click)="toggleSort('plannedBudgetRange')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Budget prévisionnel
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("sortableSector")) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="sortableSector"
                  (click)="toggleSort('sortableSector')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Type
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("locationCreationDate")) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="locationCreationDate"
                  (click)="toggleSort('locationCreationDate')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  Année
                </mkp-operations-group-head>
              }

              @if (visibleColumns().includes("dpeLabel")) {
                <mkp-operations-group-head
                  class="w-[200px]"
                  criteria="dpeLabel"
                  (click)="toggleSort('dpeLabel')"
                  [displayMode]="displayMode()"
                  [sortCriteria]="sortCriteria()"
                  [sortCriteriaDirection]="sortCriteriaDirection()"
                >
                  DPE
                </mkp-operations-group-head>
              }

              @if (!hideActions()) {
                <mkp-operations-group-head
                  class="w-24"
                  [displayMode]="displayMode()"
                >
                  Actions
                </mkp-operations-group-head>
              }
            </tr>
          </thead>

          <tbody
            class="rounded-lg"
            [class.border-l-4]="displayMode() !== 'leads'"
            [class.border-primary-700]="displayMode() !== 'leads'"
            [class.border]="displayMode() !== 'leads'"
          >
            @for (operation of paginatedOperations(); track operation.uuid) {
              <mkp-operations-group-row
                (categoryClick)="operationClick.emit(operation)"
                [actions]="actions()"
                [displayMode]="displayMode()"
                [hideLaunchDate]="hideLaunchDate()"
                [operation]="operation"
                [preventSimulation]="preventSimulation()"
                [visibleColumns]="visibleColumns()"
              />
            }

            @if (!hideTotal()) {
              <tr
                class="border-b border-r border-gray-300 bg-gray-100 text-left text-sm"
              >
                <th class="font-display font-normal text-gray-600">
                  Total des opérations
                </th>
                @if (visibleColumns().includes("score")) {
                  <th></th>
                }
                @if (visibleColumns().includes("locationBdnbStatus")) {
                  <th></th>
                }
                @if (visibleColumns().includes("sortablePhase")) {
                  <th></th>
                }
                @if (visibleColumns().includes("phaseEnum")) {
                  <th></th>
                }
                @if (visibleColumns().includes("sortableCost")) {
                  <th class="font-medium">
                    {{ totalCost() | currency: "EUR" : "symbol" : "1.0-0" }}
                  </th>
                }
                @if (
                  visibleColumns().includes("sortableEstimatedCostComparison")
                ) {
                  <th></th>
                }
                @if (visibleColumns().includes("sortableFunding")) {
                  <th class="font-medium text-green-700">
                    {{ totalFunding() | currency: "EUR" : "symbol" : "1.0-0" }}
                  </th>
                }
                @if (
                  visibleColumns().includes(
                    "sortableEstimatedFundingComparison"
                  )
                ) {
                  <th></th>
                }
                @if (visibleColumns().includes("sortableRemainingAmount")) {
                  <th class="font-medium">
                    {{
                      totalRemainingAmount()
                        | currency: "EUR" : "symbol" : "1.0-0"
                    }}
                  </th>
                }
                @if (visibleColumns().includes("estimatedEnergyImpact")) {
                  <th class="font-medium text-green-700">
                    {{ totalImpact() | percent: "1.0-0" }}
                  </th>
                }
                @if (!hideActions()) {
                  <th></th>
                }
                @if (visibleColumns().includes("clientName")) {
                  <th></th>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      <p-paginator
        (onPageChange)="onPageChange($event)"
        [class.bg-gradient-to-br]="displayMode() === 'leads'"
        [class.from-amber-50]="displayMode() === 'leads'"
        [class.to-orange-50]="displayMode() === 'leads'"
        [first]="firstRowOffset()"
        [rows]="rowsPerPage()"
        [rowsPerPageOptions]="rowsPerPageOptions()"
        [showFirstLastIcon]="false"
        [totalRecords]="totalOperations()"
      />
    }

    @if (totalOperations() === 0) {
      <div
        class="font-display flex items-center justify-center gap-2 bg-gray-100 p-4 text-sm font-normal text-gray-600"
      >
        <icon-plot class="size-8 grayscale-[70%]" colorMode="colored" />
        Pas d'opérations pour le moment.
      </div>
    }
  `,
  styles: `
    table {
      @apply min-w-full bg-white;

      th {
        @apply px-4 py-2;
      }
    }
  `,
  imports: [
    OperationsGroupRowComponent,
    OperationsGroupHeadComponent,
    IconPlotComponent,
    CurrencyPipe,
    PercentPipe,
    Paginator,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsGroupComponent {
  operationClick = output<OperationRow>();

  operations = input.required<
    (OperationRow & {
      missingProQuoteUuid?: QuoteUuid | null;
    })[]
  >();

  visibleColumns = input.required<OperationListColumn[]>();
  actions = input.required<OperationRowAction[]>();
  groupKeyFilter = input<OperationGroupKey>();
  hideLaunchDate = input(false, { transform: booleanAttribute });
  hideActions = input(false, { transform: booleanAttribute });
  hideTotal = input(false, { transform: booleanAttribute });
  preventSimulation = input(false, { transform: booleanAttribute });
  rowsPerPageOptions = input<number[]>([10, 20, 50]);
  displayMode = input<"leads" | "marketplace">("marketplace");
  rowsPerPage = model(10);
  currentPage = model(0);
  sortCriteria = model<OperationListColumn | null>(null);
  sortCriteriaDirection = model<"asc" | "desc">("asc");

  firstRowOffset = computed(() => this.currentPage() * this.rowsPerPage());

  groupOperations = computed(() => {
    if (!this.groupKeyFilter()) {
      return this.operations();
    }

    return this.operations().filter(
      (operation) => operation.phase.category === this.groupKeyFilter(),
    );
  });

  sortedOperations = computed(() => {
    const sortCriteria = this.sortCriteria();
    const sortCriteriaDirection = this.sortCriteriaDirection();

    // We need to spread otherwise the sort() method will mutate the original array
    const groupOperations = [...this.groupOperations()];

    return groupOperations.sort((a, b) => {
      const aMissing = !!a.missingProQuoteUuid;
      const bMissing = !!b.missingProQuoteUuid;
      if (aMissing !== bMissing) {
        return aMissing ? -1 : 1;
      }

      if (b.isAlreadyOrdered && !a.isAlreadyOrdered) {
        return -1;
      }

      if (a.isAlreadyOrdered && !b.isAlreadyOrdered) {
        return 1;
      }

      if (sortCriteria === null) {
        return 0;
      }

      if (sortCriteria === "clientName") {
        if (!a.client || !b.client) {
          return 0;
        }
        const aValue = sortCriteriaDirection === "asc" ? a.client : b.client;
        const bValue = sortCriteriaDirection === "asc" ? b.client : a.client;
        return aValue.name.localeCompare(bValue.name);
      }

      const aValue = a[sortCriteria];
      const bValue = b[sortCriteria];

      if (!aValue || (typeof aValue == "number" && isNaN(aValue))) {
        return sortCriteriaDirection === "asc" ? -1 : 1;
      }

      if (!bValue || (typeof bValue == "number" && isNaN(bValue))) {
        return sortCriteriaDirection === "asc" ? 1 : -1;
      }

      if (aValue === bValue) {
        return 0;
      }

      if (sortCriteriaDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      }

      return aValue < bValue ? 1 : -1;
    });
  });

  paginatedOperations = computed(() => {
    const start = this.currentPage() * this.rowsPerPage();
    const end = start + this.rowsPerPage();

    return this.sortedOperations().slice(start, end);
  });

  totalOperations = computed(() => this.groupOperations().length);

  showTable = computed(() => this.totalOperations() > 0);

  totalCost = computed(() => {
    return this.groupOperations().reduce(
      (acc, operation) => acc + (operation.cost.value ?? 0),
      0,
    );
  });

  totalFunding = computed(() =>
    this.groupOperations().reduce(
      (acc, operation) => acc + (operation.funding.value ?? 0),
      0,
    ),
  );

  totalRemainingAmount = computed(() =>
    this.groupOperations().reduce(
      (acc, operation) => acc + (operation.remainingAmount.value ?? 0),
      0,
    ),
  );

  totalImpact = computed(() => {
    let consommation = 100;

    const estimatedEnergyImpacts = this.groupOperations()
      .map((o) => o.estimatedEnergyImpact)
      .filter(isNotNullish);

    for (const impact of estimatedEnergyImpacts) {
      const impactAppliedOnRemainingAmount = consommation * impact; // 100 * 0.16 = 16
      consommation = consommation - impactAppliedOnRemainingAmount; // 100 - 16 = 84
    }

    return (100 - consommation) / 100;
  });

  onPageChange(value: PaginatorState) {
    if (typeof value.rows !== "undefined") {
      this.rowsPerPage.set(value.rows);
    }

    if (typeof value.page !== "undefined") {
      this.currentPage.set(value.page);
    }
  }

  toggleSort(criteria: OperationListColumn) {
    this.sortCriteria.set(criteria);

    if (this.sortCriteriaDirection() === "asc") {
      this.sortCriteriaDirection.set("desc");
    } else {
      this.sortCriteriaDirection.set("asc");
    }
  }
}

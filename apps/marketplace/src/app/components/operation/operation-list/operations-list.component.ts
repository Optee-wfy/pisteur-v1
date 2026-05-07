import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  viewChildren,
} from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import type { OperationGroupKey } from "@optee/constants";
import {
  WAITING_FOR_QUOTE_LABEL,
  type InvoicePhaseLabel,
  type OperationHubspotCategory,
  type OperationPhaseLabel,
} from "@optee/constants";
import type { LocationUuid, OperationRow, QuoteUuid } from "@optee/models";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { SelectButton } from "primeng/selectbutton";
import { combineLatest, map, shareReplay, tap } from "rxjs";
import type { OperationListColumn } from "../operations-group-row/operations-group-row.component";
import { OperationsGroupComponent } from "../operations-group/operations-group.component";

@Component({
  selector: "mkp-operations-list",
  host: {
    class: "flex flex-col gap-6",
  },
  template: `
    <div class="flex flex-wrap items-center justify-between gap-2">
      <oui-title-tight>Opérations</oui-title-tight>

      <p-selectbutton
        class="p-selectButton--expanded max-w-lg"
        optionLabel="label"
        optionValue="value"
        [(ngModel)]="activeGroup"
        [options]="GROUP_OPTIONS()"
      />

      <ng-content select="[afterTitle]" />
    </div>
    <ng-content select="[underTitle]" />
    @if (activeGroup === "upcoming") {
      <mkp-operations-group
        groupKeyFilter="upcoming"
        (operationClick)="operationClick.emit($event)"
        [(rowsPerPage)]="rowsPerPage"
        [actions]="
          isProSection
            ? ['launch', 'details', 'upload-quote']
            : ['launch', 'details']
        "
        [operations]="(filteredOperations$ | async) ?? []"
        [preventSimulation]="isProSection"
        [visibleColumns]="visibleColumns()"
      />
    }

    @if (activeGroup === "in_progress") {
      <mkp-operations-group
        groupKeyFilter="in_progress"
        (operationClick)="operationClick.emit($event)"
        [(rowsPerPage)]="rowsPerPage"
        [actions]="['details']"
        [operations]="(filteredOperations$ | async) ?? []"
        [preventSimulation]="isProSection"
        [visibleColumns]="visibleColumns()"
      />
    }

    @if (activeGroup === "archived") {
      <mkp-operations-group
        groupKeyFilter="archived"
        (operationClick)="operationClick.emit($event)"
        [(rowsPerPage)]="rowsPerPage"
        [actions]="['launch', 'details']"
        [operations]="(filteredOperations$ | async) ?? []"
        [preventSimulation]="isProSection"
        [visibleColumns]="visibleColumns()"
      />
    }
  `,
  imports: [
    OperationsGroupComponent,
    ReactiveFormsModule,
    FormsModule,
    AsyncPipe,
    TitleTightComponent,
    SelectButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsListComponent {
  operationsGroups = viewChildren(OperationsGroupComponent);

  operationClick = output<OperationRow>();

  operations = input.required<
    (OperationRow & {
      missingProQuoteUuid?: QuoteUuid | null;
    })[]
  >();

  visibleColumns = input.required<OperationListColumn[]>();
  searchValue = input<string | null>(null);
  activeOperationTypes = model<OperationHubspotCategory[] | null>(null);
  selectedLocationUuid = input<LocationUuid | null>(null);
  activePhaseFilter = model<OperationPhaseLabel | InvoicePhaseLabel | null>(
    null,
  );

  rowsPerPage = model(20);

  protected readonly router = inject(Router);

  protected readonly isProSection = !this.router.url.startsWith("/client");

  protected activeGroup: OperationGroupKey = "upcoming";

  readonly GROUP_OPTIONS = computed(() => {
    const c = this.categoriesCount();
    return this.isProSection
      ? [
          { label: `En négociation (${c.upComing})`, value: "upcoming" },
          { label: `En cours (${c.inProgress})`, value: "in_progress" },
          { label: `Archivées (${c.archived})`, value: "archived" },
        ]
      : [
          { label: `À venir (${c.upComing})`, value: "upcoming" },
          { label: `En cours (${c.inProgress})`, value: "in_progress" },
          { label: `Archivées (${c.archived})`, value: "archived" },
        ];
  });

  sortedOperationsList$ = toObservable(this.operations).pipe(
    map((operations) => this.sortOperations(operations)),
  );

  upcomingOperationTooltip =
    "Envie de recevoir des devis ? Lancez votre opération en un clic sur l’icône bleue depuis ce tableau de bord.";

  filteredOperations$ = combineLatest([
    this.sortedOperationsList$,
    toObservable(this.searchValue),
    toObservable(this.activeOperationTypes),
    toObservable(this.activePhaseFilter),
    toObservable(this.selectedLocationUuid),
  ]).pipe(
    map(
      ([
        operations,
        searchValue,
        activeOperationTypes,
        activePhaseFilter,
        selectedLocationUUid,
      ]) => {
        return operations.filter((operation) => {
          const matchesAddressOrOperationOrClientName =
            !searchValue ||
            operation.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
            operation.label
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            operation.typeCategory
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            Boolean(
              operation.client?.name
                ?.toLowerCase()
                ?.includes(searchValue.toLowerCase()),
            );

          const hasSelectedStatus =
            !activePhaseFilter ||
            (activePhaseFilter === WAITING_FOR_QUOTE_LABEL
              ? operation.missingProQuoteUuid
              : !!operation.status.label &&
                activePhaseFilter === operation.status.label &&
                !operation.missingProQuoteUuid);

          const hasSelectedCategory =
            !activeOperationTypes ||
            !operation.category ||
            activeOperationTypes.includes(operation.category);

          const hasSelectedLocation =
            !selectedLocationUUid ||
            operation.location.uuid === selectedLocationUUid;

          return (
            matchesAddressOrOperationOrClientName &&
            hasSelectedCategory &&
            hasSelectedStatus &&
            hasSelectedLocation
          );
        });
      },
    ),
    tap(() => {
      // Reset pagination when filters change
      this.operationsGroups().forEach((group) => group.currentPage.set(0));
    }),
    shareReplay(1),
  );

  protected readonly categoriesCount$ = this.filteredOperations$.pipe(
    map((operations) => ({
      inProgress: operations.filter((op) => op.phase.category === "in_progress")
        .length,
      upComing: operations.filter((op) => op.phase.category === "upcoming")
        .length,
      archived: operations.filter((op) => op.phase.category === "archived")
        .length,
    })),
  );

  readonly categoriesCount = toSignal(this.categoriesCount$, {
    initialValue: { inProgress: 0, upComing: 0, archived: 0 },
  });

  sortOperations<T extends OperationRow>(operations: T[]) {
    return operations.sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
  }
}

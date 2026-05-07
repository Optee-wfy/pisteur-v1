import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import type { OperationHubspotCategory } from "@optee/constants";
import { OPERATION_TYPES_ARR } from "@optee/constants";
import {
  simulateOperationsFromLocation,
  type LocationUuid,
} from "@optee/models";
import { TagComponent } from "@optee/ui/components/atoms/tag/tag.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import { combineLatest, map, shareReplay } from "rxjs";
import { LocationService } from "../../../services/location.service";
import { OperationService } from "../../../services/operation.service";
import { OperationTagComponent } from "../operation-tag/operation-tag.component";
import { OperationsCatalogSortedComponent } from "../operations-catalog-sorted/operations-catalog-sorted.component";

@Component({
  selector: "mkp-operations-catalog",
  host: {
    class: "flex flex-col gap-10",
  },
  template: `
    @if (hydratedOperations$ | async; as operations) {
      <div class="flex gap-2">
        <oui-tag
          class="shrink-0 cursor-pointer"
          variant="neutral"
          (click)="activeTypeFilter.set(null)"
          [isActive]="activeTypeFilter() === null"
        >
          Toutes les opérations
        </oui-tag>

        @for (
          operationType of operationTypeFilters;
          track operationType.label
        ) {
          <mkp-operation-tag
            class="cursor-pointer"
            (click)="activeTypeFilter.set(operationType.hsOperationCategory)"
            [isActive]="
              activeTypeFilter() === operationType.hsOperationCategory
            "
            [operationType]="operationType"
          />
        }
      </div>
      @if (operations.length) {
        <mkp-operations-catalog-sorted
          sortProperty="estimatedPaybackPeriod"
          [operations]="operations"
        />
        <mkp-operations-catalog-sorted
          sortProperty="funding"
          [operations]="operations"
        />
        <mkp-operations-catalog-sorted
          sortProperty="estimatedEnergyImpact"
          [operations]="operations"
        />
      } @else {
        <oui-message severity="info">
          Aucune opération ne peut être simulée pour votre sélection de sites.
          Si vous pensez qu’il s’agit d’une erreur et que vous souhaitez lancer
          une opération de ce type, contactez notre équipe pour obtenir de
          l'aide.
        </oui-message>
      }
    }
  `,
  imports: [
    OperationsCatalogSortedComponent,
    OperationTagComponent,
    TagComponent,
    MessageComponent,
    AsyncPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsCatalogComponent {
  selectedLocationUuid = input<LocationUuid | null>(null);

  protected readonly locationService = inject(LocationService);
  protected readonly operationService = inject(OperationService);
  protected readonly toastService = inject(ToastService);

  operationTypeFilters = OPERATION_TYPES_ARR.filter(
    (ot) => ot.showAsMarketplaceFilter,
  );

  activeTypeFilter = signal<OperationHubspotCategory | null>(null);

  completed = signal<number>(0);

  alreadyOrderedOperations$ = this.operationService.all$.pipe(
    map((rows) => rows.map((r) => r.operation)),
  );

  operations$ = combineLatest([
    this.locationService.allForClient$,
    toObservable(this.activeTypeFilter),
    toObservable(this.selectedLocationUuid),
  ]).pipe(
    map(([locations, activeTypeFilter, selectedLocationUuid]) =>
      locations
        .filter(
          (location) =>
            !selectedLocationUuid || location.uuid === selectedLocationUuid,
        )
        .map((location) => {
          try {
            return simulateOperationsFromLocation(
              location,
              activeTypeFilter ? [activeTypeFilter] : null,
            );
          } catch (e) {
            return null;
          }
        })
        .filter(isNotNullish),
    ),
    map((operations) => operations.flat()),
    shareReplay(1),
  );

  hydratedOperations$ = combineLatest([
    this.operations$,
    this.alreadyOrderedOperations$,
  ]).pipe(
    map(([operations, alreadyOrderedOperations]) => {
      return operations.map((operation) => {
        operation.isAlreadyOrdered = !!alreadyOrderedOperations.find(
          (orderedOperation) => orderedOperation.isEqual(operation),
        );
        return operation;
      });
    }),
  );
}

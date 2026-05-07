import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import type { OperationHubspotPrestationId } from "@optee/constants";
import { OPERATION_SUBTYPES } from "@optee/constants";
import { Client, Location, OperationRow } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import { MultiSelect } from "primeng/multiselect";
import {
  catchError,
  combineLatest,
  filter,
  map,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
} from "rxjs";
import trpcClient from "../../../../trpc-client";
import { AppService } from "../../../services/app.service";
import { OperationService } from "../../../services/operation.service";
import type { OperationListColumn } from "../operations-group-row/operations-group-row.component";
import { OperationsGroupComponent } from "../operations-group/operations-group.component";

@Component({
  selector: "mkp-operations-re-simulation-admin",
  template: `
    <oui-bob class="flex-auto" heading="Opérations à resimuler">
      <div class="flex gap-2" aside>
        @if (((operationsTypes$ | async) ?? []).length > 0) {
          @if (operationsToSimulate$ | async; as operationsToSimulate) {
            <oui-button
              variant="primary"
              (click)="simulate(operationsToSimulate)"
              [disabled]="operationsToSimulate.length === 0"
            >
              Simuler {{ operationsToSimulate.length }} opérations
            </oui-button>
          }

          @if (operationsToReSimulate$ | async; as operationsToReSimulate) {
            <oui-button
              variant="primary"
              (click)="simulate(operationsToReSimulate)"
              [disabled]="operationsToReSimulate.length === 0"
            >
              (re)Simuler {{ operationsToReSimulate.length }} opérations
            </oui-button>
          }
        }
      </div>

      <div class="flex flex-col gap-4">
        <p-multiSelect
          emptyFilterMessage="Aucun résultat"
          placeholder="Opérations"
          [formControl]="operationTypesControl"
          [options]="OPERATION_TYPES_LABELS"
          [showClear]="true"
        />

        @if (operationsToSimulate$ | async; as operationsToSimulate) {
          <oui-title-tight [value]="operationsToSimulate.length">
            Opérations à simuler
          </oui-title-tight>

          <mkp-operations-group
            [actions]="[]"
            [operations]="operationsToSimulate"
            [rowsPerPage]="8"
            [visibleColumns]="visibleColumns"
          />
        }

        @if (operationsToReSimulate$ | async; as operationsToReSimulate) {
          <oui-title-tight [value]="operationsToReSimulate.length">
            Opérations à (re)simuler
          </oui-title-tight>

          <mkp-operations-group
            [actions]="[]"
            [operations]="operationsToReSimulate"
            [rowsPerPage]="8"
            [visibleColumns]="visibleColumns"
          />
        }
      </div>
    </oui-bob>
  `,
  styles: `
    p-multiSelect {
      width: 400px;
    }
  `,
  imports: [
    BobComponent,
    AsyncPipe,
    ButtonComponent,
    TitleTightComponent,
    MultiSelect,
    ReactiveFormsModule,
    OperationsGroupComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsReSimulationAdminComponent {
  protected readonly operationService = inject(OperationService);
  protected readonly toastService = inject(ToastService);
  protected readonly appService = inject(AppService);

  OPERATION_TYPES_LABELS = OPERATION_SUBTYPES.map((subType) => ({
    label: subType.label,
    value: subType.hsPrestationId,
  }));

  operationTypesControl = new FormControl<OperationHubspotPrestationId[]>([]);

  private readonly refresh$ = new Subject<void>();

  visibleColumns: OperationListColumn[] = [
    "sortableEstimatedCostComparison",
    "sortableEstimatedFundingComparison",
  ];

  operationsTypes$ = this.operationTypesControl.valueChanges.pipe(
    startWith(this.operationTypesControl.value),
    filter(isNotNullish),
  );

  private operations$ = combineLatest([
    this.operationsTypes$,
    this.refresh$.pipe(startWith("")),
  ]).pipe(
    tap(() => this.appService.isLoading.set(true)),
    switchMap(([operationTypes]) =>
      trpcClient.operations.getAllByOperationTypes.query({ operationTypes }),
    ),
    map((rows) => {
      return rows
        .map((row) => {
          if (!row.hsLocation || !row.hsClient) {
            return null;
          }

          const location = Location.init(row.hsLocation);
          const client = Client.init(row.hsClient);

          if (!location || !client) {
            return null;
          }

          const operation = OperationRow.initWithAssociations({
            input: row.hsOperation,
            location,
            client,
          });

          if (!operation) {
            return null;
          }

          return operation;
        })
        .filter(isNotNullish);
    }),
    map((operations) => this.operationService.sortForSimulation(operations)),
    map((operations) =>
      operations.filter((r) => r.hasRequiredDataForSimulation),
    ),
    catchError(() => of([])),
    tap(() => this.appService.isLoading.set(false)),
    shareReplay(1),
  );

  operationsToSimulate$ = this.operations$.pipe(
    map((rows) =>
      rows.filter((r) => r.operation.needsSimulation).map((r) => r.operation),
    ),
    shareReplay(1),
  );

  operationsToReSimulate$ = this.operations$.pipe(
    map((rows) =>
      rows.filter((r) => r.operation.needsResimulate).map((r) => r.operation),
    ),
    shareReplay(1),
  );

  async simulate(operations: OperationRow[]) {
    await this.operationService.showSimulationLoader(operations);

    this.toastService.open(
      "success",
      "Simulation",
      `${operations.length} opérations simulées avec succès`,
    );

    this.refresh$.next();
  }
}

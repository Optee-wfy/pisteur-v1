import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Client, Location, OperationRow } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import {
  catchError,
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
import { LocationService } from "../../../services/location.service";
import { OperationService } from "../../../services/operation.service";
import type { OperationListColumn } from "../operations-group-row/operations-group-row.component";
import { OperationsGroupComponent } from "../operations-group/operations-group.component";

@Component({
  selector: "mkp-operations-no-simulation-admin",
  template: `
    <oui-bob class="flex-auto" [heading]="(heading$ | async) ?? ''">
      <div class="flex items-center gap-2" aside>
        @if (operationsToSimulate$ | async; as operationsToSimulate) {
          @if (operationsToSimulate.length > 0) {
            <oui-button
              variant="primary"
              (click)="simulate(operationsToSimulate)"
            >
              Simuler {{ operationsToSimulate.length }} opérations
            </oui-button>
          }
        }

        @if (
          locationsThatNeedBdnbCheck$ | async;
          as locationsThatNeedBdnbCheck
        ) {
          @if (locationsThatNeedBdnbCheck.length > 0) {
            <oui-button
              variant="litePrimary"
              (click)="updateBdnb(locationsThatNeedBdnbCheck)"
            >
              Enrichir {{ locationsThatNeedBdnbCheck.length }} adresses avec la
              BDNB
            </oui-button>
          }
        }
      </div>

      <oui-title-tight>Opérations à simuler</oui-title-tight>

      <mkp-operations-group
        [actions]="[]"
        [operations]="(operations$ | async) ?? []"
        [rowsPerPage]="30"
        [visibleColumns]="visibleColumns"
      />
    </oui-bob>
  `,
  imports: [
    BobComponent,
    AsyncPipe,
    ButtonComponent,
    TitleTightComponent,
    ReactiveFormsModule,
    OperationsGroupComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsNoSimulationAdminComponent {
  protected readonly locationService = inject(LocationService);
  protected readonly operationService = inject(OperationService);
  protected readonly toastService = inject(ToastService);
  protected readonly appService = inject(AppService);

  private readonly refresh$ = new Subject<void>();

  visibleColumns: OperationListColumn[] = [
    "locationBdnbStatus",
    "sortableCost",
    "sortableFunding",
    "sortableRemainingAmount",
  ];

  operations$ = this.refresh$.pipe(
    startWith(""),
    tap(() => this.appService.isLoading.set(true)),
    switchMap(() => trpcClient.operations.getAllToSimulate.query()),
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
    catchError(() => of([])),
    tap(() => this.appService.isLoading.set(false)),
    shareReplay(1),
  );

  operationsToSimulate$ = this.operations$.pipe(
    map((operations) => this.operationService.sortForSimulation(operations)),
    map((rows) =>
      rows
        .filter((r) => r.needsSimulation && r.hasRequiredDataForSimulation)
        .map((r) => r.operation),
    ),
    shareReplay(1),
  );

  locations$ = this.operations$.pipe(
    map((operations) => {
      const locationMap = new Map<string, Location>();
      operations.forEach((operation) => {
        if (operation.location && !locationMap.has(operation.location.uuid)) {
          locationMap.set(operation.location.uuid, operation.location);
        }
      });
      return Array.from(locationMap.values());
    }),
    shareReplay(1),
  );

  locationsThatNeedBdnbCheck$ = this.locations$.pipe(
    map((locations) => locations.filter((l) => l.needsBdnbCheck)),
    shareReplay(1),
  );

  count$ = this.operations$.pipe(map((operations) => operations.length));

  heading$ = this.count$.pipe(
    map((count) => `Opérations sans simulation (${count})`),
  );

  async updateBdnb(locationsThatNeedBdnbCheck: Location[]) {
    await this.locationService.showBdnbLoader(locationsThatNeedBdnbCheck);
  }

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

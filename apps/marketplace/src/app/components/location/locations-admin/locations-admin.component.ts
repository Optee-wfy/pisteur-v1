import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DialogService } from "@optee/dialog";
import { Location } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { isNotNullish } from "@optee/utils";
import {
  Subject,
  catchError,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from "rxjs";
import trpcClient from "../../../../trpc-client";
import { AppService } from "../../../services/app.service";
import { LocationService } from "../../../services/location.service";
import { LocationEditFormDialogComponent } from "../location-form-dialog/location-edit-form-dialog.component";
import { LocationsGroupAdminComponent } from "../locations-group-admin/locations-group-admin.component";

@Component({
  selector: "mkp-locations-admin",
  template: `
    <oui-bob class="flex-auto" [heading]="(heading$ | async) ?? ''">
      <div class="flex items-center gap-2" aside>
        @if (locationsBdnbPrune$ | async; as locationsBdnbPrune) {
          @if (locationsBdnbPrune.length > 0) {
            <oui-button
              variant="litePrimary"
              (click)="updateBdnb(locationsBdnbPrune)"
            >
              Enrichir {{ locationsBdnbPrune.length }} adresses avec la BDNB
            </oui-button>
          }
        }
      </div>

      <mkp-locations-group-admin
        theme="green"
        (locationClick)="openAddLocationModal($event)"
        [locations]="(locationsBdnbPruneAndBlocked$ | async) ?? []"
        [rowsPerPage]="50"
        [visibleColumns]="[
          'bdnbFailureEmoji',
          'surfaceArea',
          'facadeArea',
          'glazingArea',
          'nbStoreys',
          'nbUnits',
          'nbBuildings',
          'mainSector',
          'climateZone',
        ]"
      />
    </oui-bob>
  `,
  imports: [
    BobComponent,
    ButtonComponent,
    LocationsGroupAdminComponent,
    AsyncPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsAdminComponent {
  protected readonly dialogService = inject(DialogService);
  protected readonly locationService = inject(LocationService);
  protected readonly appService = inject(AppService);

  private readonly refresh$ = new Subject<void>();

  locationsBdnbPruneAndBlocked$ = this.refresh$.pipe(
    startWith(""),
    tap(() => this.appService.isLoading.set(true)),
    switchMap(() => trpcClient.locations.getAllWithoutBdnb.query()),
    map((locations) => locations.map(Location.init).filter(isNotNullish)),
    catchError(() => of([])),
    tap(() => this.appService.isLoading.set(false)),
    shareReplay(1),
  );

  locationsBdnbPrune$ = this.locationsBdnbPruneAndBlocked$.pipe(
    map((locations) => locations.filter((location) => location.needsBdnbCheck)),
    shareReplay(1),
  );

  heading$ = this.locationsBdnbPruneAndBlocked$.pipe(
    map((locations) => `Sites sans données BDNB (${locations.length})`),
  );

  openAddLocationModal(location: Location) {
    this.dialogService.open(LocationEditFormDialogComponent, {
      data: { location, mode: "edit" },
    });
  }

  async updateBdnb(locations: Location[]) {
    await this.locationService.showBdnbLoader(locations);
    this.refresh$.next();
  }
}

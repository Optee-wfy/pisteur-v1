import { AsyncPipe } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  EventEmitter,
  inject,
  input,
  Output,
} from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { DialogService } from "@optee/dialog";
import { IconPlusComponent } from "@optee/icons";
import type { Location } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { combineLatest, map } from "rxjs";
import { AuthService } from "../../../services/auth.service";
import { LocationService } from "../../../services/location.service";
import { OperationService } from "../../../services/operation.service";
import { LocationCardComponent } from "../location-card/location-card.component";
import type { LocationsClientFilters } from "../location-filter-client/location-filter-client.component";
import { LocationCreateFormDialogComponent } from "../location-form-dialog/location-create-form-dialog.component";

@Component({
  selector: "mkp-locations-list",
  host: {
    class: "flex flex-col gap-4 lg:gap-6",
  },
  template: `
    <div class="flex flex-col gap-4 lg:flex-row">
      <div>
        <oui-title-tight [value]="locations().length">
          Tous mes sites
        </oui-title-tight>

        @if (description(); as description) {
          <p class="m-0 max-w-screen-sm text-sm text-gray-600">
            {{ description }}
          </p>
        }
      </div>

      @if (showAdd()) {
        <oui-button
          class="ml-auto"
          full
          variant="primary"
          (click)="openAddLocationModal()"
        >
          <icon-plus class="size-4" />
          Ajouter un site
        </oui-button>
      }
    </div>

    <div class="flex flex-col gap-4 lg:gap-6">
      @for (location of filteredLocations$ | async; track location.uuid) {
        <mkp-location-card
          (click)="locationClick.emit(location)"
          [editable]="editable()"
          [location]="location"
        />
      }
    </div>
  `,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    LocationCardComponent,
    TitleTightComponent,
    IconPlusComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsListComponent {
  @Output() locationClick = new EventEmitter<Location>();

  autoOpenModalEffect = effect(() => {
    const locations = this.locations();

    if (locations.length === 0 && !this.dialogService.isDialogOpen()) {
      this.openAddLocationModal();
    }
  });

  locations = input.required<Location[]>();
  filters = input<LocationsClientFilters | null>();
  heading = input<string>();
  description = input<string>();
  showAdd = input(false, { transform: booleanAttribute });
  editable = input(false, { transform: booleanAttribute });

  protected readonly locationService = inject(LocationService);
  protected readonly operationService = inject(OperationService);
  protected readonly dialogService = inject(DialogService);
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  filteredLocations$ = combineLatest([
    toObservable(this.locations),
    toObservable(this.filters),
    this.operationService.all$,
  ]).pipe(
    map(([locations, filters, operations]) => {
      if (!filters) {
        return locations;
      }

      const searchTerm = (filters.address || "").toLowerCase().trim();

      return locations.filter((location: Location) => {
        const operationCount = operations.filter(
          (row) =>
            row.operation.location.uuid === location.uuid &&
            row.operation.isInProgress,
        ).length;

        const matchesDealsFilter =
          !filters?.deals?.length ||
          (filters.deals === "avec" && operationCount > 0) ||
          (filters.deals === "sans" && operationCount === 0);

        const matchesEnergyTypesFilter =
          !filters?.energyTypes?.length ||
          (location.energyType &&
            filters.energyTypes.includes(location.energyType));

        const matchesDpeFilter =
          !filters?.dpe?.length ||
          (location.dpeLabel && filters.dpe.includes(location.dpeLabel));

        const matchesSectorsFilter =
          !filters?.sectors?.length ||
          (location.sector && filters.sectors.includes(location.sector));

        const matchesHeatingSystemFilter =
          !filters?.heatingSystem?.length ||
          (location.heatingSystem &&
            filters.heatingSystem.includes(location.heatingSystem));

        const matchesSearchTerm =
          location.name?.toLowerCase().includes(searchTerm) ||
          location.address.toLowerCase().includes(searchTerm);

        return (
          matchesDealsFilter &&
          matchesEnergyTypesFilter &&
          matchesDpeFilter &&
          matchesSectorsFilter &&
          matchesHeatingSystemFilter &&
          matchesSearchTerm
        );
      });
    }),
  );

  async openAddLocationModal() {
    const { res: locationUuid } = await this.dialogService.open(
      LocationCreateFormDialogComponent,
      {
        data: {
          mode: "create",
          source: "Sites",
        },
      },
    );

    if (this.authService.isAdminOptee()) {
      return;
    }

    const locations = await this.locationService.getAllForClient();

    const location = locations[0];

    // They just created their first location, let's navigate to their "Explorer" page
    if (location && locations.length === 1 && locationUuid) {
      this.operationService.activeLocationUuid.set(locationUuid);
      this.router.navigate(["/client/explorer"]);
    }
  }
}

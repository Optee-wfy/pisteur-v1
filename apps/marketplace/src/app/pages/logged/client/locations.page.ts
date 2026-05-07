import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  model,
  viewChild,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { AT_RISK_DPE_LABELS } from "@optee/constants";
import type { Location } from "@optee/models";
import { RadarMeetComponent } from "@optee/ui/components/organisms/radar-meet/radar-meet.component";
import type { LocationsClientFilters } from "../../../components/location/location-filter-client/location-filter-client.component";
import { LocationsFilterClientComponent } from "../../../components/location/location-filter-client/location-filter-client.component";
import { LocationsListComponent } from "../../../components/location/locations-list/locations-list.component";
import { LocationService } from "../../../services/location.service";
import { OperationService } from "../../../services/operation.service";
import { PermissionService } from "../../../services/permission.service";

const LOCATIONS_LIST_PAGE_DPE_QUERY_PARAM = "showAtRiskLocations";

export type LocationsListPageQueryParams = {
  [LOCATIONS_LIST_PAGE_DPE_QUERY_PARAM]?: boolean;
};

@Component({
  selector: "mkp-locations-page",
  host: {
    class: "max-w-app flex flex-col gap-8 m-auto p-4 xl:p-10",
  },
  template: `
    <div class="flex flex-col gap-4 lg:flex-row lg:justify-center lg:gap-10">
      <mkp-locations-filter-client
        class="lg:max-w-96 lg:flex-1"
        (filters)="activeFilters.set($event)"
      />
      <mkp-locations-list
        class="lg:flex-[3]"
        description="Retrouvez ici tous vos sites enregistrés ainsi que leurs caractéristiques et performances énergétiques. Vous pouvez afficher le détail des opérations liées à chaque site."
        (locationClick)="showOperations($event)"
        [editable]="permissionService.can('LOCATION_UPDATE')"
        [filters]="activeFilters()"
        [locations]="(locationService.allForClient$ | async) ?? []"
        [showAdd]="permissionService.canCreateLocation()"
      />
    </div>

    <oui-radar-meet />
  `,
  imports: [
    LocationsListComponent,
    AsyncPipe,
    LocationsFilterClientComponent,
    RadarMeetComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LocationsPageComponent {
  protected readonly filtersCmp = viewChild(LocationsFilterClientComponent);

  protected readonly router = inject(Router);
  protected readonly locationService = inject(LocationService);
  protected readonly operationService = inject(OperationService);
  protected readonly permissionService = inject(PermissionService);
  protected readonly route = inject(ActivatedRoute);

  protected readonly updateTabEffect = effect(() => {
    const showAtRiskLocationsParam =
      this.route.snapshot.queryParams[LOCATIONS_LIST_PAGE_DPE_QUERY_PARAM];

    if (showAtRiskLocationsParam) {
      this.filtersCmp()?.locationFilterForm.patchValue({
        dpe: AT_RISK_DPE_LABELS,
      });
    }
  });

  activeFilters = model<LocationsClientFilters | null>(null);
  allOperations = toSignal(this.operationService.all$);

  showOperations(location: Location) {
    this.operationService.activeLocationUuid.set(location.uuid);

    const count = (this.allOperations() ?? []).filter(
      (row) =>
        row.operation.location.uuid === location.uuid &&
        row.operation.isInProgress,
    ).length;

    if (count === 0) {
      this.router.navigate(["/client/explorer"]);
    } else {
      this.router.navigate(["/client/piloter"]);
    }
  }
}

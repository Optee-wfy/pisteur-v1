import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { PlacesTableComponent } from "../../../../../feats/prospect/components/places/places-table/places-table.component";
import { PlacesParamsService } from "../../../../../feats/prospect/services/places-filters.service";

@Component({
  selector: "mkp-place-list-page",
  host: { class: "block h-screen w-full min-w-0 overflow-hidden" },
  template: `
    <mkp-places-table
      showPlaces="new"
      showSelection
      [(filters)]="paramsService.activeFilters"
      [(pagination)]="paramsService.activePaginationProspect"
    />
  `,
  imports: [PlacesTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceListPage {
  protected readonly paramsService = inject(PlacesParamsService);
}

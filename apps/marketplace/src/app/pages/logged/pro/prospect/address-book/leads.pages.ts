import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LeadsTableComponent } from "apps/marketplace/src/app/feats/prospect/components/leads/leads-table.component";
import { PlacesParamsService } from "../../../../../feats/prospect/services/places-filters.service";

@Component({
  selector: "mkp-address-book-leads-page",
  host: { class: "h-screen" },
  template: `
    <mkp-leads-table
      [(filters)]="paramsService.activeFilters"
      [(pagination)]="paramsService.activePaginationAddressBook"
    />
  `,
  imports: [LeadsTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressBookLeadsPage {
  protected readonly paramsService = inject(PlacesParamsService);
}

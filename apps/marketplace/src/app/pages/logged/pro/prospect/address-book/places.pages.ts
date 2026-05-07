import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { PlacesTableComponent } from "apps/marketplace/src/app/feats/prospect/components/places/places-table/places-table.component";
import { PlacesParamsService } from "../../../../../feats/prospect/services/places-filters.service";

@Component({
  selector: "mkp-address-book-places-page",
  host: { class: "h-screen" },
  template: `
    <mkp-places-table
      showPlaces="unlocked"
      [(filters)]="paramsService.activeFilters"
      [(pagination)]="paramsService.activePaginationAddressBook"
      [emptyListMessage]="emptyListMessage"
    />
  `,
  imports: [PlacesTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressBookPlacesPage {
  protected readonly paramsService = inject(PlacesParamsService);
  protected readonly emptyListMessage = `Aucun lieu dans votre carnet d'adresses. \n Ajoutez des lieux pour les retrouver facilement lors de vos prochaines recherches.`;
}

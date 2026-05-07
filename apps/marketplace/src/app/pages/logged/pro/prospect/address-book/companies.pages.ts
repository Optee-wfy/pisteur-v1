import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LegalEntitiesTableComponent } from "../../../../../feats/prospect/components/legal-entities/legal-entities-table/legal-entities-table.component";
import { LegalEntitiesParamsService } from "../../../../../feats/prospect/services/legal-entities-filters.service";

@Component({
  selector: "mkp-address-book-companies-page",
  host: { class: "h-screen" },
  template: `
    <mkp-legal-entities-table
      showLegalEntities="unlocked"
      [(filters)]="paramsService.activeFilters"
      [(pagination)]="paramsService.activePaginationAddressBook"
      [emptyListMessage]="emptyListMessage"
    />
  `,
  imports: [LegalEntitiesTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressBookCompaniesPage {
  protected readonly paramsService = inject(LegalEntitiesParamsService);

  protected readonly emptyListMessage = `Aucune entreprise dans votre carnet. \n Ajoutez des entreprises pour les retrouver facilement lors de vos prochaines recherches.`;
}

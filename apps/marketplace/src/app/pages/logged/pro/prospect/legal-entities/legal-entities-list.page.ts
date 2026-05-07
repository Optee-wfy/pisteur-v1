import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LegalEntitiesTableComponent } from "../../../../../feats/prospect/components/legal-entities/legal-entities-table/legal-entities-table.component";
import { LegalEntitiesParamsService } from "../../../../../feats/prospect/services/legal-entities-filters.service";

@Component({
  selector: "mkp-legal-entities-list-page",
  host: { class: "h-screen" },
  template: `
    <mkp-legal-entities-table
      showLegalEntities="new"
      [(filters)]="paramsService.activeFilters"
      [(pagination)]="paramsService.activePaginationProspect"
    />
  `,
  imports: [LegalEntitiesTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntitiesListPage {
  protected readonly paramsService = inject(LegalEntitiesParamsService);
}

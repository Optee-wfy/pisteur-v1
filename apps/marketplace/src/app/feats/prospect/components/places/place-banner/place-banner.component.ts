import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";
import type { ExternalLocation } from "@optee/models";
import { PlaceDataGridComponent } from "../../place-data-grid/place-data-grid.component";
import {
  PLACE_SUMMARY_PART_2_PROP_CONFIG,
  PLACE_SUMMARY_PART_3_PROP_CONFIG,
  PLACE_SUMMARY_PROP_CONFIG,
} from "../../place-data-grid/place-props.constant";

@Component({
  selector: "mkp-place-banner",
  host: { class: "flex justify-evenly gap-4 w-full mx-auto" },
  template: `
    @let placeDetails = place();

    <mkp-place-data-grid
      class="h-full flex-1"
      compact
      hideCategoryLabel
      [category]="summaryDisplayedProps"
      [location]="placeDetails"
    />

    <mkp-place-data-grid
      class="hidden h-full flex-1 xl:!flex"
      compact
      hideCategoryLabel
      [category]="energyDisplayedProps"
      [class.md:flex]="!hideSecondCategory()"
      [location]="placeDetails"
    />

    <mkp-place-data-grid
      class="hidden h-full flex-1 2xl:!flex"
      compact
      hideCategoryLabel
      [category]="technicalDisplayedProps"
      [class.xl:flex]="!hideSecondCategory()"
      [location]="placeDetails"
    />
  `,
  imports: [PlaceDataGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceBannerComponent {
  readonly place = input.required<ExternalLocation>();
  readonly hideSecondCategory = input(false, { transform: booleanAttribute });

  protected readonly summaryDisplayedProps = {
    key: "characteristics" as const,
    label: "Informations principales",
    properties: PLACE_SUMMARY_PROP_CONFIG,
    dataSources: [],
  };

  protected readonly energyDisplayedProps = {
    key: "energy" as const,
    label: "Énergie",
    properties: PLACE_SUMMARY_PART_2_PROP_CONFIG,
    dataSources: [],
  };

  protected readonly technicalDisplayedProps = {
    key: "energy" as const,
    label: "Énergie (détails techniques)",
    properties: PLACE_SUMMARY_PART_3_PROP_CONFIG,
    dataSources: [],
  };
}

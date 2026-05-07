import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { buildAssetUrl } from "@optee/constants";
import type { ExternalLocation } from "@optee/models";
import { FormatAddressPipe } from "@optee/ui/pipes/format-address.pipe";
import { PlaceDataGridComponent } from "../../place-data-grid/place-data-grid.component";
import { EXTERNAL_BDNB_PROP_CONFIG } from "../../place-data-grid/place-props.constant";

@Component({
  selector: "mkp-place-sidebar",
  host: {
    class:
      "shadow-o flex w-full max-w-md flex-col gap-3 rounded-xl bg-white px-4 py-3",
  },
  template: `
    @let placeDetails = place();

    <img
      class="bg-primary-100 h-72 w-full flex-auto object-cover"
      width="600"
      [alt]="'Vue de ' + (placeDetails | formatAddress)"
      [src]="streetView()"
    />

    <div class="flex flex-col gap-4 overflow-y-auto">
      <div class="relative">
        <img
          class="bg-primary-100 h-72 w-full flex-auto object-cover"
          [src]="streetView()"
        />
      </div>

      @for (category of BDNB_PROP_CONFIG; track category.key) {
        <mkp-place-data-grid
          class="w-full lg:max-w-xl"
          [category]="category"
          [location]="place()"
        />
      }
    </div>
  `,
  imports: [FormatAddressPipe, PlaceDataGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceSidebarComponent {
  readonly place = input.required<ExternalLocation>();

  protected readonly streetView = computed(() => {
    const place = this.place();
    if (place?.streetViewUrl) {
      return place.streetViewUrl;
    }
    return buildAssetUrl("batiment.png");
  });

  protected readonly BDNB_PROP_CONFIG = EXTERNAL_BDNB_PROP_CONFIG;
}

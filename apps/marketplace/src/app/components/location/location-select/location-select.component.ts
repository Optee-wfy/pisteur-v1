import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Location } from "@optee/models";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import trpcClient from "../../../../trpc-client";
import { OperationService } from "../../../services/operation.service";
import { LocationStatsComponent } from "../location-stats/location-stats.component";
@Component({
  selector: "mkp-location-select",
  host: {
    class: "flex flex-col gap-6",
  },
  template: `
    <div class="flex flex-col gap-1">
      <oui-title-tight>
        @if (selectedLocation(); as selectedLocation) {
          {{ selectedLocation.address }}
        } @else {
          Tous mes sites
        }
      </oui-title-tight>

      @if (intro(); as intro) {
        <p class="m-0 text-sm text-gray-600">{{ intro }}</p>
      }
    </div>

    @if (selectedLocation(); as selectedLocation) {
      <oui-eve>
        <mkp-location-stats [locationUuid]="selectedLocation.uuid" />
      </oui-eve>
    }
  `,
  imports: [
    EveComponent,
    TitleTightComponent,
    LocationStatsComponent,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationSelectComponent {
  intro = input<string | null>();

  protected readonly operationService = inject(OperationService);

  // This one will have a "undefined" value while we're changing the active location
  selectedLocationNoKeep = resource({
    params: () => ({
      uuid: this.operationService.activeLocationUuid(),
    }),
    loader: async ({ params }) => {
      if (!params.uuid) {
        return Promise.resolve(null);
      }

      try {
        // We locationUuid might be outdated, wrong or null
        const res = await trpcClient.locations.get.query({
          uuid: params.uuid,
        });
        return Location.init(res.hsLocation);
      } catch (e) {
        this.operationService.clearActiveLocationUuid();
        return null;
      }
    },
  });

  // ...So here's a workaround to avoid having to deal with undefined values
  // Without this you'd have a rerender with "Tous mes sites" right after you change the active location
  selectedLocation = computed(() => this.selectedLocationNoKeep.value(), {
    equal: (_, b) => b === undefined,
  });
}

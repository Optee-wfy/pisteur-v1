import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  resource,
} from "@angular/core";
import type { LocationBdnbUuid } from "@optee/models";
import trpcClient from "../../../../../trpc-client";
import { PlaceLegalEntitiesTableComponent } from "../place-legal-entities-table/place-legal-entities-table.component";
import { LegalEntitiesLockedStateComponent } from "./legal-entities-locked-state.component";

@Component({
  selector: "mkp-legal-entities-tab",
  template: `
    @if (hasAccessToLocation.value()) {
      <!-- Table Legal Entities -->
      @if (legalEntities.value(); as legalEntities) {
        <mkp-place-legal-entities-table
          [address]="address()"
          [legalEntities]="legalEntities"
          [locationBdnbUuid]="locationBdnbUuid()"
        />
      }
    } @else {
      <mkp-legal-entities-locked-state
        (unlocked)="hasAccessToLocation.reload(); solicitationUnlocked.emit()"
        [address]="address()"
        [legalEntitiesCount]="legalEntitiesCount()"
        [locationBdnbUuid]="locationBdnbUuid()"
        [solicitationCount]="solicitationCount()"
      />
    }
  `,
  imports: [
    PlaceLegalEntitiesTableComponent,
    LegalEntitiesLockedStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntitiesTabComponent {
  readonly locationBdnbUuid = input.required<LocationBdnbUuid>();
  readonly address = input.required<string>();
  readonly legalEntitiesCount = input.required<number>();

  readonly solicitationCount = input<number | null>(null);
  readonly solicitationUnlocked = output<void>();

  protected readonly hasAccessToLocation = resource({
    params: () => this.locationBdnbUuid(),
    loader: async ({ params }) => {
      if (!params) {
        return false;
      }
      const response =
        await trpcClient.pros.hasAccessToLocationBdnb.query(params);
      return response;
    },
  });

  protected readonly legalEntities = resource({
    params: () => {
      if (!this.locationBdnbUuid() || !this.hasAccessToLocation.value()) {
        return undefined;
      }
      return this.locationBdnbUuid();
    },
    loader: async ({ params: locationBdnbUuid }) => {
      if (!locationBdnbUuid) {
        return [];
      }
      const response =
        await trpcClient.legalEntities.getAllByLocationBdnb.query(
          locationBdnbUuid,
        );
      return response.map((r) => ({
        ...r.legalEntity,
        nbRelatedLocations: r.nbRelatedLocations,
        nbRelatedPros: r.nbRelatedPros,
      }));
    },
  });
}

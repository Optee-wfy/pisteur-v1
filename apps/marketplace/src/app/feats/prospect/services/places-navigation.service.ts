import { Injectable, signal } from "@angular/core";
import type {
  LocationBdnbLegalEntityFilterPro,
  LocationBdnbLegalEntityFilterProSort,
} from "@optee/constants";
import type { LegalEntityUuid, LocationBdnbUuid } from "@optee/models";

@Injectable({
  providedIn: "root",
})
export class PlacesNavigationService {
  readonly locationsList = signal<LocationBdnbUuid[]>([]);

  readonly queryContext = signal<{
    page: number;
    pageSize: number;
    sort: LocationBdnbLegalEntityFilterProSort | null;
    show: "new" | "unlocked" | "all";
    legalEntityUuid: LegalEntityUuid | null;
    filters: LocationBdnbLegalEntityFilterPro | null;
  } | null>(null);

  private findLocationIndex(locationId: LocationBdnbUuid): number {
    return this.locationsList().findIndex((loc) => loc === locationId);
  }

  nextLocation(currentLocationId: LocationBdnbUuid): LocationBdnbUuid | null {
    const locations = this.locationsList();
    const currentIndex = this.findLocationIndex(currentLocationId);

    const context = this.queryContext();
    const isInDetailsView =
      context !== null && context.legalEntityUuid !== null;
    if (
      currentIndex === -1 ||
      currentIndex === locations.length - 1 ||
      isInDetailsView
    ) {
      return null;
    }
    return locations[currentIndex + 1] ?? null;
  }

  previousLocation(
    currentLocationId: LocationBdnbUuid,
  ): LocationBdnbUuid | null {
    const locations = this.locationsList();
    const currentIndex = this.findLocationIndex(currentLocationId);

    const context = this.queryContext();
    const isInDetailsView =
      context !== null && context.legalEntityUuid !== null;
    if (currentIndex <= 0 || isInDetailsView) {
      return null;
    }
    return locations[currentIndex - 1] ?? null;
  }

  isLastLocation(currentLocationId: LocationBdnbUuid): boolean {
    const locations = this.locationsList();
    const currentIndex = this.findLocationIndex(currentLocationId);

    if (currentIndex === -1) {
      return false;
    }
    return currentIndex === locations.length - 1;
  }

  isFirstLocation(currentLocationId: LocationBdnbUuid): boolean {
    const currentIndex = this.findLocationIndex(currentLocationId);

    if (currentIndex === -1) {
      return false;
    }
    return currentIndex === 0;
  }
}

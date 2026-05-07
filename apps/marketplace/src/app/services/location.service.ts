import { computed, inject, Injectable, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { UserType, type LocationAddressDetails } from "@optee/constants";
import { isOpteeLocation, Location } from "@optee/models";
import { isNotNullish, sleep } from "@optee/utils";
import { map, of, shareReplay, startWith, Subject, switchMap } from "rxjs";
import trpcClient from "../../trpc-client";
import { SupabaseService } from "../supabase.service";
import { AppService } from "./app.service";
import { AuthService } from "./auth.service";
import { LocalStorageService } from "./local-storage.service";

@Injectable({ providedIn: "root" })
export class LocationService {
  private readonly appService = inject(AppService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly authService = inject(AuthService);

  readonly activeLocation = signal<Location | null>(null);

  private readonly refreshAll$ = new Subject<void>();

  readonly allForClient$ = this.refreshAll$.pipe(
    startWith(""),
    switchMap(() => SupabaseService.isAuthenticated$),
    switchMap((isAuthenticated) =>
      isAuthenticated ? this.authService.loggedAs$ : of(null),
    ),
    switchMap((loggedAs) =>
      loggedAs === UserType.CLIENT ? this.getAllForClient() : of([]),
    ),
    map((locations) => locations.filter(isNotNullish)),
    shareReplay(1),
  );

  readonly hasLocations$ = this.allForClient$.pipe(
    map((locations) => locations.length > 0),
  );

  readonly all = toSignal(this.allForClient$, { initialValue: [] });

  readonly hasLocations = computed(() => this.all().length > 0);

  async getAllForClient() {
    try {
      return (await trpcClient.locations.getAllForClient.query())
        .map(Location.init)
        .filter(isNotNullish);
    } catch (error) {
      console.error("Erreur lors de la récupération des sites", error);
      return [];
    }
  }

  getByAddressDetails(addressDetails: LocationAddressDetails) {
    const locations = this.all();

    if (!locations) {
      throw new Error(
        "Une erreur est survenue, la liste des sites n'est pas disponible.",
      );
    }

    const locationMatch = locations.find(
      (l) =>
        l.streetNumber === addressDetails.streetNumber &&
        (l.streetName ?? "").toLowerCase() ===
          (addressDetails.streetName ?? "").toLowerCase() &&
        l.zipcode === addressDetails.zipcode &&
        l.city.toLowerCase() === addressDetails.city.toLowerCase(),
    );

    return locationMatch || null;
  }

  getByPlaceId(placeId: string) {
    const locations = this.all();

    if (!locations) {
      throw new Error(
        "Une erreur est survenue, la liste des sites n'est pas disponible.",
      );
    }

    const locationMatch = locations.find((l) => l.googlePlaceId === placeId);

    return locationMatch || null;
  }

  async showBdnbLoader(locations: Location[]) {
    const completedLocations = locations.filter(
      (location) => !location.needsBdnbCheck && isOpteeLocation(location),
    );

    const locationsWithoutBdnb = locations.filter(
      (location) => location.needsBdnbCheck && isOpteeLocation(location),
    );

    let completed = completedLocations.length;

    for (const location of locationsWithoutBdnb) {
      this.appService.isLoading.set(true);

      this.appService.loadingMessage.set({
        title: `(${completed}/${locations.length}) Analyse du ${location.shortAddress}`,
        text: "Nous analysons les données de vos sites pour vous proposer les meilleures opérations.",
      });

      try {
        await trpcClient.locations.updateBdnbData.mutate({
          uuid: location.uuid,
        });
      } catch (e) {
        await trpcClient.locations.markAsBdnbFailure.mutate({
          uuid: location.uuid,
        });
      }

      await sleep(1000);

      completed++;

      this.appService.isLoading.set(completed < locations.length);
    }

    this.appService.resetMessage();
  }

  /**
   * Set the location to show (used by location data panel)
   */
  showPanel(location: Location) {
    this.activeLocation.set(location);
  }

  closePanel() {
    this.activeLocation.set(null);
  }

  refresh() {
    this.refreshAll$.next();
  }
}

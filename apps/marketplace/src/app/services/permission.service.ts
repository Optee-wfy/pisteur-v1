import { computed, inject, Injectable } from "@angular/core";
import { type PermissionSlug } from "@optee/constants";

import { toSignal } from "@angular/core/rxjs-interop";
import { map, of, shareReplay, switchMap } from "rxjs";
import trpcClient from "../../trpc-client";
import { AuthService } from "./auth.service";
import { LocationService } from "./location.service";

@Injectable({ providedIn: "root" })
export class PermissionService {
  private readonly authService = inject(AuthService);
  private readonly locationService = inject(LocationService);

  private readonly userPermissions$ = this.authService.loggedAs$.pipe(
    switchMap((loggedAs) => {
      return loggedAs === "client"
        ? trpcClient.users.getPermissions.query()
        : of([]);
    }),
    shareReplay(1),
  );

  private readonly userPermissions = toSignal(this.userPermissions$, {
    initialValue: [],
  });

  /**
   * Checks if the user has the required permission.
   *
   * @param requiredPermission - A single permission
   * @returns boolean - True if the user has the required permission, otherwise false.
   */
  can(requiredPermission: PermissionSlug) {
    return this.userPermissions().some((p) => p.slug === requiredPermission);
  }

  can$(requiredPermission: PermissionSlug) {
    return this.userPermissions$.pipe(
      map((userPermissions) =>
        userPermissions.some((p) => p.slug === requiredPermission),
      ),
    );
  }

  canCreateLocation = computed(() => {
    const hasPermission = this.userPermissions().some(
      (p) => p.slug === "LOCATION_CREATE",
    );
    const hasLocations = this.locationService.hasLocations();

    return hasPermission || !hasLocations;
  });

  readonly canInviteAnyone = computed(
    () =>
      this.can("INVITE_CLIENT_ADMINISTRATOR") ||
      this.can("INVITE_LOCATION_ADMINISTRATOR") ||
      this.can("INVITE_LOCATION_VIEWER"),
  );

  readonly canUpdateSignatory = computed(
    () =>
      this.authService.isAdminOptee() ||
      (this.authService.isLoggedAsClient() &&
        this.userPermissions().some((p) => p.slug === "QUOTE_UPDATE_STAGE")),
  );
}

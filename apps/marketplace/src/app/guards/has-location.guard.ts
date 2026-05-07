import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import trpcClient from "../../trpc-client";

/**
 * Prevents user from accessing route if user's client has no location
 * @returns true if user has at least one location, false otherwise
 */
export const HasLocationGuard: CanActivateFn = async () => {
  const router = inject(Router);

  try {
    const locationsCount = await trpcClient.locations.countByLoggedUser.query();

    if (locationsCount === 0) {
      throw new Error("Cette page est inaccessible sans bâtiment");
    }
  } catch (err) {
    router.navigate(["/client/locations"]);
    return false;
  }

  return true;
};

import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot, CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { SupabaseService } from "../supabase.service";

export const ProDropboxFormGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
) => {
  const router = inject(Router);
  const session = await SupabaseService.getSession();

  const hsId = route.queryParams["hsId"];

  if (session) {
    router.navigate(["/pro/dropbox"], {
      queryParams: { hsId },
    });

    console.info("Route guard : session active");
    return false;
  }
  return true;
};

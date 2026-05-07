import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { SupabaseService } from "../supabase.service";
import { getCurrentUrlWithQueryAndHash } from "../utils/url.util";

export const RedirectGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const session = await SupabaseService.getSession();

  if (!session) {
    router.navigate(["/auth"], {
      queryParams: { redirect: getCurrentUrlWithQueryAndHash() },
    });
  } else {
    router.navigate(["/client"]);
  }

  return true;
};

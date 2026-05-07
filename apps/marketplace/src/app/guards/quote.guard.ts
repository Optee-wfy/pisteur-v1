import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { PermissionService } from "../services/permission.service";

export const QuoteGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const permissionService = inject(PermissionService);

  if (
    !(
      permissionService.can("QUOTE_READ_BY_CLIENT") ||
      permissionService.can("QUOTE_READ_BY_LOCATION")
    )
  ) {
    router.navigate(["/"]);

    console.info("Route guard blocked: No permission");
    return false;
  }

  return true;
};

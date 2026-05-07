import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { PermissionService } from "../services/permission.service";

export const DealGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const permissionService = inject(PermissionService);

  if (
    !(
      permissionService.can("DEAL_READ_BY_CLIENT") ||
      permissionService.can("DEAL_READ_BY_LOCATION")
    )
  ) {
    router.navigate(["/"]);
    return false;
  }

  return true;
};

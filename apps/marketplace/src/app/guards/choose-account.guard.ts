import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { UserType } from "@optee/constants";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../services/auth.service";
import { SupabaseService } from "../supabase.service";
import { getCurrentUrlWithQueryAndHash } from "../utils/url.util";

export const ChooseAccountGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const session = await SupabaseService.getSession();

  if (!session) {
    return router.createUrlTree(["/auth"], {
      queryParams: { redirect: getCurrentUrlWithQueryAndHash() },
    });
  }

  const hasMultipleUserTypes = await authService.hasMultipleUserTypes();

  if (!hasMultipleUserTypes) {
    try {
      const userTypes = await firstValueFrom(authService.userTypes$);
      if (userTypes.length === 1) {
        const userType = userTypes[0] as UserType;
        authService.changeUserType(userType);
        const route = userType === UserType.PRO ? "pro/pisteur" : "client";
        router.navigate(["/" + route]);
      } else {
        console.error("User has no account types available, logging out.", {
          session,
          userTypes,
        });
        await authService.logOut();
        router.navigate(["/auth"], {
          queryParams: { redirect: getCurrentUrlWithQueryAndHash() },
        });
      }
      return false;
    } catch (error) {
      console.error("Error in ChooseAccountGuard:", error);
      return router.createUrlTree(["/auth"], {
        queryParams: { redirect: getCurrentUrlWithQueryAndHash() },
      });
    }
  }

  return true;
};

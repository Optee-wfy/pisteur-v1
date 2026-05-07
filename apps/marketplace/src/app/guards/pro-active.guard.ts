import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { ProSubscription, UserType } from "@optee/constants";
import { isNotNullish } from "@optee/utils";
import { filter, firstValueFrom } from "rxjs";
import { AuthService } from "../services/auth.service";
import { ProService } from "../services/pro.service";
import { getCurrentUrlWithQueryAndHash } from "../utils/url.util";

export const ProActiveGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const proService = inject(ProService);

  try {
    const [userTypes, pro] = await Promise.all([
      firstValueFrom(authService.userTypes$),
      firstValueFrom(proService.pro$.pipe(filter(isNotNullish))),
    ]);

    if (!userTypes.includes(UserType.PRO)) {
      if (userTypes.includes(UserType.CLIENT)) {
        router.navigate(["/client"]);
        return false;
      }
      await authService.logOut();
      return false;
    }

    if (!pro || pro.status !== "Actif") {
      router.navigate(["/pro/invalid-account"]);
      return false;
    }

    if (
      pro.subscription === null ||
      pro.subscription === ProSubscription.UNPAID ||
      pro.subscription === ProSubscription.RESIGNED
    ) {
      router.navigate(["/pro/invalid-account"]);
      return false;
    }

    return true;
  } catch (err) {
    console.error("ProActiveGuard error:", err);
    router.navigate(["/auth"], {
      queryParams: { redirect: getCurrentUrlWithQueryAndHash() },
    });
    return false;
  }
};

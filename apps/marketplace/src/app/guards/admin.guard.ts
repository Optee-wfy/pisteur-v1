import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { catchError, firstValueFrom, of, timeout } from "rxjs";
import { AuthService } from "../services/auth.service";

export const AdminGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  try {
    const isAdminOptee = await firstValueFrom(
      authService.isAdminOptee$.pipe(
        timeout({ first: 3000 }), // 3s max avant fallback
        catchError(() => of(false)),
      ),
    );
    return isAdminOptee || router.createUrlTree(["/"]);
  } catch (e) {
    console.error("AdminGuard error:", e);
    return router.createUrlTree(["/"]);
  }
};

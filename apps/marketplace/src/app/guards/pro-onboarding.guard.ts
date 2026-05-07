import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { UserType } from "@optee/constants";
import { isNotNullish } from "@optee/utils";
import { filter, firstValueFrom } from "rxjs";
import trpcClient from "../../trpc-client";
import { AuthService } from "../services/auth.service";
import { ProService } from "../services/pro.service";

export const ProOnboardingGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const proService = inject(ProService);

  const userTypes = await firstValueFrom(authService.userTypes$);
  if (!userTypes.includes(UserType.PRO)) {
    router.navigate(["/client"]);
    return false;
  }

  const proStatus = (
    await firstValueFrom(proService.pro$.pipe(filter(isNotNullish)))
  ).status;

  if (proStatus === "Actif") {
    router.navigate(["/pro"]);
    return false;
  }

  if (proStatus === null) {
    return true;
  }

  if (proStatus === "Onboarding plateforme") {
    router.navigate([`/pro/onboarding/onboarding-form`]);
    return false;
  } else if (proStatus === "En attente de signature plateforme") {
    router.navigate([`/pro/onboarding/onboarding-sign`]);
    return false;
  } else if (proStatus === "Compte en attente de validation") {
    router.navigate([`/pro/onboarding/onboarding-confirm`]);
    return false;
  }

  return true;
};

export const ProOnboardingFormGuard: CanActivateFn = async () => {
  const router = inject(Router);

  const [userTypes, pro] = await Promise.all([
    trpcClient.users.getUserTypes.query(),
    trpcClient.pros.getByLoggedPro.query(),
  ]);

  if (!userTypes.includes(UserType.PRO)) {
    router.navigate(["/client"]);
    return false;
  }

  if (pro?.status !== "Onboarding plateforme") {
    router.navigate(["/pro"]);
    return false;
  }

  return true;
};

export const ProOnboardingSignGuard: CanActivateFn = async () => {
  const router = inject(Router);

  const [userTypes, pro] = await Promise.all([
    trpcClient.users.getUserTypes.query(),
    trpcClient.pros.getByLoggedPro.query(),
  ]);

  if (!userTypes.includes(UserType.PRO)) {
    router.navigate(["/client"]);
    return false;
  }

  if (pro?.status !== "En attente de signature plateforme") {
    router.navigate(["/pro"]);
    return false;
  }

  return true;
};

export const ProOnboardingConfirmedGuard: CanActivateFn = async () => {
  const router = inject(Router);

  const [userTypes, pro] = await Promise.all([
    trpcClient.users.getUserTypes.query(),
    trpcClient.pros.getByLoggedPro.query(),
  ]);

  if (!userTypes.includes(UserType.PRO)) {
    router.navigate(["/client"]);
    return false;
  }

  if (pro?.status !== "Compte en attente de validation") {
    router.navigate(["/pro"]);
    return false;
  }

  return true;
};

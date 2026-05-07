import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { getOnboardingPath, UserType } from "@optee/constants";
import { ToastService } from "@optee/ui/services/toast.service";
import { firstValueFrom } from "rxjs";
import trpcClient from "../../trpc-client";
import { AuthService } from "../services/auth.service";
import { getCurrentUrlWithQueryAndHash } from "../utils/url.util";

export const ClientGuard: CanActivateFn = async () => {
  const router = inject(Router);

  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  try {
    const [userTypes, contact, client] = await Promise.all([
      firstValueFrom(authService.userTypes$),
      trpcClient.contacts.getByLoggedUser.query(),
      trpcClient.clients.getByLoggedUser.query(),
    ]);

    if (!userTypes.includes(UserType.CLIENT)) {
      if (userTypes.includes(UserType.PRO)) {
        await router.navigate(["/pro"]);
      } else {
        await authService.logOut();
      }

      return false;
    }

    if (!contact) {
      toastService.open(
        "info",
        "Accès plateforme",
        "Merci de renseigner quelques informations sur vous afin d'accéder à la plateforme.",
      );

      await router.navigate([
        getOnboardingPath({ step: "contact", variant: "2025" }),
      ]);

      console.info(
        "Route guard blocked: Contact does not exist/ Need to onboard contact",
      );
      return false;
    }

    if (!client) {
      toastService.open(
        "info",
        "Accès plateforme",
        "Merci de renseigner quelques informations sur votre société avant d'accéder à la plateforme.",
      );

      await router.navigate([
        getOnboardingPath({ step: "client", variant: "2025" }),
      ]);

      console.info(
        "Route guard blocked: Client does not exist/ Need to onboard",
      );
      return false;
    }

    if (authService.loggedAs() !== UserType.CLIENT) {
      authService.changeUserType(UserType.CLIENT);
    }

    return true;
  } catch (err) {
    toastService.openError("Accès plateforme", err);

    await router.navigate(["/auth"], {
      queryParams: { redirect: getCurrentUrlWithQueryAndHash() },
    });

    return false;
  }
};

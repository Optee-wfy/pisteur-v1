import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { UserType } from "@optee/constants";
import { ToastService } from "@optee/ui/services/toast.service";
import { firstValueFrom } from "rxjs";
import trpcClient from "../../trpc-client";
import { AppService } from "../services/app.service";
import { AuthService } from "../services/auth.service";
import { getCurrentUrlWithQueryAndHash } from "../utils/url.util";

export const ProGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const appService = inject(AppService);

  try {
    appService.loadingMessage.set({
      title: "Vérification de vos informations...",
    });

    appService.isLoading.set(true);

    const [userTypes, contact] = await Promise.all([
      firstValueFrom(authService.userTypes$),
      trpcClient.contacts.getByLoggedUser.query(),
    ]);

    appService.isLoading.set(false);
    appService.resetMessage();

    if (!contact) {
      toastService.open(
        "info",
        "Accès plateforme",
        "Nous n'avons trouvé aucun contact associé à votre compte. Veuillez contacter notre support pour plus d'informations.",
      );

      await router.navigate(["/auth"], {
        queryParams: { redirect: getCurrentUrlWithQueryAndHash() },
      });

      console.info("Route guard blocked: Pro Contact does not exist");
      return false;
    }

    if (!userTypes.includes(UserType.PRO)) {
      if (userTypes.includes(UserType.CLIENT)) {
        router.navigate(["/client"]);
      } else {
        await authService.logOut();
      }

      return false;
    }

    if (authService.loggedAs() !== UserType.PRO) {
      authService.changeUserType(UserType.PRO);
    }

    return true;
  } catch (err) {
    appService.isLoading.set(false);
    appService.resetMessage();
    toastService.openError("Accès plateforme", err);

    router.navigate(["/auth"], {
      queryParams: { redirect: getCurrentUrlWithQueryAndHash() },
    });

    return false;
  }
};

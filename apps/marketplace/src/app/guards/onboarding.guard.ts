import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { getOnboardingPath } from "@optee/constants";
import trpcClient from "../../trpc-client";
import { SupabaseService } from "../supabase.service";
import { getCurrentUrlWithQueryAndHash } from "../utils/url.util";

//@todo make it DRY with the other onboarding guards
export const OnboardingLoggedGuard: CanActivateFn = async () => {
  const router = inject(Router);

  const session = await SupabaseService.getSession();

  if (!session) {
    await router.navigate(["/auth"], {
      queryParams: { redirect: getCurrentUrlWithQueryAndHash() },
    });
    console.info("Route guard blocked: No session");
    return false;
  }

  const [client, contact] = await Promise.all([
    trpcClient.clients.getByLoggedUser.query(),
    trpcClient.contacts.getByLoggedUser.query(),
  ]);

  if (client) {
    await router.navigate(["/"]);
    console.info(
      "Route guard blocked: Client already exists/ No need to onboard",
    );
    return false;
  }

  if (!contact) {
    await router.navigate(
      [getOnboardingPath({ step: "contact", variant: "2025" })],
      {
        queryParamsHandling: "preserve",
      },
    );

    console.info(
      "Route guard blocked: Contact does not exist/ Need to onboard contact",
    );
    return false;
  }

  return true;
};

export const OnboardingRedirectIfLoggedGuard: CanActivateFn = async () => {
  const router = inject(Router);

  const session = await SupabaseService.getSession();

  if (session) {
    const contact = await trpcClient.contacts.getByLoggedUser.query();

    if (contact) {
      await router.navigate(["/"]);
      return false;
    }
  }

  return true;
};

import { computed, inject, Injectable } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import type { CanActivateFn } from "@angular/router";
import { ActivatedRoute, Router } from "@angular/router";
import {
  buildAssetUrl,
  getOnboardingPath,
  ONBOARDING_PARTNER_QUERY_PARAM,
  ONBOARDING_PARTNERS,
  type OnboardingPartner,
} from "@optee/constants";
import { map } from "rxjs";
import { z } from "zod";
import trpcClient from "../../trpc-client";
import { SupabaseService } from "../supabase.service";
import { getCurrentUrlWithQueryAndHash } from "../utils/url.util";

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

type OnboardingContent = {
  target: string;
  julieJob: string;
  partnerLogo: string | null;
  sellingPoints: string[];
  locationLabel: string;
  otherPartners: { path: string; alt: string; size: string }[];
};

export const ONBOARDING_PARTNER_CONTENT: Record<
  OnboardingPartner | "default",
  OnboardingContent
> = {
  default: {
    target: "décideurs de la rénovation",
    julieJob: "Responsable patrimoine – médico-social",
    partnerLogo: null,
    sellingPoints: [
      "<strong>Une analyse intelligente</strong> de vos bâtiments",
      "<strong>Des plans d’actions clairs</strong> et hiérarchisés",
      "<strong>Des décisions guidées</strong> par la data",
      "<strong>Des appels d’offres structurés,</strong> en quelques clics",
    ],
    locationLabel: "Bâtiment sélectionné",
    otherPartners: [
      { path: buildAssetUrl("partners/CBRE.svg"), alt: "CBRE", size: "h-6" },
      { path: buildAssetUrl("partners/emeis.svg"), alt: "Emeis", size: "h-12" },
      { path: buildAssetUrl("partners/emera.svg"), alt: "Emera", size: "h-6" },
      {
        path: buildAssetUrl("partners/compagnie-des-alpes.svg"),
        alt: "Compagnie des alpes",
        size: "h-12",
      },
    ],
  },
  unis: {
    target: "gestionnaires de l'immobilier",
    julieJob: "Gestionnaire de copropriétés",
    partnerLogo: buildAssetUrl("partners/unis.svg"),
    sellingPoints: [
      "<strong>Données énergétiques</strong> par bâtiment",
      "<strong>Simulateur de travaux</strong> intelligent",
      "<strong>Récapitulatif de l'opération</strong> à présenter à la copro",
      "<strong>Appels d’offres</strong> optimisés en un clic",
    ],
    locationLabel: "Adresse de ma première copropriété",
    otherPartners: [
      {
        path: buildAssetUrl("partners/foncia.svg"),
        alt: "Foncia",
        size: "h-14",
      },
      {
        path: buildAssetUrl("partners/oralia.svg"),
        alt: "Oralia",
        size: "h-8",
      },
      { path: buildAssetUrl("partners/orpi.svg"), alt: "Orpi", size: "h-10" },
      {
        path: buildAssetUrl("partners/gtf.svg"),
        alt: "GTF",
        size: "h-10",
      },
    ],
  },
};

@Injectable({ providedIn: "root" })
export class OnboardingService {
  private readonly route = inject(ActivatedRoute);

  private readonly partnerParam = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => m.get(ONBOARDING_PARTNER_QUERY_PARAM)),
    ),
  );

  content = computed(() => {
    const partnerParam = this.partnerParam();

    const { data: partner } = z
      .enum(ONBOARDING_PARTNERS)
      .safeParse(partnerParam);

    if (!partner) {
      return ONBOARDING_PARTNER_CONTENT.default;
    }

    return ONBOARDING_PARTNER_CONTENT[partner];
  });
}

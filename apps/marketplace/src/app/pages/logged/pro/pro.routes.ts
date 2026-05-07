import type { Routes } from "@angular/router";
import {
  ProActiveGuard,
  ProOnboardingFormGuard,
  ProOnboardingGuard,
  ProOnboardingSignGuard,
} from "../../../guards";
import { ProMarketplaceGuard } from "../../../guards/pro-marketplace.guard";
import { ProOnboardingConfirmedGuard } from "../../../guards/pro-onboarding.guard";

export const proRoutes: Routes = [
  {
    path: "marketplace",
    loadComponent: () =>
      import("./marketplace/marketplace.layout").then((m) => m.default),
    canActivate: [ProMarketplaceGuard],
    loadChildren: () =>
      import("./marketplace/marketplace.routes").then(
        (m) => m.proMarketplaceRoutes,
      ),
  },
  {
    path: "onboarding",
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./onboarding/onboarding-start.page").then((m) => m.default),
        canActivate: [ProOnboardingGuard],
      },
      {
        path: "onboarding-form",
        loadComponent: () =>
          import("./onboarding/onboarding-form.page").then((m) => m.default),
        canActivate: [ProOnboardingFormGuard],
      },
      {
        path: "onboarding-sign",
        loadComponent: () =>
          import("./onboarding/onboarding-sign.page").then((m) => m.default),
        canActivate: [ProOnboardingSignGuard],
      },
      {
        path: "onboarding-confirm",
        loadComponent: () =>
          import("./onboarding/onboarding-confirm.page").then((m) => m.default),
        canActivate: [ProOnboardingConfirmedGuard],
      },
    ],
  },
  {
    path: "pisteur",
    loadComponent: () =>
      import("./prospect/prospect.layout").then(
        (m) => m.ProspectLayoutComponent,
      ),
    canActivate: [ProActiveGuard],
    loadChildren: () =>
      import("./prospect/prospect.route").then((m) => m.prospectRoutes),
  },

  {
    path: "invalid-account",
    loadComponent: () =>
      import("./invalid-account/invalid-account.page").then(
        (m) => m.InvalidAccountPage,
      ),
  },

  {
    path: "**",
    redirectTo: "pisteur",
  },
];

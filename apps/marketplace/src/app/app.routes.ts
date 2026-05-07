import type { Routes } from "@angular/router";
import { LoggedGuard } from "./guards";
import { loggedRoutes } from "./pages/logged/logged.routes";
import { marketingRoutes } from "./pages/marketing/marketing.routes";
import { publicRoutes } from "./pages/public/public.routes";

export const appRoutes: Routes = [
  {
    path: "",
    children: loggedRoutes,
    canActivate: [LoggedGuard],
  },

  {
    path: "marketing",
    children: marketingRoutes,
  },
  {
    path: "onboarding-client-2025",
    loadChildren: () =>
      import(
        "./pages/onboarding-client-2025/onboarding-client-2025.routes"
      ).then((m) => m.onboardingClient2025Routes),
  },
  {
    path: "onboarding-client-arbl",
    loadChildren: () =>
      import(
        "./pages/onboarding-client-arbl/onboarding-client-arbl.routes"
      ).then((m) => m.onboardingClientArblRoutes),
  },
  {
    path: "onboarding-pro",
    loadChildren: () =>
      import("./pages/onboarding-pro/onboarding-pro.routes").then(
        (m) => m.onboardingProRoutes,
      ),
  },
  {
    path: "",
    children: publicRoutes,
  },
  // Should always be the last route
  {
    path: "**",
    loadComponent: () =>
      import("./pages/not-found.page").then((m) => m.default),
  },
];

import type { Routes } from "@angular/router";

export const onboardingProRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./onboarding-pro.layout").then((m) => m.default),
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./onboarding-pro-register.page").then((m) => m.default),
      },
    ],
  },
];

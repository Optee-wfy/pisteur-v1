import type { Routes } from "@angular/router";

export const onboardingClientArblRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./onboarding-client-arbl.layout").then((m) => m.default),
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./onboarding-client-arbl-contact.page").then(
            (m) => m.default,
          ),
      },
      {
        path: "client",
        loadComponent: () =>
          import("./onboarding-client-arbl-client.page").then((m) => m.default),
      },
    ],
  },
];

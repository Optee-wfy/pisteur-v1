import type { Routes } from "@angular/router";

export const onboardingClient2025Routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./onboarding-client-2025.layout").then((m) => m.default),
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./onboarding-client-2025-contact.page").then(
            (m) => m.default,
          ),
      },
      {
        path: "client",
        loadComponent: () =>
          import("./onboarding-client-2025-client.page").then((m) => m.default),
      },
    ],
  },
];

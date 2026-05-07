import type { Routes } from "@angular/router";

export const marketingRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./marketing.layout").then((m) => m.default),
    children: [
      {
        path: "simulation/:simulationUuid",
        loadComponent: () =>
          import("./marketing-simulation-public.page").then((m) => m.default),
      },
    ],
  },
];

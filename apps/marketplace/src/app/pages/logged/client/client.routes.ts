import type { Routes } from "@angular/router";
import { DealGuard, HasLocationGuard, QuoteGuard } from "../../../guards";

export const clientRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./home.page").then((m) => m.default),
    canActivate: [HasLocationGuard],
  },
  {
    path: "piloter",
    loadComponent: () => import("./piloter.page").then((m) => m.default),
    canActivate: [DealGuard, HasLocationGuard],
  },
  {
    path: "explorer",
    loadComponent: () => import("./explorer.page").then((m) => m.default),
    canActivate: [HasLocationGuard],
  },
  {
    path: "user",
    loadComponent: () => import("./user.page").then((m) => m.default),
  },
  {
    path: "quotes",
    loadComponent: () => import("./quotes.page").then((m) => m.default),
    canActivate: [QuoteGuard, HasLocationGuard],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./quotes/quotes-list.page").then((m) => m.default),
      },
      {
        path: ":quoteUuid",
        loadComponent: () =>
          import("./quotes/quote-details.page").then((m) => m.default),
      },
    ],
  },
  {
    path: "locations",
    children: [
      {
        path: "",
        loadComponent: () => import("./locations.page").then((m) => m.default),
      },
    ],
  },
  {
    path: "brief/:operationUuid",
    loadComponent: () => import("./brief-client.page").then((m) => m.default),
  },
];

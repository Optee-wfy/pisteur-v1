import type { Routes } from "@angular/router";
import { ProActiveGuard } from "../../../../guards";
import { ProMarketplaceGuard } from "../../../../guards/pro-marketplace.guard";

export const proMarketplaceRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./home.page").then((m) => m.default),
    canActivate: [ProMarketplaceGuard],
  },
  {
    path: "dashboard",
    loadComponent: () => import("./dashboard.page").then((m) => m.default),
    canActivate: [ProActiveGuard],
  },
  {
    path: "explore",
    loadComponent: () => import("./marketplace.page").then((m) => m.default),
    canActivate: [ProMarketplaceGuard],
  },
  {
    path: "cyclope",
    loadComponent: () => import("./cyclope.page").then((m) => m.default),
    canActivate: [ProActiveGuard],
  },
  {
    path: "dropbox",
    loadComponent: () => import("./dropbox.page").then((m) => m.default),
    canActivate: [ProActiveGuard],
  },
  {
    path: "user",
    loadComponent: () => import("./user.page").then((m) => m.default),
    canActivate: [ProActiveGuard],
  },
  {
    path: "**",
    redirectTo: "",
  },
];

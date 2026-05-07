import type { Routes } from "@angular/router";
import {
  AdminGuard,
  ChooseAccountGuard,
  ClientGuard,
  LoggedGuard,
  ProGuard,
} from "../../guards";

export const loggedRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./logged.layout").then((m) => m.default),
    canActivate: [LoggedGuard],
    children: [
      {
        path: "choose-account",
        loadComponent: () =>
          import("./choose-account.page").then((m) => m.default),
        canActivate: [ChooseAccountGuard],
      },
      {
        path: "client",
        loadComponent: () =>
          import("./client/client.layout").then((m) => m.default),
        canActivate: [ClientGuard],
        loadChildren: () =>
          import("./client/client.routes").then((m) => m.clientRoutes),
      },
      {
        path: "pro",
        loadComponent: () => import("./pro/pro.layout").then((m) => m.default),
        canActivate: [ProGuard],
        loadChildren: () => import("./pro/pro.routes").then((m) => m.proRoutes),
      },
      {
        path: "admin",
        loadComponent: () =>
          import("./admin/admin.layout").then((m) => m.default),
        canActivate: [AdminGuard],
        loadChildren: () =>
          import("./admin/admin.routes").then((m) => m.adminRoutes),
      },
      {
        path: "billing",
        canActivate: [ProGuard],
        children: [
          {
            path: "success",
            loadComponent: () =>
              import("./billing/success.page").then(
                (m) => m.BillingSuccessPage,
              ),
          },
          {
            path: "cancel",
            loadComponent: () =>
              import("./billing/cancel.page").then((m) => m.BillingCancelPage),
          },
        ],
      },
      {
        path: "",
        redirectTo: "choose-account",
        pathMatch: "full",
      },
    ],
  },
];

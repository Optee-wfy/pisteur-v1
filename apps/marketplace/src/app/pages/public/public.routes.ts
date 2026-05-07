import type { Routes } from "@angular/router";
import { ProDropboxFormGuard } from "../../guards";

export const publicRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./public.layout").then((m) => m.default),
    children: [
      {
        path: "dropbox/:hsId",
        loadComponent: () => import("./dropbox.page").then((m) => m.default),
        canActivate: [ProDropboxFormGuard],
      },
      {
        path: "cgu",
        loadComponent: () => import("./cgu.page").then((m) => m.default),
      },
      {
        path: "brief/:operationHsId",
        loadComponent: () =>
          import("./brief-public.page").then((m) => m.default),
      },
      {
        path: "auth",
        loadComponent: () =>
          import("./auth/auth.layout").then((m) => m.default),
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./auth/login.page").then((m) => m.default),
          },
          {
            path: "reset-password/:token",
            loadComponent: () =>
              import("./auth/reset-password.page").then((m) => m.default),
          },
          {
            path: "forgotten-password",
            loadComponent: () =>
              import("./auth/forgotten-password.page").then((m) => m.default),
          },
        ],
      },
      {
        path: "**",
        redirectTo: "auth",
        pathMatch: "full",
      },
    ],
  },
];

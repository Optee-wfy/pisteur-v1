import type { Routes } from "@angular/router";

export const adminRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./redirect.page").then((m) => m.default),
  },
  {
    path: "client",
    loadComponent: () => import("./client.page").then((m) => m.default),
  },
  {
    path: "pro",
    loadComponent: () => import("./pro.page").then((m) => m.default),
  },
  {
    path: "pros",
    loadComponent: () => import("./pros.page").then((m) => m.default),
  },
  {
    path: "quotes",
    loadComponent: () => import("./quotes.page").then((m) => m.default),
  },
  {
    path: "simulation",
    loadComponent: () => import("./simulation.page").then((m) => m.default),
  },
  {
    path: "operation-types",
    loadComponent: () =>
      import("./operation-types.page").then((m) => m.default),
  },
  {
    path: "pdf",
    loadComponent: () => import("./pdf.page").then((m) => m.default),
  },
  {
    path: "locations",
    loadComponent: () => import("./locations.page").then((m) => m.default),
  },
  {
    path: "legal-entities",
    loadComponent: () => import("./legal-entities.page").then((m) => m.default),
  },
  {
    path: "csv-upload",
    loadComponent: () => import("./csv-upload.page").then((m) => m.default),
  },
  {
    path: "unsynced",
    loadComponent: () => import("./unsynced.page").then((m) => m.default),
  },
  {
    path: "operations",
    children: [
      {
        path: "no-prestation",
        loadComponent: () =>
          import("./operations/no-prestation.page").then((m) => m.default),
      },
      {
        path: "no-simulation",
        loadComponent: () =>
          import("./operations/no-simulation.page").then((m) => m.default),
      },
      {
        path: "re-simulation",
        loadComponent: () =>
          import("./operations/re-simulation.page").then((m) => m.default),
      },
    ],
  },
  {
    path: "contacts",
    children: [
      {
        path: "client",
        loadComponent: () =>
          import("./contacts/client.page").then((m) => m.default),
      },
      {
        path: "pro",
        loadComponent: () =>
          import("./contacts/pro.page").then((m) => m.default),
      },
    ],
  },
];

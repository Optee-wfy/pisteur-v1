import type { Routes } from "@angular/router";

export const prospectRoutes: Routes = [
  {
    path: "",
    redirectTo: "leads/generate",
    pathMatch: "full",
  },
  {
    path: "places",
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./places/place-list.page").then((m) => m.PlaceListPage),
      },
      {
        path: "details/:uuid",
        loadComponent: () =>
          import("./places/place-details.page").then((m) => m.PlaceDetailsPage),
      },
      {
        path: "search/:id",
        loadComponent: () =>
          import("./places/place-search.page").then((m) => m.PlaceSearchPage),
      },
    ],
  },

  {
    path: "legal-entities",
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./legal-entities/legal-entities-list.page").then(
            (m) => m.LegalEntitiesListPage,
          ),
      },
      {
        path: "details/:uuid",
        loadComponent: () =>
          import("./legal-entities/legal-entity-details.page").then(
            (m) => m.LegalEntityDetailsPage,
          ),
      },
    ],
  },

  {
    path: "leads",
    children: [
      {
        path: "",
        redirectTo: "generate",
        pathMatch: "full",
      },
      {
        path: "generate",
        loadComponent: () =>
          import("./leads/generate-leads.page").then(
            (m) => m.GenerateLeadsPage,
          ),
      },
      {
        path: "details/:uuid",
        loadComponent: () =>
          import("./leads/lead-details.page").then((m) => m.LeadDetailsPage),
      },
    ],
  },

  {
    path: "address-book/legal-entities",
    loadComponent: () =>
      import("./address-book/companies.pages").then(
        (m) => m.AddressBookCompaniesPage,
      ),
  },
  {
    path: "address-book/places",
    loadComponent: () =>
      import("./address-book/places.pages").then(
        (m) => m.AddressBookPlacesPage,
      ),
  },
  {
    path: "address-book/contacts",
    loadComponent: () =>
      import("./address-book/external-contacts.pages").then(
        (m) => m.AddressBookExternalContactsPage,
      ),
  },
  {
    path: "address-book/leads",
    loadComponent: () =>
      import("./address-book/leads.pages").then(
        (m) => m.AddressBookLeadsPage,
      ),
  },
];

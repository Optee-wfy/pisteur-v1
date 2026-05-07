import { type Route } from "@angular/router";
import { LayoutComponent } from "./layout.component";
import {
  blogPostPageResolver,
  blogPostsResolver,
} from "./resolvers/blog-post.resolvers";
import {
  useCasePageResolver,
  useCasesResolver,
} from "./resolvers/use-case.resolvers";

export const appRoutes: Route[] = [
  {
    path: "demo",
    loadComponent: () =>
      import("./pages/demo.page").then((x) => x.DemoPageComponent),
  },
  {
    path: "politique-de-confidentialite",
    loadComponent: () =>
      import("./pages/politique-de-confidentialite.page").then(
        (x) => x.PolitiqueDeConfidentialitePageComponent,
      ),
  },
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./pages/strategie.page").then(
            (x) => x.StrategiePageComponent,
          ),
      },
      {
        path: "appel-offres",
        loadComponent: () =>
          import("./pages/marketplace.page").then(
            (x) => x.MarketplacePageComponent,
          ),
      },
      {
        path: "professionnel",
        loadComponent: () =>
          import("./pages/professionnel.page").then(
            (x) => x.ProfessionnelHomePageComponent,
          ),
      },
      {
        path: "gtb",
        loadComponent: () =>
          import("./pages/gtb.page").then((x) => x.GtbPageComponent),
      },
      {
        path: "cvc",
        loadComponent: () =>
          import("./pages/cvc.page").then((x) => x.CvcPageComponent),
      },
      {
        path: "isolation",
        loadComponent: () =>
          import("./pages/isolation.page").then(
            (x) => x.IsolationPageComponent,
          ),
      },
      {
        path: "audit",
        loadComponent: () =>
          import("./pages/audit.page").then((x) => x.AuditPageComponent),
      },
      {
        path: "blog",
        loadComponent: () =>
          import("./components/posts/post-list.component").then(
            (x) => x.PostsListComponent,
          ),
        resolve: {
          blogPosts: blogPostsResolver,
        },
      },
      {
        path: "blog/:slug",
        loadComponent: () =>
          import("./components/posts/post-detail.component").then(
            (x) => x.PostDetailComponent,
          ),
        resolve: {
          blogPost: blogPostPageResolver,
        },
      },
      // LANDING PAGES - GENERIC
      {
        path: "strategie-l",
        loadComponent: () =>
          import("./pages/landing/generic-strategie.page").then(
            (x) => x.LandingGenericStrategiePageComponent,
          ),
      },
      {
        path: "appel-offres-l",
        loadComponent: () =>
          import("./pages/landing/generic-marketplace.page").then(
            (x) => x.LandingGenericMarketplacePageComponent,
          ),
      },
      // LANDING PAGES - HOTEL
      {
        path: "strategie-hotel-l",
        loadComponent: () =>
          import("./pages/landing/hotel-strategie.page").then(
            (x) => x.LandingHotelStrategiePageComponent,
          ),
      },
      {
        path: "appel-offres-hotel-l",
        loadComponent: () =>
          import("./pages/landing/hotel-marketplace.page").then(
            (x) => x.LandingHotelMarketplacePageComponent,
          ),
      },
      // LANDING PAGES - COPRO
      {
        path: "strategie-copro-l",
        loadComponent: () =>
          import("./pages/landing/copro-strategie.page").then(
            (x) => x.LandingCoproStrategiePageComponent,
          ),
      },
      {
        path: "appel-offres-copro-l",
        loadComponent: () =>
          import("./pages/landing/copro-marketplace.page").then(
            (x) => x.LandingCoproMarketplacePageComponent,
          ),
      },
      // LANDING PAGES - INTERMEDIARE
      {
        path: "strategie-inter-l",
        loadComponent: () =>
          import("./pages/landing/inter-strategie.page").then(
            (x) => x.LandingInterStrategiePageComponent,
          ),
      },
      {
        path: "appel-offres-inter-l",
        loadComponent: () =>
          import("./pages/landing/inter-marketplace.page").then(
            (x) => x.LandingInterMarketplacePageComponent,
          ),
      },

      {
        path: "professionnels-l",
        loadComponent: () =>
          import("./pages/landing/pro-marketplace.page").then(
            (x) => x.LandingProMarketplacePageComponent,
          ),
      },
      {
        path: "professionnels-btp-l",
        loadComponent: () =>
          import("./pages/landing/pro-btp-marketplace.page").then(
            (x) => x.LandingProMarketplaceBtpPageComponent,
          ),
      },
      {
        path: "professionnels-recherche-l",
        loadComponent: () =>
          import("./pages/landing/pro-searchengine-marketplace.page").then(
            (x) => x.LandingProMarketplaceSearchEnginePageComponent,
          ),
      },

      {
        path: "clients",
        loadComponent: () =>
          import("./components/use-case/use-case-list.component").then(
            (x) => x.UseCasesListComponent,
          ),
        resolve: {
          useCases: useCasesResolver,
        },
      },
      {
        path: "clients/:slug",
        loadComponent: () =>
          import("./components/use-case/use-case-detail.component").then(
            (x) => x.UseCaseDetailComponent,
          ),
        resolve: {
          useCase: useCasePageResolver,
        },
      },
      { path: "**", redirectTo: "" },
    ],
  },
];

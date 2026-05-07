export enum NavPage {
  HOME = "home",
  CLIENTS = "clients",
  RESSOURCES = "ressources",
  BLOG = "blog",
  ISOLATION = "Isolation",
  AUDIT = "audit",
  GTB = "gtb",
  CVC = "cvc",
  STRATEGIE = "strategie",
  MARKETPLACE = "marketplace",
  PROFESSIONNEL = "professionnel",
}

export enum NavAction {
  SERVICES = "services",
  SOLUTIONS = "solutions",
  LOG_IN = "log_in",
  DEMO_OPTEE = "demo_optee",
}

export type NavItem = {
  type: "action" | "page";
  slug: NavAction | NavPage;
  label: string;
  routes?: NavItem[];
  icon?:
    | "gestionnaire"
    | "expertise"
    | "isolation"
    | "gtb"
    | "cvc"
    | "audit"
    | "professionnel"
    | "find_in_page";
  url?: string;
};

export enum ServiceColumnTitle {
  OPERATIONS = "Opérations",
  AGIR = "Agir",
  SE_CONFORMER = "Se Conformer",
}

export const NAV_ITEMS: NavItem[] = [
  {
    type: "action",
    slug: NavAction.SOLUTIONS,
    label: "Solutions",
    routes: [
      {
        type: "page",
        slug: NavPage.STRATEGIE,
        label: "Stratégie",
        url: "/",
        icon: "gestionnaire",
      },
      {
        type: "page",
        slug: NavPage.MARKETPLACE,
        label: "Appel d’offres",
        url: "/appel-offres",
        icon: "expertise",
      },
    ],
  },
  {
    type: "action",
    slug: NavAction.SERVICES,
    label: "Opérations",
    routes: [
      {
        type: "page",
        slug: NavPage.ISOLATION,
        label: "Isolation",
        icon: "isolation",
        url: "/isolation",
      },
      {
        type: "page",
        slug: NavPage.GTB,
        label: "GTB",
        icon: "gtb",
        url: "/gtb",
      },
      {
        type: "page",
        slug: NavPage.CVC,
        label: "CVC",
        icon: "cvc",
        url: "/cvc",
      },
      {
        type: "page",
        slug: NavPage.AUDIT,
        label: "Audit Energétique",
        icon: "audit",
        url: "/audit",
      },
    ],
  },
  {
    type: "page",
    slug: NavPage.PROFESSIONNEL,
    label: "Espace pro",
    url: "/professionnel",
  },
  {
    type: "page",
    slug: NavPage.BLOG,
    label: "Ressources",
    url: "/blog",
  },
];

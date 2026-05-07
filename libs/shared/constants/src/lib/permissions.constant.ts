import type {
  ContactClientAssociation,
  ContactLocationAssociation,
} from "./associations.constant";
import {
  CONTACT_CLIENT_ASSOCIATIONS,
  CONTACT_LOCATION_ASSOCIATIONS,
} from "./associations.constant";

export type Role =
  | "CLIENT_ADMINISTRATOR"
  | "LOCATION_ADMINISTRATOR"
  | "LOCATION_VIEWER";

export const CLIENT_ROLES: Array<{
  slug: Role;
  label: string;
  description: string;
  summary: string[];
  labelApp: string;
  clientAssociation?: ContactClientAssociation;
  locationAssociation?: ContactLocationAssociation;
}> = [
  {
    slug: "CLIENT_ADMINISTRATOR",
    label: "Administrateur",
    labelApp: "Administrateur",
    description: "Accès à l’ensemble du parc immobilier",
    summary: [
      "Planifie, commande et pilote toutes les opérations du compte.",
      "Accède et signe tous les devis du compte.",
      "Gère l’ensemble du parc immobilier.",
      "Peut inviter des administrateurs, gestionnaires ou observateurs.",
    ],
    clientAssociation: CONTACT_CLIENT_ASSOCIATIONS.ADMINISTRATOR,
  },

  {
    slug: "LOCATION_ADMINISTRATOR",
    label: "Administrateur Bâtiment",
    labelApp: "Gestionnaire",
    description: "Accès à une sélection de bâtiments",
    summary: [
      "Gère son portefeuille de bâtiments",
      "Planifie, commande et pilote les opérations sur ses bâtiments",
      "Accède et signe les devis liés à ses bâtiments",
      "Peut inviter des gestionnaires et observateurs sur ses bâtiments",
    ],
    locationAssociation: CONTACT_LOCATION_ASSOCIATIONS.ADMINISTRATOR,
  },

  {
    slug: "LOCATION_VIEWER",
    label: "Observateur Bâtiment",
    labelApp: "Observateur",
    description: "Accès à une sélection de bâtiments",
    summary: [
      " Visualise les opérations sur les bâtiments assignés.",
      " Accède aux devis liés à ses bâtiments.",
      " Visualise les bâtiments sur lesquels il est assigné.",
    ],
    locationAssociation: CONTACT_LOCATION_ASSOCIATIONS.VIEWER,
  },
];

export const getRoleLabel = (role: Role | null | undefined): string =>
  CLIENT_ROLES.find((r) => r.slug === role)?.labelApp ?? "Sans rôle";

export const ROLES_SLUGS = CLIENT_ROLES.map((role) => role.slug) as [
  Role,
  ...Role[],
];

export type PermissionSlug =
  | "DEAL_CREATE"
  | "DEAL_DELETE"
  | "DEAL_READ_BY_CLIENT"
  | "DEAL_READ_BY_LOCATION"
  | "DEAL_LAUNCH"
  | "DEAL_UPDATE"
  | "DEAL_UPDATE_SIGNATORY"
  | "LOCATION_LIST_POTENTIAL_SIGNATORIES"
  | "DEAL_ARCHIVE"
  | "QUOTE_READ_BY_CLIENT"
  | "QUOTE_READ_BY_LOCATION"
  | "QUOTE_UPDATE_STAGE"
  | "QUOTE_SIGN"
  | "QUOTE_CLOSE"
  | "LOCATION_CREATE"
  | "LOCATION_UPDATE"
  | "LOCATION_READ_BY_CLIENT"
  | "LOCATION_READ_BY_LOCATION"
  | "CONTACT_UPDATE_CLIENT_ADMINISTRATOR_RIGHTS"
  | "CONTACT_UPDATE_LOCATION_ADMINISTRATOR_RIGHTS"
  | "CONTACT_UPDATE_LOCATION_VIEWER_RIGHTS"
  | "CONTACT_READ_BY_CLIENT"
  | "CONTACT_READ_BY_LOCATION"
  | "INVITE_CLIENT_ADMINISTRATOR"
  | "INVITE_LOCATION_ADMINISTRATOR"
  | "INVITE_LOCATION_VIEWER"
  | "INVITE_CONTACT_WITHOUT_RIGHTS";

// @todo On devrait pas avoir besoin de ça. Les droits specifiques type "CONTACT_UPDATE_LOCATION_ADMINISTRATOR_RIGHTS" devraient être composés
export type PermissionMasterSlug = "CONTACT_INVITE" | "CONTACT_UPDATE_RIGHTS";

export type Permission = {
  slug: PermissionSlug;
  masterSlug?: PermissionMasterSlug;
  description: string;
  roles: Array<Role | "OPTEE_SUPER_ADMIN">;
  targetRole?: Role;
};

export const PERMISSIONS: Permission[] = [
  {
    slug: "DEAL_CREATE",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
    description: "Créer une opération",
  },

  {
    slug: "DEAL_READ_BY_CLIENT",
    description: "Voir toutes les opérations du compte",
    roles: ["CLIENT_ADMINISTRATOR"],
  },

  {
    slug: "DEAL_READ_BY_LOCATION",
    description: "Voir les opérations du/des site(s) associé(s)",
    roles: [
      "CLIENT_ADMINISTRATOR",
      "LOCATION_ADMINISTRATOR",
      "LOCATION_VIEWER",
    ],
  },

  {
    slug: "DEAL_LAUNCH",
    description: "Lancer une opération",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
  },

  {
    slug: "DEAL_DELETE",
    description: "Annuler une opération",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
  },

  {
    slug: "DEAL_UPDATE",
    description: "Modifier une opération",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
  },

  {
    slug: "DEAL_UPDATE_SIGNATORY",
    description: "Modifier le signataire",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
  },

  {
    slug: "LOCATION_LIST_POTENTIAL_SIGNATORIES",
    description: "Lister les signataires",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
  },

  {
    slug: "DEAL_ARCHIVE",
    description: "Archiver une opération",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
  },

  {
    slug: "QUOTE_READ_BY_CLIENT",
    description: "Voir tous les devis du compte",
    roles: ["CLIENT_ADMINISTRATOR"],
  },

  {
    slug: "QUOTE_READ_BY_LOCATION",
    description: "Voir les devis du/des site(s) associé(s)",
    roles: [
      "CLIENT_ADMINISTRATOR",
      "LOCATION_ADMINISTRATOR",
      "LOCATION_VIEWER",
    ],
  },

  {
    slug: "QUOTE_UPDATE_STAGE",
    description: "Modifier l'état du devis",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
  },

  {
    slug: "QUOTE_SIGN",
    description: "Signer le devis",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
  },

  {
    slug: "QUOTE_CLOSE",
    description: "Clôturer le devis",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
  },

  {
    slug: "LOCATION_CREATE",
    description: "Créer un site",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
  },

  {
    slug: "LOCATION_UPDATE",
    description: "Modifier un site",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
  },

  {
    slug: "LOCATION_READ_BY_CLIENT",
    description: "Voir tous les sites du compte",
    roles: ["CLIENT_ADMINISTRATOR"],
  },

  {
    slug: "LOCATION_READ_BY_LOCATION",
    description: "Voir la liste des sites associés",
    roles: [
      "CLIENT_ADMINISTRATOR",
      "LOCATION_ADMINISTRATOR",
      "LOCATION_VIEWER",
    ],
  },

  {
    slug: "CONTACT_READ_BY_CLIENT",
    description: "Voir tous les contacts du compte",
    roles: ["CLIENT_ADMINISTRATOR"],
  },

  {
    slug: "CONTACT_READ_BY_LOCATION",
    description: "Voir les autres contacts du/des site(s) associé(s)",
    roles: [
      "CLIENT_ADMINISTRATOR",
      "LOCATION_ADMINISTRATOR",
      "LOCATION_VIEWER",
    ],
  },

  {
    slug: "INVITE_LOCATION_ADMINISTRATOR",
    description: "Inviter un administrateur de site",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
    masterSlug: "CONTACT_INVITE",
    targetRole: "LOCATION_ADMINISTRATOR",
  },

  {
    slug: "INVITE_LOCATION_VIEWER",
    description: "Inviter un observateur de site",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
    masterSlug: "CONTACT_INVITE",
    targetRole: "LOCATION_VIEWER",
  },

  {
    slug: "INVITE_CLIENT_ADMINISTRATOR",
    description: "Inviter un administrateur",
    roles: ["OPTEE_SUPER_ADMIN", "CLIENT_ADMINISTRATOR"],
    masterSlug: "CONTACT_INVITE",
    targetRole: "CLIENT_ADMINISTRATOR",
  },

  {
    slug: "INVITE_CONTACT_WITHOUT_RIGHTS",
    description:
      "Inviter et modifier les droits d'un contact existant n'ayant pas de droits",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
    masterSlug: "CONTACT_INVITE",
  },

  {
    slug: "CONTACT_UPDATE_CLIENT_ADMINISTRATOR_RIGHTS",
    description: "Modifier les droits des administrateurs de compte",
    roles: ["OPTEE_SUPER_ADMIN"],
    masterSlug: "CONTACT_UPDATE_RIGHTS",
    targetRole: "CLIENT_ADMINISTRATOR",
  },

  {
    slug: "CONTACT_UPDATE_LOCATION_ADMINISTRATOR_RIGHTS",
    description: "Modifier les droits des administrateurs de site(s)",
    roles: ["CLIENT_ADMINISTRATOR"],
    masterSlug: "CONTACT_UPDATE_RIGHTS",
    targetRole: "LOCATION_ADMINISTRATOR",
  },

  {
    slug: "CONTACT_UPDATE_LOCATION_VIEWER_RIGHTS",
    description: "Modifier les droits des observateurs de site(s)",
    roles: ["CLIENT_ADMINISTRATOR", "LOCATION_ADMINISTRATOR"],
    masterSlug: "CONTACT_UPDATE_RIGHTS",
    targetRole: "LOCATION_VIEWER",
  },
];

export function getRolePermissions(role: Role) {
  return PERMISSIONS.filter((p) => p.roles.some((r) => r === role));
}

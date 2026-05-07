import type { ExternalContactFilters } from "./external-contact.constant";
import type { LocationBdnbLegalEntityFilterPro } from "./location-bdnb-legal-entity-filters.constant";
import { ProSubscription } from "./subscription.constant";

export type FilterKey =
  | keyof LocationBdnbLegalEntityFilterPro
  | keyof ExternalContactFilters;

export interface FilterPermission {
  filterKey: FilterKey;
  subscriptions: ProSubscription[];
}

export const TIER_FREE = [ProSubscription.FREE] as const;

export const TIER_ESSENTIAL = [ProSubscription.ESSENTIAL] as const;

export const TIER_PREMIUM = [
  ProSubscription.IMPACT,
  ProSubscription.PRO,
  ProSubscription.GROWTH,
  ProSubscription.PRO_PLUS,
] as const;

export const hasPremiumAccess = (subscription: ProSubscription): boolean => {
  return TIER_PREMIUM.findIndex((tier) => tier === subscription) !== -1;
};

export const FILTER_PERMISSIONS: FilterPermission[] = [
  // FREE Tier - accès très limité
  {
    filterKey: "legalEntityDepartment",
    subscriptions: [...TIER_FREE, ...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },
  {
    filterKey: "locationDepartment",
    subscriptions: [...TIER_FREE, ...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },
  {
    filterKey: "locationBuildingType",
    subscriptions: [...TIER_FREE, ...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },
  {
    filterKey: "domains",
    subscriptions: [...TIER_FREE, ...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },
  {
    filterKey: "levels",
    subscriptions: [...TIER_FREE, ...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },

  {
    filterKey: "legalEntityTypes",
    subscriptions: [...TIER_FREE, ...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },

  {
    filterKey: "surfaceThatRequiresHeating",
    subscriptions: [...TIER_FREE, ...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },
  {
    filterKey: "dpe",
    subscriptions: [...TIER_FREE, ...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },
  {
    filterKey: "associationProExternalContacts",
    subscriptions: [...TIER_FREE, ...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },
  {
    filterKey: "ownerUuid",
    subscriptions: [...TIER_FREE, ...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },
  {
    filterKey: "legalEntityUuids",
    subscriptions: [...TIER_FREE, ...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },

  // Filtres TIER 1 - accès modéré
  {
    filterKey: "creationDate",
    subscriptions: [...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },
  {
    filterKey: "nbBuildings",
    subscriptions: [...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },
  {
    filterKey: "heatingType",
    subscriptions: [...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },

  {
    filterKey: "maxConstructionPeriod",
    subscriptions: [...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },

  {
    filterKey: "sector",
    subscriptions: [...TIER_ESSENTIAL, ...TIER_PREMIUM],
  },

  // Filtres TIER 2 - accès complet
  {
    filterKey: "nbUnits",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "pmrAccessible",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "glazingArea",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "tertiaryActivityType",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "mainGesClass",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "nbParkingSpots",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "heatingSystem",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "energyType",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "nbStoreys",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "surfaceArea",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "greenhouseGasEmissionsPerSquareMeter",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "dpeEstablishedDate",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "electricityConsumptionPerSquareMeter",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "ecsGeneratorType",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "dpeCertified",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "annualElectricityConsumption",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "inertiaClass",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "glazingType",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "isInQpv",
    subscriptions: [...TIER_PREMIUM],
  },

  {
    filterKey: "nbDwellings",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "exteriorWallInsulationType",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "lowerFloorInsulationType",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "upperFloorInsulationType",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "habitableSurfaceArea",
    subscriptions: [...TIER_PREMIUM],
  },
  { filterKey: "hasAirConditioning", subscriptions: [...TIER_PREMIUM] },
  { filterKey: "ventilationType", subscriptions: [...TIER_PREMIUM] },

  {
    filterKey: "address",
    subscriptions: [...TIER_PREMIUM],
  },

  // company filters
  {
    filterKey: "name",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "nbEmployeesRange",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "nbRelatedLocations",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "mainBusinessActivity",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "nbLegalEntitiesPerLocation",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "buildingOccupancyStatus",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "legalForm",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "nbPremises",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "zipCode",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "name",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "buildingUsage",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "ipeNormalizedScore",
    subscriptions: [...TIER_PREMIUM],
  },
  {
    filterKey: "type",
    subscriptions: [...TIER_PREMIUM],
  },
] as const;

// Helper functions pour faciliter l'utilisation
export function getFilterPermissionsBySubscription(
  subscription: ProSubscription,
): FilterPermission[] {
  return FILTER_PERMISSIONS.filter((permission) =>
    permission.subscriptions.includes(subscription),
  );
}

export function getAccessibleFiltersBySubscription(
  subscription: ProSubscription,
): FilterKey[] {
  return FILTER_PERMISSIONS.filter((p) =>
    p.subscriptions.includes(subscription),
  ).map((p) => p.filterKey);
}

export function getInaccessibleFiltersBySubscription(
  subscription: ProSubscription,
): FilterKey[] {
  const accessibleFilters = getAccessibleFiltersBySubscription(subscription);
  const allFilters = FILTER_PERMISSIONS.map((f) => f.filterKey);

  return allFilters.filter((filter) => !accessibleFilters.includes(filter));
}

export function isFilterAccessibleForSubscription(
  filterKey: FilterKey,
  subscription: ProSubscription,
): boolean {
  return FILTER_PERMISSIONS.some(
    (p) => p.filterKey === filterKey && p.subscriptions.includes(subscription),
  );
}

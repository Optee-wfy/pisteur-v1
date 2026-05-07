export enum ProSubscription {
  FREE = "Free",
  IMPACT = "Impact",
  UNPAID = "Impaye",
  GROWTH = "Growth",
  PRO = "Pro",
  PRO_PLUS = "Propulse",
  ESSENTIAL = "Essentiel",
  RESIGNED = "Résilié",
}

export const SUBSCRIPTION_LABELS: Record<ProSubscription, string> = {
  [ProSubscription.ESSENTIAL]: "Essentiel",
  [ProSubscription.FREE]: "Essai Gratuit",
  [ProSubscription.IMPACT]: "Impact",
  [ProSubscription.UNPAID]: "Impayé",
  [ProSubscription.GROWTH]: "Growth",
  [ProSubscription.PRO]: "Pro",
  [ProSubscription.PRO_PLUS]: "Pro plus",
  [ProSubscription.RESIGNED]: "Résilié",
};

export type ProFeature =
  | "marketplace"
  | "signature"
  | "simulator"
  | "newsletter"
  | "mailDirect"
  | "salesManager"
  | "bizDev"
  | "leadCost";

interface SubscriptionProduct {
  type: ProSubscription;
  pricePerMonth: number;
  pricePerLead: number;
  connections: number;
  leadTerms?: string;
  features: ProFeature[];
}

export interface Feature {
  key: ProFeature;
  label: string;
}

export const FEATURES: Feature[] = [
  {
    key: "marketplace",
    label: "<strong>Accès Marketplace</strong> Optee",
  },
  {
    key: "signature",
    label: "<strong>Signature</strong> en ligne & relances",
  },
  {
    key: "simulator",
    label: "<strong>Simulateur</strong> intelligent",
  },
  { key: "newsletter", label: "<strong>Newsletter</strong> (+5000 décideurs)" },
  {
    key: "mailDirect",
    label: "<strong>Email direct</strong> (+5000 décideurs)",
  },
  {
    key: "salesManager",
    label: "<strong>Responsable Commercial</strong> dédié",
  },
  { key: "bizDev", label: "<strong>Développement Commercial</strong>" },
  { key: "leadCost", label: "<strong>Coût des leads</strong> – marketplace" },
];

/**
 * @deprecated Old subscription for marketplace leads - user PRO_PLANS instead
 */
export const SUBSCRIPTIONS: SubscriptionProduct[] = [
  {
    type: ProSubscription.ESSENTIAL,
    pricePerMonth: 49,
    pricePerLead: 49,
    connections: 0,
    leadTerms: "Limité à 3/mois",
    features: ["marketplace", "signature", "simulator", "leadCost"],
  },
  {
    type: ProSubscription.ESSENTIAL,
    pricePerMonth: 390,
    pricePerLead: 49,
    connections: 1,
    features: [
      "marketplace",
      "signature",
      "simulator",
      "newsletter",
      "mailDirect",
      "bizDev",
      "leadCost",
    ],
  },
  {
    type: ProSubscription.IMPACT,
    pricePerMonth: 790,
    pricePerLead: 0,
    connections: 3,
    features: [
      "marketplace",
      "signature",
      "simulator",
      "newsletter",
      "mailDirect",
      "salesManager",
      "bizDev",
      "leadCost",
    ],
  },
];

export const PRO_SUBSCRIPTIONS = Object.values(ProSubscription) as [
  ProSubscription,
  ...ProSubscription[],
];

export function hasFeature(
  subscription: SubscriptionProduct,
  feature: ProFeature,
) {
  return subscription.features.includes(feature);
}

// Cost of each action in credits
export const CONTACT_CONNECTION_COST = 1;
export const CONTACT_CONNECTION_COST_CYCLOPE = 3;
export const GET_PLANNED_LEAD_COST = 5;
export const CONTACT_DETAILS_ENRICHMENT_COST = 1;
export const CONTACT_DISCOVERY_COST = 2;
export const PHONE_CONTACT_ENRICHMENT_COST = 10;
export const MAIL_CONTACT_ENRICHMENT_COST = 1;
export const GET_NEW_LEAD_COST = 15;

export function getConnectionsBySubscription(type: ProSubscription) {
  return SUBSCRIPTIONS.find((sub) => sub.type === type)?.connections ?? 0;
}

export function getMaxConnections(): number {
  return Math.max(
    ...SUBSCRIPTIONS.map((sub) => getConnectionsBySubscription(sub.type) ?? 0),
  );
}

export const PRO_PLANS: Array<
  {
    subscription: ProSubscription;
    price: number;
    credits: number;
    seats: number;
    name: string;
    access: "prospect" | "full";
  } & ({ buyable: false } | { buyable: true; creditCost: number })
> = [
  {
    subscription: ProSubscription.FREE,
    price: 0,
    credits: 25,
    seats: 1,
    name: "Freemium",
    access: "prospect",
    buyable: false,
  },
  {
    subscription: ProSubscription.ESSENTIAL,
    price: 190,
    credits: 200,
    seats: 1,
    creditCost: 0.95,
    name: "Essentiel",
    access: "prospect",
    buyable: true,
  },

  {
    subscription: ProSubscription.PRO,
    price: 390,
    credits: 1000,
    seats: 2,
    creditCost: 0.39,
    name: "Pro",
    access: "prospect",
    buyable: true,
  },

  {
    subscription: ProSubscription.PRO_PLUS,
    price: 590,
    credits: 2500,
    seats: 5,
    creditCost: 0.23,
    name: "Pro Pulse",
    access: "prospect",
    buyable: true,
  },

  {
    subscription: ProSubscription.GROWTH,
    price: 790,
    credits: 1000,
    seats: 5,
    name: "Growth",
    access: "full",
    buyable: false,
  },

  {
    subscription: ProSubscription.IMPACT,
    price: 790,
    credits: 1000,
    seats: 5,
    name: "Growth",
    access: "full",
    buyable: false,
  },

  {
    subscription: ProSubscription.RESIGNED,
    price: 0,
    credits: 0,
    seats: 0,
    name: "Résilié",
    access: "prospect",
    buyable: false,
  },
] as const;

export function getProPlan(subscription: ProSubscription) {
  return PRO_PLANS.find((plan) => plan.subscription === subscription);
}
export type ProPlan = (typeof PRO_PLANS)[number];
export type StripeProPlan = Extract<ProPlan, { buyable: true }>;
export type BuyableProSubscription = Extract<
  ProPlan,
  { buyable: true }
>["subscription"];

export function getMaxSeatsAllowed(subscription: ProSubscription): number {
  const plan = getProPlan(subscription);
  return plan ? plan.seats : 0;
}

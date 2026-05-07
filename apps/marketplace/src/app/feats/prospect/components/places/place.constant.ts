import { BUILDING_USAGE_LABELS } from "@optee/constants";
import {
  IconFactoryComponent,
  IconHomeComponent,
  IconQuestionMarkComponent,
  IconStoreComponent,
} from "@optee/icons";

export const BUILDING_USAGE_WITH_ICONS = [
  {
    label: BUILDING_USAGE_LABELS.residential,
    value: "residential",
    icon: IconHomeComponent,
    description: "Copropriétés, immeubles",
    color: "#2563eb",
    bgColor: "#dbeafe",
  },
  {
    label: BUILDING_USAGE_LABELS.tertiary,
    value: "tertiary",
    icon: IconStoreComponent,
    description: "Bureaux, commerces",
    color: "#a21caf",
    bgColor: "#f3e8ff",
  },
  {
    label: BUILDING_USAGE_LABELS.industrial,
    value: "industrial",
    icon: IconFactoryComponent,
    description: "Sites de production",
    color: "#ea7a00",
    bgColor: "#fef3c7",
  },
  {
    label: BUILDING_USAGE_LABELS.other,
    value: "other",
    icon: IconQuestionMarkComponent,
    description: "Autres usages",
    color: "#475569",
    bgColor: "#e2e8f0",
  },
];

export function getBuildingUsageFromValue(value: string | null) {
  return BUILDING_USAGE_WITH_ICONS.find((usage) => usage.value === value);
}

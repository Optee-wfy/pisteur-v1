import type { XFactorsKey } from "@optee/constants";
import type { Location } from "@optee/models";

// on utilise `keyof` pour récupérer les propriétés de Location et bdnbResponse et on utilise Pick pour sélectionner celles qui sont pertinentes (et synchronisées)
export type LocationBdnbProperty = keyof Location;

export type BdnbPrimarySection = "characteristics" | "energy";

export type BdnbSecondarySection =
  | "structure"
  | "usage"
  | "dpeDetail"
  | "hvac"
  | "pdl"
  | "envelope"
  | "network"
  | "risks";

export type BdnbPropertyCategoryKey =
  | "characteristics"
  | "energy"
  | "estimatedConsumption"
  | "estimatedEnergyProfile"
  | "structure"
  | "usage"
  | "dpeDetail"
  | "hvac"
  | "pdl"
  | "envelope"
  | "network"
  | "risks";

export type BdnbPropertyCategory = {
  key: BdnbPropertyCategoryKey;
  label: string;
  properties: BdnbPropConfig[];
};

export type DataSource = {
  label: string;
  bgColor: string;
};

export type SupportedPipe =
  | "roundedNumber"
  | "roundedCurrency"
  | "toBoolean"
  | "placeSector"
  | "heatingType"
  | "ventilationType"
  | "shutterType";

export type BdnbPropConfig = {
  key: LocationBdnbProperty;
  editable: boolean; // ← le champ est-il modifiable ?
  onlyWhenReadonly?: boolean; // ← le champ est-il visible uniquement en mode lecture seule ?
  label: string;
  inputType?: "dropdown" | "inputnumber" | "datepicker";
  pipe?: SupportedPipe;
  suffix?: string;
  highlight?: XFactorsKey;
};

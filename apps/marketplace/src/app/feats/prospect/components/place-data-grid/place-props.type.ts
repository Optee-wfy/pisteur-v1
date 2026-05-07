import type { XFactorsKey } from "@optee/constants";
import type { ExternalLocation } from "@optee/models";

export type PlacePropertyKey = keyof ExternalLocation;

export type PlacePropertyCategoryKey =
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

export type DataSource = {
  label: string;
  bgColor: string;
};

export type PlacePropertyCategory = {
  key: PlacePropertyCategoryKey;
  label: string;
  properties: PlacePropConfig[];
  dataSources: DataSource[];
  customRender?: boolean;
  isOpen?: boolean;
};

export type PlacePropConfig = {
  key: PlacePropertyKey;
  label: string;
  format?: (value: any) => string;
  suffix?: string;
  highlight?: XFactorsKey;
  estimated?: boolean;
};

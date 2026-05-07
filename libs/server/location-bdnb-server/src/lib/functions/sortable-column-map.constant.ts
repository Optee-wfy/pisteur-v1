import { locationsBdnbTable } from "@optee/models";

export const SORTABLE_COLUMN_MAP = {
  name: locationsBdnbTable.name,
  surfaceThatRequiresHeating: locationsBdnbTable.surfaceThatRequiresHeating,
  dpeLabel: locationsBdnbTable.dpeLabel,
  creationDate: locationsBdnbTable.creationDate,
  nbUnits: locationsBdnbTable.nbUnits,
  annualElectricityConsumption: locationsBdnbTable.annualElectricityConsumption,
} as const;

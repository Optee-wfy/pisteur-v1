import type { OperationHsId, OperationUuid } from "../src/index";

export const FAKE_OPERATION_VALID = {
  uuid: "1234" as OperationUuid,
  id: "5678" as OperationHsId,
  phase: "694365148",
  name: "Fake isolation",
  prestationId: "ISOLATION DES COMBLES",
  createdAt: "2023-01-01T00:00:00Z",
  cost: 30359,
  costTTC: 1200,
  funding: 500,
  remainingAmount: 100,
  additionalInfo: "Additional information",
  estimatedCost: 1100,
  estimatedFunding: 600,
  estimatedEnergyImpact: 0.142,
  annualElectricityConsumptionBefore: 423969,
  greenhouseGasEmissionsBefore: 88836,
  botBrief: null,
  plannedBudgetRange: "1000-1500",
  category: "Isolation enveloppe, fenêtres, menuiserie",
} as const;

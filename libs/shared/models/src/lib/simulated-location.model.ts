import type {
  OperationHubspotCategory,
  OperationSubTypeInfo,
  OperationTypology,
} from "@optee/constants";
import {
  getOperationTypeCost,
  getOperationTypeFunding,
  getOperationTypeImpact,
  getPrestationParentCategory,
  OPERATION_TYPES_ARR,
  OperationPhaseEnum,
  OperationType,
  SIMULATION_BASE_UUID,
  XFactorParamsSchema,
} from "@optee/constants";
import { isNotNullish } from "@optee/utils";
import { z } from "zod";
import { isOpteeLocation, type Location } from "./location.model";
import { OperationRow } from "./operation.model";
import type {
  HubspotNewOperation,
  OperationHsId,
  OperationUuid,
} from "./schema";

export const LocationSimulatorSchema = z.object({
  accountName: z.string(),
  buildingName: z.string(),
  streetNumber: z.string().nullish(),
  streetName: z.string(),
  zipcode: z.string(),
  city: z.string(),
  operationSimulatedBy: z.string().nullish(),
});
export type LocationToSimulate = z.infer<typeof LocationSimulatorSchema>;

export function simulateOperationsFromLocation(
  location: Location,
  activeTypeFilters?: OperationHubspotCategory[] | null,
  activeTypologyFilter?: OperationTypology | null,
) {
  const OPERATION_FILTERED_SUBTYPES = OPERATION_TYPES_ARR.filter(
    (ot) =>
      !activeTypeFilters || activeTypeFilters.includes(ot.hsOperationCategory),
  )
    .filter(
      (ot) => !activeTypologyFilter || ot.typologie === activeTypologyFilter,
    )
    .map((t) => t.subTypes)
    .flat();

  return OPERATION_FILTERED_SUBTYPES.filter(
    (op) =>
      getPrestationParentCategory(op.hsPrestationId).type !==
      OperationType.CONTRACT,
  )
    .filter((operationSubType) =>
      location.isCompatibleWithOperation(operationSubType.hsPrestationId),
    )
    .map((operationSubType) =>
      simulateOperationFromLocationAndOperationSubType({
        location,
        operationSubType,
      }),
    )
    .filter(isNotNullish);
}

export function simulateOperationFromLocationAndOperationSubType({
  location,
  operationSubType,
}: {
  location: Location;
  operationSubType: OperationSubTypeInfo;
}): OperationRow | null {
  const xFactor = XFactorParamsSchema.safeParse(location);
  if (!xFactor.success) {
    console.error("Invalid location for simulation", xFactor.error);
    return null;
  }

  const xFactorParams = xFactor.data;

  const estimatedCost = getOperationTypeCost(
    operationSubType,
    xFactorParams,
  ).data;

  const estimatedFunding = getOperationTypeFunding(
    operationSubType,
    xFactorParams,
  ).data;

  const estimatedEnergyImpact = getOperationTypeImpact(
    operationSubType,
    xFactorParams,
  ).data;

  const { hsOperationCategory: category } = getPrestationParentCategory(
    operationSubType.hsPrestationId,
  );

  const hubspotOperation: HubspotNewOperation = {
    uuid: `${SIMULATION_BASE_UUID}${operationSubType.hsPrestationId}_${location.uuid}` as OperationUuid,
    id: `id_${operationSubType.hsPrestationId}_${location.uuid}` as OperationHsId,
    type: OperationType.WORK,
    category,
    name: `${operationSubType.hubspotTrigram} / ${location.streetNumber} ${location.streetName}`,
    phase: OperationPhaseEnum.PROJECT_PHASE,
    prestationId: operationSubType.hsPrestationId,
    estimatedCost,
    estimatedFunding,
    estimatedEnergyImpact,
    annualElectricityConsumptionBefore: location.annualElectricityConsumption,
    greenhouseGasEmissionsBefore: location.annualGhg,
  };

  if (isOpteeLocation(location)) {
    return OperationRow.initWithAssociations({
      input: hubspotOperation,
      location,
    });
  }
  return null;
}

import { OperationPhaseEnum } from "@optee/constants";
import { describe, expect, it } from "vitest";
import { FAKE_LOCATION_VALID } from "../../mocks/location.fake";
import { FAKE_OPERATION_VALID } from "../../mocks/operation.fake";
import type { Location } from "./location.model";
import { Operation, OperationRow } from "./operation.model";

describe("Operation Model", () => {
  it("should initialize an Operation with valid input", () => {
    const operation = Operation.init(FAKE_OPERATION_VALID);
    expect(operation).not.toBeNull();
    expect(operation?.uuid).toBe(FAKE_OPERATION_VALID.uuid);
    expect(operation?.name).toBe(FAKE_OPERATION_VALID.name);
    expect(operation?.prestationId).toBe(FAKE_OPERATION_VALID.prestationId);
    expect(operation?.createdAt).toStrictEqual(
      new Date(FAKE_OPERATION_VALID.createdAt as string),
    );
  });

  it("should throw an error with invalid input", () => {
    const invalidOperationInput = {
      ...FAKE_OPERATION_VALID,
      phase: "INVALID_PHASE",
    };
    const operation = Operation.init(invalidOperationInput);
    expect(operation).toBeNull();
  });

  it("should calculate estimated values correctly", () => {
    const operation = Operation.init(FAKE_OPERATION_VALID);
    expect(operation?.estimatedElectricityConsumptionAfter).toBe(423366.96402);
    expect(operation?.estimatedAnnualSavings).toBe(132.44791559999692);
  });

  it("should return correct status data", () => {
    const operation = Operation.init(FAKE_OPERATION_VALID);
    expect(operation?.phase.enum).toBe(OperationPhaseEnum.PROJECT_PHASE);
  });

  it("should return correct ROI score", () => {
    const operation = Operation.init(FAKE_OPERATION_VALID);
    expect(operation?.roiScore).toBe(47);
  });

  it("should return correct formatted sentence", () => {
    const operation = Operation.init(FAKE_OPERATION_VALID);
    expect(operation?.formattedSentence).toBe(
      "une opération d'isolation de combles",
    );
  });

  it("should return correct CEE file", () => {
    const operation = Operation.init(FAKE_OPERATION_VALID);
    const ceeFile = operation?.getCeeFile("resi");
    expect(ceeFile).not.toBeNull();
  });
});

describe("OperationRow Model", () => {
  const location = FAKE_LOCATION_VALID as Location;
  const validOperationInput = FAKE_OPERATION_VALID;

  it("should initialize an OperationRow with valid input", () => {
    const operationRow = OperationRow.initWithAssociations({
      input: validOperationInput,
      location,
      invoiceStage: null,
    });
    expect(operationRow).not.toBeNull();
  });

  it("should return correct sortable values", () => {
    const operationRow = OperationRow.initWithAssociations({
      input: validOperationInput,
      location,
      invoiceStage: null,
    });
    expect(operationRow?.sortableCost).toBe(1200);
    expect(operationRow?.sortableFunding).toBe(500);
    expect(operationRow?.sortableRemainingAmount).toBe(700);
  });

  it("should return correct estimated payback period formatted", () => {
    const operationRow = OperationRow.initWithAssociations({
      input: validOperationInput,
      location,
      invoiceStage: null,
    });
    expect(operationRow?.estimatedPaybackPeriodFormatted).toBe(
      "5 ans et 3 mois",
    );
  });

  it("should throw an error with invalid input", () => {
    const invalidOperationInput = {
      ...validOperationInput,
      phase: "INVALID_PHASE",
    };
    const operationRow = OperationRow.initWithAssociations({
      input: invalidOperationInput,
      location,
      invoiceStage: null,
    });
    expect(operationRow).toBeNull();
  });
});

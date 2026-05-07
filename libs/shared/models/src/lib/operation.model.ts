import type {
  MainSector,
  OperationBrief,
  OperationHubspotCategory,
  OperationHubspotPrestationId,
  OperationIcon,
  OperationPhaseInfos,
  OperationPhaseLabel,
  OperationSubTypeInfo,
  OperationTypeInfo,
  PhaseInformation,
  XFactorParams,
} from "@optee/constants";
import {
  BOT_BRIEF_SCHEMA,
  buildAssetUrl,
  FUNDING_CATEGORY,
  getOperationPhaseFromEnum,
  getOperationTypeCeeFile,
  getOperationTypeCost,
  getOperationTypeFunding,
  getPrestationParentCategory,
  getTypeByHubspotPrestationId,
  KWH_PRICE,
  OPERATION_HUBSPOT_CATEGORIES,
  OPERATION_HUBSPOT_PRESTATION_IDS,
  OperationPhaseEnum,
  OperationType,
  PRO_MARKETPLACE_PHASES,
  SIMULATION_BASE_UUID,
  UserType,
  X_FACTOR_LABELS,
  XFactorParamsSchema,
  XFactorsKey,
} from "@optee/constants";
import {
  formatDuration,
  getCurrencyRange,
  getDurationRange,
  isNotNullish,
  isNullish,
} from "@optee/utils";
import { z, ZodError } from "zod";
import type { Client } from "./client.model";
import { type ExternalLocation, type Location } from "./location.model";
import type { Pro } from "./pro.model";
import type {
  ContactUuid,
  HubspotOperation,
  LocationUuid,
  ProUuid,
} from "./schema";
import { OperationHsId, OperationUuid } from "./schema";

// @todo we need to extract this in two separate declaration: preview & details

/**
 * Schema used to initialize an Operation object
 */
const operationSchema = z.object({
  uuid: OperationUuid,
  id: OperationHsId.nullable(), // Might not be synced with HubSpot yet
  phase: z.nativeEnum(OperationPhaseEnum),
  name: z.string().nullable(),
  category: z.enum(OPERATION_HUBSPOT_CATEGORIES).nullable(),
  createdAt: z.string().nullish(),
  cost: z.number().nullish(),
  costTTC: z.number().nullish(),
  funding: z.number().nullish(),
  launchingDate: z.string().nullish(),
  closedDate: z.coerce.date().nullish(),
  plannedLaunchDate: z.string().nullish(),
  completionDate: z.string().nullish(),
  prestationId: z.enum(OPERATION_HUBSPOT_PRESTATION_IDS),
  plannedBudget: z.number().nullish(),
  remainingAmount: z.number().nullish(),
  additionalInfo: z.string().nullish(),
  estimatedCost: z.number().nullish(),
  estimatedFunding: z.number().nullish(),
  estimatedEnergyImpact: z.number().nullish(),
  annualElectricityConsumptionBefore: z.number().nullish(),
  greenhouseGasEmissionsBefore: z.number().nullish(),
  botBrief: BOT_BRIEF_SCHEMA.nullish(),
  plannedBudgetRange: z.string().nullish(),
  isFromDtg: z.boolean().default(false),
});

type EstimatedOrNotValue = {
  isEstimated: boolean;
  value: number | null;
  range: string | null;
};

export class Operation {
  uuid: OperationUuid;
  id: OperationHsId | null;
  name: string | null;
  label: string;
  icon: OperationIcon | null = null;
  phase: OperationPhaseInfos;
  category: OperationHubspotCategory | null;
  typeCategory: OperationType;
  prestationId: OperationHubspotPrestationId;
  botBrief: OperationBrief | null;
  createdAt: Date | null;
  cost: EstimatedOrNotValue;
  storedEstimatedCost: number | null;
  storedEstimatedFunding: number | null;
  funding: EstimatedOrNotValue;
  remainingAmount: EstimatedOrNotValue;
  plannedLaunchDate: Date | null;
  launchingDate: Date | null;
  closedDate: Date | null;
  completionDate: Date | null;
  plannedBudget: number | null;
  plannedBudgetRange: string | null;
  additionalInfo: string | null;
  annualElectricityConsumptionBefore: number | null;
  estimatedElectricityConsumptionAfter: number | null;
  estimatedElectricityConsumptionAnnualSavings: number | null;
  greenhouseGasEmissionsBefore: number | null;
  estimatedGreenhouseGasEmissionsAfter: number | null;
  estimatedEnergyImpact: number | null;
  estimatedAnnualSavings: number | null;
  estimatedAnnualSavingsRange: string | null;
  estimatedPaybackPeriod: number | null;
  estimatedPaybackPeriodRange: string | null;
  typeInfo: OperationSubTypeInfo;
  parentTypeInfo: OperationTypeInfo;
  image: string;
  isFunding: boolean;
  started: boolean;
  canBeDeleted: boolean;
  displayFor: UserType;
  isFromDtg: boolean;

  protected constructor(
    input: Partial<HubspotOperation>,
    displayFor = UserType.CLIENT,
  ) {
    const hsOperation = operationSchema.parse(input);

    this.uuid = hsOperation.uuid;
    this.id = hsOperation.id ?? null;
    this.name = hsOperation.name ?? null;
    this.displayFor = displayFor;
    this.prestationId = hsOperation.prestationId;
    this.createdAt = hsOperation.createdAt
      ? new Date(hsOperation.createdAt)
      : null;
    this.phase = getOperationPhaseFromEnum(hsOperation.phase, displayFor);
    this.category = hsOperation.category;
    this.started = Operation.hasOperationStarted(this);
    this.canBeDeleted = Operation.canBeDeleted(this);

    this.launchingDate = hsOperation.launchingDate
      ? new Date(hsOperation.launchingDate)
      : null;
    this.plannedLaunchDate = hsOperation.plannedLaunchDate
      ? new Date(hsOperation.plannedLaunchDate)
      : null;
    this.completionDate = hsOperation.completionDate
      ? new Date(hsOperation.completionDate)
      : null;
    this.closedDate = hsOperation.closedDate
      ? new Date(hsOperation.closedDate)
      : null;

    this.plannedBudget = hsOperation.plannedBudget ?? null;
    this.plannedBudgetRange = hsOperation.plannedBudgetRange ?? null;
    this.botBrief = hsOperation.botBrief ?? null;
    this.additionalInfo = hsOperation.additionalInfo ?? null;

    this.annualElectricityConsumptionBefore =
      hsOperation.annualElectricityConsumptionBefore ?? null;
    this.greenhouseGasEmissionsBefore =
      hsOperation.greenhouseGasEmissionsBefore ?? null;

    const typeInfo = Operation.validateDisplay({
      uuid: this.uuid,
      prestationId: this.prestationId,
    });

    if (!typeInfo) {
      throw new Error(`Aucun typeInfo trouvé pour l’opération ${this.uuid}`);
    }

    this.typeInfo = typeInfo;

    this.label = typeInfo.label;
    this.parentTypeInfo = getPrestationParentCategory(typeInfo.hsPrestationId);
    this.icon = this.parentTypeInfo.icon;

    this.isFunding = this.category === FUNDING_CATEGORY;

    // You can't rely on "prestationId" (thus "parentTypeInfo") to determine the typeInfo of a funding request
    this.typeCategory = this.isFunding
      ? OperationType.FUNDING
      : this.parentTypeInfo.type;

    this.storedEstimatedCost = hsOperation.estimatedCost ?? null;

    let cost: number | null = null;

    if (this.typeCategory !== OperationType.CONTRACT) {
      if (isNotNullish(hsOperation.costTTC)) {
        cost = hsOperation.costTTC;
      } else if (isNotNullish(hsOperation.estimatedCost)) {
        cost = hsOperation.estimatedCost;
      }
    }

    this.cost = {
      value: cost,
      isEstimated: isNullish(hsOperation.costTTC),
      range: this.typeInfo.gap
        ? getCurrencyRange({ value: cost, gap: this.typeInfo.gap })
        : null,
    };

    this.storedEstimatedFunding = hsOperation.estimatedFunding ?? null;

    let funding: number | null = null;

    if (this.typeCategory !== OperationType.CONTRACT) {
      if (isNotNullish(hsOperation.funding)) {
        funding = hsOperation.funding;
      } else if (isNotNullish(hsOperation.estimatedFunding)) {
        funding = hsOperation.estimatedFunding;
      }
    }

    this.funding = {
      value: funding,
      isEstimated: hsOperation.funding !== 0 && !hsOperation.funding,
      range: null,
    };

    if (this.funding.value) {
      // Fundings can never be higher than the cost
      this.funding.value = Math.min(this.cost.value ?? 0, this.funding.value);
      this.funding.range = this.typeInfo.gap
        ? getCurrencyRange({
            value: this.funding.value,
            gap: this.typeInfo.gap,
          })
        : null;
    }

    const remainingAmount =
      this.cost.value !== null
        ? this.cost.value - (this.funding.value ?? 0)
        : null;

    this.remainingAmount = {
      value: remainingAmount,
      isEstimated: this.cost.isEstimated || this.funding.isEstimated,
      range: this.typeInfo.gap
        ? getCurrencyRange({
            value: remainingAmount,
            gap: this.typeInfo.gap,
          })
        : null,
    };

    // The data in DB looks like 14.2% but we want to have the 0.142 value
    this.estimatedEnergyImpact = hsOperation.estimatedEnergyImpact
      ? hsOperation.estimatedEnergyImpact / 100
      : null;

    const estimatedEnergyImpactValue =
      this.annualElectricityConsumptionBefore && this.estimatedEnergyImpact
        ? this.annualElectricityConsumptionBefore * this.estimatedEnergyImpact
        : null;

    this.estimatedElectricityConsumptionAfter =
      this.annualElectricityConsumptionBefore && estimatedEnergyImpactValue
        ? this.annualElectricityConsumptionBefore - estimatedEnergyImpactValue
        : null;

    this.estimatedElectricityConsumptionAnnualSavings =
      this.annualElectricityConsumptionBefore &&
      this.estimatedElectricityConsumptionAfter
        ? this.annualElectricityConsumptionBefore -
          this.estimatedElectricityConsumptionAfter
        : null;

    this.estimatedAnnualSavings = this
      .estimatedElectricityConsumptionAnnualSavings
      ? this.estimatedElectricityConsumptionAnnualSavings * KWH_PRICE
      : null;

    this.estimatedAnnualSavingsRange = this.typeInfo.gap
      ? getCurrencyRange({
          value: this.estimatedAnnualSavings,
          gap: this.typeInfo.gap,
        })
      : null;

    if (this.remainingAmount.value === 0) {
      this.estimatedPaybackPeriod = 0;
    } else {
      this.estimatedPaybackPeriod = this.estimatedAnnualSavings
        ? Math.max(
            0,
            (this.remainingAmount.value ?? 0) / this.estimatedAnnualSavings,
          )
        : null;
    }

    this.estimatedPaybackPeriodRange = this.typeInfo.gap
      ? getDurationRange({
          value: this.estimatedPaybackPeriod,
          gap: this.typeInfo.gap,
        })
      : null;

    this.estimatedGreenhouseGasEmissionsAfter =
      this.greenhouseGasEmissionsBefore && this.estimatedEnergyImpact
        ? this.greenhouseGasEmissionsBefore * this.estimatedEnergyImpact
        : null;

    this.image = buildAssetUrl(typeInfo.publicAssetPath ?? "batiment.png");
    this.isFromDtg = hsOperation.isFromDtg;
  }

  static init(input: Partial<HubspotOperation>, userType = UserType.CLIENT) {
    try {
      return new Operation(input, userType);
    } catch (e) {
      const message =
        e instanceof ZodError
          ? `Opération invalide [uuid: ${input.uuid}]: ${e.message}`
          : e;
      console.error("Erreur lors de l'affichage d'une opération:", {
        error: message instanceof Error ? message.message : String(message),
        uuid: input.uuid,
        input,
      });
      return null;
    }
  }

  static hasOperationStarted(operation: { phase: OperationPhaseInfos | null }) {
    if (!operation.phase) {
      return false;
    }

    return (
      operation.phase.category === "in_progress" ||
      operation.phase.category === "archived"
    );
  }

  static canBeDeleted(operation: { phase: OperationPhaseInfos | null }) {
    return operation.phase?.category === "upcoming";
  }

  static validateDisplay({
    uuid,
    prestationId,
  }: {
    uuid: OperationUuid;
    prestationId: OperationHubspotPrestationId | null;
  }) {
    const typeInfo = getTypeByHubspotPrestationId(prestationId);
    if (!typeInfo) {
      throw new Error(
        `Impossible d'initialiser une opération dont la prestation ne correspond à aucun type connu [uuid: ${uuid}, prestationId: ${prestationId}]`,
      );
    }
    return typeInfo;
  }

  static labelFromPhase(phase: OperationPhaseEnum, isFromDtg: boolean) {
    if (phase === OperationPhaseEnum.PROJECT_PHASE) {
      return isFromDtg ? "Opération préconisée" : "Opération prévue";
    }
    if (PRO_MARKETPLACE_PHASES.includes(phase)) {
      return "Appel d'offres";
    }
    return undefined;
  }

  get fundingRatio() {
    if (this.cost.value === null || this.funding.value === null) {
      return 0;
    }

    return this.funding.value / this.cost.value;
  }

  get isInProgress() {
    return this.phase.category === "in_progress";
  }

  get roiScore() {
    if (
      this.estimatedPaybackPeriod === null ||
      this.estimatedPaybackPeriod > 10
    ) {
      return 0;
    }

    const roiScore = 100 * (1 - this.estimatedPaybackPeriod / 10);

    return Math.round(roiScore);
  }

  get fundingScore() {
    const fundingScore = Math.sqrt(this.fundingRatio * 100) * 10;
    return Math.round(fundingScore);
  }

  get complexityScore() {
    return 100 * (1 - (this.typeInfo.complexity - 1) / 4);
  }

  get score() {
    return Math.round(
      (this.roiScore + this.fundingScore + this.complexityScore) / 3,
    );
  }

  get formattedSentence() {
    return getTypeByHubspotPrestationId(this.prestationId)?.formattedSentence;
  }

  get isLaunchable() {
    return !this.isFunding && this.phase.isLaunchable;
  }

  static isUuidSimulated(uuid: string) {
    return uuid.startsWith(SIMULATION_BASE_UUID);
  }

  get isSimulation() {
    return Operation.isUuidSimulated(this.uuid);
  }

  get estimatedPaybackPeriodFormatted(): string {
    return this.estimatedPaybackPeriod === null
      ? "--"
      : formatDuration(this.estimatedPaybackPeriod);
  }

  get needsSimulation() {
    return (
      typeof this.storedEstimatedCost !== "number" &&
      typeof this.cost.value !== "number"
    );
  }

  get phaseEnum() {
    return this.phase.enum;
  }

  get sortableCost() {
    return this.cost.value ?? 0;
  }

  get sortableFunding() {
    return this.funding.value ?? 0;
  }

  get sortableRemainingAmount() {
    return this.remainingAmount.value ?? 0;
  }

  getCeeFile(mainSector: MainSector) {
    const ceeFile = getOperationTypeCeeFile(this.typeInfo, mainSector);
    if (!ceeFile) {
      return null;
    }

    return this.typeInfo.ceeFileLabel
      ? {
          name: this.typeInfo.ceeFileLabel,
          file: ceeFile,
        }
      : null;
  }

  supportsAnalysis() {
    return (
      this.typeCategory !== OperationType.FUNDING &&
      getPrestationParentCategory(this.typeInfo.hsPrestationId).supportsAnalysis
    );
  }
}

export abstract class DisplayedOperation extends Operation {
  abstract location: Location;
  abstract nameWithFallback: string;
  isAlreadyOrdered = false;
  projectedEstimatedCost: number | null;
  projectedEstimatedFunding: number | null;
  missingXFactors: XFactorsKey[];
  missingXFactorsLabel: string;
  status: {
    badge: PhaseInformation["badge"];
    category: PhaseInformation["category"];
    label: OperationPhaseLabel;
    description: string;
  };

  constructor({
    input,
    location,
    displayFor = UserType.CLIENT,
  }: {
    input: Partial<HubspotOperation>;
    location: Location | ExternalLocation;
    displayFor?: UserType;
  }) {
    super(input, displayFor);

    let xFactorParams: XFactorParams = {};

    try {
      xFactorParams = XFactorParamsSchema.parse(location);
    } catch (e) {
      xFactorParams = {};
    }

    const estimatedCost = getOperationTypeCost(this.typeInfo, xFactorParams);

    this.projectedEstimatedCost = estimatedCost.data;

    const estimatedFunding = getOperationTypeFunding(
      this.typeInfo,
      xFactorParams,
    );

    this.projectedEstimatedFunding = estimatedFunding.data;

    this.missingXFactors = Array.from(
      new Set([
        ...(estimatedCost.missingXFactorParams ?? []),
        ...(estimatedFunding.missingXFactorParams ?? []),
      ]),
    ).filter(isNotNullish);

    this.missingXFactorsLabel = this.missingXFactors
      .map((xFactor) => X_FACTOR_LABELS[xFactor])
      .join(", ");

    this.status = {
      badge: this.phase.badge,
      category: this.phase.category,
      label: this.phase.label,
      description: this.phase.description ?? "Aucune description",
    };
  }

  get locationBdnbStatus() {
    return this.location.bdnbFailureEmoji;
  }

  get sortablePhase() {
    return this.status.label;
  }

  get sortableEstimatedCostComparison() {
    return this.projectedEstimatedCost ?? 0;
  }

  get sortableEstimatedFundingComparison() {
    return this.projectedEstimatedFunding ?? 0;
  }

  get xFactorMain() {
    return this.typeInfo.xFactorParams[0] ?? null;
  }

  // Détermine l'unité basée sur les xFactorParams utilisés
  get xFactorUnit() {
    const xFactorMain = this.xFactorMain;

    if (
      xFactorMain === XFactorsKey.SURFACE_AREA ||
      xFactorMain === XFactorsKey.FACADE_AREA ||
      xFactorMain === XFactorsKey.GLAZING_AREA
    ) {
      return "m²";
    }

    if (xFactorMain === XFactorsKey.NB_UNITS) {
      return "lot(s)";
    }

    if (xFactorMain === XFactorsKey.NB_BUILDINGS) {
      return "bâtiment(s)";
    }

    if (xFactorMain === XFactorsKey.NB_STOREYS) {
      return "niveau(x)";
    }

    if (xFactorMain === XFactorsKey.ELECTRICITY_CONSUMPTION_PER_SQUARE_METER) {
      return "kWh/m²";
    }

    return "--";
  }

  get xFactorValue() {
    const xFactorKey = this.xFactorMain;
    if (!xFactorKey) {
      return null;
    }
    return this.location[xFactorKey];
  }

  get xFactorValueFormatted() {
    const xFactorValue = this.xFactorValue;
    if (xFactorValue === null) {
      return "N/A";
    }

    return `${xFactorValue} ${this.xFactorUnit}`;
  }

  get xFactorLabel() {
    const xFactorKey = this.typeInfo.xFactorParams[0];
    if (!xFactorKey) {
      return "Volume potentiel";
    }

    return X_FACTOR_LABELS[xFactorKey];
  }

  get hasSignatoryContact() {
    return false;
  }

  get needsResimulate() {
    if (
      typeof this.storedEstimatedCost === "number" &&
      typeof this.projectedEstimatedCost === "number" &&
      this.storedEstimatedCost !== this.projectedEstimatedCost
    ) {
      return true;
    }

    if (
      typeof this.storedEstimatedFunding === "number" &&
      typeof this.projectedEstimatedFunding === "number" &&
      this.storedEstimatedFunding !== this.projectedEstimatedFunding
    ) {
      return true;
    }

    // In order to be sure that an operation has been simulated we store "0" instead of "null" in DB
    // So a "null" projectedValue is the same as a "0" storedValue

    if ((this.projectedEstimatedCost ?? 0) !== this.storedEstimatedCost) {
      return true;
    }

    if ((this.projectedEstimatedFunding ?? 0) !== this.storedEstimatedFunding) {
      return true;
    }

    return false;
  }

  get sortableSector() {
    return this.location.mainSectorLabel;
  }

  get locationCreationDate() {
    return this.location.creationDate;
  }

  get dpeLabel() {
    return this.location.dpeLabel;
  }

  /**
   * Calcule une note basée sur 5 critères de faisabilité (sur 10 points total)
   * 1. Faisabilité (bloquant) - 0 point si non réalisable
   * 2. Coût estimatif travaux (/30)
   * 3. Niveau de subvention CEE (/30)
   * 4. Reste à charge client estimé (/30)
   * 5. Note DPE (/10)
   */
  get feasibilityScore(): number {
    // 1. Critère de faisabilité (bloquant)
    if (!this.isFeasible) {
      return 0;
    }

    let score = 0;

    // 2. Coût estimatif travaux (/30)
    score += this.costScore;

    // 3. Niveau de subvention CEE (/30)
    score += this.subventionScore;

    // 4. Reste à charge client estimé (/30)
    score += this.remainingAmountScore;

    // 5. Note DPE (/10)
    score += this.dpeScore;

    return score;
  }

  /**
   * Vérifie si l'opération est réalisable selon les critères de base
   */
  get isFeasible(): boolean {
    // Vérification basée sur les incompatibilités sectorielles et de système de chauffage
    // Si l'opération a des facteurs manquants critiques, elle pourrait ne pas être faisable
    return this.missingXFactors.length === 0;
  }

  /**
   * Score basé sur le coût estimatif des travaux (/3)
   */
  get costScore(): number {
    const cost = this.cost.value;
    if (cost === null) {
      return 0;
    }

    if (cost <= 5000) {
      return 10;
    }
    if (cost <= 12500) {
      return 20;
    }
    return 30;
  }

  /**
   * Score basé sur le niveau de subvention CEE (/3)
   */
  get subventionScore(): number {
    const fundingRatio = this.fundingRatio;
    const fundingPercentage = fundingRatio * 100;

    if (fundingPercentage === 0) {
      return 0;
    }
    if (fundingPercentage <= 30) {
      return 10;
    }
    if (fundingPercentage <= 70) {
      return 20;
    }
    return 30;
  }

  /**
   * Score basé sur le reste à charge client estimé (/3)
   */
  get remainingAmountScore(): number {
    const remainingAmount = this.remainingAmount.value;
    if (remainingAmount === null) {
      return 0;
    }

    if (remainingAmount >= 15001) {
      return 0;
    }
    if (remainingAmount >= 10001) {
      return 10;
    }
    if (remainingAmount >= 5001) {
      return 20;
    }
    return 30;
  }

  /**
   * Score basé sur la note DPE (/1)
   */
  get dpeScore(): number {
    const dpe = this.location.dpeLabel;

    // A à C ou inconnu → 0 pt
    if (!dpe || ["A", "B", "C"].includes(dpe)) {
      return 0;
    }

    // D à G → 10 pts
    if (["D", "E", "F", "G"].includes(dpe)) {
      return 10;
    }

    return 0;
  }
}

export class OperationRow extends DisplayedOperation {
  location: Location;
  client: Client | null;
  nameWithFallback: string;
  proUuid: ProUuid | null;

  protected constructor({
    input,
    location,
    displayFor = UserType.CLIENT,
    client,
    proUuid,
  }: {
    input: Partial<HubspotOperation>;
    location: Location;
    displayFor?: UserType;
    client?: Client | null; // @todo: remove this null (needed cause simulation has no client)
    proUuid?: ProUuid | null;
  }) {
    super({ input, displayFor, location });
    this.location = location;
    this.client = client ?? null;
    this.proUuid = proUuid ?? null;

    this.nameWithFallback =
      this.name ??
      `${this.typeInfo.hubspotTrigram} / ${this.location.shortAddress}`;
  }

  isEqual(other: OperationRow) {
    return (
      this.typeInfo.hsPrestationId === other.typeInfo.hsPrestationId &&
      other.location.uuid === this.location.uuid
    );
  }

  isRetainedPro(uuid: ProUuid | null) {
    return this.proUuid === uuid;
  }

  static initWithAssociations({
    input,
    location,
    client,
    displayFor = UserType.CLIENT,
    proUuid,
  }: {
    input: Partial<HubspotOperation>;
    location: Location;
    client?: Client | null; // @todo: remove this null (needed cause simulation has no client)
    displayFor?: UserType;
    proUuid?: ProUuid | null;
  }) {
    try {
      return new OperationRow({
        input,
        location,
        displayFor,
        client,
        proUuid,
      });
    } catch (e) {
      const message =
        e instanceof ZodError
          ? "Opération invalide:\n" +
            e.errors
              .map(
                (err) =>
                  `- ${err.path.join(".")}: ${err.code}, reçu ${"received" in err ? err.received : "n/a"}`,
              )
              .join(",\n")
          : e;

      console.error(
        `Erreur lors de l'affichage d'une opération [${input.uuid}]: ` +
          (message instanceof Error ? message.message : message),
        input,
      );
      return null;
    }
  }
}

export type SignatoryContact = {
  readonly uuid: ContactUuid;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly email: string | null;
  readonly updatable: boolean;
};

export class OperationFull extends OperationRow {
  pro: Pro | null;
  signatoryContact: SignatoryContact | null;

  constructor(
    input: Partial<HubspotOperation>,
    location: Location,
    pro: Pro | null,
    signatoryContact: SignatoryContact | null,
    displayFor = UserType.CLIENT,
  ) {
    super({ input, location, displayFor });
    this.pro = pro;
    this.signatoryContact = signatoryContact;
  }

  override get hasSignatoryContact() {
    return !!this.signatoryContact;
  }
}

export type OperationFeasibility = {
  locationUuid: LocationUuid;
  hsPrestationId: OperationHubspotPrestationId;
  similarOperation: OperationRow | null;
  isHeatingSystemIncompatible: boolean;
  isSectorIncompatible: boolean;
};

import {
  locationBdnbLegalEntityFilterProSchema,
  type LocationsBdnbLegalEntityProListInput,
} from "@optee/constants";
import {
  type ContactUuid,
  type ExternalContactUuid,
  LeadHistoryTable,
  LeadParametersTable,
  type LocationBdnbUuid,
  type ProUuid,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq, type InferInsertModel, inArray } from "drizzle-orm";

export const ProspectRepository = {
  async addProspectParameters({
    filters,
    leadsToGenerate,
    proUuid,
    recipientContactUuid,
    sendFrequencyPerWeek,
  }: {
    filters: LocationsBdnbLegalEntityProListInput;
    leadsToGenerate: number;
    proUuid: ProUuid;
    recipientContactUuid: ContactUuid | null;
    sendFrequencyPerWeek: number;
  }) {
    const normalizedFilters =
      locationBdnbLegalEntityFilterProSchema.parse(filters);
    const values = Object.fromEntries(
      Object.entries({
        proUuid,
        leadsToGenerate,
        recipientContactUuid,
        sendFrequencyPerWeek,
        locationDepartment: normalizedFilters.locationDepartment,
        locationBuildingType: normalizedFilters.locationBuildingType,
        sector: normalizedFilters.sector,
        address: normalizedFilters.address,
        isInQpv: normalizedFilters.isInQpv,
        nbUnits: normalizedFilters.nbUnits,
        nbBuildings: normalizedFilters.nbBuildings,
        nbLegalEntitiesPerLocation:
          normalizedFilters.nbLegalEntitiesPerLocation,
        buildingOccupancyStatus: normalizedFilters.buildingOccupancyStatus,
        creationDate: normalizedFilters.creationDate,
        maxConstructionPeriod: normalizedFilters.maxConstructionPeriod,
        nbParkingSpots: normalizedFilters.nbParkingSpots,
        habitableSurfaceDwelling: normalizedFilters.habitableSurfaceDwelling,
        pmrAccessible: normalizedFilters.pmrAccessible,
        glazingType: normalizedFilters.glazingType,
        exteriorWallInsulationType:
          normalizedFilters.exteriorWallInsulationType,
        lowerFloorInsulationType: normalizedFilters.lowerFloorInsulationType,
        upperFloorInsulationType: normalizedFilters.upperFloorInsulationType,
        surfaceArea: normalizedFilters.surfaceArea,
        habitableSurfaceArea: normalizedFilters.habitableSurfaceArea,
        nbStoreys: normalizedFilters.nbStoreys,
        glazingArea: normalizedFilters.glazingArea,
        dpeCertified: normalizedFilters.dpeCertified,
        inertiaClass: normalizedFilters.inertiaClass,
        nbDwellings: normalizedFilters.nbDwellings,
        heatingSystem: normalizedFilters.heatingSystem,
        heatingType: normalizedFilters.heatingType,
        dpeLabel: normalizedFilters.dpe,
        hasAirConditioning: normalizedFilters.hasAirConditioning,
        ventilationType: normalizedFilters.ventilationType,
        ecsGeneratorType: normalizedFilters.ecsGeneratorType,
        mainGesClass: normalizedFilters.mainGesClass,
        dpeEstablishedDate: normalizedFilters.dpeEstablishedDate,
        surfaceThatRequiresHeating:
          normalizedFilters.surfaceThatRequiresHeating,
        electricityConsumptionPerSquareMeter:
          normalizedFilters.electricityConsumptionPerSquareMeter,
        greenhouseGasEmissionsPerSquareMeter:
          normalizedFilters.greenhouseGasEmissionsPerSquareMeter,
        annualElectricityConsumption:
          normalizedFilters.annualElectricityConsumption,
        nbEmployeesRange: normalizedFilters.nbEmployeesRange,
        legalEntityTypes: normalizedFilters.legalEntityTypes,
        tertiaryActivityType: normalizedFilters.tertiaryActivityType,
        nbPremises: normalizedFilters.nbPremises,
        type: normalizedFilters.type,
        buildingUsage: normalizedFilters.buildingUsage,
        ipeUsageReason: normalizedFilters.ipeUsageReason,
        ipeNormalizedScore: normalizedFilters.ipeNormalizedScore,
        legalForm: normalizedFilters.legalForm,
        mainBusinessActivity: normalizedFilters.mainBusinessActivity,
        domains: normalizedFilters.domains,
        levels: normalizedFilters.levels,
        nbRelatedLocations: normalizedFilters.nbRelatedLocations,
        name: normalizedFilters.name,
        zipCode: normalizedFilters.zipCode,
        legalEntityDepartment: normalizedFilters.legalEntityDepartment,
        height: normalizedFilters.height,
        energyType: normalizedFilters.energyType,
        hasBalcony: normalizedFilters.hasBalcony,
        multipleExposedFacades: normalizedFilters.multipleExposedFacades,
        heatingBackupEnergyType: normalizedFilters.heatingBackupEnergyType,
        solarHeating: normalizedFilters.solarHeating,
        solarEcs: normalizedFilters.solarEcs,
        wallMaterial: normalizedFilters.wallMaterial,
        roofMaterial: normalizedFilters.roofMaterial,
      }).map(([key, value]) => [key, value ?? null]),
    ) as Omit<InferInsertModel<typeof LeadParametersTable>, "uuid">;

    const [data] = await db
      .insert(LeadParametersTable)
      .values(values)
      .onConflictDoUpdate({
        target: LeadParametersTable.proUuid,
        set: values,
      })
      .returning();

    return data ?? null;
  },

  async markLeadParametersAsSent(parameterUuid: string, sentAt = new Date()) {
    const [data] = await db
      .update(LeadParametersTable)
      .set({
        lastSentAt: sentAt,
      })
      .where(eq(LeadParametersTable.uuid, parameterUuid))
      .returning({ uuid: LeadParametersTable.uuid });

    return data ?? null;
  },

  async getProspectParametersByPro(proUuid: ProUuid) {
    const [data] = await db
      .select()
      .from(LeadParametersTable)
      .where(eq(LeadParametersTable.proUuid, proUuid));

    return data ?? null;
  },

  getAllProspectParameters() {
    return db.select().from(LeadParametersTable);
  },

  async getSentLocationBdnbUuidsByPro(proUuid: ProUuid) {
    const rows = await db
      .selectDistinct({
        locationBdnbUuid: LeadHistoryTable.locationBdnbUuid,
      })
      .from(LeadHistoryTable)
      .where(eq(LeadHistoryTable.proUuid, proUuid));

    return rows.map((row) => row.locationBdnbUuid);
  },

  async addLeadHistory({
    proUuid,
    leads,
  }: {
    proUuid: ProUuid;
    leads: {
      locationBdnbUuid: LocationBdnbUuid;
      recommendedExternalContactUuid?: ExternalContactUuid | null;
    }[];
  }) {
    if (leads.length === 0) {
      return [];
    }

    const dedupedLeads = Array.from(
      new Map(
        leads.map((lead) => [lead.locationBdnbUuid, lead] as const),
      ).values(),
    );

    const rows = dedupedLeads.map(
      ({ locationBdnbUuid, recommendedExternalContactUuid }) => ({
        proUuid,
        locationBdnbUuid,
        recommendedExternalContactUuid: recommendedExternalContactUuid ?? null,
      }),
    ) satisfies Omit<
      InferInsertModel<typeof LeadHistoryTable>,
      "uuid" | "createdAt"
    >[];

    const locationBdnbUuids = rows.map((row) => row.locationBdnbUuid);
    const existingRows = await db
      .select()
      .from(LeadHistoryTable)
      .where(
        and(
          eq(LeadHistoryTable.proUuid, proUuid),
          inArray(LeadHistoryTable.locationBdnbUuid, locationBdnbUuids),
        ),
      );

    const existingByLocation = new Map(
      existingRows.map((row) => [row.locationBdnbUuid, row] as const),
    );

    const rowsToInsert = rows.filter(
      (row) => !existingByLocation.has(row.locationBdnbUuid),
    );

    const updatedRows = await Promise.all(
      rows
        .filter((row) => existingByLocation.has(row.locationBdnbUuid))
        .map((row) =>
          db
            .update(LeadHistoryTable)
            .set({
              recommendedExternalContactUuid:
                row.recommendedExternalContactUuid,
              createdAt: new Date(),
            })
            .where(
              and(
                eq(LeadHistoryTable.proUuid, proUuid),
                eq(LeadHistoryTable.locationBdnbUuid, row.locationBdnbUuid),
              ),
            )
            .returning()
            .then((result) => result[0] ?? null),
        ),
    );

    const insertedRows = rowsToInsert.length
      ? await db.insert(LeadHistoryTable).values(rowsToInsert).returning()
      : [];

    return [...updatedRows.filter((row) => row !== null), ...insertedRows];
  },

  async getLeadHistoryByLocation({
    proUuid,
    locationBdnbUuid,
  }: {
    proUuid: ProUuid;
    locationBdnbUuid: LocationBdnbUuid;
  }) {
    const [data] = await db
      .select()
      .from(LeadHistoryTable)
      .where(
        and(
          eq(LeadHistoryTable.proUuid, proUuid),
          eq(LeadHistoryTable.locationBdnbUuid, locationBdnbUuid),
        ),
      );

    return data ?? null;
  },
};

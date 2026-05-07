import {
  getIpeRawScore,
  INDUSTRIAL_LOCATION_NAF_CODES,
  mapEntrepriseToUsage,
  nafToCategory,
  SECTOR,
  TYPE_LOCATION_NAF_CODES,
  type BuildingUsage,
  type EmployeeRange,
  type IpeEffectiveUsage,
  type IpeUsageReason,
  type LocationsProListInput,
} from "@optee/constants";
import { LegalEntityRepository } from "@optee/legal-entity-server";
import type { LegalEntityUuid, LocationBdnb } from "@optee/models";
import { db } from "@optee/supabase-server";
import {
  selectReferenceCompanyFromEntities,
  type ReferenceCompanySelectionResult,
} from "../functions";
import { LocationBdnbAdminRepository } from "../repositories/location-bdnb-admin.repository";
import { SnapshotLocationBdnbProvider } from "./snapshot-location-bdnd.provider";

type IpeReferenceCompany = {
  uuid: LegalEntityUuid;
  mainBusinessActivity: string | null;
  nbEmployeesRange: EmployeeRange | null;
};

type BatchRow = Awaited<
  ReturnType<typeof LocationBdnbAdminRepository.getBatches>
>[number];
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const buildIpeUpdate = ({
  location,
  selection,
  referenceCompany,
}: {
  location: Partial<
    Pick<
      LocationBdnb,
      "buildingUsage" | "surfaceThatRequiresHeating" | "creationDate" | "height"
    >
  >;
  selection: ReferenceCompanySelectionResult;
  referenceCompany: IpeReferenceCompany | null;
}) => {
  const referenceCompanyNafCategory = nafToCategory(
    referenceCompany?.mainBusinessActivity ?? "",
  );

  const ipeUsageFromReferenceCompany = referenceCompanyNafCategory
    ? mapEntrepriseToUsage(referenceCompanyNafCategory)
    : null;

  let effectiveUsage: IpeEffectiveUsage;
  let ipeUsageReason: IpeUsageReason;
  if (location.buildingUsage && location.buildingUsage !== "other") {
    effectiveUsage = location.buildingUsage;
    ipeUsageReason = "BUILDING_USAGE";
  } else if (
    ipeUsageFromReferenceCompany &&
    ipeUsageFromReferenceCompany !== "other"
  ) {
    effectiveUsage = ipeUsageFromReferenceCompany;
    ipeUsageReason = "REFERENCE_COMPANY";
  } else {
    effectiveUsage = "tertiary";
    ipeUsageReason = "FALLBACK_TERTIARY";
  }

  const rawScore = getIpeRawScore({
    effectiveUsage: effectiveUsage,
    referenceCompanyNafCategory,
    surfaceThatRequiresHeating: location.surfaceThatRequiresHeating ?? null,
    creationDate: location.creationDate ?? null,
    height: location.height ?? null,
    nbEmployeesRange: referenceCompany?.nbEmployeesRange ?? null,
  });

  return {
    ipeUsage: effectiveUsage,
    ipeUsageReason,
    ipeRawScore: rawScore,
    referenceCompanyUuid: selection.legalEntityUuid,
    referenceCompanySelectionReason: selection.selectionReason,
  };
};

export const LocationBdnbAdminProvider = {
  deriveBuildingUsage({
    sector,
    mainBusinessActivities,
  }: {
    sector: LocationBdnb["sector"] | null | undefined;
    mainBusinessActivities: (string | null | undefined)[];
  }): BuildingUsage {
    if (
      sector === SECTOR.RESIDENTIAL ||
      sector === SECTOR.RESIDENTIAL_COLLECTIVE
    ) {
      return "residential";
    }
    if (sector === SECTOR.TERTIARY) {
      return "tertiary";
    }

    const activitySet = new Set(
      mainBusinessActivities
        .filter((code): code is string => !!code)
        .map((code) => code.trim().toUpperCase()),
    );

    const hasIndustrialType = INDUSTRIAL_LOCATION_NAF_CODES.some((code) =>
      activitySet.has(code),
    );
    const hasSitesIndustrial =
      TYPE_LOCATION_NAF_CODES.SITES_INDUSTRIELS_USINES.some((code) =>
        activitySet.has(code),
      );

    if (sector === SECTOR.OTHER && hasIndustrialType) {
      return "industrial";
    }
    if ((sector == null || sector === SECTOR.OTHER) && hasSitesIndustrial) {
      return "industrial";
    }

    return "other";
  },

  async createBatch(filters: LocationsProListInput, batchSize: number) {
    try {
      const batch = await LocationBdnbAdminRepository.getBatches(
        filters,
        batchSize,
      );

      // In createBatch we intentionally process rows sequentially via processRow:
      // parallel execution (Promise.all) can create DB contention/races when rows
      // reference the same legal entity, so do not parallelize without dedupe/locking.
      for (const raw of batch) {
        const row = raw.snapshot_public_location_bdnb_raw;
        try {
          await LocationBdnbAdminProvider.processRow(raw);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          console.error("❌ Erreur lors du traitement d'une ligne BDNB:", {
            snapshotUuid: row.uuid,
            locationGroupId: row.locationGroupId,
            sourceIndex: row.index,
            error,
          });

          try {
            await LocationBdnbAdminRepository.setAsFailedImport(
              row.uuid,
              `Erreur inattendue lors du traitement: ${errorMessage}`,
            );
          } catch (markAsFailedError) {
            console.error(
              "❌ Impossible de marquer la ligne BDNB en échec après erreur:",
              {
                snapshotUuid: row.uuid,
                locationGroupId: row.locationGroupId,
                sourceIndex: row.index,
                markAsFailedError,
              },
            );
          }
        }
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'import des données BDNB:", error);
      throw new Error(
        `Erreur lors de l'import des données BDNB: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  },

  async processRow(raw: BatchRow) {
    const { snapshot_public_location_bdnb_raw: row, geom_groupe } = raw;

    if (!geom_groupe) {
      await LocationBdnbAdminRepository.setAsFailedImport(
        row.uuid,
        "Le groupe de géométrie n'est pas défini.",
      );
      return;
    }

    const location = SnapshotLocationBdnbProvider.mapSnapshotToLocation(
      row,
      geom_groupe.geom_groupe ?? null,
    );

    if (!location || !location.zipcode || !location.city) {
      await LocationBdnbAdminRepository.setAsFailedImport(
        row.uuid,
        `Bâtiment incomplet: Champs manquants (zipcode: ${location?.zipcode}, city: ${location?.city}) - adresse source: ${row.sourceAddress}`,
      );
      return;
    }

    if (!location.locationGroupId) {
      await LocationBdnbAdminRepository.setAsFailedImport(
        row.uuid,
        "Aucun identifiant de groupe trouvé pour le bâtiment BDNB",
      );
      return;
    }
    const locationGroupId = location.locationGroupId;

    const entities =
      await SnapshotLocationBdnbProvider.extractLegalEntities(row);

    if (entities.length === 0) {
      await LocationBdnbAdminRepository.setAsFailedImport(
        row.uuid,
        "Aucune entité légale trouvée pour le bâtiment BDNB",
      );
      return;
    }

    location.buildingUsage = LocationBdnbAdminProvider.deriveBuildingUsage({
      sector: location.sector ?? null,
      mainBusinessActivities: entities.map(
        (entity) => entity.mainBusinessActivity,
      ),
    });

    try {
      await db.transaction(async (tx) => {
        const existingLocationBdnb =
          await LocationBdnbAdminRepository.getByLocationGroupId(
            locationGroupId,
            { tx },
          );

        if (existingLocationBdnb?.uuid) {
          // deriveBuildingUsage recalculates location.buildingUsage from snapshot entities,
          // but for existingLocationBdnb we intentionally preserve persisted/manual fields
          // (address/surface/height/dates/etc.) and only refresh buildingUsage via
          // LocationBdnbAdminRepository.update to avoid overwriting curated data.
          await LocationBdnbAdminRepository.update(
            existingLocationBdnb.uuid,
            {
              buildingUsage: location.buildingUsage,
            },
            { tx },
          );
        }

        const locationBdnbUuid =
          existingLocationBdnb?.uuid ??
          (await LocationBdnbAdminRepository.create(location, { tx }));

        if (!locationBdnbUuid) {
          throw new Error("Échec de la création du bâtiment BDNB");
        }

        const linkedEntities = await LocationBdnbAdminProvider.linkEntities(
          locationBdnbUuid,
          entities,
          tx,
        );

        await LocationBdnbAdminProvider.updateIpeFields(
          locationBdnbUuid,
          location,
          linkedEntities,
          tx,
        );

        await LocationBdnbAdminRepository.deleteSnapshot(row.uuid, { tx });
      });
      LocationBdnbAdminRepository.invalidateCountsCache();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("❌ Erreur transactionnelle lors du traitement BDNB:", {
        snapshotUuid: row.uuid,
        locationGroupId: row.locationGroupId,
        error,
      });
      await LocationBdnbAdminRepository.setAsFailedImport(
        row.uuid,
        `Erreur lors du traitement du bâtiment BDNB: ${errorMessage}`,
      );
    }
  },

  async linkEntities(
    locationBdnbUuid: LocationBdnb["uuid"],
    entities: Awaited<
      ReturnType<typeof SnapshotLocationBdnbProvider.extractLegalEntities>
    >,
    tx: DbTransaction,
  ): Promise<IpeReferenceCompany[]> {
    const linkedEntities: IpeReferenceCompany[] = [];
    const seenLegalEntityUuids = new Set<LegalEntityUuid>();

    for (const entity of entities) {
      const entityName = entity.name;
      if (!entityName) {
        console.warn(
          `❌ [SKIP] Aucun nom d'entreprise trouvé pour l'entité légale: ${JSON.stringify(
            entity.type,
          )} sur le bâtiment BDNB ${locationBdnbUuid}`,
        );
        continue;
      }

      const legalEntityUuid: LegalEntityUuid | null =
        await LegalEntityRepository.createOrGetByName(
          {
            ...entity,
            name: entityName,
          },
          { tx },
        );

      if (!legalEntityUuid) {
        console.error(
          "❌ Création/récupération de l'entité légale échouée, association ignorée.",
        );
        continue;
      }
      if (seenLegalEntityUuids.has(legalEntityUuid)) {
        continue;
      }
      seenLegalEntityUuids.add(legalEntityUuid);

      await LegalEntityRepository.createAssociationWithLocationBdnb(
        locationBdnbUuid,
        legalEntityUuid,
        { tx },
      );

      linkedEntities.push({
        uuid: legalEntityUuid,
        mainBusinessActivity: entity.mainBusinessActivity ?? null,
        nbEmployeesRange: entity.nbEmployeesRange ?? null,
      });
    }

    return linkedEntities;
  },

  async updateIpeFields(
    locationBdnbUuid: LocationBdnb["uuid"],
    location: Partial<
      Pick<
        LocationBdnb,
        | "buildingUsage"
        | "surfaceThatRequiresHeating"
        | "creationDate"
        | "height"
      >
    >,
    linkedEntities: IpeReferenceCompany[],
    tx: DbTransaction,
  ) {
    const nbLegalEntities = new Set(linkedEntities.map((entity) => entity.uuid))
      .size;

    await LocationBdnbAdminRepository.refreshLocationLegalEntityStats(
      locationBdnbUuid,
      {
        nbLegalEntities,
        tx,
      },
    );

    const selection = selectReferenceCompanyFromEntities({
      buildingUsage: location.buildingUsage ?? null,
      entities: linkedEntities,
    });

    const referenceCompanyUuid = selection.legalEntityUuid;
    const referenceCompany =
      linkedEntities.find((entity) => entity.uuid === referenceCompanyUuid) ??
      null;

    await LocationBdnbAdminRepository.update(
      locationBdnbUuid,
      {
        ...buildIpeUpdate({
          location,
          selection,
          referenceCompany,
        }),
      },
      { tx },
    );
  },

  countRemaining(filters: LocationsProListInput) {
    return LocationBdnbAdminRepository.countRemaining(filters);
  },
};

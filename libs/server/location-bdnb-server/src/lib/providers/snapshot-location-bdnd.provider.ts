/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BdnbProvider } from "@optee/bdnb-server";
import type { BdnbGeomGroup, DateColumnKeys } from "@optee/constants";
import {
  BooleanColumns,
  DateColumnMap,
  DPE_LABELS,
  ECS_GENERATOR_TYPES,
  EMPLOYEE_RANGES,
  getDepartmentByCode,
  getECSGeneratorCode,
  getHeatingTypeCode,
  getShutterTypeCode,
  getVentilationCode,
  getWallStructureMaterialCode,
  HEATING_TYPES,
  INSULATION_TYPES,
  MappedLocationsColumns,
  ROOF_MATERIALS,
  SHUTTER_TYPES,
  splitAndClean,
  VENTILATION_TYPES,
  WALL_MATERIALS,
  WALL_STRUCTURE_MATERIALS,
  WINDOW_MATERIAL_TYPE,
} from "@optee/constants";
import { LegalEntityRepository } from "@optee/legal-entity-server";
import type {
  LegalEntity,
  LocationBdnb,
  SnapshotPublicLocationBdnb,
} from "@optee/models";

import { wktToGeoJSON } from "@terraformer/wkt";
import z from "zod";

const legalEntityPhoneFormat = z.array(
  z.object({ valeur: z.string(), description: z.string().nullish() }),
);

const prettifyText = (text: string | null | undefined) => {
  if (!text) {
    return text;
  }
  return text
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
};

export const SnapshotLocationBdnbProvider = {
  mapSnapshotToLocation(
    row: SnapshotPublicLocationBdnb,
    geom_groupe: string | null,
  ) {
    const mappedLocation: Partial<LocationBdnb> = {};

    for (const col of MappedLocationsColumns) {
      mappedLocation[col] = row[col] as any;
    }

    // Date columns
    for (const [col, type] of Object.entries(DateColumnMap) as [
      DateColumnKeys,
      (typeof DateColumnMap)[DateColumnKeys],
    ][]) {
      const key = col;
      mappedLocation[key] = BdnbProvider.parseDate(row[key], type);
    }

    // Boolean columns
    for (const col of BooleanColumns) {
      mappedLocation[col] = BdnbProvider.parseBoolean(row[col]);
    }

    const address = prettifyText(row.sourceAddress);
    // Address
    if (address) {
      const { streetNumber, streetName, zipcode, city } =
        BdnbProvider.extractAddress(address);
      mappedLocation.streetNumber = streetNumber;
      mappedLocation.streetName = streetName;
      mappedLocation.zipcode = zipcode;
      mappedLocation.city = city;
    }
    mappedLocation.name = address;

    // Sector & energyType & heatingType
    mappedLocation.sector = BdnbProvider.parseSector(row.sector);
    mappedLocation.energyType = BdnbProvider.parseTypeEnergie(row.energyType);
    mappedLocation.heatingSystem = BdnbProvider.parseHeatingSystem(
      row.heatingSystem,
    );

    if (!mappedLocation.locationGroupId) {
      console.warn(
        `Skipping row due to missing locationGroupId: ${JSON.stringify(
          row.index,
        )}`,
      );
      return null;
    }

    const geomGroup =
      SnapshotLocationBdnbProvider.wkt2154ToGeojson(geom_groupe);

    const facadeArea = BdnbProvider.getFacadeArea(
      geomGroup ?? null,
      mappedLocation.height ?? null,
    );

    mappedLocation.sourceAddress = prettifyText(row.sourceAddress);
    mappedLocation.geomGroup = geomGroup;
    mappedLocation.facadeArea = facadeArea ?? null;
    mappedLocation.glazingArea =
      BdnbProvider.getGlazingArea(
        facadeArea,
        mappedLocation.glazingSurfacePercentage ?? null,
      ) ?? null;
    mappedLocation.surfaceThatRequiresHeating =
      BdnbProvider.getSurfaceThatRequiresHeating(
        mappedLocation.surfaceArea ?? null,
        mappedLocation.nbStoreys ?? null,
        mappedLocation.sector ?? null,
      );

    mappedLocation.department = getDepartmentByCode(
      mappedLocation.zipcode ?? null,
    );

    mappedLocation.inseeEpciCode = row.inseeEpciCode?.split(".")[0] ?? null;

    mappedLocation.numberOfGarparkLots = row.numberOfGarparkLots
      ? Math.round(row.numberOfGarparkLots)
      : 0;
    mappedLocation.nbDwellings = row.nbDwellings
      ? Math.round(row.nbDwellings)
      : 0;

    mappedLocation.exteriorWallInsulationType =
      z
        .array(z.enum(INSULATION_TYPES))
        .safeParse(splitAndClean(row.exteriorWallInsulationType ?? ""))?.data ??
      null;

    mappedLocation.lowerFloorInsulationType =
      z
        .array(z.enum(INSULATION_TYPES))
        .safeParse(splitAndClean(row.lowerFloorInsulationType ?? ""))?.data ??
      null;

    mappedLocation.upperFloorInsulationType =
      z
        .array(z.enum(INSULATION_TYPES))
        .safeParse(splitAndClean(row.upperFloorInsulationType ?? ""))?.data ??
      null;

    mappedLocation.wallMaterial =
      z
        .array(z.enum(WALL_MATERIALS))
        .safeParse(splitAndClean(row.wallMaterial ?? "", "-"))?.data ?? null;

    mappedLocation.roofMaterial =
      z
        .array(z.enum(ROOF_MATERIALS))
        .safeParse(splitAndClean(row.roofMaterial ?? "", "-"))?.data ?? null;

    mappedLocation.shutterType =
      z
        .array(z.enum(SHUTTER_TYPES))
        .safeParse(
          splitAndClean(row.shutterType ?? "", ",").map((val) =>
            getShutterTypeCode(val),
          ),
        )?.data ?? null;

    mappedLocation.windowMaterialType =
      z
        .array(z.enum(WINDOW_MATERIAL_TYPE))
        .safeParse(splitAndClean(row.windowMaterialType ?? "", "/"))?.data ??
      null;

    mappedLocation.hasAirConditioning = row.heatingType?.startsWith("pac")
      ? true
      : false;
    mappedLocation.constructionType = JSON.parse(
      row.constructionType ?? "null",
    );

    const creationYear = mappedLocation.creationDate
      ? new Date(mappedLocation.creationDate).getFullYear()
      : null;

    mappedLocation.estimatedEnergyConsumption =
      BdnbProvider.getEnergyConsumptionDetails(
        row.electricityConsumptionPerSquareMeter,
        creationYear,
        mappedLocation.sector ?? null,
      );

    const surfaceThatRequiresHeating =
      mappedLocation.surfaceThatRequiresHeating;
    const electricityConsumptionPerSquareMeter =
      mappedLocation.electricityConsumptionPerSquareMeter;

    mappedLocation.annualElectricityConsumption =
      surfaceThatRequiresHeating != null &&
      electricityConsumptionPerSquareMeter != null
        ? surfaceThatRequiresHeating * electricityConsumptionPerSquareMeter
        : null;

    mappedLocation.annualElectricityCost =
      mappedLocation.annualElectricityConsumption != null
        ? mappedLocation.annualElectricityConsumption * 0.16
        : null;

    mappedLocation.ventilationType =
      z
        .enum(VENTILATION_TYPES)
        .safeParse(getVentilationCode(row.ventilationType ?? ""))?.data ?? null;

    mappedLocation.heatingType =
      z.enum(HEATING_TYPES).safeParse(getHeatingTypeCode(row.heatingType ?? ""))
        ?.data ?? null;

    mappedLocation.ecsGeneratorType =
      z
        .enum(ECS_GENERATOR_TYPES)
        .safeParse(getECSGeneratorCode(row.ecsGeneratorType ?? ""))?.data ??
      null;

    mappedLocation.externalWallStructureMaterial =
      z
        .enum(WALL_STRUCTURE_MATERIALS)
        .safeParse(
          getWallStructureMaterialCode(row.externalWallStructureMaterial ?? ""),
        ).data ?? null;

    mappedLocation.energyClass2012 =
      z.enum(DPE_LABELS).safeParse(row.energyClass2012).data ?? null;
    mappedLocation.gesClass2012 =
      z.enum(DPE_LABELS).safeParse(row.gesClass2012).data ?? null;

    return mappedLocation;
  },

  async extractLegalEntities(
    row: SnapshotPublicLocationBdnb,
  ): Promise<(Pick<LegalEntity, "type"> & Partial<LegalEntity>)[]> {
    const legalEntities: (Pick<LegalEntity, "type"> & Partial<LegalEntity>)[] =
      [];

    // Row contains PUBLIC entity
    if (row.phone || row.email) {
      if (!row.companyName || row.companyName === "non connu") {
        await LegalEntityRepository.flagLegalEntityAsCorrupted({
          name: "Inconnu",
          reason: `Nom d'entreprise invalide: ${row.companyName}`,
          raw: row,
        });
      } else if (!row.siret || row.siret.includes("E+")) {
        await LegalEntityRepository.flagLegalEntityAsCorrupted({
          name: row.companyName,
          reason: !row.siret
            ? `SIRET manquant`
            : `SIRET invalide: ${row.siret}`,
          raw: row,
        });
      } else {
        const infos = legalEntityPhoneFormat
          .safeParse(JSON.parse(row.phone || "[]"))
          .data?.at(0);

        const phone = infos?.valeur ?? null;
        const openingHours = infos?.description ?? null;

        legalEntities.push({
          name: prettifyText(row.companyName),
          phone,
          email: row.email,
          siret: row.siret.split(".")[0],
          siren: row.siret?.substring(0, 9) ?? null,
          openingHoursInternal: openingHours,
          type: "public",
        });
      }
    }

    // Row contains COPROPERTY entity
    if (row.syndicSiret) {
      const name = row.syndicCommonName ?? row.syndicName;

      if (!name || name === "non connu") {
        await LegalEntityRepository.flagLegalEntityAsCorrupted({
          name: "Inconnu",
          reason: `Nom d'entreprise invalide pour la copropriété: ${name}`,
          raw: row,
        });
      } else if (row.syndicSiret === "-1") {
        await LegalEntityRepository.flagLegalEntityAsCorrupted({
          name,
          reason: `SIRET invalide pour la copropriété: ${row.syndicSiret}`,
          raw: row,
        });
      } else {
        const siret = row.syndicSiret.split(".")[0];
        legalEntities.push({
          name: prettifyText(name),
          type: "copro",
          usualName: prettifyText(row.syndicCommonName) ?? null,
          siret: siret ?? null,
          siren: siret?.substring(0, 9) ?? null,
          streetType: prettifyText(row.syndicStreetType) ?? null,
          streetName: prettifyText(row.syndicStreetName) ?? null,
          zipCode: row.syndicZipCode?.split(".")[0] ?? null,
          city: prettifyText(row.syndicCity ?? row.syndicCommune) ?? null,
          streetNumber: row.syndicStreetNumber
            ? row.syndicStreetNumber.toString()
            : null,
          isMainSyndic: row.isMainSyndic === "oui" ? true : false,
          syndicRepetitionIndex: row.syndicRepetitionIndex,
        });
      }
    }

    // Looking for TERTIARY entities
    const possibleTertiaryEntities = 3;
    for (let i: 1 | 2 | 3 = 1; i <= possibleTertiaryEntities; i += 1) {
      const suffix: 1 | 2 | 3 = i as 1 | 2 | 3;
      const sirenKey = `siren${suffix}` as const;
      const siren = row[sirenKey];

      if (!siren) {
        continue;
      }

      const name = row[`denomination${suffix}`] ?? row[`name${suffix}`] ?? null;

      if (!name || name === "non connu") {
        await LegalEntityRepository.flagLegalEntityAsCorrupted({
          name: "Inconnu",
          reason: `Nom invalide: ${name}`,
          raw: row,
        });
        continue;
      }

      // Flag corrupted tertiary entity and skip creation
      if (!siren || siren.startsWith("U")) {
        await LegalEntityRepository.flagLegalEntityAsCorrupted({
          name,
          reason: `SIREN invalide: ${siren}`,
          raw: row,
        });
        continue;
      }

      const isActuallyPublic = !!(
        row[`phone${suffix}`] || row[`email${suffix}`]
      );

      // format value for nbEmployeesRange
      const nbEmployeesRange = row[`nbEmployeesRange${suffix}`]?.startsWith(
        "0 salarié",
      )
        ? "0 salarié"
        : row[`nbEmployeesRange${suffix}`]?.startsWith("Unité non-employeuse")
          ? "Unité non-employeuse"
          : row[`nbEmployeesRange${suffix}`];

      const zipCode =
        !row[`zipCode${suffix}`] || row[`zipCode${suffix}`] === "nan"
          ? null
          : row[`zipCode${suffix}`]?.split(".")[0]?.padStart(5, "0");

      legalEntities.push({
        type: isActuallyPublic ? ("public" as const) : ("tertiaire" as const),
        name: prettifyText(name),
        phone: row[`phone${suffix}`] ?? null,
        email: row[`email${suffix}`] ?? null,
        siren: row[`siren${suffix}`] ?? null,
        partSiren: row[`partSiren${suffix}`] ?? null,
        nbPremises: row[`nbPremises${suffix}`] ?? null,
        legalForm: row[`legalForm${suffix}`] ?? null,
        nbEmployeesRange:
          z.enum(EMPLOYEE_RANGES).safeParse(nbEmployeesRange)?.data ?? null,
        companyType: row[`companyType${suffix}`] ?? null,
        legalType: row[`legalType${suffix}`]?.split(".")[0] ?? null,
        mainBusinessActivity: row[`mainBusinessActivity${suffix}`] ?? null,
        organizationType: row[`organizationType${suffix}`] ?? null,
        hasRepresentative: row[`hasRepresentative${suffix}`] ?? null,
        zipCode: zipCode ?? null,
      });
    }

    return legalEntities;
  },

  wkt2154ToGeojson(wktText: string | null): BdnbGeomGroup | null {
    if (!wktText) {
      return null;
    }

    const sridMatch = wktText.match(/^SRID=(\d+);?/i);
    if (sridMatch && sridMatch[1] !== "2154") {
      console.warn(`Unexpected SRID ${sridMatch[1]}, expected 2154`);
    }
    const sanitized = wktText.replace(/^SRID=\d+;?/i, "").trim();

    let parsed:
      | { type: "Polygon"; coordinates: number[][][] }
      | { type: "MultiPolygon"; coordinates: number[][][][] };

    try {
      parsed = wktToGeoJSON(sanitized) as typeof parsed;
    } catch (error) {
      console.warn(
        `Unable to parse geom groupe (${wktText.substring(0, 50)}...): ${(error as Error).message}`,
      );
      return null;
    }

    if (parsed.type !== "Polygon" && parsed.type !== "MultiPolygon") {
      console.warn(`Unsupported geometry type:`, parsed);
      return null;
    }

    const multiCoordinates =
      parsed.type === "Polygon" ? [parsed.coordinates] : parsed.coordinates;

    const coordinates = multiCoordinates
      .map((polygon) =>
        polygon
          .map((ring) =>
            ring
              .map((point) => {
                const [x, y] = point;
                if (
                  typeof x !== "number" ||
                  typeof y !== "number" ||
                  Number.isNaN(x) ||
                  Number.isNaN(y)
                ) {
                  return null;
                }

                return [x, y] as [number, number];
              })
              .filter((value): value is [number, number] => value !== null),
          )
          .filter((ring) => ring.length > 0),
      )
      .filter((polygon) => polygon.length > 0);

    if (coordinates.length === 0) {
      return null;
    }

    return {
      type: "MultiPolygon",
      coordinates,
    } satisfies BdnbGeomGroup;
  },
};

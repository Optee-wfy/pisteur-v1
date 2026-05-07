import type {
  BdnbApiResponse,
  LocationsProListInput,
  ProLocationAssociationLabel,
} from "@optee/constants";
import { ClientType, LOCATION_NOTES_ASSOCIATIONS } from "@optee/constants";
import type {
  ClientUuid,
  ContactUuid,
  HubspotClient,
  HubspotLocation,
  HubspotLocationBdnbData,
  HubspotNewLocation,
  LocationAddressData,
  LocationUuid,
  NoteUuid,
  OperationUuid,
  ProUuid,
  UserUuid,
} from "@optee/models";
import {
  hsAssociationLocationsNotesTable,
  hsAssociationProsLocationsTable,
  hsAssociationProsSavedLocationsTable,
  hsAssociationsContactsClientsTable,
  hsAssociationsContactsLocationsTable,
  hsAssociationsLocationsClientsTable,
  hsAssociationsOperationsLocationsTable,
  hsClientsTable,
  hsContactsTable,
  hsLocationsTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { isNotNullish } from "@optee/utils";
import {
  and,
  asc,
  count,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
  not,
  or,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const mergeLocationData = (
  hsLocation: HubspotLocation,
  formattedData: HubspotLocationBdnbData,
  properties: Array<keyof HubspotLocation & keyof HubspotLocationBdnbData>,
): Partial<HubspotLocationBdnbData> => {
  return properties.reduce(
    (acc, prop) => ({
      ...acc,
      [prop]: hsLocation[prop] ?? formattedData[prop],
    }),
    {},
  );
};

export const LocationRepository = {
  create(data: HubspotNewLocation) {
    return db.insert(hsLocationsTable).values(data).returning();
  },

  async get(
    locationUuid: LocationUuid,
  ): Promise<{ hsLocation: HubspotLocation; hsClient: HubspotClient | null }> {
    try {
      const data = await db
        .select()
        .from(hsLocationsTable)
        .leftJoin(
          hsAssociationsLocationsClientsTable,
          eq(
            hsLocationsTable.uuid,
            hsAssociationsLocationsClientsTable.locationUuid,
          ),
        )
        .leftJoin(
          hsClientsTable,
          eq(
            hsAssociationsLocationsClientsTable.clientUuid,
            hsClientsTable.uuid,
          ),
        )
        .where(eq(hsLocationsTable.uuid, locationUuid));

      const row = data[0];

      if (!row) {
        throw Error(
          `Le site avec l'identifiant "${locationUuid}" n'existe pas.`,
        );
      }

      return {
        hsLocation: row.batiments,
        hsClient: row.clients,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw Error(
          `Erreur lors de la récupération du site. "${error.message}"`,
        );
      }

      throw Error("Erreur inconnue lors de la récupération du site.");
    }
  },

  async getByGooglePlaceId(googlePlaceId: string, clientUuid: ClientUuid) {
    const [row] = await db
      .selectDistinctOn([hsLocationsTable.uuid])
      .from(hsLocationsTable)
      .leftJoin(
        hsAssociationsLocationsClientsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsLocationsClientsTable.locationUuid,
        ),
      )
      .where(
        and(
          eq(hsLocationsTable.googlePlaceId, googlePlaceId),
          eq(hsAssociationsLocationsClientsTable.clientUuid, clientUuid),
        ),
      )
      .limit(1);

    return row ?? null;
  },

  async getByAddressDataAndClient(
    addressData: LocationAddressData,
    clientUuid: ClientUuid,
  ) {
    const [row] = await db
      .selectDistinctOn([hsLocationsTable.uuid])
      .from(hsLocationsTable)
      .leftJoin(
        hsAssociationsLocationsClientsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsLocationsClientsTable.locationUuid,
        ),
      )
      .where(
        and(
          addressData.city
            ? eq(hsLocationsTable.city, addressData.city)
            : isNull(hsLocationsTable.city),
          addressData.streetName
            ? eq(hsLocationsTable.streetName, addressData.streetName)
            : isNull(hsLocationsTable.streetName),
          addressData.streetNumber
            ? eq(hsLocationsTable.streetNumber, addressData.streetNumber)
            : isNull(hsLocationsTable.streetNumber),
          addressData.zipcode
            ? eq(hsLocationsTable.zipcode, addressData.zipcode)
            : isNull(hsLocationsTable.zipcode),
          eq(hsAssociationsLocationsClientsTable.clientUuid, clientUuid),
        ),
      )
      .limit(1);

    return row ?? null;
  },

  async getUuidByOperation(operationUuid: OperationUuid) {
    const [location] = await db
      .select({ uuid: hsAssociationsOperationsLocationsTable.locationUuid })
      .from(hsAssociationsOperationsLocationsTable)
      .where(
        eq(hsAssociationsOperationsLocationsTable.operationUuid, operationUuid),
      );
    return location?.uuid ?? null;
  },

  async getAllByClient(clientUuid: ClientUuid) {
    const locations = await db
      .selectDistinctOn([hsLocationsTable.uuid])
      .from(hsLocationsTable)
      .leftJoin(
        hsAssociationsLocationsClientsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsLocationsClientsTable.locationUuid,
        ),
      )
      .where(
        //@todo: check if Drizzle orm can handle condition an other way than this to avoid sql injection and improve readability. This where condition is used in multiple places.
        and(
          eq(hsAssociationsLocationsClientsTable.clientUuid, clientUuid),
          isNotNull(hsLocationsTable.city),
          isNotNull(hsLocationsTable.streetName),
          isNotNull(hsLocationsTable.zipcode),
        ),
      );

    return locations.map((row) => row.batiments);
  },

  async getAllByContact(contactUuid: ContactUuid) {
    const locations = await db
      .selectDistinctOn([hsLocationsTable.uuid])
      .from(hsLocationsTable)
      .leftJoin(
        hsAssociationsContactsLocationsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsContactsLocationsTable.locationUuid,
        ),
      )
      .where(
        and(
          eq(hsAssociationsContactsLocationsTable.contactUuid, contactUuid),
          isNotNull(hsLocationsTable.city),
          isNotNull(hsLocationsTable.streetName),
          isNotNull(hsLocationsTable.zipcode),
        ),
      );

    return locations.map((row) => row.batiments);
  },

  async getAllForProPaginated({
    filters,
    proUuid,
    showDemoClients,
  }: {
    filters: LocationsProListInput;
    proUuid: ProUuid;
    showDemoClients: boolean;
  }) {
    // 1) Filtres "généraux" (département, ranges, etc.)
    const locationFilters = await LocationRepository.buildLocationFiltersSQL({
      filters,
      proUuid,
    });

    // 3) Conditions de clients affichés (bâtiment lié à un compte démo n'est pas affiché, sauf pour les testeurs d'optee)
    const displayedClientConditions = [
      eq(hsAssociationsLocationsClientsTable.clientUuid, hsClientsTable.uuid),
      showDemoClients
        ? null
        : not(eq(hsClientsTable.accountType, ClientType.DEMO)),
    ].filter(isNotNullish);

    // 4) CTE "filtered" : 1 ligne/bâtiment après filtres + présence client
    const filtered = db.$with("filtered").as(
      db
        .select({
          locationUuid: hsLocationsTable.uuid,
          dpeLabel: hsLocationsTable.dpeLabel,
        })
        .from(hsLocationsTable)
        .innerJoin(
          hsAssociationsLocationsClientsTable,
          eq(
            hsLocationsTable.uuid,
            hsAssociationsLocationsClientsTable.locationUuid,
          ),
        )
        .innerJoin(hsClientsTable, and(...displayedClientConditions))
        .where(
          locationFilters.length ? and(...locationFilters) : sql<boolean>`true`,
        )
        .groupBy(hsLocationsTable.uuid, hsLocationsTable.dpeLabel),
    );

    // 5) CTE agrégé : 1 association "meilleure" par location pour CE pro
    const proAssocBest = db.$with("pro_assoc_best").as(
      db
        .select({
          locationUuid: hsAssociationProsLocationsTable.locationUuid,
          associationTypeId: sql<number | null>`
          (array_agg(${hsAssociationProsLocationsTable.associationTypeId}
            ORDER BY (${hsAssociationProsLocationsTable.associationTypeId} IS NOT NULL) DESC
          ))[1]
        `.as("associationTypeId"),
          associationLabel: sql<ProLocationAssociationLabel | null>`
          (array_agg(${hsAssociationProsLocationsTable.associationLabel}
            ORDER BY (${hsAssociationProsLocationsTable.associationTypeId} IS NOT NULL) DESC
          ))[1]
        `.as("associationLabel"),
        })
        .from(hsAssociationProsLocationsTable)
        .where(
          and(
            eq(hsAssociationProsLocationsTable.proUuid, proUuid),
            isNotNull(hsAssociationProsLocationsTable.associationLabel),
          ),
        )
        .groupBy(hsAssociationProsLocationsTable.locationUuid),
    );

    // 6) total
    const [counter] = await db
      .with(filtered)
      .select({ total: count() })
      .from(filtered);

    // 7) page — on joint UNIQUEMENT le CTE agrégé (pas la table brute) + "saved"
    const rows = await db
      .with(filtered, proAssocBest)
      .select({
        batiments: hsLocationsTable,
        associations_batiments_favoris_pro:
          hsAssociationProsSavedLocationsTable,
        proAssociationTypeId: proAssocBest.associationTypeId,
        proAssociationLabel: proAssocBest.associationLabel,
      })
      .from(filtered)
      .innerJoin(
        hsLocationsTable,
        eq(filtered.locationUuid, hsLocationsTable.uuid),
      )
      .leftJoin(
        proAssocBest,
        eq(proAssocBest.locationUuid, hsLocationsTable.uuid),
      )
      .leftJoin(
        hsAssociationProsSavedLocationsTable,
        and(
          eq(
            hsAssociationProsSavedLocationsTable.locationUuid,
            hsLocationsTable.uuid,
          ),
          eq(hsAssociationProsSavedLocationsTable.proUuid, proUuid),
        ),
      )
      .orderBy(
        sql`${hsLocationsTable.dpeLabel} DESC NULLS LAST`,
        sql`${proAssocBest.associationTypeId} DESC NULLS LAST`,
        asc(filtered.locationUuid),
      )
      .limit(filters.pageSize)
      .offset(filters.page * filters.pageSize);

    return {
      items: rows.map((row) => ({
        location: row.batiments,
        associations: [
          row.associations_batiments_favoris_pro?.uuid
            ? ("Enregistré" as const)
            : null,
          row.proAssociationLabel,
        ].filter(isNotNullish),
      })),
      total: counter?.total ?? 0,
    };
  },

  async getAllForUserByClient(userUuid: UserUuid) {
    const locations = await db
      .selectDistinctOn([hsLocationsTable.uuid])
      .from(hsLocationsTable)
      .leftJoin(
        hsAssociationsLocationsClientsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsLocationsClientsTable.locationUuid,
        ),
      )
      .leftJoin(
        hsClientsTable,
        eq(hsAssociationsLocationsClientsTable.clientUuid, hsClientsTable.uuid),
      )
      .leftJoin(
        hsAssociationsContactsClientsTable,
        eq(hsClientsTable.uuid, hsAssociationsContactsClientsTable.clientUuid),
      )
      .leftJoin(
        hsContactsTable,
        eq(
          hsAssociationsContactsClientsTable.contactUuid,
          hsContactsTable.uuid,
        ),
      )
      .where(
        and(
          eq(hsContactsTable.userUuid, userUuid),
          isNotNull(hsLocationsTable.city),
          isNotNull(hsLocationsTable.streetName),
          isNotNull(hsLocationsTable.zipcode),
        ),
      );

    return locations.map((row) => row.batiments);
  },

  async getAllForUserByContact(userUuid: UserUuid) {
    const locations = await db
      .selectDistinctOn([hsLocationsTable.uuid])
      .from(hsLocationsTable)
      .leftJoin(
        hsAssociationsContactsLocationsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsContactsLocationsTable.locationUuid,
        ),
      )
      .leftJoin(
        hsContactsTable,
        eq(
          hsAssociationsContactsLocationsTable.contactUuid,
          hsContactsTable.uuid,
        ),
      )
      .where(
        and(
          eq(hsContactsTable.userUuid, userUuid),
          isNotNull(hsLocationsTable.city),
          isNotNull(hsLocationsTable.streetName),
          isNotNull(hsLocationsTable.zipcode),
        ),
      );

    return locations.map((row) => row.batiments);
  },

  getAllUnsynced() {
    return db
      .select()
      .from(hsLocationsTable)
      .where(isNull(hsLocationsTable.id));
  },

  getAllWithoutBdnb() {
    return db
      .select()
      .from(hsLocationsTable)
      .where(
        or(
          eq(hsLocationsTable.bdnbFailure, true),
          isNull(hsLocationsTable.bdnbFailure),
        ),
      );
  },

  getAllByAddressData(addressData: LocationAddressData) {
    return db
      .selectDistinctOn([hsLocationsTable.uuid])
      .from(hsLocationsTable)
      .where(
        and(
          addressData.city
            ? eq(hsLocationsTable.city, addressData.city)
            : isNull(hsLocationsTable.city),
          addressData.streetName
            ? eq(hsLocationsTable.streetName, addressData.streetName)
            : isNull(hsLocationsTable.streetName),
          addressData.streetNumber
            ? eq(hsLocationsTable.streetNumber, addressData.streetNumber)
            : isNull(hsLocationsTable.streetNumber),
          addressData.zipcode
            ? eq(hsLocationsTable.zipcode, addressData.zipcode)
            : isNull(hsLocationsTable.zipcode),
        ),
      );
  },

  async update(locationUuid: LocationUuid, data: Partial<HubspotLocation>) {
    return db
      .update(hsLocationsTable)
      .set({
        ...data,
      })
      .where(eq(hsLocationsTable.uuid, locationUuid))
      .returning();
  },

  async associateToNote({
    locationUuid,
    noteUuid,
  }: {
    locationUuid: LocationUuid;
    noteUuid: NoteUuid;
  }) {
    await db.insert(hsAssociationLocationsNotesTable).values({
      locationUuid,
      noteUuid,
      associationTypeId: LOCATION_NOTES_ASSOCIATIONS.NULL.id,
    });
  },

  async updateBdnbData({
    uuid,
    rawBdnb,
    formattedData,
  }: {
    uuid: LocationUuid;
    rawBdnb: BdnbApiResponse;
    formattedData: HubspotLocationBdnbData;
  }) {
    const { hsLocation } = await LocationRepository.get(uuid);

    // Only update nullish values to avoid overwriting manual data
    const locationFormattedData: HubspotLocationBdnbData = {
      ...formattedData,
      ...mergeLocationData(hsLocation, formattedData, [
        "sector",
        "energyType",
        "heatingSystem",
        "nbBuildings",
        "nbUnits",
        "surfaceArea",
        "height",
        "glazingSurfacePercentage",
        "electricityConsumptionPerSquareMeter",
        "greenhouseGasEmissionsPerSquareMeter",
        "nbStoreys",
        "creationDate",
        "heatingType",
        "dpeLabel",
        "meanHeight",
        "inertiaClass",
        "hasBalcony",
        "nbDwellings",
        "nbDwellingsRnc",
        "nbTertiaryLotsRnc",
        "nbResElec2020",
        "nbProElec2020",
        "nbProGaz2020",
        "nbResGaz2020",
        "dpeAssessmentClass",
        "arrete2021",
        "dpeIdentifier",
        "gesEmissions5UsesPerM2",
        "gesEmissions3UsesEpM2Arrete2012",
        "ventilationType",
        "acGeneratorType",
        "acGeneratorAge",
        "exteriorWallInsulationType",
        "exteriorWallUValue",
        "lowerFloorInsulationType",
        "upperFloorInsulationType",
        "lowerFloorFinalUValue",
        "upperFloorUValue",
        "glazingType",
        "windowMaterialType",
        "gasLayerType",
        "shutterType",
        "virGlazing",
        "windowUValue",
        "windowSolarFactor",
        "proElecConsumption2020",
        "resElecConsumption2020",
        "proGazConsumption2020",
        "resGazConsumption2020",
        "networkId",
        "radonRisk",
        "clayRisk",
        "priorityDistrict",
        "districtNameQpv",
        "qpvCode",
      ]),
    };

    return db
      .update(hsLocationsTable)
      .set({
        ...locationFormattedData,
        rawBdnb,
        bdnbFailure: false,
      })
      .where(eq(hsLocationsTable.uuid, uuid))
      .returning();
  },

  async updateStreetViewUrl(uuid: LocationUuid, streetViewUrl: string) {
    await db
      .update(hsLocationsTable)
      .set({
        streetViewUrl,
      })
      .where(eq(hsLocationsTable.uuid, uuid))
      .returning();
  },

  // Refactored to use map/filter/reduce for clarity
  async buildLocationFiltersSQL({
    filters,
    proUuid,
  }: {
    filters: LocationsProListInput;
    proUuid: ProUuid;
  }) {
    // Simple value filters
    const table = hsLocationsTable;
    const equalsFilters = [
      { key: "department", column: table.department },
      { key: "sector", column: table.sector },
      { key: "energyType", column: table.energyType },
      { key: "dpe", column: table.dpeLabel },
      { key: "heatingSystem", column: table.heatingSystem },
    ] as const;

    const equalsWheres = equalsFilters
      .map(({ key, column }) => {
        const values = filters[key];
        if (!(Array.isArray(values) && values.length)) {
          return undefined;
        }
        return or(
          ...values.map((value) =>
            value !== null && value !== undefined
              ? eq(column, value)
              : isNull(column),
          ),
        );
      })
      .filter(isNotNullish);

    // Range filters
    const rangeFilters = [
      { key: "surfaceArea", column: table.surfaceArea },
      {
        key: "surfaceThatRequiresHeating",
        column: table.surfaceThatRequiresHeating,
      },
      { key: "glazingArea", column: table.glazingArea },
      { key: "height", column: table.height },
      { key: "nbStoreys", column: table.nbStoreys },
      { key: "nbUnits", column: table.nbUnits },
      { key: "nbBuildings", column: table.nbBuildings },
      { key: "creationDate", column: table.creationDate },
    ] as const;

    const rangeWheres = rangeFilters
      .map(({ key, column }) => {
        const [minRaw, maxRaw] = filters[key] ?? [null, null];
        const conditions = [
          minRaw !== null
            ? gte(
                column,
                typeof minRaw === "number" ? minRaw : minRaw?.toISOString(),
              )
            : undefined,
          maxRaw !== null
            ? lte(
                column,
                typeof maxRaw === "number" ? maxRaw : maxRaw?.toISOString(),
              )
            : undefined,
        ].filter(isNotNullish);
        return conditions.length ? and(...conditions) : undefined;
      })
      .filter(isNotNullish);

    const locationFilters = [...equalsWheres, ...rangeWheres];

    const termRaw = filters.search?.trim();
    if (termRaw && termRaw.length >= 2) {
      const esc = termRaw.replace(/([\\%_])/g, "\\$1");
      const like = `%${esc.replace(/\s+/g, "%")}%`;

      locationFilters.push(sql<boolean>`
      (
        ${table.streetNumber} ILIKE ${like}
        OR ${table.streetName} ILIKE ${like}
        OR ${table.zipcode} ILIKE ${like}
        OR ${table.city} ILIKE ${like}
        OR ${table.name} ILIKE ${like}
      )
    `);
    }

    if (filters.associationTypes?.length) {
      const apl = alias(hsAssociationProsLocationsTable, "apl");

      const wantedLabels = filters.associationTypes?.filter(
        (l): l is ProLocationAssociationLabel => !!l && l !== "Enregistré",
      );

      if (wantedLabels?.length) {
        // EXISTS: au moins une association pro pour CE pro avec un label demandé
        locationFilters.push(sql<boolean>`EXISTS (
        ${db
          .select({ one: sql`1` })
          .from(apl)
          .where(
            and(
              eq(apl.locationUuid, table.uuid),
              eq(apl.proUuid, proUuid),
              inArray(apl.associationLabel, wantedLabels),
            ),
          )}
      )`);
      }

      // "sans association pro" (null) via le filtre:
      if (filters.associationTypes.includes(null)) {
        locationFilters.push(sql<boolean>`NOT EXISTS (
          ${db
            .select({ one: sql`1` })
            .from(apl)
            .where(
              and(eq(apl.locationUuid, table.uuid), eq(apl.proUuid, proUuid)),
            )}
        )`);
      }

      if (filters.associationTypes.includes("Enregistré")) {
        const aps = alias(hsAssociationProsSavedLocationsTable, "aps");

        const conditions = [
          eq(aps.locationUuid, table.uuid),
          eq(aps.proUuid, proUuid),
        ];

        // EXISTS: favori pour CE pro
        locationFilters.push(sql<boolean>`EXISTS (
        ${db
          .select({ one: sql`1` })
          .from(aps)
          .where(and(...conditions))}
      )`);
      }
    }

    return locationFilters;
  },
};

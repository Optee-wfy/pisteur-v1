import { ClientRepository } from "@optee/client-server";
import type { OperationBrief } from "@optee/constants";
import {
  BOT_ASSISTANTS,
  BRIEF_SECTIONS,
  CONTACT_OPERATION_ASSOCIATIONS,
  contactSupport,
  FUNDING_CATEGORY,
  getOperationPhaseFromEnum,
  getOperationTypeCost,
  getOperationTypeFunding,
  getOperationTypeImpact,
  getPrestationParentCategory,
  getTypeByHubspotPrestationId,
  MARKETPLACE_UI_URL,
  OperationCreatedBy,
  OperationPhaseEnum,
  OperationType,
  UserType,
  XFactorParamsSchema,
  type OperationHubspotPrestationId,
} from "@optee/constants";
import { ContactClientRepository } from "@optee/contact-client-server";
import { ContactLocationRepository } from "@optee/contact-location-server";
import {
  ContactOperationProvider,
  ContactOperationRepository,
} from "@optee/contact-operation-server";
import { ContactRepository } from "@optee/contact-server";
import { FileProvider } from "@optee/file-server";
import { HubspotProvider } from "@optee/hubspot-server";
import { LocationRepository } from "@optee/location-server";
import { MailersendProvider } from "@optee/mailersend-server";
import type {
  ClientUuid,
  ContactUuid,
  HubspotLocation,
  HubspotNewOperation,
  LocationUuid,
  OperationUuid,
  ProUuid,
  SignatoryContact,
} from "@optee/models";
import { Location, Operation, OperationRow } from "@optee/models";
import { OpenAIProvider } from "@optee/openai-server";
import { OperationRepository } from "@optee/operation-server";
import { QuoteRepository } from "@optee/quote-server";
import type { FileDto } from "@optee/utils";
import { dateOnly, isNotNullish, withTimeout } from "@optee/utils";
import { type z } from "zod";

export const OperationProvider = {
  async create({
    input,
    locationUuid,
    clientUuid,
  }: {
    input: HubspotNewOperation;
    locationUuid: LocationUuid;
    clientUuid: ClientUuid;
  }) {
    // @todo should be in single transaction
    const [operation] = await OperationRepository.create(input);

    if (!operation) {
      throw new Error("L'opération n'a pas pu être créée.");
    }

    await OperationRepository.associateToClientAndLocation({
      operationUuid: operation.uuid,
      clientUuid,
      locationUuid,
    });

    return operation;
  },

  async createByClient({
    hsPrestationId,
    isFunding,
    locationUuid,
    files,
    launchingDate,
    plannedLaunchDate,
  }: {
    hsPrestationId: OperationHubspotPrestationId;
    isFunding: boolean;
    locationUuid: LocationUuid;
    files?: FileDto[] | null;
    plannedLaunchDate?: Date | null;
    launchingDate?: Date | null;
  }) {
    const { hsLocation, hsClient } = await LocationRepository.get(locationUuid);

    if (!hsLocation) {
      throw new Error("Aucun site trouvé pour cet identifiant");
    }

    if (!hsClient) {
      throw new Error("Aucun client trouvé pour ce site");
    }

    const type = getTypeByHubspotPrestationId(hsPrestationId);
    if (!type) {
      throw new Error("Impossible de trouver le type d'opération");
    }

    const parentOperationType = getPrestationParentCategory(
      type.hsPrestationId,
    );

    const name = isFunding
      ? `FIN / ${hsLocation.streetNumber} ${hsLocation.streetName}`
      : `${type.hubspotTrigram} / ${hsLocation.streetNumber} ${hsLocation.streetName}`;

    const category = isFunding
      ? FUNDING_CATEGORY
      : parentOperationType.hsOperationCategory;

    const {
      estimatedCost,
      estimatedFunding,
      estimatedEnergyImpact,
      annualElectricityConsumptionBefore,
      greenhouseGasEmissionsBefore,
    } = await OperationProvider.getCalculation(hsPrestationId, hsLocation);

    const phase =
      isFunding ||
      getPrestationParentCategory(hsPrestationId)?.type ===
        OperationType.CONTRACT
        ? OperationPhaseEnum.PRE_LAUNCH
        : OperationPhaseEnum.PROJECT_PHASE;

    const res = await OperationProvider.create({
      input: {
        phase,
        prestationId: hsPrestationId,
        name,
        createdAt: new Date().toISOString(),
        category,
        ownerId: hsClient.ownerId ?? null,
        ownerCsmId: hsClient.ownerCsmId ?? null,
        estimatedCost: estimatedCost.data,
        estimatedFunding: estimatedFunding.data,
        estimatedEnergyImpact: estimatedEnergyImpact.data,
        annualElectricityConsumptionBefore,
        greenhouseGasEmissionsBefore,
        launchingDate: launchingDate?.toISOString() ?? null,
        plannedLaunchDate: plannedLaunchDate?.toISOString() ?? null,
      },
      locationUuid,
      clientUuid: hsClient.uuid,
    });

    if (!res) {
      throw new Error("Erreur lors de la création de l'opération");
    }

    const { uuid: operationUuid } = res;

    if (files?.length) {
      await Promise.all(
        files.map((file) =>
          OperationProvider.attachDocument(operationUuid, file),
        ),
      );
    }

    return { operationUuid };
  },

  async createByPro({
    proUuid,
    hsPrestationId,
    locationUuid,
    signatoryUuid,
  }: {
    proUuid: ProUuid;
    hsPrestationId: OperationHubspotPrestationId;
    locationUuid: LocationUuid;
    files?: FileDto[] | null;
    userType?: UserType;
    signatoryUuid: ContactUuid;
  }) {
    const { hsLocation, hsClient } = await LocationRepository.get(locationUuid);

    if (!hsLocation) {
      throw new Error("Aucun site trouvé pour cet identifiant");
    }

    if (!hsClient) {
      throw new Error("Aucun client trouvé pour ce site");
    }

    const type = getTypeByHubspotPrestationId(hsPrestationId);
    if (!type) {
      throw new Error("Impossible de trouver le type d'opération");
    }

    const signatory = await ContactRepository.get(signatoryUuid);
    if (!signatory) {
      console.error(`🚩 Le signataire ${signatoryUuid} n'existe pas.`);
      throw new Error("Erreur lors de la création de l'opération");
    }

    if (!signatory.email) {
      console.error(
        `🚩 Le signataire ${signatoryUuid} n'a pas d'adresse email.`,
      );
      throw new Error("Erreur lors de la création de l'opération");
    }

    const parentOperationType = getPrestationParentCategory(
      type.hsPrestationId,
    );

    const name = `${type.hubspotTrigram} / ${hsLocation.streetNumber} ${hsLocation.streetName}`;

    const category = parentOperationType.hsOperationCategory;

    const {
      estimatedCost,
      estimatedFunding,
      estimatedEnergyImpact,
      annualElectricityConsumptionBefore,
      greenhouseGasEmissionsBefore,
    } = await OperationProvider.getCalculation(hsPrestationId, hsLocation);

    const res = await OperationProvider.create({
      input: {
        phase: OperationPhaseEnum.RESERVED_PROJECT,
        prestationId: hsPrestationId,
        name,
        createdAt: new Date().toISOString(),
        category,
        ownerId: hsClient.ownerId,
        ownerCsmId: hsClient.ownerCsmId,
        estimatedCost: estimatedCost.data,
        estimatedFunding: estimatedFunding.data,
        estimatedEnergyImpact: estimatedEnergyImpact.data,
        annualElectricityConsumptionBefore,
        greenhouseGasEmissionsBefore,
        createdBy: OperationCreatedBy.PRO,
      },
      locationUuid,
      clientUuid: hsClient.uuid,
    });

    if (!res) {
      throw new Error("Erreur lors de la création de l'opération");
    }

    const { uuid: operationUuid } = res;

    await Promise.all([
      OperationRepository.associateToPro(operationUuid, proUuid),
      ContactOperationRepository.create(
        signatoryUuid,
        operationUuid,
        CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY,
      ),
      OperationRepository.update(operationUuid, {
        signatoryEmail: signatory.email,
      }),
    ]);

    return { operationUuid, name, signatory, hsClient };
  },

  async getWithSignatory(uuid: OperationUuid) {
    const res = await OperationRepository.get(uuid);

    if (!res) {
      return null;
    }

    let signatoryContact: SignatoryContact | null = null;

    if (res.signatoryContactUuid) {
      const contact = await ContactRepository.get(res.signatoryContactUuid);
      const updatable = await OperationRepository.canSignatoryBeUpdated(uuid);

      if (contact) {
        signatoryContact = {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          uuid: contact.uuid,
          updatable,
        };
      } else {
        console.error(
          "🚩 Le signataire n'a pas pu être trouvé pour cette opération: " +
            res.hsOperation.uuid,
        );
      }
    } else {
      // This is only a problem when this operation has quotes linked to it.
      const rawPhase = res.hsOperation.phase as OperationPhaseEnum;
      if (!rawPhase) {
        throw new Error(
          `Impossible de récupérer la phase de l'opération. ${contactSupport}`,
        );
      }

      const phase = getOperationPhaseFromEnum(rawPhase, UserType.CLIENT);
      const started = Operation.hasOperationStarted({ phase });
      if (started) {
        console.error(
          `🚩 Aucun signataire n'a été trouvé pour cette opération [${res.hsOperation.uuid}] dans la phase [${phase.enum}].`,
        );
      }
    }

    return { ...res, signatoryContact };
  },

  async getCalculation(
    hsPrestationId: OperationHubspotPrestationId,
    hsLocation: HubspotLocation,
  ) {
    const operationTypeInfo = getTypeByHubspotPrestationId(hsPrestationId);
    if (!operationTypeInfo) {
      throw new Error("Impossible de trouver le type d'opération");
    }

    const location = Location.init(hsLocation);
    if (!location) {
      throw new Error("Erreur lors de la récupération du site");
    }

    const xFactorParams = XFactorParamsSchema.parse(location);

    // In order to be sure that an operation has been simulated we store "0" instead of "null" in DB
    const estimatedCost = getOperationTypeCost(
      operationTypeInfo,
      xFactorParams,
    );

    const estimatedFunding = getOperationTypeFunding(
      operationTypeInfo,
      xFactorParams,
    );

    const estimatedEnergyImpact = getOperationTypeImpact(
      operationTypeInfo,
      xFactorParams,
    );

    return {
      estimatedCost,
      estimatedFunding,
      estimatedEnergyImpact,
      annualElectricityConsumptionBefore: location.annualElectricityConsumption,
      greenhouseGasEmissionsBefore: location.annualGhg,
    };
  },

  async getHubspotOperationTypes() {
    const hsPrestationData = await HubspotProvider.getPropertyInfos(
      "deals",
      "prestations",
    );
    const options = hsPrestationData?.options ?? [];
    if (options.length === 0) {
      console.warn("[HubSpot] Aucune option de prestation trouvée.");
    }
    return options.map((o) => o.value);
  },

  async getSignatoryContact(operationUuid: OperationUuid) {
    try {
      let signatoryUuid: ContactUuid | null = null;
      const operationSignatory =
        await OperationRepository.getSignatoryUuid(operationUuid);

      if (operationSignatory) {
        signatoryUuid = operationSignatory;
      } else {
        const locationUuid =
          await LocationRepository.getUuidByOperation(operationUuid);
        if (!locationUuid) {
          throw new Error(
            `Impossible de récupérer les informations de localisation pour l'opération.`,
          );
        }
        const [locationAdmin] =
          await ContactLocationRepository.getAllAdministrators(locationUuid);

        if (locationAdmin?.contact) {
          signatoryUuid = locationAdmin.contact.uuid;
        } else {
          const clientUuid =
            await ClientRepository.getUuidByLocation(locationUuid);
          if (!clientUuid) {
            throw new Error("Aucun client n'est lié à cette opération.");
          }

          const [clientAdmin] =
            await ContactClientRepository.getAllAdministrators(clientUuid);
          if (clientAdmin) {
            signatoryUuid = clientAdmin.contact.uuid;
          }
        }
      }

      return signatoryUuid ? ContactRepository.get(signatoryUuid) : null;
    } catch (error) {
      console.error(
        `🚩 Récupération du signataire de l'opération [${operationUuid}] en échec: `,
        error,
      );
      return null;
    }
  },

  async getStatistics(proUuid: ProUuid) {
    // Pro has uploaded some quotes against some operations (linked via association table), we need to get those
    const quotes = await QuoteRepository.getAllByPro(proUuid);

    const operations = await OperationRepository.getAllByQuoteUuids(
      quotes.map((q) => q.uuid),
    );

    const validOperations = operations.filter(
      (op) => op && op.hsOperation && (!op.proUuid || op.proUuid === proUuid),
    );

    const uniqueValidOperations = Array.from(
      new Map(validOperations.map((op) => [op?.hsOperation.uuid, op])).values(),
    );

    const operationsResults = await Promise.all(
      uniqueValidOperations.map(async (op) => {
        if (!op || !op.hsOperation) {
          return null;
        }

        const location = Location.init(op.hsLocation);

        if (!location) {
          return null;
        }

        const operation = OperationRow.initWithAssociations({
          input: op.hsOperation,
          displayFor: UserType.PRO,
          proUuid: op.proUuid,
          location,
        });

        if (!operation || !operation.phase?.visibleInApp) {
          return null;
        }

        return {
          category: operation.phase.category,
          isArchived:
            operation.phase.enum === OperationPhaseEnum.ARCHIVED_OPERATION,
          costValue: operation.cost?.value ?? 0,
        };
      }),
    );

    const {
      upcomingOperationsCount,
      signedOperationsCount,
      operationsRevenue,
    } = operationsResults.reduce(
      (acc, result) => {
        if (!result) {
          return acc;
        }

        if (result.category === "upcoming") {
          acc.upcomingOperationsCount++;
        }

        if (result.category === "in_progress" || result.isArchived) {
          acc.signedOperationsCount++;
          acc.operationsRevenue += result.costValue;
        }

        return acc;
      },
      {
        upcomingOperationsCount: 0,
        signedOperationsCount: 0,
        operationsRevenue: 0,
      },
    );

    return {
      upcomingOperationsCount,
      signedOperationsCount,
      operationsRevenue,
    };
  },

  async getAllByPro(proUuid: ProUuid) {
    // Pro has uploaded some quotes against some operations (linked via association table), we need to get those
    const quotes = await QuoteRepository.getAllByPro(proUuid);
    const operations = await OperationRepository.getAllHydratedByQuoteUuids(
      quotes.map((q) => q.uuid),
    );

    const operationsWithQuote = quotes
      .map((q) => {
        const ope = operations.find(
          (o) => o.hsOperation && o.hsOperation.uuid === q.operationUuid,
        );
        if (!ope) {
          return null;
        }
        return {
          ...ope,
          quote: q,
        };
      })
      .filter(isNotNullish);

    return operationsWithQuote;
  },

  async getAllDiscoverableForPro(proUuid: ProUuid, isOpteeTester: boolean) {
    const rows = await OperationRepository.getAllDiscoverableForPro({
      proUuid,
      showDemoClients: isOpteeTester,
    });

    return rows
      .map((row) => {
        try {
          if (!row.hsLocation) {
            throw new Error(
              `Operation with uuid ${row.hsOperation.uuid} has no location.`,
            );
          }

          Operation.validateDisplay({
            uuid: row.hsOperation.uuid,
            prestationId: row.hsOperation.prestationId,
          });

          return {
            ...row.hsOperation,
            location: row.hsLocation,
          };
        } catch (err) {
          console.error(
            `Une erreur est survenue lors du chargement de l'opération [${row.hsOperation.uuid}]:`,
            err instanceof Error ? err.message : String(err),
          );
          return null;
        }
      })
      .filter(isNotNullish);
  },

  async updateCalculation(operationUuid: OperationUuid) {
    const row = await OperationRepository.get(operationUuid);

    if (!row) {
      throw new Error("Opération non trouvée");
    }

    const { hsOperation } = row;
    const { hsLocation } = row;

    if (!hsLocation) {
      throw new Error("Site non trouvé");
    }

    if (!hsOperation.prestationId) {
      throw new Error("Calcul impossible. Il manque le nom de la prestation");
    }

    const {
      estimatedCost,
      estimatedFunding,
      estimatedEnergyImpact,
      annualElectricityConsumptionBefore,
      greenhouseGasEmissionsBefore,
    } = await OperationProvider.getCalculation(
      hsOperation.prestationId,
      hsLocation,
    );

    const rows = await OperationRepository.update(operationUuid, {
      estimatedCost: estimatedCost.data,
      estimatedFunding: estimatedFunding.data,
      estimatedEnergyImpact: estimatedEnergyImpact.data,
      annualElectricityConsumptionBefore,
      greenhouseGasEmissionsBefore,
    });

    return rows[0] ?? null;
  },

  /**
   * Updates the signatory of an operation.
   * If a signatory already exists, it is deleted and replaced by the new one.
   * @param operationUuid identifier of the operation
   * @param contactUuid identifier of the contact
   */
  async updateSignatory(
    operationUuid: OperationUuid,
    contactUuid: ContactUuid,
  ) {
    const [contact, operation] = await Promise.all([
      ContactRepository.get(contactUuid),
      OperationRepository.get(operationUuid),
    ]);

    if (!contact || !operation) {
      throw new Error(
        !contact
          ? `Le contact ${contactUuid} n'existe pas.`
          : `L'opération ${operationUuid} n'existe pas.`,
      );
    }

    if (!contact.id) {
      throw new Error(
        `Le contact ${contactUuid} n'est pas correctement synchronisé.`,
      );
    }

    if (!operation.hsOperation.id) {
      throw new Error(
        `L'opération ${operation.hsOperation.id} n'est pas correctement synchronisée.`,
      );
    }

    if (!contact.email) {
      throw new Error(
        `Ce contact n'a pas d'adresse email. Impossible de le définir comme signataire.`,
      );
    }

    // Get currentSignatory and remove if any
    const signatoryUuid = await OperationRepository.getSignatoryUuid(
      operation.hsOperation.uuid,
    );

    if (signatoryUuid) {
      const oldSignatory = await ContactRepository.get(signatoryUuid);
      if (oldSignatory) {
        await ContactOperationProvider.delete({
          contactHsId: oldSignatory.id,
          contactUuid: oldSignatory.uuid,
          operationHsId: operation.hsOperation.id,
          operationUuid: operation.hsOperation.uuid,
        });
      }
    }

    await ContactOperationRepository.create(
      contactUuid,
      operationUuid,
      CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY,
    );

    await OperationRepository.update(operationUuid, {
      signatoryEmail: contact.email,
    });

    return contactUuid;
  },

  //@todo weird that we have 3 methods to update brief (should be 2: one for user adding information, one for regeneration by AI)
  async updateBrief(uuid: OperationUuid, criteria: OperationBrief) {
    const currentBrief =
      (await OperationRepository.get(uuid))?.hsOperation.botBrief ?? {};

    await OperationRepository.update(uuid, {
      botBrief: { ...currentBrief, ...criteria },
    });
  },

  async generateBrief(
    hsPrestationId: OperationHubspotPrestationId,
    location: Pick<Location, "bdnbData" | "address" | "mainSector">,
  ) {
    const operationTypeInfo = getTypeByHubspotPrestationId(hsPrestationId);

    if (!operationTypeInfo) {
      throw new Error("Impossible de trouver le type d'opération");
    }

    const sections = await Promise.all(
      BRIEF_SECTIONS.map(async (section) => {
        const sectionSchema = BOT_ASSISTANTS[section].schema;
        let sectionContent: z.infer<typeof sectionSchema>;
        try {
          sectionContent = await withTimeout(
            OpenAIProvider.askBriefAssistantForMarketplace({
              section,
              bdnbData: location.bdnbData,
              operationTypeInfo,
              address: location.address,
              mainSector: location.mainSector,
            }),
          );

          return { section, content: sectionContent };
        } catch (error) {
          console.error(`Error fetching section ${section}:`, error);
          return { section, content: null };
        }
      }),
    );

    try {
      const brief: OperationBrief = {
        eligibilityCriteriaCEE:
          BOT_ASSISTANTS.eligibilityCriteriaCEE.schema.parse(
            sections.find((s) => s.section === "eligibilityCriteriaCEE")
              ?.content,
          ),
        qualificationsNeeded: BOT_ASSISTANTS.qualificationsNeeded.schema.parse(
          sections.find((s) => s.section === "qualificationsNeeded")?.content,
        ),
        checksOperations: BOT_ASSISTANTS.checksOperations.schema.parse(
          sections.find((s) => s.section === "checksOperations")?.content,
        ),
        justificationChoiceOperations:
          BOT_ASSISTANTS.justificationChoiceOperations.schema.parse(
            sections.find((s) => s.section === "justificationChoiceOperations")
              ?.content,
          ),
        goalMOA: BOT_ASSISTANTS.goalMOA.schema.parse(
          sections.find((s) => s.section === "goalMOA")?.content,
        ),
        buildingType: BOT_ASSISTANTS.buildingType.schema.parse(
          sections.find((s) => s.section === "buildingType")?.content,
        ),
        buildingCriterias: BOT_ASSISTANTS.buildingCriterias.schema.parse(
          sections.find((s) => s.section === "buildingCriterias")?.content,
        ),
        technicalConstraint: BOT_ASSISTANTS.technicalConstraint.schema.parse(
          sections.find((s) => s.section === "technicalConstraint")?.content,
        ),
      };

      return brief;
    } catch (error) {
      console.error(
        "Une erreur est survenue lors de la récupération des informations du brief: \n",
        error,
      );
      return {};
    }
  },

  async regenerateBrief(operationUuid: OperationUuid) {
    const res = await OperationRepository.get(operationUuid);

    if (!res) {
      throw new Error("Opération non trouvée");
    }

    if (!res.hsOperation.prestationId) {
      throw new Error("Impossible de trouver la prestation de l'opération");
    }

    if (!res.hsLocation) {
      throw new Error("Impossible de trouver le site de l'opération");
    }

    // No brief generated for funding operations
    if (res.hsOperation.funding) {
      return;
    }

    const location = Location.init(res.hsLocation);

    if (!location) {
      throw new Error("Erreur lors de la récupération du site");
    }

    // Generate the brief sections by sections
    const briefSections = await OperationProvider.generateBrief(
      res.hsOperation.prestationId,
      location,
    );

    await OperationRepository.update(operationUuid, {
      botBrief: briefSections,
    });
  },

  async launch({
    uuid,
    additionalInfo,
    plannedBudgetRange,
    startDate,
    signatoryUuid,
    files,
  }: {
    uuid: OperationUuid;
    plannedBudgetRange: string;
    startDate: Date;
    signatoryUuid: ContactUuid;
    additionalInfo?: string | null;
    files?: FileDto[] | null;
  }) {
    const launchingDate = startDate ? dateOnly(startDate) : null;

    const [updatedOperation] = await OperationRepository.update(uuid, {
      additionalInfo,
      plannedBudgetRange,
      launchingDate: launchingDate?.toISOString(),
      closedDate: launchingDate, // timestamp
      phase: OperationPhaseEnum.PRE_LAUNCH,
    });

    const contact = await ContactRepository.get(signatoryUuid);

    if (!contact) {
      throw new Error(`Le signataire ${signatoryUuid} n'existe pas.`);
    }

    await ContactOperationRepository.create(
      contact.uuid,
      uuid,
      CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY,
    );

    await Promise.all(
      (files ?? []).map((file) => OperationProvider.attachDocument(uuid, file)),
    );

    try {
      await OperationProvider.notifyClientAdminsOperationLaunched({
        operationUuid: uuid,
        plannedBudgetRange,
        launchDate: launchingDate?.toISOString().slice(0, 10) ?? null,
      });
    } catch (error) {
      // Mail sending must not block operation launch.
      console.error(
        `[Operation.launch] Failed to notify client administrators for operation ${uuid}:`,
        error,
      );
    }

    return updatedOperation;
  },

  async notifyClientAdminsOperationLaunched({
    operationUuid,
    plannedBudgetRange,
    launchDate,
  }: {
    operationUuid: OperationUuid;
    plannedBudgetRange: string;
    launchDate: string | null;
  }) {
    const row = await OperationRepository.get(operationUuid);
    if (!row?.hsOperation) {
      console.warn(
        `[Operation.notifyClientAdminsOperationLaunched] Operation not found: ${operationUuid}`,
      );
      return;
    }

    const locationUuid =
      row.hsLocation?.uuid ??
      (await LocationRepository.getUuidByOperation(operationUuid));
    if (!locationUuid) {
      console.warn(
        `[Operation.notifyClientAdminsOperationLaunched] Missing location for operation: ${operationUuid}`,
      );
      return;
    }

    const clientUuid = await ClientRepository.getUuidByLocation(locationUuid);
    if (!clientUuid) {
      console.warn(
        `[Operation.notifyClientAdminsOperationLaunched] Missing client for location: ${locationUuid}`,
      );
      return;
    }

    const clientAdmins =
      await ContactClientRepository.getAllAdministrators(clientUuid);

    const recipientsByEmail = new Map<
      string,
      { email: string; name: string }
    >();
    for (const admin of clientAdmins) {
      const email = admin.contact.email?.trim();
      if (!email) {
        continue;
      }

      const key = email.toLowerCase();
      if (recipientsByEmail.has(key)) {
        continue;
      }

      const fullName = [
        admin.contact.firstName?.trim(),
        admin.contact.lastName?.trim(),
      ]
        .filter((part): part is string => !!part)
        .join(" ");

      recipientsByEmail.set(key, {
        email,
        name: fullName || email,
      });
    }

    const recipients = Array.from(recipientsByEmail.values());
    if (!recipients.length) {
      console.info(
        `[Operation.notifyClientAdminsOperationLaunched] No client administrator with email for operation ${operationUuid}`,
      );
      return;
    }

    const operationName =
      row.hsOperation.name?.trim() || `Opération ${operationUuid}`;
    const locationAddress = row.hsLocation
      ? [
          row.hsLocation.streetNumber,
          row.hsLocation.streetName,
          row.hsLocation.zipcode,
          row.hsLocation.city,
        ]
          .map((part) => (part == null ? "" : String(part).trim()))
          .filter((part) => part.length > 0)
          .join(" ")
      : "Site non renseigné";
    const briefUrl = `${MARKETPLACE_UI_URL}/client/brief/${operationUuid}`;

    await Promise.all(
      recipients.map((recipient) =>
        MailersendProvider.sendEmail({
          to: [recipient],
          subject: `Votre opération "${operationName}" est lancée`,
          template: "OPERATION_LAUNCHED_CLIENT_ADMIN",
          data: {
            clientAdminName: recipient.name,
            operationName,
            locationAddress,
            launchDate,
            plannedBudgetRange,
            briefUrl,
          },
        }),
      ),
    );
  },

  async attachDocument(operationUuid: OperationUuid, document: FileDto) {
    const blob = FileProvider.base64ToBlob({
      base64Data: document.data,
      contentType: document.type,
    });

    if (!blob) {
      throw new Error("Impossible de transférer le fichier.");
    }

    const noteUuid = await HubspotProvider.uploadFile({
      file: blob,
      folderPath: "operations-documents",
      fileName: document.name,
    });

    if (noteUuid) {
      await OperationRepository.associateToNote({ operationUuid, noteUuid });
    }
  },
};

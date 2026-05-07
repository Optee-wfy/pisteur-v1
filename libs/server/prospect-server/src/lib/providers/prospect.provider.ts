import { setTimeout as sleep } from "node:timers/promises";
import {
  AssociationProExternalContactType,
  EXTERNAL_SENIORITY_TO_CONTACT_LEVEL,
  FullEnrichEnrichmentStatus,
  KWH_PRICE,
  MARKETPLACE_UI_URL,
  WORK_DOMAIN_LABELS,
  getClimateZone,
  getDpeLabelColor,
  locationBdnbLegalEntityFilterProSchema,
  type LocationBdnbLegalEntityFilterPro,
  type LocationsBdnbLegalEntityProListInput,
} from "@optee/constants";
import { ContactRepository } from "@optee/contact-server";
import {
  EnrichmentProvider,
  EnrichmentRepository,
} from "@optee/enrichment-server";
import {
  ExternalContactProvider,
  ExternalContactRepository,
} from "@optee/external-contact-server";
import { FullEnrichProvider } from "@optee/fullenrich-server";
import {
  getAssociationTypeFromFlags,
  LegalEntityProvider,
  LegalEntityRepository,
} from "@optee/legal-entity-server";
import {
  LocationBdnbProvider,
  LocationBdnbRepository,
} from "@optee/location-bdnb-server";
import { MailersendProvider } from "@optee/mailersend-server";
import type {
  ExternalContact,
  HubspotContact,
  HubspotPro,
  LegalEntityUuid,
  LocationBdnb,
  ProUuid,
} from "@optee/models";
import { Location, type LeadParameters } from "@optee/models";
import { ProRepository } from "@optee/pro-server";
import { ProspectRepository } from "../repositories/prospect.repository";

type ProspectionBuildingsPage = Awaited<
  ReturnType<typeof LocationBdnbRepository.getAllForProPaginated>
>;
type ProspectionBuildingItem = ProspectionBuildingsPage["items"][number];
type ProspectionSelectedBuildingItem = ProspectionBuildingItem & {
  recommendedExternalContactUuid: ExternalContact["uuid"] | null;
};
type SearchableMemberRow = Awaited<
  ReturnType<typeof LegalEntityProvider.getSearchableMembers>
>[number];
type MailProspectionLegalEntityState = {
  exhausted: boolean;
  usedContactUuids: Set<string>;
  usedSocieteInfoIds: Set<string>;
};

const DEFAULT_LEADS_TO_GENERATE = 10;
const DEFAULT_SEND_FREQUENCY_PER_WEEK = 5;
const MAIL_LEAD_COST = 10;
const MIN_PROSPECTION_PAGE_SIZE = 25;
const MAIL_PROSPECTION_ENRICHMENT_TIMEOUT_MS = 120_000;
const MAIL_PROSPECTION_ENRICHMENT_POLL_INTERVAL_MS = 3_000;
const WEEKDAY_SEND_SLOTS: Record<number, number[]> = {
  1: [1],
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
};

export const ProspectProvider = {
  buildProspectionPrompt(input: {
    prompt: string;
    externalContact: Partial<ExternalContact>;
    locationBdnb: LocationBdnb;
    pro: HubspotPro;
    proContact: Partial<HubspotContact>;
  }): string {
    const { externalContact, locationBdnb: location, pro, proContact } = input;

    const safe = (v?: string | number | null) =>
      v === undefined || v === null || v === "" ? "N/A" : String(v);
    const yesNo = (value?: boolean | null) =>
      value === null || value === undefined ? "N/A" : value ? "Oui" : "Non";

    let climateZone: string | null = null;
    if (location.zipcode) {
      try {
        climateZone = getClimateZone(location.zipcode);
      } catch {
        climateZone = null;
      }
    }
    const heatingType = LocationBdnbProvider.buildHeatingType(location);
    const specificConsumption =
      location.electricityConsumptionPerSquareMeter ??
      location.consumption5Usages ??
      null;
    const gesEmissions =
      location.greenhouseGasEmissionsPerSquareMeter ??
      location.gesEmissions5UsesPerM2 ??
      null;
    const qpvFlag = location.isInQpv ?? location.priorityDistrict ?? null;
    const heatedSurface =
      location.surfaceThatRequiresHeating ?? location.surfaceArea ?? null;
    const annualConsumption =
      location.annualElectricityConsumption ??
      (heatedSurface != null && specificConsumption != null
        ? heatedSurface * specificConsumption
        : null);
    const annualCost =
      location.annualElectricityCost ??
      (annualConsumption != null ? annualConsumption * KWH_PRICE : null);
    const ghgPerM2 =
      location.greenhouseGasEmissionsPerSquareMeter ??
      location.gesEmissions5UsesPerM2 ??
      null;
    const annualGhg =
      ghgPerM2 != null && heatedSurface != null
        ? ghgPerM2 * heatedSurface
        : null;
    const estimatedRoi =
      annualCost != null
        ? "À préciser après estimation des travaux (budget énergie ci-dessus)."
        : null;

    return `
      ${input.prompt}

      Utilise les données suivantes :

      - **Contact Destinataire :**
        Nom : ${safe(externalContact.lastName)}
        Prénom : ${safe(externalContact.firstName)}
        Fonction : ${safe(externalContact.role)}

      - **Bâtiment :**
        Adresse : ${safe(Location.makeAddress(location))}
        Type : ${safe(location.sector)}
        Année : ${safe(location.creationDate)}
        Surface : ${safe(location.surfaceArea)} m²
        Surface chauffée estimée : ${safe(location.surfaceThatRequiresHeating)} m²
        Nombre de logements : ${safe(location.nbDwellings ?? location.nbUnits)}
        DPE : ${safe(location.dpeLabel)} (réalisé en ${safe(location.dpeEstablishedDate)})
        Consommation spécifique : ${safe(specificConsumption)} kWh/m².an
        Consommation annuelle estimée : ${safe(annualConsumption)} kWh/an
        Budget électrique estimé : ${safe(annualCost)} €/an
        Émissions de GES : ${safe(gesEmissions)} kgCO2e/m²
        Autres problématiques détectées : ${safe(LocationBdnbProvider.buildDetectedIssues(location))}
        État des murs extérieurs : ${safe(LocationBdnbProvider.buildExteriorWallCondition(location))}
        Type de chauffage : ${safe(heatingType)}
        Énergie principale : ${safe(location.energyType)}
        Ventilation : ${safe(location.ventilationType)}
        Accessibilité PMR : ${yesNo(location.pmrAccessible)}
        Quartier prioritaire : ${yesNo(qpvFlag)}
        Zone climatique : ${safe(climateZone)}
        Nb de bâtiments dans le groupe : ${safe(location.nbBuildings)}
        Nombre d'étages : ${safe(location.nbStoreys)}
        Matériaux murs / toiture : ${safe(location.wallMaterial?.join(", "))} / ${safe(location.roofMaterial?.join(", "))}
        Isolation murs / plancher bas : ${safe(location.exteriorWallInsulationType?.join(", "))} / ${safe(location.lowerFloorInsulationType?.join(", "))}
        Risque radon / argile : ${safe(location.radonRisk)} / ${safe(location.clayRisk)}

      - **Données énergétiques :**
        Impact énergétique estimé : ${safe(annualConsumption)} kWh/an
        Impact carbone : ${safe(annualGhg)} kgCO2e/an
        Impact financier : ${safe(annualCost)} €/an
        ROI estimé : ${safe(estimatedRoi)}


      - **Entreprise expéditrice (utilisatrice d’Optee) :**
        Nom de l’entreprise : ${safe(pro.name)}
        Description : ${safe(pro.description)}
        Lien calendrier à insérer si demande de rendez vous : ${safe(pro.calendarSite ?? "N/A")} (reformate le lien si nécessaire pour obtenir une URL valide commençant par http/https)

        - **Contact expéditeur :**
        Nom : ${safe(proContact.lastName)}
        Prénom : ${safe(proContact.firstName)}
        Fonction : ${safe(proContact.jobTitle)}

        Ne mentionne jamais d'informations personnelles non fournies explicitement dans le contexte.

        Réponds STRICTEMENT au format JSON suivant (JSON valide, sans retour à la ligne dans les valeurs) :
        {
          "subject": "Objet du mail, 60 caractères max",
          "body": "Corps du mail complet (150–180 mots, signature incluse - Nom, prénom, fonction, entreprise de proContact)"
        }
    `;
  },

  async sendLeadsMails() {
    const parameters = await ProspectRepository.getAllProspectParameters();
    const now = new Date();

    const results = await Promise.all(
      parameters.map(async (parameter) => {
        try {
          if (!ProspectProvider.shouldSendLeadMailToday(parameter, now)) {
            return {
              parameterUuid: parameter.uuid,
              proUuid: parameter.proUuid,
              status: "skipped" as const,
              reason: "frequency_not_due",
            };
          }

          const [pro, mainContact, proMembers] = await Promise.all([
            ProRepository.get(parameter.proUuid),
            ProRepository.getMainContacts(parameter.proUuid).then(
              (contacts) => contacts[0] ?? null,
            ),
            ContactRepository.getAllByPro(parameter.proUuid),
          ]);

          if (!pro) {
            return {
              parameterUuid: parameter.uuid,
              status: "skipped" as const,
              reason: "pro_not_found",
            };
          }

          const selectedRecipient =
            proMembers.find(
              (member) =>
                member.contact.uuid === parameter.recipientContactUuid,
            )?.contact ?? null;
          const recipient = selectedRecipient?.email
            ? selectedRecipient
            : mainContact;

          if (!recipient?.email) {
            return {
              parameterUuid: parameter.uuid,
              proUuid: parameter.proUuid,
              status: "skipped" as const,
              reason: "missing_recipient_email",
            };
          }

          const requestedLeads = ProspectProvider.getLeadsToGenerate(parameter);
          const requiredCreditsAtStart = requestedLeads * MAIL_LEAD_COST;

          if ((pro.remainingCredits ?? 0) < requiredCreditsAtStart) {
            return {
              parameterUuid: parameter.uuid,
              proUuid: parameter.proUuid,
              status: "skipped" as const,
              reason: "insufficient_credits",
              requiredCredits: requiredCreditsAtStart,
              remainingCredits: pro.remainingCredits ?? 0,
            };
          }

          const filters =
            ProspectProvider.buildLeadParametersFilters(parameter);
          const buildings =
            await ProspectProvider.loadBuildingsForMailProspection({
              parameter,
              filters,
              proUuid: parameter.proUuid,
            });

          if (buildings.length === 0) {
            return {
              parameterUuid: parameter.uuid,
              proUuid: parameter.proUuid,
              status: "skipped" as const,
              reason: "no_matching_buildings",
            };
          }

          const requiredCredits = buildings.length * MAIL_LEAD_COST;

          const leads = buildings.map((item) => {
            const heatedSurface = item.location.surfaceThatRequiresHeating ?? 0;
            const score = item.location.dpeLabel ?? "NC";
            const companyCount =
              (item.occupancyCounts?.siretCount ?? 0) +
              (item.occupancyCounts?.sirenOnlyCount ?? 0);

            return {
              address: Location.makeAddress(item.location),
              company: String(companyCount),
              heatedSurface,
              buildingType:
                item.location.buildingUsage ?? item.location.sector ?? "",
              score,
              scoreColor: getDpeLabelColor(score),
              url: `${MARKETPLACE_UI_URL}/pro/pisteur/leads/details/${item.location.uuid}`,
            };
          });

          const mailData = {
            proName: pro.name ?? "votre société",
            leads_count: leads.length,
            total_buildings: leads.length,
            total_surface: leads.reduce(
              (total, lead) => total + Number(lead.heatedSurface || 0),
              0,
            ),
            total_companies: leads.reduce(
              (total, lead) => total + Number(lead.company || 0),
              0,
            ),
            leads,
          };

          const payload = {
            pro: {
              uuid: parameter.proUuid,
              name: pro.name,
            },
            leadParameterUuid: parameter.uuid,
            filters:
              ProspectProvider.buildLeadParametersAttachmentFilters(parameter),
            ...mailData,
          };

          const debitedPro = await ProRepository.decrementCredits({
            creditsToDecrement: requiredCredits,
            proUuid: parameter.proUuid,
          });

          if (!debitedPro) {
            return {
              parameterUuid: parameter.uuid,
              proUuid: parameter.proUuid,
              status: "skipped" as const,
              reason: "insufficient_credits",
              requiredCredits,
              remainingCredits: pro.remainingCredits ?? 0,
            };
          }

          try {
            await MailersendProvider.sendEmail({
              to: [
                {
                  email: recipient.email,
                  name:
                    `${recipient.firstName ?? ""} ${recipient.lastName ?? ""}`.trim() ||
                    pro.name ||
                    "Optee",
                },
              ],
              subject: `${leads.length} bâtiment(s) sélectionné(s) pour ${pro.name ?? "votre société"}`,
              template: "PROSPECTION_LOCATIONS",
              data: mailData,
            });
          } catch (error) {
            await ProRepository.incrementCredits({
              creditsToIncrement: requiredCredits,
              proUuid: parameter.proUuid,
            });

            return {
              parameterUuid: parameter.uuid,
              proUuid: parameter.proUuid,
              status: "skipped" as const,
              reason: "email_send_failed",
            };
          }

          await ProspectRepository.addLeadHistory({
            proUuid: parameter.proUuid,
            leads: buildings.map((item) => ({
              locationBdnbUuid: item.location.uuid,
              recommendedExternalContactUuid:
                item.recommendedExternalContactUuid,
            })),
          });
          await ProspectRepository.markLeadParametersAsSent(
            parameter.uuid,
            now,
          );

          return {
            parameterUuid: parameter.uuid,
            proUuid: parameter.proUuid,
            status: "sent" as const,
            buildingCount: payload.total_buildings,
            debitedCredits: requiredCredits,
            recipient: recipient.email,
          };
        } catch (error) {
          return {
            parameterUuid: parameter.uuid,
            proUuid: parameter.proUuid,
            status: "error" as const,
            reason: "unexpected_error",
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );

    return {
      total: results.length,
      sent: results.filter((result) => result.status === "sent").length,
      skipped: results.filter((result) => result.status === "skipped").length,
      errored: results.filter((result) => result.status === "error").length,
      results,
    };
  },

  async getProspectParametersForPro(proUuid: ProUuid) {
    const parameter =
      await ProspectRepository.getProspectParametersByPro(proUuid);

    if (!parameter) {
      return null;
    }

    return {
      filters: ProspectProvider.getStoredLeadParametersFilters(parameter),
      leadsToGenerate: ProspectProvider.getLeadsToGenerate(parameter),
      recipientContactUuid: parameter.recipientContactUuid,
      sendFrequencyPerWeek: ProspectProvider.getSendFrequencyPerWeek(parameter),
    };
  },

  buildLeadParametersFilters(parameter: LeadParameters) {
    const storedFilters =
      ProspectProvider.getStoredLeadParametersFilters(parameter);

    return {
      ...storedFilters,
      page: 0,
      pageSize: ProspectProvider.getLeadsToGenerate(parameter),
      sort: { sortBy: "random" as const, sortOrder: "asc" as const },
      show: "new" as const,
      legalEntityUuid: null,
    };
  },

  getLeadsToGenerate(parameter: LeadParameters) {
    const value = parameter.leadsToGenerate ?? DEFAULT_LEADS_TO_GENERATE;

    if (!Number.isInteger(value)) {
      return DEFAULT_LEADS_TO_GENERATE;
    }

    return Math.min(10, Math.max(1, value));
  },

  getSendFrequencyPerWeek(parameter: LeadParameters) {
    const value =
      parameter.sendFrequencyPerWeek ?? DEFAULT_SEND_FREQUENCY_PER_WEEK;

    if (!Number.isInteger(value)) {
      return DEFAULT_SEND_FREQUENCY_PER_WEEK;
    }

    return Math.min(5, Math.max(1, value));
  },

  shouldSendLeadMailToday(parameter: LeadParameters, now: Date) {
    const frequency = ProspectProvider.getSendFrequencyPerWeek(parameter);
    const allowedDays = WEEKDAY_SEND_SLOTS[frequency] ?? [1, 2, 3, 4, 5];
    const currentDay = now.getDay();

    if (!allowedDays.includes(currentDay)) {
      return false;
    }

    if (!parameter.lastSentAt) {
      return true;
    }

    const lastSentAt = new Date(parameter.lastSentAt);

    return !ProspectProvider.isSameCalendarDay(lastSentAt, now);
  },

  isSameCalendarDay(left: Date, right: Date) {
    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  },

  buildLeadParametersAttachmentFilters(parameter: LeadParameters) {
    const storedFilters =
      ProspectProvider.getStoredLeadParametersFilters(parameter);

    return {
      ...storedFilters,
      dpeLabel: storedFilters.dpe ?? null,
    };
  },

  getStoredLeadParametersFilters(
    parameter: LeadParameters,
  ): LocationBdnbLegalEntityFilterPro {
    return locationBdnbLegalEntityFilterProSchema.parse({
      locationDepartment: parameter.locationDepartment ?? undefined,
      locationBuildingType: parameter.locationBuildingType ?? undefined,
      sector: parameter.sector ?? undefined,
      address: parameter.address ?? undefined,
      isInQpv: parameter.isInQpv ?? undefined,
      nbUnits: parameter.nbUnits ?? undefined,
      nbBuildings: parameter.nbBuildings ?? undefined,
      nbLegalEntitiesPerLocation:
        parameter.nbLegalEntitiesPerLocation ?? undefined,
      buildingOccupancyStatus: parameter.buildingOccupancyStatus ?? undefined,
      creationDate: parameter.creationDate ?? undefined,
      maxConstructionPeriod: parameter.maxConstructionPeriod ?? undefined,
      nbParkingSpots: parameter.nbParkingSpots ?? undefined,
      habitableSurfaceDwelling: parameter.habitableSurfaceDwelling ?? undefined,
      pmrAccessible: parameter.pmrAccessible ?? undefined,
      glazingType: parameter.glazingType ?? undefined,
      exteriorWallInsulationType:
        parameter.exteriorWallInsulationType ?? undefined,
      lowerFloorInsulationType: parameter.lowerFloorInsulationType ?? undefined,
      upperFloorInsulationType: parameter.upperFloorInsulationType ?? undefined,
      surfaceArea: parameter.surfaceArea ?? undefined,
      habitableSurfaceArea: parameter.habitableSurfaceArea ?? undefined,
      nbStoreys: parameter.nbStoreys ?? undefined,
      glazingArea: parameter.glazingArea ?? undefined,
      dpeCertified: parameter.dpeCertified ?? undefined,
      inertiaClass: parameter.inertiaClass ?? undefined,
      nbDwellings: parameter.nbDwellings ?? undefined,
      heatingSystem: parameter.heatingSystem ?? undefined,
      heatingType: parameter.heatingType ?? undefined,
      dpe: parameter.dpeLabel ?? undefined,
      hasAirConditioning: parameter.hasAirConditioning ?? undefined,
      ventilationType: parameter.ventilationType ?? undefined,
      ecsGeneratorType: parameter.ecsGeneratorType ?? undefined,
      mainGesClass: parameter.mainGesClass ?? undefined,
      dpeEstablishedDate: parameter.dpeEstablishedDate ?? undefined,
      surfaceThatRequiresHeating:
        parameter.surfaceThatRequiresHeating ?? undefined,
      electricityConsumptionPerSquareMeter:
        parameter.electricityConsumptionPerSquareMeter ?? undefined,
      greenhouseGasEmissionsPerSquareMeter:
        parameter.greenhouseGasEmissionsPerSquareMeter ?? undefined,
      annualElectricityConsumption:
        parameter.annualElectricityConsumption ?? undefined,
      nbEmployeesRange: parameter.nbEmployeesRange ?? undefined,
      legalEntityTypes: parameter.legalEntityTypes ?? undefined,
      tertiaryActivityType: parameter.tertiaryActivityType ?? undefined,
      nbPremises: parameter.nbPremises ?? undefined,
      type: parameter.type ?? undefined,
      buildingUsage: parameter.buildingUsage ?? undefined,
      ipeUsageReason: parameter.ipeUsageReason ?? undefined,
      ipeNormalizedScore: parameter.ipeNormalizedScore ?? undefined,
      legalForm: parameter.legalForm ?? undefined,
      mainBusinessActivity: parameter.mainBusinessActivity ?? undefined,
      domains: parameter.domains ?? undefined,
      levels: parameter.levels ?? undefined,
      nbRelatedLocations: parameter.nbRelatedLocations ?? undefined,
      name: parameter.name ?? undefined,
      zipCode: parameter.zipCode ?? undefined,
      legalEntityDepartment: parameter.legalEntityDepartment ?? undefined,
      height: parameter.height ?? undefined,
      energyType: parameter.energyType ?? undefined,
      hasBalcony: parameter.hasBalcony ?? undefined,
      multipleExposedFacades: parameter.multipleExposedFacades ?? undefined,
      heatingBackupEnergyType: parameter.heatingBackupEnergyType ?? undefined,
      solarHeating: parameter.solarHeating ?? undefined,
      solarEcs: parameter.solarEcs ?? undefined,
      wallMaterial: parameter.wallMaterial ?? undefined,
      roofMaterial: parameter.roofMaterial ?? undefined,
    });
  },

  async filterBuildingsByExternalContactCriteria({
    items,
    filters,
    proUuid,
    legalEntityStateByUuid,
  }: {
    items: ProspectionBuildingItem[];
    filters: LocationBdnbLegalEntityFilterPro;
    proUuid: ProUuid;
    legalEntityStateByUuid?: Map<
      LegalEntityUuid,
      MailProspectionLegalEntityState
    >;
  }) {
    const stateByUuid =
      legalEntityStateByUuid ??
      new Map<LegalEntityUuid, MailProspectionLegalEntityState>();
    const matchedItems: ProspectionSelectedBuildingItem[] = [];

    for (const item of items) {
      const legalEntities = item.legalEntities ?? [];
      const legalEntityUuids: LegalEntityUuid[] = legalEntities.map(
        (entity) => entity.uuid,
      );

      if (legalEntityUuids.length === 0) {
        continue;
      }

      let itemMatched = false;

      for (const legalEntityUuid of legalEntityUuids) {
        const state = stateByUuid.get(legalEntityUuid) ?? {
          exhausted: false,
          usedContactUuids: new Set<string>(),
          usedSocieteInfoIds: new Set<string>(),
        };
        stateByUuid.set(legalEntityUuid, state);

        if (state.exhausted) {
          continue;
        }

        try {
          const result = await ProspectProvider.selectContactForMailProspection(
            {
              filters,
              legalEntityUuid,
              proUuid,
              usedContactUuids: state.usedContactUuids,
              usedSocieteInfoIds: state.usedSocieteInfoIds,
            },
          );

          if (result.contact) {
            state.usedContactUuids.add(result.contact.uuid);
            if (result.contact.societeInfoId) {
              state.usedSocieteInfoIds.add(result.contact.societeInfoId);
            }
            matchedItems.push({
              ...item,
              recommendedExternalContactUuid: result.contact.uuid,
            });
            itemMatched = true;
            break;
          }

          if (result.exhausted) {
            state.exhausted = true;
          }
        } catch (error) {
          console.error(
            `🚩 [Prospection mail] Échec du filtrage des contacts pour l'entité légale [${legalEntityUuid}]: ${error instanceof Error ? error.message : String(error)}`,
          );
          state.exhausted = true;
        }
      }

      if (!itemMatched) {
        continue;
      }
    }

    return matchedItems;
  },

  async selectContactForMailProspection({
    filters,
    legalEntityUuid,
    proUuid,
    usedContactUuids,
    usedSocieteInfoIds,
  }: {
    filters: LocationBdnbLegalEntityFilterPro;
    legalEntityUuid: LegalEntityUuid;
    proUuid: ProUuid;
    usedContactUuids: Set<string>;
    usedSocieteInfoIds: Set<string>;
  }) {
    const searchableContacts =
      await ProspectProvider.getContactsForMailProspection({
        filters,
        legalEntityUuid,
        proUuid,
      });

    for (const row of searchableContacts) {
      const externalContactUuid = ProspectProvider.getExternalContactUuid(
        row.contact,
      );
      const societeInfoId = row.contact.societeInfoId ?? null;

      if (
        (externalContactUuid && usedContactUuids.has(externalContactUuid)) ||
        (societeInfoId && usedSocieteInfoIds.has(societeInfoId))
      ) {
        continue;
      }

      const discoveredContact =
        await ProspectProvider.contactHasEmailOrPhoneForMailProspection({
          legalEntityUuid,
          proUuid,
          row,
        });

      if (discoveredContact) {
        return {
          contact: discoveredContact,
          exhausted: false,
        };
      }

      if (externalContactUuid) {
        usedContactUuids.add(externalContactUuid);
      }
      if (societeInfoId) {
        usedSocieteInfoIds.add(societeInfoId);
      }
    }

    return {
      contact: null,
      exhausted: true,
    };
  },

  async loadBuildingsForMailProspection({
    parameter,
    filters,
    proUuid,
  }: {
    parameter: LeadParameters;
    filters: LocationsBdnbLegalEntityProListInput;
    proUuid: ProUuid;
  }): Promise<ProspectionSelectedBuildingItem[]> {
    const requestedLeads = ProspectProvider.getLeadsToGenerate(parameter);
    const sentLocationBdnbUuids = new Set(
      await ProspectRepository.getSentLocationBdnbUuidsByPro(proUuid),
    );

    const pageSize = Math.max(requestedLeads, MIN_PROSPECTION_PAGE_SIZE);
    const eligibleBuildings: ProspectionSelectedBuildingItem[] = [];
    const seenLocationUuids = new Set<string>();
    const legalEntityStateByUuid = new Map<
      LegalEntityUuid,
      MailProspectionLegalEntityState
    >();

    let page = 0;
    let total = 0;

    do {
      const response = await LocationBdnbRepository.getAllForProPaginated({
        filters: {
          ...filters,
          page,
          pageSize,
          sort: {
            sortBy: "random",
            sortOrder: "asc",
          },
        },
        proUuid,
      });

      total = response.total;

      const unseenItems = response.items.filter(
        (item) => !sentLocationBdnbUuids.has(item.location.uuid),
      );

      const filteredResponse =
        await ProspectProvider.filterBuildingsByExternalContactCriteria({
          items: unseenItems,
          filters,
          proUuid,
          legalEntityStateByUuid,
        });

      for (const item of filteredResponse) {
        if (seenLocationUuids.has(item.location.uuid)) {
          continue;
        }

        seenLocationUuids.add(item.location.uuid);
        eligibleBuildings.push(item);

        if (eligibleBuildings.length >= requestedLeads) {
          return eligibleBuildings.slice(0, requestedLeads);
        }
      }

      page += 1;
    } while (page * pageSize < total);

    return eligibleBuildings;
  },

  hasExternalContactFilters(filters: LocationBdnbLegalEntityFilterPro) {
    return (
      (filters.domains?.length ?? 0) > 0 || (filters.levels?.length ?? 0) > 0
    );
  },

  contactMatchesExternalFilters(
    row: Pick<SearchableMemberRow, "contact">,
    filters: LocationBdnbLegalEntityFilterPro,
  ) {
    const matchesDomain =
      !filters.domains?.length ||
      filters.domains.some(
        (domain) => WORK_DOMAIN_LABELS[domain] === row.contact.department,
      );

    const contactLevel =
      row.contact.seniority &&
      row.contact.seniority in EXTERNAL_SENIORITY_TO_CONTACT_LEVEL
        ? EXTERNAL_SENIORITY_TO_CONTACT_LEVEL[row.contact.seniority]
        : null;

    const matchesLevel =
      !filters.levels?.length ||
      (contactLevel ? filters.levels.includes(contactLevel) : false);

    return matchesDomain && matchesLevel;
  },

  async getContactsForMailProspection({
    filters,
    legalEntityUuid,
    proUuid,
  }: {
    filters: LocationBdnbLegalEntityFilterPro;
    legalEntityUuid: LegalEntityUuid;
    proUuid: ProUuid;
  }) {
    const searchableContacts = await LegalEntityProvider.getSearchableMembers(
      legalEntityUuid,
      proUuid,
    );

    return searchableContacts
      .filter((row) =>
        ProspectProvider.hasExternalContactFilters(filters)
          ? ProspectProvider.contactMatchesExternalFilters(row, filters)
          : true,
      )
      .sort(
        (left, right) =>
          (right.contact.confidenceScore ?? -1) -
          (left.contact.confidenceScore ?? -1),
      );
  },

  hasEmailOrPhone(contact: { email?: string | null; phone?: string | null }) {
    return (
      (contact.email ?? "").trim().length > 0 ||
      (contact.phone ?? "").trim().length > 0
    );
  },

  hasEmailAndPhone(contact: { email?: string | null; phone?: string | null }) {
    return (
      (contact.email ?? "").trim().length > 0 &&
      (contact.phone ?? "").trim().length > 0
    );
  },

  getExternalContactUuid(
    contact: SearchableMemberRow["contact"],
  ): ExternalContact["uuid"] | null {
    return "uuid" in contact ? (contact.uuid ?? null) : null;
  },

  async contactHasEmailOrPhoneForMailProspection({
    legalEntityUuid,
    proUuid,
    row,
  }: {
    legalEntityUuid: LegalEntityUuid;
    proUuid: ProUuid;
    row: SearchableMemberRow;
  }) {
    const discoveredContacts = await ExternalContactProvider.discoverContacts({
      contacts: [
        {
          uuid: ProspectProvider.getExternalContactUuid(row.contact),
          societeInfoId: row.contact.societeInfoId ?? null,
          origin: row.contact.origin ?? null,
        },
      ],
      legalEntityUuid,
      proUuid,
      skipCreditDebit: true,
      skipAssociateWithPro: true,
    });

    if (!discoveredContacts.length) {
      return null;
    }

    for (const discoveredRow of discoveredContacts) {
      if (ProspectProvider.hasEmailOrPhone(discoveredRow.contact)) {
        await ProspectProvider.associateContactForMailProspection({
          contact: discoveredRow.contact,
          proUuid,
        });
        return discoveredRow.contact;
      }

      const persistedContact = await ExternalContactRepository.get(
        discoveredRow.contact.uuid,
      );

      if (!persistedContact) {
        continue;
      }

      const enrichedContact =
        await ProspectProvider.enrichContactForMailProspectionWithoutDebit({
          contact: persistedContact,
          legalEntityUuid,
          proUuid,
        });

      if (
        enrichedContact &&
        ProspectProvider.hasEmailOrPhone(enrichedContact)
      ) {
        await ProspectProvider.associateContactForMailProspection({
          contact: enrichedContact,
          proUuid,
        });
        return enrichedContact;
      }
    }

    return null;
  },

  async enrichContactForMailProspectionWithoutDebit({
    contact,
    legalEntityUuid,
    proUuid,
  }: {
    contact: ExternalContact;
    legalEntityUuid: LegalEntityUuid;
    proUuid: ProUuid;
  }) {
    const legalEntity = await LegalEntityRepository.get(legalEntityUuid);
    if (!legalEntity) {
      return null;
    }

    const enrichmentId = await FullEnrichProvider.startBulkEnrichment(
      [
        {
          contact,
          website: legalEntity.website ?? "",
          name: legalEntity.name ?? "",
          previousAssociationType: AssociationProExternalContactType.NONE,
          associationType: AssociationProExternalContactType.BOTH,
          enrichFields: ["contact.emails", "contact.phones"],
        },
      ],
      proUuid,
    );

    if (!enrichmentId) {
      return ExternalContactRepository.get(contact.uuid);
    }

    if (
      process.env["VITE_ENV"] !== "preview" &&
      process.env["VITE_ENV"] !== "production"
    ) {
      return ExternalContactRepository.get(contact.uuid);
    }

    await EnrichmentRepository.create({
      enrichmentId,
      legalEntityUuid,
      contacts: [contact.uuid],
      status: FullEnrichEnrichmentStatus.CREATED,
      startedAt: new Date(),
      proUuid,
    });

    const deadline = Date.now() + MAIL_PROSPECTION_ENRICHMENT_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const status = await EnrichmentProvider.getStatus(enrichmentId);

      if (
        status !== FullEnrichEnrichmentStatus.CREATED &&
        status !== FullEnrichEnrichmentStatus.IN_PROGRESS
      ) {
        break;
      }

      await sleep(MAIL_PROSPECTION_ENRICHMENT_POLL_INTERVAL_MS);
    }

    return ExternalContactRepository.get(contact.uuid);
  },

  async completeLeadRecommendedContact({
    contact,
    legalEntityUuid,
    proUuid,
  }: {
    contact: ExternalContact;
    legalEntityUuid: LegalEntityUuid;
    proUuid: ProUuid;
  }) {
    if (
      process.env["VITE_ENV"] !== "production" &&
      process.env["VITE_ENV"] !== "development" &&
      process.env["VITE_ENV"] !== "preview"
    ) {
      return contact;
    }

    if (ProspectProvider.hasEmailAndPhone(contact)) {
      return contact;
    }

    const enrichedContact =
      await ProspectProvider.enrichContactForMailProspectionWithoutDebit({
        contact,
        legalEntityUuid,
        proUuid,
      });

    const finalContact = enrichedContact ?? contact;

    if (ProspectProvider.hasEmailOrPhone(finalContact)) {
      await ProspectProvider.associateContactForMailProspection({
        contact: finalContact,
        proUuid,
      });
    }

    return finalContact;
  },

  async associateContactForMailProspection({
    contact,
    proUuid,
  }: {
    contact: ExternalContact;
    proUuid: ProUuid;
  }) {
    const associationType = getAssociationTypeFromFlags({
      hasEmail: (contact.email ?? "").trim().length > 0,
      hasPhone: (contact.phone ?? "").trim().length > 0,
    });

    if (associationType === AssociationProExternalContactType.NONE) {
      return null;
    }

    return ExternalContactRepository.associateWithPro(
      proUuid,
      contact.uuid,
      associationType,
    );
  },
};

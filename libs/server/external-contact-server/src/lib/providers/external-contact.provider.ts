import type { ContactLevel, WorkDomain } from "@optee/constants";
import {
  AssociationProExternalContactType,
  coerceSeniority,
  CONTACT_DISCOVERY_COST,
  ExternalContactSource,
  ExternalContactType,
} from "@optee/constants";
import { LegalEntityRepository } from "@optee/legal-entity-server";
import type {
  ExternalContact,
  ExternalContactUuid,
  LegalEntityUuid,
  NewExternalContact,
  ProUuid,
} from "@optee/models";
import { ProProvider } from "@optee/pro-server";
import { SocieteInfoProvider } from "@optee/societe-info-server";
import { isNotNullish } from "@optee/utils";
import { ExternalContactRepository } from "../repositories/external-contact.repository";

type ExternalContactSearchRow = {
  contact: ExternalContact;
  isBillable: boolean;
  legalEntities: {
    uuid: LegalEntityUuid;
    name: string | null;
    type: string | null;
  }[];
  associationType: AssociationProExternalContactType | null;
};

type SearchLegalEntity = NonNullable<
  Awaited<ReturnType<typeof LegalEntityRepository.get>>
>;

export const ExternalContactProvider = {
  async create(contact: NewExternalContact, legalEntityUuid: LegalEntityUuid) {
    try {
      const ec = await ExternalContactRepository.create(
        {
          ...contact,
          createdAt: new Date(),
        },
        legalEntityUuid,
      );
      if (!ec || !ec.contact) {
        throw new Error("External contact creation failed");
      }

      if (ec.status !== "exist-company") {
        await ExternalContactRepository.associateWithLegalEntity(
          legalEntityUuid,
          ec.contact.uuid,
        );
      }

      return {
        legalEntityUuid,
        ...ec.contact,
      };
    } catch (error) {
      console.error(
        `🚩 Erreur lors de la création du contact externe pour l'entité légale [${legalEntityUuid}]:`,
        error,
      );
      return null;
    }
  },

  async getAllByLegalEntity(legalEntityUuid: LegalEntityUuid) {
    const externalContactsAssociations =
      await ExternalContactRepository.getAllAssociationsByLegalEntityUuid(
        legalEntityUuid,
      );

    const externalContactUuids = [
      ...new Set(
        externalContactsAssociations
          .map((association) => association.externalContactUuid)
          .filter(isNotNullish),
      ),
    ];

    const legalEntitiesByContact =
      await ExternalContactRepository.getLegalEntitiesByExternalContactUuids(
        externalContactUuids,
      );

    const legalEntitiesMap = new Map(
      legalEntitiesByContact.map((item) => [
        item.externalContactUuid,
        item.legalEntities,
      ]),
    );

    const contacts =
      await ExternalContactRepository.getByUuids(externalContactUuids);
    const contactsByUuid = new Map(
      contacts.map((contact) => [contact.uuid, contact]),
    );

    const externalContacts = await Promise.all(
      externalContactsAssociations.map(async (association) => {
        if (!association.externalContactUuid) {
          return null;
        }
        const contact =
          contactsByUuid.get(association.externalContactUuid) ?? null;
        // We want to exclude contacts that have neither first name nor last name and are not of type GENERIC
        if (
          !contact ||
          (!contact.firstName &&
            !contact.lastName &&
            contact.type !== ExternalContactType.GENERIC)
        ) {
          console.warn(
            `🚩 Contact externe [${association.externalContactUuid}] exclu car sans prénom et nom et de type non générique.`,
          );
          return null;
        }

        if (
          contact.origin === ExternalContactSource.HUNTER ||
          contact.origin === ExternalContactSource.HUNTER_GROUP
        ) {
          console.warn(
            `🚩 Contact externe [${association.externalContactUuid}] exclu car provenant de Hunter, source non fiable pour les contacts associés à une entité légale.`,
          );
          return null;
        }
        return {
          contact,
          legalEntities:
            legalEntitiesMap.get(association.externalContactUuid) ?? [],
        };
      }),
    );

    return externalContacts.filter(isNotNullish);
  },

  async buildSearchableContacts(context: {
    proUuid: ProUuid;
    legalEntityUuid: LegalEntityUuid;
  }) {
    const knownContacts = await ExternalContactProvider.getAllByLegalEntity(
      context.legalEntityUuid,
    );
    const knownByPro = await ExternalContactRepository.getAllByUuidForPro({
      proUuid: context.proUuid,
      externalContactUuids: knownContacts.map((c) => c.contact.uuid),
    });
    const knownByProMap = new Map(
      knownByPro.map((row) => [row.contact.uuid, row]),
    );

    return {
      searchable: knownContacts
        .map((row) => {
          const known = knownByProMap.get(row.contact.uuid);
          const associationType = known?.associationType ?? null;
          return {
            contact: row.contact,
            legalEntities: row.legalEntities,
            isBillable: !associationType,
            associationType,
          };
        })
        .filter((row) => row.isBillable),
      knownByPro,
    };
  },

  async fetchSocieteInfoContacts({
    siren,
    context,
  }: {
    siren: string | null | undefined;
    context: {
      proUuid: ProUuid;
      legalEntityUuid: LegalEntityUuid;
      domains?: WorkDomain[];
      levels?: ContactLevel[];
      contactIds?: string[];
    };
  }) {
    if (!siren) {
      throw new Error("Aucun SIREN trouvé pour cette entité légale.");
    }

    const infos = await SocieteInfoProvider.get({
      siren,
      domains: context.domains ?? [],
      contacts: context.contactIds ?? [],
      levels: context.levels ?? [],
    });

    if ("errorCode" in infos) {
      console.error("[SocieteInfo] contact search failed:", {
        errorCode: infos.errorCode,
        errorType: "errorType" in infos ? infos.errorType : undefined,
        error: "error" in infos ? infos.error : undefined,
        message: "message" in infos ? infos.message : undefined,
        raw: infos,
      });
      return [];
    }

    return infos.contacts ?? [];
  },

  async createContactsFromSocieteInfo({
    matchingContacts,
    legalEntity,
    legalEntityUuid,
  }: {
    matchingContacts: {
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      role?: string | null;
      domain_label?: string | null;
      contact_score?: number | null;
      level_label?: string | null;
      id?: string | null;
    }[];
    legalEntity: SearchLegalEntity;
    legalEntityUuid: LegalEntityUuid;
  }): Promise<ExternalContactSearchRow[]> {
    if (!matchingContacts.length) {
      return [];
    }

    const createdContacts = await Promise.all(
      matchingContacts.map(async (contact) => {
        try {
          return ExternalContactProvider.create(
            {
              email: contact.email,
              firstName: contact.firstName,
              lastName: contact.lastName,
              role: contact.role,
              department: contact.domain_label,
              seniority: coerceSeniority(contact.level_label),
              origin: ExternalContactSource.SOCIETE_INFO,
              confidenceScore:
                contact.contact_score != null
                  ? contact.contact_score * 100
                  : null,
              type:
                contact.firstName || contact.lastName
                  ? ExternalContactType.PERSONAL
                  : ExternalContactType.GENERIC,
              societeInfoId: contact.id,
            },
            legalEntityUuid,
          );
        } catch (error) {
          console.error(
            "🚩 [création d'un contact externe] Une erreur est survenue: ",
            error,
          );
          return null;
        }
      }),
    );

    return createdContacts.filter(isNotNullish).map((contact) => ({
      contact,
      legalEntities: [
        {
          uuid: legalEntityUuid,
          name: legalEntity.name,
          type: legalEntity.type,
        },
      ],
      associationType: AssociationProExternalContactType.SEARCHED,
      isBillable: true,
    }));
  },

  async discoverContacts({
    contacts,
    legalEntityUuid,
    proUuid,
    skipCreditDebit = false,
    skipAssociateWithPro = false,
  }: {
    contacts: {
      societeInfoId: string | null;
      origin: ExternalContactSource | null;
      uuid: ExternalContactUuid | null;
    }[];
    legalEntityUuid: LegalEntityUuid;
    proUuid: ProUuid;
    skipCreditDebit?: boolean;
    skipAssociateWithPro?: boolean;
  }) {
    const discoveredContacts = [];
    try {
      const { knownByPro, searchable } =
        await ExternalContactProvider.buildSearchableContacts({
          proUuid,
          legalEntityUuid,
        });
      const legalEntity = await LegalEntityRepository.get(legalEntityUuid);
      if (!legalEntity) {
        throw new Error(
          `Aucune entité légale trouvée pour l'UUID ${legalEntityUuid}`,
        );
      }

      const contactsForSocieteInfoIds = contacts
        .map((c) => c.societeInfoId)
        .filter(isNotNullish);
      if (contactsForSocieteInfoIds.length) {
        const societeInfoContacts =
          await ExternalContactProvider.fetchSocieteInfoContacts({
            siren: legalEntity.siren,
            context: {
              contactIds: contactsForSocieteInfoIds,
              legalEntityUuid,
              proUuid,
            },
          });

        if (societeInfoContacts.length) {
          const createdContacts =
            await ExternalContactProvider.createContactsFromSocieteInfo({
              matchingContacts: societeInfoContacts,
              legalEntity,
              legalEntityUuid,
            });
          discoveredContacts.push(...createdContacts);
        }
      }

      const contactsForPapers = contacts
        .filter((c) => c.origin === ExternalContactSource.PAPPERS)
        .map((c) => c.uuid)
        .filter(isNotNullish);

      if (contactsForPapers.length) {
        const pappersContacts = (
          await Promise.all(
            contactsForPapers.map((uuid) =>
              ExternalContactRepository.get(uuid),
            ),
          )
        )
          .map((contact) => ({
            contact,
            legalEntities:
              searchable.find((row) => row.contact.uuid === contact?.uuid)
                ?.legalEntities ?? [],
            associationType:
              knownByPro.find((row) => row.contact.uuid === contact?.uuid)
                ?.associationType ?? null,
            isBillable: !knownByPro.find(
              (row) => row.contact.uuid === contact?.uuid,
            )?.associationType,
          }))
          .filter((row) => row.contact !== null) as ExternalContactSearchRow[];

        if (pappersContacts.length) {
          discoveredContacts.push(...pappersContacts);
        }
      }

      if (discoveredContacts.length === 0) {
        await LegalEntityRepository.update(legalEntityUuid, {
          noContactCanBeFound: true,
        });
        console.warn(
          `[Découverte de contact] Aucun contact trouvé pour l'entité légale [${legalEntityUuid}] avec les contacts fournis.`,
          contacts,
        );
        return [];
      }

      const billableContacts = discoveredContacts.filter((row) => {
        const isBillable = row.isBillable === true;
        const isNotAssociated =
          row.associationType === null || row.associationType === undefined;
        return isBillable || isNotAssociated;
      });

      if (billableContacts.length) {
        if (!skipAssociateWithPro) {
          await Promise.all(
            billableContacts.map(async (row) => {
              await ExternalContactRepository.associateWithPro(
                proUuid,
                row.contact.uuid,
                AssociationProExternalContactType.SEARCHED,
              );
            }),
          );
        }

        if (!skipCreditDebit) {
          await ProProvider.decrementCredits({
            proUuid,
            creditsToDecrement:
              billableContacts.length * CONTACT_DISCOVERY_COST,
          });
        }
      }

      return discoveredContacts;
    } catch (error) {
      console.error(
        "🚩 [découverte de contacts] Une erreur est survenue:",
        error,
      );
      return [];
    }
  },
};

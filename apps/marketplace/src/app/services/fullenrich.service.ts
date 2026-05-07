import { computed, inject, Injectable, signal } from "@angular/core";
import type { FullEnrichEnrichmentId } from "@optee/constants";
import {
  AssociationProExternalContactType,
  FullEnrichEnrichmentStatus,
  isEnrichmentDone,
  MAIL_CONTACT_ENRICHMENT_COST,
  PHONE_CONTACT_ENRICHMENT_COST,
} from "@optee/constants";
import { environment } from "@optee/env";
import type {
  ExternalContact,
  ExternalContactUuid,
  LegalEntityUuid,
} from "@optee/models";
import { ToastService } from "@optee/ui/services/toast.service";
import { sleep } from "@optee/utils";
import trpcClient from "../../trpc-client";
import { ProService } from "./pro.service";
import { TrackingService } from "./tracking.service";

// Simulation delay constants (in milliseconds)
const SIMULATION_DELAY = 30000;
// Simulation delay for development environment
const DEV_SIMULATION_DELAY = 6000;

type EnrichmentStatus = "in-progress" | "done" | "timeout";

type ActiveEnrichmentResult = {
  emailCount: number;
  phoneCount: number;
};

type ActiveEnrichment = {
  enrichmentId: FullEnrichEnrichmentId;
  legalEntityUuid: LegalEntityUuid;
  legalEntityName?: string | null;
  status: EnrichmentStatus;
  contacts: {
    uuid: ExternalContactUuid;
    type: AssociationProExternalContactType;
  }[];
  result?: ActiveEnrichmentResult;
  // startTime: number | null; // to be used for progress calculation
};

type SelectedContactForEnrichment = {
  contact: ExternalContact & {
    emailUnlocked?: boolean;
    phoneUnlocked?: boolean;
  };
  legalEntityUuid: LegalEntityUuid;
  legalEntityName?: string | null;
};

type EnrichableContactRow = {
  contact: ExternalContact;
  legalEntities?: {
    uuid: LegalEntityUuid;
    name?: string | null;
  }[];
};

@Injectable({ providedIn: "root" })
export class FullEnrichService {
  private readonly toastService = inject(ToastService);
  private readonly proService = inject(ProService);
  private readonly trackingService = inject(TrackingService);
  private readonly enrichmentFadeOutTimers = new Map<
    FullEnrichEnrichmentId,
    ReturnType<typeof setTimeout>
  >();

  readonly activeEnrichments = signal<ActiveEnrichment[]>([]);
  readonly lastCompletedEnrichmentId = signal<FullEnrichEnrichmentId | null>(
    null,
  );

  readonly selectedContactsForEnrichment = signal<
    SelectedContactForEnrichment[]
  >([]);

  readonly showAllEnrichments = signal(true);

  // readonly externalContactsEnriching = signal<
  //   { uuid: ExternalContactUuid; type: AssociationProExternalContactType }[]
  // >([]);

  readonly contactsEnrichingList = computed(() => {
    const activeContacts = this.activeEnrichments()
      .filter((enrichment) => enrichment.status === "in-progress")
      .flatMap((enrichment) => enrichment.contacts);
    // const externalContactsEnriching = this.externalContactsEnriching();
    return activeContacts;
    // Array.from(
    //   new Set([...activeContacts]), //, ...externalContactsEnriching
    // );
  });

  readonly contactsEnrichingSet = computed(() => {
    const set = new Set<string>();
    for (const item of this.contactsEnrichingList()) {
      set.add(`${item.uuid}-${item.type}`);
    }
    return set;
  });

  isContactEnriching(
    uuid: ExternalContactUuid,
    type: AssociationProExternalContactType,
  ): boolean {
    return this.contactsEnrichingSet().has(`${uuid}-${type}`);
  }

  enrichSingleContact(params: {
    row: EnrichableContactRow;
    type: AssociationProExternalContactType;
    emailUnlocked?: boolean;
    phoneUnlocked?: boolean;
    legalEntityUuid?: LegalEntityUuid | null;
    legalEntityName?: string | null;
  }) {
    const {
      row,
      type,
      emailUnlocked,
      phoneUnlocked,
      legalEntityUuid: fallbackLegalEntityUuid,
      legalEntityName: fallbackLegalEntityName,
    } = params;
    const legalEntityUuid =
      row.legalEntities?.[0]?.uuid ?? fallbackLegalEntityUuid ?? null;
    if (!legalEntityUuid) {
      this.toastService.openError(
        "Enrichissement de contacts",
        "Aucune entreprise valide n'a été trouvée pour l'enrichissement.",
      );
      return;
    }

    const legalEntityName =
      row.legalEntities?.[0]?.name ?? fallbackLegalEntityName ?? null;
    this.selectedContactsForEnrichment.set([
      {
        legalEntityUuid,
        legalEntityName,
        contact: {
          ...row.contact,
          emailUnlocked,
          phoneUnlocked,
        },
      },
    ]);
    void this.enrichSelectedContacts(type);
  }

  async enrichSelectedContacts(type: AssociationProExternalContactType) {
    const selected = this.selectedContactsForEnrichment();
    if (selected.length === 0) {
      return;
    }
    const ctxMessage = "Enrichissement de contacts";
    const groupedContacts = this.groupSelectedContactsByLegalEntity(selected);
    const entries = Array.from(groupedContacts.entries());
    this.selectedContactsForEnrichment.set([]);

    try {
      if (entries.length === 0) {
        this.toastService.openError(
          ctxMessage,
          "Aucune entreprise valide n'a été trouvée pour l'enrichissement.",
        );
        return;
      }

      await Promise.allSettled(
        entries.map(([legalEntityUuid, entry]) =>
          this.runEnrichmentForGroup(
            legalEntityUuid,
            entry.contacts,
            type,
            ctxMessage,
            entry.name,
          ),
        ),
      );
    } catch (error) {
      console.error("Error during contact enrichment:", error);
      this.toastService.openError(
        ctxMessage,
        "Une erreur est survenue lors de l'enrichissement. Merci de réessayer plus tard.",
      );
    } finally {
      this.proService.refresh();
    }
  }

  /**
   * Surveille l'état d'un enrichissement FullEnrich jusqu'à sa complétion.
   *
   * @param fullEnrichEnrichmentId - Identifiant de l'enrichissement à surveiller
   * @param legalEntityUuid - UUID de l'entité juridique associée
   * @param maxAttempts - Nombre maximum de tentatives de polling (défaut: 100)
   * @param delay - Délai en millisecondes entre chaque tentative (défaut: 10 000)
   *
   * @returns Un objet contenant le statut final ("done", "timeout", ou null en cas d'erreur)
   *
   * @remarks
   * - Temps d'attente maximum : environ 16 minutes 40 secondes (100 tentatives × 10s)
   * - Le signal `activeEnrichments` est mis à jour pour refléter l'état courant
   * - Les enrichissements simulés (FAKE_ENRICH) utilisent un délai de 3 secondes
   */
  async waitUntilEnrichmentisDone(
    fullEnrichEnrichmentId: FullEnrichEnrichmentId,
    legalEntityUuid: LegalEntityUuid,
    contacts: {
      uuid: ExternalContactUuid;
      type: AssociationProExternalContactType;
    }[],
    maxAttempts = 100,
    delay = 10_000,
  ) {
    const ctxMessage = "Enrichissement de contacts";
    try {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const res =
          await trpcClient.legalEntities.getFullEnrichEnrichmentStatusAndContacts.query(
            fullEnrichEnrichmentId,
          );

        if (!res) {
          console.error("FullEnrichService: No response received.");
          this.toastService.openError(
            ctxMessage,
            "Une erreur est survenue lors de l'enrichissement. Merci de réessayer plus tard.",
          );
          this.updateActiveEnrichment(fullEnrichEnrichmentId, {
            status: "timeout",
          });
          return { status: null };
        }

        const status = res.status;
        // If its a fake enrichment, we simulate the loading
        if (status === FullEnrichEnrichmentStatus.FAKE_ENRICH) {
          const fake_delay =
            environment.slug === "development"
              ? DEV_SIMULATION_DELAY
              : SIMULATION_DELAY;
          await sleep(fake_delay);
          const result = this.buildEnrichmentResult(
            contacts,
            res.contacts ?? [],
          );
          this.updateActiveEnrichment(fullEnrichEnrichmentId, {
            legalEntityUuid,
            status: "done",
            contacts,
            result,
            // startTime: null,
          });
          this.lastCompletedEnrichmentId.set(fullEnrichEnrichmentId);
          return { status: "done" };
        }

        const messages = {
          CANCELED: "L'enrichissement des contacts a été annulé.",
          CREDITS_INSUFFICIENT:
            "L'enrichissement des informations de certains contacts n'a pas pu être complété par manque de crédits internes. Vous n'êtes pas débités pour les contacts concernés. Merci de réessayer plus tard. Si le problème persiste, contactez le support.",
          RATE_LIMIT:
            "L'enrichissement des contacts n'a pas pu être complété. Merci de réessayer plus tard.",
        };

        if (isEnrichmentDone(status)) {
          if (status in messages) {
            this.toastService.openError(
              ctxMessage,
              messages[status as keyof typeof messages],
            );
          } else if (status !== FullEnrichEnrichmentStatus.FINISHED) {
            console.error(
              "🚩 FullEnrichService: Unhandled enrichment status:",
              status,
            );
            this.toastService.openError(
              ctxMessage,
              "Une erreur inconnue est survenue lors de l'enrichissement. Merci de contacter le support.",
            );
          }
          const result =
            status === FullEnrichEnrichmentStatus.FINISHED
              ? this.buildEnrichmentResult(contacts, res.contacts ?? [])
              : undefined;
          this.updateActiveEnrichment(fullEnrichEnrichmentId, {
            legalEntityUuid,
            status: "done",
            contacts,
            ...(result ? { result } : {}),
            // startTime: null,
          });
          this.lastCompletedEnrichmentId.set(fullEnrichEnrichmentId);
          return { status: "done" };
        }

        await sleep(delay);
      }
    } catch (error) {
      console.error(
        "FullEnrichService: waitUntilEnrichmentisDone failed",
        error,
      );
      throw error;
    }

    this.updateActiveEnrichment(fullEnrichEnrichmentId, {
      legalEntityUuid,
      status: "timeout",
      contacts,
      // startTime: null,
    });
    this.toastService.openError(
      ctxMessage,
      "L'enrichissement n'a pas pu être complété dans le temps imparti. Merci de réessayer plus tard.",
    );
    return { status: "timeout" };
  }

  clearActiveEnrichment(enrichmentId: FullEnrichEnrichmentId) {
    const timer = this.enrichmentFadeOutTimers.get(enrichmentId);
    if (timer) {
      // eslint-disable-next-line @rx-angular/no-zone-critical-browser-apis
      clearTimeout(timer);
      this.enrichmentFadeOutTimers.delete(enrichmentId);
    }
    this.activeEnrichments.update((enrichments) =>
      enrichments.filter(
        (enrichment) => enrichment.enrichmentId !== enrichmentId,
      ),
    );
  }

  private groupSelectedContactsByLegalEntity(
    selected: SelectedContactForEnrichment[],
  ) {
    const grouped = new Map<
      LegalEntityUuid,
      { contacts: SelectedContactForEnrichment[]; name?: string | null }
    >();
    for (const { contact, legalEntityUuid, legalEntityName } of selected) {
      if (!legalEntityUuid) {
        continue;
      }
      if (!grouped.has(legalEntityUuid)) {
        grouped.set(legalEntityUuid, {
          contacts: [],
          name: legalEntityName,
        });
      }
      const entry = grouped.get(legalEntityUuid);
      if (!entry) {
        continue;
      }
      entry.contacts.push({
        contact,
        legalEntityUuid,
        legalEntityName,
      });
      if (!entry.name && legalEntityName) {
        entry.name = legalEntityName;
      }
    }
    return grouped;
  }

  private addActiveEnrichment(enrichment: ActiveEnrichment) {
    this.activeEnrichments.update((enrichments) => [
      ...enrichments,
      enrichment,
    ]);
  }

  private updateActiveEnrichment(
    enrichmentId: FullEnrichEnrichmentId,
    updates: Partial<ActiveEnrichment>,
  ) {
    this.activeEnrichments.update((enrichments) =>
      enrichments.map((enrichment) =>
        enrichment.enrichmentId === enrichmentId
          ? { ...enrichment, ...updates }
          : enrichment,
      ),
    );
    if (updates.status === "done") {
      this.scheduleFadeOut(enrichmentId);
    }
  }

  private scheduleFadeOut(enrichmentId: FullEnrichEnrichmentId) {
    if (this.enrichmentFadeOutTimers.has(enrichmentId)) {
      return;
    }
    // If display or fade out times changes here, update in prospect.layout.ts too
    const displayTimeMs = 5000;
    const fadeOutTimeMs = 400;
    const totalTimeMs = displayTimeMs + fadeOutTimeMs;
    // eslint-disable-next-line @rx-angular/no-zone-critical-browser-apis
    const timer = setTimeout(() => {
      this.enrichmentFadeOutTimers.delete(enrichmentId);
      this.clearActiveEnrichment(enrichmentId);
    }, totalTimeMs);
    this.enrichmentFadeOutTimers.set(enrichmentId, timer);
  }

  private buildEnrichmentResult(
    requestedContacts: {
      uuid: ExternalContactUuid;
      type: AssociationProExternalContactType;
    }[],
    enrichedContacts: ExternalContact[],
  ): ActiveEnrichmentResult {
    const byUuid = new Map(
      enrichedContacts.map((contact) => [contact.uuid, contact]),
    );
    let emailCount = 0;
    let phoneCount = 0;

    for (const requested of requestedContacts) {
      const contact = byUuid.get(requested.uuid);
      if (!contact) {
        continue;
      }
      const hasEmail = (contact.email ?? "").trim().length > 0;
      const hasPhone = (contact.phone ?? "").trim().length > 0;
      const supportsEmail =
        requested.type === AssociationProExternalContactType.MAIL ||
        requested.type === AssociationProExternalContactType.BOTH;
      const supportsPhone =
        requested.type === AssociationProExternalContactType.PHONE ||
        requested.type === AssociationProExternalContactType.BOTH;

      if (supportsEmail && hasEmail) {
        emailCount += 1;
      }
      if (supportsPhone && hasPhone) {
        phoneCount += 1;
      }
    }

    return { emailCount, phoneCount };
  }

  private async runEnrichmentForGroup(
    legalEntityUuid: LegalEntityUuid,
    contacts: SelectedContactForEnrichment[],
    type: AssociationProExternalContactType,
    ctxMessage: string,
    legalEntityName?: string | null,
  ) {
    let fullEnrichEnrichmentId: FullEnrichEnrichmentId | null = null;
    try {
      const contactUuids = contacts.map((item) => item.contact.uuid);
      fullEnrichEnrichmentId =
        await trpcClient.legalEntities.startFullEnrichEnrichment.mutate({
          legalEntityUuid,
          contacts: contactUuids,
          type,
        });

      const contactsEnriching = contactUuids.map((uuid) => ({ uuid, type }));

      if (!this.showAllEnrichments()) {
        this.showAllEnrichments.set(true);
      }

      this.addActiveEnrichment({
        enrichmentId: fullEnrichEnrichmentId,
        legalEntityUuid,
        legalEntityName,
        status: "in-progress",
        contacts: contactsEnriching,
      });

      const result = await this.waitUntilEnrichmentisDone(
        fullEnrichEnrichmentId,
        legalEntityUuid,
        contactsEnriching,
      );

      if (result.status === "done") {
        this.trackContactEnrichmentCredits(
          legalEntityUuid,
          legalEntityName,
          contacts,
          type,
        );
      }
    } catch (error) {
      console.error("Error during contact enrichment:", error);
      if (fullEnrichEnrichmentId) {
        this.updateActiveEnrichment(fullEnrichEnrichmentId, {
          status: "timeout",
        });
      }
      this.toastService.openError(
        ctxMessage,
        "Une erreur est survenue lors de l'enrichissement. Merci de réessayer plus tard.",
      );
    }
  }

  private trackContactEnrichmentCredits(
    legalEntityUuid: LegalEntityUuid,
    legalEntityName: string | null | undefined,
    contacts: SelectedContactForEnrichment[],
    type: AssociationProExternalContactType,
  ) {
    try {
      const { emailCredits, phoneCredits } = this.getEnrichmentCreditsByChannel(
        contacts,
        type,
      );
      const entityName = this.buildContactEnrichmentEntityName(
        legalEntityName,
        contacts,
      );

      if (emailCredits > 0 && phoneCredits > 0) {
        this.trackingService.trackPro("pro_credits_consumed", {
          credits_used: emailCredits + phoneCredits,
          type: "contact",
          enrichment_channel: "all",
          source_page: "contact",
          entity_id: legalEntityUuid,
          ...(entityName ? { entity_name: entityName } : {}),
          action: "Enrichissement contact (email + téléphone)",
        });
        return;
      }

      if (emailCredits > 0) {
        this.trackingService.trackPro("pro_credits_consumed", {
          credits_used: emailCredits,
          type: "contact",
          enrichment_channel: "email",
          source_page: "contact",
          entity_id: legalEntityUuid,
          ...(entityName ? { entity_name: entityName } : {}),
          action: "Enrichissement contact (email)",
        });
      }

      if (phoneCredits > 0) {
        this.trackingService.trackPro("pro_credits_consumed", {
          credits_used: phoneCredits,
          type: "contact",
          enrichment_channel: "telephone",
          source_page: "contact",
          entity_id: legalEntityUuid,
          ...(entityName ? { entity_name: entityName } : {}),
          action: "Enrichissement contact (téléphone)",
        });
      }
    } catch (error) {
      console.error("Error tracking contact enrichment credits:", error);
    }
  }

  private getEnrichmentCreditsByChannel(
    contacts: SelectedContactForEnrichment[],
    type: AssociationProExternalContactType,
  ) {
    const supportsEmail =
      type === AssociationProExternalContactType.MAIL ||
      type === AssociationProExternalContactType.BOTH;
    const supportsPhone =
      type === AssociationProExternalContactType.PHONE ||
      type === AssociationProExternalContactType.BOTH;

    let emailCount = 0;
    let phoneCount = 0;

    for (const { contact } of contacts) {
      if (supportsEmail && contact.emailUnlocked !== true) {
        emailCount += 1;
      }
      if (supportsPhone && contact.phoneUnlocked !== true) {
        phoneCount += 1;
      }
    }

    return {
      emailCredits: emailCount * MAIL_CONTACT_ENRICHMENT_COST,
      phoneCredits: phoneCount * PHONE_CONTACT_ENRICHMENT_COST,
    };
  }

  private buildContactEnrichmentEntityName(
    legalEntityName: string | null | undefined,
    contacts: SelectedContactForEnrichment[],
  ): string | null {
    const contactNames = contacts
      .map(({ contact }) => this.formatContactName(contact))
      .filter((name): name is string => Boolean(name));
    const uniqueContactNames = Array.from(new Set(contactNames));
    const contactLabel = uniqueContactNames.join(", ");

    if (legalEntityName && contactLabel) {
      return `${legalEntityName} - ${contactLabel}`;
    }
    return legalEntityName ?? contactLabel ?? null;
  }

  private formatContactName(contact: ExternalContact): string | null {
    const parts = [contact.firstName, contact.lastName].filter(Boolean);
    if (parts.length === 0) {
      return null;
    }
    return parts.join(" ");
  }
}

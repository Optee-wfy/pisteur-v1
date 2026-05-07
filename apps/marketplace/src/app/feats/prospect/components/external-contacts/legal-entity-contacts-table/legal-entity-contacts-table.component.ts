import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  resource,
  signal,
  untracked,
} from "@angular/core";
import type {
  ExternalContactSearchFilters,
  FullEnrichEnrichmentId,
} from "@optee/constants";
import {
  AssociationProExternalContactType,
  CONTACT_DISCOVERY_COST,
  EXTERNAL_SENIORITY_TO_CONTACT_LEVEL,
  ExternalContactSource,
  fullEnrichFeatureEnabled,
  HUNTER_DEPARTMENTS_SORTED,
  MAIL_CONTACT_ENRICHMENT_COST,
  PHONE_CONTACT_ENRICHMENT_COST,
  WORK_DOMAIN_LABELS,
} from "@optee/constants";
import {
  IconLockComponent,
  IconMailComponent,
  IconPhoneComponent,
  IconSendComponent,
  IconSpinnerComponent,
} from "@optee/icons";
import type { ExternalContact, LegalEntityUuid } from "@optee/models";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { formatPhoneNumber, isNotNullish } from "@optee/utils";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import trpcClient from "../../../../../../trpc-client";
import { ContactService } from "../../../../../services/contact.service";
import { FullEnrichService } from "../../../../../services/fullenrich.service";
import { ProService } from "../../../../../services/pro.service";
import { TrackingService } from "../../../../../services/tracking.service";
import { ExternalContactRolePipe } from "../../../pipes/external-contacts/external-contact-role.pipe";
import { ExternalContactSearchParamsService } from "../../../services/external-contact-search-filters.service";
import { EnrichButtonComponent } from "../../enrichment/enrich-button/enrich-button.component";
import { LinkedInLinkButtonComponent } from "../../linkedin-button/linkedin-button.component";
import { ProspectEmailButtonComponent } from "../../prospect-email-button/prospect-email-button.component";
import { ExternalContactConfidenceScoreComponent } from "../external-contact-confidence-score/external-contact-confidence-score.component";
import { ExternalContactSearchComponent } from "../external-contact-search/external-contact-search.component";

type LegalEntityContactRow = {
  contact: Partial<ExternalContact>;
  isBillable: boolean;
  legalEntities: {
    uuid: LegalEntityUuid;
    name: string | null;
    type: string | null;
  }[];
  associationType: AssociationProExternalContactType | null;
  canAddToCRM: boolean;
  newSearched?: boolean;
  isAssociatedWithPro?: boolean;
  unlocked?: boolean;
  phoneUnlocked?: boolean;
  emailUnlocked?: boolean;
};

@Component({
  selector: "mkp-legal-entity-contacts-table",
  host: {
    class: "flex h-full flex-col relative items-start gap-2",
  },
  template: `
    <mkp-external-contact-search
      class="w-full px-4"
      (searched)="search($event)"
      [(filters)]="paramsService.activeFilters"
      [loading]="
        searchableContacts.isLoading() || contactsKnownByPro.isLoading()
      "
    />

    @if (contactsKnownByPro.isLoading() || searchableContacts.isLoading()) {
      <oui-loader label="Recherche de contacts appartenant à l'entreprise..." />
    } @else if (searchableContacts.error() || contactsKnownByPro.error()) {
      <div
        class="flex h-full w-full flex-1 flex-col items-center justify-center gap-2 py-6"
      >
        <p class="font-display text-red-500">
          Une erreur est survenue lors du chargement des personnes. Merci de
          réessayer plus tard.
        </p>
      </div>
    } @else {
      @let noContactsFound = filteredExternalContacts().length === 0;
      @if (noContactsFound) {
        <div
          class="flex h-full w-full flex-col items-center justify-center gap-4 py-6"
        >
          @if (searchableContacts.isLoading()) {
            <oui-loader label="Recherche de nouveaux contacts..." />
          } @else {
            @let hasActiveFilters =
              (!!searchFilters() &&
                (searchFilters()?.domains?.length ?? 0) > 0) ||
              (searchFilters()?.levels?.length ?? 0) > 0 ||
              (searchFilters()?.search?.trim()?.length ?? 0) > 0;
            <oui-message
              class="mx-auto mt-3 w-full max-w-prose"
              summary="Contacts d'entreprise"
              [severity]="hasActiveFilters ? 'info' : 'error'"
            >
              {{
                hasActiveFilters
                  ? "Aucun contact n'a été trouvé avec les critères fournis. Veuillez essayer avec d'autres filtres."
                  : "Aucun contact n'a été trouvé pour cette entreprise."
              }}
            </oui-message>
          }
        </div>
      } @else {
        @let contacts = selectedContacts();
        @if (contacts.length > 0) {
          <header class="flex w-full items-center justify-between px-4">
            <button
              class="prospect-button flex w-full items-center gap-4 px-3 py-4"
              type="button"
              (click)="activateSelectedContacts()"
              [disabled]="contacts.length === 0 || isActivating()"
              [pTooltip]="isActivating() ? 'Activation en cours...' : undefined"
            >
              @if (isActivating()) {
                <icon-spinner class="size-4 animate-spin" />
                Activation...
              } @else {
                <icon-send class="size-4" />
                @if (contacts.length > 0) {
                  Ajouter {{ contacts.length }} personne(s) au CRM
                } @else {
                  Ajouter au CRM
                }
              }
            </button>
          </header>
        }

        <div
          class="relative flex h-full w-full flex-1 flex-col overflow-hidden px-4"
        >
          @if (searchableContacts.isLoading()) {
            <oui-loader
              class="bg-granite-50 border-granite-300 absolute left-1/2 top-4 z-10 !h-fit !w-fit -translate-x-1/2 !flex-row rounded-2xl border !p-4"
              label="Recherche de nouveaux contacts..."
            />
          }

          <ng-template #contactCell let-kind="kind" let-row>
            @if (kind === "email") {
              @if (row.emailUnlocked) {
                <span class="line-clamp-1 flex items-center gap-1">
                  <icon-mail class="text-granite-400 size-3" />
                  @if (row.contact.email) {
                    <span class="font-medium">
                      {{ row.contact.email }}
                    </span>
                  } @else {
                    <span class="text-granite-300 text-sm italic">
                      Non connu
                    </span>
                  }
                </span>
              } @else {
                <mkp-enrich-button
                  type="mail"
                  (clicked)="
                    fullEnrichService.enrichSingleContact({
                      row,
                      type: associationType.MAIL,
                      emailUnlocked: row.emailUnlocked,
                      phoneUnlocked: row.phoneUnlocked,
                      legalEntityUuid: legalEntityUuid(),
                    })
                  "
                  [colored]="false"
                  [compact]="true"
                  [credits]="MAIL_CONTACT_ENRICHMENT_COST"
                  [disabled]="!isFullEnrichFeatureEnabled"
                  [inProgress]="
                    fullEnrichService.isContactEnriching(
                      row.contact.uuid,
                      associationType.MAIL
                    )
                  "
                />
              }
            } @else {
              @if (row.phoneUnlocked) {
                <span class="line-clamp-1 flex items-center gap-1">
                  <icon-phone class="text-granite-400 size-3" />
                  @if (row.contact.phone) {
                    <span class="font-medium">
                      {{ formatPhoneNumber(row.contact.phone) }}
                    </span>
                  } @else {
                    <span class="text-granite-300 text-sm italic">
                      Non connu
                    </span>
                  }
                </span>
              } @else {
                <mkp-enrich-button
                  type="phone"
                  (clicked)="
                    fullEnrichService.enrichSingleContact({
                      row,
                      type: associationType.PHONE,
                      emailUnlocked: row.emailUnlocked,
                      phoneUnlocked: row.phoneUnlocked,
                      legalEntityUuid: legalEntityUuid(),
                    })
                  "
                  [colored]="false"
                  [compact]="true"
                  [credits]="PHONE_CONTACT_ENRICHMENT_COST"
                  [disabled]="!isFullEnrichFeatureEnabled"
                  [inProgress]="
                    fullEnrichService.isContactEnriching(
                      row.contact.uuid,
                      associationType.PHONE
                    )
                  "
                />
              }
            }
          </ng-template>

          <p-table
            class="prospect-table h-full overflow-hidden"
            customSort
            lazy
            scrollable
            scrollHeight="flex"
            sortMode="single"
            styleClass="scrollbar-stable w-full text-xs text-granite-900"
            (selectionChange)="onSelectionChange($event)"
            [selection]="selectedContacts()"
            [style.scrollbar-color]="'#A3C0FF transparent'"
            [value]="filteredExternalContacts()"
          >
            <ng-template #colgroup>
              <col style="width: 2.75rem" />
              <col class="cell-grow" style="width: auto" />
            </ng-template>
            <ng-template #header>
              <tr>
                <th
                  class="!border-0 bg-transparent px-0 pb-3 text-[0.72rem] font-semibold text-slate-500"
                >
                  <p-tableHeaderCheckbox binary intermediate />
                </th>
                <th
                  class="!border-0 bg-transparent px-0 pb-3 text-[0.72rem] font-semibold text-slate-500"
                >
                  Contacts entreprise
                </th>
              </tr>
            </ng-template>
            <ng-template #body let-row>
              <tr class="border-0">
                <td
                  class="!border-0 bg-transparent px-0 pb-3 pt-2 align-middle"
                >
                  @let disableCheckbox = !row.canAddToCRM;
                  @let hasAssociation = row.associationType !== null;
                  @let tooltipCheckbox =
                    disableCheckbox
                      ? hasAssociation
                        ? "Ce contact est déjà ajouté au CRM"
                        : "Vous devez découvrir ce contact avant de pouvoir l'ajouter au CRM"
                      : undefined;
                  <div class="flex justify-center">
                    <p-tableCheckbox
                      [disabled]="disableCheckbox"
                      [pTooltip]="tooltipCheckbox"
                      [value]="row"
                    />
                  </div>
                </td>
                <td
                  class="w-full !border-0 bg-transparent px-0 pb-3 pl-1 pt-2 align-top"
                >
                  @let roleLabel = row.contact.role | ExternalContactRole;
                  @let maxChars = size() === "small" ? 20 : 40;
                  <article
                    class="mb-4 flex w-full flex-col gap-3.5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-colors duration-150 hover:bg-slate-50"
                  >
                    <div
                      class="flex w-full flex-col items-start justify-between gap-3 lg:flex-row lg:items-start"
                    >
                      <div class="flex min-w-0 flex-1 flex-col gap-2">
                        <div class="flex flex-wrap items-center gap-2">
                          <span
                            class="min-w-0 text-[0.95rem] font-bold leading-5 text-slate-900"
                            [pTooltip]="
                              roleLabel.length > maxChars
                                ? roleLabel
                                : undefined
                            "
                          >
                            {{ roleLabel }}
                          </span>

                          @if (row.contact.department) {
                            <span
                              class="max-w-full truncate rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[0.75rem] font-semibold text-slate-700"
                              [pTooltip]="
                                row.contact.department.length > maxChars
                                  ? row.contact.department
                                  : undefined
                              "
                            >
                              {{ row.contact.department }}
                            </span>
                          }
                        </div>

                        <div class="flex items-center gap-2 text-slate-600">
                          <mkp-external-contact-confidence-score
                            class="inline-flex scale-90"
                            [contact]="row.contact"
                            [linkedLegalEntitiesCount]="
                              row.legalEntities?.length ?? 0
                            "
                          />
                          <span class="text-[0.8rem] font-semibold">Score</span>
                        </div>
                      </div>

                      @if (!row.associationType) {
                        <div
                          class="flex w-full shrink-0 justify-start lg:w-auto lg:justify-end"
                        >
                          <button
                            class="inline-flex min-h-9 items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-[0.95rem] font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                            (click)="discoverContact(row)"
                            [disabled]="isDiscoveringContact(row)"
                          >
                            @if (isDiscoveringContact(row)) {
                              <icon-spinner
                                class="size-4 shrink-0 animate-spin"
                              />
                            } @else {
                              <icon-lock class="size-4 shrink-0" />
                            }
                            <span>
                              Débloquer ({{ CONTACT_DISCOVERY_COST }} crédits)
                            </span>
                          </button>
                        </div>
                      }
                    </div>

                    @if (row.associationType) {
                      @let formattedName = formatName(row.contact);
                      <div
                        class="grid w-full gap-4 border-t border-slate-200 pt-3 lg:grid-cols-[minmax(14rem,1.4fr)_minmax(0,33.5rem)] lg:items-start"
                      >
                        <div class="flex min-w-0 flex-col gap-1.5">
                          <span
                            class="text-[0.74rem] font-semibold text-slate-500"
                          >
                            Nom complet
                          </span>
                          <div class="flex min-h-9 items-center gap-2">
                            @if (row.newSearched) {
                              <span
                                class="size-2 rounded-full bg-green-500"
                                pTooltip="Nouveau contact recherché"
                              ></span>
                            }
                            <span
                              class="min-w-0 truncate text-[0.88rem] font-bold text-slate-900"
                              [pTooltip]="
                                formattedName.length > 30
                                  ? formattedName
                                  : undefined
                              "
                            >
                              {{ formattedName }}
                            </span>
                            <mkp-linkedin-button
                              [linkedInUrl]="row.contact.linkedInUrl"
                              [size]="'sm'"
                            />
                          </div>
                        </div>

                        <div
                          class="grid gap-3 sm:grid-cols-3 lg:ml-auto lg:w-[33.5rem] lg:grid-cols-[15rem_12rem_4.5rem] lg:justify-items-start"
                        >
                          <div
                            class="flex min-w-0 flex-col gap-1.5 lg:w-[15rem]"
                          >
                            <span
                              class="text-[0.74rem] font-semibold text-slate-500"
                            >
                              Email
                            </span>
                            <div
                              class="flex min-h-9 w-full items-center overflow-hidden"
                            >
                              <div class="min-w-0 truncate">
                                <ng-container
                                  [ngTemplateOutlet]="contactCell"
                                  [ngTemplateOutletContext]="{
                                    $implicit: row,
                                    kind: 'email',
                                  }"
                                />
                              </div>
                            </div>
                          </div>

                          <div
                            class="flex min-w-0 flex-col gap-1.5 lg:w-[12rem]"
                          >
                            <span
                              class="text-[0.74rem] font-semibold text-slate-500"
                            >
                              Téléphone
                            </span>
                            <div
                              class="flex min-h-9 w-full items-center overflow-hidden"
                            >
                              <div class="min-w-0 truncate">
                                <ng-container
                                  [ngTemplateOutlet]="contactCell"
                                  [ngTemplateOutletContext]="{
                                    $implicit: row,
                                    kind: 'phone',
                                  }"
                                />
                              </div>
                            </div>
                          </div>

                          <div
                            class="flex min-w-0 flex-col gap-1.5 lg:w-[4.5rem] lg:items-center"
                          >
                            <span
                              class="text-[0.74rem] font-semibold text-slate-500"
                            >
                              Action
                            </span>
                            <div
                              class="flex min-h-9 w-full items-center justify-start lg:justify-center"
                            >
                              @let legalEntityId = legalEntityUuid();
                              @if (legalEntityId) {
                                <mkp-prospect-email-button
                                  [contact]="{
                                    email: row.contact.email,
                                    uuid: row.contact.uuid,
                                  }"
                                  [emailUnlocked]="row.emailUnlocked ?? false"
                                  [legalEntityUuid]="legalEntityId"
                                />
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </article>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }
    }
  `,
  imports: [
    TableModule,
    TooltipModule,
    ProspectEmailButtonComponent,
    LinkedInLinkButtonComponent,
    ExternalContactConfidenceScoreComponent,
    ExternalContactRolePipe,
    ExternalContactSearchComponent,
    IconSendComponent,
    IconSpinnerComponent,
    MessageComponent,
    LoaderComponent,
    EnrichButtonComponent,
    NgTemplateOutlet,
    IconPhoneComponent,
    IconMailComponent,
    IconLockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntityContactsTableComponent {
  readonly legalEntityUuid = input<LegalEntityUuid | null>(null);
  readonly membersCountLoaded = output<number>();

  readonly size = input<"small" | "medium" | "large">("large");

  protected readonly proService = inject(ProService);
  protected readonly fullEnrichService = inject(FullEnrichService);
  protected readonly paramsService = inject(ExternalContactSearchParamsService);
  protected readonly trackingService = inject(TrackingService);
  private readonly toastService = inject(ToastService);
  protected readonly contactService = inject(ContactService);

  protected readonly formatPhoneNumber = formatPhoneNumber;
  protected readonly associationType = AssociationProExternalContactType;
  protected readonly isFullEnrichFeatureEnabled =
    fullEnrichFeatureEnabled.isEnabled;

  protected readonly PHONE_CONTACT_ENRICHMENT_COST =
    PHONE_CONTACT_ENRICHMENT_COST;

  protected readonly MAIL_CONTACT_ENRICHMENT_COST =
    MAIL_CONTACT_ENRICHMENT_COST;

  protected readonly CONTACT_DISCOVERY_COST = CONTACT_DISCOVERY_COST;

  protected readonly searchFilters =
    signal<ExternalContactSearchFilters | null>(null);

  protected readonly searchableContacts = resource({
    params: () => this.legalEntityUuid(),
    loader: async ({ params: legalEntityUuid }) => {
      try {
        if (!legalEntityUuid) {
          return [];
        }
        const contacts =
          await trpcClient.legalEntities.getMembers.query(legalEntityUuid);

        this.trackingService.trackPro("pro_credits_consumed", {
          credits_used: contacts.length * CONTACT_DISCOVERY_COST,
          type: "contact",
          source_page: "contact",
          entity_id: legalEntityUuid,
          action: "Recherche contacts entreprise",
        });

        return contacts;

        // const hasFiltersActive = Object.entries(filters).some(
        //   ([key, value]) => {
        //     if (key === "maxResults") {
        //       return false;
        //     }
        //     if (Array.isArray(value)) {
        //       return value.length > 0;
        //     }
        //     return value !== null && value !== undefined;
        //   },
        // );

        // if (contacts.length === 0) {
        //   this.toastService.open(
        //     "info",
        //     "Recherche de contacts d'entreprise",
        //     hasFiltersActive
        //       ? "Aucun contact n'a été trouvé avec les critères fournis. Veuillez essayer avec d'autres filtres."
        //       : "Aucun contact n'a été trouvé pour cette entreprise.",
        //   );
        //   return [];
        // }

        // try {
        // } catch (error) {
        //   console.error("Error tracking pro_credits_consumed:", error);
        // }

        // this.proService.refresh();
        // return contacts;
      } catch (error) {
        this.toastService.openError(
          "Recherche de contacts d'entreprise",
          error,
        );
        return [];
      }
    },
  });

  protected readonly searchedContacts = this.searchableContacts;

  protected readonly contactsKnownByPro = resource({
    params: () => this.legalEntityUuid(),
    loader: async ({ params: legalEntityUuid }) => {
      // fetch contacts already known by the pro for this legal entity
      try {
        if (!legalEntityUuid) {
          return [];
        }
        return trpcClient.externalContacts.getAllByLegalEntity.query(
          legalEntityUuid,
        );
      } catch (error) {
        this.toastService.openError("Chargement des contacts connus", error);
        return [];
      }
    },
  });

  protected readonly externalContacts = signal<LegalEntityContactRow[]>([]);
  private mapSeniorityToContactLevel(seniority: ExternalContact["seniority"]) {
    if (!seniority) {
      return null;
    }

    return (
      EXTERNAL_SENIORITY_TO_CONTACT_LEVEL[
        seniority as keyof typeof EXTERNAL_SENIORITY_TO_CONTACT_LEVEL
      ] ?? null
    );
  }

  protected readonly filteredExternalContacts = computed(() => {
    const filters = this.searchFilters();

    if (
      !filters ||
      (filters.domains.length === 0 &&
        filters.levels.length === 0 &&
        !filters.search?.trim())
    ) {
      return this.externalContacts();
    }
    const searchTerm = (filters.search ?? "").trim().toLowerCase();
    let filtered: LegalEntityContactRow[] = [];
    if (filters.domains && filters.domains.length > 0) {
      filtered = this.externalContacts().filter((contactRow) => {
        return filters.domains.find(
          (domain) =>
            WORK_DOMAIN_LABELS[domain] === contactRow.contact.department,
        );
      });
    }

    if (filters.levels && filters.levels.length > 0) {
      filtered = (
        filtered.length > 0 ? filtered : this.externalContacts()
      ).filter((contactRow) => {
        const contactLevel = this.mapSeniorityToContactLevel(
          contactRow.contact.seniority ?? null,
        );
        return contactLevel ? filters.levels.includes(contactLevel) : false;
      });
    }

    if (searchTerm.length >= 2) {
      const source = filtered.length > 0 ? filtered : this.externalContacts();
      filtered = source.filter((contactRow) => {
        const searchableText = [
          contactRow.contact.firstName,
          contactRow.contact.lastName,
          contactRow.contact.role,
          contactRow.contact.email,
          contactRow.contact.department,
          contactRow.contact.seniority,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchableText.includes(searchTerm);
      });
    }

    return filtered.sort((a, b) => {
      // Sort unlocked contacts first
      if (a.unlocked && !b.unlocked) {
        return -1;
      }
      if (!a.unlocked && b.unlocked) {
        return 1;
      }

      if (a.canAddToCRM && !b.canAddToCRM) {
        return -1;
      }
      if (!a.canAddToCRM && b.canAddToCRM) {
        return 1;
      }

      // sort PAPPERS origin first
      if (
        a.contact.origin === ExternalContactSource.PAPPERS &&
        b.contact.origin !== ExternalContactSource.PAPPERS
      ) {
        return -1;
      }
      if (
        a.contact.origin !== ExternalContactSource.PAPPERS &&
        b.contact.origin === ExternalContactSource.PAPPERS
      ) {
        return 1;
      }

      // then sort SocieteInfo origin
      if (
        a.contact.origin === ExternalContactSource.SOCIETE_INFO &&
        b.contact.origin !== ExternalContactSource.SOCIETE_INFO
      ) {
        return -1;
      }
      if (
        a.contact.origin !== ExternalContactSource.SOCIETE_INFO &&
        b.contact.origin === ExternalContactSource.SOCIETE_INFO
      ) {
        return 1;
      }

      // Then sort contacts with department defined first
      if (a.contact.department && !b.contact.department) {
        return -1;
      }
      if (!a.contact.department && b.contact.department) {
        return 1;
      }

      // Then sort by department, we want the operations first then management, executive, finance, it, legal
      const departmentOrder = HUNTER_DEPARTMENTS_SORTED;
      const aDeptIndex = departmentOrder.indexOf(
        a.contact.department as (typeof HUNTER_DEPARTMENTS_SORTED)[number],
      );
      const bDeptIndex = departmentOrder.indexOf(
        b.contact.department as (typeof HUNTER_DEPARTMENTS_SORTED)[number],
      );

      // Treat unknown departments (-1) as last in the order
      const aDeptOrder =
        aDeptIndex === -1 ? departmentOrder.length : aDeptIndex;
      const bDeptOrder =
        bDeptIndex === -1 ? departmentOrder.length : bDeptIndex;

      if (aDeptOrder !== bDeptOrder) {
        return aDeptOrder - bDeptOrder;
      }
      return 0;
    });
  });

  protected readonly selectedContacts = signal<LegalEntityContactRow[]>([]);
  protected readonly discoveringContacts = signal<Set<string>>(new Set());

  protected readonly lastHandledEnrichmentId =
    signal<FullEnrichEnrichmentId | null>(null);

  private readonly newlyDiscoveredContactUuids = signal<Set<string>>(new Set());

  private readonly newlyDiscoveredContactSocieteInfoIds = signal<Set<string>>(
    new Set(),
  );

  private readonly resetNewlyDiscoveredContactsOnEntityChange = effect(() => {
    this.legalEntityUuid();
    this.newlyDiscoveredContactUuids.set(new Set());
    this.newlyDiscoveredContactSocieteInfoIds.set(new Set());
  });

  private readonly addContactsToTable = effect(() => {
    const searchableContacts = this.searchableContacts.value() ?? [];
    const knownContacts = this.contactsKnownByPro.value() ?? [];

    const contactsToPush = [...knownContacts, ...searchableContacts];

    const excludedRoles = [
      "Administrateur",
      "Commissaire aux comptes",
      "Commissaire aux comptes titulaire",
      "Commissaire aux comptes suppléant",
    ];

    let pappersContactsCount = 0;

    if (contactsToPush.length) {
      this.externalContacts.set(
        contactsToPush
          .filter((row, index, self) => {
            // Remove duplicates based on contact.uuid or SocieteInfoId if uuid is not available (for pappers contacts for example)
            return (
              index ===
              self.findIndex((c) => {
                if ("uuid" in c.contact && "uuid" in row.contact) {
                  const rowUuid = row.contact.uuid;
                  const candidateUuid = c.contact.uuid;
                  const bothUuidsPresent =
                    rowUuid !== null &&
                    rowUuid !== undefined &&
                    candidateUuid !== null &&
                    candidateUuid !== undefined;
                  if (bothUuidsPresent) {
                    return candidateUuid === rowUuid;
                  }
                }

                const rowSocieteInfoId = row.contact.societeInfoId;
                const candidateSocieteInfoId = c.contact.societeInfoId;
                const bothSocieteInfoIdsPresent =
                  rowSocieteInfoId !== null &&
                  rowSocieteInfoId !== undefined &&
                  candidateSocieteInfoId !== null &&
                  candidateSocieteInfoId !== undefined;
                if (bothSocieteInfoIdsPresent) {
                  return candidateSocieteInfoId === rowSocieteInfoId;
                }
                return false;
              })
            );
          })
          .filter((row) => {
            // Filter out contacts with excluded roles
            if (row.contact.role) {
              return !excludedRoles.includes(row.contact.role);
            }
            return true;
          })
          .filter((row) => {
            // Limit the number of pappers contacts to 10
            if (row.contact.origin === ExternalContactSource.PAPPERS) {
              if (pappersContactsCount < 10) {
                pappersContactsCount++;
                return true;
              }
              return false;
            }
            return true;
          })
          .map((row) => {
            const associationType = row.associationType;

            const canAddToCRM =
              associationType === AssociationProExternalContactType.SEARCHED;

            return {
              contact: row.contact,
              legalEntities: row.legalEntities ?? [],
              isBillable: !associationType,
              associationType: associationType,
              // the contact is unlocked if there is an association or if it has been enriched in this session
              isAssociatedWithPro: !!associationType,
              unlocked:
                associationType === AssociationProExternalContactType.BOTH,
              // the phone is unlocked if the association type is PHONE or BOTH
              phoneUnlocked:
                associationType === AssociationProExternalContactType.PHONE ||
                associationType === AssociationProExternalContactType.BOTH,
              emailUnlocked:
                associationType === AssociationProExternalContactType.MAIL ||
                associationType === AssociationProExternalContactType.BOTH,
              canAddToCRM,
              newSearched: this.isNewlyDiscoveredContact(row.contact),
            };
          }),
      );
    }
  });

  private readonly syncMembersCount = effect(() => {
    if (
      this.searchableContacts.isLoading() ||
      this.contactsKnownByPro.isLoading()
    ) {
      return;
    }

    this.membersCountLoaded.emit(this.filteredExternalContacts().length);
  });

  protected search(filters: ExternalContactSearchFilters) {
    const normalizedFilters = this.normalizeSearchFilters(filters);
    const currentFilters = this.searchFilters();
    const hasSameEntries = <T>(
      left: readonly T[] = [],
      right: readonly T[] = [],
    ) =>
      left.length === right.length &&
      left.every((item) => right.includes(item));
    const filtersMatch =
      !!currentFilters &&
      hasSameEntries(currentFilters.domains, normalizedFilters.domains) &&
      hasSameEntries(currentFilters.levels, normalizedFilters.levels) &&
      (currentFilters.search ?? "") === (normalizedFilters.search ?? "");

    if (filtersMatch) {
      if ((normalizedFilters.search ?? "").length > 0) {
        this.searchedContacts.reload();
      }
      return;
    }

    this.searchFilters.set({ ...normalizedFilters });
  }

  private normalizeSearchFilters(
    filters: ExternalContactSearchFilters,
  ): ExternalContactSearchFilters {
    const trimmedSearch = (filters.search ?? "").trim();
    return {
      ...filters,
      search: trimmedSearch.length >= 2 ? trimmedSearch : "",
    };
  }

  protected contactDiscoveryKey(row: LegalEntityContactRow) {
    return row.contact.uuid ?? String(row.contact.societeInfoId ?? "");
  }

  protected isDiscoveringContact(row: LegalEntityContactRow) {
    const key = this.contactDiscoveryKey(row);
    return !!key && this.discoveringContacts().has(key);
  }

  protected async discoverContact(row: LegalEntityContactRow) {
    const legalEntityUuid = this.legalEntityUuid();
    const contactKey = this.contactDiscoveryKey(row);
    if (!legalEntityUuid) {
      this.toastService.open(
        "error",
        "Découverte de contact",
        "Identifiant de l'entité légale manquant. Impossible de découvrir le contact.",
      );
      return;
    }

    if (!contactKey || this.discoveringContacts().has(contactKey)) {
      return;
    }

    this.discoveringContacts.update((current) => {
      const next = new Set(current);
      next.add(contactKey);
      return next;
    });

    try {
      const [enriched] =
        await trpcClient.externalContacts.discoverContacts.mutate({
          legalEntityUuid,
          contacts: [
            {
              uuid: row.contact.uuid ?? null,
              societeInfoId: row.contact.societeInfoId ?? null,
              origin: row.contact.origin ?? null,
            },
          ],
        });

      this.trackingService.trackPro("pro_credits_consumed", {
        credits_used: CONTACT_DISCOVERY_COST,
        type: "contact",
        source_page: "contact",
        entity_id: legalEntityUuid,
        contact_origin: row.contact.origin ?? "unknown",
        action: "Découverte contact entreprise",
      });

      if (enriched) {
        this.markContactAsNewlyDiscovered(row.contact);
        this.contactsKnownByPro.reload();
        this.proService.refresh();
      }
    } catch (error) {
      this.toastService.openError("Découverte de contact", error);
    } finally {
      this.discoveringContacts.update((current) => {
        const next = new Set(current);
        next.delete(contactKey);
        return next;
      });
    }
  }

  private readonly reloadOnEnrichmentDone = effect(() => {
    const lastCompletedEnrichmentId =
      this.fullEnrichService.lastCompletedEnrichmentId();
    if (
      !lastCompletedEnrichmentId ||
      untracked(() => this.lastHandledEnrichmentId()) ===
        lastCompletedEnrichmentId
    ) {
      return;
    }

    this.lastHandledEnrichmentId.set(lastCompletedEnrichmentId);

    untracked(() => this.contactsKnownByPro.reload());
  });

  protected formatName(row: ExternalContact) {
    const name = [row.firstName, row.lastName]
      .filter((part) => !!part)
      .join(" ");
    return name || "NC";
  }

  protected readonly isActivating = signal(false);

  protected async activateSelectedContacts() {
    const legalEntityUuid = this.legalEntityUuid();

    if (this.isActivating() || !legalEntityUuid) {
      return;
    }
    const contacts = this.selectedContacts();
    if (contacts.length === 0) {
      return;
    }
    this.isActivating.set(true);
    try {
      const didActivate = await this.contactService.activateContactsWithPro(
        contacts.map((c) => c.contact.uuid).filter(isNotNullish),
        legalEntityUuid,
      );
      if (didActivate) {
        this.selectedContacts.set([]);
      } else {
        this.toastService.open("error", "Activation", "Échec de l'activation");
      }
    } catch (error) {
      this.toastService.openError("Activation", error);
    } finally {
      this.isActivating.set(false);
    }
  }

  protected onSelectionChange(selection: LegalEntityContactRow[]) {
    this.selectedContacts.set(
      selection.filter((contact) => this.isContactSelectable(contact)),
    );
  }

  private isContactSelectable(contact: LegalEntityContactRow) {
    return contact.canAddToCRM && !contact.unlocked;
  }

  private isNewlyDiscoveredContact(contact: Partial<ExternalContact>) {
    const uuid = contact.uuid;
    if (uuid && this.newlyDiscoveredContactUuids().has(uuid)) {
      return true;
    }

    const societeInfoId = contact.societeInfoId;
    return (
      societeInfoId !== null &&
      societeInfoId !== undefined &&
      this.newlyDiscoveredContactSocieteInfoIds().has(String(societeInfoId))
    );
  }

  private markContactAsNewlyDiscovered(contact: Partial<ExternalContact>) {
    const uuid = contact.uuid;
    if (uuid) {
      this.newlyDiscoveredContactUuids.update((current) => {
        const next = new Set(current);
        next.add(uuid);
        return next;
      });
    }

    const societeInfoId = contact.societeInfoId;
    if (societeInfoId !== null && societeInfoId !== undefined) {
      this.newlyDiscoveredContactSocieteInfoIds.update((current) => {
        const next = new Set(current);
        next.add(String(societeInfoId));
        return next;
      });
    }
  }
}

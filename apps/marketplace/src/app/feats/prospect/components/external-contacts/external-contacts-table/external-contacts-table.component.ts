import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  resource,
  signal,
  untracked,
} from "@angular/core";

import { ActivatedRoute } from "@angular/router";
import {
  AssociationProExternalContactType,
  ExternalContactType,
  type ExternalContactFilters,
  type FullEnrichEnrichmentId,
} from "@optee/constants";
import { IconPeopleDuoComponent } from "@optee/icons";
import type { ExternalContactUuid, LegalEntityUuid } from "@optee/models";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { FileService } from "@optee/ui/services/file.service";
import { ToastService } from "@optee/ui/services/toast.service";
import { formatFullName, formatPhoneNumber } from "@optee/utils";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import trpcClient from "../../../../../../trpc-client";
import { CSVService } from "../../../../../services/csv/csv.service";
import { FullEnrichService } from "../../../../../services/fullenrich.service";
import { ExternalContactRowComponent } from "./external-contact-row/external-contact-row.component";
import {
  emailIsUnlocked,
  isFullyEnriched,
  phoneIsUnlocked,
} from "./external-contact.utils";
import { ExternalContactsActionsComponent } from "./external-contacts-actions/external-contacts-actions.component";
import { ExternalContactsFiltersComponent } from "./external-contacts-filters/external-contacts-filters.component";
import type { ExternalContactRow } from "./external-contacts-table.types";

@Component({
  selector: "mkp-external-contacts-table",
  host: {
    class: "flex h-full min-w-0 flex-col gap-3 overflow-hidden md:px-2",
  },
  styles: `
    :host ::ng-deep .mkp-contacts-table.p-datatable {
      height: 100%;
    }

    :host ::ng-deep .mkp-contacts-table .p-datatable-table-container {
      border-radius: 1rem;
    }

    :host ::ng-deep .mkp-contacts-table .p-datatable-thead > tr > th {
      background: var(--color-granite-50, #f8f8f8);
      color: var(--color-granite-400, #8b90a8);
      padding: 0.625rem 0.75rem;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border-bottom: 1px solid var(--color-granite-100, #eceef4);
    }

    :host ::ng-deep .mkp-contacts-table .p-datatable-tbody > tr > td {
      padding: 0.875rem 0.75rem;
      border-bottom: 1px solid var(--color-granite-100, #eceef4);
      vertical-align: top;
      font-size: 13px;
    }

    :host ::ng-deep .mkp-contacts-table .p-datatable-tbody > tr:hover > td {
      background: var(--color-granite-50, #f8f8f8);
    }

    :host ::ng-deep .mkp-contacts-table .p-paginator {
      border: 0;
      border-top: 1px solid var(--color-granite-100, #eceef4);
      border-radius: 0;
    }
  `,
  template: `
    @if (!hideHeader()) {
      <section class="mx-4 mt-4 flex items-center gap-3 md:mx-6">
        <div
          class="flex size-14 items-center justify-center rounded-[1.35rem] bg-purple-100"
        >
          <icon-people-duo class="size-6 text-purple-600" />
        </div>

        <div class="min-w-0">
          <h1
            class="text-granite-900 text-[1.85rem] font-semibold leading-none"
          >
            Mes Contacts
          </h1>
          <p class="text-granite-400 mt-1 text-sm font-medium">
            {{ totalCount() }} personnes
          </p>
        </div>
      </section>
    }

    @if (!hideFilters()) {
      <div class="mx-4 md:mx-6">
        <mkp-external-contacts-filters
          class="prospect-table"
          [(filters)]="filters"
          [legalEntitiesOptions]="legalEntitiesOptions.value() ?? []"
          [ownerOptions]="ownerOptions.value() ?? []"
          [statusCounts]="statusCounts.value() ?? null"
        />
      </div>
    }

    @if ((externalContacts.value()?.count ?? 0) > 0) {
      <!-- Mode de sélection Enrichissement ou Export -->
      <mkp-external-contacts-actions
        class="mx-4 md:mx-6"
        (exportContacts)="exportContacts()"
        (selectionModeChange)="setSelectionMode($event)"
        [disableExport]="selectedContactsForExport().length === 0"
        [selectionMode]="selectionMode()"
      />
    }

    @if (externalContacts.isLoading()) {
      <oui-loader label="Chargement des personnes..." />
    } @else if (externalContacts.error()) {
      <div
        class="flex h-full w-full flex-1 flex-col items-center justify-center gap-2 py-6"
      >
        <p class="font-display text-red-500">
          Une erreur est survenue lors du chargement des personnes. Merci de
          réessayer plus tard.
        </p>
      </div>
    } @else if ((externalContacts.value()?.count ?? 0) > 0) {
      <div
        class="border-granite-100 mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border bg-white shadow-sm md:mx-6"
      >
        <p-table
          class="mkp-contacts-table h-full overflow-hidden"
          currentPageReportTemplate=""
          customSort
          lazy
          rowHover
          scrollable
          scrollHeight="flex"
          showCurrentPageReport
          sortMode="single"
          styleClass="text-sm text-granite-900 scrollbar-stable"
          (onPage)="onPageChange($event)"
          (onSort)="onSort($event)"
          (selectionChange)="onSelectionChange($event)"
          [first]="page() * pageSize()"
          [paginator]="!hidePaginator()"
          [rows]="pageSize()"
          [rowsPerPageOptions]="[10, 20, 50, 100]"
          [selection]="activeSelection()"
          [sortField]="sortField()"
          [sortOrder]="sortOrder() === 'asc' ? 1 : -1"
          [style.scrollbar-color]="'#A3C0FF transparent'"
          [totalRecords]="totalCount() ?? 0"
          [value]="displayedExternalContacts()"
        >
          <ng-template #colgroup>
            <col style="width: 3rem" />
            <col class="cell-grow" style="min-width: 8rem" />
            <col style="width: 6.5rem" />
            <col style="width: 4rem" />
            <col class="cell-grow" style="min-width: 16rem" />
            <col style="width: 10.5rem" />
            <col style="width: 6rem" />
            <col style="width: 15rem" />
            <col style="width: 10rem" />
            <col style="width: 5rem" />
            <col style="width: 6rem" />
            <col style="width: 3.5rem" />
          </ng-template>

          <ng-template #header>
            <tr>
              <th alignFrozen="left" pFrozenColumn [frozen]="true">
                <p-tableHeaderCheckbox binary intermediate />
              </th>
              <th alignFrozen="left" pFrozenColumn [frozen]="true">Lead</th>
              <th>Statut</th>
              <th>Score</th>
              <th>Fonction</th>
              <th>Entreprise</th>
              <th>LinkedIn</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Source</th>
              <th>Propriétaire</th>
              <th alignFrozen="right" pFrozenColumn [frozen]="true"></th>
            </tr>
          </ng-template>

          <ng-template #body let-row>
            <tr
              mkp-external-contact-row
              (statusUpdated)="onStatusUpdated()"
              [isEnrichmentMode]="isEnrichmentMode()"
              [isLoading]="externalContacts.isLoading()"
              [row]="row"
            ></tr>
          </ng-template>
        </p-table>
      </div>
    } @else {
      <div
        class="mx-4 mb-4 flex h-full w-full flex-1 flex-col items-center justify-center gap-2 py-8 text-center md:mx-6"
      >
        <p class="text-granite-400 font-display max-w-2xl px-6">
          @if (hasSomeFiltersActive()) {
            Aucune personne ne correspond aux filtres appliqués. Merci de les
            ajuster ou de les réinitialiser.
          } @else {
            Ici, vous trouverez la liste des contacts que vous ajoutez à votre
            CRM.
          }
        </p>
      </div>
    }
  `,
  imports: [
    ExternalContactRowComponent,
    ExternalContactsActionsComponent,
    ExternalContactsFiltersComponent,
    LoaderComponent,
    IconPeopleDuoComponent,
    PaginatorModule,
    TableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalContactsTableComponent {
  readonly hideFilters = input(false, { transform: booleanAttribute });
  readonly hideHeader = input(false, { transform: booleanAttribute });
  readonly hidePaginator = input(false, { transform: booleanAttribute });
  readonly filters = model<ExternalContactFilters | null>(null);
  readonly emptyListMessage = input<string | undefined>();

  protected readonly page = signal(0);
  protected readonly pageSize = signal(50);

  protected readonly sortField = signal<string | null>("name");
  protected readonly sortOrder = signal<"asc" | "desc" | null>("asc");
  readonly selectedContactsForEnrichment = signal<ExternalContactRow[]>([]);
  readonly selectedContactsForExport = signal<ExternalContactRow[]>([]);
  protected readonly selectionMode = signal<"enrich" | "export">("enrich");
  protected readonly activeSelection = computed(() =>
    this.isEnrichmentMode()
      ? this.selectedContactsForEnrichment()
      : this.selectedContactsForExport(),
  );

  private readonly toastService = inject(ToastService);
  protected readonly fullEnrichService = inject(FullEnrichService);
  private readonly fileService = inject(FileService);
  private readonly route = inject(ActivatedRoute);
  private readonly csvService = inject(CSVService);

  private readonly hasAppliedQueryFilters = signal(false);

  protected readonly hasSomeFiltersActive = computed(() => {
    const filters = this.filters();
    if (!filters) {
      return false;
    }
    return Object.values(filters).some(
      (value) => value !== null && value !== undefined && value !== "",
    );
  });

  protected readonly totalCount = computed(
    () => this.externalContacts.value()?.count ?? this.previousTotal(),
  );

  protected readonly previousTotal = signal<number | null>(null);
  private readonly enrichedContactsOverrides = signal(
    new Map<ExternalContactUuid, ExternalContactRow>(),
  );

  private readonly lastHandledEnrichmentId =
    signal<FullEnrichEnrichmentId | null>(null);

  private readonly resetPageOnFilterChange = effect(() => {
    const filters = this.filters();
    if (filters && untracked(() => this.page()) !== 0) {
      this.page.set(0);
    }
  });

  protected readonly displayedExternalContacts = computed(() => {
    const items = this.externalContacts.value()?.items ?? [];
    const overrides = this.enrichedContactsOverrides();
    if (!items.length || overrides.size === 0) {
      return items;
    }
    return items.map((row) => overrides.get(row.contact.uuid) ?? row);
  });

  protected readonly externalContacts = resource({
    params: () => {
      const currentFilters = this.filters();

      // Ne pas passer de filtres si aucun filtre n'est défini
      const filters =
        currentFilters && Object.keys(currentFilters).length > 0
          ? currentFilters
          : null;

      return {
        page: this.page(),
        pageSize: this.pageSize(),
        sort:
          this.sortField() && this.sortOrder()
            ? {
                sortBy: this.sortField() as "name",
                sortOrder: this.sortOrder() as "asc" | "desc",
              }
            : undefined,
        filters,
      };
    },
    loader: async ({ params, abortSignal }) => {
      try {
        const response =
          await trpcClient.externalContacts.getAllPaginatedForPro.query(
            {
              page: params.page,
              pageSize: params.pageSize,
              sort: params.sort,
              ...(params.filters ?? {}),
            },
            {
              signal: abortSignal,
            },
          );

        this.previousTotal.set(response.total);

        // We want to return rows with the associations with the pro to know if the mail/phone has been unlocked
        return {
          count: response.total,
          items: response.items,
        };
      } catch (error) {
        this.toastService.openError("Récupération des personnes.", error);
        return { count: 0, items: [] };
      }
    },
  });

  protected readonly ownerOptions = resource({
    loader: async () => {
      try {
        const owners =
          await trpcClient.externalContacts.getOwnersForPro.query();
        return owners.map((owner) => {
          const fullName = formatFullName({
            firstName: owner.firstName,
            lastName: owner.lastName,
          });

          return {
            label: fullName ?? "Utilisateur inconnu",
            value: owner.uuid,
          };
        });
      } catch (error) {
        this.toastService.openError("Récupération des propriétaires.", error);
        return [];
      }
    },
  });

  protected readonly statusCounts = resource({
    params: () => ({
      filters: this.filters(),
    }),
    loader: async ({ params, abortSignal }) => {
      try {
        const input = {
          ...(params.filters ?? {}),
        };
        return await trpcClient.externalContacts.getStatusCountsForPro.query(
          input,
          { signal: abortSignal },
        );
      } catch (error) {
        this.toastService.openError("Récupération des statuts.", error);
        return null;
      }
    },
  });

  protected readonly legalEntitiesOptions = resource({
    loader: async () => {
      try {
        const legalEntities =
          await trpcClient.externalContacts.getLegalEntitiesForPro.query();
        return legalEntities.map((entity) => ({
          label: entity.name?.trim() || "Entreprise inconnue",
          value: entity.uuid,
        }));
      } catch (error) {
        this.toastService.openError("Récupération des entreprises.", error);
        return [];
      }
    },
  });

  private readonly currentQueryKey = computed(() =>
    JSON.stringify({
      page: this.page(),
      pageSize: this.pageSize(),
      sortField: this.sortField(),
      sortOrder: this.sortOrder(),
      filters: this.filters(),
    }),
  );

  private readonly syncFiltersFromQueryParams = effect(() => {
    if (this.hasAppliedQueryFilters()) {
      return;
    }
    const associationTypeParam =
      this.route.snapshot.queryParams["associationType"];
    const legalEntityUuidsParam =
      this.route.snapshot.queryParams["legalEntityUuids"];
    if (!associationTypeParam && !legalEntityUuidsParam) {
      this.hasAppliedQueryFilters.set(true);
      return;
    }
    const associationType = this.parseAssociationTypes(associationTypeParam);
    const legalEntityUuids = this.parseLegalEntityUuids(legalEntityUuidsParam);
    if (!associationType.length && !legalEntityUuids.length) {
      this.hasAppliedQueryFilters.set(true);
      return;
    }
    this.filters.set({
      ...(this.filters() ?? {}),
      associationProExternalContacts: associationType,
      ...(legalEntityUuids.length ? { legalEntityUuids } : {}),
    });
    this.hasAppliedQueryFilters.set(true);
  });

  private readonly clearOverridesOnQueryChange = effect(() => {
    this.currentQueryKey();
    this.enrichedContactsOverrides.set(new Map());
  });

  private readonly syncEnrichedContactsWithExternalContacts = effect(() => {
    const lastCompletedEnrichmentId =
      this.fullEnrichService.lastCompletedEnrichmentId();
    if (!lastCompletedEnrichmentId) {
      return;
    }
    if (this.lastHandledEnrichmentId() === lastCompletedEnrichmentId) {
      return;
    }
    this.lastHandledEnrichmentId.set(lastCompletedEnrichmentId);

    const enrichment = this.fullEnrichService
      .activeEnrichments()
      .find((item) => item.enrichmentId === lastCompletedEnrichmentId);
    if (!enrichment?.contacts?.length) {
      return;
    }

    void this.refreshContactsInPlace(enrichment.contacts);
  });

  private readonly syncSelectedContactsForEnrichment = effect(() => {
    const selectedRows = this.selectedContactsForEnrichment();
    this.fullEnrichService.selectedContactsForEnrichment.set(
      selectedRows.flatMap((row) => {
        const legalEntityUuid = row.legalEntities?.[0]?.uuid ?? null;
        if (!legalEntityUuid) {
          return [];
        }
        return [
          {
            legalEntityUuid,
            legalEntityName: row.legalEntities?.[0]?.name ?? null,
            contact: {
              ...row.contact,
              emailUnlocked: emailIsUnlocked(row),
              phoneUnlocked: phoneIsUnlocked(row),
            },
          },
        ];
      }),
    );
  });

  private readonly clearSelectionWhenEnrichmentResets = effect(() => {
    if (
      this.fullEnrichService.selectedContactsForEnrichment().length === 0 &&
      this.selectedContactsForEnrichment().length > 0
    ) {
      this.selectedContactsForEnrichment.set([]);
    }
  });

  protected onSort(event: { field?: string; order?: 1 | -1 }) {
    this.sortField.set(event.field ?? null);

    let newOrder: "asc" | "desc" | null = null;
    if (event.order === 1) {
      newOrder = "asc";
    } else if (event.order === -1) {
      newOrder = "desc";
    }

    this.sortOrder.set(newOrder);
    this.page.set(0);
  }

  protected onPageChange(event: { first: number; rows: number }) {
    const newPageSize = event.rows ?? this.pageSize();
    if (newPageSize !== this.pageSize()) {
      this.pageSize.set(newPageSize);
    }

    const newPage = Math.floor((event.first ?? 0) / newPageSize);
    if (newPage !== this.page()) {
      this.page.set(newPage);
    }
  }

  protected exportContacts() {
    const contactsToExport = this.selectedContactsForExport().map((row) => ({
      company: row.legalEntities
        ?.map((entity) => entity.name)
        .filter((name): name is string => Boolean(name))
        .join(" / "),
      firstName: row.contact.firstName,
      lastName: row.contact.lastName,
      email: row.contact.email,
      phone: row.contact.phone,
      role: row.contact.role,
      type:
        row.contact.type === ExternalContactType.PERSONAL
          ? "Personnel"
          : row.contact.type === ExternalContactType.GENERIC
            ? "Générique"
            : null,
    }));

    const csvHeaders = [
      "Entreprise",
      "Prénom",
      "Nom",
      "Email",
      "Téléphone",
      "Rôle",
    ];

    const csvRows = contactsToExport.map((contact) => [
      contact.company ?? "",
      contact.firstName ?? "",
      contact.lastName ?? "",
      contact.email ?? "",
      contact.phone ? formatPhoneNumber(contact.phone) : "",
      contact.role ?? "",
      contact.type ?? "",
    ]);

    const csvContent =
      [csvHeaders, ...csvRows]
        .map((e) => e.map((v) => this.csvService.escapeCSVValue(v)).join(","))
        .join("\n") + "\n";

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const fileName = `export_pisteur_carnet_adresse_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    this.fileService.downloadFile(blob, fileName);
    this.selectedContactsForExport.set([]);
  }

  private async refreshContactsInPlace(
    contacts: {
      uuid: ExternalContactUuid;
      type: AssociationProExternalContactType;
    }[],
  ) {
    const currentItems = this.externalContacts.value()?.items ?? [];
    if (!currentItems.length) {
      return;
    }
    const visibleContactUuids = new Set(
      currentItems.map((row) => row.contact.uuid),
    );
    const contactsToRefresh = contacts.filter((contact) =>
      visibleContactUuids.has(contact.uuid),
    );
    if (!contactsToRefresh.length) {
      return;
    }
    try {
      const refreshedRows =
        await trpcClient.externalContacts.getByUuidsForPro.query({
          contactUuids: contactsToRefresh.map((contact) => contact.uuid),
        });
      if (!refreshedRows?.length) {
        return;
      }
      const overrides = new Map(this.enrichedContactsOverrides());
      for (const row of refreshedRows as ExternalContactRow[]) {
        overrides.set(row.contact.uuid, row);
      }
      this.enrichedContactsOverrides.set(overrides);
      //   this.popover?.hide();
    } catch (error) {
      console.error("Failed to refresh enriched contacts:", error);
    }
  }

  protected isEnrichmentMode() {
    return this.selectionMode() === "enrich";
  }

  protected setSelectionMode(mode: "enrich" | "export") {
    if (this.selectionMode() === mode) {
      return;
    }
    this.selectionMode.set(mode);
  }

  protected onSelectionChange(selection: ExternalContactRow[]) {
    const filteredSelection = this.isEnrichmentMode()
      ? selection.filter((row) => !isFullyEnriched(row))
      : selection;
    if (this.isEnrichmentMode()) {
      this.selectedContactsForEnrichment.set(filteredSelection);
    } else {
      this.selectedContactsForExport.set(filteredSelection);
    }
  }

  protected onStatusUpdated() {
    this.externalContacts.reload();
    this.statusCounts.reload();
  }

  private parseAssociationTypes(value: string | string[]) {
    const values = Object.values(AssociationProExternalContactType);
    const list = Array.isArray(value) ? value : [value];
    return list.filter((item) =>
      values.includes(item as AssociationProExternalContactType),
    ) as AssociationProExternalContactType[];
  }

  private parseLegalEntityUuids(value?: string | string[]) {
    if (!value) {
      return [];
    }
    const list = Array.isArray(value) ? value : [value];
    return list.filter(Boolean) as LegalEntityUuid[];
  }
}

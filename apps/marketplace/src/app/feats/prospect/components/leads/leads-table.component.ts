import { DatePipe, DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  model,
  resource,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import type {
  LocationBdnbLegalEntityFilterPro,
  NafCode,
  PaginationState,
} from "@optee/constants";
import {
  BUILDING_USAGE_LABELS,
  defaultPagination,
  getDepartmentByCode,
  getLocationBuildingTypeLabelsFromNafCodes,
} from "@optee/constants";
import {
  IconArrowComponent,
  IconBuildingComponent,
  IconChevronRightComponent,
  IconCompanyComponent,
  IconFiltersComponent,
  IconRegisteredDocumentComponent,
  IconRocketComponent,
  IconSearchComponent,
} from "@optee/icons";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { FormatAddressPipe } from "@optee/ui/pipes/format-address.pipe";
import { RoundedNumberPipe } from "@optee/ui/pipes/rounded-number.pipe";
import { ToastService } from "@optee/ui/services/toast.service";
import { PaginatorModule, type PaginatorState } from "primeng/paginator";
import trpcClient from "../../../../../trpc-client";
import { PlacesNavigationService } from "../../services/places-navigation.service";
import { PlacesFiltersComponent } from "../places/places-filters/places-filters.component";
import { SolicitationIndicatorComponent } from "../solicitation-indicator/solicitation-indicator.component";

@Component({
  selector: "mkp-leads-table",
  host: {
    class: "flex h-full min-w-0 flex-col gap-3 overflow-hidden md:px-4",
  },
  styles: `
    .mkp-table-head-cell {
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--color-granite-50, #f8f8f8);
    }

    .mkp-clamp-2 {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
  `,
  template: `
    <section class="mx-4 mt-4 flex items-center gap-3">
      <div
        class="flex size-14 items-center justify-center rounded-[1.35rem] bg-blue-100"
      >
        <icon-rocket class="size-6 text-blue-600" />
      </div>

      <div class="min-w-0">
        <h1 class="text-granite-900 text-[1.85rem] font-semibold leading-none">
          Mes Leads
        </h1>
      </div>
    </section>

    <section class="mx-4 mt-2 grid gap-4 md:grid-cols-3">
      <article
        class="border-granite-100 flex items-center gap-3 rounded-[20px] border bg-white px-5 py-4 shadow-sm"
      >
        <div
          class="flex size-12 shrink-0 items-center justify-center rounded-[1.15rem] bg-blue-100 text-blue-600"
        >
          <icon-registered-document class="size-6" />
        </div>
        <div>
          <p class="text-granite-500 text-sm font-medium">Total Leads</p>
          <p
            class="text-granite-900 mt-0.5 text-[2rem] font-semibold leading-none"
          >
            {{ totalCount() }}
          </p>
        </div>
      </article>

      <article
        class="border-granite-100 flex items-center gap-3 rounded-[20px] border bg-white px-5 py-4 shadow-sm"
      >
        <div
          class="flex size-12 shrink-0 items-center justify-center rounded-[1.15rem] bg-green-100 text-green-600"
        >
          <icon-arrow class="size-6 -rotate-45" />
        </div>
        <div>
          <p class="text-granite-500 text-sm font-medium">Cette semaine</p>
          <p
            class="mt-0.5 text-[2rem] font-semibold leading-none text-green-600"
          >
            {{ weeklyNewLeadsLabel() }}
          </p>
        </div>
      </article>

      <article
        class="border-granite-100 flex items-center gap-3 rounded-[20px] border bg-white px-5 py-4 shadow-sm"
      >
        <div
          class="flex size-12 shrink-0 items-center justify-center rounded-[1.15rem] bg-purple-100 text-purple-600"
        >
          <icon-company class="size-6" />
        </div>
        <div>
          <p class="text-granite-500 text-sm font-medium">Entreprises</p>
          <p
            class="text-granite-900 mt-0.5 text-[2rem] font-semibold leading-none"
          >
            {{ totalLinkedCompanies() }}
          </p>
        </div>
      </article>
    </section>

    <section
      class="border-granite-100 mx-4 mt-1 flex items-center gap-2 rounded-[14px] border bg-white px-3 py-2 shadow-sm"
    >
      <label
        class="bg-granite-50 flex min-w-0 flex-[0_1_52rem] items-center gap-2 rounded-[12px] px-3 py-1"
      >
        <icon-search class="text-granite-400 size-4 shrink-0" />
        <input
          class="placeholder:text-granite-400 min-w-0 flex-1 bg-transparent py-1 text-[13px] font-medium outline-none"
          placeholder="Rechercher par bâtiment, entreprise ou adresse..."
          (input)="onSearchInput($any($event.target).value)"
          [value]="filters()?.address ?? ''"
        />
      </label>

      <div class="border-granite-100 h-7 w-px shrink-0 border-l"></div>

      <div class="flex items-center gap-1.5">
        <span
          class="text-granite-400 flex size-7 items-center justify-center rounded-lg"
        >
          <icon-filters class="size-3" />
        </span>

        @for (option of statusOptions; track option.value) {
          <button
            class="inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-[13px] font-semibold transition-all"
            (click)="onStatusFilterChange(option.value)"
            [class.bg-blue-50]="
              activeStatusFilter() === option.value && option.value !== 'archived'
            "
            [class.bg-slate-600]="
              activeStatusFilter() === option.value && option.value === 'archived'
            "
            [class.bg-white]="activeStatusFilter() !== option.value"
            [class.border-blue-200]="
              activeStatusFilter() === option.value && option.value !== 'archived'
            "
            [class.border-granite-200]="activeStatusFilter() !== option.value"
            [class.border-slate-600]="
              activeStatusFilter() === option.value && option.value === 'archived'
            "
            [class.text-blue-700]="
              activeStatusFilter() === option.value && option.value !== 'archived'
            "
            [class.text-granite-900]="activeStatusFilter() !== option.value"
            [class.text-white]="
              activeStatusFilter() === option.value && option.value === 'archived'
            "
          >
            <span
              class="size-2 rounded-full"
              [class.bg-blue-500]="option.value === 'new'"
              [class.bg-blue-600]="
                option.value === 'all' && activeStatusFilter() === option.value
              "
              [class.bg-granite-300]="
                option.value === 'all' && activeStatusFilter() !== option.value
              "
              [class.bg-slate-400]="option.value === 'archived'"
            ></span>
            <span>{{ option.label }}</span>
          </button>
        }
      </div>
    </section>

    <mkp-places-filters
      variant="leads"
      [(filters)]="filters"
      [showActeurBatimentFilter]="false"
      [showSearchAddressFilter]="false"
      [showSecteurActiviteFilter]="false"
    />

    @if (locations.isLoading()) {
      <oui-loader label="Chargement des leads..." />
    } @else if (locations.error()) {
      <div
        class="flex h-full w-full flex-1 flex-col items-center justify-center gap-2 py-6"
      >
        <p class="font-display text-red-500">
          Une erreur est survenue lors du chargement. Merci de réessayer.
        </p>
      </div>
    } @else if (totalCount() === 0 || displayedLocations().length === 0) {
      <div
        class="flex h-full w-full flex-1 flex-col items-center justify-center gap-2 py-6"
      >
        <p class="text-granite-400 font-display">
          {{ emptyMessage() }}
        </p>
      </div>
    } @else {
      <div
        class="border-granite-100 mx-4 mb-4 mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border bg-white shadow-sm"
      >
        <div class="flex-1 overflow-auto rounded-[16px]">
          <table class="table-fixed border-collapse" style="min-width: 103rem;">
            <colgroup>
              <col style="width: 21rem" />
              <col style="width: 6rem" />
              <col style="width: 10rem" />
              <col style="width: 12rem" />
              <col style="width: 9rem" />
              <col style="width: 4.5rem" />
              <col style="width: 5.5rem" />
              <col style="width: 4.5rem" />
              <col style="width: 5rem" />
              <col style="width: 9rem" />
              <col style="width: 8rem" />
              <col style="width: 9rem" />
              <col style="width: 9.5rem" />
            </colgroup>
            <thead>
              <tr class="border-granite-100 bg-granite-50 border-b">
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide"
                >
                  Adresse
                </th>
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide"
                >
                  Concurrence
                </th>
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide"
                >
                  Département
                </th>
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide"
                >
                  Type d'entreprise
                </th>
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide"
                >
                  Statut
                </th>
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-center text-[11px] font-medium uppercase tracking-wide"
                >
                  DPE
                </th>
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide"
                >
                  Surface chauffée
                </th>
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide"
                >
                  Lots
                </th>
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide"
                >
                  Année
                </th>
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide"
                >
                  Conso. énergétique
                </th>
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide"
                >
                  Chauffage
                </th>
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide"
                >
                  Entreprises
                </th>
                <th
                  class="mkp-table-head-cell text-granite-400 px-3 py-2.5 text-center text-[11px] font-medium uppercase tracking-wide"
                  style="right: 0; z-index: 40;"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              @for (row of displayedLocations(); track row.location.uuid) {
                @let address = row.location | formatAddress;
                @let buildingType =
                  getBuildingUsageLabel(row.location.buildingUsage);
                @let companyTypes = getLocationBuildingTypes(row.legalEntities);
                @let department = getDepartmentCode(row.location.zipcode);
                @let firstCompany = row.legalEntities[0] ?? null;
                @let firstCompanyName = getLegalEntityName(firstCompany);
                @let remainingCompanies = row.legalEntities.length - 1;
                <tr
                  class="hover:bg-granite-50 border-granite-100 border-b transition-colors"
                >
                  <!-- ADRESSE -->
                  <td class="px-3 py-3.5 align-top">
                    <a
                      class="text-granite-900 inline-flex items-start gap-2 text-[13px] font-medium leading-5 hover:underline"
                      (click)="prepareLeadNavigation()"
                      [routerLink]="[
                        '/pro/pisteur/leads/details',
                        row.location.uuid,
                      ]"
                    >
                      <icon-building
                        class="text-granite-400 mt-0.5 size-4 shrink-0"
                      />
                      <span>{{ address }}</span>
                    </a>
                  </td>

                  <td class="px-3 py-3.5 align-top">
                    <mkp-solicitation-indicator
                      entityType="building"
                      [count]="row.location.nbRelatedPros"
                    />
                  </td>

                  <td class="px-3 py-3.5 align-top">
                    @if (department) {
                      <span class="text-[13px] font-medium">
                        {{ department }}
                      </span>
                    } @else {
                      <span class="text-granite-300 text-[13px] italic">
                        Non connu
                      </span>
                    }
                  </td>

                  <td class="px-3 py-3.5 align-top">
                    @if (companyTypes.length > 0) {
                      <span class="mkp-clamp-2 block text-[13px] leading-5">
                        {{ companyTypes.slice(0, 2).join(" | ") }}
                        @if (companyTypes.length >= 2) {
                          ...
                        }
                      </span>
                    } @else {
                      <span class="text-granite-300 text-[13px] italic">
                        Non connu
                      </span>
                    }
                  </td>

                  <td class="px-3 py-3.5 align-top">
                    <span
                      class="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[13px] font-semibold"
                      [class.bg-blue-50]="row.leadStatus === 'new'"
                      [class.bg-slate-50]="row.leadStatus === 'archived'"
                      [class.border-blue-200]="row.leadStatus === 'new'"
                      [class.border-slate-200]="row.leadStatus === 'archived'"
                      [class.text-blue-600]="row.leadStatus === 'new'"
                      [class.text-slate-600]="row.leadStatus === 'archived'"
                    >
                      <span
                        class="size-2 rounded-full"
                        [class.bg-blue-500]="row.leadStatus === 'new'"
                        [class.bg-slate-400]="row.leadStatus === 'archived'"
                      ></span>
                      <span>
                        {{ row.leadStatus === "new" ? "Nouveau" : "Archivé" }}
                      </span>
                      <icon-chevron-right class="size-3 rotate-90" />
                    </span>
                  </td>

                  <td class="px-3 py-3.5 text-center align-top">
                    <oui-dpe-label
                      class="mx-auto"
                      size="sm"
                      [letter]="row.location.dpeLabel ?? 'NC'"
                    />
                  </td>

                  <td
                    class="whitespace-nowrap px-3 py-3.5 align-top text-[13px]"
                  >
                    @if (
                      row.location.surfaceThatRequiresHeating !== null &&
                      row.location.surfaceThatRequiresHeating !== undefined
                    ) {
                      {{
                        row.location.surfaceThatRequiresHeating
                          | number: "1.0-0"
                      }}
                      m²
                    } @else {
                      <span class="text-granite-300 text-[13px] italic">
                        --
                      </span>
                    }
                  </td>

                  <td
                    class="whitespace-nowrap px-3 py-3.5 align-top text-[13px]"
                  >
                    @if (
                      row.location.nbUnits !== null &&
                      row.location.nbUnits !== undefined
                    ) {
                      <span class="font-medium">
                        {{
                          (row.location.nbUnits | roundedNumber) +
                            " lot" +
                            (row.location.nbUnits > 1 ? "s" : "")
                        }}
                      </span>
                    } @else {
                      <span class="text-granite-300 text-[13px] italic">
                        --
                      </span>
                    }
                  </td>

                  <td class="px-3 py-3.5 align-top text-[13px]">
                    @if (row.location.creationDate) {
                      {{ row.location.creationDate | date: "yyyy" }}
                    } @else {
                      <span class="text-granite-300 text-[13px] italic">
                        --
                      </span>
                    }
                  </td>

                  <td class="px-3 py-3.5 align-top text-[13px]">
                    @if (
                      row.location.annualElectricityConsumption !== null &&
                      row.location.annualElectricityConsumption !== undefined
                    ) {
                      {{
                        row.location.annualElectricityConsumption / 1000
                          | number: "1.0-0"
                      }}
                      MWh/an
                    } @else {
                      <span class="text-granite-300 text-[13px] italic">
                        Non connu
                      </span>
                    }
                  </td>

                  <td class="px-3 py-3.5 align-top text-[13px]">
                    @if (row.location.heatingSystem) {
                      {{ row.location.heatingSystem }}
                    } @else {
                      <span class="text-granite-300 text-[13px] italic">
                        Non connu
                      </span>
                    }
                  </td>

                  <td class="px-3 py-3.5 align-top">
                    @if (firstCompanyName) {
                      <div class="flex min-w-0 items-start gap-1.5">
                        <icon-company
                          class="text-granite-400 mt-0.5 size-3.5 shrink-0"
                        />
                        <span class="mkp-clamp-2 block text-[13px] leading-5">
                          {{ firstCompanyName }}
                        </span>
                      </div>
                      @if (remainingCompanies > 0) {
                        <span
                          class="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600"
                        >
                          +{{ remainingCompanies }}
                        </span>
                      }
                    } @else {
                      <span class="text-granite-300 text-[13px] italic">
                        Non connu
                      </span>
                    }
                  </td>

                  <td
                    class="sticky right-0 z-[5] bg-white px-3 py-3.5 text-center align-top"
                  >
                    <a
                      class="hover:bg-granite-700 bg-granite-900 inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium text-white transition-colors"
                      (click)="prepareLeadNavigation()"
                      [routerLink]="[
                        '/pro/pisteur/leads/details',
                        row.location.uuid,
                      ]"
                    >
                      Voir le CRM
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- PAGINATION -->
        <div class="border-granite-100 border-t">
          <p-paginator
            (onPageChange)="onPageChange($event)"
            [first]="page() * pageSize()"
            [rows]="pageSize()"
            [rowsPerPageOptions]="[10, 20, 50]"
            [totalRecords]="totalCount()"
          />
        </div>
      </div>
    }
  `,
  imports: [
    DatePipe,
    DecimalPipe,
    DpeLabelComponent,
    FormatAddressPipe,
    IconArrowComponent,
    IconBuildingComponent,
    IconChevronRightComponent,
    IconCompanyComponent,
    IconFiltersComponent,
    IconRegisteredDocumentComponent,
    IconRocketComponent,
    IconSearchComponent,
    LoaderComponent,
    PaginatorModule,
    PlacesFiltersComponent,
    RoundedNumberPipe,
    RouterLink,
    SolicitationIndicatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadsTableComponent {
  readonly emptyMessage = model(
    "Ici, vous trouverez l'historique des leads qui vont être envoyés par mail chaque jour.",
  );

  readonly filters = model<LocationBdnbLegalEntityFilterPro | null>(null);
  readonly pagination = model<PaginationState>({ ...defaultPagination });

  private readonly toastService = inject(ToastService);
  private readonly navigationService = inject(PlacesNavigationService);

  protected readonly page = computed(() => this.pagination().page);
  protected readonly pageSize = computed(() => this.pagination().pageSize);
  protected readonly statusOptions = [
    { value: "all" as const, label: "Tous" },
    { value: "new" as const, label: "Nouveaux" },
    { value: "archived" as const, label: "Archivés" },
  ];
  protected readonly activeStatusFilter = computed(
    () => this.filters()?.leadStatus ?? "all",
  );

  protected readonly normalizedFilters = computed(() => {
    const currentFilters = this.filters();

    return currentFilters && Object.keys(currentFilters).length > 0
      ? (() => {
          const { address, show, sort, legalEntityUuid, ...rest } =
            currentFilters;
          const normalizedAddress =
            address && address.trim().length >= 2 ? address.trim() : null;
          return {
            ...rest,
            ...(normalizedAddress ? { address: normalizedAddress } : {}),
          };
        })()
      : null;
  });

  protected readonly previousTotal = signal<number | null>(null);
  private previousFilters: LocationBdnbLegalEntityFilterPro | null | undefined;

  private readonly resetPageOnFiltersChange = effect(() => {
    const currentFilters = this.filters();

    if (this.previousFilters === undefined) {
      this.previousFilters = currentFilters;
      return;
    }

    const hasChanged =
      JSON.stringify(currentFilters) !== JSON.stringify(this.previousFilters);

    if (hasChanged) {
      this.pagination.update((state) => ({
        ...state,
        page: 0,
      }));
    }

    this.previousFilters = currentFilters;
  });

  protected readonly locations = resource({
    params: () => ({
      page: this.page(),
      pageSize: this.pageSize(),
      filters: this.normalizedFilters(),
    }),
    loader: async ({ params, abortSignal }) => {
      try {
        const response =
          await trpcClient.locationsBdnb.getLeadHistoryPaginatedForPro.query(
            {
              ...(params.filters ?? {}),
              page: params.page,
              pageSize: params.pageSize,
              show: "all",
            },
            { signal: abortSignal },
          );
        this.previousTotal.set(response.total);
        return {
          count: response.total,
          weeklyNewCount: response.weeklyNewCount,
          totalCompanies: response.totalCompanies,
          locations: response.items.map((row) => ({
            location: row.location,
            legalEntities: row.legalEntities ?? [],
            associations: row.associations ?? [],
            leadStatus: row.leadStatus,
          })),
        };
      } catch (error) {
        this.toastService.openError("Récupération des leads.", error);
        return { count: 0, locations: [] };
      }
    },
  });

  protected readonly totalCount = computed(() =>
    Number(this.locations.value()?.count ?? this.previousTotal() ?? 0),
  );

  protected readonly weeklyNewLeadsCount = computed(
    () =>
      this.locations.value()?.weeklyNewCount ??
      this.locations
        .value()
        ?.locations.filter((row) => row.leadStatus === "new").length ??
      0,
  );

  protected readonly weeklyNewLeadsLabel = computed(() => {
    const count = this.weeklyNewLeadsCount();
    return count > 0 ? `+${count}` : "0";
  });

  protected readonly totalLinkedCompanies = computed(
    () =>
      this.locations.value()?.totalCompanies ??
      (this.locations.value()?.locations ?? []).reduce(
        (total, row) => total + row.legalEntities.length,
        0,
      ),
  );

  protected readonly displayedLocations = computed(() => {
    return this.locations.value()?.locations ?? [];
  });

  protected onSearchInput(value: string) {
    const nextAddress = value.trim().length > 0 ? value : null;

    this.filters.update((currentFilters) => {
      if (!nextAddress) {
        if (!currentFilters) {
          return null;
        }

        const { address: _address, ...restFilters } = currentFilters;
        return Object.keys(restFilters).length > 0 ? restFilters : null;
      }

      return {
        ...(currentFilters ?? {}),
        address: nextAddress,
      };
    });
  }

  protected onStatusFilterChange(status: "all" | "new" | "archived") {
    if (this.activeStatusFilter() === status) {
      return;
    }

    this.filters.update((currentFilters) => {
      if (status === "all") {
        if (!currentFilters) {
          return null;
        }

        const { leadStatus: _leadStatus, ...restFilters } = currentFilters;
        return Object.keys(restFilters).length > 0 ? restFilters : null;
      }

      return {
        ...(currentFilters ?? {}),
        leadStatus: status,
      };
    });
  }

  protected onPageChange(event: PaginatorState) {
    const current = this.pagination();
    const newPageSize = event.rows ?? current.pageSize;
    const newPage = Math.floor((event.first ?? 0) / newPageSize);
    if (newPageSize === current.pageSize && newPage === current.page) {
      return;
    }
    this.pagination.update((state) => ({
      ...state,
      page: newPage,
      pageSize: newPageSize,
    }));
  }

  protected prepareLeadNavigation() {
    const locationUuids = this.displayedLocations().map(
      (row) => row.location.uuid,
    );

    this.navigationService.queryContext.set({
      page: this.page(),
      pageSize: this.pageSize(),
      sort: null,
      show: "all",
      legalEntityUuid: null,
      filters: this.normalizedFilters(),
    });
    this.navigationService.locationsList.set(locationUuids);
  }

  protected getBuildingUsageLabel(
    usage: string | null | undefined,
  ): string | null {
    if (!usage) {
      return null;
    }
    return (
      BUILDING_USAGE_LABELS[usage as keyof typeof BUILDING_USAGE_LABELS] ?? null
    );
  }

  protected getLocationBuildingTypes(
    legalEntities:
      | Array<{ mainBusinessActivity?: string | null }>
      | null
      | undefined,
  ): string[] {
    const codes =
      legalEntities
        ?.map((e) => e.mainBusinessActivity ?? null)
        .filter((c): c is NafCode => Boolean(c)) ?? [];
    return getLocationBuildingTypeLabelsFromNafCodes(codes);
  }

  protected getDepartmentCode(zipcode: string | null | undefined) {
    return getDepartmentByCode(zipcode);
  }

  protected getLegalEntityName(legalEntity: unknown): string | null {
    if (
      legalEntity &&
      typeof legalEntity === "object" &&
      "name" in legalEntity &&
      (legalEntity.name === null || typeof legalEntity.name === "string")
    ) {
      return legalEntity.name;
    }
    return null;
  }
}

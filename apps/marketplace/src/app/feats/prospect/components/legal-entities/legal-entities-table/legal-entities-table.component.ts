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
} from "@angular/core";

import { Router, RouterLink } from "@angular/router";
import type {
  LocationBdnbLegalEntityFilterPro,
  PaginationState,
} from "@optee/constants";
import {
  defaultPagination,
  getDepartmentByCode,
  getLegalEntityTypeLabel,
  nafToInfo,
} from "@optee/constants";
import { DialogService } from "@optee/dialog";
import { IconCompanyComponent, IconWarningComponent } from "@optee/icons";
import type { LegalEntityUuid } from "@optee/models";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { FormatAddressPipe } from "@optee/ui/pipes/format-address.pipe";
import { RoundedNumberPipe } from "@optee/ui/pipes/rounded-number.pipe";
import { ToastService } from "@optee/ui/services/toast.service";
import { BadgeModule } from "primeng/badge";
import { ButtonModule } from "primeng/button";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import trpcClient from "../../../../../../trpc-client";
import { SolicitationIndicatorComponent } from "../../solicitation-indicator/solicitation-indicator.component";
import { LegalEntitiesFiltersComponent } from "../legal-entities-filters/legal-entities-filters.component";

const legalEntitiesSortFields = [
  "nbEmployeesRange",
  "type",
  "nbRelatedLocations",
  "nbRelatedPros",
] as const;

type LegalEntitiesSortField = (typeof legalEntitiesSortFields)[number];

const isLegalEntitiesSortField = (
  value: string | null | undefined,
): value is LegalEntitiesSortField =>
  legalEntitiesSortFields.some((field) => field === value);

@Component({
  selector: "mkp-legal-entities-table",
  host: {
    class: "flex h-full flex-col gap-3 overflow-hidden",
  },
  template: `
    @if (!hideHeader()) {
      <section
        class="border-granite-100 mx-4 mt-4 flex h-12 items-center gap-2 rounded-[16px] border bg-white px-4 shadow-sm md:mx-6"
      >
        <icon-company class="size-4" />
        <span class="text-granite-900 text-sm font-medium">Entreprises</span>
        <span class="text-granite-400 text-sm font-normal">
          {{ totalCount() | roundedNumber }}
        </span>
      </section>
    }

    @if (!hideFilters()) {
      <div
        class="border-granite-100 mx-4 overflow-hidden rounded-[16px] border bg-white shadow-sm md:mx-6"
      >
        <mkp-legal-entities-filters
          class="prospect-table"
          [(filters)]="filters"
        />
      </div>
    }

    @if (legalEntities.isLoading()) {
      <oui-loader label="Analyse des entreprises correspondantes..." />
    } @else if (legalEntities.error()) {
      <div
        class="flex h-full w-full flex-1 flex-col items-center justify-center gap-2 py-6"
      >
        <p class="font-display text-red-500">
          Une erreur est survenue lors du chargement des entreprises. Merci de
          réessayer plus tard.
        </p>
      </div>
    } @else if (totalCount() === 0) {
      <div
        class="flex h-full w-full flex-1 flex-col items-center justify-center gap-2 py-6"
      >
        <p class="text-granite-400 font-display">
          @if (hasSomeFiltersActive()) {
            Aucune entreprise ne correspond aux filtres appliqués. Merci de les
            ajuster ou de les réinitialiser.
          } @else {
            {{
              emptyListMessage() ??
                "Aucune entreprise disponible. Merci de réessayer plus tard. 🏗️"
            }}
          }
        </p>
      </div>
    } @else {
      <div
        class="border-granite-100 mx-4 mb-4 flex h-full flex-1 flex-col overflow-hidden rounded-[16px] border bg-white shadow-sm md:mx-6"
      >
        <p-table
          class="prospect-table h-full overflow-hidden"
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
          [first]="page() * pageSize()"
          [paginator]="!hidePaginator()"
          [rows]="pageSize()"
          [rowsPerPageOptions]="[10, 20, 50, 100]"
          [sortField]="sortField()"
          [sortOrder]="sortOrder()"
          [style.scrollbar-color]="'#A3C0FF transparent'"
          [totalRecords]="totalCount() ?? 0"
          [value]="legalEntities.value()?.legalEntities ?? []"
        >
          <ng-template #colgroup>
            <col class="cell-grow" style="min-width: 18rem" />
            <col style="width: 6.5rem" />
            <col style="width: 8rem" />
            <col style="width: 8rem" />
            <col style="width: 10rem" />
            @if (showLegalEntities() === "unlocked") {
              <col style="width: 13rem" />
            }
            <col style="width: 12rem" />
            <col style="width: 13rem" />
          </ng-template>
          <ng-template #header>
            <tr>
              <th>Raison sociale</th>

              <th class="whitespace-nowrap" pSortableColumn="nbRelatedPros">
                Concurrence
                <p-sortIcon class="small-sort-icon" field="nbRelatedPros" />
              </th>

              <th pSortableColumn="type">
                Entreprise
                <p-sortIcon class="small-sort-icon" field="type" />
              </th>

              <th
                class="whitespace-nowrap"
                pSortableColumn="nbRelatedLocations"
              >
                Bâtiments gérés
                <p-sortIcon
                  class="small-sort-icon"
                  field="nbRelatedLocations"
                />
              </th>

              <th class="whitespace-nowrap" pSortableColumn="nbEmployeesRange">
                Taille
                <p-sortIcon class="small-sort-icon" field="nbEmployeesRange" />
              </th>

              @if (showLegalEntities() === "unlocked") {
                <th>Siège social</th>
              }
              <th>Département</th>

              <th>Activité principale</th>
            </tr>
          </ng-template>
          <ng-template #body let-row>
            <tr>
              <td class="cell-grow max-w-xs">
                @let name = row.legalEntity.name;
                @let noContactCanBeFound = row.legalEntity.noContactCanBeFound;
                <span class="flex items-center justify-between gap-2">
                  <a
                    class="pister-link flex-1 font-medium"
                    [pTooltip]="(name?.length ?? 0) > 30 ? name : undefined"
                    [routerLink]="[
                      '/pro/pisteur/legal-entities/details',
                      row.legalEntity.legalEntityUuid,
                    ]"
                  >
                    <icon-company
                      class="size-5 flex-shrink-0 rounded-[4px] p-[3px]"
                    />

                    @if (name) {
                      <span class="line-clamp-1 min-w-0">
                        {{ name }}
                      </span>
                    } @else {
                      <span class="text-granite-300 text-sm italic">
                        Non connu
                      </span>
                    }
                  </a>
                  @if (noContactCanBeFound) {
                    <span
                      pTooltip="Aucune personne n'a pu être trouvée pour cette entreprise."
                      tooltipPosition="top"
                    >
                      <icon-warning class="size-4 text-orange-400" />
                    </span>
                  }
                </span>
              </td>
              <td>
                @let nbRelatedPros = row.legalEntity.nbRelatedPros;
                <mkp-solicitation-indicator
                  entityType="company"
                  [count]="nbRelatedPros"
                />
              </td>
              <td>
                @let typeLabel = getLegalEntityTypeLabel(row.legalEntity.type);
                @if (typeLabel) {
                  <span class="font-medium">{{ typeLabel }}</span>
                } @else {
                  <span class="text-granite-300 text-sm italic">Non connu</span>
                }
              </td>

              <td>
                @let nbRelatedLocations = row.legalEntity.nbRelatedLocations;
                @if (
                  nbRelatedLocations === null ||
                  nbRelatedLocations === undefined
                ) {
                  <span class="text-granite-300 text-sm italic">Non connu</span>
                } @else {
                  {{ nbRelatedLocations > 1000 ? "1000+" : nbRelatedLocations }}
                  {{ "Bâtiment" + (nbRelatedLocations === 1 ? "" : "s") }}
                }
              </td>
              <td>
                @if (
                  row.legalEntity.nbEmployeesRange === null ||
                  row.legalEntity.nbEmployeesRange === undefined
                ) {
                  <span class="text-granite-300 text-sm italic">Non connu</span>
                } @else {
                  <span class="line-clamp-1 min-w-0 font-medium">
                    {{ row.legalEntity.nbEmployeesRange }}
                  </span>
                }
              </td>
              @if (showLegalEntities() === "unlocked") {
                <td class="max-w-xs">
                  @let address = row.legalEntity | formatAddress;
                  <span
                    class="line-clamp-1 min-w-0"
                    [pTooltip]="
                      (address?.length ?? 0) > 10 ? address : undefined
                    "
                  >
                    {{ address }}
                  </span>
                </td>
              }
              <td>
                @let department = getDepartmentByCode(row.legalEntity.zipCode);
                @if (department) {
                  <span class="font-medium">{{ department }}</span>
                } @else {
                  <span class="text-granite-300 text-sm italic">Non connu</span>
                }
              </td>

              <td>
                @let nafInfo = nafToInfo(row.legalEntity.mainBusinessActivity);

                @if (nafInfo) {
                  <span
                    class="line-clamp-1 min-w-0"
                    [pTooltip]="nafInfo?.field"
                  >
                    {{ nafInfo.field }}
                  </span>
                } @else {
                  <span class="text-granite-300 text-sm italic">Non connu</span>
                }
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    }
  `,
  imports: [
    BadgeModule,
    ButtonModule,
    IconCompanyComponent,
    IconWarningComponent,
    LoaderComponent,
    PaginatorModule,
    LegalEntitiesFiltersComponent,
    TableModule,
    TooltipModule,
    IconCompanyComponent,
    SolicitationIndicatorComponent,
    RouterLink,
    FormatAddressPipe,
    RoundedNumberPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntitiesTableComponent {
  readonly showLegalEntities = input<"unlocked" | "new" | "all">("all");
  readonly hideFilters = input(false, { transform: booleanAttribute });
  readonly hideHeader = input(false, { transform: booleanAttribute });
  readonly hidePaginator = input(false, { transform: booleanAttribute });
  readonly filters = model<LocationBdnbLegalEntityFilterPro | null>(null);
  readonly pagination = model<PaginationState>({
    ...defaultPagination,
    sort: { sortBy: "nbRelatedLocations", sortOrder: "desc" },
  });

  readonly emptyListMessage = input<string | undefined>();

  protected readonly page = computed(() => this.pagination().page);
  protected readonly pageSize = computed(() => this.pagination().pageSize);
  protected readonly sort = computed(() => this.pagination().sort);

  protected readonly sortField = computed(() => this.sort()?.sortBy ?? null);
  protected readonly sortOrder = computed(() => {
    const order = this.sort()?.sortOrder;
    if (order === "asc") {
      return 1;
    }
    if (order === "desc") {
      return -1;
    }
    return 0;
  });

  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);

  protected readonly getLegalEntityTypeLabel = getLegalEntityTypeLabel;
  protected readonly nafToInfo = nafToInfo;
  protected readonly getDepartmentByCode = getDepartmentByCode;

  protected readonly hasSomeFiltersActive = computed(
    () => Object.keys(this.filters() ?? {}).length > 0,
  );

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
      this.pagination.update((state) => ({ ...state, page: 0 }));
    }

    this.previousFilters = currentFilters;
  });

  protected readonly legalEntities = resource({
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
        show: this.showLegalEntities(),
        sort: this.sort() ?? undefined,
        filters,
      };
    },
    loader: async ({ params, abortSignal }) => {
      try {
        const response = await trpcClient.legalEntities.getAllPaginated.mutate(
          {
            page: params.page,
            pageSize: params.pageSize,
            sort: params.sort,
            ...params.filters,
            show: params.show,
          },
          { signal: abortSignal },
        );

        this.previousTotal.set(response.total);

        return {
          count: response.total,
          legalEntities: response.items,
        };
      } catch (error) {
        this.toastService.openError("Récupération des entreprises.", error);

        return { count: 0, legalEntities: [] };
      }
    },
  });

  protected onSort(event: { field?: string; order?: 1 | -1 }) {
    const nextField = isLegalEntitiesSortField(event.field)
      ? event.field
      : null;

    let newOrder: "asc" | "desc" | null = null;
    if (event.order === 1) {
      newOrder = "asc";
    } else if (event.order === -1) {
      newOrder = "desc";
    }

    this.pagination.update((state) => ({
      ...state,
      page: 0,
      sort:
        nextField && newOrder
          ? {
              sortBy: nextField,
              sortOrder: newOrder,
            }
          : null,
    }));
  }

  protected readonly previousTotal = signal<number | null>(null);

  protected readonly totalCount = computed(
    () => this.legalEntities.value()?.count ?? this.previousTotal(),
  );

  protected onPageChange(event: { first: number; rows: number }) {
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

  protected goToDetails(legalEntityUuid?: LegalEntityUuid) {
    if (!legalEntityUuid) {
      return;
    }

    void this.router.navigate([
      "/pro/pisteur/legal-entities/details",
      legalEntityUuid,
    ]);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
  untracked,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import {
  ADMIN_LEGAL_ENTITY_SORT_FIELDS,
  type AdminLegalEntitySortField,
  nafToInfo,
} from "@optee/constants";
import { DialogConfirmationComponent, DialogService } from "@optee/dialog";
import { IconSearchComponent } from "@optee/icons";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { RoundedNumberPipe } from "@optee/ui/pipes/rounded-number.pipe";
import { ToastService } from "@optee/ui/services/toast.service";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { Tooltip } from "primeng/tooltip";
import { debounceTime, startWith } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { LegalEntityTypeChipComponent } from "../../../components/shared/legal-entity-type-chip/legal-entity-type-chip.component";
import { LegalEntityDeleteResultDialogComponent } from "./legal-entity-delete-result.dialog";

type AdminLegalEntitiesResponse = Awaited<
  ReturnType<typeof trpcClient.legalEntities.getAllForAdmin.query>
>;
type AdminLegalEntityRow = AdminLegalEntitiesResponse["items"][number];

const PROVIDERS = [
  {
    label: "Google",
    isUnavailable: (row: AdminLegalEntityRow) => Boolean(row.isUnavailableForGoogle),
  },
  {
    label: "Pappers",
    isUnavailable: (row: AdminLegalEntityRow) =>
      Boolean(row.isUnavailableForPappers),
  },
  {
    label: "Hunter",
    isUnavailable: (row: AdminLegalEntityRow) => Boolean(row.isUnavailableForHunter),
  },
  {
    label: "SocieteInfo",
    isUnavailable: (row: AdminLegalEntityRow) =>
      Boolean(row.isUnavailableForSocieteInfo),
  },
] as const;

const isAdminLegalEntitySortField = (
  value: string | null | undefined,
): value is AdminLegalEntitySortField =>
  ADMIN_LEGAL_ENTITY_SORT_FIELDS.some((field) => field === value);

@Component({
  selector: "mkp-admin-legal-entities-page",
  host: {
    class: "flex h-full min-h-0 flex-col",
  },
  template: `
    <oui-bob
      class="flex h-full min-h-0 flex-col"
      heading="Personnes morales ({{ totalCount() | roundedNumber }})"
    >
      <div class="mb-3">
        <p-iconfield class="w-full max-w-screen-sm">
          <p-inputicon class="size-4">
            <icon-search />
          </p-inputicon>

          <input
            class="p-inputnumber-gray"
            fluid
            pInputText
            placeholder="Rechercher par nom, SIREN ou SIRET"
            role="searchbox"
            type="search"
            variant="filled"
            [formControl]="searchControl"
          />
        </p-iconfield>
      </div>

      <div class="flex min-h-0 flex-1 flex-col">
        @if (legalEntitiesResource.isLoading()) {
          <oui-loader label="Chargement des personnes morales..." />
        } @else {
          @if (legalEntitiesResource.error(); as error) {
            <oui-message
              severity="error"
              summary="Une erreur est survenue lors de la récupération des personnes morales"
            >
              {{ formatError(error) }}
            </oui-message>
          } @else {
            @let rows = legalEntitiesResource.value()?.items ?? [];
            @if (rows.length > 0) {
              <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
                <p-table
                  class="h-full overflow-hidden text-sm"
                  currentPageReportTemplate=""
                  customSort
                  lazy
                  paginator
                  rowHover
                  scrollable
                  scrollHeight="flex"
                  (onPage)="onPageChange($event)"
                  (onSort)="onSort($event)"
                  [first]="page() * pageSize()"
                  [rows]="pageSize()"
                  [rowsPerPageOptions]="[10, 25, 50, 100]"
                  [showCurrentPageReport]="false"
                  [sortField]="sortField()"
                  [sortMode]="'single'"
                  [sortOrder]="sortOrder()"
                  [totalRecords]="totalCount()"
                  [value]="rows"
                >
                  <ng-template #header>
                    <tr>
                      <th
                        class="min-w-64"
                        alignFrozen="left"
                        pFrozenColumn
                        pSortableColumn="name"
                        [frozen]="true"
                      >
                        Nom
                        <p-sortIcon class="small-sort-icon" field="name" />
                      </th>
                      <th pSortableColumn="siren">
                        SIREN
                        <p-sortIcon class="small-sort-icon" field="siren" />
                      </th>
                      <th pSortableColumn="siret">
                        SIRET
                        <p-sortIcon class="small-sort-icon" field="siret" />
                      </th>
                      <th pSortableColumn="nbRelatedPros">
                        Nb pros liés
                        <p-sortIcon
                          class="small-sort-icon"
                          field="nbRelatedPros"
                        />
                      </th>
                      <th pSortableColumn="nbRelatedLocations">
                        Nb sites liés
                        <p-sortIcon
                          class="small-sort-icon"
                          field="nbRelatedLocations"
                        />
                      </th>
                      <th pSortableColumn="type">
                        Type
                        <p-sortIcon class="small-sort-icon" field="type" />
                      </th>
                      <th pSortableColumn="mainBusinessActivity">
                        Activité
                        <p-sortIcon
                          class="small-sort-icon"
                          field="mainBusinessActivity"
                        />
                      </th>
                      <th pSortableColumn="zipCode">
                        CP
                        <p-sortIcon class="small-sort-icon" field="zipCode" />
                      </th>
                      <th class="min-w-44">Disponibilité des infos</th>
                      <th
                        class="w-28"
                        alignFrozen="right"
                        pFrozenColumn
                        [frozen]="true"
                      >
                        Actions
                      </th>
                    </tr>
                  </ng-template>
                  <ng-template #body let-row>
                    <tr>
                      <td
                        class="min-w-64"
                        alignFrozen="left"
                        pFrozenColumn
                        [frozen]="true"
                      >
                        <div class="font-medium">
                          {{ row.name ?? row.usualName ?? "NC" }}
                        </div>
                        @if (row.usualName && row.usualName !== row.name) {
                          <div class="text-granite-500 text-xs">
                            {{ row.usualName }}
                          </div>
                        }
                      </td>
                      <td>{{ row.siren ?? "NC" }}</td>
                      <td>{{ row.siret ?? "NC" }}</td>
                      <td>{{ row.nbRelatedPros }}</td>
                      <td>{{ row.nbRelatedLocations }}</td>
                      <td>
                        <mkp-legal-entity-type-chip [type]="row.type" />
                      </td>
                      <td>
                        @let nafInfo = nafToInfo(row.mainBusinessActivity);
                        {{ nafInfo?.field ?? row.mainBusinessActivity ?? "NC" }}
                      </td>
                      <td>{{ row.zipCode ?? "NC" }}</td>
                      <td>
                        <span
                          class="status-chip status-chip--interactive"
                          tooltipPosition="top"
                          [class.status-chip--provider-ko]="
                            getProvidersTone(row) === 'ko'
                          "
                          [class.status-chip--provider-ok]="
                            getProvidersTone(row) === 'ok'
                          "
                          [class.status-chip--provider-partial]="
                            getProvidersTone(row) === 'partial'
                          "
                          [pTooltip]="getProvidersStatusTooltip(row)"
                        >
                          {{ getProvidersChipLabel(row) }}
                        </span>
                      </td>
                      <td alignFrozen="right" pFrozenColumn [frozen]="true">
                        <button
                          class="rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          tooltipPosition="top"
                          type="button"
                          (click)="deleteLegalEntity(row)"
                          [disabled]="isDeleteDisabled()"
                          [pTooltip]="getDeleteTooltip(row)"
                        >
                          @if (deletingLegalEntityUuid() === row.uuid) {
                            Suppression...
                          } @else {
                            Supprimer
                          }
                        </button>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>
            } @else {
              <p class="text-primary-900 text-center text-lg">
                {{
                  searchControl.value
                    ? "Aucune personne morale ne correspond à la recherche."
                    : "Aucune personne morale disponible."
                }}
              </p>
            }
          }
        }
      </div>
    </oui-bob>
  `,
  imports: [
    ReactiveFormsModule,
    BobComponent,
    IconField,
    IconSearchComponent,
    InputIcon,
    InputText,
    LoaderComponent,
    MessageComponent,
    LegalEntityTypeChipComponent,
    RoundedNumberPipe,
    TableModule,
    Tooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminLegalEntitiesPageComponent {
  protected readonly searchControl = new FormControl("");
  protected readonly dialogService = inject(DialogService);
  protected readonly toastService = inject(ToastService);
  protected readonly page = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly deletingLegalEntityUuid = signal<string | null>(null);
  protected readonly sort = signal<{
    sortBy: AdminLegalEntitySortField;
    sortOrder: "asc" | "desc";
  }>({
    sortBy: "nbRelatedLocations",
    sortOrder: "desc",
  });

  protected readonly previousTotal = signal<number | null>(null);
  protected readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(300), startWith("")),
  );

  protected readonly sortField = computed(() => this.sort().sortBy);
  protected readonly sortOrder = computed(() =>
    this.sort().sortOrder === "asc" ? 1 : -1,
  );

  protected readonly totalCount = computed(
    () =>
      this.legalEntitiesResource.value()?.total ?? this.previousTotal() ?? 0,
  );

  protected readonly nafToInfo = nafToInfo;

  private readonly previousSearchTerm = signal<string | null>(null);

  private readonly resetPaginationOnSearch = effect(() => {
    const currentSearchTerm = (this.searchTerm() ?? "").trim();
    const previousSearchTerm = untracked(() => this.previousSearchTerm());

    if (
      previousSearchTerm !== null &&
      currentSearchTerm !== previousSearchTerm
    ) {
      this.page.set(0);
    }

    untracked(() => this.previousSearchTerm.set(currentSearchTerm));
  });

  protected readonly legalEntitiesResource = resource({
    params: () => ({
      term: (this.searchTerm() ?? "").trim(),
      page: this.page(),
      pageSize: this.pageSize(),
      sort: this.sort(),
    }),
    loader: async ({ params, abortSignal }) => {
      const response = await trpcClient.legalEntities.getAllForAdmin.query(
        {
          term: params.term?.length >= 2 ? params.term : null,
          page: params.page,
          pageSize: params.pageSize,
          sort: params.sort,
        },
        { signal: abortSignal },
      );

      this.previousTotal.set(response.total);
      return response;
    },
  });

  protected onPageChange(event: { first?: number; rows?: number }) {
    const currentPageSize = this.pageSize();
    const nextPageSize = event.rows ?? currentPageSize;
    const nextPage = Math.floor((event.first ?? 0) / nextPageSize);

    if (currentPageSize !== nextPageSize) {
      this.pageSize.set(nextPageSize);
    }
    if (this.page() !== nextPage) {
      this.page.set(nextPage);
    }
  }

  protected onSort(event: { field?: string; order?: 1 | -1 }) {
    const nextField = isAdminLegalEntitySortField(event.field)
      ? event.field
      : null;
    const nextOrder =
      event.order === 1 ? "asc" : event.order === -1 ? "desc" : null;

    if (!nextField || !nextOrder) {
      return;
    }

    this.sort.set({
      sortBy: nextField,
      sortOrder: nextOrder,
    });
    this.page.set(0);
  }

  protected getProvidersChipLabel(row: AdminLegalEntityRow) {
    const tone = this.getProvidersTone(row);

    if (tone === "ok") {
      return "Providers OK";
    }

    if (tone === "ko") {
      return "Providers indisponibles";
    }

    return "Providers partiels";
  }

  protected getProvidersStatusTooltip(row: AdminLegalEntityRow) {
    const status = (isUnavailable: boolean) =>
      isUnavailable ? "indisponible" : "disponible";

    return PROVIDERS.map(
      (provider) => `${provider.label}: ${status(provider.isUnavailable(row))}`,
    ).join("\n");
  }

  private getUnavailableProviders(row: AdminLegalEntityRow) {
    return PROVIDERS.filter((provider) => provider.isUnavailable(row)).map(
      (provider) => provider.label,
    );
  }

  protected getProvidersTone(row: AdminLegalEntityRow) {
    const unavailableCount = this.getUnavailableProviders(row).length;
    const totalProviders = PROVIDERS.length;

    if (unavailableCount === 0) {
      return "ok" as const;
    }

    if (unavailableCount === totalProviders) {
      return "ko" as const;
    }

    return "partial" as const;
  }

  protected formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "Erreur inconnue";
  }

  protected async deleteLegalEntity(row: AdminLegalEntityRow) {
    if (this.isDeleteDisabled()) {
      return;
    }

    const legalEntityName = row.name ?? row.usualName ?? row.siren ?? "NC";
    const { res: confirmed } = await this.dialogService.open(
      DialogConfirmationComponent,
      {
        data: {
          icon: "company",
          title: "Supprimer cette personne morale ?",
          description: this.buildDeleteConfirmationDescription(legalEntityName),
          action: "Confirmer la suppression",
          cancelButtonLabel: "Annuler",
          actionColor: "danger",
        },
      },
    );

    if (!confirmed) {
      return;
    }

    this.deletingLegalEntityUuid.set(row.uuid);

    try {
      const result = await trpcClient.legalEntities.deleteForAdmin.mutate(
        row.uuid,
      );

      this.toastService.open(
        "success",
        "Suppression effectuée",
        "Personne morale et dépendances nettoyées.",
      );
      await this.dialogService.open(LegalEntityDeleteResultDialogComponent, {
        data: result,
      });
      this.legalEntitiesResource.reload();
    } catch (error) {
      this.toastService.openError("Suppression de la personne morale", error);
    } finally {
      this.deletingLegalEntityUuid.set(null);
    }
  }

  protected isDeleteDisabled() {
    return this.deletingLegalEntityUuid() !== null;
  }

  protected getDeleteTooltip(row: AdminLegalEntityRow) {
    if (this.isDeleteDisabled()) {
      return "Suppression en cours...";
    }

    return "Supprimer cette personne morale et nettoyer les dépendances.";
  }

  private buildDeleteConfirmationDescription(legalEntityName: string) {
    return [
      `Vous allez supprimer "${legalEntityName}" et lancer le nettoyage des dépendances.`,
      "",
      "Règles appliquées :",
      "- Les relations Pro / Personne morale existantes seront supprimées.",
      "- Pour chaque bâtiment associé :",
      "  retirer l'association avec la personne morale.",
      "- Si cette personne morale est l'unique association du bâtiment : suppression du bâtiment.",
      "- Un compte rendu sera affiché :",
      "  nb de relations nettoyées (Pro/PM + Pro/Bâtiments), nb de bâtiments nettoyés, et pros concernés.",
      "",
      "Cette action est irréversible.",
    ].join("\n");
  }
}

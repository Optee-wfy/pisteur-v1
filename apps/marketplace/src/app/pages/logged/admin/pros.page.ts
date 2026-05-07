import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import {
  ADMIN_PRO_SORT_FIELDS,
  AssociationProExternalContactStatus,
  type AdminProSortField,
  type AdminProSubscriptionActivityFilter,
  ExternalContactStatusLabels,
  getProPlan,
  MARKETPLACE_UI_URL,
  PRO_PLANS,
  PRO_STATUSES,
  ProSubscription,
  type ProStatus,
  SUBSCRIPTION_LABELS,
} from "@optee/constants";
import { DialogConfirmationComponent, DialogService } from "@optee/dialog";
import { IconSearchComponent } from "@optee/icons";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { RoundedNumberPipe } from "@optee/ui/pipes/rounded-number.pipe";
import { ToastService } from "@optee/ui/services/toast.service";
import type { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { Select } from "primeng/select";
import { TableModule } from "primeng/table";
import { TieredMenuModule } from "primeng/tieredmenu";
import { debounceTime, startWith } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { AdminProCreditsDialogComponent } from "./pro-credits.dialog";
import { AdminProMembersDialogComponent } from "./pro-members.dialog";
import { AdminProStatusDialogComponent } from "./pro-status.dialog";
import {
  AdminProStripeCustomerDialogComponent,
  type AdminProStripePriceOption,
} from "./pro-stripe-customer.dialog";
import {
  AdminProPaymentLinksDialogComponent,
  type AdminProOnboardingPaymentLink,
} from "./pro-payment-links.dialog";

type AdminProsResponse = Awaited<
  ReturnType<typeof trpcClient.pros.getAllForAdmin.query>
>;
type AdminStripeProductsResponse = Awaited<
  ReturnType<typeof trpcClient.stripe.getProductsForAdmin.query>
>;
type AdminProRow = AdminProsResponse["items"][number];
type AdminProsSubscriptionFilterValue =
  | AdminProSubscriptionActivityFilter
  | "hubspotOnly";
type AdminProsInternalStatusFilterValue = AssociationProExternalContactStatus;

const isAdminProSortField = (
  value: string | null | undefined,
): value is AdminProSortField =>
  ADMIN_PRO_SORT_FIELDS.some((field) => field === value);

@Component({
  selector: "mkp-admin-pros-page",
  host: {
    class: "flex h-full min-h-0 flex-col",
  },
  template: `
    <oui-bob
      class="flex h-full min-h-0 flex-col"
      heading="Pros ({{ totalCount() | roundedNumber }})"
    >
      <button
        postTitle
        class="p-button-sm"
        pButton
        type="button"
        (click)="openOnboardingPaymentLinksDialog()"
      >
        Liens de paiements
      </button>

      <div class="mb-3 flex flex-wrap items-start gap-3">
        <p-iconfield class="w-full max-w-screen-sm flex-1">
          <p-inputicon class="size-4">
            <icon-search />
          </p-inputicon>

          <input
            class="p-inputnumber-gray"
            fluid
            pInputText
            placeholder="Rechercher par nom"
            role="searchbox"
            type="search"
            variant="filled"
            [formControl]="searchControl"
          />
        </p-iconfield>

        <p-select
          class="min-w-64"
          appendTo="body"
          optionLabel="label"
          optionValue="value"
          placeholder="Statut"
          showClear
          [formControl]="statusControl"
          [options]="statusOptions"
        />

        <p-select
          class="min-w-64"
          appendTo="body"
          optionLabel="label"
          optionValue="value"
          placeholder="Status interne"
          showClear
          [formControl]="statusInterneControl"
          [options]="statusInterneOptions"
        />

        <p-select
          class="min-w-64"
          appendTo="body"
          optionLabel="label"
          optionValue="value"
          placeholder="Abonnement"
          showClear
          [formControl]="subscriptionActivityControl"
          [options]="subscriptionActivityOptions"
        />
      </div>
      <p-tieredmenu
        #actionsMenu
        appendTo="body"
        popup
        (onHide)="selectedRowForActions.set(null)"
        [model]="rowActions()"
      />
      <p-tieredmenu
        #internalStatusMenu
        appendTo="body"
        popup
        (onHide)="selectedRowForInternalStatus.set(null)"
        [model]="internalStatusActions()"
      />

      <div class="flex min-h-0 flex-1 flex-col">
        @if (prosResource.isLoading()) {
          <oui-loader label="Chargement des pros..." />
        } @else {
          @if (prosResource.error(); as error) {
            <oui-message
              severity="error"
              summary="Une erreur est survenue lors de la récupération des pros"
            >
              {{ formatError(error) }}
            </oui-message>
          } @else {
            @let rows = prosResource.value()?.items ?? [];
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
                        [frozen]="true"
                      >
                        Nom
                      </th>
                      <th class="min-w-44">Status interne</th>
                      <th class="min-w-56">Contact principal</th>
                      <th pSortableColumn="remainingCredits">
                        Crédits restants
                        <p-sortIcon
                          class="small-sort-icon"
                          field="remainingCredits"
                        />
                      </th>
                      <th class="min-w-44">Status application</th>
                      <th pSortableColumn="activeSubscription">
                        Abonnement actif
                        <p-sortIcon
                          class="small-sort-icon"
                          field="activeSubscription"
                        />
                      </th>
                      <th class="min-w-44">Abonnement Stripe actif</th>
                      <th pSortableColumn="lastNonOpteeSignInAt">
                        Dernière connexion
                        <p-sortIcon
                          class="small-sort-icon"
                          field="lastNonOpteeSignInAt"
                        />
                      </th>
                      <th>Contacts non-optee</th>
                      <th
                        class="w-20"
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
                        class="min-w-64 font-medium"
                        alignFrozen="left"
                        pFrozenColumn
                        [frozen]="true"
                      >
                        <div class="flex items-center gap-2">
                          @if (isTestAccount(row)) {
                            <span class="status-chip status-chip--warn">
                              Test
                            </span>
                          }
                          <span class="font-medium">
                            {{ getDisplayedName(row) }}
                          </span>
                        </div>
                      </td>
                      <td class="min-w-44">
                        <button
                          class="status-chip"
                          type="button"
                          aria-haspopup="true"
                          (click)="
                            selectedRowForInternalStatus.set(row);
                            internalStatusMenu.toggle($event)
                          "
                          [attr.aria-expanded]="
                            selectedRowForInternalStatus()?.uuid === row.uuid
                              ? 'true'
                              : 'false'
                          "
                          [attr.aria-label]="
                            'Modifier le status interne pour ' +
                            getActionRowIdentifier(row)
                          "
                          [disabled]="isRowActionPending(row.uuid)"
                          [class.status-chip--ko]="
                            getInternalStatusTone(row.statusInterne) === 'ko'
                          "
                          [class.status-chip--neutral]="
                            getInternalStatusTone(row.statusInterne) ===
                            'neutral'
                          "
                          [class.status-chip--ok]="
                            getInternalStatusTone(row.statusInterne) === 'ok'
                          "
                          [class.status-chip--warn]="
                            getInternalStatusTone(row.statusInterne) === 'warn'
                          "
                        >
                          {{ getInternalStatusLabel(row.statusInterne) }}
                        </button>
                      </td>
                      <td class="min-w-56">
                        @if (row.mainContactName || row.mainContactEmail) {
                          <div class="flex flex-col gap-1">
                            <span class="font-medium">
                              {{ row.mainContactName ?? "NC" }}
                            </span>
                            @if (row.mainContactEmail) {
                              <span class="text-xs text-gray-600">
                                {{ row.mainContactEmail }}
                              </span>
                            }
                          </div>
                        } @else {
                          NC
                        }
                      </td>
                      <td>
                        @if (row.hasActiveSubscription) {
                          <button
                            class="enrich-button"
                            type="button"
                            (click)="handleAddCreditsClick(row)"
                            [attr.aria-label]="
                              'Ajouter des crédits pour ' +
                              getActionRowIdentifier(row)
                            "
                            [disabled]="isRowActionPending(row.uuid)"
                          >
                            {{ row.remainingCredits | roundedNumber }} /
                            {{ getSubscriptionCreditsLabel(row) }}
                          </button>
                        } @else {
                          <span class="text-sm text-gray-600">
                            Aucun abonnement
                          </span>
                        }
                      </td>
                      <td>
                        <span
                          class="status-chip"
                          [class.status-chip--ko]="getStatusTone(row) === 'ko'"
                          [class.status-chip--neutral]="
                            getStatusTone(row) === 'neutral'
                          "
                          [class.status-chip--ok]="getStatusTone(row) === 'ok'"
                          [class.status-chip--warn]="
                            getStatusTone(row) === 'warn'
                          "
                        >
                          {{ row.status ?? "NC" }}
                        </span>
                      </td>
                      <td>
                        <span
                          class="status-chip"
                          [class.status-chip--ko]="
                            !row.hasActiveSubscription && !!row.subscription
                          "
                          [class.status-chip--neutral]="!row.subscription"
                          [class.status-chip--ok]="row.hasActiveSubscription"
                        >
                          {{ getActiveSubscriptionChipLabel(row) }}
                        </span>
                      </td>
                      <td>
                        <div class="flex items-center gap-2">
                          @if (hasStripeCustomerId(row)) {
                            <div class="flex items-center gap-2">
                              <span class="status-chip status-chip--ok">
                                Actif
                              </span>
                              @if (hasStripeConfigurationWarning(row)) {
                                <button
                                  class="status-chip status-chip--warn"
                                  type="button"
                                  (click)="handleAddStripeCustomerClick(row)"
                                  [attr.aria-label]="
                                    'Compléter les identifiants Stripe pour ' +
                                    getActionRowIdentifier(row)
                                  "
                                  [disabled]="isRowActionPending(row.uuid)"
                                >
                                  Sub ID manquant
                                </button>
                              }
                            </div>
                          } @else {
                            <button
                              class="prospect-button"
                              type="button"
                              (click)="handleAddStripeCustomerClick(row)"
                              [attr.aria-label]="
                                'Ajouter un customer Stripe pour ' +
                                getActionRowIdentifier(row)
                              "
                              [disabled]="isRowActionPending(row.uuid)"
                            >
                              Ajouter
                            </button>
                          }
                        </div>
                      </td>
                      <td>
                        @if (row.lastNonOpteeSignInAt) {
                          {{
                            row.lastNonOpteeSignInAt | date: "dd/MM/yyyy HH:mm"
                          }}
                        } @else {
                          NC
                        }
                      </td>
                      <td>{{ row.nonOpteeContactsCount }}</td>
                      <td alignFrozen="right" pFrozenColumn [frozen]="true">
                        <button
                          class="p-button-sm p-button-text"
                          pButton
                          type="button"
                          aria-haspopup="true"
                          (click)="
                            selectedRowForActions.set(row);
                            actionsMenu.toggle($event)
                          "
                          [attr.aria-expanded]="
                            selectedRowForActions()?.uuid === row.uuid
                              ? 'true'
                              : 'false'
                          "
                          [attr.aria-label]="
                            'Ouvrir les actions pour ' +
                            getActionRowIdentifier(row)
                          "
                          [disabled]="isRowActionPending(row.uuid)"
                        >
                          ...
                        </button>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>
            } @else {
              <p class="text-primary-900 text-center text-lg">
                {{
                  searchControl.value ||
                  statusControl.value ||
                  statusInterneControl.value ||
                  subscriptionActivityControl.value
                    ? "Aucun pro ne correspond aux filtres appliqués."
                    : "Aucun pro disponible."
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
    ButtonModule,
    DatePipe,
    IconField,
    IconSearchComponent,
    InputIcon,
    InputText,
    LoaderComponent,
    MessageComponent,
    RoundedNumberPipe,
    Select,
    TableModule,
    TieredMenuModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminProsPageComponent {
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
  private readonly testAccountNamePrefixRegex = /^\s*\[TEST\]\s*/i;
  private stripePriceOptionsCache: AdminProStripePriceOption[] | null = null;
  private readonly onboardingPaymentLinks: AdminProOnboardingPaymentLink[] =
    PRO_PLANS.filter(
      (plan): plan is (typeof PRO_PLANS)[number] & { buyable: true } =>
        plan.buyable &&
        plan.subscription !== ProSubscription.FREE &&
        plan.subscription !== ProSubscription.UNPAID &&
        plan.subscription !== ProSubscription.RESIGNED,
    ).map((plan) => {
      const params = new URLSearchParams({
        subscription: plan.subscription.toLowerCase(),
      });

      return {
        subscription: plan.subscription,
        label: SUBSCRIPTION_LABELS[plan.subscription],
        url: `${MARKETPLACE_UI_URL}/onboarding-pro?${params.toString()}`,
      };
    });

  protected readonly searchControl = new FormControl("");
  protected readonly statusControl = new FormControl<ProStatus | null>(null);
  protected readonly statusInterneControl =
    new FormControl<AdminProsInternalStatusFilterValue | null>(null);
  protected readonly subscriptionActivityControl =
    new FormControl<AdminProsSubscriptionFilterValue | null>(null);

  protected readonly page = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sort = signal<{
    sortBy: AdminProSortField;
    sortOrder: "asc" | "desc";
  }>({
    sortBy: "lastNonOpteeSignInAt",
    sortOrder: "desc",
  });

  protected readonly previousTotal = signal<number | null>(null);
  protected readonly rowActionsPendingByProUuid = signal<
    Record<string, boolean>
  >({});

  protected readonly selectedRowForActions = signal<AdminProRow | null>(null);
  protected readonly selectedRowForInternalStatus =
    signal<AdminProRow | null>(null);

  protected readonly statusOptions = PRO_STATUSES.map((status) => ({
    label: status,
    value: status,
  }));

  protected readonly statusInterneOptions = Object.values(
    AssociationProExternalContactStatus,
  ).map((status) => ({
    label: ExternalContactStatusLabels[status],
    value: status,
  }));

  protected readonly subscriptionActivityOptions: Array<{
    label: string;
    value: AdminProsSubscriptionFilterValue;
  }> = [
    { label: "Actif", value: "active" },
    { label: "Inactif", value: "inactive" },
    { label: "Abonnement Hubspot uniquement", value: "hubspotOnly" },
  ];

  protected readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(300), startWith("")),
  );

  protected readonly statusFilter = toSignal(
    this.statusControl.valueChanges.pipe(startWith(this.statusControl.value)),
  );

  protected readonly subscriptionActivityFilter = toSignal(
    this.subscriptionActivityControl.valueChanges.pipe(
      startWith(this.subscriptionActivityControl.value),
    ),
  );
  protected readonly statusInterneFilter = toSignal(
    this.statusInterneControl.valueChanges.pipe(
      startWith(this.statusInterneControl.value),
    ),
  );

  protected readonly sortField = computed(() => this.sort().sortBy);
  protected readonly sortOrder = computed(() =>
    this.sort().sortOrder === "asc" ? 1 : -1,
  );

  protected readonly totalCount = computed(
    () => this.prosResource.value()?.total ?? this.previousTotal() ?? 0,
  );

  private previousFilterSignature: string | null = null;

  private readonly filterSignature = computed(() =>
    JSON.stringify({
      term: (this.searchTerm() ?? "").trim(),
      status: this.statusFilter(),
      statusInterne: this.statusInterneFilter(),
      subscriptionActivity: this.subscriptionActivityFilter(),
    }),
  );

  private readonly resetPaginationOnFilterChange = effect(() => {
    const signature = this.filterSignature();
    if (
      this.previousFilterSignature !== null &&
      signature !== this.previousFilterSignature
    ) {
      this.page.set(0);
    }
    this.previousFilterSignature = signature;
  });

  protected readonly prosResource = resource({
    params: () => ({
      term: (this.searchTerm() ?? "").trim(),
      status: this.statusFilter() ?? null,
      statusInterne: this.statusInterneFilter() ?? null,
      subscriptionActivity: this.subscriptionActivityFilter() ?? null,
      page: this.page(),
      pageSize: this.pageSize(),
      sort: this.sort(),
    }),
    loader: async ({ params, abortSignal }) => {
      let subscriptionActivity: AdminProSubscriptionActivityFilter | null =
        null;
      let hubspotSubscription: boolean | null = null;

      if (params.subscriptionActivity === "hubspotOnly") {
        hubspotSubscription = true;
      } else {
        subscriptionActivity = params.subscriptionActivity;
      }
      const hasFilters =
        params.status !== null ||
        params.statusInterne !== null ||
        subscriptionActivity !== null ||
        hubspotSubscription !== null;

      const response = await trpcClient.pros.getAllForAdmin.query(
        {
          term: params.term.length > 0 ? params.term : null,
          page: params.page,
          pageSize: params.pageSize,
          filters: hasFilters
            ? {
                status: params.status,
                statusInterne: params.statusInterne,
                subscriptionActivity,
                hubspotSubscription,
              }
            : null,
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
    const nextField = isAdminProSortField(event.field) ? event.field : null;
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

  protected formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "Erreur inconnue";
  }

  protected handleAddCreditsClick(row: AdminProRow) {
    if (this.isRowActionPending(row.uuid)) {
      return;
    }

    void this.openAddCreditsDialog(row);
  }

  protected handleAddStripeCustomerClick(row: AdminProRow) {
    if (this.isRowActionPending(row.uuid)) {
      return;
    }

    void this.openAddStripeCustomerDialog(row);
  }

  protected openOnboardingPaymentLinksDialog() {
    void this.dialogService.open(AdminProPaymentLinksDialogComponent, {
      data: {
        links: this.onboardingPaymentLinks,
      },
    });
  }

  protected getStatusTone(row: AdminProRow) {
    if (!row.status) {
      return "neutral" as const;
    }
    if (row.status === "Actif") {
      return "ok" as const;
    }
    if (row.status === "Inactif" || row.status === "Out") {
      return "ko" as const;
    }
    return "warn" as const;
  }

  protected getInternalStatusTone(status: AdminProRow["statusInterne"]) {
    if (status === AssociationProExternalContactStatus.ARCHIVED) {
      return "neutral" as const;
    }
    if (status === AssociationProExternalContactStatus.CLOSED_WON) {
      return "ok" as const;
    }
    if (status === AssociationProExternalContactStatus.CLOSED_LOST) {
      return "ko" as const;
    }
    if (status === AssociationProExternalContactStatus.IN_PROGRESS) {
      return "warn" as const;
    }
    return "neutral" as const;
  }

  protected getInternalStatusLabel(status: AdminProRow["statusInterne"]) {
    return ExternalContactStatusLabels[status];
  }

  protected getSubscriptionLabel(row: AdminProRow) {
    return row.subscription ? SUBSCRIPTION_LABELS[row.subscription] : "Aucun";
  }

  protected getActiveSubscriptionChipLabel(row: AdminProRow) {
    if (row.hasActiveSubscription && row.subscription) {
      return SUBSCRIPTION_LABELS[row.subscription];
    }

    return "Aucun abonnement";
  }

  protected hasStripeCustomerId(row: AdminProRow) {
    return Boolean(row.stripeCustomerId?.trim());
  }

  protected hasStripeConfigurationWarning(row: AdminProRow) {
    return this.hasStripeCustomerId(row) && !row.stripeSubscriptionId?.trim();
  }

  protected getSubscriptionCreditsLabel(row: AdminProRow) {
    if (!row.subscription) {
      return "NC";
    }

    const plan = getProPlan(row.subscription);
    return plan ? String(plan.credits) : "NC";
  }

  protected isTestAccount(row: AdminProRow) {
    return Boolean(row.testAccount);
  }

  protected getDisplayedName(row: AdminProRow) {
    const name = row.name?.trim();
    if (!name) {
      return "NC";
    }

    const stripped = name.replace(this.testAccountNamePrefixRegex, "").trim();
    return stripped || "NC";
  }

  protected getActionRowIdentifier(row: AdminProRow) {
    const name = row.name?.trim();
    return name || row.uuid;
  }

  protected readonly rowActions = computed<MenuItem[]>(() => {
    const row = this.selectedRowForActions();
    if (!row) {
      return [];
    }

    const toggleTestAccountAction: MenuItem = {
      label: this.isTestAccount(row)
        ? "Définir comme réel compte"
        : "Définir comme compte de Test",
      icon: this.isTestAccount(row) ? "pi pi-verified" : "pi pi-tag",
      disabled: this.isRowActionPending(row.uuid),
      command: () => {
        void this.toggleTestAccount(row);
      },
    };

    const membersAction: MenuItem = {
      label: "Voir les membres",
      icon: "pi pi-users",
      command: () => {
        void this.openMembersDialog(row);
      },
    };
    const addCreditsAction: MenuItem = {
      label: "Ajouter des crédits",
      icon: "pi pi-plus-circle",
      disabled: this.isRowActionPending(row.uuid),
      command: () => {
        void this.openAddCreditsDialog(row);
      },
    };
    const changeStatusAction: MenuItem = {
      label: "Statut",
      icon: "pi pi-sync",
      disabled: this.isRowActionPending(row.uuid),
      command: () => {
        void this.openChangeStatusDialog(row);
      },
    };
    const defineSubmenuAction: MenuItem = {
      label: "Définir",
      icon: "pi pi-sliders-h",
      items: [changeStatusAction, toggleTestAccountAction],
    };
    const deleteProAction: MenuItem = {
      label: "Supprimer",
      icon: "pi pi-trash",
      disabled: this.isRowActionPending(row.uuid),
      command: () => {
        void this.confirmAndDeletePro(row);
      },
    };

    return [
      defineSubmenuAction,
      membersAction,
      addCreditsAction,
      deleteProAction,
    ];
  });

  protected readonly internalStatusActions = computed<MenuItem[]>(() => {
    const row = this.selectedRowForInternalStatus();
    if (!row) {
      return [];
    }

    return Object.values(AssociationProExternalContactStatus).map((status) => ({
      label: ExternalContactStatusLabels[status],
      icon: row.statusInterne === status ? "pi pi-check" : undefined,
      disabled: this.isRowActionPending(row.uuid),
      command: () => {
        void this.updateInternalStatus(row, status);
      },
    }));
  });

  private async openMembersDialog(row: AdminProRow) {
    await this.dialogService.open(AdminProMembersDialogComponent, {
      data: {
        proUuid: row.uuid,
        proName: this.getDisplayedName(row),
        proSubscription: row.subscription,
      },
      additionalClasses: ["!items-start"],
    });
  }

  private async openAddCreditsDialog(row: AdminProRow) {
    const { res: creditsToAdd } = await this.dialogService.open(
      AdminProCreditsDialogComponent,
      {
        data: { proName: this.getDisplayedName(row) },
      },
    );

    if (
      !creditsToAdd ||
      creditsToAdd <= 0 ||
      this.isRowActionPending(row.uuid)
    ) {
      return;
    }

    this.setRowActionPending(row.uuid, true);
    try {
      await trpcClient.pros.addCreditsToPro.mutate({
        proUuid: row.uuid,
        creditsToAdd,
      });
      this.prosResource.reload();
    } catch (error) {
      console.error("Erreur lors du crédit de crédits:", error);
      this.toastService.openError("Erreur lors de l'ajout de crédits", error);
    } finally {
      this.setRowActionPending(row.uuid, false);
    }
  }

  private async openAddStripeCustomerDialog(row: AdminProRow) {
    let stripePriceOptions: AdminProStripePriceOption[] = [];
    try {
      stripePriceOptions = await this.getStripePriceOptions();
    } catch (error) {
      this.toastService.openError("Chargement des abonnements Stripe", error);
      return;
    }

    if (stripePriceOptions.length === 0 && !row.stripeCurrentPlanPriceId) {
      this.toastService.open(
        "warn",
        "Aucun abonnement Stripe",
        "Impossible de charger la liste des abonnements Stripe.",
      );
      return;
    }

    const { res: stripeData } = await this.dialogService.open(
      AdminProStripeCustomerDialogComponent,
      {
        data: {
          proName: this.getDisplayedName(row),
          currentStripeCustomerId: row.stripeCustomerId,
          currentStripeSubscriptionId: row.stripeSubscriptionId,
          currentStripeCurrentPlanPriceId: row.stripeCurrentPlanPriceId,
          stripePriceOptions,
        },
      },
    );

    if (!stripeData || this.isRowActionPending(row.uuid)) {
      return;
    }

    this.setRowActionPending(row.uuid, true);
    try {
      await trpcClient.pros.updateStripeCustomerIdForAdmin.mutate({
        proUuid: row.uuid,
        stripeCustomerId: stripeData.stripeCustomerId,
        stripeSubscriptionId: stripeData.stripeSubscriptionId,
        stripeCurrentPlanPriceId: stripeData.stripeCurrentPlanPriceId,
      });
      this.toastService.open(
        "success",
        "Identifiants Stripe mis à jour",
        stripeData.stripeCustomerId,
      );
      await this.prosResource.reload();
    } catch (error) {
      this.toastService.openError("Mise à jour des identifiants Stripe", error);
    } finally {
      this.setRowActionPending(row.uuid, false);
    }
  }

  private async getStripePriceOptions(): Promise<AdminProStripePriceOption[]> {
    if (this.stripePriceOptionsCache !== null) {
      return this.stripePriceOptionsCache;
    }

    const products = await trpcClient.stripe.getProductsForAdmin.query();
    const options: AdminProStripePriceOption[] = [];
    const seenPriceIds = new Set<string>();

    for (const product of products) {
      for (const price of product.prices) {
        if (!price.active || seenPriceIds.has(price.priceId)) {
          continue;
        }
        seenPriceIds.add(price.priceId);

        options.push({
          value: price.priceId,
          label: this.buildStripePriceOptionLabel(product, price),
        });
      }
    }

    options.sort((a, b) => a.label.localeCompare(b.label, "fr"));
    this.stripePriceOptionsCache = options;
    return options;
  }

  private buildStripePriceOptionLabel(
    product: AdminStripeProductsResponse[number],
    price: AdminStripeProductsResponse[number]["prices"][number],
  ) {
    const amountLabel =
      price.unitAmount !== null && price.currency
        ? new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: price.currency.toUpperCase(),
          }).format(price.unitAmount / 100)
        : null;

    const intervalLabel = price.recurringInterval
      ? `/${this.humanizeRecurringInterval(price.recurringInterval)}`
      : "";

    if (amountLabel) {
      return `${product.productName} - ${amountLabel}${intervalLabel}`;
    }

    return `${product.productName} - ${price.priceId}`;
  }

  private humanizeRecurringInterval(interval: string) {
    if (interval === "month") {
      return "mois";
    }
    if (interval === "year") {
      return "an";
    }
    if (interval === "week") {
      return "semaine";
    }
    if (interval === "day") {
      return "jour";
    }
    return interval;
  }

  private async toggleTestAccount(row: AdminProRow) {
    if (this.isRowActionPending(row.uuid)) {
      return;
    }

    this.setRowActionPending(row.uuid, true);
    try {
      if (this.isTestAccount(row)) {
        await trpcClient.pros.unsetAsTestAccount.mutate({ proUuid: row.uuid });
      } else {
        await trpcClient.pros.setAsTestAccount.mutate({ proUuid: row.uuid });
      }
      await this.prosResource.reload();
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du statut compte test:",
        error,
      );
      this.toastService.openError("Mise à jour du compte de test", error);
    } finally {
      this.setRowActionPending(row.uuid, false);
    }
  }

  private async openChangeStatusDialog(row: AdminProRow) {
    const { res: nextStatus } = await this.dialogService.open(
      AdminProStatusDialogComponent,
      {
        data: {
          proName: this.getDisplayedName(row),
          currentStatus: row.status,
        },
      },
    );

    if (!nextStatus || nextStatus === row.status) {
      return;
    }

    this.setRowActionPending(row.uuid, true);
    try {
      await trpcClient.pros.updateStatusForAdmin.mutate({
        proUuid: row.uuid,
        status: nextStatus,
      });
      this.toastService.open("success", "Statut mis à jour", nextStatus);
      await this.prosResource.reload();
    } catch (error) {
      this.toastService.openError("Mise à jour du statut", error);
    } finally {
      this.setRowActionPending(row.uuid, false);
    }
  }

  private async updateInternalStatus(
    row: AdminProRow,
    nextStatus: AssociationProExternalContactStatus,
  ) {
    if (this.isRowActionPending(row.uuid) || row.statusInterne === nextStatus) {
      return;
    }

    this.setRowActionPending(row.uuid, true);
    try {
      await trpcClient.pros.updateInternalStatusForAdmin.mutate({
        proUuid: row.uuid,
        statusInterne: nextStatus,
      });
      this.toastService.open(
        "success",
        "Status interne mis à jour",
        ExternalContactStatusLabels[nextStatus],
      );
      await this.prosResource.reload();
    } catch (error) {
      this.toastService.openError("Mise à jour du status interne", error);
    } finally {
      this.setRowActionPending(row.uuid, false);
    }
  }

  private async confirmAndDeletePro(row: AdminProRow) {
    if (this.isRowActionPending(row.uuid)) {
      return;
    }

    const { res: confirmed } = await this.dialogService.open(
      DialogConfirmationComponent,
      {
        data: {
          icon: "company",
          title: "Supprimer ce pro ?",
          description: this.buildDeleteConfirmationDescription(row),
          action: "Confirmer la suppression",
          cancelButtonLabel: "Annuler",
          actionColor: "danger",
        },
      },
    );

    if (!confirmed) {
      return;
    }

    this.setRowActionPending(row.uuid, true);
    try {
      const result = await trpcClient.pros.deleteForAdmin.mutate({
        proUuid: row.uuid,
      });

      if (result.authDeletionErrors.length > 0) {
        this.toastService.open(
          "warn",
          "Suppression partielle",
          `Pro supprimé. ${result.deletedContactsCount} membre(s) non-Optee supprimé(s), mais ${result.authDeletionErrors.length} compte(s) utilisateur n'ont pas pu être supprimés.`,
        );
      } else {
        this.toastService.open(
          "success",
          "Suppression effectuée",
          `Pro supprimé avec ${result.deletedContactsCount} membre(s) non-Optee.`,
        );
      }

      await this.prosResource.reload();
    } catch (error) {
      this.toastService.openError("Suppression du pro", error);
    } finally {
      this.setRowActionPending(row.uuid, false);
    }
  }

  private buildDeleteConfirmationDescription(row: AdminProRow) {
    const proName = this.getDisplayedName(row);
    const nonOpteeMembersEstimate = row.nonOpteeContactsCount;

    return [
      `Vous allez supprimer définitivement le pro "${proName}".`,
      "",
      "Process appliqué :",
      `- Suppression du pro et de ses relations (abonnements/associations).`,
      `- Suppression des membres non-Optee rattachés (estimation actuelle: ${nonOpteeMembersEstimate}).`,
      "- Suppression de leurs accès plateforme lorsque possible.",
      "- Les membres Optee ne sont pas supprimés.",
      "",
      "Cette action est irréversible.",
    ].join("\n");
  }

  protected isRowActionPending(proUuid: AdminProRow["uuid"]) {
    return Boolean(this.rowActionsPendingByProUuid()[proUuid]);
  }

  private setRowActionPending(
    proUuid: AdminProRow["uuid"],
    isPending: boolean,
  ) {
    const key = proUuid as string;
    this.rowActionsPendingByProUuid.update((prev) => ({
      ...prev,
      [key]: isPending,
    }));
  }
}

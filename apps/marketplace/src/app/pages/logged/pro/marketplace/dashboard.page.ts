import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  model,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import type {
  InvoicePhaseLabelPro,
  OperationHubspotCategory,
  OperationPhaseLabelPro,
} from "@optee/constants";
import { CTA, PRO_LOCATION_ASSOCIATIONS } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconPlusComponent,
  IconRefreshComponent,
  IconSearchComponent,
} from "@optee/icons";
import type { OperationRow, QuoteUuid } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { OperationsFilterComponent } from "@optee/ui/components/organisms/operations-filter/operations-filter.component";
import { isNotNullish } from "@optee/utils";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { TabsModule } from "primeng/tabs";
import { TooltipModule } from "primeng/tooltip";
import { filter, map, shareReplay } from "rxjs";
import { z } from "zod";
import { NewOperationByProComponent } from "../../../../components/operation/new-operation-by-pro/new-operation-by-pro.component";
import { OperationsListComponent } from "../../../../components/operation/operation-list/operations-list.component";
import type { OperationListColumn } from "../../../../components/operation/operations-group-row/operations-group-row.component";
import { AuthService } from "../../../../services/auth.service";
import { LocalStorageService } from "../../../../services/local-storage.service";
import { OperationService } from "../../../../services/operation.service";
import { ProService } from "../../../../services/pro.service";

const dashboardTabs = z.enum(["deals", "locations"]);

@Component({
  selector: "mkp-pro-dashboard",
  host: {
    class: "max-w-app flex flex-col gap-8 m-auto p-4 xl:p-10",
  },
  template: `
    <oui-eve class="flex flex-col gap-4">
      <div class="flex justify-between gap-4">
        <p class="mb-4 text-sm text-gray-600">
          Visualisez vos projets, suivez les étapes clés et organisez vos
          interventions efficacement
        </p>
        <span
          [class.cursor-pointer]="isProAllowedToCreateProject()"
          [pTooltip]="isNewProjectDisabled() ? noClientsTooltip : undefined"
        >
          <oui-button
            variant="primary"
            (click)="newProject()"
            [disabled]="isNewProjectDisabled()"
          >
            <icon-plus class="size-5" />
            {{ CTA.createClientProject }}
          </oui-button>
        </span>
      </div>
      @if (operations$ | async; as operations) {
        <mkp-operations-list
          [activeOperationTypes]="activeOperationTypes()"
          [activePhaseFilter]="activeOperationPhase()"
          [operations]="(operations$ | async) ?? []"
          [searchValue]="activeSearchTerm()"
          [selectedLocationUuid]="operationService.activeLocationUuid() ?? null"
          [visibleColumns]="visibleColumns"
        >
          <p-iconfield class="w-80" afterTitle>
            <p-inputicon class="size-4">
              <icon-search />
            </p-inputicon>

            <input
              class="p-inputnumber-gray"
              fluid
              pInputText
              placeholder="Rechercher une opération"
              role="searchbox"
              type="search"
              variant="filled"
              [(ngModel)]="activeSearchTerm"
            />
          </p-iconfield>

          <oui-operations-filter
            hideCount
            underTitle
            [(activeOperationTypes)]="activeOperationTypes"
          />
        </mkp-operations-list>
      } @else {
        <div class="flex w-full items-center justify-center gap-2 py-3">
          <icon-refresh class="size-5 animate-spin" />
          <p class="text-lg font-medium">
            Chargement de vos projets en cours …
          </p>
        </div>
      }
    </oui-eve>
  `,
  imports: [
    OperationsListComponent,
    AsyncPipe,
    RouterModule,
    OperationsFilterComponent,
    TooltipModule,
    IconSearchComponent,
    FormsModule,
    InputText,
    IconField,
    InputIcon,
    IconRefreshComponent,
    EveComponent,
    TabsModule,
    ButtonComponent,
    IconPlusComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardProComponent {
  protected readonly operationService = inject(OperationService);
  protected readonly authService = inject(AuthService);
  protected readonly proService = inject(ProService);
  protected readonly localStorageService = inject(LocalStorageService);
  private readonly dialogService = inject(DialogService);

  readonly activeOperationTypes = model<OperationHubspotCategory[] | null>(
    null,
  );

  protected readonly isOpteeAdmin = computed(() =>
    this.authService.isAdminOptee(),
  );

  readonly activeTab = linkedSignal<"deals" | "locations">(() => {
    const savedTab = this.localStorageService.safeGet(
      "proDashboardTab",
      dashboardTabs,
    );
    return savedTab ?? "locations";
  });

  readonly setActiveTab = effect(() => {
    const next = this.activeTab();
    if (
      this.localStorageService.safeGet("proDashboardTab", dashboardTabs) !==
      next
    ) {
      this.localStorageService.set("proDashboardTab", next);
    }
  });

  protected readonly isProAllowedToCreateProject = computed(
    () => this.authService.isLoggedAsPro() && this.proService.proHasClients(),
  );

  protected readonly activeSearchTerm = signal<string>("");
  protected readonly activeSearchAddressTerm = model<string>("");

  protected readonly activeOperationPhase = signal<
    OperationPhaseLabelPro | InvoicePhaseLabelPro | null
  >(null);

  protected readonly CTA = CTA;
  protected readonly PRO_LOCATION_ASSOCIATIONS = PRO_LOCATION_ASSOCIATIONS;

  protected readonly noClientsTooltip =
    "Vous n’avez pas encore été mis en relation avec des clients. Contactez notre équipe pour en savoir plus.";

  protected readonly isNewProjectDisabled = computed(
    () => this.authService.isLoggedAsPro() && !this.proService.proHasClients(),
  );

  protected readonly operations$ = this.operationService.all$.pipe(
    filter(isNotNullish),
    map((rows) =>
      rows.map((item) => {
        const op = item.operation as OperationRow & {
          missingProQuoteUuid: QuoteUuid | null;
        };
        op.missingProQuoteUuid = item.missingProQuoteUuid;
        return op;
      }),
    ),
    shareReplay(1),
  );

  protected readonly visibleColumns: OperationListColumn[] = [
    "sortableCost",
    "sortablePhase",
    "sortableFunding",
    "clientName",
  ];

  protected readonly locationGroups = [
    {
      heading: "Bâtiments débloqués",
      associationTypes: [PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.label],
      emptyListMessage: {
        title: "Aucun bâtiment disponible pour le moment",
        description:
          "Vous n’avez pas encore débloqué de bâtiment. Commencez ou continuez votre prospection pour accéder aux données détaillées des bâtiments ciblés.",
      },
      showDropDown: false,
    },
    {
      heading: "Bâtiments en attente de validation",
      associationTypes: [PRO_LOCATION_ASSOCIATIONS.INTERESTED.label],
      emptyListMessage: {
        title: "Aucun bâtiment en attente",
        description:
          "Vous n’avez actuellement aucun bâtiment en cours de validation. Commencez ou continuez votre prospection pour accéder aux données détaillées des bâtiments ciblés.",
      },

      showDropDown: true,
    },
    {
      heading: "Bâtiments favoris",
      associationTypes: [PRO_LOCATION_ASSOCIATIONS.SAVED.label],
      emptyListMessage: {
        title: "Aucun bâtiment enregistré",
        description:
          "Vous n’avez pas encore ajouté de bâtiment à vos favoris. Enregistrez ceux qui vous intéressent pour les retrouver facilement plus tard.",
      },

      showDropDown: true,
    },
  ];

  protected newProject() {
    this.dialogService.open(NewOperationByProComponent, {
      data: {
        redirectToDashboard: true,
      },
    });
  }
}

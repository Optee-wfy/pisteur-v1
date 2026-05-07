import { DatePipe, DecimalPipe } from "@angular/common";
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
import { FormsModule } from "@angular/forms";
import type {
  LocationFilterPro,
  ProLocationAssociationLabel,
} from "@optee/constants";
import {
  operationsEmail,
  PRO_LOCATION_ASSOCIATIONS,
  ProSubscription,
} from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconBadgeCheckComponent,
  IconCirclePlusComponent,
  IconInfoComponent,
} from "@optee/icons";
import { Location } from "@optee/models";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";

import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { PrettifyPipe } from "@optee/ui/pipes/prettify.pipe";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import { PaginatorModule } from "primeng/paginator";
import { Tooltip } from "primeng/tooltip";
import trpcClient from "../../../../trpc-client";
import { CyclopeMode, CyclopeService } from "../../../services/cyclope.service";
import { ProService } from "../../../services/pro.service";
import { LocationOperationSimulatorDialogComponent } from "../../pro/cyclope/contacts-tab/location-operation-simulator.dialog";

@Component({
  selector: "mkp-location-pro-group",
  host: {
    class: "flex h-full flex-1 flex-col gap-2 p-4",
  },
  template: `
    <header class="flex flex-wrap items-center justify-between gap-6">
      @if (heading()) {
        <oui-title-tight
          fixedFontSize
          [value]="totalCount() ?? (locations.isLoading() ? '--' : 0)"
        >
          {{ heading() }}
        </oui-title-tight>
      }

      <div class="flex flex-1 items-center justify-between gap-4">
        @if (showSimulateBtn()) {
          <oui-button
            class="ml-auto"
            variant="primary"
            (click)="launchSimulation()"
          >
            Simuler sur une adresse connue
          </oui-button>
        }
      </div>
    </header>

    <section
      class="relative flex-1 px-4 py-2"
      [class.scrollable-shadow-zone]="scrollableTable()"
    >
      @if (locations.isLoading() || !filters()) {
        <oui-loader label="Recherche de bâtiments..." />
      } @else {
        @if (totalCount() ?? 0 > 0) {
          <table class="w-full flex-1">
            <thead
              class="font-display text-left text-sm tracking-tight text-gray-600"
            >
              <tr>
                <td></td>
                <td>Adresse</td>
                <td>Type</td>
                <td>DPE</td>
                <td>SHON</td>
                <td>Lots</td>
                <td>Étages</td>
                <td>Année</td>
                <td><abbr title="Département">Dpt.</abbr></td>
                <td class="pr-2"></td>
              </tr>
            </thead>

            <tbody>
              @for (
                row of locations.value()?.locations ?? [];
                track row.location.uuid
              ) {
                @let location = row.location;
                <tr>
                  <td>
                    @if (row.type === "optee") {
                      <icon-badge-check
                        class="size-9"
                        pTooltip="Bâtiments Optee"
                      />
                    }
                  </td>
                  <td class="text-primary-900 text-sm">
                    <p class="w-52 truncate text-base font-semibold">
                      {{ location.shortAddress | prettify }}
                    </p>

                    {{ location.zipcode }}
                    {{ location.city | prettify }}
                  </td>
                  <td>
                    <span class="block max-w-xs">
                      {{ location.mainSectorLabel ?? "NC" }}
                    </span>
                  </td>
                  <td>
                    <oui-dpe-label [letter]="location.dpeLabel ?? 'NC'" />
                  </td>
                  <td>
                    {{
                      location.surfaceThatRequiresHeating
                        ? (location.surfaceThatRequiresHeating
                            | number: "1.0-0") + " m²"
                        : "NC"
                    }}
                  </td>
                  <td>
                    {{
                      location.nbUnits
                        ? location.nbUnits +
                          " lot" +
                          (location.nbUnits > 1 ? "s" : "")
                        : "NC"
                    }}
                  </td>
                  <td class="text-center">
                    {{ location.nbStoreys ?? "NC" }}
                  </td>
                  <td>
                    {{
                      location.creationDate
                        ? (location.creationDate | date: "yyyy")
                        : "NC"
                    }}
                  </td>
                  <td>
                    {{ (location.department ?? location.zipcode).slice(0, 2) }}
                  </td>
                  <td class="pr-2">
                    <div class="flex justify-end gap-2">
                      @let actionTooltip =
                        !hasImpactSubscription()
                          ? "Débloquez cette fonctionnalité en passant à l'abonnement Impact ! Contactez-nous sur " +
                            operationsEmail
                          : row.hasNoActiveAssociations
                            ? "Acheter le contact"
                            : "Plus d'informations";

                      <span tooltipPosition="left" [pTooltip]="actionTooltip">
                        <oui-button-icon
                          (click)="
                            openCyclope(location, row.hasNoActiveAssociations)
                          "
                          [class.text-primary-500]="
                            !row.hasNoActiveAssociations
                          "
                          [disabled]="!hasImpactSubscription()"
                          [variant]="
                            row.hasNoActiveAssociations ? 'primary' : 'standard'
                          "
                        >
                          @if (row.hasNoActiveAssociations) {
                            <icon-circle-plus class="size-5" />
                          } @else {
                            <icon-info class="size-5" />
                          }
                        </oui-button-icon>
                      </span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <oui-message
            class="my-1"
            severity="info"
            [summary]="emptyListMessage().title"
          >
            <p>{{ emptyListMessage().description }}</p>
          </oui-message>
        }
      }
    </section>

    @if ((totalCount() ?? 1) > 0) {
      <p-paginator
        (onPageChange)="onPageChange($event)"
        [first]="page() * pageSize()"
        [rows]="pageSize()"
        [rowsPerPageOptions]="showPerPageOptions() ? [10, 20, 50] : undefined"
        [showFirstLastIcon]="false"
        [totalRecords]="totalCount()"
      />
    }
  `,
  styles: `
    :host {
      td {
        padding: 0.5rem 0.75rem;
      }
      thead td {
        @apply relative box-content select-none truncate px-4 py-2 font-normal;
      }
      tbody {
        @apply border-primary-700 rounded-lg border-l-4;
        td {
          @apply border-y border-gray-300 align-middle;
        }
      }
    }
  `,
  imports: [
    DpeLabelComponent,
    ButtonComponent,
    ButtonIconComponent,
    TitleTightComponent,
    MessageComponent,
    IconBadgeCheckComponent,
    IconInfoComponent,
    IconCirclePlusComponent,
    LoaderComponent,
    DatePipe,
    DecimalPipe,
    Tooltip,
    PaginatorModule,
    FormsModule,
    PrettifyPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationProGroupComponent {
  readonly filters = input<LocationFilterPro | null>(null);
  readonly heading = input<string>();
  readonly showPerPageOptions = input<boolean>(true);
  readonly emptyListMessage = input<{ title: string; description: string }>({
    title: "Aucun bâtiment trouvé",
    description: "Aucun bâtiment trouvé avec vos critères de recherche.",
  });

  readonly showSimulateBtn = input(false, { transform: booleanAttribute });
  readonly scrollableTable = input(false, { transform: booleanAttribute });

  readonly pageSize = model(20);

  protected readonly page = signal(0);
  protected readonly previousTotal = signal<number | null>(null);

  protected readonly proService = inject(ProService);
  protected readonly cyclopeService = inject(CyclopeService);
  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(DialogService);

  protected readonly PRO_LOCATION_ASSOCIATIONS = PRO_LOCATION_ASSOCIATIONS;
  protected readonly operationsEmail = operationsEmail;
  protected readonly CyclopeMode = CyclopeMode;
  private readonly connectedRelation = new Set<ProLocationAssociationLabel>([
    PRO_LOCATION_ASSOCIATIONS.INTERESTED.label,
    PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.label,
  ]);

  protected readonly hasImpactSubscription = computed(
    () => this.proService.subscription() === ProSubscription.IMPACT,
  );

  protected readonly locations = resource({
    params: () => ({
      page: this.page(),
      pageSize: this.pageSize(),
      filters: {
        ...(this.filters() ?? {}),
      },
    }),
    loader: async ({ params }) => {
      if (!params.filters) {
        return {
          count: 0,
          locations: [],
        };
      }

      try {
        const response = await trpcClient.locations.getAllPaginatedForPro.query(
          {
            page: params.page,
            pageSize: params.pageSize,
            ...params.filters,
          },
        );

        this.previousTotal.set(response.total);
        return {
          count: response.total,
          locations: response.items
            .map((item) => {
              const location = Location.init(item.location);
              if (!location) {
                return null;
              }

              return {
                location,
                hasNoActiveAssociations: item.associations.every(
                  (assoc) => !this.connectedRelation.has(assoc),
                ),
                type: "optee" as const,
              };
            })
            .filter(isNotNullish),
        };
      } catch (error) {
        this.toastService.openError("Récupération des bâtiments.", error);
        return { count: 0, locations: [] };
      }
    },
  });

  protected readonly totalCount = computed(
    () => this.locations.value()?.count ?? this.previousTotal(),
  );

  protected readonly onFilterChange = effect(() => {
    if (this.filters()) {
      this.page.set(0);
    }
  });

  protected onPageChange(event: { page?: number; rows?: number }) {
    this.pageSize.set(event.rows ?? 5);
    this.page.set(event.page ?? 0);
  }

  protected launchSimulation() {
    this.dialogService.open(LocationOperationSimulatorDialogComponent);
  }

  openCyclope(location: Location, hasNoActiveAssociations: boolean) {
    this.cyclopeService.openCyclope({
      mode: CyclopeMode.PROSPECT,
      locationUuid: location.uuid,
      activeTab: hasNoActiveAssociations ? "contacts" : undefined,
    });
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  resource,
  signal,
} from "@angular/core";
import {
  getLegalEntityOccupancyStatus,
  nafToCategoryLabel,
} from "@optee/constants";
import { IconChevronRightComponent, IconPersonComponent } from "@optee/icons";
import type { LegalEntity } from "@optee/models";
import { Tooltip } from "primeng/tooltip";
import trpcClient from "../../../../../../trpc-client";
import { LegalEntityTypeChipComponent } from "../../../../../components/shared/legal-entity-type-chip/legal-entity-type-chip.component";
import { LegalEntityContactsTableComponent } from "../../external-contacts/legal-entity-contacts-table/legal-entity-contacts-table.component";
import { SolicitationIndicatorComponent } from "../../solicitation-indicator/solicitation-indicator.component";
import { OccupancyStatusComponent } from "../occupancy-status/occupancy-status.component";

@Component({
  selector: "mkp-legal-entity-card",
  host: {
    class: "mx-auto flex h-full w-full",
  },
  template: `
    <div
      class="flex h-full w-full flex-col gap-6 rounded-2xl border p-6 transition-colors"
      [class.bg-[#F4F7FB]]="!active()"
      [class.bg-green-50]="active()"
      [class.border-[#D8E0EB]]="!active()"
      [class.border-green-500]="active()"
      [class.hover:border-green-400]="selectable()"
    >
      <header class="flex flex-col gap-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <h3 class="text-granite-900 text-2xl font-semibold leading-tight">
              {{ legalEntity().name }}
            </h3>
            <mkp-legal-entity-type-chip [type]="legalEntity().type" />
          </div>

          <mkp-solicitation-indicator
            displayMode="chip"
            entityType="company"
            suffix="sollicitation"
            [count]="nbRelatedPros()"
          />
        </div>

        @if (occupancyStatus()) {
          <mkp-occupancy-status [status]="occupancyStatus()" />
        }
      </header>
      <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        @for (data of metrics(); track data.key) {
          <div class="flex min-w-0 flex-col gap-1">
            <span class="text-sm font-medium text-[#54657F]">
              {{ data.label }}
            </span>

            @if (data.value !== null && data.value !== undefined) {
              <span class="text-granite-900 break-words text-xl font-semibold">
                {{ data.value }}
              </span>
            } @else {
              <span class="text-granite-400 text-xl italic">--</span>
            }
          </div>
        }
      </div>

      <div class="h-px bg-[#D8E0EB]"></div>

      <button
        class="flex w-full items-center gap-4 rounded-xl border border-[#1E6AE1] bg-white px-4 py-2 text-left text-black transition-colors hover:bg-blue-50"
        type="button"
        (click)="toggleMembers()"
      >
        <icon-person class="size-4 shrink-0" />
        <span class="font-medium leading-tight">Voir les contacts clés</span>
        @if (resolvedMembersCount() !== null) {
          <span
            class="flex items-center justify-center rounded-md bg-[#2F6BFF] px-3 py-1 text-white"
          >
            {{ resolvedMembersCount() }}
          </span>
        }
        <icon-chevron-right
          class="ml-auto size-4 shrink-0 origin-center transition-transform duration-200"
          [class.-rotate-90]="!membersOpen()"
          [class.rotate-90]="membersOpen()"
        />
      </button>

      @if (membersOpen()) {
        <section class="rounded-xl border border-[#D8E0EB] bg-white p-4">
          <mkp-legal-entity-contacts-table
            class="-mx-2 overflow-auto"
            (membersCountLoaded)="membersCount.set($event)"
            [legalEntityUuid]="legalEntity().uuid"
            [size]="contactsTableSize()"
          />
        </section>
      }
    </div>
  `,
  imports: [
    Tooltip,
    IconChevronRightComponent,
    IconPersonComponent,
    LegalEntityTypeChipComponent,
    LegalEntityContactsTableComponent,
    OccupancyStatusComponent,
    SolicitationIndicatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntityCardComponent {
  readonly legalEntity = input.required<LegalEntity>();
  readonly nbRelatedLocations = input<number | null>(null);
  readonly nbRelatedPros = input<number | null>(null);
  readonly active = input(false);
  readonly selectable = input(true);
  readonly contactsTableSize = input<"small" | "medium" | "large">("medium");

  protected readonly membersOpen = signal(false);
  protected readonly membersCount = signal<number | null>(null);
  protected readonly membersCountResource = resource({
    params: () => this.legalEntity().uuid,
    loader: async ({ params: legalEntityUuid }) => {
      try {
        return await trpcClient.legalEntities.getMembersCount.query(
          legalEntityUuid,
        );
      } catch {
        return null;
      }
    },
  });

  protected readonly resolvedMembersCount = computed(
    () => this.membersCount() ?? this.membersCountResource.value() ?? null,
  );

  protected readonly metrics = computed(() => {
    const entity = this.legalEntity();
    const nbRelatedLocations = this.nbRelatedLocations();

    return [
      {
        key: "employeesCount",
        label: "Salariés",
        value: entity.nbEmployeesRange,
        tooltip: "Taille de l'entreprise",
      },
      {
        key: "nbRelatedLocations",
        label: "Adresses",
        value: nbRelatedLocations ?? undefined,
        tooltip: "Nombre d'adresses associées",
      },
      {
        key: "naf",
        label: "Code NAF",
        value: entity.mainBusinessActivity,
        tooltip: "Code NAF principal",
      },
      {
        key: "mainBusinessActivity",
        label: "Activité",
        value: entity.mainBusinessActivity
          ? nafToCategoryLabel(entity.mainBusinessActivity)
          : undefined,
        tooltip: "Activité principale",
      },
    ] as const satisfies readonly {
      key: string;
      label: string;
      value?: unknown | undefined;
      tooltip?: string;
    }[];
  });

  protected readonly occupancyStatus = computed(() =>
    getLegalEntityOccupancyStatus(this.legalEntity()),
  );

  protected toggleMembers() {
    this.membersOpen.update((value) => !value);
  }
}

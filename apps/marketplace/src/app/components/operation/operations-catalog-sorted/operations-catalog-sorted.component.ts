import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { IconInfoComponent } from "@optee/icons";
import type { Operation } from "@optee/models";
import { OperationRow } from "@optee/models";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import { CarouselModule } from "primeng/carousel";
import { Tooltip } from "primeng/tooltip";
import { LocationService } from "../../../services/location.service";
import { OperationCardComponent } from "../operation-card/operation-card.component";

type SortOption = {
  slug: string;
  label: string;
  tooltipLabel: string;
  tooltipDescription: string;
  getValueToSortBy: {
    isAscending: boolean;
    value: (operation: Operation) => number | null;
  };
  getSecondValueToSortBy?: {
    isAscending: boolean;
    value: (operation: Operation) => number | null;
  };
};

const SORT_OPTIONS: SortOption[] = [
  {
    slug: "estimatedPaybackPeriod",
    label: "Les opérations avec le meilleur rendement",
    tooltipLabel: "Opérations classées du ROI le plus rapide au plus long",
    tooltipDescription:
      "Le ROI, exprimé ici en temps, représente le nombre d’années nécessaires pour rentabiliser une opération grâce aux économies d’énergie réalisées.",
    getValueToSortBy: {
      isAscending: true,
      value: (operation: Operation) => {
        return operation.estimatedPaybackPeriod;
      },
    },
  },
  {
    slug: "funding",
    label: "Les mieux financées",
    tooltipLabel:
      "Opérations classées selon le rapport “Subvention” / “Coût des travaux",
    tooltipDescription:
      "Ce rapport mesure la part des travaux couverte par les subventions. Plus il est élevé, plus l’aide financière est importante par rapport au coût total des travaux.",
    getValueToSortBy: {
      isAscending: false,
      value: (operation: Operation) => {
        if (!operation.funding.value || !operation.cost.value) {
          return null;
        }
        return operation.funding.value / operation.cost.value;
      },
    },
    getSecondValueToSortBy: {
      isAscending: false,
      value: (operation: Operation) => operation.funding.value ?? 0,
    },
  },
  {
    slug: "estimatedEnergyImpact",
    label: "Les plus impactantes",
    tooltipLabel:
      "Opérations classées selon l’économie d’électricité annuelle réalisée",
    tooltipDescription:
      "Ce classement met en avant l’économie d’électricité annuelle générée par chaque opération, de la plus grande à la plus faible.",
    getValueToSortBy: {
      isAscending: false,
      value: (operation: Operation) => operation.estimatedEnergyImpact,
    },
  },
];

@Component({
  selector: "mkp-operations-catalog-sorted",
  host: {
    class: "flex flex-col gap-4",
  },
  template: `
    <div class="text-primary-900 font-display flex justify-between">
      <div class="flex items-center gap-2">
        <oui-title-tight>
          {{ title() }}
        </oui-title-tight>

        <icon-info
          class="text-primary-700 size-5 cursor-pointer !text-lg"
          tooltipPosition="right"
          tooltipStyleClass="p-tooltip--reset"
          [fitContent]="false"
          [pTooltip]="toolTipContent"
        />
        <ng-template #toolTipContent>
          <oui-message
            class="w-96"
            severity="info"
            [summary]="sortOption().tooltipLabel"
          >
            {{ sortOption().tooltipDescription }}
          </oui-message>
        </ng-template>
      </div>
      <button
        class="text-primary-700 hover:text-primary-800 cursor-pointer text-sm font-medium underline"
        (click)="clickSeeAll.emit()"
      >
        Voir tout
      </button>
    </div>

    <!-- Si on veut activer le fade out sur les côtés -->
    <!-- contentClass="p-carousel-content-container--withFadeSides" -->
    <p-carousel
      class="optee-carousel"
      [nextButtonProps]="navigatorButtonsProps"
      [numScroll]="2"
      [numVisible]="4"
      [prevButtonProps]="navigatorButtonsProps"
      [responsiveOptions]="responsiveOptions"
      [value]="sortedOperations()"
    >
      <ng-template #item let-row>
        @if (asOperationRow(row); as operation) {
          <mkp-operation-card
            class="mx-auto h-96 shrink-0 md:mx-2 lg:max-w-80"
            [operation]="operation"
          />
        }
      </ng-template>
    </p-carousel>
  `,
  imports: [
    OperationCardComponent,
    IconInfoComponent,
    TitleTightComponent,
    CarouselModule,
    Tooltip,
    MessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsCatalogSortedComponent {
  clickSeeAll = output();

  operations = input.required<OperationRow[]>();
  sortProperty = input.required<SortOption["slug"]>();

  protected readonly locationService = inject(LocationService);
  protected readonly toastService = inject(ToastService);

  protected readonly responsiveOptions = [
    {
      breakpoint: "1536px",
      numVisible: 4,
      numScroll: 2,
    },
    {
      breakpoint: "1280px",
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: "1024px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "768px",
      numVisible: 1,
      numScroll: 1,
    },
  ];

  protected readonly navigatorButtonsProps = {
    severity: "primary",
    rounded: true,
    text: false,
  } as const;

  sortOption = computed(() => {
    const sortOption = SORT_OPTIONS.find(
      (sortOption) => sortOption.slug === this.sortProperty(),
    );
    if (!sortOption) {
      throw new Error(`Invalid sort property: ${this.sortProperty()}`);
    }

    return sortOption;
  });

  title = computed(() => this.sortOption()?.label ?? "");

  sortedOperations = computed(() => {
    return this.operations()
      .filter(isNotNullish)
      .filter(
        (operation) =>
          this.sortOption().getValueToSortBy.value(operation) !== null,
      )
      .sort((a, b) => {
        const fallbackValue = this.sortOption().getValueToSortBy.isAscending
          ? Infinity
          : -Infinity;
        const aPrimaryValue =
          this.sortOption().getValueToSortBy.value(a) ?? fallbackValue;
        const bPrimaryValue =
          this.sortOption().getValueToSortBy.value(b) ?? fallbackValue;

        if (aPrimaryValue !== bPrimaryValue) {
          return this.sortOption().getValueToSortBy.isAscending
            ? aPrimaryValue - bPrimaryValue
            : bPrimaryValue - aPrimaryValue;
        }

        const secondarySort = this.sortOption().getSecondValueToSortBy;

        if (secondarySort) {
          const aSecondaryValue = secondarySort.value(a) ?? 0;
          const bSecondaryValue = secondarySort.value(b) ?? 0;

          return secondarySort.isAscending
            ? aSecondaryValue - bSecondaryValue
            : bSecondaryValue - aSecondaryValue;
        }

        return 0;
      })
      .slice(0, 30);
  });

  asOperationRow(row: unknown) {
    if (row instanceof OperationRow) {
      return row;
    }
    throw new Error("Invalid row");
  }
}

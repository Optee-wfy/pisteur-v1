import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from "@angular/core";
import { X_FACTOR_LABELS } from "@optee/constants";
import { IconPlotComponent } from "@optee/icons";
import type { Location } from "@optee/models";
import type { PaginatorState } from "primeng/paginator";
import { PaginatorModule } from "primeng/paginator";
import { LocationsGroupHeadComponent } from "../locations-group-head/locations-group-head.component";
import type { LocationListColumn } from "../locations-group-row-admin/locations-group-row-admin.component";
import { LocationsGroupRowAdminComponent } from "../locations-group-row-admin/locations-group-row-admin.component";

@Component({
  selector: "mkp-locations-group-admin",
  template: `
    <div
      class="z-1 pointer-events-none relative flex items-baseline justify-between py-2"
    >
      <div class="text-lg font-display font-medium {{ textColor() }}">
        <ng-content />
      </div>
    </div>

    @if (totalLocations() > 0) {
      <table class="table-fixed">
        <thead
          class="font-display sticky top-0 z-10 bg-white text-left text-sm tracking-tight text-gray-600"
        >
          <tr>
            <th class="box-content w-[200px]">Adresse</th>

            @if (visibleColumns().includes("bdnbFailureEmoji")) {
              <mkp-locations-group-head
                class="w-[60px]"
                criteria="bdnbFailureEmoji"
                (click)="toggleSort('bdnbFailureEmoji')"
                [sortCriteria]="sortCriteria()"
                [sortCriteriaDirection]="sortCriteriaDirection()"
              >
                BDNB
              </mkp-locations-group-head>
            }

            @if (visibleColumns().includes("surfaceArea")) {
              <mkp-locations-group-head
                class="w-[100px]"
                criteria="surfaceArea"
                (click)="toggleSort('surfaceArea')"
                [sortCriteria]="sortCriteria()"
                [sortCriteriaDirection]="sortCriteriaDirection()"
              >
                {{ X_FACTOR_LABELS.surfaceArea }}
              </mkp-locations-group-head>
            }

            @if (visibleColumns().includes("facadeArea")) {
              <mkp-locations-group-head
                class="w-[100px]"
                criteria="facadeArea"
                (click)="toggleSort('facadeArea')"
                [sortCriteria]="sortCriteria()"
                [sortCriteriaDirection]="sortCriteriaDirection()"
              >
                {{ X_FACTOR_LABELS.facadeArea }}
              </mkp-locations-group-head>
            }

            @if (visibleColumns().includes("glazingArea")) {
              <mkp-locations-group-head
                class="w-[100px]"
                criteria="glazingArea"
                (click)="toggleSort('glazingArea')"
                [sortCriteria]="sortCriteria()"
                [sortCriteriaDirection]="sortCriteriaDirection()"
              >
                {{ X_FACTOR_LABELS.glazingArea }}
              </mkp-locations-group-head>
            }

            @if (visibleColumns().includes("nbStoreys")) {
              <mkp-locations-group-head
                class="w-[100px]"
                criteria="nbStoreys"
                (click)="toggleSort('nbStoreys')"
                [sortCriteria]="sortCriteria()"
                [sortCriteriaDirection]="sortCriteriaDirection()"
              >
                {{ X_FACTOR_LABELS.nbStoreys }}
              </mkp-locations-group-head>
            }

            @if (visibleColumns().includes("nbUnits")) {
              <mkp-locations-group-head
                class="w-[100px]"
                criteria="nbUnits"
                (click)="toggleSort('nbUnits')"
                [sortCriteria]="sortCriteria()"
                [sortCriteriaDirection]="sortCriteriaDirection()"
              >
                {{ X_FACTOR_LABELS.nbUnits }}
              </mkp-locations-group-head>
            }

            @if (visibleColumns().includes("nbBuildings")) {
              <mkp-locations-group-head
                class="w-[100px]"
                criteria="nbBuildings"
                (click)="toggleSort('nbBuildings')"
                [sortCriteria]="sortCriteria()"
                [sortCriteriaDirection]="sortCriteriaDirection()"
              >
                {{ X_FACTOR_LABELS.nbBuildings }}
              </mkp-locations-group-head>
            }

            @if (visibleColumns().includes("mainSector")) {
              <mkp-locations-group-head
                class="w-[200px]"
                criteria="mainSector"
                (click)="toggleSort('mainSector')"
                [sortCriteria]="sortCriteria()"
                [sortCriteriaDirection]="sortCriteriaDirection()"
              >
                {{ X_FACTOR_LABELS.mainSector }}
              </mkp-locations-group-head>
            }

            @if (visibleColumns().includes("climateZone")) {
              <mkp-locations-group-head
                class="w-[100px]"
                criteria="climateZone"
                (click)="toggleSort('climateZone')"
                [sortCriteria]="sortCriteria()"
                [sortCriteriaDirection]="sortCriteriaDirection()"
              >
                {{ X_FACTOR_LABELS.climateZone }}
              </mkp-locations-group-head>
            }
          </tr>
        </thead>

        <tbody
          class="rounded-lg border border-l-4 border-gray-300"
          [class]="borderColor()"
        >
          @for (location of paginatedLocations(); track location.uuid) {
            <mkp-locations-group-row-admin
              [location]="location"
              [visibleColumns]="visibleColumns()"
            />
          }
        </tbody>
      </table>

      <p-paginator
        (onPageChange)="onPageChange($event)"
        [alwaysShow]="false"
        [first]="firstRowOffset()"
        [rows]="rowsPerPage()"
        [showFirstLastIcon]="false"
        [totalRecords]="totalLocations()"
      />
    } @else {
      <div
        class="font-display flex items-center justify-center gap-2 border border-l-4 border-gray-300 bg-gray-100 p-4 text-sm font-normal text-gray-600"
        [class]="borderColor()"
      >
        <icon-plot class="size-8 grayscale-[70%]" colorMode="colored" />
        Aucun site n'a été trouvé
      </div>
    }
  `,
  styles: `
    table {
      @apply min-w-full bg-white;

      th {
        @apply px-4 py-2;
      }
    }
  `,
  imports: [
    LocationsGroupRowAdminComponent,
    LocationsGroupHeadComponent,
    IconPlotComponent,
    PaginatorModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsGroupAdminComponent {
  locationClick = output<Location>();

  locations = input.required<Location[]>();
  visibleColumns = input.required<LocationListColumn[]>();
  theme = input<"primary" | "green" | "purple" | "gray">("primary");
  rowsPerPage = model(4);
  currentPage = model(0);
  sortCriteria = model<LocationListColumn | null>(null);
  sortCriteriaDirection = model<"asc" | "desc">("asc");

  X_FACTOR_LABELS = X_FACTOR_LABELS;

  firstRowOffset = computed(() => this.currentPage() * this.rowsPerPage());

  borderColor = computed(() => {
    return {
      primary: "border-l-primary-700",
      green: "border-l-green-700",
      purple: "border-l-purple-700",
      gray: "border-l-gray-600",
    }[this.theme()];
  });

  textColor = computed(() => {
    return {
      primary: "text-primary-700",
      green: "text-green-700",
      purple: "text-purple-700",
      gray: "text-gray-600",
    }[this.theme()];
  });

  sortedLocations = computed(() => {
    const sortCriteria = this.sortCriteria();
    const sortCriteriaDirection = this.sortCriteriaDirection();

    // We need to spread otherwise the sort() method will mutate the original array
    const locations = [...this.locations()];

    return locations.sort((a, b) => {
      if (sortCriteria === null) {
        return 0;
      }

      const aValue = a[sortCriteria];
      const bValue = b[sortCriteria];

      if (aValue === bValue) {
        return 0;
      }

      if (!aValue) {
        return sortCriteriaDirection === "asc" ? -1 : 1;
      }

      if (!bValue) {
        return sortCriteriaDirection === "asc" ? 1 : -1;
      }

      if (sortCriteriaDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      }

      return aValue < bValue ? 1 : -1;
    });
  });

  paginatedLocations = computed(() => {
    const start = this.currentPage() * this.rowsPerPage();
    const end = start + this.rowsPerPage();

    return this.sortedLocations().slice(start, end);
  });

  totalLocations = computed(() => this.locations().length);

  onPageChange(value: PaginatorState) {
    if (typeof value.rows !== "undefined") {
      this.rowsPerPage.set(value.rows);
    }

    if (typeof value.page !== "undefined") {
      this.currentPage.set(value.page);
    }
  }

  toggleSort(criteria: LocationListColumn) {
    this.sortCriteria.set(criteria);

    if (this.sortCriteriaDirection() === "asc") {
      this.sortCriteriaDirection.set("desc");
    } else {
      this.sortCriteriaDirection.set("asc");
    }
  }
}

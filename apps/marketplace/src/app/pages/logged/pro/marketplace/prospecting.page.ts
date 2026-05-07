import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import type { LocationFilterPro } from "@optee/constants";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { PaginatorModule } from "primeng/paginator";
import { LocationsFilterProComponent } from "../../../../components/location/location-filter-pro/location-filter-pro.component";
import { LocationProGroupComponent } from "../../../../components/location/location-pro-group/location-pro-group.component";
import { AuthService } from "../../../../services/auth.service";
import { LocationService } from "../../../../services/location.service";
import { ProService } from "../../../../services/pro.service";

@Component({
  selector: "mkp-prospecting-page",
  host: {
    class: "max-w-app flex m-auto p-4 lg:p-10 h-full",
  },
  template: `
    <oui-eve class="flex h-full flex-1">
      <mkp-locations-filter-pro
        class="w-52 md:w-72"
        (filtersChanged)="onUpdateFilters($event)"
      />

      <mkp-location-pro-group
        class="w-full flex-1 overflow-auto !p-0"
        heading="Bâtiments"
        scrollableTable
        showSimulateBtn
        [filters]="filters()"
      />
    </oui-eve>
  `,

  imports: [
    RouterModule,
    EveComponent,
    ReactiveFormsModule,
    FormsModule,
    LocationsFilterProComponent,
    PaginatorModule,
    LocationProGroupComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProspectingPageComponent {
  protected readonly activeSearchTerm = signal("");

  protected readonly filters = signal<LocationFilterPro | null>(null);

  protected readonly locationService = inject(LocationService);
  protected readonly proService = inject(ProService);
  protected readonly authService = inject(AuthService);

  protected onUpdateFilters(filters: LocationFilterPro) {
    this.filters.set({
      ...this.filters(),
      ...filters,
      associationTypes: [null],
    });
  }
}

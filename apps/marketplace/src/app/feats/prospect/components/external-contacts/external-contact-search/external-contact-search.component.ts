import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from "@angular/core";
import { form, FormField } from "@angular/forms/signals";
import type { ExternalContactSearchFilters } from "@optee/constants";
import { CONTACT_LEVEL_LABELS, WORK_DOMAIN_LABELS } from "@optee/constants";
import { IconRefreshComponent, IconSearchComponent } from "@optee/icons";
import { SelectListComponent } from "@optee/ui/components/atoms/fields/select-list.component";
import { InputText } from "primeng/inputtext";
import { ProService } from "../../../../../services/pro.service";

@Component({
  selector: "mkp-external-contact-search",
  host: {
    class:
      "flex flex-wrap px-2 items-center gap-4 min-h-12 w-full border-b border-granite-200",
  },
  template: `
    <form class="flex w-full flex-1 gap-2">
      <div
        class="text-granite-900 border-granite-100 hover:border-granite-400 flex h-7 min-w-52 flex-shrink-0 items-center justify-start rounded-lg border py-1 pl-3 pr-1 transition-all"
      >
        <icon-search class="size-3" />
        <input
          class="placeholder-granite-900 h-full appearance-none border-none !pr-0.5 text-sm font-medium focus:outline-none"
          pInputText
          placeholder="Rechercher une personne"
          role="searchbox"
          size="small"
          type="search"
          aria-label="Rechercher une personne"
          [formField]="form.search"
        />
      </div>

      <oui-select-list
        label="Niveau hiérarchique"
        mode="button"
        [formField]="form.levels"
        [options]="levelsOptions"
      />

      <oui-select-list
        hideSelectAll
        inputClasses="max-w-80"
        label="Domaine d'activité"
        mode="button"
        [formField]="form.domains"
        [options]="domainsOptions"
      />

      @let hasActiveFilters = filtersCount() > 0;

      @if (hasActiveFilters) {
        <button
          class="border-granite-300 hover:border-granite-700 flex size-6 items-center justify-center rounded-lg border"
          pTooltip="Réinitialiser les filtres"
          tooltipPosition="bottom"
          type="button"
          (click)="resetFilters()"
        >
          <icon-refresh class="text-granite-700 size-3" slot="icon" />
        </button>
      }
    </form>
  `,
  imports: [
    FormField,
    SelectListComponent,
    IconRefreshComponent,
    IconSearchComponent,
    InputText,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalContactSearchComponent {
  readonly searched = output<ExternalContactSearchFilters>();

  readonly loading = input<boolean>(false);

  private readonly proService = inject(ProService);

  readonly filters = model<ExternalContactSearchFilters>({
    domains: [],
    levels: [],
    search: "",
  });

  protected readonly filtersCount = signal(0);

  private readonly emitWhenFiltersChange = effect(() => {
    const filters = this.filters();
    if (!filters) {
      return;
    }

    const activeFiltersCount =
      filters.domains.length +
      filters.levels.length +
      (filters.search?.trim().length ? 1 : 0);
    this.filtersCount.set(activeFiltersCount);
    this.searched.emit(filters);
  });

  protected readonly form = form(this.filters);

  protected readonly domainsOptions = WORK_DOMAIN_LABELS;

  protected readonly levelsOptions = CONTACT_LEVEL_LABELS;

  protected resetFilters() {
    this.filters.set({
      domains: [],
      levels: [],
      search: "",
    });
  }
}

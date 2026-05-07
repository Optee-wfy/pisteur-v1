import { effect, inject, Injectable, signal } from "@angular/core";
import {
  DEFAULT_EXTERNAL_CONTACT_SEARCH_FILTERS,
  externalContactSearchFiltersSchema,
  type ExternalContactSearchFilters,
} from "@optee/constants";
import { LocalStorageService } from "../../../services/local-storage.service";

@Injectable({
  providedIn: "root",
})
export class ExternalContactSearchParamsService {
  private readonly localStorageService = inject(LocalStorageService);

  private readonly filterStorageKey =
    "prospect-external-contact-search-filters";

  private getDefaultFilters(): ExternalContactSearchFilters {
    return {
      domains: [...DEFAULT_EXTERNAL_CONTACT_SEARCH_FILTERS.domains],
      levels: [...DEFAULT_EXTERNAL_CONTACT_SEARCH_FILTERS.levels],
      search: DEFAULT_EXTERNAL_CONTACT_SEARCH_FILTERS.search,
    };
  }

  readonly activeFilters = signal<ExternalContactSearchFilters>(
    this.loadFiltersFromStorage(),
  );

  private readonly syncActiveFiltersToStorage = effect(() =>
    this.localStorageService.setOrClear(
      this.filterStorageKey,
      this.activeFilters(),
    ),
  );

  private loadFiltersFromStorage(): ExternalContactSearchFilters {
    try {
      const stored = this.localStorageService.safeGet(
        this.filterStorageKey,
        externalContactSearchFiltersSchema,
      );
      if (!stored) {
        return this.getDefaultFilters();
      }
      return stored;
    } catch (error) {
      console.error("Erreur lors du chargement des filtres:", error);
      // En cas d'erreur, nettoyer le localStorage
      this.localStorageService.clear(this.filterStorageKey);
      return this.getDefaultFilters();
    }
  }
}

import { effect, inject, Injectable, signal } from "@angular/core";
import type {
  LocationBdnbLegalEntityFilterPro,
  PaginationState,
} from "@optee/constants";
import {
  defaultPagination,
  locationBdnbLegalEntityFilterProSchema,
  paginationSchema,
} from "@optee/constants";
import { LocalStorageService } from "../../../services/local-storage.service";
@Injectable({
  providedIn: "root",
})
export class LegalEntitiesParamsService {
  private readonly localStorageService = inject(LocalStorageService);

  private readonly filterStorageKey = "prospect-legal-entities-filters";
  private readonly paginationProspectStorageKey =
    "legal-entities-pagination:prospect";

  private readonly paginationAddressBookStorageKey =
    "legal-entities-pagination:address-book";

  private getDefaultLegalEntitiesPagination(): PaginationState {
    return {
      ...defaultPagination,
      sort: { sortBy: "nbRelatedLocations", sortOrder: "desc" },
    };
  }

  readonly activeFilters = signal<LocationBdnbLegalEntityFilterPro | null>(
    this.loadFiltersFromStorage(),
  );

  readonly activePaginationProspect = signal<PaginationState>(
    this.loadPaginationFromStorage(this.paginationProspectStorageKey),
  );

  readonly activePaginationAddressBook = signal<PaginationState>(
    this.loadPaginationFromStorage(this.paginationAddressBookStorageKey),
  );

  private readonly syncActiveFiltersToStorage = effect(() =>
    this.localStorageService.setOrClear(
      this.filterStorageKey,
      this.activeFilters(),
    ),
  );

  private readonly syncActivePaginationProspectToStorage = effect(() =>
    this.localStorageService.setOrClear(
      this.paginationProspectStorageKey,
      this.activePaginationProspect(),
    ),
  );

  private readonly syncActivePaginationAddressBookToStorage = effect(() =>
    this.localStorageService.setOrClear(
      this.paginationAddressBookStorageKey,
      this.activePaginationAddressBook(),
    ),
  );

  private loadFiltersFromStorage(): LocationBdnbLegalEntityFilterPro | null {
    try {
      const stored = this.localStorageService.safeGet(
        this.filterStorageKey,
        locationBdnbLegalEntityFilterProSchema,
      );
      if (!stored) {
        return null;
      }
      return stored;
    } catch (error) {
      console.error("Erreur lors du chargement des filtres:", error);
      // En cas d'erreur, nettoyer le localStorage
      this.localStorageService.clear(this.filterStorageKey);
      return null;
    }
  }

  private loadPaginationFromStorage(storageKey: string): PaginationState {
    try {
      const stored = this.localStorageService.safeGet(
        storageKey,
        paginationSchema,
      );
      if (!stored) {
        return this.getDefaultLegalEntitiesPagination();
      }
      return stored;
    } catch (error) {
      console.error("Erreur lors du chargement de la pagination:", error);
      // En cas d'erreur, nettoyer le localStorage
      this.localStorageService.clear(storageKey);
      return this.getDefaultLegalEntitiesPagination();
    }
  }
}

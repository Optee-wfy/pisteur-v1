import { effect, inject, Injectable, signal } from "@angular/core";
import type { PaginationState } from "@optee/constants";
import {
  defaultPagination,
  locationBdnbLegalEntityFilterProSchema,
  paginationSchema,
  type LocationBdnbLegalEntityFilterPro,
} from "@optee/constants";
import { LocalStorageService } from "../../../services/local-storage.service";

@Injectable({
  providedIn: "root",
})
export class PlacesParamsService {
  private readonly localStorageService = inject(LocalStorageService);

  private readonly filterStorageKey = "prospect-places-filters";
  private readonly paginationProspectStorageKey = "places-pagination:prospect";
  private readonly paginationAddressBookStorageKey =
    "places-pagination:address-book";

  private getDefaultPlacesPagination(): PaginationState {
    return {
      ...defaultPagination,
      sort: { sortBy: "dpeLabel", sortOrder: "asc" },
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
        return this.getDefaultPlacesPagination();
      }
      return stored;
    } catch (error) {
      console.error("Erreur lors du chargement de la pagination:", error);
      // En cas d'erreur, nettoyer le localStorage
      this.localStorageService.clear(storageKey);
      return this.getDefaultPlacesPagination();
    }
  }
}

// ========================================
// Méthodes pour la gestion des presets
// ========================================

// export interface FilterPreset<T = LocationBdnbFilterPro> {
//   id: string;
//   name: string;
//   filters: T;
//   createdAt: string;
//   updatedAt?: string;
// }

// interface FilterPresetsStorage<T = LocationBdnbFilterPro> {
//   active: string | null;
//   presets: Record<string, FilterPreset<T>>;
// }

// /**
//  * Sauvegarde les filtres actuels comme un preset
//  */
// savePreset(name: string): string | null {
//   const currentFilters = this.activeFilters();
//   if (!currentFilters) {
//     console.warn("Aucun filtre actif à sauvegarder");
//     return null;
//   }

//   try {
//     const storage = this.loadPresetsStorage();
//     const presetId = `preset-${Date.now()}`;

//     const preset: FilterPreset = {
//       id: presetId,
//       name: name.trim() || "Sans nom",
//       filters: this.serializeDates(currentFilters),
//       createdAt: new Date().toISOString(),
//     };

//     storage.presets[presetId] = preset;

//     this.savePresetsStorage(storage);
//     return presetId;
//   } catch (error) {
//     console.error("Erreur lors de la sauvegarde du preset:", error);
//     return null;
//   }
// }

// /**
//  * Charge un preset par son ID
//  */
// loadPreset(presetId: string): boolean {
//   try {
//     const storage = this.loadPresetsStorage();
//     const preset = storage.presets[presetId];

//     if (!preset) {
//       console.warn(`Preset avec l'ID ${presetId} non trouvé`);
//       return false;
//     }

//     const deserializedFilters = this.deserializeDates(preset.filters);
//     this.activeFilters.set(deserializedFilters);

//     // Sauvegarder les filtres actifs classiques pour la rétrocompatibilité
//     const serializableFilters = this.serializeDates(deserializedFilters);
//     localStorage.setItem(
//       this.filterStorageKey,
//       JSON.stringify(serializableFilters),
//     );

//     storage.active = presetId;
//     this.savePresetsStorage(storage);

//     return true;
//   } catch (error) {
//     console.error("Erreur lors du chargement du preset:", error);
//     return false;
//   }
// }

// /**
//  * Obtient un preset par son ID
//  */
// getPreset(presetId: string): FilterPreset | null {
//   try {
//     const storage = this.loadPresetsStorage();
//     return storage.presets[presetId] || null;
//   } catch (error) {
//     console.error("Erreur lors de la récupération du preset:", error);
//     return null;
//   }
// }

// /**
//  * Liste tous les presets disponibles
//  */
// listPresets(): FilterPreset[] {
//   try {
//     const storage = this.loadPresetsStorage();
//     return Object.values(storage.presets);
//   } catch (error) {
//     console.error(
//       "Erreur lors de la récupération de la liste des presets:",
//       error,
//     );
//     return [];
//   }
// }

// /**
//  * Supprime un preset
//  */
// deletePreset(presetId: string): boolean {
//   try {
//     const storage = this.loadPresetsStorage();
//     delete storage.presets[presetId];

//     // Si c'était le preset actif, le retirer
//     if (storage.active === presetId) {
//       storage.active = null;
//     }

//     this.savePresetsStorage(storage);
//     return true;
//   } catch (error) {
//     console.error("Erreur lors de la suppression du preset:", error);
//     return false;
//   }
// }

// /**
//  * Met à jour un preset existant
//  */
// updatePreset(presetId: string, name: string): boolean {
//   try {
//     const storage = this.loadPresetsStorage();
//     const preset = storage.presets[presetId];

//     if (!preset) {
//       console.warn(`Preset avec l'ID ${presetId} non trouvé`);
//       return false;
//     }

//     const currentFilters = this.activeFilters();
//     if (!currentFilters) {
//       console.warn("Aucun filtre actif à sauvegarder");
//       return false;
//     }

//     storage.presets[presetId] = {
//       ...preset,
//       name: name.trim() || preset.name,
//       filters: this.serializeDates(currentFilters),
//       updatedAt: new Date().toISOString(),
//     };

//     this.savePresetsStorage(storage);
//     return true;
//   } catch (error) {
//     console.error("Erreur lors de la mise à jour du preset:", error);
//     return false;
//   }
// }

// /**
//  * Obtient l'ID du preset actuellement actif
//  */
// getActivePresetId(): string | null {
//   try {
//     const storage = this.loadPresetsStorage();
//     return storage.active || null;
//   } catch (error) {
//     console.error("Erreur lors de la récupération du preset actif:", error);
//     return null;
//   }
// }

// /**
//  * Charge le storage des presets depuis localStorage
//  */
// private loadPresetsStorage(): FilterPresetsStorage {
//   try {
//     const stored = localStorage.getItem(this.PRESETS_STORAGE_KEY);
//     if (stored) {
//       return JSON.parse(stored) as FilterPresetsStorage;
//     }
//   } catch (error) {
//     console.error("Erreur lors du chargement des presets:", error);
//   }

//   // Retourner une structure vide si rien n'est trouvé
//   return {
//     active: null,
//     presets: {},
//   };
// }

// /**
//  * Sauvegarde le storage des presets dans localStorage
//  */
// private savePresetsStorage(storage: FilterPresetsStorage): void {
//   try {
//     localStorage.setItem(this.PRESETS_STORAGE_KEY, JSON.stringify(storage));
//   } catch (error) {
//     console.error("Erreur lors de la sauvegarde des presets:", error);
//   }
// }

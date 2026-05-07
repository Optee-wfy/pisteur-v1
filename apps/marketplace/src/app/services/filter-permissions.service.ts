import { computed, inject, Injectable } from "@angular/core";
import {
  type FilterKey,
  getAccessibleFiltersBySubscription,
  getFilterPermissionsBySubscription,
  getInaccessibleFiltersBySubscription,
  isFilterAccessibleForSubscription,
} from "@optee/constants";
import { ProService } from "./pro.service";

@Injectable({ providedIn: "root" })
export class FilterPermissionsService {
  private readonly proService = inject(ProService);

  readonly isLoadingSubscription = computed(
    () => this.proService.subscription() === null,
  );

  // Computed pour obtenir les permissions actuelles
  readonly filterPermissions = computed(() => {
    const subscription = this.proService.subscription();
    if (!subscription) {
      return [];
    }
    return getFilterPermissionsBySubscription(subscription);
  });

  /**
   * Vérifie si un filtre est accessible pour l'abonnement actuel
   */
  isFilterAccessible(filterKey: FilterKey): boolean {
    const subscription = this.proService.subscription();
    if (!subscription) {
      return false;
    }
    return isFilterAccessibleForSubscription(filterKey, subscription);
  }

  /**
   * Obtient tous les filtres accessibles pour l'abonnement actuel
   */
  getAccessibleFilters(): string[] {
    const subscription = this.proService.subscription();
    if (!subscription) {
      return [];
    }
    return getAccessibleFiltersBySubscription(subscription);
  }

  /**
   * Obtient tous les filtres non accessibles pour l'abonnement actuel
   */
  getInaccessibleFilters(): string[] {
    const subscription = this.proService.subscription();
    if (!subscription) {
      return [];
    }
    return getInaccessibleFiltersBySubscription(subscription);
  }
}

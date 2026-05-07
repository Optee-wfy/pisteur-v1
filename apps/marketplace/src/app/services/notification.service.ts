import { inject, Injectable, signal } from "@angular/core";
import { DialogService } from "@optee/dialog";
import { getDaysDiff } from "@optee/utils";
import { firstValueFrom, map } from "rxjs";
import { z } from "zod";
import { OperationNotificationComponent } from "../components/operation/operation-notification/operation-notification.component";
import { LocalStorageService } from "./local-storage.service";
import { OperationService } from "./operation.service";

//@todo ajouter des tests pour:
// 0 “upcoming” -> pas d’ouverture
// Cooldown: <14j => pas d’ouverture; ≥14j => ouverture
// Ré-entrance: appels concurrents -> 1 seule ouverture
// Valeur LocalStorage invalide -> ouverture (fallback à null)
@Injectable({ providedIn: "root" })
export class NotificationService {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly dialogService = inject(DialogService);
  private readonly operationService = inject(OperationService);

  // Ne pas renommer la valeur sans migration de LocalStorage.
  private readonly OPR_LAST_NOTIFICATION_DATE = "operationLastNotifDate";
  private readonly isNotificationOpen = signal(false);

  private readonly NOTIFICATION_COOLDOWN_DAYS = 14;

  private readonly upcomingOperationsCount$ = this.operationService.all$.pipe(
    map(
      (operations) =>
        operations.filter((op) => op.operation?.phase?.category === "upcoming")
          .length,
    ),
  );

  async checkOperationNotification(): Promise<void> {
    const upcomingOperationsCount = await firstValueFrom(
      this.upcomingOperationsCount$,
    );
    if (upcomingOperationsCount === 0) {
      return;
    }
    const lastNotification = this.localStorageService.safeGet(
      this.OPR_LAST_NOTIFICATION_DATE,
      z.string(),
    );
    const lastNotificationDate =
      lastNotification && !Number.isNaN(Date.parse(lastNotification))
        ? new Date(lastNotification)
        : null;
    const now = new Date();

    const isCooldownOver =
      !lastNotificationDate ||
      getDaysDiff(lastNotificationDate, now) >= this.NOTIFICATION_COOLDOWN_DAYS;
    if (!this.isNotificationOpen() && isCooldownOver) {
      this.isNotificationOpen.set(true);
      try {
        await this.dialogService.open(OperationNotificationComponent, {
          data: { upcomingOperationsCount },
        });
        this.localStorageService.set(
          this.OPR_LAST_NOTIFICATION_DATE,
          now.toISOString(),
        );
      } finally {
        // Always reset to avoid getting stuck if the dialog throws or is cancelled
        this.isNotificationOpen.set(false);
      }
    }
  }
}

import { computed, inject, Injectable, signal } from "@angular/core";
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { isOpteeTester, UserType } from "@optee/constants";
import { ToastService } from "@optee/ui/services/toast.service";
import {
  formatNameInitials,
  isEmailFromOptee,
  isNotNullish,
} from "@optee/utils";
import * as Sentry from "@sentry/angular";
import { AuthError } from "@supabase/supabase-js";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  of,
  shareReplay,
  switchMap,
} from "rxjs";
import { z } from "zod";
import trpcClient from "../../trpc-client";
import { SupabaseService } from "../supabase.service";
import { handleError } from "../utils/handleTRPCError";
import { LocalStorageService } from "./local-storage.service";
import { TrackingService } from "./tracking.service";

/**
 * Service to manage the current user.
 */
@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly trackingService = inject(TrackingService);

  private readonly loggedAsKey = "loggedAs";

  private readonly session$ = SupabaseService.auth$.pipe(
    map((data) => data.session),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly contact$ = this.session$.pipe(
    switchMap((session) =>
      session ? trpcClient.users.getContact.query() : of(null),
    ),
    handleError(this.toastService, "Récupération de l'utilisateur", null),
    shareReplay(1),
  );

  private readonly subIdentify = this.contact$
    .pipe(filter(isNotNullish), debounceTime(1000), takeUntilDestroyed())
    .subscribe((contact) => {
      this.trackingService.identifyPostHog({
        contactUuid: contact.uuid,
        contactHsId: contact.id,
        firstname: contact.firstName,
        lastname: contact.lastName,
        email: contact.email,
        userUuid: contact.userUuid,
      });

      Sentry.setUser({
        email: contact.email ?? "NA",
        userUuid: contact.userUuid,
        segment: "marketplace_user",
      });

      Sentry.setTag("user_type", this.loggedAs() || "unknown");
      Sentry.setTag("has_pro_account", !!contact.userUuid);
    });

  readonly isAdminOptee$ = this.contact$.pipe(
    map((user) => isEmailFromOptee(user?.email)),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly isAdminOptee = toSignal(this.isAdminOptee$, {
    initialValue: false,
  });

  readonly isOpteeTester$ = this.contact$.pipe(
    map((user) => isOpteeTester(user?.email)),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly isOpteeTester = toSignal(this.isOpteeTester$, {
    initialValue: false,
  });

  readonly userInitial$ = this.contact$.pipe(
    filter(isNotNullish),
    map((user) =>
      formatNameInitials({
        firstName: user.firstName,
        lastName: user.lastName,
      }),
    ),
  );

  readonly userTypes$ = SupabaseService.auth$.pipe(
    map((data) => data.session),
    filter(isNotNullish),
    switchMap(() => trpcClient.users.getUserTypes.query()),
    shareReplay(1),
  );

  readonly userTypes = toSignal(this.userTypes$, {
    initialValue: [],
  });

  readonly loggedAs = signal<UserType | null>(
    this.localStorage.safeGet(this.loggedAsKey, z.nativeEnum(UserType)),
  );

  readonly loggedAs$ = toObservable(this.loggedAs);

  readonly isLoggedAsPro = computed(() => this.loggedAs() === UserType.PRO);

  readonly isLoggedAsClient = computed(
    () => this.loggedAs() === UserType.CLIENT,
  );

  async logOut() {
    try {
      const { error } = await SupabaseService.signOut();
      if (error) {
        throw error;
      }

      this.localStorage.clear(this.loggedAsKey);

      this.loggedAs.set(null);
      this.trackingService.resetIdentity();
      this.clearSentryUserContext(); // Clear Sentry user context on logout

      await this.router.navigate(["/auth"]);
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        this.toastService.open("error", "Déconnexion", error.message);
      }
    }
  }

  changeUserType(userType: UserType) {
    if (!this.userTypes().includes(userType)) {
      this.toastService.open(
        "error",
        "Changement de compte",
        "Vous n'avez pas les permissions suffisantes.",
      );
      return;
    }

    const previousUserType = this.loggedAs();
    this.loggedAs.set(userType);

    this.localStorage.set(this.loggedAsKey, userType);

    if (userType === UserType.PRO && previousUserType !== UserType.PRO) {
      this.trackingService.trackPro("pro_login", {
        last_login_date: new Date().toISOString(),
      });
    }
  }

  async hasMultipleUserTypes() {
    const accounts = await firstValueFrom(
      this.userTypes$.pipe(filter((accounts) => accounts.length > 0)),
    );
    return accounts.filter((a) => a !== UserType.ADMIN).length > 1;
  }

  private clearSentryUserContext() {
    Sentry.setUser(null);
    Sentry.setTag("user_type", null);
    Sentry.setTag("has_pro_account", null);
    console.log("✅ Sentry user context cleared");
  }
}

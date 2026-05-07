import { inject, Injectable } from "@angular/core";
import { UserType } from "@optee/constants";
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  from,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from "rxjs";
import trpcClient from "../../trpc-client";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class ClientService {
  private readonly authService = inject(AuthService);
  readonly refreshContacts$ = new Subject<void>();

  self$ = combineLatest([
    this.authService.loggedAs$,
    this.authService.isAdminOptee$,
  ]).pipe(
    distinctUntilChanged((a, b) => a[0] === b[0] && a[1] === b[1]),
    switchMap(([loggedAs, isAdminOptee]) => {
      const shouldFetch = loggedAs === UserType.CLIENT || isAdminOptee;
      return shouldFetch
        ? from(trpcClient.clients.getByLoggedUser.query()).pipe(
            // Keep the stream alive on transient failures
            catchError((err) => {
              console.error("clients.getByLoggedUser failed", err);
              return of(null);
            }),
          )
        : of(null);
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  contacts$ = this.self$.pipe(
    switchMap(() => this.refreshContacts$),
    startWith(null),
    switchMap(() => trpcClient.clients.getCurrentContacts.query()),
    shareReplay(1),
  );

  refresh() {
    this.refreshContacts$.next();
  }
}

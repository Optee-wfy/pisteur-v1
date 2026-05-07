/* eslint-disable @rx-angular/prefer-no-layout-sensitive-apis */
import { Injectable, signal } from "@angular/core";
import type { Location } from "@optee/models";
import { getTailwindBreakpoint } from "@optee/utils";
import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  throttleTime,
} from "rxjs";
import { asyncScheduler, fromEvent, interval } from "rxjs-zone-less";

const DEFAULT_MESSAGE = "Veuillez patienter...";

@Injectable({
  providedIn: "root",
})
export class AppService {
  breakpoint$ = fromEvent(window, "resize").pipe(
    startWith(null),
    throttleTime(100, asyncScheduler, { leading: true, trailing: true }),
    map(() => window.innerWidth),
    map(getTailwindBreakpoint),
    distinctUntilChanged(),
    shareReplay(1),
  );

  isMobile$ = this.breakpoint$.pipe(
    map(
      (breakpoint) =>
        breakpoint === "xs" || breakpoint === "sm" || breakpoint === "md",
    ),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly isLoading = signal(false);
  readonly loadingMessage = signal<{ title: string; text?: string }>({
    title: DEFAULT_MESSAGE,
  });

  resetMessage() {
    this.loadingMessage.set({ title: DEFAULT_MESSAGE });
  }

  simulateOperationLoading(locations: Location[]) {
    // Loop over this list and append the location address to create the waiting message
    const tasks = [
      "Critères d’éligibilité aux aides CEE",
      "Qualifications nécessaires",
      "Contrôles et vérifications",
      "Objectifs du maître d'ouvrage",
      "Justification des choix des opérations",
      "Critères du bâtiment",
      "Contraintes techniques",
    ];

    return interval(2000)
      .pipe(
        map((i) => {
          const taskMessage = tasks[i % tasks.length];
          const turn = Math.floor(i / tasks.length);
          const location = locations[turn] ?? locations[0];
          return { title: location?.address ?? "", text: taskMessage + "..." };
        }),
        startWith({
          title: "Génération du brief",
          text: "Cela devrait prendre moins d'une minute",
        }),
      )
      .subscribe((message) => {
        this.loadingMessage.set(message);
      });
  }
}

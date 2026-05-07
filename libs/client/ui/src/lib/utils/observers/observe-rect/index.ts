import type { ElementRef, Signal } from "@angular/core";
import { isSignal } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { isNotNullish } from "@optee/utils";
import type { Observable } from "rxjs";
import { filter, map, of, startWith, switchMap, throttleTime } from "rxjs";
import { asyncScheduler } from "rxjs-zone-less";
import { observeResize } from "../observe-resize";

export function observeRect(
  signalEl: Signal<ElementRef | undefined> | ElementRef,
  prop: "x" | "y",
): Observable<number> {
  const el$ = isSignal(signalEl) ? toObservable(signalEl) : of(signalEl);

  return el$.pipe(
    filter(isNotNullish),
    switchMap((el) =>
      observeResize(el.nativeElement).pipe(
        // getBoundingClientRect triggers style recalculation, so we throttle it
        throttleTime(100, asyncScheduler, {
          leading: true,
          trailing: true,
        }),
        // eslint-disable-next-line @rx-angular/prefer-no-layout-sensitive-apis
        map(() => el.nativeElement.getBoundingClientRect()), // observeResize doesn't know about coords (only width and height)
      ),
    ),
    filter(isNotNullish),
    map((rect) => rect[prop]),
    startWith(0),
  );
}

import type { ElementRef, Signal } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { isNotNullish } from "@optee/utils";
import type { Observable } from "rxjs";
import { filter, map, startWith, switchMap } from "rxjs";
import { observeResize } from "../observe-resize";

export function observeSize(
  signalEl: Signal<ElementRef | undefined>,
  prop: "width" | "height", // Other values are empty
): Observable<number> {
  return toObservable(signalEl).pipe(
    filter(isNotNullish),
    switchMap((el) => observeResize(el.nativeElement)),
    filter(isNotNullish),
    map((rect) => {
      // observeResize doesn't include the padding in the width and height
      if (prop === "width") {
        return rect.width + rect.left + rect.x;
      }

      return rect.height + rect.top + rect.y;
    }),
    startWith(0),
  );
}

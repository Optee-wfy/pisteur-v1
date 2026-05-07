import { isNotNullish } from "@optee/utils";
import type { Observable } from "rxjs";
import { filter, fromEventPattern, map } from "rxjs";

export function observeResize(
  element: HTMLElement,
): Observable<DOMRectReadOnly> {
  return fromEventPattern<ResizeObserverEntry[][]>(
    (handler) => {
      const resizeObserver = new ResizeObserver(handler);
      resizeObserver.observe(element);
      return resizeObserver;
    },
    (_, resizeObserver) => resizeObserver.disconnect(),
  ).pipe(
    map((entries) => entries[0]),
    filter(isNotNullish),
    map((entry) => entry[0]?.contentRect),
    filter(isNotNullish),
  );
}

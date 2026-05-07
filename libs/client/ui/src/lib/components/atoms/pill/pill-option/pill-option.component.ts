import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import type { FormControl } from "@angular/forms";
import { combineLatest, map, switchMap } from "rxjs";

@Component({
  selector: "oui-pill-option",
  host: {
    class: "border rounded-3xl py-1 px-2 text-sm font-display truncate",
    "[class]": `isActive()
        ? 'border-gray-700 bg-primary-200 text-primary-700'
        : 'border-gray-300'
    `,
  },
  template: `
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PillOptionComponent {
  value = input.required<string>();
  control = input.required<FormControl<string[] | null>>();

  valueChanges$ = toObservable(this.control).pipe(
    switchMap((control) => control.valueChanges),
    map((value) => value ?? []),
  );

  // Observing the control itself is not enough, we need to observe the value
  isActive$ = combineLatest([
    this.valueChanges$,
    toObservable(this.value),
  ]).pipe(map(([values, value]) => values.includes(value)));

  // Sadly we can't use an Observable in the host binding above
  isActive = toSignal(this.isActive$);
}

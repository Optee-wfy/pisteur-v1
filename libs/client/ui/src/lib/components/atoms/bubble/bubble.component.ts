import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "oui-bubble",
  host: {
    class:
      "select-none cursor-pointer bg-primary-100 hover:bg-primary-200 text-primary-700 flex flex-1 flex-col gap-4 rounded-2xl p-4 font-semibold transition-all",
  },
  template: `
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BubbleComponent {}

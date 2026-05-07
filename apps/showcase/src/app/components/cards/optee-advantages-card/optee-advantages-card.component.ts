import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { PublicAssetPath } from "@optee/constants";

@Component({
  selector: "swc-optee-advantages-card",
  host: {
    class:
      "shadow-o max-w- mx-auto flex flex-1 flex-col gap-4 rounded-3xl bg-white p-4 md:max-w-sm xl:gap-6",
  },
  template: `
    <img alt="" [src]="publicAssetPath()" />
    <p class="font-display text-sm">
      <ng-content />
    </p>
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpteeAdvantagesCardComponent {
  publicAssetPath = input.required<PublicAssetPath>();
}

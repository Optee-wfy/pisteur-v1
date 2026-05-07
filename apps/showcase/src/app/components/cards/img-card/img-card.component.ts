import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { PublicAssetPath } from "@optee/constants";
import { buildAssetUrl } from "@optee/constants";

@Component({
  selector: "swc-img-card",
  host: {
    class:
      "bg-white box-content flex w-80 flex-col items-center rounded-xl p-6 gap-4 xl:gap-8",
  },
  template: `
    <img
      class="w-36 xl:w-72"
      [alt]="imgDescription()"
      [src]="publicAssetUrl()"
    />

    <h4
      class="font-display m-auto w-11/12 max-w-prose text-lg font-semibold xl:text-2xl"
    >
      {{ title() }}
    </h4>

    <p class="p-soft">
      {{ description() }}
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImgCardComponent {
  readonly publicAssetPath = input.required<PublicAssetPath>();
  readonly imgDescription = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();

  readonly publicAssetUrl = computed(() =>
    buildAssetUrl(this.publicAssetPath()),
  );
}

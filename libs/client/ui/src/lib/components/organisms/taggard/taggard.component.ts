import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { PublicAssetPath } from "@optee/constants";
import { buildAssetUrl } from "@optee/constants";
import { EveComponent } from "../eve/eve.component";

@Component({
  selector: "oui-taggard",
  template: `
    <oui-eve class="flex flex-col items-start gap-6">
      <div
        class="rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-900"
      >
        {{ tagText() }}
      </div>

      <div
        class="bg-granite-100 flex h-[160px] w-full items-center justify-center rounded-lg"
      >
        <img
          class="h-[140px]"
          alt=""
          aria-hidden="true"
          [src]="publicAssetUrl()"
        />
      </div>

      <div class="flex flex-col gap-2">
        <h4
          class="font-display text-primary-900 text-center text-xl font-semibold lg:text-2xl"
        >
          {{ headingA() }}
          <div class="hidden lg:block"></div>
          {{ headingB() }}
        </h4>
        <p class="text-sm text-gray-600">
          {{ description() }}
        </p>
      </div>
    </oui-eve>
  `,
  imports: [EveComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaggardComponent {
  tagText = input.required<string>();
  headingA = input.required<string>();
  headingB = input.required<string>();
  description = input.required<string>();
  publicAssetPath = input.required<PublicAssetPath>();

  publicAssetUrl = computed(() => buildAssetUrl(this.publicAssetPath()));
}

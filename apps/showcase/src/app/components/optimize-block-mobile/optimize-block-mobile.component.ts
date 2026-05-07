import {
    ChangeDetectionStrategy,
    Component,
    input,
    signal,
} from "@angular/core";
import { buildAssetUrl } from "@optee/constants";
import { IconChevronRightComponent } from "@optee/icons";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import type { OptimizeBlockContent } from "../optimize-block-desktop/optimize-block-desktop.component";

@Component({
  selector: "swc-optimize-block-mobile",
  host: {
    class:
      "flex flex-col relative overflow-hidden bg-primary-900 text-white gap-10 px-5 py-10",
  },
  template: `
    <oui-circle class="-left-[100px] -top-[250px] w-[530px]" theme="dark" />
    <oui-circle class="-bottom-[400px] -right-[200px] w-[621px]" theme="dark" />

    <h2 class="font-display text-pretty text-3xl font-semibold leading-10">
      {{ title() }}
    </h2>
    <div class="flex flex-col items-center">
      @for (content of contents(); track content.title; let i = $index) {
        <div
          class="border-primary-200 flex w-full cursor-pointer flex-col items-stretch gap-6 border-b py-6"
          (click)="updateVisibleIndex(i)"
        >
          <div class="flex w-full items-center justify-between gap-2">
            <h4 class="font-display w-full text-xl font-medium">
              {{ content.title }}
            </h4>
            <icon-chevron-right
              class="size-6 origin-center rotate-90 text-white transition-transform duration-200"
              [class.rotate-0]="i === visibleIndex()"
            />
          </div>
          @if (i === visibleIndex()) {
            <p>
              {{ content.paragraph }}
            </p>
            <img
              class="max-h-72 object-contain"
              alt=""
              aria-hidden="true"
              [src]="buildAssetUrl(content.publicAssetPath)"
            />
          }
        </div>
      }
    </div>
  `,
  imports: [CircleComponent, IconChevronRightComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptimizeBlockMobileComponent {
  readonly title = input.required<string>();
  readonly contents = input.required<OptimizeBlockContent[]>();

  readonly buildAssetUrl = buildAssetUrl;
  readonly visibleIndex = signal(0);

  updateVisibleIndex(index: number): void {
    if (this.visibleIndex() === index) {
      this.visibleIndex.set(-1);
    } else {
      this.visibleIndex.set(index);
    }
  }
}

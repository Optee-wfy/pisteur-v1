/* eslint-disable @rx-angular/prefer-no-layout-sensitive-apis */
import {
    ChangeDetectionStrategy,
    Component,
    input,
    signal,
} from "@angular/core";
import { buildAssetUrl, type PublicAssetPath } from "@optee/constants";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";

export interface OptimizeBlockContent {
  title: string;
  paragraph: string;
  publicAssetPath: PublicAssetPath;
}

@Component({
  selector: "swc-optimize-block-desktop",
  host: {
    class:
      "flex flex-col bg-primary-900 text-white relative font-display max-h-screen w-full overflow-hidden snap-mandatory gap-20 h-3/4",
  },
  template: `
    <oui-circle class="-left-[100px] -top-[250px] w-[530px]" theme="dark" />
    <oui-circle class="-bottom-[200px] -right-[200px] w-[621px]" theme="dark" />

    <h2
      class="mx-12 text-pretty pt-20 text-center text-4xl font-semibold leading-10"
    >
      {{ title() }}
    </h2>
    <div class="mx-auto w-full overflow-y-scroll px-6 pb-16 lg:px-20">
      <div class="mx-auto max-w-screen-xl">
        <div class="flex items-start justify-center lg:gap-6">
          <div class="flex flex-col items-center gap-6">
            @for (content of contents(); track content.title; let i = $index) {
              <div
                class="border-primary-200 flex cursor-pointer flex-col items-start gap-10 self-stretch rounded-2xl border p-8"
                #paragraphRef
                (mouseenter)="visibleIndex.set(i)"
              >
                <h4 class="text-xl font-semibold">{{ content.title }}</h4>
                @if (i === visibleIndex()) {
                  <p>
                    {{ content.paragraph }}
                  </p>
                }
              </div>
            }
          </div>
          <div class="self-center">
            @for (content of contents(); track content.title; let i = $index) {
              @if (i === visibleIndex()) {
                <img
                  class="max-h-80 max-w-96 object-contain xl:max-h-96"
                  alt="Optee media"
                  loading="lazy"
                  [class.animate-fadeIn]="i === visibleIndex()"
                  [src]="buildAssetUrl(content.publicAssetPath)"
                />
              } @else {
                <div
                  class="w-96"
                  [class.animate-fadeIn]="i === visibleIndex()"
                ></div>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [CircleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptimizeBlockDesktopComponent {
  readonly title = input.required<string>();
  readonly contents = input.required<OptimizeBlockContent[]>();

  readonly buildAssetUrl = buildAssetUrl;

  readonly visibleIndex = signal(0);
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { buildAssetUrl, type PublicAssetPath } from "@optee/constants";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

@Component({
  selector: "oui-cta-block",
  host: {
    class:
      "flex justify-center flex-wrap xl:flex-nowrap shadow-o rounded-lg text-primary-900 bg-white p-6 gap-10 w-10/12 md:w-auto xl:w-[870px] m-auto z-10",
  },
  template: `
    <div class="flex max-w-lg flex-col justify-center gap-6 text-left xl:gap-8">
      <h4
        class="font-display text-2xl font-semibold !leading-tight md:text-3xl xl:text-4xl"
      >
        {{ ctaTitle() }}
      </h4>

      <oui-button variant="primary" [href]="btnLink()">
        {{ btnText() }}
      </oui-button>
    </div>

    <img
      class="w-full max-w-52 rounded-lg sm:size-auto"
      alt="Photo d'illustration"
      [src]="imgSrc()"
    />
  `,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaBlockComponent {
  ctaTitle = input<string>(
    "Rejoignez plus de 120 entreprises engagées pour le climat",
  );

  btnText = input<string>("Demander une démo");
  btnLink = input<string>("/demo");
  publicAssetPath = input<PublicAssetPath>("cloudless-blue-sky-city.png");

  imgSrc = computed(() => buildAssetUrl(this.publicAssetPath()));
}

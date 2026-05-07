import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { buildAssetUrl } from "@optee/constants";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { CtaBlockComponent } from "@optee/ui/components/molecules/cta-block/cta-block.component";

@Component({
  selector: "mkp-layout-public",
  host: {
    class: "h-full flex flex-col overflow-x-hidden",
  },
  template: `
    <header
      class="shadow-o relative z-10 flex h-20 flex-auto flex-shrink-0 flex-grow-0 items-center justify-between bg-white px-6 py-2 md:px-16"
    >
      <a routerLink="https://www.optee.io/">
        <img class="h-10 w-auto" alt="Logo de Optee" [src]="logoLight" />
      </a>
      <oui-button href="https://www.optee.io/demo" variant="primary">
        Demander une demo
      </oui-button>
    </header>

    <main class="bg-primary-50 relative isolate">
      <oui-circle
        class="-right-[429px] bottom-[128px] w-[945px]"
        theme="light"
      />
      <oui-circle class="-left-[390px] -top-[475px] w-[945px]" theme="light" />
      <router-outlet />
    </main>

    <footer
      class="bg-primary-700 relative mt-60 flex flex-col gap-4 px-6 pb-6 pt-80 md:px-14 xl:pt-24"
    >
      <oui-cta-block
        class="absolute -top-48 left-1/2 -translate-x-1/2"
        btnLink="https://www.optee.io/demo"
        btnText="Contactez un de nos experts"
        ctaTitle="Vous souhaitez en savoir plus sur ces opérations ou la plateforme Optee ?"
      />
      <img class="w-28" alt="Logo de optee" [src]="logoLight" />
      <div
        class="border-primary-400 flex justify-between border-t py-6 text-xs leading-5 tracking-tight text-white"
      >
        <span>Copyright Optee 2025</span>
        <span>Tous droits réservés | Politique de confidentialité</span>
      </div>
    </footer>
  `,
  imports: [RouterOutlet, ButtonComponent, CircleComponent, CtaBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LayoutMarketingComponent {
  readonly logoLight = buildAssetUrl("logo-light-theme.svg");
}

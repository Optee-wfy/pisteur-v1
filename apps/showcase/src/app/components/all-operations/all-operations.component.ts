import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from "@angular/core";
import { Router } from "@angular/router";
import type { PublicAssetPath } from "@optee/constants";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { CtaBlockComponent } from "@optee/ui/components/molecules/cta-block/cta-block.component";
import { RedirectCardComponent } from "../cards/redirect-card/redirect-card.component";

@Component({
  selector: "swc-all-operations",
  host: {
    id: "operationsSection",
  },
  template: `
    <div class="relative block overflow-hidden pb-56">
      <oui-circle class="-left-[147px] top-[130px] w-[349px]" theme="light" />

      <oui-circle
        class="-bottom-[288px] -right-[211px] w-[669px]"
        theme="light"
      />

      <div
        class="relative flex flex-col items-center gap-10 py-8 xl:gap-20 xl:py-20"
      >
        <div class="mx-8 flex flex-col items-center gap-3 xl:gap-6">
          <h2
            class="font-display text-primary-900 text-center text-2xl font-semibold leading-10 xl:text-4xl"
          >
            Retrouvez toutes nos opérations
          </h2>

          <p class="p-soft max-w-[500px] text-center">
            Optee est une solution globale permettant de piloter et d’agir sur
            un ensemble d’opérations de rénovations énergétiques.
          </p>
        </div>

        <div
          class="flex items-center gap-6 self-stretch overflow-y-auto px-6 py-4 md:px-0 lg:justify-center xl:gap-12"
        >
          @for (operation of operations; track operation.name) {
            <swc-redirect-card
              (navigate)="navigateToOperation($event)"
              [icon]="operation.icon"
              [link]="operation.link"
              [name]="operation.name"
            />
          }
        </div>
      </div>
    </div>

    <div
      class="relative -mt-56 p-5 md:p-14 xl:p-0"
      [style.backgroundImage]="
        'linear-gradient(to bottom, transparent 0%, transparent 60%, #000D4D 60%, #000D4D 100%)'
      "
    >
      <oui-cta-block
        [ctaTitle]="title()"
        [publicAssetPath]="publicAssetPath()"
      />
    </div>
  `,
  imports: [CircleComponent, CtaBlockComponent, RedirectCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllOperationsComponent {
  private readonly router = inject(Router);

  title = input<string>(
    "Rejoignez plus de 120 entreprises engagées pour le climat",
  );

  publicAssetPath = input<PublicAssetPath>("cloudless-blue-sky-city.png");
  currentOperation = input<"isolation" | "cvc" | "audit" | "gtb" | "none">(
    "none",
  );

  operations = [
    { name: "Isolation", icon: "isolation", link: "isolation" },
    { name: "GTB", icon: "gtb", link: "gtb" },
    // { name: "Éclairage", icon: "eclairage", link: "eclairage" },
    { name: "CVC", icon: "cvc", link: "cvc" },
    { name: "Audit", icon: "audit", link: "audit" },
  ] as const;

  navigateToOperation(link: string) {
    this.router.navigate([`/${link}`]).then(() => {
      // eslint-disable-next-line @rx-angular/prefer-no-layout-sensitive-apis
      window.scrollTo(0, 0); // Scroll to top
    });
  }
}

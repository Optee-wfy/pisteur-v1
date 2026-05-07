import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { buildAssetUrl, SHOWCASE_URL } from "@optee/constants";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";

@Component({
  selector: "mkp-onboarding-pro-layout",
  template: `
    <header
      class="shadow-o relative z-10 flex h-20 flex-auto flex-shrink-0 flex-grow-0 items-center justify-center bg-white"
    >
      <span class="sr-only">Pisteur</span>
      <a [routerLink]="SHOWCASE_URL">
        <img class="h-10 w-auto" alt="Logo de Pisteur" [src]="pisterUrl" />
      </a>
    </header>

    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <oui-circle
        class="-left-[629px] -top-[328px] w-[945px]"
        theme="light"
        aria-hidden="true"
      />

      <oui-circle
        class="-bottom-[258px] -right-[248px] w-[580px]"
        theme="light"
        aria-hidden="true"
      />
    </div>

    <div
      class="flex items-center justify-center overflow-auto p-6"
      [style.scrollbar-color]="'#A3C0FF transparent'"
    >
      <div
        class="shadow-o isolate flex w-full max-w-screen-sm flex-col gap-8 rounded-3xl bg-white p-6 lg:p-10"
      >
        <router-outlet class="hidden" />
      </div>
    </div>
  `,
  imports: [RouterModule, CircleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OnboardingProRegisterComponent {
  protected readonly SHOWCASE_URL = SHOWCASE_URL;
  protected readonly pisterUrl = buildAssetUrl("pister.svg");
}

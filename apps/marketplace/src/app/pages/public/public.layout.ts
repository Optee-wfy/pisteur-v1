import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { buildAssetUrl } from "@optee/constants";

@Component({
  selector: "mkp-layout-public",
  host: {
    class: "h-full flex flex-col",
  },
  template: `
    <header
      class="shadow-o relative z-10 flex h-20 flex-auto flex-shrink-0 flex-grow-0 items-center justify-center bg-white"
    >
      <span class="sr-only">Pisteur</span>
      <a href="https://www.optee.io/" rel="noopener" target="_blank">
        <img class="h-10 w-auto" alt="Logo de Pisteur" [src]="pisterUrl" />
      </a>
    </header>
    <main class="bg-primary-50">
      <router-outlet />
    </main>
  `,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LayoutPublicComponent {
  protected readonly pisterUrl = buildAssetUrl("pister.svg");
}

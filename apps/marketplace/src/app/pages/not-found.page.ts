import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

@Component({
  selector: "mkp-page-not-found",
  template: `
    <div class="flex h-full flex-col items-center justify-center gap-4">
      <h1 class="text-2xl font-bold">Cette page n'existe pas</h1>
      <oui-button routerLink="/auth">
        Retourner à la page de connexion
      </oui-button>
    </div>
  `,
  imports: [ButtonComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PageNotFoundComponent {}

import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "swc-contact-form",
  host: {
    class:
      "flex flex-col xl:flex-row justify-between bg-white gap-4 px-6 py-8  md:px-16 md:py-12 z-10 relative rounded-3xl",
  },
  template: `
    <div class="flex flex-col justify-center gap-4 xl:max-w-xs">
      <h3 class="text-3xl">
        Envie de découvrir le potentiel de votre bâtiment ?
      </h3>
      <p class="text-gray-600">
        Prenez contact avec l’un de nos experts pour définir gratuitement votre
        projet de rénovation énergétique.
      </p>
    </div>
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormComponent {}

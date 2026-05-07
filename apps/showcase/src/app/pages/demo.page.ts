import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { buildAssetUrl } from "@optee/constants";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { FormHubspotComponent } from "../components/form-hubspot/form-hubspot.component";

@Component({
  selector: "swc-demo-page",
  host: {
    class: "block overflow-hidden",
  },
  template: `
    <div
      class="bg-primary-900 relative flex h-screen flex-col items-start gap-4 overflow-auto p-4 lg:flex-row lg:gap-10 lg:p-10"
    >
      <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <oui-circle class="-left-[419px] -top-[20px] w-[1071px]" theme="dark" />
      </div>

      <div
        class="relative flex min-w-[400px] flex-col items-start gap-8 text-white"
      >
        <div class="text-2xl font-semibold not-italic leading-snug">
          Atteignez vos objectifs
          <br />
          d’efficacité énergétique
          <br />
          avec Optee.
        </div>

        <div class="text-primary-900 flex gap-2 text-xs">
          <span class="select-none rounded bg-white px-4 py-1">
            Mise en relation
          </span>
          <span class="select-none rounded bg-white px-4 py-1">Pilotage</span>
          <span class="select-none rounded bg-white px-4 py-1">Aides</span>
        </div>

        <div class="tracking-[0.32px]">
          Plus de 200 clients nous font déjà confiance.
          <br />
          Renseignez vos informations pour être rappelé
          <br />
          par notre équipe.
        </div>

        <div class="flex size-16 gap-4 grayscale">
          <img
            class="inline-block rounded-full"
            alt="Photo d'Antoine"
            [src]="antoineJpg"
          />
          <img
            class="inline-block rounded-full"
            alt="Photo d'Alexia"
            [src]="alexiaJpg"
          />
          <img
            class="inline-block rounded-full opacity-60"
            alt="Photo de Thaïs"
            [src]="thaisJpg"
          />
          <img
            class="inline-block rounded-full opacity-30"
            alt="Photo de Victor"
            [src]="victorJpg"
          />

          <img
            class="inline-block rounded-full opacity-10"
            alt="Photo de Maxime"
            [src]="maximeJpg"
          />
        </div>
      </div>

      <oui-eve class="relative max-w-[1000px] flex-auto p-4 lg:p-10">
        <swc-form-hubspot />
      </oui-eve>
    </div>
  `,
  imports: [FormHubspotComponent, CircleComponent, RouterModule, EveComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoPageComponent {
  antoineJpg = buildAssetUrl("optee-people/Antoine.jpeg");
  alexiaJpg = buildAssetUrl("optee-people/Alexia.jpeg");
  thaisJpg = buildAssetUrl("optee-people/Thais.jpeg");
  victorJpg = buildAssetUrl("optee-people/Victor.jpeg");
  maximeJpg = buildAssetUrl("optee-people/Maxime.jpeg");
}

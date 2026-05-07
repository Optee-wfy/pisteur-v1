import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  IconBoltComponent,
  IconBoxComponent,
  IconChartComponent,
  IconThumbUpComponent,
} from "@optee/icons";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";

@Component({
  selector: "mkp-onboarding-bubbles",
  host: {
    class: "grid grid-cols-2 justify-center gap-4 lg:gap-6",
  },
  template: `
    <oui-eve
      class="font-display flex w-40 flex-col gap-3 !p-4 text-center sm:w-48"
    >
      <icon-chart class="text-primary-700 mx-auto size-8" />
      <span class="text-primary-700 text-[35px] font-semibold leading-none">
        +120
      </span>
      <div class="text-primary-700 text-center text-xs leading-snug">
        <span class="font-bold">Données</span>
        récupérées
        <br />
        par bâtiment
      </div>
    </oui-eve>

    <oui-eve
      class="font-display flex w-40 flex-col gap-3 !p-4 text-center sm:w-48"
    >
      <icon-box class="text-primary-700 mx-auto size-8" />
      <span class="text-primary-700 text-[35px] font-semibold leading-none">
        +60
      </span>
      <div class="text-primary-700 text-center text-xs leading-snug">
        <span class="font-bold">Simulations</span>
        générées
        <br />
        instantanément
      </div>
    </oui-eve>

    <oui-eve
      class="font-display flex w-40 flex-col gap-3 !p-4 text-center sm:w-48"
    >
      <icon-thumb-up class="text-primary-700 mx-auto size-8" />
      <span class="text-primary-700 text-[35px] font-semibold leading-none">
        +80%
      </span>
      <div class="text-primary-700 text-center text-xs leading-snug">
        <span class="font-bold">D'engagement</span>
        sur vos projets de rénovation
      </div>
    </oui-eve>

    <oui-eve
      class="font-display flex w-40 flex-col gap-3 !p-4 text-center sm:w-48"
    >
      <icon-bolt class="text-primary-700 mx-auto size-8" />
      <span class="text-primary-700 text-[35px] font-semibold leading-none">
        4h
      </span>
      <div class="text-primary-700 text-center text-xs leading-snug">
        <span class="font-bold">Économisées</span>
        sur
        <br />
        chaque appels d'offres
      </div>
    </oui-eve>
  `,
  imports: [
    EveComponent,
    IconThumbUpComponent,
    IconChartComponent,
    RouterModule,
    IconBoxComponent,
    IconBoltComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingBubblesComponent {}

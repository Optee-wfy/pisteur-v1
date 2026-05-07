import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { DividerHorizontalComponent } from "@optee/ui/components/atoms/divider/divider-horizontal/divider-horizontal.component";
import { DividerVerticalComponent } from "@optee/ui/components/atoms/divider/divider-vertical/divider-vertical.component";

@Component({
  selector: "swc-why-optee",
  host: {
    class: "block relative py-6 lg:py-12",
  },
  template: `
    <oui-circle class="-bottom-[187px] right-[35px] w-[398px]" theme="light" />

    <div
      class="content-centered relative flex flex-col items-center justify-center gap-8 p-6 lg:flex-row lg:gap-28 xl:gap-32"
    >
      <div
        class="flex flex-col items-center justify-center gap-4 text-center xl:items-start xl:gap-8 xl:text-left"
      >
        <h2
          class="text-2xl font-semibold leading-tight xl:text-4xl xl:leading-snug"
        >
          Pourquoi choisir Optee ?
        </h2>

        <p class="p-soft text-sm">
          Notre mission est d'accélérer le rythme de transition énergétique du
          secteur immobilier, en centralisant les parcours et en optimisant son
          financement.
        </p>

        <oui-button href="/demo" variant="primary">Contactez-nous</oui-button>
      </div>

      <div
        class="shadow-o flex w-full flex-col gap-10 rounded-2xl bg-white px-4 py-8 lg:w-auto xl:px-6 xl:py-10"
      >
        <div class="flex flex-col justify-center gap-10 lg:flex-row">
          <div class="text-center lg:w-80 xl:w-60">
            <div class="bigValue">48h</div>
            <p class="p-soft">
              en moyenne
              <br />
              pour récupérer un devis
            </p>
          </div>

          <oui-divider-vertical class="hidden lg:flex" />
          <oui-divider-horizontal />

          <div class="text-center lg:w-80 xl:w-60">
            <div class="bigValue">22%</div>
            <p class="p-soft">
              de réduction des coûts liée à la mise
              <br />
              en concurrence des professionnels
            </p>
          </div>
        </div>

        <oui-divider-horizontal />

        <div class="text-center">
          <div class="bigValue">35%</div>
          <p class="p-soft">de nos devis contiennent des CEE</p>
        </div>
      </div>
    </div>
  `,
  imports: [
    ButtonComponent,
    DividerHorizontalComponent,
    CircleComponent,
    DividerVerticalComponent,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhyOpteeComponent {}

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { ANTOINE_CALENDLY, buildAssetUrl } from "@optee/constants";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

const bgRadarPng = buildAssetUrl("bg-radar.png");

@Component({
  selector: "oui-radar-meet",
  host: {
    class: "block rounded-2xl bg-primary-900 bg-cover",
    "[style.background-image]": `'url(${bgRadarPng})'`,
  },
  template: `
    <div
      class="flex gap-4 rounded-2xl bg-gradient-to-l from-black/40 to-black/0 p-4 text-white lg:gap-8 lg:p-8"
    >
      <div class="ml-auto flex basis-[600px] flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="font-display text-xl font-semibold md:text-3xl">
            {{ heading() }}
          </div>

          <div class="font-display font-thin leading-tight">
            {{ description() }}
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <oui-button full [href]="ANTOINE_CALENDLY">
            Prendre rendez-vous
          </oui-button>

          <div class="text-center text-sm opacity-60">
            Dans la limite de 1 rdv/mois
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarMeetComponent {
  readonly heading = input<string>("Accompagnement sur-mesure");
  readonly description = input<string>(
    "Grâce à notre assistance à maitrise d’ouvrage faites le minimum pour récupérer le maximum.",
  );

  protected readonly ANTOINE_CALENDLY = ANTOINE_CALENDLY;
}

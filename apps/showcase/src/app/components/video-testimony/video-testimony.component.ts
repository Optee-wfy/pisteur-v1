import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

@Component({
  selector: "swc-video-testimony",
  host: {
    class: "p-20 flex flex-col items-center gap-16 overflow-hidden",
  },
  template: `
    <h2 class="text-pretty text-center text-4xl font-semibold">
      Plus de 30 clients sont passés par Optee
      <br />
      pour des demandes de GTB
    </h2>

    <div class="relative flex flex-col gap-3">
      <img
        class="relative rounded-xl"
        alt=""
        src="https://placecats.com/millie_neo/800/450"
      />

      <div class="text-center text-base italic">
        <span class="font-semibold">Marina Buisson</span>
        <span class="font-light">
          - Directrice des opération Bouygues Construction
        </span>
      </div>
    </div>

    <oui-button routerLink="/" variant="primary">
      Découvrir tous nos cas clients
    </oui-button>
  `,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoTestimonyComponent {}

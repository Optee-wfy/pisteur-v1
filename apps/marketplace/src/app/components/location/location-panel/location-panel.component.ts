import { animate, style, transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IconXmarkComponent } from "@optee/icons";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { LocationService } from "../../../services/location.service";
import { LocationBdnbComponent } from "../location-bdnb/location-bdnb.component";

@Component({
  selector: "mkp-location-panel",
  host: {
    class: "z-50",
  },
  template: `
    @if (locationService.activeLocation(); as location) {
      <!-- backdrop -->
      <div
        class="fixed inset-0 z-30 bg-black/75"
        [@fadeInOut]
        aria-hidden="true"
        (click)="locationService.closePanel()"
      ></div>

      <div
        class="shadow-o fixed inset-0 left-auto z-50 flex h-screen w-full max-w-screen-sm flex-col gap-4 rounded-bl-3xl rounded-tl-3xl bg-white"
        [@fadeTranslate]
      >
        <div class="flex flex-col overflow-y-auto">
          <div class="relative">
            <oui-button-icon
              class="text-primary-700 !absolute right-4 top-4 size-8"
              (click)="locationService.closePanel()"
            >
              <icon-xmark class="size-5" />
            </oui-button-icon>
            <img
              class="bg-primary-100 h-72 w-full flex-auto object-cover"
              [src]="location.streetViewUrl"
            />
          </div>

          <div class="flex flex-col gap-4 p-6">
            <div class="text-primary-700 flex flex-col gap-4">
              <div class="bg-primary-700 h-1 w-32"></div>
              <div class="font-display text-lg">
                Analyse intelligente de votre site.
              </div>
              <p class="max-w-prose text-xs">
                Les données ci-dessous ont été récupérées grâce à notre
                technologie, à partir de sources fiables telles que: ENEDIS et
                GRDF, fichiers fonciers de la DGFIP, les bases de données de
                l'ADEME et des données ouvertes de l'État.
              </p>
            </div>

            <div class="bg-primary-700 h-1 w-32"></div>

            <mkp-location-bdnb
              hideAddress
              theme="light"
              [location]="location"
            />
          </div>
        </div>
      </div>
    }
  `,
  imports: [
    RouterModule,
    LocationBdnbComponent,
    IconXmarkComponent,
    ButtonIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("fadeInOut", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("150ms", style({ opacity: 1 })),
      ]),
      transition(":leave", [animate("150ms", style({ opacity: 0 }))]),
    ]),
    trigger("fadeTranslate", [
      transition(":enter", [
        style({ transform: "translateX(16px)", opacity: 0 }),
        animate("150ms", style({ transform: "translateX(0)", opacity: 1 })),
      ]),
      transition(":leave", [
        animate("150ms", style({ transform: "translateX(16px)", opacity: 0 })),
      ]),
    ]),
  ],
})
export class LocationPanelComponent {
  protected readonly locationService = inject(LocationService);
}

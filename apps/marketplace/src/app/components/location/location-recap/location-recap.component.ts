import { DatePipe, DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { Location } from "@optee/models";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { InfoComponent } from "@optee/ui/components/molecules/info/info.component";

@Component({
  selector: "mkp-location-recap",
  template: `
    @let locationValue = location();
    <oui-info heading="Informations du site" variant="highlighted">
      <div class="grid grid-cols-3 gap-x-12 gap-y-4">
        <oui-info heading="Adresse du site">
          {{
            locationValue.name && locationValue.streetName
              ? locationNameDisplay(
                  locationValue.name,
                  locationValue.streetName
                )
              : "Résidence"
          }}
          <br />
          {{ locationValue.address }}
        </oui-info>

        <oui-info heading="Type de site">
          {{ locationValue.sectorLabel ?? "--" }}
        </oui-info>

        <oui-info heading="Année de construction">
          {{
            locationValue.creationDate
              ? (locationValue.creationDate | date: "yyyy")
              : "--"
          }}
        </oui-info>
        <oui-info heading="Nombre de bâtiments et lots">
          {{
            locationValue.nbBuildings
              ? locationValue.nbBuildings +
                " bâtiment" +
                (locationValue.nbBuildings > 1 ? "s" : "") +
                ","
              : "Inconnu,"
          }}
          {{
            locationValue.nbUnits
              ? locationValue.nbUnits +
                " lot" +
                (locationValue.nbUnits > 1 ? "s" : "")
              : "Inconnu"
          }}
        </oui-info>
        <oui-info heading="Surface chauffée">
          {{
            locationValue.surfaceThatRequiresHeating
              ? (locationValue.surfaceThatRequiresHeating | number: "1.0-0") +
                " m²"
              : "Non renseignée"
          }}
        </oui-info>
        <oui-info heading="Étiquette DPE">
          @if (locationValue.dpeLabel) {
            <oui-dpe-label class="mt-1" [letter]="locationValue.dpeLabel" />
          } @else {
            --
          }
        </oui-info>
      </div>
    </oui-info>
  `,
  imports: [InfoComponent, DatePipe, DecimalPipe, DpeLabelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationRecapComponent {
  readonly location = input.required<Location>();

  /**
   * Helper to display location name or "Résidence" + streetName if name starts with a number
   */
  protected locationNameDisplay(name: string, streetName: string): string {
    return /^\d/.test(name) ? "Résidence " + streetName : name;
  }
}

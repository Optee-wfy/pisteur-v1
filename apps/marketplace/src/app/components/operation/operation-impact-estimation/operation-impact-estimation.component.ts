import { DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { OperationRow } from "@optee/models";
import { InfoComponent } from "@optee/ui/components/molecules/info/info.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";

@Component({
  selector: "mkp-operation-impact-estimation",
  template: `
    <oui-bob
      class="print:pt-16"
      dropDown
      heading="Estimation prévisionnelle de l’impact du projet"
      [isOpen]="true"
    >
      <div class="flex flex-col gap-6">
        <oui-info
          heading="Simulation de l’impact énergétique"
          variant="highlighted"
        >
          <ul>
            <li>
              Réduction de la consommation énergétique de
              <strong>
                {{
                  (operation().annualElectricityConsumptionBefore
                    | number: "1.0-2") || "--"
                }}
                kWh/ep/m2/an
              </strong>
              à
              <strong>
                {{
                  (operation().estimatedElectricityConsumptionAfter
                    | number: "1.0-2") || "--"
                }}
                kWh/ep/m2/an
              </strong>
            </li>
            <li>
              Réduction des émissions de GES de
              <strong>
                {{
                  (operation().greenhouseGasEmissionsBefore
                    | number: "1.0-2") || "--"
                }}
                kgCO2/m²/an
              </strong>
              à
              <strong>
                {{
                  (operation().estimatedGreenhouseGasEmissionsAfter
                    | number: "1.0-2") || "--"
                }}
                kgCO2/m²/an
              </strong>
            </li>
            <li>
              Économies d’énergie estimées :
              <strong>
                {{
                  (operation().estimatedElectricityConsumptionAnnualSavings
                    | number: "1.0-2") || "--"
                }}
                kWh/an
              </strong>
            </li>
          </ul>
        </oui-info>
      </div>
    </oui-bob>
  `,
  imports: [BobComponent, DecimalPipe, InfoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationImpactEstimationComponent {
  operation = input.required<OperationRow>();
}

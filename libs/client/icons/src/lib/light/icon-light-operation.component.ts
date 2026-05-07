import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { OperationIcon } from "@optee/constants";
import { IconLightFileFoldedCornerComponent } from "./icon-light-file-folded-corner.component";
import { IconLightFlameComponent } from "./icon-light-flame.component";
import { IconLightFourCirclesComponent } from "./icon-light-four-circles.component";
import { IconLightHandshakeComponent } from "./icon-light-handshake.component";
import { IconLightHouseEmptyComponent } from "./icon-light-house-empty.component";
import { IconLightHouseLeafComponent } from "./icon-light-house-leaf.component";
import { IconLightHouseLightningComponent } from "./icon-light-house-lightning.component";
import { IconLightHouseMagnifierComponent } from "./icon-light-house-magnifier.component";
import { IconLightLightbulbOnComponent } from "./icon-light-lightbulb-on.component";
import { IconLightShieldComponent } from "./icon-light-shield.component";
import { IconLightSunComponent } from "./icon-light-sun.component";
import { IconLightVentilationComponent } from "./icon-light-ventilation.component";
import { IconLightWaterDropComponent } from "./icon-light-water-drop.component";

@Component({
  selector: "icon-light-operation",
  template: `
    @switch (operationName()) {
      @case ("audit") {
        <icon-light-house-magnifier />
      }
      @case ("solaire") {
        <icon-light-sun />
      }
      @case ("ventilation") {
        <icon-light-ventilation />
      }
      @case ("chauffage") {
        <icon-light-flame />
      }
      @case ("eclairage") {
        <icon-light-lightbulb-on />
      }
      @case ("isolation") {
        <icon-light-house-leaf />
      }
      @case ("renovation-globale") {
        <icon-light-handshake />
      }
      @case ("gtb") {
        <icon-light-house-lightning />
      }
      @case ("eau") {
        <icon-light-water-drop />
      }
      @case ("contrat") {
        <icon-light-file-folded-corner />
      }
      @case ("securite") {
        <icon-light-shield />
      }
      @case ("structure") {
        <icon-light-house-empty />
      }
      @default {
        <icon-light-four-circles />
      }
    }
  `,
  imports: [
    IconLightHouseMagnifierComponent,
    IconLightFileFoldedCornerComponent,
    IconLightFlameComponent,
    IconLightVentilationComponent,
    IconLightWaterDropComponent,
    IconLightLightbulbOnComponent,
    IconLightHouseLeafComponent,
    IconLightFourCirclesComponent,
    IconLightShieldComponent,
    IconLightHouseEmptyComponent,
    IconLightHouseLightningComponent,
    IconLightHandshakeComponent,
    IconLightSunComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLightOperationComponent {
  operationName = input.required<OperationIcon | null>();
}

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  IconBicolorReseauComponent,
  IconBoltInShapeComponent,
  IconBoxRoundedOnTopComponent,
  IconBricksAndSackComponent,
  IconDevisComponent,
  IconExclamationDiamondComponent,
  IconHouseWithDoorComponent,
  IconHouseWithFireComponent,
  IconLocationComponent,
  IconSquareGridComponent,
  IconUserNextToBuildingComponent,
} from "@optee/icons";
import type { BdnbPropertyCategory } from "../location-bdnb.type";

@Component({
  selector: "mkp-location-bdnb-category-icon",
  host: { class: "inline-block size-5" },
  template: `
    @switch (category()) {
      @case ("characteristics") {
        <icon-devis class="w-full" />
      }
      @case ("energy")
      @case ("estimatedConsumption")
      @case ("estimatedEnergyProfile") {
        <icon-bolt-in-shape class="w-full" />
      }
      @case ("structure") {
        <icon-house-with-door class="w-full" />
      }
      @case ("usage") {
        <icon-user-next-to-building class="w-full" />
      }
      @case ("dpeDetail") {
        <icon-box-rounded-on-top class="w-full" />
      }
      @case ("pdl") {
        <icon-square-grid class="w-full" />
      }
      @case ("hvac") {
        <icon-house-with-fire class="w-full" />
      }
      @case ("envelope") {
        <icon-bricks-and-sack class="w-full" />
      }
      @case ("network") {
        <icon-bicolor-reseau class="w-full" />
      }
      @case ("risks") {
        <icon-exclamation-diamond class="w-full" />
      }
      @default {
        <icon-location class="w-full" />
      }
    }
  `,
  imports: [
    IconLocationComponent,
    IconBoltInShapeComponent,
    IconSquareGridComponent,
    IconExclamationDiamondComponent,
    IconHouseWithDoorComponent,
    IconHouseWithFireComponent,
    IconBoxRoundedOnTopComponent,
    IconUserNextToBuildingComponent,
    IconBricksAndSackComponent,
    IconDevisComponent,
    IconBicolorReseauComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationBdnbCategoryIconComponent {
  readonly category = input.required<BdnbPropertyCategory["key"]>();
}

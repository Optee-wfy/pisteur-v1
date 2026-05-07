import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
} from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { getDpeLabel } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconArrowComponent,
  IconLightbulbComponent,
  IconLocationComponent,
  IconUpdateComponent,
} from "@optee/icons";
import type { Location, LocationUuid } from "@optee/models";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { TooltipEstimationComponent } from "@optee/ui/components/atoms/tooltip-estimation/tooltip-estimation.component";
import { isNotNullish } from "@optee/utils";
import { TooltipModule } from "primeng/tooltip";
import { combineLatest, filter, map, Subject } from "rxjs";
import { LocationService } from "../../../services/location.service";
import { PermissionService } from "../../../services/permission.service";

import { ListItemComponent } from "@optee/ui/components/molecules/list-item/list-item.component";
import { LocationEditFormDialogComponent } from "../location-form-dialog/location-edit-form-dialog.component";

@Component({
  selector: "mkp-location-stats",
  host: {
    class: "flex",
  },
  template: `
    @if (location$ | async; as location) {
      <!-- Don't remove width and height as it allows the browser to properly prepare the space before it loads -->
      <img
        class="bg-primary-100 h-48 max-w-[250px] flex-auto rounded-2xl object-cover"
        height="300"
        width="600"
        [src]="location.streetViewUrl"
      />

      <div class="flex flex-auto flex-col gap-6 px-5 py-1">
        <div class="font-display flex items-center gap-2 font-medium">
          <icon-location class="size-6" colorMode="colored" />
          Informations principales
        </div>

        <div class="grid grid-cols-[2fr_1fr] gap-x-10 gap-y-1">
          <oui-list-item label="Catégorie">
            {{ location.mainSectorLabel }}
          </oui-list-item>

          <oui-list-item label="Nbr. bât.">
            {{ location.nbBuildings }}
          </oui-list-item>

          <oui-list-item label="Emprise">
            {{ location.surfaceArea }}m²
          </oui-list-item>

          <oui-list-item label="Nbr. lots">
            {{ location.nbUnits }}
          </oui-list-item>

          <oui-list-item label="Année">
            {{ location.creationDate | date: "yyyy" }}
          </oui-list-item>

          <oui-list-item label="Niveaux">
            {{ location.nbStoreys }}
          </oui-list-item>

          <oui-list-item label="Surf. chauffée">
            {{ location.surfaceThatRequiresHeating | number: "1.0-0" }}m²
          </oui-list-item>
        </div>
      </div>

      <div
        class="relative flex flex-auto flex-col gap-6 border-l border-gray-100 px-5 py-1"
      >
        <div class="flex justify-between">
          <div class="font-display flex items-center gap-2 font-medium">
            <icon-lightbulb class="size-6" colorMode="colored" />
            Énergie
          </div>
          <div class="flex items-center gap-2">
            @if (permissionService.can("LOCATION_UPDATE")) {
              <oui-button-icon
                pTooltip="Modifier les données de mon site"
                tooltipPosition="top"
                (click)="openAddLocationModal(location)"
              >
                <icon-update class="size-5" colorMode="colored" />
              </oui-button-icon>
            }
            <oui-button-icon
              pTooltip="Accéder aux données détaillées du bâtiment"
              tooltipPosition="top"
              (click)="locationService.showPanel(location)"
            >
              <icon-arrow class="size-4" colorMode="colored" />
            </oui-button-icon>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-x-10 gap-y-1">
          <oui-list-item label="Énergie">
            {{ location.energyType }}
          </oui-list-item>

          <oui-list-item label="Étiquette DPE">
            <div class="relative w-10">
              @if (!location.dpeLabel) {
                <oui-tooltip-estimation
                  class="absolute right-0 top-0 text-lg"
                  textContent="Ceci est une estimation basée sur votre consommation"
                  tooltipPosition="left"
                />
              }
              @if (dpeLabel$ | async; as dpeLabel) {
                <oui-dpe-label [letter]="dpeLabel" />
              }
            </div>
          </oui-list-item>

          <oui-list-item label="Chauffage">
            {{ location.heatingSystem }}
          </oui-list-item>

          <oui-list-item label="Conso.">
            ~{{
              location.electricityConsumptionPerSquareMeter | number: "1.0-0"
            }}
            Kwh/m²/an
          </oui-list-item>

          <oui-list-item label="Système">
            {{ location.heatingType }}
          </oui-list-item>

          <oui-list-item label="Coût">
            ~{{
              location.annualElectricityCost
                | currency: "EUR" : "symbol" : "1.0-0"
            }}/an
          </oui-list-item>

          <oui-list-item label="Coût par lot">
            ~{{
              location.annualElectricityCostPerUnit
                | currency: "EUR" : "symbol" : "1.0-0"
            }}/an
          </oui-list-item>
        </div>
      </div>
    }
  `,
  imports: [
    AsyncPipe,
    DatePipe,
    IconLocationComponent,
    IconLightbulbComponent,
    CurrencyPipe,
    DecimalPipe,
    DpeLabelComponent,
    ListItemComponent,
    TooltipEstimationComponent,
    IconUpdateComponent,
    ButtonIconComponent,
    TooltipModule,
    IconArrowComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationStatsComponent {
  locationUuid = input.required<LocationUuid>();

  protected readonly dialogService = inject(DialogService);
  protected readonly locationService = inject(LocationService);
  protected readonly permissionService = inject(PermissionService);

  refresh$ = new Subject<void>();

  location$ = combineLatest([
    this.locationService.allForClient$,
    toObservable(this.locationUuid),
  ]).pipe(
    map(([locations, locationUuid]) =>
      locations.find((location) => location.uuid === locationUuid),
    ),
    filter(isNotNullish),
  );

  dpeLabel$ = this.location$.pipe(
    map((location) => {
      return (
        location.dpeLabel ??
        getDpeLabel(location.electricityConsumptionPerSquareMeter)
      );
    }),
  );

  async openAddLocationModal(location: Location) {
    await this.dialogService.open(LocationEditFormDialogComponent, {
      data: { location, mode: "edit" },
    });

    this.locationService.refresh();
  }
}

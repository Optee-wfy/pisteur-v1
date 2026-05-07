import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import type { EnergyType, HeatingSystem, MainSector } from "@optee/constants";
import {
  DPE_LABELS,
  ENERGY_TYPES,
  HEATING_SYSTEMS,
  LOCATION_SECTORS,
} from "@optee/constants";
import { IconSearchComponent } from "@optee/icons";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { PillOptionComponent } from "@optee/ui/components/atoms/pill/pill-option/pill-option.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { CheckboxModule } from "primeng/checkbox";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { SelectButtonModule } from "primeng/selectbutton";
import { startWith } from "rxjs";
import { AppService } from "../../../services/app.service";
import { LocationsFilterRowComponent } from "../location-filter-row/location-filter-row.component";

export type LocationsClientFilters = {
  address?: string | null;
  deals?: string | null;
  dpe?: string[] | null;
  energyTypes?: string[] | null;
  sectors?: string[] | null;
  heatingSystem?: string[] | null;
};

@Component({
  selector: "mkp-locations-filter-client",
  template: `
    @let isMobile = appService.isMobile$ | async;

    <oui-bob [dropDown]="isMobile" [isOpen]="!isMobile">
      <oui-title-tight preTitle>Filtrer par</oui-title-tight>

      <form [formGroup]="locationFilterForm">
        <div class="flex flex-col gap-4">
          <p-iconfield>
            <p-inputicon class="size-4">
              <icon-search />
            </p-inputicon>

            <input
              class="p-inputnumber-gray"
              fluid
              pInputText
              placeholder="Rechercher une opération"
              role="searchbox"
              type="search"
              variant="filled"
              [formControl]="locationFilterForm.controls.address"
            />
          </p-iconfield>

          <mkp-locations-filter-row heading="Opérations en cours">
            <p-selectButton
              class="p-selectButton--expanded"
              formControlName="deals"
              optionLabel="label"
              optionValue="value"
              [options]="[
                { label: 'Avec', value: 'avec' },
                { label: 'Sans', value: 'sans' },
              ]"
            />
          </mkp-locations-filter-row>

          <mkp-locations-filter-row
            dropDown
            heading="Performance énergétique"
            [isOpen]="true"
          >
            <div class="flex flex-col gap-2">
              @for (letter of DPE_LABELS; track letter; let i = $index) {
                <div class="flex gap-2">
                  <p-checkbox
                    formControlName="dpe"
                    [inputId]="'dpe-letter-' + letter"
                    [value]="letter"
                  />
                  <label class="cursor-pointer" [for]="'dpe-letter-' + letter">
                    <oui-dpe-label
                      variant="arrow"
                      [letter]="letter"
                      [style.width.px]="30 + i * 15"
                    />
                  </label>
                </div>
              }
            </div>
          </mkp-locations-filter-row>

          <mkp-locations-filter-row dropDown heading="Énergie" [isOpen]="true">
            <p-selectButton
              class="p-selectButton--transparent p-selectButton--pill"
              formControlName="energyTypes"
              optionLabel="name"
              optionValue="value"
              [multiple]="true"
              [options]="energyTypeOptions"
            >
              <ng-template let-option pTemplate="item">
                <oui-pill-option
                  [control]="locationFilterForm.controls.energyTypes"
                  [value]="option.value"
                >
                  {{ option.name }}
                </oui-pill-option>
              </ng-template>
            </p-selectButton>
          </mkp-locations-filter-row>

          <mkp-locations-filter-row dropDown heading="Catégorie d’usage">
            <p-selectButton
              class="p-selectButton--transparent p-selectButton--pill"
              formControlName="sectors"
              optionLabel="name"
              optionValue="value"
              [multiple]="true"
              [options]="sectorOptions"
            >
              <ng-template let-option pTemplate="item">
                <oui-pill-option
                  [control]="locationFilterForm.controls.sectors"
                  [value]="option.value"
                >
                  {{ option.name }}
                </oui-pill-option>
              </ng-template>
            </p-selectButton>
          </mkp-locations-filter-row>

          <!-- <mkp-locations-filter-row dropDown heading="Chauffage" /> -->

          <mkp-locations-filter-row dropDown heading="Système">
            <p-selectButton
              class="p-selectButton--transparent p-selectButton--pill"
              formControlName="heatingSystem"
              optionLabel="name"
              optionValue="value"
              [multiple]="true"
              [options]="heatingSystemOptions"
            >
              <ng-template let-option pTemplate="item">
                <oui-pill-option
                  [control]="locationFilterForm.controls.heatingSystem"
                  [value]="option.value"
                >
                  {{ option.name }}
                </oui-pill-option>
              </ng-template>
            </p-selectButton>
          </mkp-locations-filter-row>
        </div>

        <oui-button
          class="border-primary-700 mt-6 rounded-lg border"
          full
          size="small"
          variant="standard"
          (click)="locationFilterForm.reset()"
        >
          Réinitialiser
        </oui-button>
      </form>
    </oui-bob>
  `,
  imports: [
    AsyncPipe,
    BobComponent,
    TitleTightComponent,
    LocationsFilterRowComponent,
    DpeLabelComponent,
    CheckboxModule,
    InputText,
    IconField,
    IconSearchComponent,
    InputIcon,
    PillOptionComponent,
    SelectButtonModule,
    ReactiveFormsModule,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsFilterClientComponent {
  readonly filters = output<LocationsClientFilters | null>();

  energyTypes = ENERGY_TYPES.map((type) => ({ name: type, value: type }));

  sector = Object.entries(LOCATION_SECTORS).map(([key, value]) => ({
    name: value,
    value: key,
  }));

  heatingSystem = HEATING_SYSTEMS.map((type) => ({ name: type, value: type }));

  DPE_LABELS = DPE_LABELS;

  readonly locationFilterForm = new FormGroup({
    address: new FormControl(""),
    deals: new FormControl(""),
    dpe: new FormControl<string[]>([]),
    energyTypes: new FormControl<EnergyType[]>([]),
    sectors: new FormControl<MainSector[]>([]),
    heatingSystem: new FormControl<HeatingSystem[]>([]),
  });

  protected readonly appService = inject(AppService);

  protected readonly energyTypeOptions = ENERGY_TYPES.map((type) => ({
    name: type,
    value: type,
  }));

  protected readonly sectorOptions = Object.entries(LOCATION_SECTORS).map(
    ([key, value]) => ({
      name: value,
      value: key,
    }),
  );

  protected readonly heatingSystemOptions = HEATING_SYSTEMS.map((type) => ({
    name: type,
    value: type,
  }));

  private readonly subActiveFilter = this.locationFilterForm.valueChanges
    .pipe(startWith(this.locationFilterForm.value), takeUntilDestroyed())
    .subscribe((filters) => this.filters.emit(filters));
}

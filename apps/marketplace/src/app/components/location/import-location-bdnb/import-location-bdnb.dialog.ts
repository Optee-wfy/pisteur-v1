import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  resource,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import type {
  Department,
  LegalEntityType,
  LocationFilterPro,
} from "@optee/constants";
import {
  FRENCH_DEPARTMENTS,
  getLegalEntityTypeLabel,
  LEGAL_ENTITY_TYPES,
  LOCATION_FILTER_RANGES,
} from "@optee/constants";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import { IconSpinnerComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { PillOptionComponent } from "@optee/ui/components/atoms/pill/pill-option/pill-option.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { SliderComponent } from "@optee/ui/components/molecules/form/slider/slider.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { createNumberRangeControl } from "@optee/ui/functions/create-number-range-control.fn";
import { ToastService } from "@optee/ui/services/toast.service";
import { MultiSelect } from "primeng/multiselect";
import { SelectButtonModule } from "primeng/selectbutton";
import { debounceTime, map, startWith } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "mkp-import-location-bdnb-dialog",
  host: { class: "" },
  template: `
    <op-dialog-wrapper
      class="!max-h-[90vh] !max-w-3xl"
      (crossClick)="dialogRef.close(null)"
    >
      <div class="flex max-w-xl flex-col gap-3">
        <h2 class="text-xl font-semibold">
          Importation de bâtiments de la BDNB
        </h2>
        <p class="text-sm text-gray-600">
          Cette fonctionnalité permet d'importer des bâtiments depuis l'export
          de la BDNB incluant le lien avec une ou plusieurs personne(s)
          morale(s).
        </p>

        <oui-message variant="info">
          @let remaining = countRemaining.value();
          <p>
            Il reste actuellement
            <strong>
              {{ remaining !== undefined ? (remaining | number) : "--" }}
            </strong>
            bâtiments prêts à être importés avec les filtres appliqués.
          </p>
        </oui-message>

        @if (authService.isOpteeTester()) {
          @if (importing()) {
            <p class="text-xs italic text-gray-600">
              Cette opération peut prendre un certain temps en fonction du
              volume de données paramétré ci-dessous.
              <strong>
                Assurez-vous de ne pas fermer cette fenêtre pendant le processus
                d'importation!
              </strong>
              Vous pouvez toutefois interrompre le processus en cours
              d'exécution en cliquant sur "Arrêter l'importation".
            </p>
            <div class="flex items-center gap-2">
              <icon-spinner class="h-5 w-5 animate-spin" />
              @if (stop()) {
                <span>Arrêt en cours, le prochain batch sera annulé.</span>
              } @else {
                <span>
                  Importation en cours... (
                  {{ importProgress() }}% importés)
                </span>
                <a class="link" variant="outline" (click)="stop.set(true)">
                  Arrêter l'importation
                </a>
              }
            </div>
          } @else {
            <div class="flex">
              <form
                class="mb-3 flex w-full flex-col gap-4 rounded bg-gray-100 p-4"
              >
                <h3 class="text-lg font-semibold">Paramètres d'importation</h3>
                <div class="flex gap-4">
                  <label class="flex flex-col gap-1" for="totalToImport">
                    Nb. bâtiments à importer :
                    <input
                      class="w-20 rounded border border-gray-300 p-1"
                      id="totalToImport"
                      name="totalToImport"
                      type="number"
                      [(ngModel)]="totalToImport"
                    />
                  </label>
                </div>
                <hr />
                <div class="flex gap-4">
                  <div class="flex flex-col gap-4">
                    @let departmentCount =
                      locationFilterForm.controls.department.value?.length ?? 0;
                    <oui-form-field
                      name="department"
                      label="Département"
                      [control]="locationFilterForm.controls.department"
                    >
                      <p-multiselect
                        appendTo="body"
                        placeholder="Sélectionnez un département"
                        selectedItemsLabel="{{
                          departmentCount
                        }} départements sélectionnés"
                        showClear
                        [formControl]="locationFilterForm.controls.department"
                        [options]="departmentOptions"
                      />
                    </oui-form-field>

                    <oui-form-field
                      name="locationSector"
                      label="Type de bâtiment"
                      [control]="locationFilterForm.controls.legalEntityType"
                    >
                      <p-selectButton
                        class="p-selectButton--transparent p-selectButton--pill"
                        multiple
                        optionLabel="name"
                        optionValue="value"
                        [formControl]="
                          locationFilterForm.controls.legalEntityType
                        "
                        [options]="sectorOptions()"
                      >
                        <ng-template let-option pTemplate="item">
                          <oui-pill-option
                            [control]="
                              locationFilterForm.controls.legalEntityType
                            "
                            [value]="option.value"
                          >
                            {{ option.name }}
                          </oui-pill-option>
                        </ng-template>
                      </p-selectButton>
                    </oui-form-field>

                    <oui-form-field
                      class="flex-1"
                      name="nbUnits"
                      label="Nombre de lots"
                      [control]="locationFilterForm.controls.nbUnits"
                    >
                      <oui-slider
                        suffix="lot(s)"
                        [control]="locationFilterForm.controls.nbUnits"
                        [max]="locationRanges.NB_UNITS[1]"
                        [min]="locationRanges.NB_UNITS[0]"
                      />
                    </oui-form-field>

                    <oui-form-field
                      class="flex-1"
                      name="surfaceArea"
                      label="Emprise au sol"
                      [control]="locationFilterForm.controls.surfaceArea"
                    >
                      <oui-slider
                        suffix="m²"
                        [control]="locationFilterForm.controls.surfaceArea"
                        [max]="locationRanges.SURFACE_AREA[1]"
                        [min]="locationRanges.SURFACE_AREA[0]"
                      />
                    </oui-form-field>
                  </div>

                  <div class="flex flex-col gap-4">
                    <oui-form-field
                      class="flex-1"
                      name="height"
                      label="Hauteur"
                      [control]="locationFilterForm.controls.height"
                    >
                      <oui-slider
                        suffix="m"
                        [control]="locationFilterForm.controls.height"
                        [max]="locationRanges.HEIGHT[1]"
                        [min]="locationRanges.HEIGHT[0]"
                      />
                    </oui-form-field>

                    <oui-form-field
                      class="flex-1"
                      name="nbStoreys"
                      label="Nombre d'étages"
                      [control]="locationFilterForm.controls.nbStoreys"
                    >
                      <oui-slider
                        suffix="étage(s)"
                        [control]="locationFilterForm.controls.nbStoreys"
                        [max]="locationRanges.NB_STOREYS[1]"
                        [min]="locationRanges.NB_STOREYS[0]"
                      />
                    </oui-form-field>

                    <oui-form-field
                      class="flex-1"
                      name="nbBuildings"
                      label="Nombre de bâtiments"
                      [control]="locationFilterForm.controls.nbBuildings"
                    >
                      <oui-slider
                        suffix="bâtiment(s)"
                        [control]="locationFilterForm.controls.nbBuildings"
                        [max]="locationRanges.NB_BUILDINGS[1]"
                        [min]="locationRanges.NB_BUILDINGS[0]"
                      />
                    </oui-form-field>

                    <oui-form-field
                      class="flex-1"
                      name="isIndustrial"
                      label="Usage industriel"
                      [control]="locationFilterForm.controls.isIndustrial"
                    >
                      <p-selectButton
                        class="p-selectButton--transparent p-selectButton--pill"
                        [formControl]="locationFilterForm.controls.isIndustrial"
                        [options]="[
                          { label: 'Oui', value: true },
                          { label: 'Non', value: false },
                        ]"
                      >
                        <ng-template let-option pTemplate="item">
                          <div
                            class="font-display truncate rounded-3xl border px-2 py-1 text-sm"
                            [class]="{
                              'bg-primary-200 text-primary-700 border-gray-700':
                                locationFilterForm.controls.isIndustrial
                                  .value === option.value,
                              'border-gray-300':
                                locationFilterForm.controls.isIndustrial
                                  .value !== option.value,
                            }"
                          >
                            {{ option.label }}
                          </div>
                        </ng-template>
                      </p-selectButton>
                    </oui-form-field>
                  </div>
                </div>
              </form>
            </div>

            <div class="flex justify-center gap-2">
              <oui-button variant="outline" (click)="dialogRef.close(null)">
                Annuler
              </oui-button>
              <oui-button
                variant="primary"
                (click)="launchImport()"
                [disabled]="
                  !filters() ||
                  importing() ||
                  countRemaining.isLoading() ||
                  countRemaining.value() === 0
                "
              >
                Importer
              </oui-button>
            </div>
          }
        } @else {
          <p>Cette fonctionnalité est réservée aux testeurs Optee.</p>
        }
      </div>
    </op-dialog-wrapper>
  `,
  imports: [
    ButtonComponent,
    DialogWrapperComponent,
    IconSpinnerComponent,
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    MessageComponent,
    MultiSelect,
    FormFieldComponent,
    PillOptionComponent,
    SelectButtonModule,
    SliderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportLocationBdnbDialogComponent extends StronglyTypedDialog<
  null,
  null
> {
  protected readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  protected readonly locationRanges = LOCATION_FILTER_RANGES;

  protected readonly locationFilterForm = new FormGroup({
    department: new FormControl<Department[]>([]),
    surfaceArea: createNumberRangeControl([
      ...this.locationRanges.SURFACE_AREA,
    ]),
    height: createNumberRangeControl([...this.locationRanges.HEIGHT]),
    nbStoreys: createNumberRangeControl([...this.locationRanges.NB_STOREYS]),
    nbBuildings: createNumberRangeControl([
      ...this.locationRanges.NB_BUILDINGS,
    ]),
    nbUnits: createNumberRangeControl([...this.locationRanges.NB_UNITS]),

    legalEntityType: new FormControl<LegalEntityType[]>([], {
      nonNullable: true,
    }),
    isIndustrial: new FormControl<boolean | null>(null),
  });

  protected readonly importing = signal(false);

  protected readonly totalToImport = model(1000);
  protected readonly alreadyImported = signal(0);

  protected readonly stop = signal(false);

  protected readonly filters = signal<LocationFilterPro | null>(null);

  protected readonly departmentOptions = [...FRENCH_DEPARTMENTS];
  protected readonly sectorOptions = computed(() => {
    return LEGAL_ENTITY_TYPES.map((type) => ({
      name: getLegalEntityTypeLabel(type) ?? type,
      value: type,
    }));
  });

  protected readonly importProgress = computed(() => {
    const total = this.totalToImport();
    return total === 0 ? 0 : Math.round((this.alreadyImported() / total) * 100);
  });

  /**
   * Emits the current filter values whenever they change (600ms delay).
   * This is used to update the parent component with the latest filter values.
   */
  private readonly subActiveFilter = this.locationFilterForm.valueChanges
    .pipe(
      startWith(this.locationFilterForm.value),
      debounceTime(600),
      takeUntilDestroyed(),
      map((filters) => ({
        ...filters,
        department: filters?.department ?? [],
        legalEntityType: filters?.legalEntityType ?? [],
      })),
    )
    .subscribe((filters) => this.filters.set(filters));

  protected readonly countRemaining = resource({
    params: () => this.filters(),
    loader: async ({ params: filters }) => {
      if (!filters) {
        return 0;
      }
      return trpcClient.locations.countRemainingLocationBdnb
        .query(filters)
        .catch((e) => {
          this.toastService.openError(
            "Récupération du nombre de bâtiments restants",
            e,
          );
          return 0;
        });
    },
  });

  async launchImport() {
    if (!this.authService.isOpteeTester()) {
      alert("Accès réservé aux testeurs Optee");
      return;
    }
    this.importing.set(true);
    const totalToImport = this.totalToImport();
    const batchSize = 100;
    try {
      for (let index = 0; index < totalToImport; index += batchSize) {
        if (this.stop()) {
          this.stop.set(false);
          this.endImport();
          break;
        }
        const remaining = Math.min(batchSize, totalToImport - index);
        const activeFilters =
          this.filters() ?? this.locationFilterForm.getRawValue();
        await trpcClient.locations.importLocationBdnb.mutate({
          ...activeFilters,
          batchSize: remaining,
        });
        this.alreadyImported.set(index + remaining);
      }
      this.toastService.open(
        "success",
        "Importation des bâtiments de la BDNB",
        "Importation terminée",
      );
    } catch (error) {
      this.toastService.openError(
        "Importation des bâtiments de la BDNB",
        error,
      );
    } finally {
      this.endImport();
    }
  }

  private endImport() {
    this.importing.set(false);
    this.alreadyImported.set(0);
    this.countRemaining.reload();
  }
}

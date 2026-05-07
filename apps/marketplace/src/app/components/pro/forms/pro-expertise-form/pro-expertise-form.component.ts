import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  LOCATION_SECTORS,
  MAIN_SECTORS,
  PRO_PRESTATIONS,
  getProSubTypesByCategory,
} from "@optee/constants";
import { Pro } from "@optee/models";
import { ToastService } from "@optee/ui/services/toast.service";
import { Button } from "primeng/button";
import { Checkbox } from "primeng/checkbox";
import { RadioButtonModule } from "primeng/radiobutton";
import trpcClient from "../../../../../trpc-client";
import { ProService } from "../../../../services/pro.service";
import type { OptionGroupSelectorGroup } from "../../../shared/options-group-selector/options-group-selector.component";
import { OptionsGroupSelectorComponent } from "../../../shared/options-group-selector/options-group-selector.component";

type OperationCategory =
  (typeof PRO_PRESTATIONS)[number]["hsOperationCategory"];
type OperationSubCategoryId = ReturnType<
  typeof getProSubTypesByCategory
>[number]["hsPrestationId"];

@Component({
  selector: "mkp-pro-expertise-form",
  host: {
    class: "flex flex-col items-start gap-6 h-full",
  },
  template: `
    <header class="flex flex-col items-start justify-center gap-2">
      <h1 class="text-2xl font-semibold">Expertises</h1>
      <p class="text-sm text-gray-600">
        Ces informations nous permettront de mieux cibler les opportunités
        d’affaires.
      </p>
    </header>
    <form class="flex max-h-full w-full flex-col gap-6 overflow-y-auto text-sm">
      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium">
          Quel est votre secteur d'intervention ?
        </p>
        <div class="flex items-center gap-2">
          <label class="flex cursor-pointer select-none items-center gap-2">
            <p-checkbox
              name="interventionSector"
              value="par"
              (onChange)="onParticulierChange()"
              [(ngModel)]="interventionSector"
            />
            Particulier
          </label>
        </div>
        <div class="flex items-center gap-2">
          <label class="flex cursor-pointer select-none items-center gap-2">
            <p-checkbox
              name="interventionSector"
              value="pro"
              (onChange)="onProfessionnelChange()"
              [(ngModel)]="interventionSector"
            />
            Professionnel
          </label>
        </div>
        @if (interventionSector().includes("pro")) {
          <div class="flex flex-col gap-2 pl-6">
            @for (sector of sectors; track sector.value) {
              <label class="flex cursor-pointer select-none items-center gap-2">
                <p-checkbox
                  name="selectedSectorIntervention"
                  [(ngModel)]="selectedSectorIntervention"
                  [value]="sector.value"
                />
                {{ sector.name }}
              </label>
            }
          </div>
        }
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium" for="operationCategories">
            Catégorie(s) d’opération(s)
          </p>
          <button
            class="text-primary-600 text-xs font-medium underline"
            type="button"
            (click)="clearOperationCategories()"
          >
            Tout effacer
          </button>
        </div>
        <mkp-options-group-selector
          name="operationCategories"
          fullHeight
          [(ngModel)]="selectedOperationSubCategories"
          [groups]="operationGroups"
        />
      </div>

      <!-- <div class="flex flex-col gap-2">
        <div class="text-primary-900 text-sm font-medium">
          <p>Êtes-vous éligible aux Certificats d’Économie d’Énergie ?</p>
          <p class="text-sm text-gray-600">
            Via son rôle de mandataire, Optee est en mesure de financer les CEE
            de vos clients.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <p-radiobutton
            name="eligibilityCEE"
            inputId="eligible"
            [(ngModel)]="eligibilityCEE"
            [value]="true"
          />
          <label
            class="cursor-pointer select-none text-sm text-gray-600"
            for="eligible"
          >
            Oui
          </label>
        </div>
        <div class="flex items-center gap-2">
          <p-radiobutton
            name="eligibilityCEE"
            inputId="nonEligible"
            [(ngModel)]="eligibilityCEE"
            [value]="false"
          />
          <label
            class="cursor-pointer select-none text-sm text-gray-600"
            for="nonEligible"
          >
            Non
          </label>
        </div>
      </div> -->
    </form>

    <p-button
      label="Enregistrer les modifications"
      severity="success"
      type="submit"
      (click)="onSubmit()"
      [disabled]="!canSubmit()"
    />
  `,
  imports: [
    Button,
    FormsModule,
    ReactiveFormsModule,
    Checkbox,
    RadioButtonModule,
    OptionsGroupSelectorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProExpertiseFormComponent {
  private readonly toastService = inject(ToastService);
  private readonly proService = inject(ProService);

  private readonly pro = toSignal(this.proService.pro$, { initialValue: null });

  protected readonly OPERATION_CATEGORIES_LIST = PRO_PRESTATIONS;
  protected readonly operationGroups: OptionGroupSelectorGroup<
    OperationSubCategoryId,
    OperationCategory
  >[] = this.OPERATION_CATEGORIES_LIST.map((parent) => ({
    label: parent.hsOperationCategory,
    value: parent.hsOperationCategory,
    options: getProSubTypesByCategory(parent.hsOperationCategory).map(
      (sub) => ({
        label: sub.label,
        value: sub.hsPrestationId,
      }),
    ),
  }));

  protected readonly selectedOperationSubCategories = linkedSignal<
    OperationSubCategoryId[]
  >(() => {
    const prestations = this.pro()?.prestations;
    return prestations
      ? (Pro.formatToArray(prestations) as OperationSubCategoryId[])
      : [];
  });

  protected readonly eligibilityCEE = linkedSignal(
    () => this.pro()?.eligibilityCee ?? false,
  );

  protected readonly selectedSectorIntervention = linkedSignal(() => {
    const interventionSectors = this.pro()?.interventionSectors;
    return interventionSectors ? Pro.formatToArray(interventionSectors) : [];
  });

  protected readonly interventionSector = linkedSignal(() => {
    const interventionSectors = this.selectedSectorIntervention();
    const result: Array<"par" | "pro"> = [];

    const isPro = MAIN_SECTORS.some((sector) =>
      interventionSectors.includes(sector),
    );
    const isParticulier = interventionSectors.includes("par");

    if (isPro) {
      result.push("pro");
    }
    if (isParticulier) {
      result.push("par");
    }

    return result;
  });

  protected readonly sectors = Object.entries(LOCATION_SECTORS)
    .map(([key, value]) => ({ name: value, value: key }))
    .filter((sector) => sector.name !== "Résidentiel collectif");

  protected readonly canSubmit = computed(() => {
    return (
      this.selectedOperationSubCategories().length > 0 &&
      ((this.interventionSector().includes("pro") &&
        this.selectedSectorIntervention().length > 0) ||
        this.interventionSector().includes("par"))
    );
  });

  protected clearOperationCategories() {
    this.selectedOperationSubCategories.set([]);
  }

  protected onProfessionnelChange() {
    let currentSectors = this.selectedSectorIntervention();

    if (this.interventionSector().includes("pro")) {
      this.sectors.forEach((sector) => currentSectors.push(sector.value));
    } else {
      currentSectors = currentSectors.includes("par") ? ["par"] : [];
    }

    this.selectedSectorIntervention.set(currentSectors);
  }

  protected onParticulierChange() {
    let currentSectors = this.selectedSectorIntervention();

    if (this.interventionSector().includes("par")) {
      currentSectors.push("par");
    } else {
      currentSectors = currentSectors.filter((s) => s !== "par");
    }

    this.selectedSectorIntervention.set(currentSectors);
  }

  protected async onSubmit() {
    if (!this.canSubmit()) {
      return;
    }
    const contextMessage = "Mise à jour de votre profil d'entreprise";

    try {
      const updatedProData = {
        prestations: Pro.formatToString(this.selectedOperationSubCategories()),
        eligibilityCee: this.eligibilityCEE(),
        interventionSectors: Pro.formatToString(
          this.selectedSectorIntervention(),
        ),
      };

      await trpcClient.pros.selfUpdate.mutate(updatedProData);

      this.toastService.open(
        "success",
        contextMessage,
        "Les informations ont été mises à jour",
      );

      this.proService.refresh();
    } catch (err) {
      this.toastService.openError(contextMessage, err);
    }
  }
}

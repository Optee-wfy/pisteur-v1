import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
} from "@angular/core";
import { IconBoltComponent, IconChevronRightComponent } from "@optee/icons";
import { EnedisDataService } from "./enedis-data.service";

const ENERGY_ENEDIS_CONFIG = [
  { key: "totalConsumption2018", year: 2018 },
  { key: "totalConsumption2019", year: 2019 },
  { key: "totalConsumption2020", year: 2020 },
  { key: "totalConsumption2021", year: 2021 },
  { key: "totalConsumption2022", year: 2022 },
  { key: "totalConsumption2023", year: 2023 },
  { key: "totalConsumption2024", year: 2024 },
] as const;

type EnedisConsumptionByYear = Record<number, number | null>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "mkp-enedis-data-grid",
  host: { class: "flex w-full flex-col gap-4 lg:max-w-xl" },
  template: `
    <div [class]="containerClass()">
      <button
        type="button"
        (click)="isOpen.set(!isOpen())"
        [attr.aria-expanded]="isOpen()"
        [class.bg-granite-50]="!isColored() && isOpen()"
        [class]="headerClass()"
      >
        <div [class]="headerIconWrapperClass()">
          <icon-bolt [class]="headerIconClass()" />
        </div>

        <span [class]="headerLabelClass()">Consommation totale Enedis</span>
        <icon-chevron-right
          [class.rotate-90]="isOpen()"
          [class]="chevronClass()"
        />
      </button>

      @if (isOpen()) {
        <div [class]="tableWrapperClass()">
          <table
            class="text-granite-900 w-full border-collapse text-sm transition duration-200"
            [class.blur-[1px]]="noEnedisData()"
          >
            <thead class="bg-granite-50">
              <tr>
                <th
                  class="text-granite-700 border-granite-100 border-b px-4 py-2 text-left font-semibold"
                >
                  Année
                </th>
                <th
                  class="text-granite-700 border-granite-100 border-b px-4 py-2 text-left font-semibold"
                >
                  Conso. résidentielle
                </th>
                <th
                  class="text-granite-700 border-granite-100 border-b px-4 py-2 text-left font-semibold"
                >
                  Conso. entreprise
                </th>
              </tr>
            </thead>

            <tbody class="divide-granite-100 divide-y">
              @for (config of ENERGY_ENEDIS_CONFIG; track config.key) {
                <tr class="hover:bg-granite-50">
                  <td class="h-10 px-4 py-2 font-medium">
                    {{ config.year }}
                  </td>

                  <td class="h-10 px-4 py-2 tabular-nums">
                    @if (noEnedisData()) {
                      <span class="text-granite-300">&nbsp;</span>
                    } @else if (
                      residentialByYear()[config.year] !== null &&
                      residentialByYear()[config.year] !== undefined
                    ) {
                      {{ residentialByYear()[config.year] }} MWh
                    } @else {
                      <span class="text-granite-400">-</span>
                    }
                  </td>

                  <td class="h-10 px-4 py-2 tabular-nums">
                    @if (noEnedisData()) {
                      <span class="text-granite-300">&nbsp;</span>
                    } @else if (
                      enterpriseByYear()[config.year] !== null &&
                      enterpriseByYear()[config.year] !== undefined
                    ) {
                      {{ enterpriseByYear()[config.year] }} MWh
                    } @else {
                      <span class="text-granite-400">-</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>

          @if (noEnedisData()) {
            <div
              class="bg-granite-50/70 text-granite-700 absolute inset-0 flex items-center justify-center px-6 text-center text-sm font-medium backdrop-blur-sm"
            >
              Aucune donnée Enedis disponible pour cette adresse.
            </div>
          }
        </div>
      }
    </div>
  `,
  imports: [IconBoltComponent, IconChevronRightComponent],
})
export class EnedisDataGridComponent {
  readonly isOpen = model(true);
  readonly variant = input<"default" | "colored">("default");

  readonly ENERGY_ENEDIS_CONFIG = ENERGY_ENEDIS_CONFIG;

  private readonly enedisData = inject(EnedisDataService);

  protected readonly consumptionResidentialEnedis =
    this.enedisData.consumptionResidentialEnedis;

  protected readonly consumptionEnterpriseEnedis =
    this.enedisData.consumptionEnterpriseEnedis;

  protected readonly residentialByYear = computed<EnedisConsumptionByYear>(
    () => {
      const response = this.consumptionResidentialEnedis.value();
      if (!response?.results?.length) {
        return {};
      }

      return response.results.reduce<EnedisConsumptionByYear>((acc, row) => {
        acc[row.annee] =
          row.consommation_annuelle_totale_de_ladresse_mwh ?? null;
        return acc;
      }, {});
    },
  );

  protected readonly enterpriseByYear = computed<EnedisConsumptionByYear>(
    () => {
      const response = this.consumptionEnterpriseEnedis.value();
      if (!response?.results?.length) {
        return {};
      }

      return response.results.reduce<EnedisConsumptionByYear>((acc, row) => {
        acc[row.annee] =
          row.consommation_annuelle_totale_de_ladresse_mwh ?? null;
        return acc;
      }, {});
    },
  );

  protected readonly noEnedisData = computed(() => {
    const hasResidential = Boolean(
      this.consumptionResidentialEnedis.value()?.results?.length,
    );
    const hasEnterprise = Boolean(
      this.consumptionEnterpriseEnedis.value()?.results?.length,
    );
    return !hasResidential && !hasEnterprise;
  });

  protected readonly isColored = computed(() => this.variant() === "colored");

  protected containerClass(): string {
    if (!this.isColored()) {
      return "";
    }

    return "w-full rounded-[28px] border border-gray-300 bg-white p-4";
  }

  protected readonly headerClass = computed(() => {
    if (this.isColored()) {
      return "flex w-full cursor-pointer items-center gap-4 text-black transition-all";
    }

    return "text-granite-900 hover:bg-granite-50 flex cursor-pointer items-center gap-2 rounded-lg text-sm font-medium transition-all";
  });

  protected readonly headerIconWrapperClass = computed(() => {
    if (this.isColored()) {
      return "flex items-center justify-center text-green-600";
    }

    return "bg-granite-100 flex items-center justify-center rounded-lg p-1.5";
  });

  protected readonly headerIconClass = computed(() => {
    if (this.isColored()) {
      return "size-4 text-green-600";
    }

    return "text-granite-500 !size-5";
  });

  protected readonly headerLabelClass = computed(() => {
    if (this.isColored()) {
      return "text-md text-black md:text-xl font-medium";
    }

    return "";
  });

  protected readonly chevronClass = computed(() => {
    if (this.isColored()) {
      return "ml-auto size-4 text-black md:size-5";
    }

    return "ml-auto mr-2 size-4";
  });

  protected readonly tableWrapperClass = computed(() => {
    if (this.isColored()) {
      return "relative mt-4 overflow-hidden rounded-[20px]";
    }

    return "border-granite-100 relative overflow-hidden rounded-lg border";
  });
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  CLIMATE_ZONES,
  type ClimateZone,
  type MainSector,
} from "@optee/constants";

export type SectorZoneData<T> =
  | T
  | Partial<Record<MainSector, T>>
  | Partial<Record<MainSector, Partial<Record<ClimateZone, T>>>>
  | undefined
  | null;

@Component({
  selector: "oui-sector-zone-table",
  host: {
    class: "",
  },
  template: `
    @if (dataFormatted(); as data) {
      <table
        class="text-primary-900 bg-primary-50 w-full divide-y divide-gray-300 border border-gray-300 text-sm"
      >
        @if (data.resi) {
          <tr>
            <th class="w-20 p-2 font-normal" [rowSpan]="3">🏡</th>
            <td class="w-4 p-2 text-gray-600">H1</td>
            <td class="whitespace-nowrap p-2 text-center font-medium">
              {{ data.resi.H1 ?? "---" }}
            </td>
          </tr>
          <tr>
            <td class="w-4 p-2 text-gray-600">H2</td>
            <td class="whitespace-nowrap p-2 text-center font-medium">
              {{ data.resi.H2 ?? "---" }}
            </td>
          </tr>
          <tr>
            <td class="w-4 p-2 text-gray-600">H3</td>
            <td class="whitespace-nowrap p-2 text-center font-medium">
              {{ data.resi.H3 ?? "---" }}
            </td>
          </tr>
        }

        @if (data.ter) {
          <tr>
            <th class="w-20 p-2 font-normal" [rowSpan]="3">👔</th>
            <td class="w-4 p-2 text-gray-600">H1</td>
            <td class="whitespace-nowrap p-2 text-center font-medium">
              {{ data.ter.H1 ?? "---" }}
            </td>
          </tr>
          <tr>
            <td class="w-4 p-2 text-gray-600">H2</td>
            <td class="whitespace-nowrap p-2 text-center font-medium">
              {{ data.ter.H2 ?? "---" }}
            </td>
          </tr>
          <tr>
            <td class="w-4 p-2 text-gray-600">H3</td>
            <td class="whitespace-nowrap p-2 text-center font-medium">
              {{ data.ter.H3 ?? "---" }}
            </td>
          </tr>
        }
      </table>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectorZoneTableComponent {
  data = input.required<SectorZoneData<string | number>>();
  availableForSectors = input.required<MainSector[]>();

  dataFormatted = computed(() => {
    const data = this.data();

    if (!data) {
      return null;
    }

    type ClimateZoneData = Record<ClimateZone, string | number>;

    const dataBySector: Partial<Record<MainSector, ClimateZoneData>> = {};

    // Apply data to every sector and climate zone
    if (typeof data === "number" || typeof data === "string") {
      const climateZoneData: ClimateZoneData = {
        H1: data,
        H2: data,
        H3: data,
      };

      this.availableForSectors().forEach((sector) => {
        dataBySector[sector] = climateZoneData;
      });

      return dataBySector;
    }

    if (!data.resi || !data.ter) {
      return null;
    }

    if (typeof data.resi === "object" && typeof data.ter === "object") {
      return {
        resi: {
          H1: data.resi.H1,
          H2: data.resi.H2,
          H3: data.resi.H3,
        },
        ter: {
          H1: data.ter.H1,
          H2: data.ter.H2,
          H3: data.ter.H3,
        },
      };
    }

    this.availableForSectors().forEach((sector) => {
      const sectorData = data[sector];
      if (!sectorData || typeof sectorData === "object") {
        return;
      }

      const climateZoneData: ClimateZoneData = {
        H1: sectorData,
        H2: sectorData,
        H3: sectorData,
      };

      dataBySector[sector] = climateZoneData;
    });

    return dataBySector;
  });

  hasClimateZone = computed(() => {
    return (
      typeof this.data === "object" &&
      Object.keys(this.data).some((key) => key in CLIMATE_ZONES)
    );
  });
}

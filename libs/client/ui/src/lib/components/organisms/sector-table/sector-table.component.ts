import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { type MainSector } from "@optee/constants";

export type SectorData = Record<MainSector, number>;

@Component({
  selector: "oui-sector-table",
  host: {
    class: "",
  },
  template: `
    @if (data(); as data) {
      <table
        class="text-primary-900 bg-primary-50 w-full divide-y divide-gray-300 border border-gray-300 text-sm"
      >
        @if (data.resi === data.ter) {
          <tr>
            <th class="w-14 p-2 font-normal">🏡👔</th>
            <td class="whitespace-nowrap p-2 font-medium">
              {{ data.resi }}
            </td>
          </tr>
        } @else {
          @if (data.resi) {
            <tr>
              <th class="w-14 p-2 font-normal">🏡</th>
              <td class="whitespace-nowrap p-2 font-medium">
                {{ data.resi }}
              </td>
            </tr>
          }

          @if (data.ter) {
            <tr>
              <th class="w-14 p-2 font-normal">👔</th>
              <td class="whitespace-nowrap p-2 font-medium">
                {{ data.ter }}
              </td>
            </tr>
          }
        }
      </table>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectorTableComponent {
  data = input.required<SectorData>();
  availableForSectors = input.required<MainSector[]>();
}

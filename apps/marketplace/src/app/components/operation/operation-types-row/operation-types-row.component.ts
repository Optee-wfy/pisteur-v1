import { DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { OperationSubTypeInfo } from "@optee/constants";
import { PillComponent } from "@optee/ui/components/atoms/pill/pill/pill.component";
import { SectorTableComponent } from "@optee/ui/components/organisms/sector-table/sector-table.component";
import { SectorZoneTableComponent } from "@optee/ui/components/organisms/sector-zone-table/sector-zone-table.component";
import { Tooltip } from "primeng/tooltip";

@Component({
  selector: "mkp-operation-types-row",
  host: {
    class: "table-row align-middle border border-gray-300",
  },
  template: `
    <td class="min-w-72 max-w-96">
      {{ subType().label }}
      <br />
      <div class="font-medium text-[#FF7A59]">
        {{ subType().hsPrestationId }}
      </div>
      <div class="text-[#FF7A59]">
        {{ subType().hubspotTrigram }} / 81 rue de Monceau
      </div>
    </td>

    @if (visibleColumnsIds().includes("heating")) {
      <td>
        <div class="flex justify-center gap-2">
          <div pTooltip="Chauffage collectif" tooltipPosition="top">
            🏢{{ subType().availableForCollectiveHeating ? "✅" : "❌" }}
          </div>
          <div pTooltip="Chauffage individuel" tooltipPosition="top">
            🚪{{ subType().availableForIndividualHeating ? "✅" : "❌" }}
          </div>
        </div>
      </td>
    }

    @if (visibleColumnsIds().includes("sector")) {
      <td>
        <div class="flex justify-center gap-2">
          <div pTooltip="Résidentiel" tooltipPosition="top">
            🏡{{
              subType().availableForSectors.join().includes("resi")
                ? "✅"
                : "❌"
            }}
          </div>
          <div pTooltip="Tertiaire" tooltipPosition="top">
            👔{{
              subType().availableForSectors.join().includes("ter") ? "✅" : "❌"
            }}
          </div>
        </div>
      </td>
    }

    @if (visibleColumnsIds().includes("complexity")) {
      <td class="font-semibold">{{ subType().complexity }}/5</td>
    }

    @if (visibleColumnsIds().includes("ceeFile")) {
      <td>
        <oui-sector-zone-table
          [availableForSectors]="subType().availableForSectors"
          [data]="subType().ceeFile"
        />
      </td>
    }

    @if (visibleColumnsIds().includes("kwhAmount")) {
      <td>
        <oui-sector-zone-table
          [availableForSectors]="subType().availableForSectors"
          [data]="subType().kwhAmount"
        />
      </td>
    }

    @if (visibleColumnsIds().includes("impact")) {
      <td>
        <oui-sector-zone-table
          [availableForSectors]="subType().availableForSectors"
          [data]="subType().estimatedImpact"
        />
      </td>
    }

    @if (visibleColumnsIds().includes("cost")) {
      <td>
        @if (subType().estimatedCost; as estimatedCost) {
          <div class="flex flex-col gap-2">
            @for (
              surfaceArea of [100, 200, 400, 1200, 3000];
              track surfaceArea
            ) {
              <div class="relative">
                <oui-pill
                  class="absolute -right-2 -top-1 text-xs"
                  variant="blue-white"
                >
                  {{ surfaceArea | number: "1.0-0" }}m²
                </oui-pill>

                <oui-sector-table
                  [availableForSectors]="subType().availableForSectors"
                  [data]="{
                    resi: estimatedCost({
                      mainSector: 'resi',
                      surfaceArea,
                    }),
                    ter: estimatedCost({
                      mainSector: 'ter',
                      surfaceArea,
                    }),
                  }"
                />
              </div>
            }
          </div>
        } @else {
          N/A
        }
      </td>
    }

    @if (visibleColumnsIds().includes("coefficient")) {
      <td>
        <oui-sector-zone-table
          [availableForSectors]="subType().availableForSectors"
          [data]="subType().coefficient"
        />
      </td>
    }
  `,
  styles: `
    td {
      @apply p-4;
    }
  `,
  imports: [
    SectorZoneTableComponent,
    SectorTableComponent,
    PillComponent,
    DecimalPipe,
    Tooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationTypesRowComponent {
  subType = input.required<OperationSubTypeInfo>();
  visibleColumnsIds = input<string[]>([]);
}

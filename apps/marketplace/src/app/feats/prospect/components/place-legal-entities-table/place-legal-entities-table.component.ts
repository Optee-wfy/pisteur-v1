import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { getDepartmentByCode, nafToCategoryLabel } from "@optee/constants";
import type { LegalEntity, LocationBdnbUuid } from "@optee/models";
import { TableModule } from "primeng/table";
import { SolicitationIndicatorComponent } from "../solicitation-indicator/solicitation-indicator.component";

@Component({
  selector: "mkp-place-legal-entities-table",
  template: `
    <p-table class="prospect-table text-sm" [value]="legalEntities()">
      <ng-template #colgroup>
        <col class="cell-grow" style="min-width: 18rem" />
        <col style="width: 6.5rem" />
        <col style="width: 10rem" />
        <col style="width: 14rem" />
        <col style="width: 14rem" />
        <col class="cell-grow" style="min-width: 10rem" />
      </ng-template>
      <ng-template pTemplate="header">
        <tr>
          <th>Raison sociale</th>
          <th class="whitespace-nowrap">Concurrence</th>
          <th>Bâtiments gérés</th>
          <th>Taille</th>
          <th>Département</th>
          <th>Activité principale</th>
        </tr>
      </ng-template>
      <ng-template let-entity pTemplate="body">
        <tr>
          <!-- Raison sociale -->
          <td>
            <a
              class="pister-link flex items-center gap-1 capitalize"
              [routerLink]="[
                '/pro/pisteur/legal-entities/details',
                entity.uuid,
              ]"
            >
              {{ entity.name }}
            </a>
          </td>
          <!-- Concurrence -->
          <td>
            <mkp-solicitation-indicator
              entityType="company"
              [count]="entity.nbRelatedPros"
            />
          </td>
          <!-- Bâtiments gérés -->
          <td>
            @if (
              entity.nbRelatedLocations !== null &&
              entity.nbRelatedLocations !== undefined
            ) {
              {{
                entity.nbRelatedLocations > 1000
                  ? "1000+"
                  : entity.nbRelatedLocations
              }}
              Bâtiment{{ entity.nbRelatedLocations > 1 ? "s" : "" }}
            } @else {
              <span class="text-sm italic text-gray-300">Non connu</span>
            }
          </td>
          <!-- Taille -->
          <td>
            @if (
              entity.nbEmployeesRange !== null &&
              entity.nbEmployeesRange !== undefined
            ) {
              {{ entity.nbEmployeesRange }}
            } @else {
              <span class="text-sm italic text-gray-300">Non connu</span>
            }
          </td>
          <!-- Département -->
          <td>
            @let department = getDepartmentByCode(entity.zipCode);
            @if (department) {
              {{ department }}
            } @else {
              <span class="text-sm italic text-gray-300">Non connu</span>
            }
          </td>
          <!-- Activité principale -->
          <td>
            @let activity = nafToCategoryLabel(entity.mainBusinessActivity);
            @if (activity === null || activity === undefined) {
              <span class="text-sm italic text-gray-300">Non connu</span>
            } @else {
              {{ activity }}
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  imports: [TableModule, RouterLink, SolicitationIndicatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceLegalEntitiesTableComponent {
  readonly legalEntities = input.required<
    Array<
      LegalEntity & {
        nbRelatedLocations?: number | null;
        nbRelatedPros?: number | null;
      }
    >
  >();

  readonly locationBdnbUuid = input.required<LocationBdnbUuid>();
  readonly address = input.required<string>();
  protected readonly nafToCategoryLabel = nafToCategoryLabel;
  protected readonly getDepartmentByCode = getDepartmentByCode;
}

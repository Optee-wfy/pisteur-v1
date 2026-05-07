import { AsyncPipe, DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import {
  getOperationPhaseFromEnumForAdmin,
  OperationPhaseEnum,
} from "@optee/constants";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { Tooltip } from "primeng/tooltip";
import { combineLatest, from, map, of } from "rxjs";
import { z } from "zod";
import trpcClient from "../../../../trpc-client";

@Component({
  selector: "mkp-operations-unsynced-admin",
  template: `
    <oui-bob class="flex-auto" heading="Opérations non synchronisées">
      <p class="m-0 text-sm text-gray-600" underTitle>
        Voici la liste de toutes les opérations crées sur la plateforme mais non
        synchronisées avec Hubspot.
      </p>

      <table
        class="text-primary-900 bg-primary-50 w-full divide-y divide-gray-300 border border-gray-300 text-sm"
      >
        <thead>
          <tr>
            <th class="p-2 text-left">Nom</th>
            <th class="p-2 text-left">Prestation</th>
            <th class="p-2 text-left">Phase</th>
            <th class="p-2 text-left">Créé le</th>
            <th class="p-2 text-left">Client</th>
          </tr>
        </thead>

        <tbody>
          @for (row of unsyncedOperationsRows$ | async; track row.uuid) {
            <tr>
              <td class="p-2">
                {{ row.name }}
              </td>
              <td class="p-2">
                <div class="flex gap-2">
                  {{ row.prestation }}

                  @if (row.prestationExistsInHubspot) {
                    <div
                      pTooltip="Compatible avec Hubspot"
                      tooltipPosition="top"
                    >
                      ✅
                    </div>
                  } @else {
                    <a
                      href="https://app-eu1.hubspot.com/property-settings/144886321/properties?type=0-3&search=pres&action=edit&property=prestations"
                      pTooltip="Incompatible avec Hubspot (click to open)"
                      target="blank"
                      tooltipPosition="top"
                    >
                      ⚠️
                    </a>
                  }
                </div>
              </td>
              <td class="p-2">
                {{ row.phaseData?.enum ?? "Non défini" }} ({{
                  row.phaseData?.visibleInApp ? "Visible" : "Caché"
                }})
              </td>
              <td class="p-2">
                {{ row.createdAt | date }}
              </td>
              <td class="p-2">
                {{ row.clientName }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </oui-bob>
  `,
  imports: [BobComponent, AsyncPipe, DatePipe, ReactiveFormsModule, Tooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsUnsyncedAdminComponent {
  unsyncedOperationsRows$ = combineLatest([
    from(trpcClient.operations.getAllUnsynced.query()),
    of([] as string[]), // HubSpot removed — stub with empty array
  ]).pipe(
    map(([rows, hsOperationsTypes]) => {
      return rows.map((row) => {
        const { data: phaseEnum } = z
          .nativeEnum(OperationPhaseEnum)
          .safeParse(row.hsOperation.phase);

        return {
          uuid: row.hsOperation.uuid,
          name: row.hsOperation.name,
          prestation: row.hsOperation.prestationId,
          prestationExistsInHubspot: hsOperationsTypes.includes(
            row.hsOperation.prestationId ?? "",
          ),
          createdAt: row.hsOperation.createdAt,
          clientName: row.hsClient?.name,
          phaseData: phaseEnum
            ? getOperationPhaseFromEnumForAdmin(phaseEnum)
            : null,
        };
      });
    }),
  );
}

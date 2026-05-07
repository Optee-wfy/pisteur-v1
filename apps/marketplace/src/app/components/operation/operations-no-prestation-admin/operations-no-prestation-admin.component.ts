import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import {
  getOperationPhaseFromEnumForAdmin,
  OperationPhaseEnum,
} from "@optee/constants";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { from, map } from "rxjs";
import { z } from "zod";
import trpcClient from "../../../../trpc-client";

@Component({
  selector: "mkp-operations-no-prestation-admin",
  template: `
    <oui-bob
      class="flex-auto"
      heading="Opérations sans prestation (hors Upsell)"
    >
      <p class="m-0 text-sm text-gray-600" underTitle>
        Toutes ces opérations devraient posséder une prestation. Elles
        déclencheront une erreur dans l'application
      </p>

      <table
        class="text-primary-900 bg-primary-50 w-full divide-y divide-gray-300 border border-gray-300 text-sm"
      >
        <thead>
          <tr>
            <th class="p-2 text-left">Nom</th>
            <th class="p-2 text-left">Phase</th>
            <th class="p-2 text-left">Client</th>
          </tr>
        </thead>

        <tbody>
          @for (row of unsyncedOperationsRows$ | async; track row.uuid) {
            <tr>
              <td class="p-2">
                <a
                  class="link"
                  href="https://app-eu1.hubspot.com/contacts/144886321/record/0-3/{{
                    row.hsId
                  }}"
                  target="blank"
                >
                  {{ row.name }}
                </a>
              </td>
              <td class="p-2">
                {{ row.phaseData?.enum ?? "Non défini" }} ({{
                  row.phaseData?.visibleInApp ? "Visible" : "Caché"
                }})
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
  imports: [BobComponent, AsyncPipe, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsNoPrestationAdminComponent {
  unsyncedOperationsRows$ = from(
    trpcClient.operations.getAllWithoutPrestationAndNotUpsell.query(),
  ).pipe(
    map((rows) => {
      return rows.map((row) => {
        const { data: phaseEnum } = z
          .nativeEnum(OperationPhaseEnum)
          .safeParse(row.hsOperation.phase);

        return {
          hsId: row.hsOperation.id,
          uuid: row.hsOperation.uuid,
          name: row.hsOperation.name,
          prestation: row.hsOperation.prestationId,
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

import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { from, map } from "rxjs";
import trpcClient from "../../../../trpc-client";

@Component({
  selector: "mkp-quotes-unsynced-admin",
  template: `
    <oui-bob class="flex-auto" heading="Devis non synchronisés">
      <p class="m-0 text-sm text-gray-600" underTitle>
        Voici la liste de tous les devis crés sur la plateforme mais non
        synchronisés avec Hubspot.
      </p>

      <table
        class="text-primary-900 bg-primary-50 w-full divide-y divide-gray-300 border border-gray-300 text-sm"
      >
        <thead>
          <tr>
            <th class="p-2 text-left">Nom</th>
          </tr>
        </thead>

        <tbody>
          @for (row of unsyncedQuotesRows$ | async; track row.uuid) {
            <tr>
              <td class="p-2">
                {{ row.name }}
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
export class QuotesUnsyncedAdminComponent {
  unsyncedQuotesRows$ = from(trpcClient.quotes.getAllUnsynced.query()).pipe(
    map((rows) => {
      return rows.map((row) => {
        return {
          uuid: row.uuid,
          name: row.name,
        };
      });
    }),
  );
}

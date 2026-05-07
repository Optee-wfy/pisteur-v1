import { ChangeDetectionStrategy, Component, resource } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { IconSearchComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { Tooltip } from "primeng/tooltip";
import { debounceTime, startWith } from "rxjs";
import trpcClient from "../../../trpc-client";
import { QuoteRowComponent } from "./quote-row.component";

export type AdminQuote = Awaited<
  ReturnType<typeof trpcClient.quotes.getAllPending.query>
>[number];

@Component({
  selector: "mkp-quotes-list-admin",
  template: `
    <oui-bob heading="Devis en attente de validation">
      <div class="flex items-center justify-between gap-4">
        <p-iconfield class="mb-3 max-w-screen-sm flex-1">
          <p-inputicon class="size-4">
            <icon-search />
          </p-inputicon>

          <input
            class="p-inputnumber-gray"
            fluid
            pInputText
            placeholder="Rechercher par mot clé"
            role="searchbox"
            type="search"
            variant="filled"
            [formControl]="searchControl"
          />
        </p-iconfield>

        <oui-button
          pTooltip="Récupération de l'ensemble des devis qui ont démarré un workflow yousign, en attente de signature, mais sans signataire assigné."
          size="small"
          variant="primary"
          (click)="getAllCorrupt()"
        >
          Voir les devis corrompus (cf console)
        </oui-button>
        <small></small>
      </div>

      @if (pendingQuotesResource.isLoading()) {
        <p class="text-primary-900 text-center text-lg">
          Chargement des devis ...
        </p>
      } @else {
        @let quotes = pendingQuotesResource.value() ?? [];
        @if (quotes.length) {
          <table class="w-full table-fixed border-separate border-spacing-y-4">
            <thead
              class="font-display text-left text-sm tracking-tight text-gray-600"
            >
              <tr>
                <th class="max-w-80 px-2">Nom</th>
                <th class="max-w-80 px-2">Compte</th>
                <th class="max-w-80 px-2">Pro</th>
                <th class="max-w-80 px-2">Site</th>
                <th class="w-44">actions</th>
              </tr>
            </thead>

            <tbody>
              @for (quote of quotes; track quote.uuid) {
                <mkp-quote-row
                  class="w-full"
                  (validated)="pendingQuotesResource.reload()"
                  [quote]="quote"
                />
              }
            </tbody>
          </table>
        } @else {
          @if (pendingQuotesResource.error(); as error) {
            <oui-message
              severity="error"
              summary="Une erreur est survenue lors de la récupération des devis"
            >
              {{ error }}
            </oui-message>
          } @else {
            <p class="text-primary-900 text-center text-lg">
              {{
                searchControl.value
                  ? "Aucun devis trouvé"
                  : "Aucun devis en attente de validation 👌"
              }}
            </p>
          }
        }
      }
    </oui-bob>
  `,
  imports: [
    ReactiveFormsModule,
    BobComponent,
    InputText,
    IconField,
    IconSearchComponent,
    InputIcon,
    QuoteRowComponent,
    MessageComponent,
    ButtonComponent,
    Tooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuotesListAdminComponent {
  protected readonly searchControl = new FormControl("");
  protected readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(400), startWith("")),
  );

  protected readonly pendingQuotesResource = resource({
    params: () => ({
      term: this.searchTerm(),
    }),
    loader: ({ params }) => trpcClient.quotes.getAllPending.query(params),
  });

  async getAllCorrupt() {
    const quotes = await trpcClient.quotes.getAllCorrupt.query();
    alert(
      "Devis corrompus (Yousign enclenché sans signataire - cf console): " +
        quotes.length,
    );
  }
}

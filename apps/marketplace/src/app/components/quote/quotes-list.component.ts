import {
  ChangeDetectionStrategy,
  Component,
  inject,
  resource,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { CTA } from "@optee/constants";
import {
  IconInfoComponent,
  IconRefreshComponent,
  IconSearchComponent,
} from "@optee/icons";
import type { OperationUuid } from "@optee/models";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { Tooltip } from "primeng/tooltip";
import { debounceTime, startWith } from "rxjs";
import { OperationService } from "../../services/operation.service";
import { QuoteService } from "../../services/quote.service";
import { QuoteCardComponent } from "./quote-card.component";

@Component({
  selector: "mkp-quotes-list",
  host: {
    class: "max-w-app mx-auto w-full flex flex-col gap-6",
  },
  template: `
    <oui-bob heading="Vos propositions commerciales">
      <div class="flex flex-col gap-4">
        <oui-message class="max-w-screen-sm" severity="info">
          Comparez vos devis reçus pour chacune de vos opérations commandées.
          Attention, une fois les devis refusés, vous ne pouvez plus revenir en
          arrière.
        </oui-message>

        <p-iconfield class="max-w-screen-sm flex-1">
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
      </div>
    </oui-bob>

    <div class="flex flex-col gap-6 pb-6">
      @if (filteredQuotesResource.isLoading()) {
        <div
          class="flex h-16 w-full items-center justify-center gap-6 rounded-2xl bg-white p-4"
        >
          <icon-refresh class="size-8 animate-spin" />
          <span class="italic">Chargement des devis...</span>
        </div>
      }

      @for (operation of filteredQuotesResource.value(); track operation.uuid) {
        <div class="rounded-2xl bg-white p-6 shadow-md">
          <header class="flex flex-col gap-2">
            <h2 class="inline-flex flex-wrap-reverse items-center gap-4">
              <span class="text-lg font-bold">
                {{ operation.prestationId }} / {{ operation.location.name }}
              </span>
              <oui-button-icon
                class="text-primary-700"
                tooltipPosition="top"
                (click)="openOperationDetails(operation.uuid)"
                [pTooltip]="CTA.seeThisOperation"
              >
                <icon-info class="size-5" />
              </oui-button-icon>
            </h2>
            @let operationLocation = operation.location;
            <p>
              {{ operationLocation.streetName }},
              {{ operationLocation.zipcode }}
              {{ operationLocation.city }}
            </p>
          </header>

          <div class="grid gap-4 py-4 lg:grid-cols-2">
            @for (hsQuote of operation.hsQuotes; track hsQuote.uuid) {
              <mkp-quote-card
                [hsPro]="hsQuote.hsPro"
                [hsQuote]="hsQuote"
                [operationUuid]="operation.uuid"
                [signatory]="operation.signatoryContact ?? null"
              />
            }
          </div>
          <footer>
            <p class="text-xs tracking-tight text-gray-600">
              * Le tarif affiché concerne le reste à charge, après réductions et
              subventions, tout frais inclus.
              <br />
              ** L'opération débutera une fois l'acompte payé.
            </p>
          </footer>
        </div>
      } @empty {
        @if (!filteredQuotesResource.isLoading()) {
          <div
            class="flex h-16 w-full items-center justify-center rounded-2xl bg-white p-4"
          >
            <span class="ml-2 font-semibold">
              Aucun devis
              @if (searchTerm(); as expression) {
                trouvé pour "{{ expression }}"
              } @else {
                pour le moment
              }
            </span>
          </div>
        }
      }
    </div>
  `,
  imports: [
    BobComponent,
    ReactiveFormsModule,
    InputText,
    ButtonIconComponent,
    MessageComponent,
    IconRefreshComponent,
    IconField,
    IconInfoComponent,
    IconSearchComponent,
    Tooltip,
    InputIcon,
    QuoteCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuotesListComponent {
  protected readonly quotesService = inject(QuoteService);
  protected readonly operationService = inject(OperationService);

  protected readonly searchControl = new FormControl("");

  CTA = CTA;

  protected readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(400), startWith("")),
  );

  protected readonly filteredQuotesResource = resource({
    params: () => ({ term: this.searchTerm() }),
    loader: ({ params }) => this.quotesService.getAllForClient(params.term),
  });

  async openOperationDetails(operationUuid: OperationUuid) {
    const operation = await this.operationService.get(operationUuid);
    if (!operation) {
      return;
    }
    this.operationService.showPanel(operation);
  }
}

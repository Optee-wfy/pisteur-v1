import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  resource,
  signal,
} from "@angular/core";
import { UserType } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import { IconPlusComponent } from "@optee/icons";
import type { OperationUuid, QuoteUuid } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { sleep } from "@optee/utils";
import trpcClient from "../../../../trpc-client";
import { AuthService } from "../../../services/auth.service";
import { ProService } from "../../../services/pro.service";
import { QuoteService } from "../../../services/quote.service";
import { QuoteCardComponent } from "../../quote/quote-card.component";
import { QuoteUploadComponent } from "../../quote/quote-upload.component";

@Component({
  selector: "mkp-operations-quotes",
  host: {
    class: "flex flex-col gap-4 overflow-auto",
  },
  template: `
    @if (quotes.isLoading()) {
      <oui-message class="max-w-screen-sm" severity="info">
        Chargement des devis...
      </oui-message>
    } @else if (quotes.error()) {
      <oui-message class="max-w-screen-sm" severity="error">
        Une erreur est survenue lors du chargement des devis. Merci de contacter
        le support
      </oui-message>
    } @else {
      @for (row of quotes.value(); track row.hsQuote.uuid) {
        <mkp-quote-card
          [fileId]="row.fileId"
          [hsPro]="row.hsPro"
          [hsQuote]="row.hsQuote"
          [operationUuid]="operationUuid()"
          [signatory]="row.signatoryContact"
        />
      } @empty {
        @if (quoteUuidToUpload()) {
          @if (hasJustUploaded()) {
            <oui-message class="w-full" severity="loading">
              <div class="flex w-full items-center gap-4">
                <span class="w-full">
                  Votre devis a bien été déposé !
                  <br />
                  Il sera visible dans environ 2 minutes, vous pouvez continuer
                  à naviguer sur la plateforme.
                </span>
              </div>
            </oui-message>
          } @else {
            <oui-button variant="primary" (click)="openUploadQuoteDialog()">
              <icon-plus class="size-6" />
              Déposer mon devis
            </oui-button>
          }
        } @else {
          <oui-message class="w-full" severity="info">
            Aucun devis n'est associé à cette opération.
          </oui-message>
        }
      }
    }
  `,
  imports: [
    QuoteCardComponent,
    MessageComponent,
    ButtonComponent,
    IconPlusComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsQuotesComponent {
  readonly operationUuid = input.required<OperationUuid>();

  readonly quoteUuidToUpload = model<QuoteUuid | null>(null);

  private readonly authService = inject(AuthService);
  private readonly proService = inject(ProService);
  private readonly toastService = inject(ToastService);
  private readonly quoteService = inject(QuoteService);
  private readonly dialogService = inject(DialogService);

  protected readonly hasJustUploaded = signal(false);

  protected readonly quotes = resource({
    params: () => ({
      operationUuid: this.operationUuid(),
      displayFor: this.authService.loggedAs(),
      proUuid: this.proService.currentProUuid(),
    }),
    loader: async ({ params }) => {
      try {
        const res = await trpcClient.quotes.getAllByOperationUuid.query({
          operationUuid: params.operationUuid,
          displayFor: params.displayFor ?? UserType.CLIENT,
        });

        return res.sort(
          (a, b) =>
            this.quoteService.getQuoteWeight(a) -
            this.quoteService.getQuoteWeight(b),
        );
      } catch (err) {
        this.toastService.openError(
          "Récupération des devis par opération",
          err,
        );
        return [];
      }
    },
  });

  async openUploadQuoteDialog() {
    const { res } = await this.dialogService.open(QuoteUploadComponent, {
      data: {
        quoteUuid: this.quoteUuidToUpload(),
      },
    });
    if (res) {
      this.hasJustUploaded.set(true);
      await sleep(120000); // wait 2 minutes before reloading quotes to let Hubspot process the new quote
      this.quotes.reload();
      this.hasJustUploaded.set(false);
      this.quoteUuidToUpload.update(() => null);
    }
  }
}

import { CurrencyPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { QuoteStage } from "@optee/constants";
import type {
  AttachmentHsId,
  ContactUuid,
  HubspotPro,
  HubspotQuote,
  OperationUuid,
  QuoteUuid,
  SignatoryContact,
} from "@optee/models";
import { Pro, Quote } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { isEmailFromOptee, isNotNullish } from "@optee/utils";
import { filter, map } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { OperationService } from "../../services/operation.service";
import { QuoteService } from "../../services/quote.service";
import { OperationSignatoryComponent } from "../operation/operation-signatory/operation-signatory.component";

@Component({
  selector: "mkp-quote-card",
  host: {
    class:
      "flex flex-col justify-between divide-y-2 divide-gray-300 rounded-lg border border-gray-300 p-4",
  },
  template: `
    @if (quote(); as quote) {
      @if (pro(); as pro) {
        <section
          class="flex w-full flex-1 gap-4 pb-4"
          [class.opacity-30]="quote.stage === QuoteStage.FERME_PERDU"
        >
          <!-- Partenaire Logo -->
          <span
            class="md:text-md bg-primary-50 flex size-20 items-center justify-center rounded-lg text-xs lg:size-28 xl:size-36"
          >
            Partenaire
          </span>

          <!-- Partenaire Info -->
          <div class="flex-1">
            <h3 class="text-pretty font-semibold tracking-tight">
              {{ pro.name }}
            </h3>
            <span class="text-sm text-gray-600">
              {{ pro.zipcode }} {{ pro.city }}
            </span>
          </div>

          <!-- Montant -->
          <div class="flex flex-col justify-between text-right">
            <div class="flex flex-1 flex-col">
              <span class="font-semibold">
                {{ quote.postTaxAmount | currency: "EUR" : "symbol" : "1.0-0" }}
                TTC
              </span>

              @if (quote.hasSubvention()) {
                <span class="text-xs tracking-tight text-gray-400">
                  Subventions incluses
                </span>
              }
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-1">
              @if (!authService.isLoggedAsPro() || fileId()) {
                <a
                  class="text-primary-700 hover:text-primary-800 cursor-pointer text-sm"
                  (click)="seeQuote()"
                >
                  Voir le devis
                </a>
              } @else {
                <span class="text-sm text-gray-400">
                  Devis non disponible. Contacter le support.
                </span>
              }

              @let proEmail = pro.mailContact;
              @if (!authService.isLoggedAsPro() && proEmail) {
                <a
                  class="text-primary-700 hover:text-primary-800 text-sm font-medium"
                  [href]="
                    quoteService.formatEmailHrefToContactPro({
                      email: pro?.mailContact,
                      operationName: quote?.name,
                    })
                  "
                >
                  Contacter le partenaire
                </a>
              }
            </div>
          </div>
        </section>

        <footer
          class="flex flex-wrap items-center justify-between gap-2 px-2 pt-3 text-gray-600"
        >
          @switch (quote.stage) {
            @case (QuoteStage.EN_ATTENTE_DE_SIGNATURE) {
              @if (authService.isLoggedAsPro()) {
                <span class="text-gray-600">
                  En attente de signature du client
                </span>
              } @else {
                <!-- Logged as Client -->
                @let contactUuid = currentUserContact().uuid;
                @if (contactUuid && signatory()?.uuid === contactUuid) {
                  <div class="flex gap-4">
                    <oui-button
                      class="border-primary-700 rounded-md border"
                      size="small"
                      (click)="rejectQuote(quote.uuid)"
                    >
                      Refuser
                    </oui-button>
                    <oui-button
                      size="small"
                      variant="primary"
                      [routerLink]="'/client/quotes/' + quote.uuid"
                    >
                      Accepter
                    </oui-button>
                  </div>
                } @else {
                  <mkp-operation-signatory
                    prefix="Signataire:"
                    (signatoryChanged)="signatory.set($event)"
                    [operationUuid]="operationUuid()"
                    [signatory]="signatory()"
                  />
                }
              }
            }
            @case (QuoteStage.DEVIS_SIGNE) {
              <span class="text-green-600">Devis signé</span>
            }
            @case (QuoteStage.FERME_PERDU) {
              <span class="text-gray-600">Devis refusé</span>
            }
            @default {
              @if (authService.isLoggedAsPro()) {
                <span class="text-gray-600">
                  En attente de décision du client
                </span>
              }
            }
          }
        </footer>
      }
    }
  `,
  imports: [
    CurrencyPipe,
    RouterLink,
    ReactiveFormsModule,
    ButtonComponent,
    OperationSignatoryComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteCardComponent {
  readonly hsQuote = input.required<HubspotQuote>();
  readonly hsPro = input.required<HubspotPro>();
  readonly operationUuid = input.required<OperationUuid>();
  readonly fileId = input<AttachmentHsId | null>();
  readonly signatory = model.required<SignatoryContact | null>();

  protected readonly authService = inject(AuthService);
  protected readonly quoteService = inject(QuoteService);
  private readonly router = inject(Router);
  private readonly operationService = inject(OperationService);

  protected readonly quote = linkedSignal(() =>
    Quote.init({
      hsQuote: this.hsQuote(),
      fileId: this.fileId(),
    }),
  );

  protected readonly isAwaitingForSignature = computed(
    () => this.quote()?.stage === QuoteStage.EN_ATTENTE_DE_SIGNATURE,
  );

  protected readonly pro = computed(() => Pro.init(this.hsPro()));

  protected readonly QuoteStage = QuoteStage;

  protected readonly currentUserContact = toSignal(
    this.authService.contact$.pipe(
      filter(isNotNullish),
      map((contact) => ({
        uuid: contact.uuid,
        adminOptee: isEmailFromOptee(contact.email),
      })),
    ),
    {
      initialValue: { uuid: null as unknown as ContactUuid, adminOptee: false },
    },
  );

  protected async rejectQuote(uuid: QuoteUuid) {
    const rejectReason = await this.quoteService.rejectQuote(uuid);
    if (rejectReason) {
      this.quote.update(() => {
        return Quote.init({
          hsQuote: {
            ...this.hsQuote(),
            stage: QuoteStage.FERME_PERDU,
          },
          fileId: this.fileId(),
        });
      });
    }
  }

  protected seeQuote() {
    if (!this.quote()) {
      console.error("Impossible d'afficher un devis sans son uuid");
      return;
    }
    if (this.authService.isLoggedAsPro()) {
      this.quoteService.downloadPdf(this.quote());
    } else {
      this.operationService.closePanel();
      this.router.navigate(["/client/quotes", this.quote()?.uuid]);
    }
  }
}

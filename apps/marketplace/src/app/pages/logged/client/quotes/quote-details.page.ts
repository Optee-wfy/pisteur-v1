import { AsyncPipe, NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
} from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import type { OperationCreatedBy } from "@optee/constants";
import { QuoteStage } from "@optee/constants";
import {
  IconArrowLeftComponent,
  IconDownloadComponent,
  IconSuccessComponent,
} from "@optee/icons";
import type {
  AttachmentHsId,
  ContactUuid,
  LocationUuid,
  OperationUuid,
  QuoteHsId,
  QuoteUuid,
} from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { DividerHorizontalComponent } from "@optee/ui/components/atoms/divider/divider-horizontal/divider-horizontal.component";
import { DividerVerticalComponent } from "@optee/ui/components/atoms/divider/divider-vertical/divider-vertical.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { TrustResourcePipe } from "@optee/ui/pipes/trust-resource.pipe";
import { isNotNullish } from "@optee/utils";
import type { Observable } from "rxjs";
import { catchError, filter, map, of, switchMap, tap } from "rxjs";
import { QuoteSidebarApprovedComponent } from "../../../../components/quote/quotes-sidebar-approved.component";
import { QuoteSidebarPendingComponent } from "../../../../components/quote/quotes-sidebar-pending.component";
import { QuoteSidebarRejectedComponent } from "../../../../components/quote/quotes-sidebar-rejected.component";
import { AppService } from "../../../../services/app.service";
import { QuoteService } from "../../../../services/quote.service";
import { TrackingService } from "../../../../services/tracking.service";

type QuoteDetails = {
  quoteUuid: QuoteUuid;
  operationUuid: OperationUuid;
  locationUuid: LocationUuid;
  quoteHsId: QuoteHsId | null;
  url: string | null;
  name: string | null;
  proName: string | null;
  proContactMail: string | null;
  signatoryUuid: ContactUuid | null;
  stage: QuoteStage | null;
  yousignAlreadyStarted: boolean;
  fileId: AttachmentHsId | null;
  operationCreatedBy: OperationCreatedBy | null;
};

@Component({
  selector: "mkp-quote-details",
  host: {
    class:
      "flex flex-col lg:flex-row-reverse flex-1 gap-6 items-center justify-start w-full max-w-app mx-auto p-4 xl:p-10",
  },
  template: `
    <!-- File viewer -->
    @if (quoteDetails$ | async; as quote) {
      <!-- Mobile header + Sidebar -->
      @if (quote.proContactMail || quote.url) {
        <div class="mx-auto" style="align-self: self-start;">
          <div class="flex w-full flex-col gap-4 lg:hidden">
            <ng-container *ngTemplateOutlet="backButton" />
            <oui-divider-horizontal />
            <ng-container *ngTemplateOutlet="fileTitle" />
            <ng-container *ngTemplateOutlet="fileActions" />
          </div>

          <section
            class="bg-primary-700 relative flex-1 overflow-hidden rounded-[2rem] sm:min-w-96 lg:w-80 lg:max-w-sm"
          >
            <span
              class="absolute -right-8 -top-36 z-10 h-64 w-64 rotate-[-34.176deg] rounded-[40px] [background:rgba(236,242,255,0.08)]"
            ></span>
            <div
              class="divider-primary-400 divider relative z-20 flex flex-col items-start gap-8 p-6"
            >
              @switch (quote.stage) {
                @case (QuoteStage.DEVIS_SIGNE) {
                  <mkp-quote-sidebar-approved />
                }
                @case (QuoteStage.FERME_PERDU) {
                  <mkp-quote-sidebar-rejected />
                }
                @default {
                  <mkp-quote-sidebar-pending
                    [operationCreatedBy]="quote.operationCreatedBy"
                    [operationUuid]="quote.operationUuid"
                    [quoteUuid]="quote.quoteUuid"
                    [signatoryUuid]="quote.signatoryUuid"
                  />
                }
              }
            </div>
          </section>
        </div>
      }

      <div
        class="relative flex w-full max-w-screen-lg flex-1 flex-col rounded-2xl bg-white shadow-md md:h-full lg:w-auto"
      >
        <nav class="hidden px-6 py-3 lg:flex">
          <ng-container *ngTemplateOutlet="backButton" />
          <oui-divider-vertical />
          <ng-container *ngTemplateOutlet="fileTitle" />
          <hr />
          <ng-container *ngTemplateOutlet="fileActions" />
        </nav>
        @if (quote.url) {
          <iframe
            class="flex-1"
            frameborder="0"
            [src]="
              quote.url + '#toolbar=0&navpanes=0&scrollbar=0&view=Fit'
                | trustResource
            "
          ></iframe>
        } @else if (!appService.isLoading()) {
          <oui-message
            class="mx-auto"
            severity="error"
            summary="Une erreur est survenue lors de la récupération du document"
          >
            Le document associé à ce devis ne peut pas être affiché
          </oui-message>
        }
        @if (quote.stage === QuoteStage.DEVIS_SIGNE) {
          <div
            class="absolute bottom-6 flex w-full items-center justify-center"
          >
            <div
              class="flex h-11 items-center justify-center gap-2 rounded-3xl bg-green-700 pl-5 pr-6"
            >
              <icon-success class="size-5" colorMode="colored" />
              <span
                class="text-base font-medium leading-normal tracking-tight text-white"
              >
                Votre devis a bien été signé
              </span>
            </div>
          </div>
        }
      </div>

      <ng-template #fileTitle>
        <div class="text-primary-900 flex-auto px-6 py-2">
          <h2 class="text-2xl font-semibold leading-snug">
            {{ quote.name }}
          </h2>
          @if (quote.proName; as proName) {
            <p class="mt-1 flex flex-wrap items-center gap-3">
              Partenaire : {{ proName }}
              @if (quote.proContactMail) {
                <a
                  class="link"
                  [href]="
                    quoteService.formatEmailHrefToContactPro({
                      email: quote?.proContactMail,
                      operationName: quote?.name,
                    })
                  "
                >
                  (contacter)
                </a>
              }
            </p>
          }
        </div>
      </ng-template>
      <ng-template #backButton>
        <button
          class="text-primary-700 flex items-center gap-3 pr-6"
          routerLink=".."
        >
          <icon-arrow-left class="size-5" />
          <span class="font-display underline">Retour</span>
        </button>
      </ng-template>
      <ng-template #fileActions>
        @if (quote.url) {
          <a
            class="text-primary-700 hover:text-primary-800 flex shrink-0 cursor-pointer items-center justify-center gap-2 pb-4 lg:pb-0"
            (click)="downloadPdf(quote)"
          >
            <icon-download
              class="size-5 shrink-0 whitespace-nowrap"
              colorMode="semi"
            />
            Télécharger le PDF
          </a>
        }
      </ng-template>
    } @else if (!appService.isLoading()) {
      <div class="mx-auto flex flex-col items-center gap-3 self-end">
        <oui-message
          class="mx-auto"
          severity="error"
          summary="Impossible de récupérer le devis"
        >
          Une erreur est survenue lors de la récupération du devis
        </oui-message>

        <oui-button routerLink="/client/">
          Retour vers la page d'accueil
        </oui-button>
      </div>
    }
  `,
  imports: [
    AsyncPipe,
    IconDownloadComponent,
    RouterLink,
    TrustResourcePipe,
    IconSuccessComponent,
    NgTemplateOutlet,
    QuoteSidebarApprovedComponent,
    QuoteSidebarPendingComponent,
    QuoteSidebarRejectedComponent,
    MessageComponent,
    DividerVerticalComponent,
    DividerHorizontalComponent,
    ButtonComponent,
    IconArrowLeftComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QuoteDetailsComponent {
  readonly quoteUuid = input.required<QuoteUuid>();

  protected readonly quoteService = inject(QuoteService);
  protected readonly appService = inject(AppService);
  private readonly trackingService = inject(TrackingService);

  private readonly trackEffect = effect(() => {
    this.trackingService.trackClient("quote_open");
  });

  protected readonly QuoteStage = QuoteStage;

  protected readonly quoteDetails$: Observable<QuoteDetails | null> =
    toObservable(this.quoteUuid).pipe(
      filter(isNotNullish),
      tap(() => this.appService.isLoading.set(true)),
      switchMap((quoteUuid) => this.quoteService.getOne(quoteUuid)),
      map((row) => {
        return row
          ? {
              quoteUuid: row.hsQuote.uuid,
              operationUuid: row.uuid,
              locationUuid: row.location.uuid,
              quoteHsId: row.hsQuote.id,
              url: row.url,
              name: row.name,
              proContactMail: row.hsPro.mailContact,
              proName: row.hsPro.name,
              signatoryUuid: row.signatoryUuid,
              stage: row.hsQuote.stage,
              yousignAlreadyStarted: !!row.hsQuote.signRequestYousignId,
              fileId: row.fileId,
              status: row.status,
              operationCreatedBy: row.createdBy,
            }
          : null;
      }),
      catchError(() => of(null)),
      tap(() => this.appService.isLoading.set(false)),
    );

  protected downloadPdf(quote: QuoteDetails) {
    this.quoteService.downloadPdf({
      ...quote,
      uuid: quote.quoteUuid,
    });
  }
}

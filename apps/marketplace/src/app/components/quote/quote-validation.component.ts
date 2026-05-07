import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

import { Router } from "@angular/router";
import {
  CTA,
  missingInformation,
  OperationCreatedBy,
  YouSignEventEnum,
  YouSignRequestStatus,
} from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogService,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import {
  IconManualSignatureComponent,
  IconSignatureComponent,
} from "@optee/icons";
import type { QuoteUuid } from "@optee/models";
import { OptionCardComponent } from "@optee/ui/components/organisms/option-card/option-card.component";
import { ToastService } from "@optee/ui/services/toast.service";
import trpcClient from "../../../trpc-client";
import { AppService } from "../../services/app.service";
import { YousignService } from "../../services/yousign.service";
import { YousignSignerDialogComponent } from "../you-sign/you-sign-signer.component";
import { QuoteUploadSignedComponent } from "./quote-upload-signed.component";

@Component({
  selector: "mkp-quote-validation",
  template: `
    <op-dialog-wrapper
      class="!w-[680px]"
      showCircle
      variant="primary-100"
      (crossClick)="dialogRef.close(null)"
    >
      <op-dialog-heading [heading]="CTA.quoteSignature">
        <icon-signature class="text-primary-700 size-10" iconSlot />

        Sélectionnez le mode de signature que vous souhaitez utiliser.
      </op-dialog-heading>

      <div class="relative flex flex-wrap gap-4">
        <!-- @todo delete with the yousign workflow -->
        <!-- @if (
          data.operationCreatedBy &&
          data.operationCreatedBy !== OperationCreatedBy.PRO
        ) {
          <oui-option-card
            class="flex flex-1"
            buttonText="Signer électroniquement"
            buttonVariant="primary"
            heading="Signer électroniquement"
            highlight
            subtitle="Signer le devis avec Yousign, leader européen de la signature électronique."
            (click)="signQuoteWithYousign()"
          >
            <icon-electronic-signature
              class="text-primary-700 size-8"
              iconSlot
            />
          </oui-option-card>
        } -->

        <oui-option-card
          class="flex flex-1"
          buttonText="Importer un fichier"
          heading="Upload d’un devis signé"
          subtitle="Déposez un scan de votre devis signé, directement sur la plateforme Optee."
          (click)="uploadSignedQuote()"
        >
          <icon-manual-signature class="text-primary-700 size-8" iconSlot />
        </oui-option-card>
      </div>
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    DialogHeadingComponent,
    IconSignatureComponent,
    // IconElectronicSignatureComponent, @todo delete with the yousign workflow if not used elsewhere ?
    IconManualSignatureComponent,
    OptionCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteValidationDialogComponent extends StronglyTypedDialog<
  {
    quoteUuid: QuoteUuid;
    operationCreatedBy: OperationCreatedBy | null;
  },
  null
> {
  protected readonly dialogService = inject(DialogService);
  protected readonly router = inject(Router);
  protected readonly toastService = inject(ToastService);
  protected readonly appService = inject(AppService);
  protected readonly yousignService = inject(YousignService);

  protected readonly CTA = CTA;
  protected readonly OperationCreatedBy = OperationCreatedBy;
  private readonly quotesListUrl = "/client/quotes";

  protected async signQuoteWithYousign() {
    try {
      this.dialogRef.close(null);

      this.appService.isLoading.set(true);
      const { signatureLink, signatureRequestId, status } =
        await trpcClient.quotes.getSignatureLink.mutate(this.data.quoteUuid);

      if (status !== YouSignRequestStatus.ONGOING) {
        this.router.navigate([this.quotesListUrl]);
        this.toastService.open(
          "info",
          "Signature du devis",
          "Le devis a déjà été accepté ou rejeté en dehors de l'application. Rafraîchissement en cours...",
        );
        this.appService.isLoading.set(false);
        return;
      }

      this.appService.isLoading.set(false);

      if (!signatureLink || !signatureRequestId) {
        throw new Error(missingInformation);
      }

      const { res } = await this.dialogService.open(
        YousignSignerDialogComponent,
        {
          data: { signatureLink },
          disableClose: true,
        },
      );

      if (res?.event === YouSignEventEnum.SIGNATUREDONE) {
        this.appService.isLoading.set(true);
        const isDone =
          await this.yousignService.waitUntilSignatureDone(signatureRequestId);
        this.appService.isLoading.set(false);
        if (!isDone) {
          throw new Error(
            "La signature n'a pas pu être confirmée. Veuillez réessayer ou contacter le support si le problème persiste.",
          );
        }
        this.router.navigate([this.quotesListUrl]);
        this.toastService.open(
          "success",
          "Signature du devis",
          "Votre devis a bien été signé.",
        );
      }
    } catch (error) {
      this.toastService.openError("Signature du devis", error);
    } finally {
      this.appService.isLoading.set(false);
    }
  }

  protected async uploadSignedQuote() {
    this.dialogRef.close(null);

    try {
      const { res: uploaded } = await this.dialogService.open(
        QuoteUploadSignedComponent,
        { data: { quoteUuid: this.data.quoteUuid } },
      );
      if (uploaded) {
        this.router.navigate([this.quotesListUrl]);

        this.toastService.open(
          "success",
          "Signature du devis",
          "Votre devis a bien été signé",
        );
      }
    } catch (error) {
      this.toastService.openError("Upload du devis signé", error);
    }
  }
}

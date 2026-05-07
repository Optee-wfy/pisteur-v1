import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { IMPORTED_SIGNED_QUOTE_PREFIX } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import {
  IconManualSignatureComponent,
  IconUploadComponent,
} from "@optee/icons";
import type { QuoteUuid } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import type { FileDto } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { DropzoneComponent } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { Checkbox } from "primeng/checkbox";
import trpcClient from "../../../trpc-client";
import { AppService } from "../../services/app.service";

@Component({
  selector: "mkp-quote-upload",
  template: `
    <op-dialog-wrapper (crossClick)="close()">
      <op-dialog-heading heading="Importer votre devis">
        <icon-manual-signature class="text-primary-700 size-10" iconSlot />
        Déposez un scan de votre devis
        <b>signé</b>
        ci-dessous.
      </op-dialog-heading>
      <form
        class="flex flex-col justify-between gap-4"
        (ngSubmit)="uploadAndAcceptQuote()"
        [formGroup]="quoteForm"
      >
        <oui-dropzone
          compact
          showExtensions
          showMaxFileSize
          (filesChanged)="currentFile.set($event)"
          [extensions]="['.pdf']"
          [filesNamesMaxLength]="30"
          [maxFileSize]="10"
        >
          <icon-upload class="size-12" colorMode="colored" />
        </oui-dropzone>

        <div class="flex items-start justify-start gap-2">
          <p-checkbox
            inputId="quoteSigned"
            [binary]="true"
            [formControl]="quoteForm.controls.confirmQuoteSigned"
          />
          <label for="quoteSigned">
            Je confirme que le devis que je dépose est signé.
          </label>
        </div>

        <footer class="flex flex-col items-center justify-center gap-4 py-3">
          <oui-button
            type="submit"
            variant="primary"
            [disabled]="!quoteForm.valid || currentFile().length === 0"
          >
            Confirmer
          </oui-button>

          <div class="link" (click)="close()">Annuler</div>
        </footer>
      </form>
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    ReactiveFormsModule,
    ButtonComponent,
    Checkbox,
    DropzoneComponent,
    IconUploadComponent,
    DialogHeadingComponent,
    IconManualSignatureComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteUploadSignedComponent extends StronglyTypedDialog<
  {
    quoteUuid: QuoteUuid;
  },
  boolean | null
> {
  protected readonly router = inject(Router);
  protected readonly toastService = inject(ToastService);
  protected readonly appService = inject(AppService);

  protected readonly currentFile = signal<FileDto[]>([]);

  protected readonly quoteForm = new FormGroup({
    file: new FormControl<FileDto>(
      {
        value: {
          name: "",
          type: "",
          data: "",
          file: new File([], ""),
        },
        disabled: false,
      },
      { nonNullable: true, validators: [Validators.required] },
    ),
    confirmQuoteSigned: new FormControl(false, [Validators.requiredTrue]),
  });

  close() {
    this.dialogRef.close(null);
  }

  async uploadAndAcceptQuote() {
    const fileDto = this.currentFile()[0];

    try {
      if (!fileDto) {
        throw new Error("Merci de déposer un fichier.");
      }

      this.appService.isLoading.set(true);

      await trpcClient.quotes.uploadSignedQuote.mutate({
        uuid: this.data.quoteUuid,
        file: {
          name: IMPORTED_SIGNED_QUOTE_PREFIX + fileDto.name,
          type: fileDto.type,
          data: fileDto.data,
        },
      });

      this.dialogRef.close(true);
    } catch (err) {
      this.toastService.openError("Signature du devis", err);
    } finally {
      this.appService.isLoading.set(false);
    }
  }
}

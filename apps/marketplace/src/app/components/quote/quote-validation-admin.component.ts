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
import { youSignFieldLocationSchema } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { IconSpinnerComponent } from "@optee/icons";
import type { QuoteUuid } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { Checkbox } from "primeng/checkbox";
import { TextareaModule } from "primeng/textarea";
import trpcClient from "../../../trpc-client";
import { TrackingService } from "../../services/tracking.service";

@Component({
  selector: "mkp-quote-validation-admin",
  template: `
    <op-dialog-wrapper (crossClick)="dialogRef.close(null)">
      <op-dialog-heading heading="Validation du devis" />

      @if (!loading()) {
        <div class="flex flex-col items-center justify-center gap-4">
          <p>
            Quelle est la position de la signature sur le devis ?
            <br />
            <em class="text-sm italic">
              La position doit être donnée à l'aide de
              <a
                class="text-primary-700 underline"
                href="https://placeit.yousign.fr/"
                rel="noopener"
                target="_blank"
              >
                Placeit
              </a>
            </em>
          </p>

          <form class="flex flex-col gap-4" [formGroup]="form">
            <textarea
              cols="30"
              formControlName="signatureLocation"
              pTextarea
              rows="5"
            ></textarea>

            <div class="flex items-center justify-start gap-4">
              <p-checkbox
                formControlName="sendEmail"
                inputId="sendEmailCheckbox"
                [binary]="true"
              />
              <label class="ml-2" for="sendEmailCheckbox">
                Envoyer un email ?
              </label>
              @if (form.controls.sendEmail.value) {
                <p-checkbox
                  formControlName="sendEmailToPro"
                  inputId="sendEmailProCheckbox"
                  [binary]="true"
                />
                <label class="ml-2" for="sendEmailProCheckbox">
                  Mettre le pro en CC ?
                </label>
              }
            </div>
          </form>
          <div class="flex gap-4">
            <oui-button variant="outline" (click)="dialogRef.close(null)">
              Annuler
            </oui-button>
            <oui-button
              variant="primary"
              (click)="validateQuote()"
              [disabled]="form.invalid"
            >
              Valider
            </oui-button>
          </div>
        </div>
      } @else {
        <div class="flex items-center justify-center gap-4">
          <icon-spinner
            class="size-4 animate-spin text-transparent"
            colorMode="colored"
          />
          <p class="text-center font-semibold">
            Validation en cours... Merci de patienter
          </p>
        </div>
      }
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    DialogHeadingComponent,
    ButtonComponent,
    TextareaModule,
    Checkbox,
    ReactiveFormsModule,
    IconSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteValidationAdminComponent extends StronglyTypedDialog<
  { quoteUuid: QuoteUuid },
  { quoteUuid: QuoteUuid }
> {
  protected readonly trackingService = inject(TrackingService);
  protected readonly toastService = inject(ToastService);

  form = new FormGroup({
    signatureLocation: new FormControl(null, Validators.required),
    sendEmail: new FormControl(true),
    sendEmailToPro: new FormControl(true),
  });

  loading = signal(false);

  async validateQuote() {
    const locationInput = this.form.controls.signatureLocation.value;
    let parsedLocation;

    try {
      if (!locationInput) {
        throw new Error("La position de signature est manquante !");
      }

      this.loading.set(true);

      try {
        parsedLocation = JSON.parse(locationInput);
      } catch (error) {
        console.error(error);
        throw new Error("La position de signature est invalide !");
      }

      const signatureLocation =
        youSignFieldLocationSchema.safeParse(parsedLocation);

      if (!signatureLocation.success) {
        throw new Error("La position de signature est invalide !");
      }

      await trpcClient.quotes.validate.mutate({
        uuid: this.data.quoteUuid,
        signatureLocation: signatureLocation.data,
        skipEmail: !this.form.controls.sendEmail.value,
        proInCC: !!this.form.controls.sendEmailToPro.value,
      });

      this.trackingService.trackClient("quote_accept");

      this.toastService.open(
        "success",
        "Validation du devis",
        "Le devis a été validé avec succès ! 🥳",
      );

      this.dialogRef.close({ quoteUuid: this.data.quoteUuid });
    } catch (error) {
      this.toastService.openError("Validation du devis", error);
    } finally {
      this.loading.set(false);
    }
  }
}

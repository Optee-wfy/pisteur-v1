import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import type { QuoteRejectReason } from "@optee/constants";
import { QUOTE_REJECT_REASONS } from "@optee/constants";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { SelectModule } from "primeng/select";

@Component({
  selector: "mkp-quotes-reject",
  template: `
    <op-dialog-wrapper class="w-[50vw]" (crossClick)="dialogRef.close(null)">
      <h2 class="text-primary-900 text-center text-2xl font-semibold leading-9">
        Pour quelle raison souhaitez-vous refuser ce devis ?
      </h2>

      <div class="mb-10 flex flex-col gap-6">
        <p class="text-center text-sm tracking-tight">
          Nous sommes navré de ne pas avoir pu satisfaire votre demande par le
          biais de cette proposition commerciale. Dites-nous pourquoi ce devis
          ne vous convient-il pas, afin de vous en proposer un nouveau de plus
          adéquat.
        </p>

        <form [formGroup]="reasonForm">
          <p-select
            class="w-full"
            appendTo="body"
            formControlName="reason"
            placeholder="Sélectionner une raison de refus"
            [options]="rejectReasons"
          />
        </form>
      </div>

      <footer class="flex flex-col items-center gap-4">
        <oui-button
          variant="primary"
          (click)="dialogRef.close(selectedReason)"
          [disabled]="!selectedReason"
        >
          Refuser ce devis
        </oui-button>
        <button
          class="text-primary-700 inline-block w-full text-center underline underline-offset-1"
          (click)="dialogRef.close(null)"
        >
          Annuler
        </button>
      </footer>
    </op-dialog-wrapper>
  `,
  imports: [
    ButtonComponent,
    DialogWrapperComponent,
    ReactiveFormsModule,
    SelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteRejectDialogComponent extends StronglyTypedDialog<
  null,
  QuoteRejectReason | null
> {
  protected readonly formBuilder = inject(FormBuilder);

  protected readonly rejectReasons = QUOTE_REJECT_REASONS;

  get selectedReason() {
    return this.reasonForm.get("reason")?.value as QuoteRejectReason;
  }

  reasonForm = this.formBuilder.group({
    reason: ["", Validators.required],
  });
}

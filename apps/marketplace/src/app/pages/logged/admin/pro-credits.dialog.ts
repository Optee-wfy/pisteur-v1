import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

@Component({
  selector: "mkp-admin-pro-credits-dialog",
  template: `
    <op-dialog-wrapper class="!w-[480px]" (crossClick)="dialogRef.close(null)">
      <op-dialog-heading heading="Créditer des crédits">
        <p class="text-sm text-gray-600">
          {{ data.proName ?? "Pro sans nom" }}
        </p>
      </op-dialog-heading>

      <div class="space-y-3">
        <label class="text-sm font-medium" for="creditsToAdd">
          Nombre de crédits à ajouter
        </label>
        <input
          id="creditsToAdd"
          class="border-granite-100 hover:border-granite-400 w-full rounded-lg border px-3 py-2 text-sm transition-all"
          min="1"
          step="1"
          placeholder="Ex: 100"
          type="number"
          [formControl]="creditsToAddControl"
        />
      </div>

      <footer class="mt-6 flex items-center justify-end gap-2">
        <button
          class="text-primary-700 inline-block text-center underline underline-offset-1"
          type="button"
          (click)="dialogRef.close(null)"
        >
          Annuler
        </button>
        <oui-button
          variant="primary"
          type="button"
          [disabled]="creditsToAddControl.invalid"
          (click)="confirm()"
        >
          Créditer
        </oui-button>
      </footer>
    </op-dialog-wrapper>
  `,
  imports: [
    ButtonComponent,
    DialogHeadingComponent,
    DialogWrapperComponent,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProCreditsDialogComponent extends StronglyTypedDialog<
  { proName: string | null },
  number | null
> {
  protected readonly creditsToAddControl = new FormControl<number | null>(null, {
    validators: [Validators.required, Validators.min(1)],
  });

  protected confirm() {
    const value = this.creditsToAddControl.value;
    if (value === null || value === undefined || Number.isNaN(value)) {
      return;
    }

    this.dialogRef.close(Math.floor(value));
  }
}

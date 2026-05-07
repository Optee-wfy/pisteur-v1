import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { PRO_STATUSES, type ProStatus } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { Select } from "primeng/select";

const PRO_STATUS_LABELS: Partial<Record<ProStatus, string>> = {
  inscription_plateforme_autonome: "Inscription plateforme autonome",
};

const humanizeStatus = (status: ProStatus): string => {
  const spaced = status.replaceAll("_", " ").trim();
  if (!spaced) {
    return status;
  }

  return `${spaced.charAt(0).toUpperCase()}${spaced.slice(1)}`;
};

@Component({
  selector: "mkp-admin-pro-status-dialog",
  template: `
    <op-dialog-wrapper class="!w-[480px]" (crossClick)="dialogRef.close(null)">
      <op-dialog-heading heading="Changer le statut">
        <p class="text-sm text-gray-600">
          {{ data.proName ?? "Pro sans nom" }}
        </p>
      </op-dialog-heading>

      <div class="space-y-3">
        <label class="text-sm font-medium" for="nextStatus">
          Nouveau statut
        </label>
        <p-select
          inputId="nextStatus"
          class="w-full"
          appendTo="body"
          optionLabel="label"
          optionValue="value"
          placeholder="Choisir un statut"
          [formControl]="statusControl"
          [options]="statusOptions"
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
          [disabled]="statusControl.invalid"
          (click)="confirm()"
        >
          Mettre à jour
        </oui-button>
      </footer>
    </op-dialog-wrapper>
  `,
  imports: [
    ButtonComponent,
    DialogHeadingComponent,
    DialogWrapperComponent,
    ReactiveFormsModule,
    Select,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProStatusDialogComponent extends StronglyTypedDialog<
  { proName: string | null; currentStatus: ProStatus | null },
  ProStatus | null
> {
  protected readonly statusOptions = PRO_STATUSES.map((status) => ({
    label: PRO_STATUS_LABELS[status] ?? humanizeStatus(status),
    value: status,
  }));

  protected readonly statusControl = new FormControl<ProStatus | null>(
    this.data.currentStatus,
    {
      validators: [Validators.required],
    },
  );

  protected confirm() {
    const value = this.statusControl.value;
    if (!value) {
      return;
    }

    this.dialogRef.close(value);
  }
}

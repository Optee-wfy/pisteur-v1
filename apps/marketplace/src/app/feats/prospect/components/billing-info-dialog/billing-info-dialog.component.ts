import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule } from "@angular/forms";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { ToastService } from "@optee/ui/services/toast.service";
import trpcClient from "../../../../../trpc-client";
import { ProService } from "../../../../services/pro.service";
import type { BillingInfoFormGroup } from "../billing-info-form/billing-info-form.component";
import {
  BillingInfoFormComponent,
  createBillingInfoForm,
} from "../billing-info-form/billing-info-form.component";

@Component({
  selector: "mkp-billing-info-dialog",
  template: `
    <op-dialog-wrapper
      class="!w-[560px]"
      (crossClick)="dialogRef.close({ updated: false })"
      [fadedOut]="modalFadedOut()"
    >
      <div class="flex flex-col gap-6 p-6">
        <header class="flex flex-col items-start justify-center gap-2">
          <h1 class="text-2xl font-semibold">
            Compléter vos informations de facturation
          </h1>
          <p class="text-sm text-gray-600">
            Ces informations seront utilisées pour vos factures. Vous pouvez
            passer cette étape si vous préférez compléter plus tard.
          </p>
        </header>

        <form
          class="flex flex-col gap-4"
          (ngSubmit)="onSubmit()"
          [formGroup]="form"
        >
          <mkp-billing-info-form [form]="form" />

          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              class="text-sm font-medium text-gray-600 underline underline-offset-4"
              type="button"
              (click)="dialogRef.close({ updated: false })"
            >
              Passer
            </button>

            <oui-button
              type="submit"
              variant="accent"
              [disabled]="form.invalid || loading()"
            >
              Enregistrer et continuer
            </oui-button>
          </div>
        </form>
      </div>
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    ButtonComponent,
    ReactiveFormsModule,
    BillingInfoFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingInfoDialogComponent extends StronglyTypedDialog<
  void,
  { updated: boolean } | null
> {
  private readonly proService = inject(ProService);
  private readonly toastService = inject(ToastService);

  protected readonly pro = toSignal(this.proService.pro$, {
    initialValue: null,
  });

  protected loading = signal(false);

  protected readonly form: BillingInfoFormGroup = createBillingInfoForm();

  private readonly alreadyFilled = signal(false);

  private readonly prefillForm = effect(() => {
    const pro = this.pro();
    if (!pro || this.alreadyFilled() || this.form.dirty) {
      return;
    }

    this.form.patchValue({
      name: pro.name ?? "",
      siret: pro.siret ?? "",
      street: pro.street ?? "",
      zipcode: pro.zipcode ?? "",
      city: pro.city ?? "",
    });

    this.alreadyFilled.set(true);
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      this.loading.set(true);
      const { name, siret, street, zipcode, city } = this.form.value;
      await trpcClient.pros.selfUpdate.mutate({
        name: name ?? null,
        siret: siret ?? null,
        street: street ?? null,
        zipcode: zipcode ?? null,
        city: city ?? null,
      });

      this.proService.refresh();
      this.dialogRef.close({ updated: true });
    } catch (error) {
      this.toastService.openError(
        "Mise à jour des informations de facturation",
        error,
      );
    } finally {
      this.loading.set(false);
    }
  }
}

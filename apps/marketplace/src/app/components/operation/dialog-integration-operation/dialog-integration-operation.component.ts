import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { CTA, type OperationHubspotPrestationId } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogService,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { IconCalendarComponent } from "@optee/icons";
import type { LocationUuid } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { DatePicker } from "primeng/datepicker";
import { OperationService } from "../../../services/operation.service";
import { TrackingService } from "../../../services/tracking.service";
import { IconOperationPlanComponent } from "../icon-operation-plan/icon-operation-plan.component";
import { NewOperationSuccessComponent } from "../new-operation-by-client/new-operation-success.component";

@Component({
  selector: "mkp-dialog-integration-operation",
  template: `
    <op-dialog-wrapper
      class="max-w-prose items-center text-center"
      (crossClick)="abort()"
    >
      <op-dialog-heading [heading]="CTA.planThisOperation">
        <mkp-icon-operation-plan class="text-primary-700 size-10" iconSlot />
      </op-dialog-heading>

      <oui-message [showIcon]="false">
        <div class="text-left">
          Vous êtes sur le point d’ajouter
          <span class="font-semibold">{{ data.formattedSentence }}</span>
          à votre plan de travaux prévisionnel. Cette action
          <span class="font-semibold">
            n'engage pas un lancement de travaux ni un appel d'offres.
          </span>

          <br />
          <br />
          L’opération sera visible dans votre tableau de bord
          <span class="font-semibold">(opérations à venir),</span>
          vous pourrez la compléter plus tard.
        </div>
      </oui-message>

      <oui-form-field
        class="flex-auto"
        name="plannedLaunchDate"
        label="À quelle date envisagez-vous de démarrer cette opération ?"
        [control]="plannedLaunchDate"
      >
        <p class="mb-2 text-left text-xs text-gray-600">
          (Cette date est indicative et vous pourrez la modifier à tout moment.)
        </p>

        <p-datepicker
          class="block w-full"
          id="plannedLaunchDate"
          appendTo="body"
          fluid
          iconDisplay="input"
          placeholder="Sélectionnez une date"
          required
          showIcon
          [formControl]="plannedLaunchDate"
          [minDate]="today"
          [numberOfMonths]="1"
        >
          <ng-template #inputicon>
            <icon-calendar class="size-4" colorMode="colored" />
          </ng-template>
        </p-datepicker>
      </oui-form-field>

      <footer class="flex flex-col items-center justify-center gap-4">
        <oui-button
          type="submit"
          variant="primary"
          (click)="createOperation()"
          [disabled]="plannedLaunchDate.invalid"
        >
          {{ CTA.planThisOperation }}
        </oui-button>
      </footer>
    </op-dialog-wrapper>
  `,
  imports: [
    ButtonComponent,
    DialogWrapperComponent,
    DialogHeadingComponent,
    IconOperationPlanComponent,
    FormFieldComponent,
    ReactiveFormsModule,
    MessageComponent,
    IconCalendarComponent,
    DatePicker,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogIntegrationOperationComponent extends StronglyTypedDialog<
  {
    hsPrestationId: OperationHubspotPrestationId;
    formattedSentence: string;
    locationUuid: LocationUuid;
  },
  boolean
> {
  protected readonly router = inject(Router);
  protected readonly dialogService = inject(DialogService);
  protected readonly operationService = inject(OperationService);
  protected readonly toastService = inject(ToastService);
  protected readonly trackingService = inject(TrackingService);

  protected readonly CTA = CTA;
  protected readonly today = new Date();
  protected readonly plannedLaunchDate = new FormControl(null, {
    nonNullable: true,
    validators: Validators.required,
  });

  trackEffect = effect(() => {
    this.trackingService.trackClient("operation_plan_started");
  });

  async createOperation() {
    const plannedLaunchDate = this.plannedLaunchDate.getRawValue();
    if (!plannedLaunchDate) {
      this.toastService.openError(
        CTA.planOperation,
        "La date de lancement est requise.",
      );
      return;
    }
    try {
      const operationUuid = await this.operationService.createByClient({
        hsPrestationId: this.data.hsPrestationId,
        isFunding: false,
        locationUuid: this.data.locationUuid,
        plannedLaunchDate,
      });

      this.operationService.refresh();

      this.dialogRef.close(true);

      this.trackingService.trackClient("operation_plan_completed");

      this.dialogService.open(NewOperationSuccessComponent, {
        data: {
          operationUuid,
        },
      });
    } catch (e) {
      this.toastService.openError(CTA.planOperation, e);
    }
  }

  abort() {
    this.trackingService.trackClient("operation_plan_aborted");
    this.dialogRef.close(null);
  }
}

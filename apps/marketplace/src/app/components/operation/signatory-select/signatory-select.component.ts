import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  resource,
  signal,
} from "@angular/core";
import { ReactiveFormsModule, type FormControl } from "@angular/forms";
import { DialogService } from "@optee/dialog";
import { IconCirclePlusComponent } from "@optee/icons";
import type { ContactUuid, LocationUuid } from "@optee/models";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { Select } from "primeng/select";
import trpcClient from "../../../../trpc-client";
import { ContactService } from "../../../services/contact.service";
import { ClientContactFormComponent } from "../../permission/client-contact-form.component";

@Component({
  selector: "mkp-signatory-select",
  template: `
    <oui-form-field
      name="signatoryUuid"
      label="Choisissez un signataire"
      [control]="signatoryUuid()"
    >
      <p-select
        class="w-full"
        #signatorySelect
        appendTo="body"
        placeholder="Sélectionnez un signataire"
        [formControl]="signatoryUuid()"
        [loading]="signatories.isLoading()"
        [options]="signatories.value()"
      >
        <ng-template #footer>
          <div
            class="hover:bg-primary-50 shadow-o2-reverse flex cursor-pointer items-center gap-4 px-3 py-5"
            (click)="signatorySelect.hide(); inviteSignatory()"
          >
            <icon-circle-plus class="text-primary-700 size-5 shrink-0" />
            <span class="text-gray-600">Inviter un nouveau signataire</span>
          </div>
        </ng-template>
      </p-select>
    </oui-form-field>
  `,
  imports: [
    FormFieldComponent,
    Select,
    ReactiveFormsModule,
    IconCirclePlusComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignatorySelectComponent {
  readonly signatoryUuid = model.required<FormControl<ContactUuid | null>>();
  readonly locationUuid = input.required<LocationUuid>();

  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(DialogService);

  protected readonly signatoryEmailAdded = signal<string | null>(null);

  protected readonly signatories = resource({
    params: () => ({
      locationUuid: this.locationUuid(),
    }),
    loader: async ({ params }) => {
      try {
        const signatories =
          await trpcClient.operations.getPotentialSignatoriesForClient.query({
            locationUuid: params.locationUuid,
          });

        return this.contactService.formatSignatories(signatories);
      } catch (error) {
        console.error("Failed to fetch potential signatories", error);
        this.toastService.openError("Récupération des signataires", error);
        return [];
      }
    },
  });

  private readonly updateAddedSignatory = effect(() => {
    const email = this.signatoryEmailAdded();
    if (email && !this.signatories.isLoading()) {
      const newSignatory = this.signatories
        .value()
        ?.find((signatory) => signatory.email === email);
      if (newSignatory) {
        this.signatoryUuid().setValue(newSignatory.value);
        this.signatoryUuid().updateValueAndValidity();
      }
      this.signatoryEmailAdded.set(null);
    }
  });

  protected async inviteSignatory() {
    const { res: invited } = await this.dialogService.open(
      ClientContactFormComponent,
      {
        data: {
          contact: null,
          modalType: "invite",
          minimalRole: "LOCATION_ADMINISTRATOR",
          minimalLocations: [this.locationUuid()],
        },
      },
    );
    if (invited) {
      this.signatories.reload();
      this.signatoryEmailAdded.set(invited.email);
    }
  }
}

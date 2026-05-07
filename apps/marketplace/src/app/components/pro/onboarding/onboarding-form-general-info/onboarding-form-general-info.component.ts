import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { phoneNumberValidator } from "@optee/ui/functions/is-phone-pattern.fn";
import { ToastService } from "@optee/ui/services/toast.service";
import { InputText } from "primeng/inputtext";
import { z } from "zod";
import trpcClient from "../../../../../trpc-client";
import { AuthService } from "../../../../services/auth.service";
import { ContactService } from "../../../../services/contact.service";

export const ContactSchema = z.object({
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  jobTitle: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
});
export type ContactForm = z.infer<typeof ContactSchema>;

@Component({
  selector: "mkp-pro-onboarding-form-general-info",
  host: {
    class: "flex flex-col items-start gap-10",
  },
  template: `
    <div class="flex flex-col items-start justify-center gap-2">
      <h1 class="text-2xl font-semibold">Informations générales</h1>
      <p class="text-sm text-gray-600">
        Renseignez vos informations générales afin que nous puissions vous
        contacter plus facilement.
      </p>
    </div>
    <form
      class="flex w-full flex-col gap-6"
      (ngSubmit)="onSubmit()"
      [formGroup]="updateAccountForm"
    >
      <div class="flex flex-col items-start justify-center gap-4 lg:flex-row">
        <oui-form-field
          class="w-full"
          name="firstName"
          label="Prénom"
          [control]="updateAccountForm.controls.firstName"
        >
          <input
            id="firstName"
            fluid
            formControlName="firstName"
            pInputText
            placeholder="François"
            required
          />
        </oui-form-field>
        <oui-form-field
          class="w-full"
          name="lastName"
          label="Nom"
          [control]="updateAccountForm.controls.lastName"
        >
          <input
            id="lastName"
            fluid
            formControlName="lastName"
            pInputText
            placeholder="Dupont"
            required
          />
        </oui-form-field>
      </div>
      <div class="flex flex-col items-start justify-center gap-4 lg:flex-row">
        <oui-form-field
          class="w-full"
          name="jobTitle"
          label="Poste"
          [control]="updateAccountForm.controls.jobTitle"
        >
          <input
            id="jobTitle"
            fluid
            formControlName="jobTitle"
            pInputText
            placeholder="Ex : Directeur général"
          />
        </oui-form-field>

        <oui-form-field
          class="w-full"
          name="phone"
          label="Téléphone"
          [control]="updateAccountForm.controls.phone"
        >
          <input
            id="phone"
            fluid
            formControlName="phone"
            pInputText
            placeholder="Ex : 0688765432"
            required
          />
        </oui-form-field>
      </div>
      <oui-form-field
        class="w-full"
        name="email"
        label="Adresse mail"
        [control]="updateAccountForm.controls.email"
      >
        <input
          id="email"
          fluid
          formControlName="email"
          pInputText
          placeholder="Ex : francois.dupont@gmail.com"
          required
        />
      </oui-form-field>
      <oui-button
        type="submit"
        variant="primary"
        [disabled]="updateAccountForm.invalid"
      >
        Enregistrer
      </oui-button>
    </form>
  `,
  imports: [
    ButtonComponent,
    FormsModule,
    InputText,
    ReactiveFormsModule,
    FormFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingProFormGeneralInfoComponent {
  protected readonly authService = inject(AuthService);
  protected readonly toastService = inject(ToastService);
  protected readonly contactService = inject(ContactService);

  contact = input.required<ContactForm>();

  formSubmitted = output();

  updateAccountForm = new FormGroup({
    firstName: new FormControl("", [Validators.required]),
    lastName: new FormControl("", [Validators.required]),
    jobTitle: new FormControl(""),
    phone: new FormControl("", [Validators.required, phoneNumberValidator]),
    email: new FormControl({ value: "", disabled: true }),
  });

  userEffect = effect(() => {
    this.updateAccountForm.patchValue({
      firstName: this.contact().firstName,
      lastName: this.contact().lastName,
      jobTitle: this.contact().jobTitle,
      phone: this.contact().phone,
      email: this.contact().email,
    });
  });

  async onSubmit() {
    const contextMessage = "Mise à jour de vos informations";
    try {
      await trpcClient.contacts.selfUpdate.mutate(
        this.updateAccountForm.getRawValue(),
      );

      this.toastService.open(
        "success",
        contextMessage,
        "Les informations ont été mises à jour",
      );

      this.updateAccountForm.reset(this.updateAccountForm.value);

      this.contactService.refresh();
      this.formSubmitted.emit();
    } catch (err) {
      this.toastService.openError(contextMessage, err);
    }
  }
}

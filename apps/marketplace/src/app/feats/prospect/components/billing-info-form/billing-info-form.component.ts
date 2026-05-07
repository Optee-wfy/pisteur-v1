import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { SIRET_PATTERN } from "@optee/constants";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { InputText } from "primeng/inputtext";

export type BillingInfoFormGroup = FormGroup<{
  name: FormControl<string | null>;
  siret: FormControl<string | null>;
  street: FormControl<string | null>;
  zipcode: FormControl<string | null>;
  city: FormControl<string | null>;
}>;

export const createBillingInfoForm = (): BillingInfoFormGroup =>
  new FormGroup({
    name: new FormControl<string | null>(null, {
      nonNullable: false,
      validators: [Validators.minLength(2)],
    }),
    siret: new FormControl<string | null>(null, {
      nonNullable: false,
      validators: [Validators.pattern(SIRET_PATTERN)],
    }),
    street: new FormControl<string | null>(null, {
      nonNullable: false,
      validators: [Validators.minLength(3)],
    }),
    zipcode: new FormControl<string | null>(null, {
      nonNullable: false,
      validators: [Validators.minLength(4)],
    }),
    city: new FormControl<string | null>(null, {
      nonNullable: false,
      validators: [Validators.minLength(2)],
    }),
  });

@Component({
  selector: "mkp-billing-info-form",
  template: `
    @let formValue = this.form();
    <div class="flex flex-col gap-4" [formGroup]="formValue">
      <oui-form-field
        name="name"
        label="Nom de l’entreprise"
        [control]="formValue.controls.name"
      >
        <input
          id="name"
          fluid
          pInputText
          placeholder="Ex : Dupont Énergie"
          [formControl]="formValue.controls.name"
        />
      </oui-form-field>

      <oui-form-field
        name="siret"
        label="SIRET"
        [control]="formValue.controls.siret"
      >
        <input
          id="siret"
          fluid
          pInputText
          placeholder="Ex : 80925638900053"
          [formControl]="formValue.controls.siret"
        />
      </oui-form-field>

      <oui-form-field
        name="street"
        label="Adresse de facturation"
        [control]="formValue.controls.street"
      >
        <input
          id="street"
          fluid
          pInputText
          placeholder="Ex : 12 rue de la Paix"
          [formControl]="formValue.controls.street"
        />
      </oui-form-field>

      <div class="grid gap-4 md:grid-cols-2">
        <oui-form-field
          name="zipcode"
          label="Code postal"
          [control]="formValue.controls.zipcode"
        >
          <input
            id="zipcode"
            fluid
            pInputText
            placeholder="Ex : 75009"
            [formControl]="formValue.controls.zipcode"
          />
        </oui-form-field>

        <oui-form-field
          name="city"
          label="Ville"
          [control]="formValue.controls.city"
        >
          <input
            id="city"
            fluid
            pInputText
            placeholder="Paris"
            [formControl]="formValue.controls.city"
          />
        </oui-form-field>
      </div>
    </div>
  `,
  imports: [FormFieldComponent, ReactiveFormsModule, InputText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingInfoFormComponent {
  readonly form = input.required<BillingInfoFormGroup>();
}

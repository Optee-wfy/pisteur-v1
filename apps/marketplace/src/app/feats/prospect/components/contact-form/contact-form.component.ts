import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { PHONE_PATTERN } from "@optee/constants";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import { ButtonModule } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { filter, map, take } from "rxjs";
import trpcClient from "../../../../../trpc-client";
import { AuthService } from "../../../../services/auth.service";

const FORM_FIELDS: Array<{
  name: string;
  label: string;
  formControlName: string;
  autocomplete: string;
  type: string;
  errorKey: string;
  placeholder?: string;
  errorMessage?: string;
}> = [
  {
    name: "firstName",
    label: "Prénom",
    formControlName: "firstName",
    autocomplete: "given-name",
    placeholder: "François",
    type: "text",
    errorMessage: "Le prénom est obligatoire !",
    errorKey: "required",
  },
  {
    name: "lastName",
    label: "Nom",
    formControlName: "lastName",
    autocomplete: "family-name",
    placeholder: "Dupont",
    type: "text",
    errorMessage: "Le nom est obligatoire !",
    errorKey: "required",
  },
  {
    name: "email",
    label: "Adresse e-mail",
    formControlName: "email",
    autocomplete: "email",
    placeholder: "example@gmail.com",
    type: "email",
    errorMessage: "L'adresse e-mail est invalide !",
    errorKey: "email",
  },
  {
    name: "phone",
    label: "Numéro de téléphone",
    formControlName: "phone",
    autocomplete: "tel",
    placeholder: "0612345678",
    type: "tel",
    errorMessage: "Le numéro de téléphone est invalide !",
    errorKey: "pattern",
  },
  {
    name: "jobTitle",
    label: "Poste occupé",
    formControlName: "jobTitle",
    autocomplete: "job",
    placeholder: "Directeur des opérations",
    type: "text",
    errorKey: "",
  },
];

@Component({
  selector: "mkp-contact-form-prospect",
  host: { class: "flex flex-col items-start gap-6" },
  template: `
    <header class="flex flex-col items-start justify-center gap-2">
      <h1 class="text-2xl font-semibold">Informations personnelles</h1>
      <p class="text-sm text-gray-600">Gérez vos informations personnelles.</p>
    </header>
    <form
      class="flex w-full flex-col items-start gap-6"
      (ngSubmit)="onSubmit()"
      [formGroup]="updateAccountForm"
    >
      <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        @for (field of FORM_FIELDS; track field.name) {
          @if (updateAccountForm.get(field.formControlName); as control) {
            <oui-form-field
              [control]="control"
              [label]="field.label"
              [name]="field.name"
            >
              <input
                fluid
                pInputText
                [autocomplete]="field.autocomplete"
                [formControlName]="field.formControlName"
                [placeholder]="field.placeholder"
                [type]="field.type"
              />
            </oui-form-field>
          }
        }
      </div>
      <p-button
        label="Enregistrer les modifications"
        severity="success"
        type="submit"
        [disabled]="
          (formChanged$ | async) === false ||
          submitted() ||
          updateAccountForm.invalid
        "
      />
    </form>
  `,
  imports: [
    AsyncPipe,
    ButtonModule,
    FormFieldComponent,
    FormsModule,
    InputText,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormProspectComponent {
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  protected readonly submitted = signal(false);

  protected readonly FORM_FIELDS = FORM_FIELDS;

  protected readonly userInitial$ = this.authService.userInitial$;

  protected readonly updateAccountForm = new FormGroup({
    firstName: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl(
      { value: "", disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      },
    ),
    jobTitle: new FormControl(""),
    phone: new FormControl("", [
      Validators.pattern(PHONE_PATTERN),
      Validators.required,
    ]),
  });

  private readonly subUser = this.authService.contact$
    .pipe(filter(isNotNullish), take(1), takeUntilDestroyed())
    .subscribe((user) => {
      this.updateAccountForm.patchValue(
        {
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          email: user.email ?? "",
          jobTitle: user.jobTitle ?? "",
          phone: user.phone ?? "",
        },
        { emitEvent: false },
      );
    });

  protected readonly formChanged$ = this.updateAccountForm.valueChanges.pipe(
    map(() => this.updateAccountForm.dirty),
  );

  protected async onSubmit(): Promise<void> {
    const contextMessage = "Mise à jour de vos informations";
    try {
      this.submitted.set(true);

      await trpcClient.contacts.selfUpdate.mutate(
        this.updateAccountForm.getRawValue(),
      );

      this.toastService.open(
        "success",
        contextMessage,
        "Les informations ont été mises à jour",
      );

      this.updateAccountForm.markAsPristine();
      this.updateAccountForm.updateValueAndValidity();

      this.submitted.set(false);
    } catch (err) {
      this.toastService.openError(contextMessage, err);
    }
  }

  // openDeleteAccountDialog(): void {
  //   this.dialog
  //     .open(DialogConfirmationComponent, {
  //       data: {
  //         title: "Confirmation de suppression de compte",
  //         description:
  //           "Êtes-vous sûr(e) de vouloir supprimer votre compte ? Votre compte et toutes les données associés seront perdus.",
  //         action: "Supprimer son compte",
  //         actionColor: "danger",
  //       },
  //       disableClose: true,
  //     })
  //     .afterClosed()
  //     .pipe(take(1));
  //   .subscribe((confirmed) => {
  //     if (confirmed) this.buttonClickEvent.emit();
  //   });
  // }
}

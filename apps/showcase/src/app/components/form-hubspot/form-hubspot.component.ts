import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { RouterModule } from "@angular/router";
import {
    CONTACT_ACTIVITY_SECTORS,
    CONTACT_JOB_TYPES,
    CTA,
    MARKETPLACE_AUTH_URL,
    PHONE_PATTERN,
} from "@optee/constants";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { Checkbox } from "primeng/checkbox";
import { InputText } from "primeng/inputtext";
import { Select } from "primeng/select";
import { TextareaModule } from "primeng/textarea";
import { HubspotService } from "../../services/hubspot.service";

@Component({
  selector: "swc-form-hubspot",
  host: {
    class: "flex flex-col gap-6 lg:gap-10",
  },
  template: `
    <form
      class="h-full xl:items-center xl:justify-center"
      (ngSubmit)="submitHubSpotForm()"
      [formGroup]="hubSpotForm"
    >
      <div class="font-display grid grid-cols-1 gap-6 md:grid-cols-2">
        <oui-form-field
          name="firstname"
          label="Prénom"
          [control]="hubSpotForm.controls.firstname"
        >
          <input
            id="firstname"
            name="firstname"
            autocomplete="firstname"
            fluid
            pInputText
            placeholder="François"
            required
            type="text"
            [formControl]="hubSpotForm.controls.firstname"
          />
        </oui-form-field>

        <oui-form-field
          name="lastname"
          label="Nom"
          [control]="hubSpotForm.controls.lastname"
        >
          <input
            id="lastname"
            name="lastname"
            autocomplete="lastname"
            fluid
            pInputText
            placeholder="Dupont"
            required
            type="text"
            [formControl]="hubSpotForm.controls.lastname"
          />
        </oui-form-field>

        <oui-form-field
          name="email"
          label="Adresse mail"
          [control]="hubSpotForm.controls.email"
        >
          <input
            id="email"
            name="email"
            autocomplete="email"
            fluid
            pInputText
            placeholder="françois.dupont@gmail.com"
            required
            type="email"
            [formControl]="hubSpotForm.controls.email"
          />
        </oui-form-field>

        <oui-form-field
          name="mobilephone"
          label="Numéro de téléphone"
          [control]="hubSpotForm.controls.mobilephone"
        >
          <input
            id="mobilephone"
            name="mobilephone"
            autocomplete="mobilephone"
            fluid
            pInputText
            placeholder="06 99 78 34 23"
            required
            type="tel"
            [formControl]="hubSpotForm.controls.mobilephone"
          />
        </oui-form-field>

        <oui-form-field
          name="company"
          label="Société"
          [control]="hubSpotForm.controls.company"
        >
          <input
            id="company"
            name="company"
            autocomplete="company"
            fluid
            pInputText
            placeholder="Dupont Société"
            required
            type="text"
            [formControl]="hubSpotForm.controls.company"
          />
        </oui-form-field>

        <oui-form-field
          name="numemployees"
          label="Nombre d'employés"
          [control]="hubSpotForm.controls.numemployees"
        >
          <p-select
            appendTo="body"
            fluid
            optionLabel="label"
            optionValue="value"
            placeholder="Sélectionner"
            [formControl]="hubSpotForm.controls.numemployees"
            [options]="EMPLOYEE_OPTIONS"
          />
        </oui-form-field>

        <oui-form-field
          name="industry"
          label="Secteur d’activité"
          [control]="hubSpotForm.controls.industry"
        >
          <p-select
            appendTo="body"
            fluid
            optionLabel="label"
            optionValue="value"
            placeholder="Sélectionnez un secteur"
            required
            [formControl]="hubSpotForm.controls.industry"
            [options]="activitySectors"
          />
        </oui-form-field>

        <oui-form-field
          name="jobtitle"
          label="Poste"
          [class]="{
            hidden: !showJobtitleField(),
          }"
          [control]="hubSpotForm.controls.jobtitle"
        >
          <p-select
            appendTo="body"
            fluid
            optionLabel="label"
            optionValue="value"
            placeholder="Sélectionner"
            [formControl]="hubSpotForm.controls.jobtitle"
            [options]="jobTypes"
            [required]="showJobtitleField()"
          />
        </oui-form-field>
      </div>

      <div class="mt-6 flex flex-col gap-6">
        <oui-form-field
          name="message"
          label="Motif de la demande"
          [class]="{
            hidden: type() === 'lite',
          }"
          [control]="hubSpotForm.controls.message"
        >
          <textarea
            class="w-full resize-none"
            id="message"
            fluid
            placeholder="Demande de DTG, développement de mon réseau pro..."
            pTextarea
            rows="2"
            [formControl]="hubSpotForm.controls.message"
          ></textarea>
        </oui-form-field>

        <oui-form-field
          name="acceptCgv"
          label=""
          [control]="hubSpotForm.controls.acceptCgv"
        >
          <div
            class="text-primary-900 flex items-start space-x-2 text-sm font-normal"
          >
            <p-checkbox
              required
              [binary]="true"
              [formControl]="hubSpotForm.controls.acceptCgv"
            />
            <label class="text-gray-600">
              En remplissant ce formulaire, j’accepte que mes informations
              personnelles saisies soient utilisées par Optee à des fins de
              prospection commerciale. Pour plus d’information, cliquez
              <a class="underline" routerLink="/politique-de-confidentialite">
                ici
              </a>
            </label>
          </div>
        </oui-form-field>

        @switch (type()) {
          @case ("lite") {
            <oui-button type="submit" variant="accent">
              Prendre rendez-vous
            </oui-button>
          }
          @case ("demo") {
            <oui-button type="submit" variant="accent">
              {{ CTA.accessToQualifiedProjects }}
            </oui-button>
          }
          @default {
            <oui-button
              type="submit"
              variant="accent"
              [disabled]="hubSpotForm.invalid"
            >
              Demander une démo
            </oui-button>
          }
        }

        <div
          class="mb-6 text-sm font-normal text-gray-600"
          [class]="{
            hidden: ['demo', 'lite'].includes(type()),
          }"
        >
          Vous utilisez déjà Optee ?
          <a
            class="font-display text-primary-700 font-medium underline"
            [href]="MARKETPLACE_AUTH_URL"
          >
            Connectez-vous
          </a>
        </div>
      </div>
    </form>
  `,
  imports: [
    ReactiveFormsModule,
    FormFieldComponent,
    RouterModule,
    InputText,
    ButtonComponent,
    Checkbox,
    Select,
    TextareaModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormHubspotComponent {
  readonly type = input<"extended" | "lite" | "demo">("extended");
  protected readonly hubspotService = inject(HubspotService);

  protected readonly MARKETPLACE_AUTH_URL = MARKETPLACE_AUTH_URL;
  protected readonly CTA = CTA;

  protected readonly EMPLOYEE_OPTIONS = [
    { label: "1-5", value: "1-5" },
    { label: "5-25", value: "5-25" },
    { label: "25-50", value: "25-50" },
    { label: "50-100", value: "50-100" },
    { label: "100-500", value: "100-500" },
    { label: "500-1000", value: "500-1000" },
    { label: "1000+", value: "1000+" },
  ];

  protected readonly jobTypes = [...CONTACT_JOB_TYPES];
  protected readonly activitySectors = [...CONTACT_ACTIVITY_SECTORS];

  protected readonly hubSpotForm = new FormGroup({
    firstname: new FormControl("", [Validators.required]),
    lastname: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    mobilephone: new FormControl("", [Validators.pattern(PHONE_PATTERN)]),
    company: new FormControl(""),
    numemployees: new FormControl(""),
    jobtitle: new FormControl<string | null>(null),
    industry: new FormControl<string | null>(null, [Validators.required]),
    message: new FormControl(""),
    acceptCgv: new FormControl(false, [Validators.requiredTrue]),
  });

  protected readonly showJobtitleField = computed(() => {
    const industry = this.industryChangeSignal();
    return !!industry && industry !== "Entreprise de travaux";
  });

  protected async submitHubSpotForm() {
    if (!this.hubSpotForm.valid) {
      this.hubSpotForm.markAllAsTouched();
      return;
    }

    const formValues = this.hubSpotForm.value;
    const body = {
      fields: [
        { name: "firstname", value: formValues.firstname },
        { name: "lastname", value: formValues.lastname },
        { name: "email", value: formValues.email },
        { name: "mobilephone", value: formValues.mobilephone },
        { name: "company", value: formValues.company },
        { name: "numemployees", value: formValues.numemployees },
        { name: "type_de_poste", value: formValues.jobtitle },
        { name: "secteur_d_activite", value: formValues.industry },
        { name: "message", value: formValues.message },
      ],
      context: {
        pageUri: window.location.href,
        pageName: document.title,
      },
    };

    this.hubspotService.DemoRequest(body);
  }

  private readonly industryChangeSignal = toSignal(
    this.hubSpotForm.controls.industry.valueChanges,
  );
}

import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  FRENCH_DEPARTMENTS,
  PRO_ONBOARD_FREE_PREFIX,
  SIRET_PATTERN,
  WEBSITE_PATTERN,
} from "@optee/constants";

import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { phoneNumberValidator } from "@optee/ui/functions/is-phone-pattern.fn";
import { ToastService } from "@optee/ui/services/toast.service";
import {
  formatProValueToArray,
  formatProValueToString,
} from "libs/shared/models/src/lib/pro-format.util";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { TextareaModule } from "primeng/textarea";
import trpcClient from "../../../../../trpc-client";
import { ProService } from "../../../../services/pro.service";

@Component({
  selector: "mkp-pro-company-form",
  host: {
    class: "flex flex-col items-start gap-6 h-full",
  },
  template: `
    <header class="flex flex-col items-start justify-center gap-2">
      <h1 class="text-2xl font-semibold">Profil d’entreprise</h1>
      <p class="text-sm text-gray-600">
        Renseignez les informations de votre entreprise qui seront visibles par
        nos clients.
      </p>
    </header>

    @if (!editable()) {
      <p
        class="border-granite-200 text-granite-400 w-full rounded-lg border p-4 text-sm font-medium"
      >
        Cette section n'est éditable que par le propriétaire du compte.
      </p>
    }

    <form
      class="flex max-h-full w-full flex-col gap-6 overflow-y-auto"
      [formGroup]="companyForm"
    >
      <oui-form-field
        name="name"
        label="Nom entreprise (nom commercial)"
        [control]="companyForm.controls.name"
      >
        <input
          id="name"
          fluid
          pInputText
          placeholder="Ex : Dupont Entreprise"
          required
          [formControl]="companyForm.controls.name"
        />
      </oui-form-field>

      <!-- <oui-form-field
        class="w-full"
        name="mailContact"
        label="Mail principal"
        [control]="companyForm.controls.mailContact"
      >
        <input
          id="mailContact"
          fluid
          pInputText
          placeholder="Ex : francois.dupont@gmail.com"
          [formControl]="companyForm.controls.mailContact"
        />
      </oui-form-field> -->

      <oui-form-field
        class="w-full"
        name="phoneContact"
        label="Téléphone de l'entreprise"
        [control]="companyForm.controls.phoneContact"
      >
        <input
          id="phoneContact"
          fluid
          pInputText
          placeholder="Ex : 0688765432"
          [formControl]="companyForm.controls.phoneContact"
        />
      </oui-form-field>

      <oui-form-field
        name="siret"
        label="Numéro SIRET"
        [control]="companyForm.controls.siret"
      >
        <input
          id="siret"
          fluid
          pInputText
          placeholder="Ex : 80925638900053"
          required
          [formControl]="companyForm.controls.siret"
        />
      </oui-form-field>

      <!-- <oui-form-field
        name="capital"
        label="Capital de l’entreprise"
        [control]="companyForm.controls.capital"
      >
        <input
          id="capital"
          fluid
          pInputText
          placeholder="Ex : 10 000€"
          required
          type="number"
          [formControl]="companyForm.controls.capital"
        />
      </oui-form-field> -->

      <oui-form-field
        class="w-full"
        name="street"
        label="Adresse postale de votre entreprise"
        [control]="companyForm.controls.street"
      >
        <input
          id="street"
          fluid
          pInputText
          placeholder="Ex : 26 R. des Petites Écuries"
          [formControl]="companyForm.controls.street"
        />
      </oui-form-field>

      <div class="flex flex-col items-start justify-center gap-4 lg:flex-row">
        <oui-form-field
          class="w-full"
          name="zipcode"
          label="Code postal"
          [control]="companyForm.controls.zipcode"
        >
          <input
            id="zipcode"
            fluid
            pInputText
            placeholder="Ex : 75000"
            [formControl]="companyForm.controls.zipcode"
          />
        </oui-form-field>

        <oui-form-field
          class="w-full"
          name="city"
          label="Ville"
          [control]="companyForm.controls.city"
        >
          <input
            id="city"
            fluid
            pInputText
            placeholder="Paris"
            [formControl]="companyForm.controls.city"
          />
        </oui-form-field>
      </div>

      <oui-form-field
        name="interventionZones"
        label="Départements d'intervention"
        [control]="companyForm.controls.interventionZones"
      >
        <p-multiSelect
          class="compact"
          id="interventionZones"
          appendTo="body"
          display="chip"
          emptyFilterMessage="Aucun résultat"
          filter
          filterPlaceholder="Rechercher un département"
          fluid
          placeholder="Sélectionner le(s) département(s)"
          [displaySelectedLabel]="true"
          [formControl]="companyForm.controls.interventionZones"
          [maxSelectedLabels]="departmentsList.length"
          [options]="departmentsList"
          [showClear]="true"
        />
      </oui-form-field>

      <oui-form-field
        name="description"
        label="Courte description (facultatif)"
        [control]="companyForm.controls.description"
      >
        <textarea
          id="description"
          cols="30"
          fluid
          placeholder="Ex : Entreprise pour tous travaux d'isolation, de rénovation, des combles, murs, façades et toiture"
          pTextarea
          rows="5"
          [formControl]="companyForm.controls.description"
        ></textarea>
      </oui-form-field>

      <oui-form-field
        class="w-full"
        name="rcs"
        label="Lieu d’immatriculation au RCS (facultatif)"
        [control]="companyForm.controls.rcsLocation"
      >
        <input
          id="rcs"
          fluid
          pInputText
          placeholder="Ex : Lyon"
          [formControl]="companyForm.controls.rcsLocation"
        />
      </oui-form-field>

      <oui-form-field
        name="website"
        label="Site web (facultatif)"
        [control]="companyForm.controls.website"
      >
        <input
          id="website"
          fluid
          pInputText
          placeholder="Ex : www.dupont-entreprise.fr"
          [formControl]="companyForm.controls.website"
        />
      </oui-form-field>

      <oui-form-field
        name="calendarSite"
        label="Calendrier (facultatif)"
        [control]="companyForm.controls.calendarSite"
      >
        <input
          id="calendarSite"
          fluid
          pInputText
          placeholder="Votre lien de calendrier externe"
          [formControl]="companyForm.controls.calendarSite"
        />
      </oui-form-field>
    </form>

    @if (editable()) {
      <p-button
        label="Enregistrer les modifications"
        severity="success"
        type="submit"
        (click)="onSubmit()"
        [disabled]="companyForm.invalid"
      />
    }
  `,
  imports: [
    Button,
    FormsModule,
    ReactiveFormsModule,
    TextareaModule,
    InputText,
    FormFieldComponent,
    MultiSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProCompanyFormComponent {
  readonly editable = input<boolean>(false);
  private readonly proService = inject(ProService);
  private readonly toastService = inject(ToastService);

  private readonly pro = toSignal(this.proService.pro$, { initialValue: null });

  protected readonly departmentsList = [...FRENCH_DEPARTMENTS];

  protected readonly companyForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    siret: new FormControl("", [
      Validators.required,
      Validators.pattern(SIRET_PATTERN),
    ]),
    rcsLocation: new FormControl(""),
    capital: new FormControl<number | null>(null, [Validators.required]),
    street: new FormControl("", [Validators.required]),
    zipcode: new FormControl("", [Validators.required]),
    city: new FormControl("", [Validators.required]),
    description: new FormControl(""),
    interventionZones: new FormControl<string[]>([], [Validators.required]),
    website: new FormControl("", Validators.pattern(WEBSITE_PATTERN)),
    calendarSite: new FormControl("", Validators.pattern(WEBSITE_PATTERN)),
    mailContact: new FormControl("", [Validators.required, Validators.email]),
    phoneContact: new FormControl("", [
      Validators.required,
      phoneNumberValidator,
    ]),
  });

  private readonly markAsReadonlyIfNeeded = effect(() => {
    const isEditable = this.editable();
    Object.values(this.companyForm.controls).forEach((control) => {
      if (isEditable) {
        control.enable({ emitEvent: false });
      } else {
        control.disable({ emitEvent: false });
      }
    });
  });

  private readonly subUser = effect(() => {
    const pro = this.pro();
    this.companyForm.patchValue({
      ...(pro ?? {}),
      name: !pro?.name?.startsWith(PRO_ONBOARD_FREE_PREFIX) ? pro?.name : null,

      interventionZones: pro?.interventionZones
        ? formatProValueToArray(pro.interventionZones)
        : [],
    });
  });

  protected async onSubmit() {
    try {
      const pro = this.pro();
      const contextMessage = `${pro ? "Mise à jour" : "Création"} de votre profil d'entreprise`;

      const rawValue = this.companyForm.getRawValue();
      const interventionZones = rawValue.interventionZones
        ? formatProValueToString(rawValue.interventionZones)
        : "";

      const data = {
        ...rawValue,
        interventionZones,
        siren: rawValue.siret?.toString().slice(0, 9),
      };

      if (!pro) {
        await trpcClient.pros.create.mutate(data);

        this.toastService.open(
          "success",
          contextMessage,
          "Les informations ont été enregistrées",
        );
      } else {
        await trpcClient.pros.selfUpdate.mutate(data);

        this.toastService.open(
          "success",
          contextMessage,
          "Les informations ont été mises à jour",
        );
      }
      this.proService.refresh();
    } catch (err) {
      this.toastService.openError(
        "Informations sur votre profil d'entreprise",
        err,
      );
    }
  }
}

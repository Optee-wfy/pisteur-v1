import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  resource,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { RouterModule } from "@angular/router";
import { buildAssetUrl } from "@optee/constants";
import { IconCalendarComponent, IconUploadComponent } from "@optee/icons";
import type { ClientUuid, ContactUuid, LocationUuid } from "@optee/models";
import type { AppRouter } from "@optee/trpc-client";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FieldComponent } from "@optee/ui/components/molecules/form/field/field.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import {
  DropzoneComponent,
  type FileDto,
} from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { dateOnly } from "@optee/utils";
import type { inferProcedureInput } from "@trpc/server";
import { Checkbox } from "primeng/checkbox";
import { DatePickerModule } from "primeng/datepicker";
import { InputNumberModule } from "primeng/inputnumber";
import { InputText } from "primeng/inputtext";
import { Select } from "primeng/select";
import trpcClient from "../../../trpc-client";
import { ContactService } from "../../services/contact.service";

type DropboxFormField = "currentDate" | "signatories";

@Component({
  selector: "mkp-dropbox",
  host: {
    class: "flex flex-col bg-white shadow-o rounded-2xl gap-8 p-6 isolate",
  },
  template: `
    <h4 class="text-primary-900 font-display text-2xl font-semibold">
      {{ heading() }}
    </h4>

    <form
      class="flex flex-col gap-8"
      (ngSubmit)="uploadQuote()"
      [formGroup]="uploadForm"
    >
      <div class="flex flex-wrap gap-6">
        @if (optionalFields().includes("currentDate")) {
          <oui-form-field
            class="w-80"
            name="date"
            label="Date du jour"
            [control]="uploadForm.controls.todayDate"
          >
            <input
              id="todayDate"
              name="todayDate"
              autocomplete="date"
              fluid
              pInputText
              type="date"
              [formControl]="uploadForm.controls.todayDate"
            />
          </oui-form-field>
        }
        <!-- Montant HT -->
        <oui-form-field
          class="w-full"
          name="preTaxAmount"
          label="Montant HT (€)"
          [control]="uploadForm.controls.preTaxAmount"
        >
          <p-inputnumber
            fluid
            placeholder="Saisissez une valeur"
            type="number"
            [formControl]="uploadForm.controls.preTaxAmount"
          />
        </oui-form-field>

        <!-- Taux de TVA -->
        <oui-form-field
          class="w-full"
          name="vatRate"
          label="Taux de TVA (%)"
          [control]="uploadForm.controls.vatRate"
        >
          <p-inputnumber
            fluid
            placeholder="Saisissez une valeur"
            type="number"
            [formControl]="uploadForm.controls.vatRate"
            [max]="100"
          />
        </oui-form-field>

        <!-- Montant des financements -->
        <oui-form-field
          class="w-full"
          name="funding"
          label="Montant des financements (€)"
          tooltipMessage="Ne concerne que le financement de travaux avec CEE, renseignez 0€ si ce n'est pas le cas."
          [control]="uploadForm.controls.fundingAmount"
        >
          <div ngProjectAs="suffixLabel">
            -
            <a
              class="text-primary-700 underline underline-offset-2"
              download
              [href]="simulatorCeeUrl"
            >
              Accéder au simulateur
            </a>
          </div>
          <p-inputnumber
            fluid
            placeholder="Saisissez une valeur"
            type="number"
            [formControl]="uploadForm.controls.fundingAmount"
          />
        </oui-form-field>

        <!-- Date de fin de validité du devis -->
        <oui-form-field
          class="w-full"
          name="validityEndDate"
          label="Date de fin de validité du devis"
          placeholder="today"
          [control]="uploadForm.controls.validityEndDate"
        >
          <p-datepicker
            class="block w-full"
            id="validityEndDate"
            appendTo="body"
            fluid
            iconDisplay="input"
            placeholder="Sélectionnez une date"
            required
            showIcon
            [formControl]="uploadForm.controls.validityEndDate"
            [minDate]="today"
            [numberOfMonths]="1"
          >
            <ng-template #inputicon>
              <icon-calendar class="size-4" colorMode="colored" />
            </ng-template>
          </p-datepicker>
        </oui-form-field>
      </div>
      <oui-dropzone
        showExtensions
        showMaxFileSize
        (filesChanged)="currentFile.set($event)"
        [extensions]="['.pdf']"
        [maxFileSize]="20"
      >
        <icon-upload class="size-36" colorMode="colored" />
      </oui-dropzone>

      <div class="flex flex-col gap-2">
        <div class="w-full">
          <p-checkbox
            inputId="uploadForm-agreeConditions"
            required
            [binary]="true"
            [formControl]="uploadForm.controls.agreeConditions"
          />
          <label class="ml-2 text-sm" for="uploadForm-agreeConditions">
            En cochant cette case, j'accepte les
            <a class="underline" routerLink="/cgu">
              Conditions générales Optee
            </a>
          </label>
        </div>

        <div class="w-full">
          <p-checkbox
            inputId="uploadForm-verifiedConformity"
            required
            [binary]="true"
            [formControl]="uploadForm.controls.verifiedConformity"
          />
          <label class="ml-2 text-sm" for="uploadForm-verifiedConformity">
            En cochant cette case, je confirme avoir vérifié la
            <a
              class="underline"
              rel="noopener"
              target="_blank"
              [href]="devisConformeUrl"
            >
              Conformité du devis
            </a>
          </label>
        </div>
      </div>

      @if (optionalFields().includes("signatories")) {
        <oui-field name="signatoryUuid" label="Signataire client">
          <p-select
            appendTo="body"
            optionLabel="label"
            optionValue="value"
            placeholder="Sélectionner le signataire"
            [filter]="(signatoriesOptions.value()?.length ?? 0) > 5"
            [formControl]="uploadForm.controls.signatoryUuid"
            [options]="signatoriesOptions.value()"
          >
            <ng-template #item let-signatory>
              <div class="flex flex-col gap-1">
                <p>{{ signatory.firstName }} {{ signatory.lastName }}</p>
                <span class="text-xs text-gray-600">{{ signatory.email }}</span>
              </div>
            </ng-template>
          </p-select>
        </oui-field>
      }

      <div class="flex items-center justify-start gap-4">
        <oui-button
          type="submit"
          variant="primary"
          [disabled]="
            uploadForm.invalid ||
            !currentFile()[0] ||
            (optionalFields().includes('signatories') &&
              !uploadForm.controls.signatoryUuid.value)
          "
        >
          Valider et envoyer
        </oui-button>

        @if (uploading()) {
          <span class="text-sm font-semibold">
            Envoi du fichier en cours ..
          </span>
        }
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    IconUploadComponent,
    ReactiveFormsModule,
    FormFieldComponent,
    DatePickerModule,
    IconCalendarComponent,
    InputText,
    ButtonComponent,
    Checkbox,
    InputNumberModule,
    DropzoneComponent,
    Select,
    FormsModule,
    FieldComponent,
  ],
})
export class DropboxComponent {
  readonly uploading = signal(false);
  readonly today = new Date();
  readonly optionalFields = input<DropboxFormField[]>([]);
  readonly clientUuid = input<ClientUuid | null>(null);
  readonly locationUuid = input<LocationUuid | null>(null);
  readonly heading = input<string>("Importer un nouveau devis");
  readonly muteUploadNotification = input(false, {
    transform: booleanAttribute,
  });

  readonly dataSubmitted = output<
    | Omit<
        inferProcedureInput<AppRouter["quotes"]["updateAndUploadDeprecated"]>,
        "hsId"
      >
    | Omit<inferProcedureInput<AppRouter["quotes"]["updateAndUpload"]>, "uuid">
    | inferProcedureInput<
        AppRouter["pros"]["createClientProject"]
      >["quoteInformation"]
  >();

  readonly signatorySelected = output<ContactUuid>();

  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly currentFile = signal<FileDto[]>([]);

  uploadForm = this.formBuilder.group({
    todayDate: new FormControl(
      { value: new Date().toISOString().substring(0, 10), disabled: true },
      [Validators.required],
    ),
    preTaxAmount: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    vatRate: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.max(100)],
    }),
    fundingAmount: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    validityEndDate: new FormControl<Date | null>(null, {
      validators: [Validators.required],
    }),
    agreeConditions: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
    verifiedConformity: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
    signatoryUuid: new FormControl<ContactUuid | null>(
      { value: null, disabled: true },
      [],
    ),
  });

  simulatorCeeUrl = buildAssetUrl("xlsm/SIMULATEUR-CEE-MOE-verMai.xlsm");
  devisConformeUrl = buildAssetUrl("pdf/devis-conforme.pdf");

  protected readonly signatoriesOptions = resource({
    params: () => ({
      clientUuid: this.clientUuid(),
      locationUuid: this.locationUuid(),
    }),
    loader: async ({ params }) => {
      try {
        const clientUuid = params.clientUuid;
        const locationUuid = params.locationUuid;
        if (!clientUuid || !locationUuid) {
          return [];
        }

        const signatories =
          await trpcClient.operations.getPotentialSignatoriesForPro.query({
            locationUuid,
            clientUuid,
          });

        return this.contactService.formatSignatories(signatories);
      } catch (error) {
        this.toastService.openError("Récupération des signataires", error);
        return [];
      }
    },
  });

  private readonly signatoriesOptionsEffect = effect(() => {
    if (this.signatoriesOptions.value()?.length) {
      this.uploadForm.controls.signatoryUuid.enable();
    } else {
      this.uploadForm.controls.signatoryUuid.reset(null);
      this.uploadForm.controls.signatoryUuid.disable();
    }
  });

  async uploadQuote() {
    const contextMessage = "Envoi du devis";

    const formValue = this.uploadForm.getRawValue();

    const {
      preTaxAmount,
      vatRate,
      fundingAmount,
      validityEndDate,
      agreeConditions,
      verifiedConformity,
      signatoryUuid,
    } = formValue;

    const fileDto = this.currentFile()?.at(0);

    if (
      !fileDto ||
      preTaxAmount == null ||
      vatRate == null ||
      fundingAmount == null ||
      validityEndDate == null ||
      !agreeConditions ||
      !verifiedConformity
    ) {
      this.uploading.set(false);
      this.toastService.openError(
        contextMessage,
        "Merci de remplir tous les champs.",
      );
      return;
    }

    try {
      this.uploading.set(true);
      const data = {
        ...formValue,
        preTaxAmount,
        vatRate,
        fundingAmount,
        validityEndDate: dateOnly(validityEndDate),
        file: fileDto,
      };

      if (signatoryUuid) {
        this.signatorySelected.emit(signatoryUuid);
      }

      //@todo we no longer wait for request to complete since in now handled by parents. Need to refactor this to handle loading state in parent
      this.dataSubmitted.emit(data);

      if (!this.muteUploadNotification()) {
        this.toastService.open(
          "success",
          contextMessage,
          "Votre devis a bien été envoyé. Il sera d'abord vérifié par nos équipes, puis transmis au client.",
        );
      }

      this.uploadForm.reset();
      this.currentFile.set([]);
    } catch (error) {
      this.toastService.openError(contextMessage, error);
    } finally {
      this.uploading.set(false);
    }
  }
}

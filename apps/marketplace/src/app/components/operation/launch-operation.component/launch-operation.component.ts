import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CTA, type OperationHubspotPrestationId } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogService,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { IconCalendarComponent, IconUploadComponent } from "@optee/icons";
import type { ContactUuid } from "@optee/models";
import {
  Operation,
  type LocationContactOnSite,
  type LocationUuid,
  type OperationUuid,
} from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import type { FileDto } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { DropzoneComponent } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { FileService } from "@optee/ui/services/file.service";
import { ToastService } from "@optee/ui/services/toast.service";
import { dateOnly } from "@optee/utils";
import { ButtonModule } from "primeng/button";
import { Checkbox } from "primeng/checkbox";
import { DatePickerModule } from "primeng/datepicker";
import { InputText } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { StepperModule } from "primeng/stepper";
import { TextareaModule } from "primeng/textarea";
import { map, startWith } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { OperationService } from "../../../services/operation.service";
import { TrackingService } from "../../../services/tracking.service";
import { IconOperationLaunchComponent } from "../icon-operation-launch/icon-operation-launch.component";
import { SignatorySelectComponent } from "../signatory-select/signatory-select.component";
import { LaunchOperationSuccessComponent } from "./launch-operation-success.component";

type BudgetOption = { label: string; value: string };

@Component({
  selector: "mkp-launch-operation",
  template: `
    <op-dialog-wrapper class="!w-[700px]" (crossClick)="abort()">
      <op-dialog-heading [heading]="CTA.launchThisOperation">
        <mkp-icon-operation-launch class="text-primary-700 size-8" iconSlot />

        @if (activePanel() === 4) {
          Le lancement de votre projet déclenche une phase d’intervention
          impliquant plusieurs experts et professionnels.
        } @else {
          Nous avons besoin d’informations complémentaires pour générer votre
          brief technique et lancer votre opération.
        }
      </op-dialog-heading>

      <p-stepper class="mt-4" [(value)]="activePanel" [linear]="true">
        <p-step-list class="font-display border-b border-gray-300 pb-4 text-sm">
          <p-step [value]="1">Budget et dates</p-step>
          <p-step [value]="2">Contact</p-step>
          <p-step [value]="3">Infos</p-step>
          <p-step [value]="4">Lancement</p-step>
        </p-step-list>
      </p-stepper>

      <form class="w-full" [formGroup]="formInitOperation">
        @if (activePanel() === 1) {
          <div class="flex flex-col gap-4 overflow-auto lg:flex-row">
            <oui-form-field
              class="flex-auto"
              name="plannedBudgetRange"
              label="Quel budget prévoyez-vous ?"
              [control]="formInitOperation.controls.plannedBudgetRange"
            >
              <p-select
                class="w-full"
                appendTo="body"
                fluid
                formControlName="plannedBudgetRange"
                placeholder="Sélectionnez un budget"
                [options]="budgetOptions"
              />
            </oui-form-field>

            <oui-form-field
              class="flex-auto"
              name="startDate"
              label="Quand souhaitez-vous démarrer l’opération ?"
              [control]="formInitOperation.controls.startDate"
            >
              <p-datepicker
                class="block w-full"
                id="startDate"
                appendTo="body"
                fluid
                formControlName="startDate"
                iconDisplay="input"
                placeholder="Sélectionnez une date"
                required
                showIcon
                [minDate]="today"
                [numberOfMonths]="1"
              >
                <ng-template #inputicon>
                  <icon-calendar class="size-4" colorMode="colored" />
                </ng-template>
              </p-datepicker>
            </oui-form-field>
          </div>

          <div class="mt-10 flex justify-end">
            <oui-button
              variant="primary"
              (click)="activePanel.set(2)"
              [disabled]="this.formInitOperation.controls.startDate.invalid"
            >
              Suivant
            </oui-button>
          </div>
        }

        @if (activePanel() === 2) {
          <div class="flex flex-col gap-6 overflow-auto">
            <mkp-signatory-select
              [locationUuid]="data.locationUuid"
              [signatoryUuid]="formInitOperation.controls.signatoryUuid"
            />

            <div class="font-display font-medium">Contact sur site</div>

            <div class="flex gap-4">
              <oui-form-field
                class="flex-auto"
                name="firstName"
                label="Prénom"
                [control]="formInitOperation.controls.firstName"
              >
                <input
                  id="firstName"
                  fluid
                  formControlName="firstName"
                  pInputText
                  required
                  type="text"
                />
              </oui-form-field>

              <oui-form-field
                class="flex-auto"
                name="lastName"
                label="Nom"
                [control]="formInitOperation.controls.lastName"
              >
                <input
                  id="lastName"
                  fluid
                  formControlName="lastName"
                  pInputText
                  required
                  type="text"
                />
              </oui-form-field>
            </div>

            <oui-form-field
              name="phone"
              label="Téléphone"
              [control]="formInitOperation.controls.phone"
            >
              <input
                id="phone"
                fluid
                formControlName="phone"
                pInputText
                required
                type="tel"
              />
            </oui-form-field>
          </div>
          <div class="mt-10 flex w-full items-center justify-between gap-4">
            <oui-button variant="outline" (click)="activePanel.set(1)">
              Précédent
            </oui-button>

            <oui-button
              variant="primary"
              (click)="activePanel.set(3)"
              [disabled]="
                this.formInitOperation.controls.signatoryUuid.invalid ||
                this.formInitOperation.controls.firstName.invalid ||
                this.formInitOperation.controls.lastName.invalid ||
                this.formInitOperation.controls.phone.invalid
              "
            >
              Suivant
            </oui-button>
          </div>
        }

        @if (activePanel() === 3) {
          <div class="flex flex-col gap-6">
            <oui-form-field
              name="additionalInfo"
              label="Informations et contraintes techniques"
              [control]="formInitOperation.controls.additionalInfo"
            >
              <textarea
                id="additionalInfo"
                fluid
                formControlName="additionalInfo"
                placeholder="Ex : Accessibilité réduite pour les interventions sur les façades. La continuité de service des logements doit être assurée pendant les travaux."
                pTextarea
                rows="6"
                [autoResize]="true"
              ></textarea>
            </oui-form-field>

            <div class="flex w-full items-center justify-between gap-4">
              <oui-button variant="outline" (click)="activePanel.set(2)">
                Précédent
              </oui-button>

              <oui-button
                variant="primary"
                (click)="activePanel.set(4)"
                [disabled]="
                  this.formInitOperation.controls.additionalInfo.invalid
                "
              >
                Suivant
              </oui-button>
            </div>
          </div>
        }

        @if (activePanel() === 4) {
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-6 overflow-auto">
              <div>
                <p
                  class="text-primary-900 font-display block text-sm font-medium leading-5 tracking-[0.28px]"
                >
                  Importer des documents
                </p>
                <p
                  class="font-display mb-3 block text-sm leading-5 tracking-[0.28px] text-gray-600"
                >
                  (CCTP, DPE, Audit, Cahier des charges,…) - facultatif
                </p>
                <oui-dropzone
                  class="mb-4"
                  compact
                  multiple
                  showExtensions
                  showMaxFileSize
                  (filesChanged)="currentFiles.set($event)"
                  [extensions]="['.pdf']"
                  [maxFileSize]="10"
                >
                  <icon-upload class="size-12" colorMode="colored" />
                </oui-dropzone>
              </div>

              <div class="text-primary-900 flex gap-2 text-base">
                <p-checkbox
                  formControlName="acceptPro"
                  inputId="acceptPro"
                  [binary]="true"
                />
                <label
                  class="cursor-pointer select-none text-sm lg:text-base"
                  for="acceptPro"
                >
                  Je confirme mon intérêt pour cette opération et souhaite être
                  mis en relation avec des professionnels qualifiés
                </label>
              </div>
            </div>

            <div class="flex w-full justify-end">
              <oui-button
                variant="primary"
                (click)="launchOperation()"
                [disabled]="(canSubmit$ | async) === false"
              >
                <mkp-icon-operation-launch class="size-4" />
                {{ CTA.launchThisOperation }}
              </oui-button>
            </div>
          </div>
        }
      </form>
    </op-dialog-wrapper>
  `,
  imports: [
    StepperModule,
    ButtonModule,
    CommonModule,
    SelectModule,
    Checkbox,
    ButtonComponent,
    ReactiveFormsModule,
    IconCalendarComponent,
    IconOperationLaunchComponent,
    DialogHeadingComponent,
    DatePickerModule,
    FormFieldComponent,
    InputText,
    TextareaModule,
    DialogWrapperComponent,
    DropzoneComponent,
    IconUploadComponent,
    SignatorySelectComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LaunchOperationComponent extends StronglyTypedDialog<
  {
    operationUuid?: OperationUuid;
    locationUuid: LocationUuid;
    contactOnSite?: LocationContactOnSite;
    hsPrestationId: OperationHubspotPrestationId;
    skipBriefPanel?: boolean;
  },
  boolean
> {
  protected readonly dialogService = inject(DialogService);
  protected readonly toastService = inject(ToastService);
  protected readonly fileService = inject(FileService);
  protected readonly operationService = inject(OperationService);
  protected readonly trackingService = inject(TrackingService);

  currentFiles = signal<FileDto[]>([]);

  protected readonly CTA = CTA;
  protected readonly activePanel = signal(1);
  protected readonly today = new Date();

  trackEffect = effect(() => {
    this.trackingService.trackClient("operation_launch_started");
  });

  budgetOptions: [BudgetOption, ...BudgetOption[]] = [
    { label: "Entre 0 € et 3 000 €", value: "0-3000" },
    { label: "Entre 3 000 € et 10 000 €", value: "3000-10000" },
    { label: "Entre 10 000 € et 25 000 €", value: "10000-25000" },
    { label: "Entre 25 000 € et 50 000 €", value: "25000-50000" },
    { label: "Entre 50 000 € et 100 000 €", value: "50000-100000" },
    { label: "Entre 100 000 € et 200 000 €", value: "100000-200000" },
    { label: "Entre 200 000 € et 500 000 €", value: "200000-500000" },
    { label: "+ de 500 000 €", value: "+500000" },
  ];

  formInitOperation = new FormGroup({
    plannedBudgetRange: new FormControl(null, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    startDate: new FormControl(null, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    firstName: new FormControl(this.data.contactOnSite?.firstName ?? "", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl(this.data.contactOnSite?.lastName ?? "", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    signatoryUuid: new FormControl<ContactUuid | null>(null, {
      validators: [Validators.required],
    }),
    phone: new FormControl(this.data.contactOnSite?.phone ?? "", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    additionalInfo: new FormControl(""),
    acceptPro: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });

  canSubmit$ = this.formInitOperation.valueChanges.pipe(
    map(() => this.formInitOperation.valid),
    startWith(false),
  );

  async launchOperation() {
    const signatoryUuid = this.formInitOperation.controls.signatoryUuid.value;
    try {
      if (this.formInitOperation.invalid || !signatoryUuid) {
        throw new Error("Le formulaire semble invalide");
      }

      const {
        firstName,
        lastName,
        phone,
        startDate,
        plannedBudgetRange,
        additionalInfo,
      } = this.formInitOperation.getRawValue();

      let operationUuid = this.data.operationUuid;

      if (!startDate || plannedBudgetRange === null) {
        this.toastService.openError(
          CTA.launchThisOperation,
          "Veuillez remplir tous les champs requis.",
        );
        return;
      }

      if (!operationUuid || Operation.isUuidSimulated(operationUuid)) {
        operationUuid = await this.operationService.createByClient({
          hsPrestationId: this.data.hsPrestationId,
          isFunding: false,
          locationUuid: this.data.locationUuid,
          plannedLaunchDate: startDate,
        });
      }

      await Promise.all([
        trpcClient.locations.updateContactOnSite.mutate({
          uuid: this.data.locationUuid,
          nameContactOnSite: `${firstName} ${lastName}`,
          phoneContactOnSite: phone,
        }),
        trpcClient.operations.launch.mutate({
          uuid: operationUuid,
          startDate: dateOnly(startDate),
          plannedBudgetRange,
          additionalInfo,
          signatoryUuid,
          files: this.currentFiles(),
        }),
      ]);

      this.dialogRef.close(true);

      this.trackingService.trackClient("operation_launch_completed");

      this.operationService.refresh();

      if (!this.data.skipBriefPanel) {
        this.dialogService.open(LaunchOperationSuccessComponent, {
          data: { operationUuid },
        });
      }
    } catch (error) {
      this.toastService.openError("Lancement de l'opération", error);
    }
  }

  abort() {
    this.trackingService.trackClient("operation_launch_aborted");
    this.dialogRef.close(null);
  }
}

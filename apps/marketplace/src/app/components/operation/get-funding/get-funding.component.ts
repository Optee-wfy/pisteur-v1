import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import type {
  OperationHubspotCategory,
  OperationSubTypeInfo,
} from "@optee/constants";
import {
  contactEmail,
  CTA,
  getPrestationParentCategory,
  OPERATION_TYPES_ARR,
  OperationType,
  VICTOR_CALENDLY,
} from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import {
  IconCalendarComponent,
  IconSuccessComponent,
  IconUploadComponent,
} from "@optee/icons";
import type { LocationUuid } from "@optee/models";
import { Location } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import type { FileDto } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { DropzoneComponent } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import { Checkbox } from "primeng/checkbox";
import { DatePickerModule } from "primeng/datepicker";
import { Select } from "primeng/select";
import { filter, from, map, shareReplay } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { OperationService } from "../../../services/operation.service";
import { TrackingService } from "../../../services/tracking.service";
import { IconOperationFundingComponent } from "../icon-operation-funding/icon-operation-funding.component";

type Steps = "init" | "too-late" | "select-operation" | "additional-info";

@Component({
  selector: "mkp-get-funding",
  template: `
    @if (operationCreated()) {
      <div
        class="relative flex max-w-2xl animate-[modal_300ms] flex-col items-center justify-center gap-4 rounded-3xl bg-white px-10 py-8"
      >
        <icon-success class="size-8" colorMode="colored" />

        <h2 class="font-display text-2xl font-semibold">Demande envoyée</h2>

        <p class="text-center text-sm text-gray-600">
          Votre demande de financements est terminée et sera transmise à notre
          équipe. Nous revenons vers vous au plus vite.
        </p>

        <oui-button variant="primary" (click)="backToOperations()">
          Revenir à mes opérations
        </oui-button>
      </div>
    } @else {
      <op-dialog-wrapper class="w-[500px]" (crossClick)="abort()">
        <op-dialog-heading [heading]="CTA.getFunding">
          <mkp-icon-operation-funding
            class="text-primary-700 size-8"
            iconSlot
          />

          @switch (currentStep()) {
            @case ("init") {
              Avez-vous déjà signé le devis de votre projet ?
            }
            @case ("too-late") {
              Malheureusement, une fois votre devis signé,
              <br />
              il est trop tard pour obtenir un financement.
            }
            @case ("select-operation") {
              Quelle opération souhaitez-vous réaliser ?
            }
            @case ("additional-info") {
              Si votre devis n’est pas encore signé,
              <br />
              envoyez-le nous et nous nous occuperons du reste.
            }
          }
        </op-dialog-heading>

        @switch (currentStep()) {
          @case ("init") {
            <div class="mt-auto flex items-center justify-center gap-4">
              <oui-button
                variant="outline"
                (click)="currentStep.set('too-late')"
              >
                Oui
              </oui-button>
              <oui-button
                variant="primary"
                (click)="currentStep.set('select-operation')"
              >
                Non
              </oui-button>
            </div>
          }
          @case ("too-late") {
            <div class="flex items-center justify-center gap-4">
              <oui-button variant="outline" (click)="currentStep.set('init')">
                Précédent
              </oui-button>
              <oui-button variant="primary" [href]="getCalendlyLink()">
                Contacter le support
              </oui-button>
            </div>
          }
          @case ("select-operation") {
            <form
              class="flex min-h-[300px] max-w-screen-sm flex-col gap-4"
              [formGroup]="operationForm"
            >
              <oui-form-field
                name="location"
                label="Site concerné"
                [control]="operationForm.controls.location"
              >
                <p-select
                  appendTo="body"
                  fluid
                  optionLabel="name"
                  placeholder="Sélectionner"
                  [formControl]="operationForm.controls.location"
                  [options]="(availableLocations$ | async) ?? undefined"
                />
              </oui-form-field>
              @if (operationForm.controls.location.value) {
                <oui-form-field
                  name="hsOperationCategory"
                  label="Type d'opération"
                  optionLabel="name"
                  [control]="operationForm.controls.hsOperationCategory"
                >
                  <p-select
                    appendTo="body"
                    fluid
                    optionLabel="label"
                    optionValue="hsOperationCategory"
                    placeholder="Sélectionner"
                    [formControl]="operationForm.controls.hsOperationCategory"
                    [options]="availableOperationTypes()"
                  />
                </oui-form-field>

                @if (operationForm.controls.hsOperationCategory.value) {
                  <oui-form-field
                    name="selectedOperation"
                    label="Travaux à réaliser"
                    [control]="operationForm.controls.selectedOperation"
                  >
                    <p-select
                      appendTo="body"
                      fluid
                      placeholder="Sélectionner"
                      [formControl]="operationForm.controls.selectedOperation"
                      [options]="selectableOperations()"
                    />
                  </oui-form-field>
                } @else {
                  <oui-message severity="info">
                    Sélectionnez un type d'opération pour voir les opérations
                    disponibles.
                  </oui-message>
                }
              } @else {
                <oui-message severity="info">
                  Sélectionnez un site pour voir les opérations disponibles.
                </oui-message>
              }
            </form>

            <div class="flex items-center justify-center gap-4">
              <oui-button variant="outline" (click)="currentStep.set('init')">
                Précédent
              </oui-button>
              <oui-button
                variant="primary"
                (click)="currentStep.set('additional-info')"
                [disabled]="operationForm.invalid"
              >
                Suivant
              </oui-button>
            </div>
          }
          @case ("additional-info") {
            <form
              class="flex flex-col gap-4 lg:min-w-96"
              [formGroup]="additionalInfoForm"
            >
              <oui-form-field
                class="flex-auto"
                name="launchingDate"
                label="Quand voulez-vous lancer l’opération ?"
                [control]="additionalInfoForm.controls.launchingDate"
              >
                <p-datepicker
                  class="block w-full"
                  id="launchingDate"
                  appendTo="body"
                  fluid
                  iconDisplay="input"
                  required
                  showIcon
                  [formControl]="additionalInfoForm.controls.launchingDate"
                  [minDate]="today"
                  [numberOfMonths]="1"
                >
                  <ng-template #inputicon>
                    <icon-calendar class="size-4" colorMode="colored" />
                  </ng-template>
                </p-datepicker>
              </oui-form-field>

              <oui-dropzone
                compact
                multiple
                showExtensions
                showMaxFileSize
                (filesChanged)="currentFiles.set($event)"
                [extensions]="['.pdf']"
                [filesNamesMaxLength]="30"
                [maxFileSize]="10"
              >
                <icon-upload class="size-12" colorMode="colored" />
              </oui-dropzone>

              <div class="flex items-start gap-2">
                <p-checkbox
                  inputId="additionalInfoForm-agreeConditions"
                  required
                  [binary]="true"
                  [formControl]="additionalInfoForm.controls.agreeConditions"
                />
                <label
                  class="text-xs text-gray-600 lg:min-w-80 lg:text-sm"
                  for="additionalInfoForm-agreeConditions"
                >
                  En envoyant votre devis, vous acceptez que nous contactions
                  directement le professionnel de votre part pour l'intégrer
                  dans notre réseau de professionnels.
                </label>
              </div>
            </form>
            <div class="flex items-center justify-center gap-4">
              <oui-button
                variant="outline"
                (click)="currentStep.set('select-operation')"
              >
                Précédent
              </oui-button>

              <oui-button
                variant="primary"
                (click)="createOperation()"
                [disabled]="
                  additionalInfoForm.invalid || currentFiles().length === 0
                "
              >
                Envoyer
              </oui-button>
            </div>
          }
        }
      </op-dialog-wrapper>
    }
  `,
  imports: [
    DialogWrapperComponent,
    DialogHeadingComponent,
    IconSuccessComponent,
    IconOperationFundingComponent,
    ButtonComponent,
    Select,
    ReactiveFormsModule,
    FormFieldComponent,
    DatePickerModule,
    IconCalendarComponent,
    IconUploadComponent,
    DropzoneComponent,
    MessageComponent,
    Checkbox,
    AsyncPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetFundingComponent extends StronglyTypedDialog<
  { selectedLocationUuid: LocationUuid },
  null
> {
  private readonly toastService = inject(ToastService);
  private readonly operationService = inject(OperationService);
  private readonly router = inject(Router);
  protected readonly trackingService = inject(TrackingService);

  protected readonly currentStep = signal<Steps>("init");
  protected readonly contactEmail = contactEmail;
  protected readonly today = new Date();

  CTA = CTA;

  trackEffect = effect(() => {
    this.trackingService.trackClient("funding_started");
  });

  protected readonly operationForm = new FormGroup({
    location: new FormControl<Location | null>(null, Validators.required),
    hsOperationCategory: new FormControl<OperationHubspotCategory | null>(
      null,
      Validators.required,
    ),
    selectedOperation: new FormControl<OperationSubTypeInfo | null>(
      null,
      Validators.required,
    ),
  });

  protected readonly selectedLocation = toSignal(
    this.operationForm.controls.location.valueChanges,
  );

  protected readonly selectedHsOperationCategory = toSignal(
    this.operationForm.controls.hsOperationCategory.valueChanges,
  );

  protected readonly operationCreated = signal(false);

  private readonly availableOperations = computed(() => {
    const currentLocation = this.selectedLocation();
    if (!currentLocation) {
      return [];
    }

    return OPERATION_TYPES_ARR.map((el) => el.subTypes)
      .flat()
      .filter(
        (op) =>
          getPrestationParentCategory(op.hsPrestationId).type !==
          OperationType.CONTRACT,
      )
      .filter((op) =>
        currentLocation.isCompatibleWithOperation(op.hsPrestationId),
      );
  });

  protected readonly availableOperationTypes = computed(() => {
    const availableOperationsIds = this.availableOperations().map(
      (op) => op.hsPrestationId,
    );

    return OPERATION_TYPES_ARR.filter((opt) =>
      opt.subTypes.some((subType) =>
        availableOperationsIds.includes(subType.hsPrestationId),
      ),
    );
  });

  protected readonly selectableOperations = computed(() => {
    const selectedHsOperationCategory = this.selectedHsOperationCategory();
    if (!selectedHsOperationCategory) {
      return [];
    }

    return this.availableOperations().filter(
      (op) =>
        getPrestationParentCategory(op.hsPrestationId).hsOperationCategory ===
        selectedHsOperationCategory,
    );
  });

  protected readonly additionalInfoForm = new FormGroup({
    launchingDate: new FormControl(new Date(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    agreeConditions: new FormControl<boolean>(false, Validators.requiredTrue),
  });

  protected readonly currentFiles = signal<FileDto[]>([]);

  availableLocations$ = from(trpcClient.locations.getAllForClient.query()).pipe(
    map((l) => l.map((l) => Location.init(l)).filter(isNotNullish)),
    filter(isNotNullish),
    shareReplay(1),
  );

  activeLocationSubscription = this.availableLocations$
    .pipe(takeUntilDestroyed())
    .subscribe((locations) => {
      if (this.data.selectedLocationUuid) {
        const activeLocation = locations.find(
          (location) => location.uuid === this.data.selectedLocationUuid,
        );
        if (activeLocation) {
          this.operationForm.controls.location.setValue(activeLocation);
        }
      }
    });

  async createOperation() {
    try {
      const locationUuid = this.operationForm.value?.location?.uuid;
      const hsPrestationId =
        this.operationForm.value?.selectedOperation?.hsPrestationId;

      const files = this.currentFiles();

      if (!locationUuid || !hsPrestationId || !files || files.length === 0) {
        throw new Error("Formulaire invalide");
      }

      const launchingDate = this.additionalInfoForm.getRawValue().launchingDate;

      const createdOperation = await this.operationService.createByClient({
        hsPrestationId,
        isFunding: true,
        locationUuid,
        plannedLaunchDate: launchingDate,
        files,
      });

      this.trackingService.trackClient("funding_completed");

      if (createdOperation) {
        this.operationCreated.set(true);
        this.operationService.refresh();
      } else {
        throw new Error("Erreur lors de la création de l'opération");
      }
    } catch (error) {
      this.toastService.openError("Création d'opération", error);
    }
  }

  backToOperations() {
    this.abort();
    this.router.navigate(["/client/piloter"]);
  }

  getCalendlyLink() {
    return VICTOR_CALENDLY;
  }

  abort() {
    this.dialogRef.close(null);
    this.trackingService.trackClient("funding_aborted");
  }
}

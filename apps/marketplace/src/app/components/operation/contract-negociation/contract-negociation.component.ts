import { AsyncPipe } from "@angular/common";
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
import { Router } from "@angular/router";
import { CTA, type OperationHubspotPrestationId } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { IconSuccessComponent, IconUploadComponent } from "@optee/icons";
import { Location } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import type { FileDto } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { DropzoneComponent } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import { Checkbox } from "primeng/checkbox";
import { RadioButton } from "primeng/radiobutton";
import { Select } from "primeng/select";
import { filter, from, map, shareReplay } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { OperationService } from "../../../services/operation.service";
import { TrackingService } from "../../../services/tracking.service";
import { IconOperationContractComponent } from "../icon-operation-contract/icon-operation-contract.component";

type ContractType = {
  label: string;
  value: OperationHubspotPrestationId;
};

@Component({
  selector: "mkp-contract-negotiation",
  template: `
    @if (operationCreated()) {
      <div
        class="relative flex max-w-2xl animate-[modal_300ms] flex-col items-center justify-center gap-4 rounded-3xl bg-white px-10 py-8"
      >
        <icon-success class="size-8" colorMode="colored" />

        <h2 class="font-display text-2xl font-semibold">Demande envoyée</h2>

        <p class="text-center text-sm text-gray-600">
          Votre demande est prise en charge, nous vous enverrons prochainement
          une proposition dans votre espace.
        </p>

        <oui-button variant="primary" (click)="dialogRef.close(null)">
          Terminer
        </oui-button>
      </div>
    } @else {
      <op-dialog-wrapper (crossClick)="abort()">
        <op-dialog-heading [heading]="CTA.negociateContract">
          <mkp-icon-operation-contract
            class="text-primary-700 size-8"
            iconSlot
          />

          Nos équipes négocient pour vous les meilleurs tarifs auprès des
          fournisseurs d’énergie. Sélectionnez le type de contrat à négocier et
          joignez les documents nécessaires pour démarrer la négociation.
        </op-dialog-heading>

        <form class="flex flex-col justify-between gap-4">
          <oui-form-field
            name="location"
            label="Type de contrat à négocier"
            [control]="contractForm.controls.contractType"
          >
            @for (contractType of contractTypes; track $index) {
              <div class="field-checkbox">
                <p-radiobutton
                  [formControl]="contractForm.controls.contractType"
                  [inputId]="contractType.label + $index"
                  [value]="contractType"
                />
                <label class="ml-2" [for]="contractType.label + $index">
                  {{ contractType.label }}
                </label>
              </div>
            }
          </oui-form-field>

          <oui-form-field
            name="location"
            label="Site concerné"
            [control]="contractForm.controls.location"
          >
            <p-select
              appendTo="body"
              fluid
              optionLabel="name"
              placeholder="Sélectionner"
              [formControl]="contractForm.controls.location"
              [options]="(availableLocations$ | async) ?? undefined"
            />
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

          <div class="flex items-start justify-start gap-2">
            <p-checkbox
              inputId="agreements"
              [binary]="true"
              [formControl]="contractForm.controls.agree"
            />
            <label class="ml-2" for="agreements">
              En envoyant votre contrat, vous acceptez que nous contactions
              votre fournisseur d’énergie pour négocier directement avec lui.
            </label>
          </div>

          <footer class="flex flex-col items-center justify-center gap-4 py-3">
            <oui-button
              variant="primary"
              (click)="negotiateContract()"
              [disabled]="!(contractForm.valid && currentFiles().length)"
            >
              Confirmer
            </oui-button>
            <div class="link" (click)="abort()">Annuler</div>
          </footer>
        </form>
      </op-dialog-wrapper>
    }
  `,
  imports: [
    DialogWrapperComponent,
    DialogHeadingComponent,
    IconOperationContractComponent,
    RadioButton,
    ReactiveFormsModule,
    FormFieldComponent,
    ButtonComponent,
    IconSuccessComponent,
    AsyncPipe,
    Checkbox,
    Select,
    DropzoneComponent,
    IconUploadComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractNegotiationComponent extends StronglyTypedDialog<
  null,
  null
> {
  protected readonly operationService = inject(OperationService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly trackingService = inject(TrackingService);

  trackEffect = effect(() => {
    this.trackingService.trackClient("contract_negociation_started");
  });

  protected readonly contractForm = new FormGroup({
    contractType: new FormControl<ContractType | null>(null, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    location: new FormControl<Location | null>(null, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    agree: new FormControl(false, [Validators.requiredTrue]),
  });

  protected readonly currentFiles = signal<FileDto[]>([]);

  CTA = CTA;

  protected readonly contractTypes: {
    label: string;
    value: OperationHubspotPrestationId;
  }[] = [
    { label: "Électricité", value: "CONTRAT ELECTRICITE" },
    { label: "Gaz", value: "CONTRAT GAZ" },
  ];

  protected readonly operationCreated = signal(false);

  protected readonly availableLocations$ = from(
    trpcClient.locations.getAllForClient.query(),
  ).pipe(
    map((l) => l.map((l) => Location.init(l)).filter(isNotNullish)),
    filter(isNotNullish),
    shareReplay(1),
  );

  async negotiateContract() {
    try {
      const locationUuid = this.contractForm.controls.location?.value?.uuid;
      const contractType = this.contractForm.controls.contractType.value;
      if (!locationUuid || !contractType) {
        throw new Error("Formulaire invalide; certains champs sont manquants");
      }

      const createdOperation = await this.operationService.createByClient({
        hsPrestationId: contractType.value,
        files: this.currentFiles(),
        locationUuid,
        isFunding: false,
      });

      this.trackingService.trackClient("contract_negociation_completed");

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

  abort() {
    this.dialogRef.close(null);
    this.trackingService.trackClient("contract_negociation_aborted");
  }
}

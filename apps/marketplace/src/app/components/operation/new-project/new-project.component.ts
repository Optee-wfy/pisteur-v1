import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CTA } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogService,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { IconCirclePlusComponent } from "@optee/icons";
import { OptionCardComponent } from "@optee/ui/components/organisms/option-card/option-card.component";
import { OperationService } from "../../../services/operation.service";
import { ContractNegotiationComponent } from "../contract-negociation/contract-negociation.component";
import { GetFundingComponent } from "../get-funding/get-funding.component";
import { IconOperationContractComponent } from "../icon-operation-contract/icon-operation-contract.component";
import { IconOperationFundingComponent } from "../icon-operation-funding/icon-operation-funding.component";
import { IconOperationGenericComponent } from "../icon-operation-generic/icon-operation-generic.component";
import { NewOperationByClientComponent } from "../new-operation-by-client/new-operation-by-client.component";

@Component({
  selector: "mkp-new-project",
  template: `
    <op-dialog-wrapper
      class="!w-[920px]"
      showCircle
      variant="primary-100"
      (crossClick)="dialogRef.close(null)"
      [fadedOut]="modalFadedOut()"
    >
      <op-dialog-heading [heading]="CTA.newProject">
        <icon-circle-plus class="text-primary-700 size-10" iconSlot />

        Sélectionnez le
        <span class="font-semibold">type de projet</span>
        à lancer
      </op-dialog-heading>

      <div class="relative flex flex-col gap-4 overflow-auto lg:flex-row">
        <oui-option-card
          class="flex-1"
          buttonVariant="primary"
          heading="Opération"
          highlight
          subtitle="Structurez ou lancez une opération de rénovation"
          text="Choisissez parmi plus d'une centaine d'actions de rénovation"
          (click)="selectOperation()"
          [sellingPoints]="[
            'Brief auto-généré',
            'Mise en concurrence rapide',
            'Réception de devis sans délai',
          ]"
        >
          <mkp-icon-operation-generic class="text-primary-700 size-8" />
        </oui-option-card>

        <oui-option-card
          class="flex-1"
          buttonVariant="litePrimary"
          heading="Financement"
          subtitle="Mobilisez aides et financements sur des devis existants."
          text="Combinez subventions et solutions bancaires."
          (click)="selectFunding()"
          [sellingPoints]="[
            'Subventions CEE',
            'Aides de l’ANAH',
            'Propositions de financement',
          ]"
        >
          <mkp-icon-operation-funding class="text-primary-700 size-8" />
        </oui-option-card>

        <oui-option-card
          class="flex-1"
          buttonVariant="litePrimary"
          heading="Contrat d’énergie"
          subtitle="Négociez un contrat d’énergie plus avantageux."
          text="Comparez les offres des fournisseurs d’électricité / gaz."
          (click)="selectContract()"
          [sellingPoints]="[
            'Mise en concurrence simplifiée',
            'Comparatif clair des offres',
            'Suivi de la contractualisation',
          ]"
        >
          <mkp-icon-operation-contract class="text-primary-700 size-8" />
        </oui-option-card>
      </div>
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    DialogHeadingComponent,
    IconOperationGenericComponent,
    IconOperationFundingComponent,
    IconOperationContractComponent,
    IconCirclePlusComponent,
    ReactiveFormsModule,
    OptionCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewProjectComponent extends StronglyTypedDialog<void, void> {
  protected readonly dialogService = inject(DialogService);
  protected readonly operationService = inject(OperationService);

  CTA = CTA;

  async selectOperation() {
    this.dialogRef.close(null);

    await this.dialogService.open(NewOperationByClientComponent, {
      data: { operation: null },
    });
  }

  async selectFunding() {
    this.dialogRef.close(null);

    await this.dialogService.open(GetFundingComponent, {
      data: {
        selectedLocationUuid: this.operationService.activeLocationUuid(),
      },
    });
  }

  async selectContract() {
    this.dialogRef.close(null);

    await this.dialogService.open(ContractNegotiationComponent);
  }
}

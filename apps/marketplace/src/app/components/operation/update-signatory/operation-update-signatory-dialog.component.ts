import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { CTA } from "@optee/constants";

import {
  DialogHeadingComponent,
  DialogService,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { IconSignatureComponent } from "@optee/icons";
import type {
  ContactUuid,
  OperationUuid,
  SignatoryContact,
} from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { SelectModule } from "primeng/select";
import { catchError, from, map, of, shareReplay } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { ContactService } from "../../../services/contact.service";
import { SignatorySelectComponent } from "../signatory-select/signatory-select.component";

export type OperationUpdateSignatoryDialogData = {
  operationUuid: OperationUuid;
  lastSignatoryUuid: ContactUuid | null;
};

@Component({
  selector: "mkp-operation-update-signatory-dialog",
  template: `
    <op-dialog-wrapper
      class="!w-[680px]"
      showCircle
      variant="primary-100"
      (crossClick)="dialogRef.close(null)"
    >
      <op-dialog-heading [heading]="CTA.updateSignatory">
        <icon-signature class="text-primary-700 size-10" iconSlot />

        Choisissez un nouveau signataire parmi les administrateurs associés à ce
        bâtiment. Il sera automatiquement appliqué à l’ensemble des devis liés à
        cette opération.
      </op-dialog-heading>

      <div class="w-full px-4">
        @if (locationUuid(); as locationUuid) {
          <mkp-signatory-select
            [locationUuid]="locationUuid"
            [signatoryUuid]="signatoryUuid"
          />
        }
      </div>

      <footer class="flex flex-col items-center justify-center gap-4 py-3">
        <oui-button
          type="submit"
          variant="primary"
          (click)="updateSignatory()"
          [disabled]="signatoryUuid.invalid"
        >
          Enregistrer
        </oui-button>
        <div class="link" (click)="dialogRef.close(null)">Annuler</div>
      </footer>
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    DialogHeadingComponent,
    IconSignatureComponent,
    SelectModule,
    ButtonComponent,
    ReactiveFormsModule,
    SignatorySelectComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationUpdateSignatoryDialogComponent extends StronglyTypedDialog<
  OperationUpdateSignatoryDialogData,
  SignatoryContact | null
> {
  private readonly contactService = inject(ContactService);

  protected readonly dialogService = inject(DialogService);
  protected readonly router = inject(Router);
  protected readonly toastService = inject(ToastService);

  readonly CTA = CTA;

  readonly signatoryOptions$ = from(
    trpcClient.operations.getPotentialSignatoriesForClient.query({
      operationUuid: this.data.operationUuid,
    }),
  ).pipe(
    map((signatories) => this.contactService.formatSignatories(signatories)),
    catchError((error) => {
      this.toastService.openError("Chargement des signataires", error);
      return of([]);
    }),
    shareReplay(1),
  );

  protected readonly signatoryUuid = new FormControl(
    this.data.lastSignatoryUuid,
    {
      validators: Validators.required,
    },
  );

  protected readonly locationUuid = toSignal(
    from(trpcClient.operations.get.query(this.data.operationUuid)).pipe(
      map((operation) => operation?.hsLocation?.uuid ?? null),
      catchError((error) => {
        this.toastService.openError("Chargement du bâtiment", error);
        return of(null);
      }),
    ),
    { initialValue: null },
  );

  async updateSignatory() {
    const contextMessage = "Modification du signataire";
    const signatoryUuid = this.signatoryUuid.getRawValue();

    if (!signatoryUuid) {
      this.toastService.openError(
        contextMessage,
        "Veuillez sélectionner un signataire.",
      );
      this.signatoryUuid.markAsTouched();
      return;
    }

    try {
      const { firstName, lastName, email } =
        (await trpcClient.contacts.get.query(signatoryUuid)) ?? {};

      if (!email) {
        throw new Error(
          "Le signataire sélectionné n'a pas d'adresse mail de renseigné. Merci de contacter le support.",
        );
      }
      await trpcClient.operations.updateSignatory.mutate({
        uuid: this.data.operationUuid,
        signatoryUuid,
      });

      this.toastService.open(
        "success",
        contextMessage,
        "Le signataire a bien été mis à jour.",
      );

      this.dialogRef.close({
        uuid: signatoryUuid,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        email,
        updatable: true,
      });
    } catch (error) {
      this.toastService.openError(contextMessage, error);
    }
  }
}

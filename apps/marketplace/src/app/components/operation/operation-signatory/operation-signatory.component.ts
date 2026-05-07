import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  output,
  resource,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { DialogService } from "@optee/dialog";
import type {
  ContactUuid,
  OperationUuid,
  SignatoryContact,
} from "@optee/models";
import { ToastService } from "@optee/ui/services/toast.service";
import { isEmailFromOptee, isNotNullish } from "@optee/utils";
import { Tooltip } from "primeng/tooltip";
import { filter, map } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { AuthService } from "../../../services/auth.service";
import { PermissionService } from "../../../services/permission.service";
import { OperationUpdateSignatoryDialogComponent } from "../update-signatory/operation-update-signatory-dialog.component";

@Component({
  selector: "mkp-operation-signatory",
  host: { class: "inline-flex flex-wrap gap-1 items-center justify-start" },
  template: `
    @let signatoryValue = signatory();

    @if (!!prefix()) {
      <span>{{ prefix() }}</span>
    }

    @if (
      signatoryValue && signatoryValue.firstName && signatoryValue.lastName
    ) {
      <span class="font-semibold">
        {{ signatoryValue.firstName }} {{ signatoryValue.lastName }}
      </span>

      @if (showEmail() && signatoryValue.email) {
        <span>({{ signatoryValue.email }}).</span>
      }
    } @else {
      {{ noSignatoryErrorMessage }}
    }

    <!-- CTA.updateSignatory  -->
    @if (authService.isLoggedAsClient()) {
      @let canUpdate = canUpdateSignatory.value();
      <button
        class="link"
        type="button"
        (click)="canUpdate && openUpdateSignatoryDialog()"
        [class.!text-white]="canUpdate && whiteLink()"
        [class.disabled]="!canUpdate"
        [disabled]="!canUpdate"
        [pTooltip]="canUpdate ? undefined : operationNotEditableMessage"
      >
        (modifier)
      </button>
    }
  `,
  imports: [Tooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationSignatoryComponent {
  readonly operationUuid = input.required<OperationUuid>();
  readonly signatory = model.required<Partial<SignatoryContact> | null>();
  readonly showEmail = input(false, { transform: booleanAttribute });
  readonly whiteLink = input(false, { transform: booleanAttribute });
  readonly prefix = input<string>();

  readonly signatoryChanged = output<SignatoryContact | null>();

  private readonly permissionService = inject(PermissionService);
  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(DialogService);
  protected readonly authService = inject(AuthService);

  protected readonly noSignatoryErrorMessage = "Aucun signataire trouvé.";

  protected readonly operationNotEditableMessage =
    "La signature d'un des devis liés à cette opération à déjà été amorcée. Il n'est donc plus possible de modifier le signataire.";

  protected readonly currentUserContact = toSignal(
    this.authService.contact$.pipe(
      filter(isNotNullish),
      map((contact) => ({
        uuid: contact.uuid,
        adminOptee: isEmailFromOptee(contact.email),
      })),
    ),
    {
      initialValue: { uuid: null as unknown as ContactUuid, adminOptee: false },
    },
  );

  protected readonly canUpdateSignatory = resource({
    params: () => ({
      currentUserContact: this.currentUserContact(),
      operationUuid: this.operationUuid(),
      hasPermissionToUpdate: this.permissionService.canUpdateSignatory(),
      updatable: !!this.signatory()?.updatable,
    }),
    loader: async ({ params }) => {
      if (
        !params.currentUserContact.uuid ||
        !params.operationUuid ||
        !params.updatable
      ) {
        return false;
      } else if (params.currentUserContact.adminOptee) {
        return true;
      } else if (!params.hasPermissionToUpdate) {
        return false;
      }

      try {
        const operationSignatoryCanBeUpdated =
          await trpcClient.operations.operationSignatoryCanBeUpdated.query(
            params.operationUuid,
          );

        if (!operationSignatoryCanBeUpdated) {
          return false;
        }
        const signatories =
          await trpcClient.operations.getPotentialSignatoriesForClient.query({
            operationUuid: params.operationUuid,
          });
        return signatories.some(
          (s) => s.uuid === params.currentUserContact.uuid,
        );
      } catch (error) {
        this.toastService.openError(
          "Vérification des informations du devis",
          error,
        );
        return false;
      }
    },
  });

  async openUpdateSignatoryDialog() {
    const { res: updated } = await this.dialogService.open(
      OperationUpdateSignatoryDialogComponent,
      {
        data: {
          operationUuid: this.operationUuid(),
          lastSignatoryUuid: this.signatory()?.uuid ?? null,
        },
      },
    );

    if (updated) {
      this.signatory.set(updated);
      this.signatoryChanged.emit(updated);
    }
  }
}

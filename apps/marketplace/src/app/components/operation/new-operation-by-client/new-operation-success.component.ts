import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import type { BriefPageQueryParams } from "@optee/constants";
import { BRIEF_PAGE_SOURCE_QUERY_PARAM, CTA } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogService,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { IconSuccessComponent } from "@optee/icons";
import type { OperationUuid } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { OperationService } from "../../../services/operation.service";
import { IconOperationLaunchComponent } from "../icon-operation-launch/icon-operation-launch.component";
import { LaunchOperationComponent } from "../launch-operation.component/launch-operation.component";

@Component({
  selector: "mkp-new-operation-success",
  template: `
    <op-dialog-wrapper (crossClick)="dialogRef.close(null)">
      <op-dialog-heading [heading]="CTA.plannedOperation">
        <icon-success class="size-10" colorMode="colored" iconSlot />
      </op-dialog-heading>

      <div class="flex max-w-prose flex-col items-center justify-center gap-8">
        <p class="m-0 text-sm text-gray-600">
          L’opération a bien été ajoutée à votre site, dans
          <strong>votre plan de travaux prévisionnel</strong>
          . Vous pouvez consulter votre
          <strong>brief technique</strong>
          dès maintenant.
          <br />
          <br />
          Vous aurez ensuite la possibilité de lancer un appel d’offres si vous
          le souhaitez —
          <strong>aucun engagement n’a été pris à ce stade</strong>
          .
        </p>

        <div class="flex justify-center gap-4">
          <oui-button variant="litePrimary" (click)="redirectToBrief()">
            Voir mon brief
          </oui-button>

          <oui-button variant="primary" (click)="launchOperation()">
            <mkp-icon-operation-launch class="size-4" />
            {{ CTA.launchCallForTender }}
          </oui-button>
        </div>
      </div>
    </op-dialog-wrapper>
  `,
  imports: [
    ButtonComponent,
    DialogWrapperComponent,
    IconSuccessComponent,
    DialogHeadingComponent,
    IconOperationLaunchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewOperationSuccessComponent extends StronglyTypedDialog<
  {
    operationUuid: OperationUuid;
  },
  null
> {
  protected readonly router = inject(Router);
  protected readonly operationService = inject(OperationService);
  protected readonly dialogService = inject(DialogService);

  CTA = CTA;

  redirectToBrief() {
    this.dialogRef.close(null);

    const queryParams: BriefPageQueryParams = {
      [BRIEF_PAGE_SOURCE_QUERY_PARAM]: "Intégration - Modale de succès",
    };

    this.router.navigate([`/client/brief/${this.data.operationUuid}`], {
      queryParams,
    });
  }

  async launchOperation() {
    const operation = await this.operationService.get(this.data.operationUuid);

    if (!operation) {
      return;
    }

    this.dialogRef.close(null);

    await this.dialogService.open(LaunchOperationComponent, {
      data: {
        operationUuid: operation.uuid,
        locationUuid: operation.location.uuid,
        contactOnSite: operation.location.contactOnSite,
        hsPrestationId: operation.prestationId,
      },
    });
  }
}

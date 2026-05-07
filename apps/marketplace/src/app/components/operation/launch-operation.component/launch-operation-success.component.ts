import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import type { BriefPageQueryParams } from "@optee/constants";
import { BRIEF_PAGE_SOURCE_QUERY_PARAM } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { IconSuccessComponent } from "@optee/icons";
import type { OperationUuid } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

@Component({
  selector: "mkp-launch-operation-success",
  template: `
    <op-dialog-wrapper
      class="items-center justify-center"
      (crossClick)="dialogRef.close(null)"
    >
      <op-dialog-heading heading="Appel d’offres lancé avec succès 🎉">
        <icon-success class="size-10" colorMode="colored" iconSlot />

        Vos informations ont été transmises à des prestataires agréés.
        <br />
        Vous pourrez suivre les réponses, comparer les devis et échanger
        directement avec les professionnels.

        <oui-button class="mt-4" variant="primary" (click)="redirectToBrief()">
          Voir mon brief
        </oui-button>
      </op-dialog-heading>
    </op-dialog-wrapper>
  `,
  imports: [
    CommonModule,
    ButtonComponent,
    DialogWrapperComponent,
    DialogHeadingComponent,
    IconSuccessComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LaunchOperationSuccessComponent extends StronglyTypedDialog<
  {
    operationUuid: OperationUuid;
  },
  null
> {
  protected readonly router = inject(Router);

  redirectToBrief() {
    this.dialogRef.close(null);

    const queryParams: BriefPageQueryParams = {
      [BRIEF_PAGE_SOURCE_QUERY_PARAM]: "Lancement - Modale de succès",
    };

    this.router.navigate([`/client/brief/${this.data.operationUuid}`], {
      queryParams,
    });
  }
}

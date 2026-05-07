import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { CTA } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import {
  OPERATIONS_PAGE_PHASE_QUERY_PARAM,
  type PiloterPageQueryParams,
} from "../../../pages/logged/client/piloter.page";
import { OperationService } from "../../../services/operation.service";
import { IconOperationLaunchComponent } from "../icon-operation-launch/icon-operation-launch.component";

@Component({
  selector: "mkp-operation-notification",
  template: `
    <op-dialog-wrapper class="!w-[700px]" closeIconHidden>
      <op-dialog-heading class="gap-4" [heading]="CTA.operationsToLaunch">
        <mkp-icon-operation-launch class="text-primary-700 size-8" iconSlot />
        <p class="text-center">
          @if (data.upcomingOperationsCount > 1) {
            Vous avez
            <strong>{{ data.upcomingOperationsCount }}</strong>
            opérations planifiées dans votre plan d’action qui n’ont pas encore
            été lancées.
          } @else {
            Vous avez
            <strong>1</strong>
            opération planifiée dans votre plan d’action qui n’a pas encore été
            lancée.
          }

          Cliquez ci-dessous pour les consulter et les lancer afin de recevoir
          des propositions de devis de la part de nos professionnels.
        </p>
      </op-dialog-heading>
      <footer class="flex flex-col items-center justify-center gap-4 py-3">
        <oui-button variant="primary" (click)="redirectToUpcomingOperations()">
          Voir mes opérations
        </oui-button>
        <div class="link" (click)="dialogRef.close(null)">Plus tard</div>
      </footer>
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    IconOperationLaunchComponent,
    DialogHeadingComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationNotificationComponent extends StronglyTypedDialog<
  { upcomingOperationsCount: number },
  null
> {
  private readonly router = inject(Router);
  protected readonly operationService = inject(OperationService);

  CTA = CTA;

  redirectToUpcomingOperations() {
    const queryParams: PiloterPageQueryParams = {
      [OPERATIONS_PAGE_PHASE_QUERY_PARAM]: "📩 Appel d’offres lancé",
    };

    this.dialogRef.close(null);
    this.router.navigate(["/client/piloter"], {
      queryParams,
    });
  }
}

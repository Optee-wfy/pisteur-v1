import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  resource,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { IconRefreshComponent } from "@optee/icons";
import type { OperationHsId } from "@optee/models";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { TextareaModule } from "primeng/textarea";
import trpcClient from "../../../trpc-client";
import { OperationBriefComponent } from "../../components/operation/operation-brief/operation-brief.component";

@Component({
  selector: "mkp-brief-page",
  host: {
    class:
      "flex gap-6 2xl:gap-10 flex-col-reverse justify-center lg:flex-row p-4 xl:p-10",
  },
  template: `
    @if (operationUuidResource.isLoading()) {
      <div
        class="flex w-full items-center justify-center gap-6 rounded-2xl bg-white p-4 py-6"
      >
        <icon-refresh class="size-5 animate-spin" />
        <span class="italic">Chargement du brief technique...</span>
      </div>
    } @else {
      @if (operationUuidResource.value(); as operationUuid) {
        <mkp-operation-brief
          [access]="access"
          [operationUuid]="operationUuid"
        />
      } @else {
        <oui-message
          severity="error"
          summary="Une erreur est survenue lors du chargement du brief technique."
        >
          {{ errorMessage() }}
        </oui-message>
      }
    }
  `,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    TextareaModule,
    OperationBriefComponent,
    IconRefreshComponent,
    MessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BriefPageComponent {
  readonly operationHsId = input.required<OperationHsId>();

  protected readonly access = "read-only" as const;

  readonly operationUuidResource = resource({
    params: () => ({ operationHsId: this.operationHsId() }),
    loader: ({ params }) =>
      trpcClient.operations.getUuidByHsId.query({
        operationHsId: params.operationHsId,
      }),
  });

  errorMessage = computed(() =>
    this.operationUuidResource.error()
      ? "Veuillez réessayer plus tard ou contacter notre support si le problème persiste."
      : "Vérifiez l’URL ou contactez notre support pour accéder aux informations complètes.",
  );
}

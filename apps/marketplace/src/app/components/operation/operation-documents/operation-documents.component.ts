import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from "@angular/core";
import type { UserType } from "@optee/constants";
import { IconFileComponent } from "@optee/icons";
import type { OperationUuid, QuoteUuid } from "@optee/models";
import { Operation } from "@optee/models";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { Tooltip } from "primeng/tooltip";
import trpcClient from "../../../../trpc-client";
import { OperationService } from "../../../services/operation.service";
import { OperationsQuotesComponent } from "../operation-quotes/operation-quotes.component";

@Component({
  selector: "mkp-operation-documents",
  host: { class: "flex flex-col gap-8 px-3" },
  template: `
    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-semibold">Devis</h2>

      @if (!isSimulatedOperation()) {
        <mkp-operations-quotes
          [operationUuid]="operationUuid()"
          [quoteUuidToUpload]="quoteUuidToUpload()"
        />
      } @else {
        <oui-message class="w-full" severity="info">
          Une fois l'opération lancée, vous pourrez consulter les devis ici.
        </oui-message>
      }
    </section>

    <section class="flex flex-col gap-3">
      <header>
        <h2 class="text-lg font-semibold">Documents importés</h2>
        <span class="text-sm text-gray-600">
          Retrouvez ci-dessous l'ensemble des documents associés à cette
          opération
        </span>
      </header>
      <div class="flex flex-col gap-2">
        @for (document of documents.value(); track $index) {
          <a
            class="bg-primary-50 hover:bg-primary-100 flex cursor-pointer items-start justify-start gap-2 rounded-lg px-4 py-2"
            rel="noopener noreferrer"
            target="_blank"
            (click)="!document.fileUrl ? $event.preventDefault() : null"
            [class.opacity-50]="!document.fileUrl"
            [href]="document.fileUrl || '#'"
          >
            <icon-file class="mt-1.5 size-7" />

            <div class="flex flex-col gap-1">
              <span class="font-semibold">
                {{ document.name }}
              </span>
              <span class="text-xs text-gray-600">
                {{ document.updatedAt | date }}
              </span>
            </div>

            @if (!document.fileUrl) {
              <span
                class="absolute right-2 top-2 text-xs text-red-500"
                [pTooltip]="
                  !document.fileUrl ? unavailableDocumentMessage : undefined
                "
              >
                Indisponible
              </span>
            }
          </a>
        } @empty {
          <oui-message class="w-full" severity="info">
            Aucun document associé à cette opération.
          </oui-message>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MessageComponent,
    OperationsQuotesComponent,
    DatePipe,
    IconFileComponent,
    Tooltip,
  ],
})
export class OperationDocumentsComponent {
  readonly operationUuid = input.required<OperationUuid>();
  readonly displayFor = input.required<UserType>();

  readonly quoteUuidToUpload = input<QuoteUuid | null>(null);

  protected readonly operationService = inject(OperationService);

  protected readonly isSimulatedOperation = computed(() =>
    Operation.isUuidSimulated(this.operationUuid()),
  );

  protected readonly documents = resource({
    params: () => ({
      operationUuid: this.operationUuid(),
      displayFor: this.displayFor(),
      isSimulated: this.isSimulatedOperation(),
    }),
    loader: ({ params }) => {
      const { isSimulated, ...input } = params;
      return isSimulated
        ? Promise.resolve([])
        : trpcClient.operations.getDocuments.query(input);
    },
  });

  protected readonly unavailableDocumentMessage =
    "Le document n'est pas encore disponible";
}

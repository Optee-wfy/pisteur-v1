import { ChangeDetectionStrategy, Component } from "@angular/core";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import type { QuoteUuid } from "@optee/models";
import type { AppRouter } from "@optee/trpc-client";
import type { inferProcedureInput } from "@trpc/server";
import trpcClient from "../../../trpc-client";
import { DropboxComponent } from "../dropbox/dropbox.component";

@Component({
  selector: "mkp-quote-upload-dialog",
  template: `
    <op-dialog-wrapper
      class="!w-[680px] overflow-scroll"
      showCircle
      variant="primary-100"
      (crossClick)="dialogRef.close(null)"
      [fadedOut]="modalFadedOut()"
    >
      <mkp-dropbox
        class="max-w-screen-lg flex-1"
        (dataSubmitted)="submit($event)"
        [optionalFields]="['currentDate']"
      />
    </op-dialog-wrapper>
  `,
  imports: [DialogWrapperComponent, DropboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteUploadComponent extends StronglyTypedDialog<
  {
    quoteUuid: QuoteUuid;
  },
  QuoteUuid
> {
  async submit(
    data: Omit<
      inferProcedureInput<AppRouter["quotes"]["updateAndUpload"]>,
      "uuid"
    >,
  ) {
    const result = await trpcClient.quotes.updateAndUpload.mutate({
      ...data,
      uuid: this.data.quoteUuid,
    });

    this.dialogRef.close(result);
  }
}

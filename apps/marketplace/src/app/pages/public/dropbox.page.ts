import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { QuoteHsId } from "@optee/models";
import type { AppRouter } from "@optee/trpc-server";
import type { inferProcedureInput } from "@trpc/server";
import trpcClient from "../../../trpc-client";
import { DropboxComponent } from "../../components/dropbox/dropbox.component";

@Component({
  selector: "mkp-dropbox-page",
  host: {
    class: "h-full w-full flex flex-wrap items-start justify-center p-6 gap-8",
  },
  template: `
    <mkp-dropbox
      class="max-w-screen-lg flex-1"
      (dataSubmitted)="submit($event)"
      [optionalFields]="['currentDate']"
    />
  `,
  imports: [DropboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DropboxPageComponent {
  readonly hsId = input.required<QuoteHsId>();

  protected submit(
    data: Omit<
      inferProcedureInput<AppRouter["quotes"]["updateAndUploadDeprecated"]>,
      "hsId"
    >,
  ) {
    trpcClient.quotes.updateAndUploadDeprecated.mutate({
      ...data,
      hsId: this.hsId(),
    });
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { HS_QUOTES_BASE_URL, UserType } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import { IconEyeComponent, IconEyeSlashComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FileService } from "@optee/ui/services/file.service";
import { Tooltip } from "primeng/tooltip";
import trpcClient from "../../../trpc-client";
import { QuoteValidationAdminComponent } from "./quote-validation-admin.component";
import type { AdminQuote } from "./quotes-list-admin.component";

@Component({
  selector: "mkp-quote-row",
  host: { class: "table-row align-middle p-2 odd:bg-primary-50" },
  template: `
    <td class="px-3 py-2">
      <a
        class="text-primary-700 underline"
        rel="noopener"
        target="_blank"
        [href]="hsQuoteUrl + quote().id"
      >
        {{ quote().name }}
      </a>
    </td>
    <td class="px-3 py-2">{{ quote().account?.name ?? "Non renseignée" }}</td>
    <td class="px-3 py-2">{{ quote().pro?.name ?? "Non renseigné" }}</td>
    <td class="px-3 py-2">
      <span class="max-w-xs">
        {{ quote().location?.name }} ({{ quote().location?.streetName }}
        {{ quote().location?.city }})
      </span>
    </td>
    <td class="px-3 py-2">
      <div class="flex items-center gap-6 px-2">
        @if (quote().fileId) {
          <a
            class="text-primary-700 shrink-0 cursor-pointer"
            (click)="downloadPdf()"
          >
            <icon-eye class="size-5" />
          </a>
        } @else {
          <icon-eye-slash
            class="size-5 shrink-0"
            pTooltip="Fichier inaccessible"
          />
        }
        <oui-button
          tooltipPosition="left"
          variant="primary"
          (click)="validateQuote()"
          [disabled]="shouldBeDisabled()"
          [pTooltip]="shouldBeDisabled() ? errorMessage() : undefined"
        >
          Valider
        </oui-button>
      </div>
    </td>
  `,
  imports: [ButtonComponent, Tooltip, IconEyeComponent, IconEyeSlashComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteRowComponent {
  quote = input.required<AdminQuote>();

  validated = output();

  protected readonly shouldBeDisabled = computed(
    () => !this.quote().hasSignatory || !this.quote().fileId,
  );

  protected readonly errorMessage = computed(() =>
    !this.quote().hasSignatory ? "Pas de signataire" : "Fichier inaccessible",
  );

  private readonly fileService = inject(FileService);
  private readonly dialogService = inject(DialogService);

  protected readonly hsQuoteUrl = HS_QUOTES_BASE_URL;

  async validateQuote() {
    const dialog = await this.dialogService.open(
      QuoteValidationAdminComponent,
      {
        data: {
          quoteUuid: this.quote().uuid,
        },
      },
    );
    if (dialog.res?.quoteUuid) {
      this.validated.emit();
    }
  }

  async downloadPdf() {
    const fileId = this.quote().fileId;
    if (!fileId) {
      return;
    }
    const url = await trpcClient.quotes.getFileUrl.query({
      hsId: fileId,
      quoteUuid: this.quote().uuid,
      loggedAs: UserType.ADMIN,
    });

    if (url) {
      this.fileService.downloadFileFromUrl(url, this.quote().name + ".pdf");
    }
  }
}

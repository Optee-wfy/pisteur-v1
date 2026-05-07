import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { DialogService } from "@optee/dialog";
import { IconPaperPlaneComponent } from "@optee/icons";
import type { ExternalContactUuid, LegalEntityUuid } from "@optee/models";
import { Tooltip } from "primeng/tooltip";
import { ProspectionDialogComponent } from "../prospection-dialog/prospection-dialog.component";

@Component({
  selector: "mkp-prospect-email-button",
  template: `
    @if (this.contact(); as contact) {
      @let contactEmail = contact.email;
      @let disabled = !emailUnlocked() || !contactEmail;
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full bg-green-600 p-1.5 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        tooltipPosition="left"
        (click)="
          !disabled &&
            contactEmail &&
            launchProspectionDialog({
              contactUuid: contact.uuid,
              legalEntityUuid: this.legalEntityUuid(),
              contactEmail,
            })
        "
        [disabled]="disabled"
        [pTooltip]="tooltipLabel()"
      >
        <icon-paper-plane class="size-3" />
      </button>
    }
  `,
  imports: [IconPaperPlaneComponent, Tooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProspectEmailButtonComponent {
  readonly contact = input.required<{
    email: string | null;
    uuid: ExternalContactUuid;
  } | null>();

  readonly legalEntityUuid = input.required<LegalEntityUuid>();
  readonly emailUnlocked = input(true);

  private readonly dialogService = inject(DialogService);

  protected readonly tooltipLabel = computed(() => {
    if (!this.emailUnlocked()) {
      return "Débloquez l'adresse email pour pouvoir envoyer un email à ce contact";
    }

    if (!this.contact()?.email) {
      return "Email non disponible";
    }

    return "Envoyer un email";
  });

  protected launchProspectionDialog({
    contactUuid,
    legalEntityUuid,
    contactEmail,
  }: {
    contactUuid: ExternalContactUuid;
    legalEntityUuid: LegalEntityUuid;
    contactEmail: string;
  }) {
    this.dialogService.open(ProspectionDialogComponent, {
      data: {
        contact: {
          uuid: contactUuid,
          email: contactEmail,
        },
        legalEntityUuid,
      },
      disableClose: true,
    });
  }
}

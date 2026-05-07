import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  ViewChild,
} from "@angular/core";
import { AssociationProExternalContactStatus } from "@optee/constants";
import { ToastService } from "@optee/ui/services/toast.service";
import { Popover } from "primeng/popover";
import trpcClient from "../../../../../../trpc-client";
import { ExternalContactStatusComponent } from "../external-contact-status/external-contact-status.component";

@Component({
  selector: "mkp-external-contact-status-pro",
  template: `
    <mkp-external-contact-status
      class="cursor-pointer"
      (click)="togglePopover($event)"
      [status]="status()"
    />
    <p-popover #popover>
      <div class="-m-2 flex flex-col gap-1 p-1">
        @for (status of statusOptions(); track status; let i = $index) {
          <mkp-external-contact-status
            class="cursor-pointer"
            (click)="updateStatus(status)"
            [status]="status"
          />
        }
      </div>
    </p-popover>
  `,
  imports: [ExternalContactStatusComponent, Popover],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalContactStatusProComponent {
  readonly status = model.required<AssociationProExternalContactStatus>();
  readonly associationUuid = input.required<string>();

  readonly updated = output<AssociationProExternalContactStatus>();

  @ViewChild("popover") popover?: Popover;

  private readonly toastService = inject(ToastService);

  protected readonly statusOptions = computed(() => {
    const values = Object.values(
      AssociationProExternalContactStatus,
    ) as AssociationProExternalContactStatus[];
    return values.filter((status) => status !== this.status());
  });

  protected togglePopover(event: Event) {
    this.popover?.toggle(event);
  }

  protected async updateStatus(status: AssociationProExternalContactStatus) {
    try {
      await trpcClient.externalContacts.updateStatus.mutate({
        associationUuid: this.associationUuid(),
        status,
      });
      this.popover?.hide();
      this.status.set(status);
      this.updated.emit(status);
    } catch (error) {
      this.toastService.openError("Mise à jour du statut du contact.", error);
    }
  }
}

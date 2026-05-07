import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { formatFullName, formatNameInitials } from "@optee/utils";
import { Tooltip } from "primeng/tooltip";

@Component({
  selector: "mkp-external-contact-owner",
  template: `
    <div
      class="bg-granite-100 text-granite-500 flex size-8 items-center justify-center justify-self-center rounded-full text-xs font-semibold"
      tooltipPosition="left"
      [pTooltip]="ownerFullName()"
    >
      {{ ownerInitials() }}
    </div>
  `,
  imports: [Tooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalContactOwnerComponent {
  readonly owner = input<{
    firstName: string | null;
    lastName: string | null;
  } | null>(null);

  protected readonly ownerInitials = computed(() =>
    formatNameInitials(this.owner()),
  );

  protected readonly ownerFullName = computed(() =>
    formatFullName(this.owner()),
  );
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import type { OperationRow } from "@optee/models";
import { AuthService } from "../../../services/auth.service";
import { OperationService } from "../../../services/operation.service";
import { ProService } from "../../../services/pro.service";

@Component({
  selector: "mkp-operation-status-pill",
  host: {
    class: "font-display -ml-2 whitespace-nowrap rounded-lg px-2 py-1 text-xs",
    "[class]": "badgeColor()",
  },
  template: `
    {{ operationStatusLabel() }}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationStatusPillComponent {
  readonly operation = input.required<OperationRow>();
  readonly isMissingProQuote = input<boolean>(false);

  private readonly operationService = inject(OperationService);
  private readonly authService = inject(AuthService);
  private readonly proService = inject(ProService);

  protected readonly badgeColor = computed(() => {
    const operation = this.operation();
    const errorsColors = "text-red-500 bg-red-100";
    if (this.isProAndRejected()) {
      return errorsColors;
    }

    if (this.isMissingProQuote()) {
      return "text-yellow-500 bg-yellow-100";
    }

    switch (operation.status.badge) {
      case "green":
        return "text-green-700 bg-green-300";
      case "yellow":
        return "text-yellow-500 bg-yellow-100";
      case "red":
        return errorsColors;
      default:
        return "text-gray-500 bg-gray-100";
    }
  });

  protected readonly isProAndRejected = computed(() => {
    const currentProUuid = this.authService.isLoggedAsPro()
      ? this.proService.currentProUuid()
      : null;
    return !!(
      currentProUuid &&
      this.operation().proUuid &&
      !this.operation().isRetainedPro(currentProUuid)
    );
  });

  protected readonly operationStatusLabel = computed(() =>
    this.operationService.getOperationStatusLabel({
      operation: this.operation(),
      loggedAsPro: this.authService.isLoggedAsPro(),
      currentProUuid: this.proService.currentProUuid(),
      isMissingProQuote: this.isMissingProQuote(),
    }),
  );
}

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from "@angular/core";
import type { LocationBdnbLegalEntityFilterPro } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import { FilterPermissionsService } from "../../../../../services/filter-permissions.service";
import { UserModalComponent } from "../../user-modal/user-modal.component";

@Component({
  selector: "mkp-filter-row",
  template: `
    @if (filterPermissions.isFilterAccessible(filterKey())) {
      <div class="flex flex-col gap-2">
        <label class="text-granite-500 text-sm font-medium">
          {{ label() }}
        </label>

        <ng-content />
      </div>
    } @else {
      <button
        class="border-granite-300 hover:bg-granite-100 bg-granite-50 flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6"
        type="button"
        (click)="openSubscriptionDialog()"
      >
        <span
          class="bg-primary-500 flex h-5 items-center gap-1 rounded-full px-[6px] py-[6px] text-xs font-medium text-white"
        >
          PRO
        </span>
        <p class="text-granite-500 text-center text-sm">{{ label() }}</p>
      </button>
    }
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterRowComponent {
  readonly label = input.required<string>();
  readonly filterKey = input.required<keyof LocationBdnbLegalEntityFilterPro>();

  protected readonly filterPermissions = inject(FilterPermissionsService);
  private readonly dialogService = inject(DialogService);

  openSubscriptionDialog() {
    this.dialogService.open(UserModalComponent, {
      data: { activeTab: "subscription" },
    });
  }
}

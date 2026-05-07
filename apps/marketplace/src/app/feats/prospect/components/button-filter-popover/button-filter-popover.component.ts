import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  ViewChild,
} from "@angular/core";
import { DialogService } from "@optee/dialog";
import { IconXmarkComponent } from "@optee/icons";
import type { Popover } from "primeng/popover";
import { PopoverModule } from "primeng/popover";
import { UserModalComponent } from "../user-modal/user-modal.component";

@Component({
  selector: "mkp-button-filter-popover",
  host: { class: "cursor-pointer" },
  template: `
    <button
      [class]="buttonClass()"
      (click)="togglePopover($event)"
      [class.bg-granite-100]="hasSelected()"
      [class.bg-primary-50]="hasSelected() && variant() === 'leads'"
      [class.border-primary-200]="hasSelected() && variant() === 'leads'"
      [disabled]="disabled()"
    >
      <ng-content select="[iconSlot]" />
      <span class="whitespace-nowrap">
        {{ label() }}
        @if (showValue() && selectedValue()) {
          <span class="text-granite-600">: {{ selectedValue() }}</span>
        }
      </span>
      @if (hasSelected()) {
        <icon-xmark
          class="size-4"
          slot="icon"
          (click)="clearSelection($event)"
        />
      }
      @if (!isFilterAccessible()) {
        <span
          class="bg-primary-500 flex h-5 items-center gap-1 rounded-full px-[6px] py-[6px] text-xs font-medium text-white"
        >
          PRO
        </span>
      }
    </button>
    @if (isFilterAccessible()) {
      <p-popover
        #popover
        (onHide)="clicked.emit('closed')"
        (onShow)="clicked.emit('opened')"
      >
        <div class="-m-2">
          <ng-content />
        </div>
      </p-popover>
    }
  `,
  imports: [IconXmarkComponent, PopoverModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonFilterPopoverComponent {
  readonly label = input<string>("");
  readonly hasSelected = input<boolean>(false);
  readonly isFilterAccessible = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly selectedValue = input<string>("");
  readonly showValue = input<boolean>(true);
  readonly variant = input<"default" | "leads">("default");

  readonly clear = output<void>();
  readonly clicked = output<"opened" | "closed">();

  private readonly dialogService = inject(DialogService);

  @ViewChild("popover") popover?: Popover;

  protected togglePopover(event: Event) {
    if (!this.isFilterAccessible()) {
      this.openSubscriptionDialog();
    } else {
      this.popover?.toggle(event);
    }
  }

  protected clearSelection(event: Event) {
    event.stopPropagation();
    this.popover?.hide();
    this.clear.emit();
  }

  protected openSubscriptionDialog() {
    this.dialogService.open(UserModalComponent, {
      data: { activeTab: "subscription" },
    });
  }

  protected readonly buttonClass = () =>
    this.variant() === "leads"
      ? "text-granite-900 border-granite-200 hover:border-granite-300 flex h-[30px] items-center justify-center gap-1.5 rounded-full border bg-white px-3 text-[0.85rem] font-semibold transition-all"
      : "text-granite-900 border-granite-100 hover:border-granite-400 flex h-7 items-center justify-center gap-1 rounded-lg border px-2 text-sm font-medium transition-all";
}

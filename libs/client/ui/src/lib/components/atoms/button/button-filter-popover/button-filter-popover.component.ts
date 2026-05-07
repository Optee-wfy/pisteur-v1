import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  ViewChild,
} from "@angular/core";
import { IconXmarkComponent } from "@optee/icons";
import type { Popover } from "primeng/popover";
import { PopoverModule } from "primeng/popover";

@Component({
  selector: "oui-button-filter-popover",
  host: { class: "cursor-pointer" },
  template: `
    <button
      class="text-granite-900 border-granite-100 hover:border-granite-400 flex h-7 items-center justify-center gap-1 rounded-lg border px-2 text-sm font-medium transition-all"
      type="button"
      (click)="togglePopover($event)"
      [class.bg-granite-100]="hasSelected()"
      [disabled]="disabled()"
    >
      <ng-content select="[iconSlot]" />
      <span class="whitespace-nowrap">
        @if (label() !== undefined) {
          {{ label() }}
          @if (showValue() && selectedValue()) {
            <span class="text-granite-600">: {{ selectedValue() }}</span>
          }
        } @else if (showValue() && selectedValue()) {
          <span class="text-granite-600">{{ selectedValue() }}</span>
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
      <p-popover #popover>
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
  readonly label = input<string | undefined>("");
  readonly hasSelected = input<boolean>(false);
  readonly isFilterAccessible = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly selectedValue = input<string>("");
  readonly showValue = input<boolean>(true);

  readonly clear = output<void>();
  readonly clicked = output<"opened" | "closed">();
  readonly openSubscriptionDialog = output<void>();

  @ViewChild("popover") popover?: Popover;

  protected togglePopover(event: Event) {
    if (!this.isFilterAccessible()) {
      this.openSubscriptionDialog.emit();
    } else {
      this.popover?.toggle(event);
      this.clicked.emit(this.popover?.overlayVisible ? "opened" : "closed");
    }
  }

  protected clearSelection(event: Event) {
    event.stopPropagation();
    this.popover?.hide();
    this.clear.emit();
  }
}

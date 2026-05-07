import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  model,
} from "@angular/core";
import { IconChevronRightComponent } from "@optee/icons";

@Component({
  selector: "oui-accordion",
  host: {
    class: "cursor-pointer flex flex-col gap-4 bg-white rounded-lg p-6",
  },
  template: `
    <div
      class="font-display text-primary-900 flex select-none items-center justify-between text-base font-bold leading-normal xl:text-lg"
    >
      <ng-content select="[title]" />

      <icon-chevron-right
        class="text-primary-700 inline-block size-5 origin-center transition-transform duration-200"
        [class.rotate-0]="isOpen()"
        [class.rotate-90]="!isOpen()"
      />
    </div>

    @if (isOpen()) {
      <p>
        <ng-content />
      </p>
    }
  `,
  imports: [IconChevronRightComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent {
  @HostListener("click") toggle = () => this.isOpen.set(!this.isOpen());

  isOpen = model(false);
}

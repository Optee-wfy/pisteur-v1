import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from "@angular/core";
import { IconChevronRightComponent } from "@optee/icons";
import { ButtonIconComponent } from "../../atoms/button/button-icon/button-icon.component";
import { EveComponent } from "../eve/eve.component";

@Component({
  selector: "oui-bob",
  host: { class: "print:break-inside-avoid" },
  template: `
    <oui-eve
      class="flex flex-col gap-4"
      [spaceless]="spaceless()"
      [variant]="colored() ? 'slate' : 'standard'"
    >
      <div
        class="flex flex-wrap items-start justify-start gap-6 lg:flex-nowrap lg:justify-center"
      >
        <ng-content select="[preTitle]" />

        <div class="flex flex-col gap-2">
          @if (heading()) {
            <div class="flex gap-2">
              <h2 class="font-display text-primary-900 text-2xl font-semibold">
                {{ heading() }}
                <ng-content select="[underTitle]" />
              </h2>

              <ng-content select="[postTitle]" />
            </div>
          }
          <ng-content select="[underTitle]" />
        </div>

        <div class="ml-auto print:block">
          <ng-content select="[aside]" />

          @if (dropDown()) {
            <oui-button-icon
              class="print:hidden"
              color="text-primary-700"
              (click)="toggleAccordion()"
              [class.-rotate-90]="this.isOpen()"
              [class.rotate-90]="!this.isOpen()"
            >
              <icon-chevron-right class="size-4" />
            </oui-button-icon>
          }
        </div>
      </div>

      <div [class]="dropDown() && !this.isOpen() ? 'hidden print:block' : ''">
        <ng-content />
      </div>
    </oui-eve>
  `,
  imports: [EveComponent, ButtonIconComponent, IconChevronRightComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BobComponent {
  readonly heading = input<string | undefined>("");
  readonly dropDown = input(false, { transform: booleanAttribute });
  readonly isOpen = model(false);
  readonly spaceless = input(false, { transform: booleanAttribute });
  readonly colored = input(false, { transform: booleanAttribute });

  protected toggleAccordion() {
    if (this.dropDown()) {
      this.isOpen.set(!this.isOpen());
    }
  }
}

import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
} from "@angular/core";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { TagComponent } from "@optee/ui/components/atoms/tag/tag.component";

@Component({
  selector: "swc-feature-section",
  host: {
    class: "flex flex-col gap-6",
    "[class]": "orientation()",
  },
  template: `
    <div class="flex flex-col gap-4">
      <div class="flex">
        <oui-tag size="small" variant="green">
          {{ label() }}
        </oui-tag>
      </div>
      <h2
        class="font-display max-w-prose text-2xl font-bold"
        [class.text-primary-900]="theme() !== 'dark'"
        [class.text-white]="theme() === 'dark'"
        [class.xl:max-w-[440px]]="display() === 'horizontal'"
      >
        {{ title() }}
      </h2>
    </div>
    <div
      class="flex max-w-prose flex-col gap-4"
      [class.md:pt-6]="display() === 'horizontal'"
      [class.text-gray-600]="theme() !== 'dark'"
      [class.text-white]="theme() === 'dark'"
      [class.xl:max-w-lg]="display() === 'horizontal'"
    >
      <div class="max-w-prose">
        <ng-content />
      </div>
    </div>
    @if (showButton()) {
      <oui-button variant="primary">
        {{ buttonLabel() }}
      </oui-button>
    }
  `,
  imports: [TagComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureSectionComponent {
  display = input<"vertical" | "horizontal">("vertical");
  theme = input<"light" | "dark">("light");
  label = input.required<string>();
  title = input.required<string>();
  showButton = input(false, { transform: booleanAttribute });
  buttonLabel = input<string>();

  orientation = computed(() => {
    return this.display() === "vertical"
      ? ""
      : "lg:flex-row flex-wrap  lg:justify-between";
  });
}

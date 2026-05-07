import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CTA } from "@optee/constants";
import { IconSuccessComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";

@Component({
  selector: "oui-option-card",
  host: {
    class: "block cursor-pointer",
  },
  template: `
    <oui-eve
      class="hover:border-primary-400 hover:!shadow-o-highlight flex flex-1 flex-col justify-between border-2 border-transparent text-center transition-all"
    >
      <div class="flex flex-col items-center gap-4 text-sm text-gray-600">
        <ng-content />

        <div class="font-display text-primary-900 text-xl font-semibold">
          {{ heading() }}
        </div>

        <div class="font-medium">
          {{ subtitle() }}
        </div>

        @if (text(); as text) {
          <div>{{ text }}</div>
        }

        <ul class="self-start text-left">
          @for (sellingPoint of sellingPoints(); track sellingPoint) {
            <li class="flex items-center gap-1">
              <icon-success class="size-4" colorMode="colored" />
              {{ sellingPoint }}
            </li>
          }
        </ul>
      </div>

      <oui-button class="mt-6" full [variant]="buttonVariant()">
        {{ buttonText() }}
      </oui-button>
    </oui-eve>
  `,
  imports: [
    ButtonComponent,
    IconSuccessComponent,
    ReactiveFormsModule,
    EveComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionCardComponent {
  heading = input.required<string>();
  subtitle = input.required<string>();
  text = input<string>();
  buttonText = input<string>(CTA.chooseProject);

  sellingPoints = input<string[]>([]);
  highlight = input(false, { transform: booleanAttribute });

  buttonVariant = computed(() => {
    return this.highlight() ? "primary" : "litePrimary";
  });

  CTA = CTA;
}

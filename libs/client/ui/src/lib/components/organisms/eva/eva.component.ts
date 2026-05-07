import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DemoButtonComponent } from "../../atoms/button/demo-button/demo-button.component";
import { OnboardingButtonComponent } from "../../atoms/button/onboarding-button/onboarding-button.component";
import { EveComponent } from "../eve/eve.component";

@Component({
  selector: "oui-eva",
  template: `
    <oui-eve class="relative overflow-hidden">
      <ng-content select="[img]" />

      <div class="relative flex max-w-[500px] flex-col gap-4 md:gap-6 md:py-10">
        <div
          class="font-display font-semibold text-purple-400 empty:hidden md:text-2xl"
        >
          <ng-content select="[pinkTitle]" />
        </div>
        <div
          class="font-display text-primary-700 text-2xl font-bold empty:hidden md:text-4xl"
        >
          <ng-content select="[mainTitle]" />
        </div>
        <div class="font-display text-xs text-gray-600 empty:hidden md:text-sm">
          <ng-content />
        </div>
        @switch (btnVariant()) {
          @case ("demo") {
            <oui-demo-button />
          }
          @default {
            <oui-onboarding-button [label]="ctaLabel()" />
          }
        }
      </div>
    </oui-eve>
  `,
  imports: [EveComponent, OnboardingButtonComponent, DemoButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaComponent {
  ctaLabel = input<string | undefined>();
  btnVariant = input<"onboarding" | "demo">("onboarding");
}

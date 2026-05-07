import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { CTA, SHOWCASE_DEMO_URL } from "@optee/constants";
import type { ButtonVariant } from "@optee/ui/components/atoms/button/button/button.component";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

@Component({
  selector: "oui-demo-button",
  template: `
    <oui-button [href]="demoUrl()" [variant]="variant()">
      {{ label() }}
    </oui-button>
  `,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoButtonComponent {
  readonly label = input<string>(CTA.accessToQualifiedProjects);
  readonly variant = input<ButtonVariant>("accent");
  readonly demoUrl = input(SHOWCASE_DEMO_URL);
}

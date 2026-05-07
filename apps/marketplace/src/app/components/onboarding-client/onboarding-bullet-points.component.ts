import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { IconSuccessComponent } from "@optee/icons";

@Component({
  selector: "mkp-onboarding-bullet-points",
  host: {
    class: "block text-primary-700 font-display sm:pl-4",
  },
  template: `
    <p class="lead my-4 sm:text-lg">
      Optee vous apporte
      <strong>gratuitement :</strong>
    </p>

    @if (sellingPoints(); as sellingPoints) {
      @if (sellingPoints.length > 0) {
        <ul class="my-3 pr-3 text-sm font-medium sm:text-lg">
          @for (li of sellingPoints; track $index) {
            <li>
              <icon-success
                class="mr-2 inline-block size-6 align-sub"
                colorMode="colored"
              />
              <span [innerHTML]="li"></span>
            </li>
          }
        </ul>
      }
    }
  `,
  imports: [IconSuccessComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingBulletPointsComponent {
  sellingPoints = input.required<string[]>();
}

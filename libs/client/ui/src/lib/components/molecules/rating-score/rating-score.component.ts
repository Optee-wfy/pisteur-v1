import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { IconStarComponent } from "@optee/icons";

@Component({
  selector: "oui-rating-score",
  standalone: true,
  imports: [IconStarComponent, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="inline-flex items-center gap-2"
      role="img"
      [attr.aria-label]="ariaLabel()"
    >
      <span class="text-sm font-medium">
        {{ safeRating() | number: "1.1-1" }}
      </span>

      <div class="flex items-center gap-0.5">
        @for (ratio of starRatios(); track $index) {
          <icon-star class="size-5" [filled]="ratio >= 1" />
        }
      </div>

      <span class="text-xs text-gray-600">
        ({{ userRatingCount() | number }} avis)
      </span>
    </div>
  `,
})
export class RatingScoreComponent {
  readonly rating = input<number>(0);
  readonly userRatingCount = input<number>(0);
  readonly max = input<number>(5);

  readonly safeRating = computed(() => {
    const r = Number(this.rating() ?? 0);
    const m = Math.max(1, Number(this.max() ?? 5));
    return Math.min(Math.max(r, 0), m);
  });

  readonly starRatios = computed(() => {
    const m = Math.max(1, Number(this.max() ?? 5));
    const r = this.safeRating();
    return Array.from({ length: m }, (_, i) => {
      const left = r - i;
      return left <= 0 ? 0 : left >= 1 ? 1 : left;
    });
  });

  readonly ariaLabel = computed(
    () =>
      `${this.safeRating().toFixed(1)} sur ${this.max()} basé sur ${this.userRatingCount()} avis`,
  );
}

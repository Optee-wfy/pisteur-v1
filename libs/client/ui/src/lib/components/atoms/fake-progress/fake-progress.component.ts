import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { interval } from "rxjs-zone-less";

@Component({
  selector: "oui-fake-progress",
  host: { class: "font-medium text-sm flex items-center gap-1" },
  template: `
    {{ currentStep() }} / {{ max }}
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FakeProgressComponent {
  readonly max = 10;

  protected readonly currentStep = signal(1);

  private readonly updateProgress = interval(10_000) // every 10 seconds
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.currentStep.update((step) => {
        if (step < this.max) {
          return step + 1;
        }
        this.updateProgress.unsubscribe();
        return step;
      });
    });
}

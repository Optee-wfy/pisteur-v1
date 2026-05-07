import type { OverlayRef } from "@angular/cdk/overlay";
import { setTimeout } from "@rx-angular/cdk/zone-less/browser";
import type { Observable } from "rxjs";
import { Subject } from "rxjs";

export class CDKDialogRef<DialogResult> {
  private readonly afterClosedSubject = new Subject<DialogResult | null>();
  readonly afterClosed$: Observable<DialogResult | null> =
    this.afterClosedSubject.asObservable();

  constructor(private readonly overlayRef: OverlayRef) {}

  close(result: DialogResult | null): void {
    this.afterClosedSubject.next(result);
    this.afterClosedSubject.complete();

    const duration = 300;

    const options: KeyframeAnimationOptions = {
      duration,
      easing: "ease-in-out",
      fill: "forwards",
    };

    if (this.overlayRef.overlayElement) {
      this.overlayRef.overlayElement.animate(
        [
          { transform: "scale(1)", opacity: 1 },
          { transform: "scale(0.8)", opacity: 0 },
        ],
        options,
      );
    }

    if (this.overlayRef.backdropElement) {
      this.overlayRef.backdropElement.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        options,
      );
    }

    setTimeout(() => {
      this.overlayRef.dispose();
    }, duration);
  }

  backdropClick(): Observable<MouseEvent> {
    return this.overlayRef.backdropClick();
  }
}

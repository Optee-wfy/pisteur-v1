import type { AnimationEvent } from "@angular/animations";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import type { AfterViewInit } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from "@angular/core";

@Component({
  selector: "swc-header-popover",
  host: {
    class:
      "m-auto rounded-2xl p-4 max-xl:hidden bg-white shadow-o origin-top-left",
  },
  animations: [
    trigger("animation", [
      state(
        "hidden",
        style({
          opacity: 0,
          transform: "scale(0.8)",
        }),
      ),
      state(
        "visible",
        style({
          opacity: 1,
          transform: "scale(1)",
        }),
      ),
      transition("hidden <=> visible", animate("0.15s ease-in-out")),
    ]),
  ],
  template: `
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderPopoverComponent implements AfterViewInit {
  @Output() closed = new EventEmitter<void>();

  @HostBinding("@animation") animationState = "hidden";

  @HostListener("@animation.done", ["$event"]) done(event: AnimationEvent) {
    if (event.toState === "hidden") {
      this.closed.emit();
    }
  }

  // Source: https://briantree.se/angular-cdk-overlay-tutorial-adding-animations
  ngAfterViewInit() {
    this.animationState = "visible";
  }

  close() {
    this.animationState = "hidden";
  }
}

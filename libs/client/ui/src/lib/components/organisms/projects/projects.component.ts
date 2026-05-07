/* eslint-disable @rx-angular/prefer-no-layout-sensitive-apis */
import type { ElementRef } from "@angular/core";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import {
  IconPartnerCbreComponent,
  IconPartnerFonciaComponent,
  IconPartnerGTFComponent,
  IconPartnerMercureComponent,
  IconPartnerOrpeaComponent,
} from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

import { isNotNullish } from "@optee/utils";
import {
  combineLatest,
  filter,
  map,
  merge,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from "rxjs";
import { fromEvent, interval } from "rxjs-zone-less";

@Component({
  selector: "oui-projects",
  host: {
    class: "flex flex-col items-center gap-8 relative",
  },
  template: `
    <h2
      class="mx-4 text-center text-4xl font-semibold"
      [class.text-white]="theme() === 'dark'"
    >
      {{ sectionTitle() }}
    </h2>
    <div class="mx-auto w-11/12 max-w-screen-xl overflow-hidden">
      <div
        class="no-scrollbar flex flex-wrap items-center justify-center gap-x-10 overflow-y-auto sm:justify-center sm:px-0 xl:gap-x-20"
        #scrollContainer
        [class.text-primary-700]="theme() === 'light'"
        [class.text-white]="theme() === 'dark'"
      >
        <icon-partner-cbre class="w-16 md:w-28" />
        <icon-partner-foncia class="w-16 md:w-28" />
        <icon-partner-gtf class="w-16 md:w-28" />
        <icon-partner-mercure class="w-16 md:w-28" />
        <icon-partner-orpea class="w-16 md:w-28" />
      </div>
    </div>

    @if (showButton()) {
      <oui-button
        variant="primary"
        (click)="scrollToSection('operationsSection')"
      >
        Découvrir nos opérations
      </oui-button>
    }
  `,
  imports: [
    ButtonComponent,
    IconPartnerMercureComponent,
    IconPartnerCbreComponent,
    IconPartnerFonciaComponent,
    IconPartnerGTFComponent,
    IconPartnerOrpeaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  readonly theme = input<"light" | "dark">("light");
  readonly showButton = input(false, { transform: booleanAttribute });
  readonly sectionTitle = input("+ 1250 projets mis en place avec Optee");

  protected readonly scrollContainer =
    viewChild<ElementRef<HTMLDivElement>>("scrollContainer");

  protected readonly container$ = toObservable(this.scrollContainer).pipe(
    filter(isNotNullish),
    map((el) => el.nativeElement),
    tap((scrollElement) => {
      const contentWidth = scrollElement.scrollWidth;
      const containerWidth = scrollElement.offsetWidth;

      const threshold = 150; // Seuil pour déterminer si l'animation est nécessaire
      this.enableAnimation.set(contentWidth > containerWidth + threshold);
    }),
    shareReplay(1),
  );

  private readonly scrollDirection = signal<"right" | "left">("right");
  protected readonly enableAnimation = signal(false);

  protected readonly refreshFrequencyInMs = interval(24);

  protected readonly autoScroll$ = combineLatest([
    this.container$,
    this.refreshFrequencyInMs,
  ]).pipe(
    tap(([scrollElement]) => {
      const maxScroll = scrollElement.scrollWidth - scrollElement.offsetWidth;

      if (scrollElement.scrollLeft >= maxScroll) {
        this.scrollDirection.set("left");
      } else if (scrollElement.scrollLeft <= 0) {
        this.scrollDirection.set("right");
      }

      scrollElement.scrollLeft += this.scrollDirection() === "right" ? 1 : -1;
    }),
  );

  private readonly mouseEnter$ = this.container$.pipe(
    switchMap((el) => fromEvent(el, "mouseenter")),
    map(() => "pause"),
  );

  private readonly mouseLeave$ = this.container$.pipe(
    switchMap((el) => fromEvent(el, "mouseleave")),
    map(() => "resume"),
  );

  private readonly handleScrollSubscription = merge(
    this.mouseLeave$,
    this.mouseEnter$,
  )
    .pipe(
      startWith("resume"), // Par défaut, démarrer le défilement
      switchMap((state) => (state === "resume" ? this.autoScroll$ : [])), // Stopper ou reprendre
      takeUntilDestroyed(),
    )
    .subscribe();

  protected scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

import { AsyncPipe } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import type { Observable } from "rxjs";
import { filter, map, shareReplay, startWith } from "rxjs";
import { NAV_ITEMS, NavPage } from "../navigation-items";
import { HeaderDesktopComponent } from "./header-desktop.component";
import { HeaderMobileComponent } from "./header-mobile.component";

@Component({
  selector: "swc-header",
  template: `
    @if (currentPage$ | async; as currentPage) {
      <swc-header-desktop
        class="hidden lg:block"
        [currentPage]="currentPage"
        [skipNav]="skipNav()"
        [theme]="theme()"
      />
      <swc-header-mobile
        class="lg:hidden"
        [currentPage]="currentPage"
        [skipNav]="skipNav()"
      />
    }
  `,
  imports: [AsyncPipe, HeaderMobileComponent, HeaderDesktopComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  theme = input<"light" | "dark">("dark");
  skipNav = input(false, { transform: booleanAttribute });

  protected readonly router = inject(Router);

  currentUri$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map((e) => e.url),
    startWith(this.router.url),
  );

  currentPage$: Observable<NavPage> = this.currentUri$.pipe(
    map((uri) => {
      const item = NAV_ITEMS.filter((i) => i.type === "page").find(
        (item) => item.url && uri.startsWith(item.url),
      );

      if (!item) {
        return NavPage.HOME;
      }
      return item.slug as NavPage;
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
}

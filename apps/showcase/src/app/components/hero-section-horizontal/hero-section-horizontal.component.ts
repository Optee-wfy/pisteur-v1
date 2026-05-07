import { AsyncPipe } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { buildAssetUrl, type PublicAssetPath } from "@optee/constants";
import { IconChevronRightComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { filter, map, startWith } from "rxjs";
import { HeaderComponent } from "../layout/navigation/header/header.component";

interface Image {
  class: string;
  alt: string;
  publicAssetPath: PublicAssetPath;
}

@Component({
  selector: "swc-hero-section-horizontal",
  template: `
    <div
      class="relative flex flex-col gap-10 overflow-hidden pb-8 lg:pb-16"
      [class.bg-primary-900]="theme() === 'dark'"
      [class.lg:items-center]="!twoImg() && !multipleImg()"
      [class.lg:items-start]="twoImg() || multipleImg()"
      [class.text-white]="theme() === 'dark'"
    >
      <oui-circle
        class="-left-[519px] -top-[64px] w-[1071px]"
        [theme]="theme()"
      />

      <swc-header class="z-[100]" [theme]="theme()" />

      <div
        class="z-10 flex flex-col items-center gap-12 px-8 text-center lg:flex-row lg:items-start lg:px-12 lg:text-start"
        [class]="wrapperClass()"
      >
        <div
          class="flex flex-col items-center justify-center gap-6 lg:items-start"
          [class]="containerClass()"
        >
          @if (currentUri$ | async; as currentUri) {
            @if (breadcrumbParent(); as breadcrumbParent) {
              <nav class="flex" aria-label="Breadcrumb">
                <ul
                  class="ml-0 flex list-none items-center space-x-2"
                  role="list"
                >
                  <li>
                    <div>
                      <a
                        class="hover:text-primary-400 ml-4 text-sm font-medium text-gray-300 underline underline-offset-2"
                        routerLink="/"
                      >
                        Optee
                      </a>
                    </div>
                  </li>
                  <li>
                    <div class="flex items-center">
                      <icon-chevron-right class="size-3" aria-hidden="true" />
                      <a
                        class="hover:text-primary-400 ml-4 text-sm font-medium text-gray-300 underline underline-offset-2"
                        [routerLink]="'/' + breadcrumbParent.uri"
                      >
                        {{ breadcrumbParent.label }}
                      </a>
                    </div>
                  </li>
                  @if (breadcrumbCurrent(); as breadcrumbCurrent) {
                    <li>
                      <div class="flex items-center">
                        <icon-chevron-right class="size-3" aria-hidden="true" />
                        <div
                          class="ml-4 text-sm font-medium text-gray-300"
                          aria-current="page"
                        >
                          {{ breadcrumbCurrent }}
                        </div>
                      </div>
                    </li>
                  }
                </ul>
              </nav>
            }
            @if (showCurrentPage()) {
              <div class="flex items-center gap-3">
                <ng-content select="[icon]" />
                <div
                  class="font-medium text-gray-300"
                  aria-current="page"
                  [class]="
                    currentUri === 'gtb' || currentUri === 'cvc'
                      ? 'uppercase'
                      : 'capitalize'
                  "
                >
                  @if (currentUri !== "audit") {
                    {{ currentUri }}
                  } @else {
                    Audit énergétique
                  }
                </div>
              </div>
            }
          }

          <h2
            class="font-display  {{
              theme() === 'dark' ? 'text-white' : 'text-primary-900'
            }} max-w-[648px] text-[40px] font-semibold leading-tight lg:text-[50px]"
          >
            <ng-content select="[title]" />
          </h2>

          <div
            class="w-full max-w-[480px] font-medium {{
              theme() === 'dark' ? 'text-white' : 'text-gray-600'
            }}"
          >
            <ng-content select="[text]" />
          </div>

          @if (cta()) {
            <oui-button
              href="/demo"
              [variant]="theme() === 'dark' ? 'standard' : 'primary'"
            >
              {{ cta() }}
            </oui-button>
          }
        </div>

        @if (multipleImg().length > 0) {
          @for (image of multipleImg(); track image.publicAssetPath) {
            <img
              class="absolute hidden lg:flex"
              [alt]="image.alt"
              [class]="image.class"
              [src]="buildAssetUrl(image.publicAssetPath)"
            />
          }
        } @else if (twoImg()) {
          <img
            class="pointer-events-none absolute bottom-4 left-4 z-0 hidden w-3/12 sm:flex lg:bottom-10 lg:left-auto lg:right-[400px] lg:w-[275px]"
            alt="illustration devis envoyé"
            [src]="buildAssetUrl(littleImgPath())"
          />

          <img
            class="pointer-events-none absolute bottom-0 right-0 -z-10 hidden w-3/12 sm:flex lg:w-[484px]"
            alt="illustration dashboard"
            fetchpriority="high"
            [src]="buildAssetUrl(bigImgPath())"
          />
        } @else {
          <img
            class="w-[400px] self-center rounded-3xl"
            alt="Photo d'illustration"
            [src]="singleImgUrl() ?? buildAssetUrl(singleImgPath())"
          />
        }
      </div>
    </div>
  `,
  imports: [
    AsyncPipe,
    RouterModule,
    IconChevronRightComponent,
    HeaderComponent,
    ButtonComponent,
    CircleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionHorizontalComponent {
  protected readonly router = inject(Router);

  breadcrumbParent = input<{ label: string; uri: string }>();
  breadcrumbCurrent = input<string>();
  showCurrentPage = input(false, { transform: booleanAttribute });
  twoImg = input(false, { transform: booleanAttribute });
  theme = input<"light" | "dark">("dark");
  cta = input("");
  singleImgPath = input<PublicAssetPath>("cloudless-blue-sky-city.png");
  singleImgUrl = input<string>();
  littleImgPath = input<PublicAssetPath>("hero-section/quote_sent.png");
  bigImgPath = input<PublicAssetPath>("hero-section/dashboard_2.png");
  multipleImg = input<Image[]>([]);

  buildAssetUrl = buildAssetUrl;

  wrapperClass = computed(() => {
    return !this.twoImg() && !this.multipleImg()
      ? "mx-auto w-11/12 justify-center"
      : "";
  });

  containerClass = computed(() => {
    return this.twoImg() || this.multipleImg()
      ? "max-w-[820px] lg:py-8 lg:pl-[min(120px,5vw)] lg:pr-0"
      : "";
  });

  currentUri$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map((event: NavigationEnd) => {
      const segments = event.urlAfterRedirects.split("/");
      return segments.pop() || "";
    }),
    startWith(this.router.url.split("/").pop() || ""),
  );
}

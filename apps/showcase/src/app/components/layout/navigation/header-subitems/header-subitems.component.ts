import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  IconBicolorAuditComponent,
  IconBicolorCvcComponent,
  IconBicolorExpertiseComponent,
  IconBicolorGtbComponent,
  IconBicolorHouseComponent,
  IconBicolorIsolationComponent,
} from "@optee/icons";
import type { NavItem } from "../navigation-items";

@Component({
  selector: "swc-header-subitems",
  host: {
    class: "flex flex-col gap-2",
  },
  template: `
    @for (item of routes(); track item.label) {
      <a
        class="group flex items-center gap-4 text-sm font-semibold"
        [routerLink]="item.url"
      >
        <div
          class="text-primary-700 bg-primary-100 group-hover:bg-primary-200 size-10 rounded-md border-0 p-2"
        >
          @switch (item.icon) {
            @case ("gestionnaire") {
              <icon-bicolor-house [colorMode]="colorMode()" />
            }
            @case ("expertise") {
              <icon-bicolor-expertise [colorMode]="colorMode()" />
            }
            @case ("isolation") {
              <icon-bicolor-isolation [colorMode]="colorMode()" />
            }
            @case ("gtb") {
              <icon-bicolor-gtb [colorMode]="colorMode()" />
            }
            @case ("cvc") {
              <icon-bicolor-cvc [colorMode]="colorMode()" />
            }
            @case ("audit") {
              <icon-bicolor-audit [colorMode]="colorMode()" />
            }
          }
        </div>

        <div class="text-primary-900 text-sm font-semibold">
          {{ item.label }}
        </div>
      </a>
    }
  `,
  imports: [
    RouterModule,
    IconBicolorHouseComponent,
    IconBicolorExpertiseComponent,
    IconBicolorIsolationComponent,
    IconBicolorGtbComponent,
    IconBicolorCvcComponent,
    IconBicolorAuditComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderSubitemsComponent {
  routes = input.required<NavItem[]>();
  colorMode = input<"current" | "semi" | "colored">("current");
}

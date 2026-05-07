import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { Router } from "@angular/router";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { RedirectCardComponent } from "../cards/redirect-card/redirect-card.component";

@Component({
  selector: "swc-other-operations",
  host: {
    id: "operationsSection",
    class: "relative block overflow-hidden",
  },
  template: `
    <oui-circle class="-left-[147px] top-[130px] w-[349px]" theme="light" />

    <oui-circle
      class="-bottom-[288px] -right-[211px] w-[669px]"
      theme="light"
    />

    <div
      class="relative flex flex-col items-center justify-center gap-10 px-6 py-8 xl:flex-row xl:gap-20 xl:px-40 xl:py-20"
    >
      <div
        class="flex flex-col items-center gap-3 text-center xl:gap-6 xl:text-start"
      >
        <h2
          class="font-display text-primary-900 text-2xl font-semibold leading-10 xl:text-4xl"
        >
          Découvrir d’autres opérations
        </h2>

        <p class="p-soft max-w-[546px]">
          Optee est une solution globale permettant de piloter et d’agir sur un
          ensemble d’opérations de rénovations énergétique.
        </p>
      </div>

      <div
        class="flex items-center gap-6 self-stretch overflow-y-auto py-4 md:justify-center lg:overflow-visible xl:flex-nowrap xl:gap-12"
      >
        @for (operation of filteredOperations(); track operation.name) {
          <swc-redirect-card
            (navigate)="navigateToOperation($event)"
            [icon]="operation.icon"
            [link]="operation.link"
            [name]="operation.name"
          />
        }
      </div>
    </div>
  `,
  imports: [CircleComponent, RedirectCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtherOperationsComponent {
  protected readonly router = inject(Router);

  imgPath = input<string>("cloudless-blue-sky-city.png");
  currentOperation = input<"isolation" | "cvc" | "audit" | "gtb" | "none">(
    "none",
  );

  operations = [
    { name: "Isolation", icon: "isolation", link: "isolation" },
    { name: "GTB", icon: "gtb", link: "gtb" },
    // { name: "Éclairage", icon: "eclairage", link: "eclairage" },
    { name: "CVC", icon: "cvc", link: "cvc" },
    { name: "Audit", icon: "audit", link: "audit" },
  ] as const;

  filteredOperations = computed(() =>
    this.operations.filter(
      (operation) => operation.link !== this.currentOperation(),
    ),
  );

  navigateToOperation(link: string) {
    this.router.navigate([`/${link}`]).then(() => {
      // eslint-disable-next-line @rx-angular/prefer-no-layout-sensitive-apis
      window.scrollTo(0, 0); // Scroll to top
    });
  }
}

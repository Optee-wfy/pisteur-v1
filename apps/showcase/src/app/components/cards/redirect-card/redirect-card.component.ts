import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import {
  IconBicolorAuditComponent,
  IconBicolorCvcComponent,
  IconBicolorGtbComponent,
  IconBicolorIsolationComponent,
  IconChevronRightComponent,
} from "@optee/icons";

@Component({
  selector: "swc-redirect-card",
  template: `
    <div
      class="shadow-o text-primary-900 flex h-72 w-60 cursor-pointer flex-col items-center justify-center gap-12 rounded-2xl bg-white py-11 transition-transform hover:-translate-y-2"
      (click)="onCardClick()"
    >
      <div
        class="text-primary-700 flex flex-col items-center justify-center gap-4"
      >
        @switch (icon()) {
          @case ("isolation") {
            <icon-bicolor-isolation
              class="size-8 xl:size-12"
              colorMode="semi"
            />
          }
          @case ("gtb") {
            <icon-bicolor-gtb class="size-8 xl:size-12" colorMode="semi" />
          }
          @case ("cvc") {
            <icon-bicolor-cvc class="size-8 xl:size-12" colorMode="semi" />
          }
          @case ("audit") {
            <icon-bicolor-audit class="size-8 xl:size-12" colorMode="semi" />
          }
        }

        <div
          class="text-center text-lg font-semibold leading-relaxed xl:text-2xl"
        >
          {{ name() }}
        </div>
      </div>

      <div class="text-primary-700 flex items-center gap-1">
        <span class="text-sm underline">En savoir plus</span>
        <icon-chevron-right class="size-4" />
      </div>
    </div>
  `,
  imports: [
    IconChevronRightComponent,
    IconBicolorIsolationComponent,
    IconBicolorGtbComponent,
    IconBicolorCvcComponent,
    IconBicolorAuditComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedirectCardComponent {
  icon = input.required<"isolation" | "gtb" | "cvc" | "audit">();
  link = input.required<string>();
  name = input.required<string>();
  navigate = output<string>();

  onCardClick() {
    this.navigate.emit(this.link());
  }
}

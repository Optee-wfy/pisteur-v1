import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { ARCADES } from "@optee/constants";
import { IconChevronRightComponent } from "@optee/icons";
import { ArcadeComponent } from "@optee/ui/components/molecules/arcade/arcade/arcade.component";

@Component({
  selector: "oui-arcades-tutorial",
  host: {
    class:
      "border-1 flex flex-col lg:flex-row gap-4 rounded-2xl border-purple-200 bg-purple-100 p-4 lg:gap-8 lg:p-6",
  },
  template: `
    <div class="flex flex-1 flex-col gap-4 lg:w-80 lg:gap-8">
      <div class="font-display text-4xl font-semibold text-purple-700">
        8 min pour tout
        <br />
        comprendre
      </div>

      <div
        class="flex flex-auto shrink-0 flex-col overflow-auto rounded-2xl bg-white p-1"
        [style.scrollbar-color]="'#F6E5FF transparent'"
      >
        @for (arcade of ARCADES; track arcade.id; let i = $index) {
          <div
            class="cursor-pointer flex items-center gap-2 p-2 transition-all text-sm rounded-2xl {{
              activeArcadeId() === arcade.id
                ? 'bg-purple-100 text-purple-700'
                : 'text-granite-400 hover:bg-granite-50 hover:text-granite-500'
            }}"
            (click)="activeArcadeId.set(arcade.id)"
          >
            <div
              class="size-5 flex items-center transition-all justify-center rounded-full text-xs {{
                activeArcadeId() === arcade.id
                  ? 'bg-purple-700 text-white'
                  : 'bg-granite-100 text-granite-400'
              }}"
            >
              {{ i + 1 }}
            </div>

            {{ arcade.label }}

            <icon-chevron-right
              class="ml-auto size-3 transition-all {{
                activeArcadeId() === arcade.id
                  ? ' text-purple-700'
                  : ' text-granite-300'
              }}"
            />
          </div>
        }
      </div>
    </div>

    <oui-arcade
      class="min-h-[50vw] flex-[2] lg:min-h-fit"
      [flowId]="activeArcadeId()"
    />
  `,
  imports: [ArcadeComponent, IconChevronRightComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArcadesTutorialComponent {
  ARCADES = ARCADES;
  activeArcadeId = signal(ARCADES[0].id);
}

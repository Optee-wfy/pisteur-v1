import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { IconLockComponent } from "@optee/icons";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";

@Component({
  selector: "mkp-auth-page",
  template: `
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <oui-circle class="-left-[629px] -top-[328px] w-[945px]" theme="light" />

      <oui-circle
        class="-bottom-[258px] -right-[248px] w-[580px]"
        theme="light"
      />
    </div>

    <div
      class="absolute inset-0 flex items-center justify-center overflow-auto p-6"
      [style.scrollbar-color]="'#A3C0FF transparent'"
    >
      <div
        class="shadow-o isolate w-full max-w-lg rounded-3xl bg-white p-6 lg:p-10 xl:w-[536px]"
      >
        <div class="flex max-w-lg flex-col items-center gap-2">
          <icon-lock class="size-10" colorMode="colored" />
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  imports: [RouterOutlet, RouterModule, CircleComponent, IconLockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AuthComponent {}

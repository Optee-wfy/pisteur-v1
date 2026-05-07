import { animate, style, transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { IconSpinnerComponent } from "@optee/icons";
import { ToastModule } from "primeng/toast";
import { AppService } from "./services/app.service";

@Component({
  selector: "mkp-root",
  template: `
    <router-outlet />
    <p-toast [life]="5000" />

    @if (appService.isLoading()) {
      <div
        class="fixed inset-0 z-[1001] flex flex-col items-center justify-center gap-8 bg-white/90 text-center"
      >
        <icon-spinner
          class="size-20 animate-spin text-transparent"
          colorMode="colored"
        />

        @if (appService.loadingMessage(); as loadingMessage) {
          <div class="font-display" [@fadeInOut]>
            <div class="text-xl font-semibold">
              {{ loadingMessage.title }}
            </div>
            @if (loadingMessage.text) {
              {{ loadingMessage.text }}
            }
          </div>
        }
      </div>
    }
  `,
  imports: [RouterOutlet, ToastModule, IconSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("fadeInOut", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("150ms", style({ opacity: 1 })),
      ]),
      transition(":leave", [animate("150ms", style({ opacity: 0 }))]),
    ]),
  ],
})
export class AppComponent {
  protected readonly appService = inject(AppService);
}

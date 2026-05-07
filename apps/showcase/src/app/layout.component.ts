import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./components/layout/footer/footer.component";

@Component({
  selector: "swc-layout",
  host: { class: "block" },
  template: `
    <main
      class="relative isolate h-full min-h-screen overflow-auto overflow-x-hidden"
    >
      <router-outlet />
    </main>
    <swc-footer />
  `,
  imports: [RouterOutlet, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {}

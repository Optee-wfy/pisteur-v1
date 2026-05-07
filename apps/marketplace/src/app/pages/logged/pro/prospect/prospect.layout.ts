import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { EnrichmentToastComponent } from "../../../../feats/prospect/components/enrichment/enrichment-toast/enrichment-toast.component";
import { SidebarComponent } from "../../../../feats/prospect/components/sidebar/sidebar.component";

@Component({
  selector: "mkp-prospect-layout",
  host: {
    class: "w-full h-full min-w-0 grid relative",
    style: "grid-template-columns: var(--prospect-sidebar-width) minmax(0, 1fr);",
  },
  template: `
    <mkp-sidebar />
    <router-outlet class="hidden" />
    <mkp-enrichment-toast />
  `,
  imports: [RouterOutlet, SidebarComponent, EnrichmentToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProspectLayoutComponent {}

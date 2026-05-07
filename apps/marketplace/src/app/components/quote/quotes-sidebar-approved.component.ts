import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "mkp-quote-sidebar-approved",
  host: {
    class: "flex flex-col gap-6",
  },
  template: `
    <div class="flex flex-col gap-2">
      <p
        class="w-full text-base font-semibold leading-normal tracking-tight text-white"
      >
        Votre devis est signé.
      </p>
      <p class="w-full text-sm font-normal tracking-tight text-white">
        Vous pouvez désormais échanger avec notre partenaire pour la suite des
        opérations.
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteSidebarApprovedComponent {}

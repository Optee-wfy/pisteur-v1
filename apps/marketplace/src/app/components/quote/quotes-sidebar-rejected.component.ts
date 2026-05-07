import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "mkp-quote-sidebar-rejected",
  host: {
    class: "flex flex-col gap-6",
  },
  template: `
    <div class="flex flex-col gap-2">
      <p
        class="w-full text-base font-semibold leading-normal tracking-tight text-white"
      >
        Votre devis a été refusé.
      </p>
      <p
        class="w-full text-sm font-normal leading-[21px] tracking-tight text-white"
      >
        Vous pouvez contacter notre partenaire pour discuter des conditions si
        vous souhaitez recevoir une nouvelle proposition commerciale de sa part.
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteSidebarRejectedComponent {}

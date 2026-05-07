import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-bicolor-plan-action",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 41 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clip-rule="evenodd"
        d="M0.5 2.84216C0.5 1.27248 1.77248 0 3.34215 0H15.4213C16.991 0 18.2635 1.27248 18.2635 2.84216V14.9213C18.2635 16.491 16.991 17.7635 15.4213 17.7635H3.34215C1.77248 17.7635 0.5 16.491 0.5 14.9213V2.84216ZM3.34218 22.0878C1.77248 22.0878 0.5 23.3603 0.5 24.93V37.0092C0.5 38.5788 1.77248 39.8514 3.34218 39.8514H15.4213C16.991 39.8514 18.2635 38.5788 18.2635 37.0092V24.93C18.2635 23.3603 16.991 22.0878 15.4213 22.0878H3.34218ZM25.43 22.0878C23.8603 22.0878 22.5878 23.3603 22.5878 24.93V37.0092C22.5878 38.5788 23.8603 39.8514 25.43 39.8514H37.5091C39.0789 39.8514 40.3513 38.5788 40.3513 37.0092V24.93C40.3513 23.3603 39.0789 22.0878 37.5091 22.0878H25.43Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        clip-rule="evenodd"
        d="M33.4086 1.7995C32.8704 -0.560907 29.5027 -0.546187 28.9851 1.81884L28.9654 1.90907L28.927 2.08411C28.3625 4.61197 26.3296 6.55177 23.776 6.99604C21.3123 7.42467 21.3123 10.9614 23.776 11.39C26.3385 11.8358 28.3766 13.7876 28.9329 16.3285L28.9851 16.5672C29.5027 18.9322 32.8704 18.947 33.4086 16.5866L33.4722 16.3083C34.0495 13.7766 36.0907 11.839 38.6491 11.394C41.117 10.9646 41.117 7.42149 38.6491 6.99211C36.1043 6.54937 34.0711 4.62995 33.4815 2.11799C33.465 2.04778 33.4497 1.98066 33.4332 1.90758L33.4086 1.7995Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-300'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconBicolorPlanActionComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}

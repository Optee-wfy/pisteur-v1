import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { fullEnrichFeatureEnabled } from "@optee/constants";
import {
  IconMailComponent,
  IconPhoneComponent,
  IconRefreshComponent,
} from "@optee/icons";
import { Tooltip } from "primeng/tooltip";
import { PillCreditsComponent } from "../../pill-credits/pill-credits.component";

type EnrichButtonType = "mail" | "phone";

@Component({
  selector: "mkp-enrich-button",
  template: `
    @if (isFullEnrichFeatureEnabled) {
      <button
        type="button"
        (click)="clicked.emit()"
        [class.text-sm]="colored() && compact()"
        [class]="
          colored()
            ? 'enrich-button'
            : 'inline-flex min-h-9 w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[0.95rem] font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
        "
        [disabled]="disabled() || inProgress()"
      >
        @if (inProgress()) {
          <icon-refresh
            class="animate-spin"
            [class.size-3]="colored()"
            [class.size-4]="!colored()"
          />
          <span [class.text-sm]="!colored()" [class.text-xs]="colored()">
            Chargement...
          </span>
        } @else {
          @switch (type()) {
            @case ("mail") {
              <icon-mail
                class="shrink-0"
                [class.size-2]="colored() && compact()"
                [class.size-3]="colored() && !compact()"
                [class.size-5]="!colored()"
                [style.height.rem]="colored() && compact() ? 0.5 : 0.9"
                [style.width.rem]="colored() && compact() ? 0.5 : 0.9"
              />
            }
            @case ("phone") {
              <icon-phone
                class="shrink-0"
                [class.size-2]="colored() && compact()"
                [class.size-3]="colored() && !compact()"
                [class.size-5]="!colored()"
                [style.height.rem]="colored() && compact() ? 0.5 : 0.9"
                [style.width.rem]="colored() && compact() ? 0.5 : 0.9"
              />
            }
          }

          {{ label() }}

          @if (colored() || !compact()) {
            <mkp-pill-credits
              colorVariant="primary"
              [credits]="credits()"
              [iconSize]="colored() ? (compact() ? 2 : 3) : 2"
            />
          }
        }
      </button>
    } @else {
      <span
        class="bg-granite-100 text-granite-500 border-granite-300 whitespace-nowrap rounded-xl border px-2 py-1 text-xs italic"
        pTooltip="La fonctionnalité d'enrichissement de contacts est désactivée pour
              cet environnement."
      >
        Enrichissement désactivé
      </span>
    }
  `,
  imports: [
    IconMailComponent,
    IconPhoneComponent,
    IconRefreshComponent,
    PillCreditsComponent,
    Tooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnrichButtonComponent {
  readonly type = input.required<EnrichButtonType>();
  readonly credits = input.required<number>();
  readonly label = input("Enrichir");
  readonly inProgress = input(false);
  readonly disabled = input(false);
  readonly colored = input(true, { transform: booleanAttribute });
  readonly clicked = output<void>();
  readonly compact = input(false, { transform: booleanAttribute });
  protected readonly isFullEnrichFeatureEnabled =
    fullEnrichFeatureEnabled.isEnabled;
}

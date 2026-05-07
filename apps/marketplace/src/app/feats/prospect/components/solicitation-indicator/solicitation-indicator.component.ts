import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  getSolicitationLevel,
  SOLICITATION_LEVEL_LABELS,
} from "@optee/constants";
import {
  MessageComponent,
  type NotificationSeverity,
} from "@optee/ui/components/molecules/message/message.component";
import { Tooltip } from "primeng/tooltip";

type LevelStyle = {
  className: string;
  severity: NotificationSeverity;
};

@Component({
  selector: "mkp-solicitation-indicator",
  template: `
    @if (displayMode() === "message") {
      <oui-message [severity]="severity()" [summary]="summary()">
        {{ solicitationMessage() }}
      </oui-message>
    } @else if (level()) {
      <div
        class="flex min-w-fit items-center gap-2 whitespace-nowrap rounded-xl px-2.5 py-1 text-xs"
        [class]="levelClass()"
        [pTooltip]="tooltip()"
      >
        <div class="size-2 shrink-0 rounded-full bg-current"></div>
        <span>{{ levelLabel() }} {{ suffix() }}</span>
      </div>
    } @else {
      <div
        class="bg-granite-200 text-granite-700 flex min-w-fit items-center gap-2 whitespace-nowrap rounded-xl px-2.5 py-1 text-xs"
        tooltipPosition="top"
        [pTooltip]="tooltip()"
      >
        <div class="size-2 shrink-0 rounded-full bg-current"></div>
        <span class="text-granite-700 text-xs italic">Non connue</span>
      </div>
    }
  `,
  imports: [MessageComponent, Tooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitationIndicatorComponent {
  readonly count = input<number | null>(null);
  readonly displayMode = input<"chip" | "message">("chip");
  readonly entityType = input<"building" | "company">("company");
  readonly suffix = input<string>("");

  protected readonly level = computed(() => getSolicitationLevel(this.count()));
  protected readonly levelLabel = computed(() => {
    const level = this.level();
    return level ? SOLICITATION_LEVEL_LABELS[level] : "Non connue";
  });

  protected readonly entityLabel = computed(() => {
    return this.entityType() === "building" ? "bâtiment" : "entreprise";
  });

  protected readonly entityDeterminer = computed(() => {
    return this.entityType() === "building" ? "Ce" : "Cette";
  });

  protected readonly levelStyle = computed<LevelStyle>(() => {
    switch (this.level()) {
      case "low":
        return {
          className: "bg-green-100 text-green-800",
          severity: "success",
        };
      case "medium":
        return { className: "bg-yellow-100 text-yellow-800", severity: "warn" };
      case "high":
        return { className: "bg-orange-100 text-orange-800", severity: "warn" };
      case "veryHigh":
        return { className: "bg-red-100 text-red-800", severity: "error" };
      default:
        return {
          className: "bg-granite-200 text-granite-700",
          severity: "info",
        };
    }
  });

  protected readonly levelClass = computed(() => this.levelStyle().className);
  protected readonly severity = computed(() => this.levelStyle().severity);

  protected readonly solicitationMessage = computed(() => {
    const count = this.count();
    if (count === null) {
      return "Concurrence non connue";
    }

    const entity = this.entityLabel();
    const determiner = this.entityDeterminer();
    if (count === 0) {
      return `Aucun utilisateur n'a encore débloqué ${determiner.toLowerCase()} ${entity}.`;
    }

    const userLabel = count === 1 ? "utilisateur" : "utilisateurs";
    const participle =
      this.entityType() === "building" ? "débloqué" : "débloquée";
    return `${determiner} ${entity} a été ${participle} par ${count} ${userLabel}.`;
  });

  protected readonly tooltip = computed(() => {
    if (this.count() === null || this.count() === undefined) {
      return "Non connue";
    }
    return this.solicitationMessage();
  });

  protected readonly summary = computed(() => {
    return `Concurrence : ${this.levelLabel()}.`;
  });
}

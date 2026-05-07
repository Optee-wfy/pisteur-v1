import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  CONFIDENCE_SCORE_GROUP_ENTITY,
  CONFIDENCE_SCORE_MULTI_ENTITY_PENALTY,
  CONFIDENCE_SCORE_PAPPERS,
  ExternalContactSource,
} from "@optee/constants";
import { IconWarningComponent } from "@optee/icons";
import type { ExternalContact } from "@optee/models";
import { CirclePercentComponent } from "@optee/ui/components/atoms/circle-percent/circle-percent/circle-percent.component";
import { Tooltip } from "primeng/tooltip";

@Component({
  selector: "mkp-external-contact-confidence-score",

  template: `
    <div class="relative z-10 inline-block align-middle">
      <oui-circle-percent
        class="size-8"
        pTooltipClass="text-sm w-80"
        [pTooltip]="displayedToolTip()"
        [value]="confidenceScore()"
      />
      @if (externalContactIsFromGroup()) {
        <icon-warning
          class="absolute -right-1 top-2 size-4 text-orange-400"
          tooltipPosition="right"
          [pTooltip]="warningTooltip()"
        />
      }
    </div>
  `,
  imports: [CirclePercentComponent, Tooltip, IconWarningComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalContactConfidenceScoreComponent {
  readonly contact =
    input.required<Pick<ExternalContact, "origin" | "confidenceScore">>();

  readonly linkedLegalEntitiesCount = input<number>();

  protected readonly externalContactIsFromGroup = computed(
    () =>
      this.contact().origin === ExternalContactSource.HUNTER_GROUP ||
      (this.linkedLegalEntitiesCount() ?? 0) > 3,
  );

  protected readonly confidenceScore = computed(() => {
    const contact = this.contact();
    let score = 0;
    if (contact.origin === ExternalContactSource.PAPPERS) {
      score = CONFIDENCE_SCORE_PAPPERS;
    } else if (contact.origin === ExternalContactSource.HUNTER_GROUP) {
      score = CONFIDENCE_SCORE_GROUP_ENTITY;
    } else {
      score = contact.confidenceScore ?? 0;
    }

    if ((this.linkedLegalEntitiesCount() ?? 0) > 3) {
      score = score - CONFIDENCE_SCORE_MULTI_ENTITY_PENALTY;
    }
    return Math.round(Math.max(0, Math.min(100, score)));
  });

  protected readonly warningTooltip = computed(() => {
    const count = this.linkedLegalEntitiesCount() ?? 0;
    if (count > 1) {
      return `Ce contact est associé à ${count} entreprises.`;
    }

    if (this.contact().origin === ExternalContactSource.HUNTER_GROUP) {
      return "Contact provenant d'un groupe d'entreprises.";
    }

    return undefined;
  });

  protected readonly displayedToolTip = computed(() => {
    const origin = (() => {
      switch (this.contact().origin) {
        case ExternalContactSource.PAPPERS:
          return "Pappers";
        case ExternalContactSource.HUNTER_GROUP:
          return "Groupe d'entreprises";
        case ExternalContactSource.HUNTER:
          return "Hunter";
        case ExternalContactSource.SOCIETE_INFO:
          return "Société Info";
        default:
          return "Inconnu";
      }
    })();
    return `Score de confiance : ${this.confidenceScore()}% \n (Source : ${origin})`;
  });
}

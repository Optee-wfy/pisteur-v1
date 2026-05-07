import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { buildAssetUrl, ExternalContactSource } from "@optee/constants";
import {
  IconHunterLogoComponent,
  IconPappersLogoComponent,
} from "@optee/icons";
import type { ExternalContact } from "@optee/models";
import { Tooltip } from "primeng/tooltip";

@Component({
  selector: "mkp-external-contact-origin",
  template: `
    <span
      class="flex cursor-pointer justify-center"
      pTooltip="{{
        externalContactSourceTooltip(
          contact().origin,
          contact().confidenceScore
        )
      }}"
      tooltipPosition="left"
      (click)="openSourceInfo(contact().origin)"
    >
      @if (contact().origin === ExternalContactSource.PAPPERS) {
        <icon-pappers-logo class="size-5" />
      } @else if (
        contact().origin === ExternalContactSource.HUNTER ||
        contact().origin === ExternalContactSource.HUNTER_GROUP
      ) {
        <icon-hunter-logo class="size-5" />
      } @else if (contact().origin === ExternalContactSource.SOCIETE_INFO) {
        <img
          class="size-5"
          alt="Societe info logo"
          [src]="societeInfoLogoUrl"
        />
      } @else {
        <span class="text-granite-400 text-xs">NC</span>
      }
    </span>
  `,
  imports: [IconHunterLogoComponent, IconPappersLogoComponent, Tooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalContactOriginComponent {
  readonly contact = input.required<ExternalContact>();
  protected readonly ExternalContactSource = ExternalContactSource;

  protected readonly societeInfoLogoUrl = buildAssetUrl(
    "tools/societe-info.webp",
  );

  protected externalContactSourceTooltip(
    origin: ExternalContactSource,
    confidence: number | null,
  ) {
    if (origin === ExternalContactSource.PAPPERS) {
      return "Donnée provenant de Pappers";
    } else if (origin === ExternalContactSource.HUNTER) {
      return (
        "Donnée provenant de Hunter : confiance " +
        (confidence != null ? confidence + "%" : "NC")
      );
    } else if (origin === ExternalContactSource.HUNTER_GROUP) {
      return "Cette personne fait partie d'un groupe. Elle pourrait ne pas appartenir à l'entité sélectionnée.";
    } else if (origin === ExternalContactSource.SOCIETE_INFO) {
      return "Donnée provenant de Societe Info";
    }
    return undefined;
  }

  protected openSourceInfo(source: ExternalContactSource) {
    if (source === ExternalContactSource.PAPPERS) {
      window.open("https://pappers.fr", "_blank", "noopener");
    } else if (
      source === ExternalContactSource.HUNTER ||
      source === ExternalContactSource.HUNTER_GROUP
    ) {
      window.open("https://hunter.io", "_blank", "noopener");
    }
  }
}

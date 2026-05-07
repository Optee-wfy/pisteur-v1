import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";

import { LowerCasePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import {
  AssociationProExternalContactType,
  fullEnrichFeatureEnabled,
  MAIL_CONTACT_ENRICHMENT_COST,
  PHONE_CONTACT_ENRICHMENT_COST,
} from "@optee/constants";
import { IconCompanyComponent } from "@optee/icons";
import { formatPhoneNumber } from "@optee/utils";
import { TableModule } from "primeng/table";
import { Tooltip } from "primeng/tooltip";
import { FullEnrichService } from "../../../../../../services/fullenrich.service";
import { ExternalContactRolePipe } from "../../../../pipes/external-contacts/external-contact-role.pipe";
import { EnrichButtonComponent } from "../../../enrichment/enrich-button/enrich-button.component";
import { LinkedInLinkButtonComponent } from "../../../linkedin-button/linkedin-button.component";
import { ProspectEmailButtonComponent } from "../../../prospect-email-button/prospect-email-button.component";
import { ExternalContactConfidenceScoreComponent } from "../../external-contact-confidence-score/external-contact-confidence-score.component";
import { ExternalContactOriginComponent } from "../../external-contact-origin/external-contact-origin.component";
import { ExternalContactOwnerComponent } from "../../external-contact-owner/external-contact-owner.component";
import { ExternalContactStatusProComponent } from "../../external-contact-status-pro/external-contact-status-pro.component";
import {
  emailIsUnlocked,
  isFullyEnriched,
  phoneIsUnlocked,
} from "../external-contact.utils";
import type { ExternalContactRow } from "../external-contacts-table.types";

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: "tr[mkp-external-contact-row]",
  template: `
    @let rowData = row();
    @let contact = rowData.contact;
    @let contactEmailEnrichmentInProgress =
      fullEnrichService.isContactEnriching(
        contact.uuid,
        associationType.MAIL
      ) ||
      fullEnrichService.isContactEnriching(contact.uuid, associationType.BOTH);
    @let contactPhoneEnrichmentInProgress =
      fullEnrichService.isContactEnriching(
        contact.uuid,
        associationType.PHONE
      ) ||
      fullEnrichService.isContactEnriching(contact.uuid, associationType.BOTH);
    @let contactEnrichmentInProgress =
      contactEmailEnrichmentInProgress || contactPhoneEnrichmentInProgress;

    <!-- Sélection -->
    <td alignFrozen="left" pFrozenColumn [frozen]="true" class="bg-white">
      <p-tableCheckbox
        [disabled]="
          isLoading() ||
          contactEnrichmentInProgress ||
          (isEnrichmentMode() && isFullyEnriched(rowData))
        "
        [value]="rowData"
      />
    </td>

    <!-- Contact First Name and Last Name -->
    <td alignFrozen="left" pFrozenColumn [frozen]="true" class="bg-white">
      @let name = contactName();
      @if (name) {
        <span
          class="line-clamp-1 w-full font-medium"
          [pTooltip]="name.length > 20 ? name : undefined"
        >
          {{ name }}
        </span>
      } @else {
        <span class="text-granite-300 text-sm italic">Non connu</span>
      }
    </td>

    <!-- Contact Status -->
    <td>
      <mkp-external-contact-status-pro
        (updated)="statusUpdated.emit()"
        [associationUuid]="rowData.associationUuid"
        [status]="contact.status"
      />
    </td>

    <!-- Confidence Score -->
    <td class="overflow-hidden">
      <mkp-external-contact-confidence-score
        class="flex w-full justify-center"
        [contact]="contact"
        [linkedLegalEntitiesCount]="rowData.legalEntities.length"
      />
    </td>

    <!-- Contact Role -->
    <td>
      @let roleLabel = contact.role | ExternalContactRole;
      <div class="flex flex-col items-start justify-start gap-0.5">
        <span
          class="line-clamp-1 max-w-80 font-medium"
          [pTooltip]="roleLabel.length > 25 ? roleLabel : undefined"
        >
          {{ roleLabel }}
        </span>
        @if (contact.department) {
          <span class="line-clamp-1 block max-w-72 text-xs text-gray-600">
            {{ contact.department }}
          </span>
        }
      </div>
    </td>

    <!-- Linked Legal Entities -->
    <td class="max-w-[10.5rem]">
      @if (rowData.legalEntities.length) {
        <div class="flex min-w-0 gap-1 overflow-hidden">
          @for (entity of rowData.legalEntities; track entity.uuid) {
            <span class="flex min-w-0 items-center gap-2">
              <a
                class="pister-link min-w-0 flex-1 capitalize text-[13px]"
              [routerLink]="[
                '/pro/pisteur/legal-entities/details',
                entity.uuid,
              ]"
              >
                <icon-company class="size-4 shrink-0" />
                @if (entity.name) {
                  <span class="block min-w-0 truncate whitespace-nowrap">
                    {{ entity.name | lowercase }}
                  </span>
                } @else {
                  <p class="text-granite-300 text-sm italic">Non connu</p>
                }
              </a>
            </span>
          }
        </div>
      } @else {
        <span class="text-granite-300 text-sm italic">Aucune entreprise</span>
      }
    </td>

    <!-- Contact LinkedIn Button -->
    <td>
      <mkp-linkedin-button
        class="flex w-full justify-center"
        [linkedInUrl]="contact.linkedInUrl"
      />
    </td>

    <!-- Contact Email -->
    <td class="whitespace-nowrap">
      @let email = contact.email ?? "";
      @if (!contactEmailEnrichmentInProgress && emailIsUnlocked(rowData)) {
        @if (email) {
          <span
            class="line-clamp-1 w-full truncate"
            [pTooltip]="email.length > 25 ? email : undefined"
          >
            {{ email }}
          </span>
        } @else {
          <p class="text-granite-300 text-sm italic">Non connu</p>
        }
      } @else {
        <mkp-enrich-button
          type="mail"
          (clicked)="
            fullEnrichService.enrichSingleContact({
              row: rowData,
              type: associationType.MAIL,
              emailUnlocked: emailIsUnlocked(rowData),
              phoneUnlocked: phoneIsUnlocked(rowData),
            })
          "
          [credits]="MAIL_CONTACT_ENRICHMENT_COST"
          [disabled]="!isFullEnrichFeatureEnabled"
          [inProgress]="contactEmailEnrichmentInProgress"
        />
      }
    </td>

    <!-- Contact Phone -->
    <td>
      @if (!contactPhoneEnrichmentInProgress && phoneIsUnlocked(rowData)) {
        @let contactPhone = formatPhoneNumber(contact.phone);
        @if (contactPhone) {
          <span class="font-medium">
            {{ contactPhone }}
          </span>
        } @else {
          <p class="text-granite-300 text-sm italic">Non connu</p>
        }
      } @else {
        <mkp-enrich-button
          type="phone"
          (clicked)="
            fullEnrichService.enrichSingleContact({
              row: rowData,
              type: associationType.PHONE,
              emailUnlocked: emailIsUnlocked(rowData),
              phoneUnlocked: phoneIsUnlocked(rowData),
            })
          "
          [credits]="PHONE_CONTACT_ENRICHMENT_COST"
          [disabled]="!isFullEnrichFeatureEnabled"
          [inProgress]="contactPhoneEnrichmentInProgress"
        />
      }
    </td>

    <!-- Contact Origin -->
    <td>
      <mkp-external-contact-origin [contact]="contact" />
    </td>

    <!-- Contact Owner -->
    <td class="text-center">
      <mkp-external-contact-owner [owner]="row().owner" />
    </td>

    <!-- Prospect Email Button -->
    <td alignFrozen="right" pFrozenColumn [frozen]="true" class="bg-white">
      @let legalEntityUuid = rowData.legalEntities[0]?.uuid;
      @if (legalEntityUuid) {
        <mkp-prospect-email-button
          class="flex w-full justify-center"
          [contact]="{
            email: contact.email,
            uuid: contact.uuid,
          }"
          [emailUnlocked]="emailIsUnlocked(rowData)"
          [legalEntityUuid]="legalEntityUuid"
        />
      }
    </td>
  `,
  imports: [
    ExternalContactConfidenceScoreComponent,
    ExternalContactOriginComponent,
    ExternalContactRolePipe,
    ExternalContactStatusProComponent,
    IconCompanyComponent,
    EnrichButtonComponent,
    LinkedInLinkButtonComponent,
    LowerCasePipe,
    ProspectEmailButtonComponent,
    RouterLink,
    TableModule,
    Tooltip,
    ExternalContactOwnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalContactRowComponent {
  readonly row = input.required<ExternalContactRow>();
  readonly isEnrichmentMode = input(false);
  readonly isLoading = input(false);
  readonly statusUpdated = output<void>();

  protected readonly fullEnrichService = inject(FullEnrichService);

  protected readonly associationType = AssociationProExternalContactType;
  protected readonly formatPhoneNumber = formatPhoneNumber;
  protected readonly isFullEnrichFeatureEnabled =
    fullEnrichFeatureEnabled.isEnabled;

  protected readonly emailIsUnlocked = emailIsUnlocked;
  protected readonly phoneIsUnlocked = phoneIsUnlocked;
  protected readonly isFullyEnriched = isFullyEnriched;
  protected readonly PHONE_CONTACT_ENRICHMENT_COST =
    PHONE_CONTACT_ENRICHMENT_COST;

  protected readonly MAIL_CONTACT_ENRICHMENT_COST =
    MAIL_CONTACT_ENRICHMENT_COST;

  protected readonly contactName = computed(() => {
    const contact = this.row().contact;
    return (
      [contact.firstName, contact.lastName].filter(Boolean).join(" ") || null
    );
  });
}

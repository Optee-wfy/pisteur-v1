import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import {
  AssociationProExternalContactsLabels,
  AssociationProExternalContactStatus,
  AssociationProExternalContactType,
  LEGAL_ENTITY_TYPES,
  type ExternalContactFilters,
} from "@optee/constants";
import { removeNullishProps } from "@optee/utils";
import { InputText } from "primeng/inputtext";
import { debounceTime, map } from "rxjs";

import {
  IconAddressBookComponent,
  IconCompanyComponent,
  IconPersonComponent,
  IconSearchComponent,
} from "@optee/icons";
import type { ContactUuid, LegalEntityUuid } from "@optee/models";
import { CheckboxModule } from "primeng/checkbox";
import { SliderModule } from "primeng/slider";
import { OptionsSelectorComponent } from "../../../../../../components/shared/options-selector/options-selector.component";
import { FilterPermissionsService } from "../../../../../../services/filter-permissions.service";
import { ButtonFilterPopoverComponent } from "../../../button-filter-popover/button-filter-popover.component";
import { ExternalContactStatusComponent } from "../../external-contact-status/external-contact-status.component";

type AssociationTypeOptionValue = AssociationProExternalContactType;

@Component({
  selector: "mkp-external-contacts-filters",
  host: {
    class:
      "border-granite-100 mt-1 flex self-stretch items-center gap-2 overflow-hidden rounded-[16px] border bg-white px-4 py-2 shadow-sm",
  },
  styles: `
    input[type="search"]::-webkit-search-decoration,
    input[type="search"]::-webkit-search-cancel-button,
    input[type="search"]::-webkit-search-results-button,
    input[type="search"]::-webkit-search-results-decoration {
      display: none;
      -webkit-appearance: none;
    }
  `,
  template: `
    <form
      class="flex flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden"
      style="scrollbar-width: thin;"
      [formGroup]="contactsFilterForm"
    >
      <!-- Search External contacts -->
      <div
        class="text-granite-900 border-granite-200 hover:border-granite-300 flex h-8 min-w-56 flex-shrink-0 items-center justify-start rounded-full border bg-white py-1 pl-3 pr-2 transition-all"
      >
        <icon-search class="size-3" />
        <input
          class="placeholder-granite-900 h-full min-w-0 flex-1 appearance-none border-none pr-0 text-[13px] font-medium focus:outline-none"
          pInputText
          placeholder="Rechercher une personne"
          role="searchbox"
          size="small"
          type="search"
          [formControl]="contactsFilterForm.controls.search"
        />
      </div>

      <div class="flex gap-1">
        @for (status of statusOptions; track status; let i = $index) {
          <div
            class="text-granite-900 flex items-center gap-2 rounded-lg px-0.5 py-0.5 text-sm font-medium transition-all"
          >
            <p-checkbox
              class="hidden"
              [formControl]="contactsFilterForm.controls.status"
              [inputId]="'status-' + i"
              [value]="status"
            />
            <label class="flex-1 cursor-pointer" [for]="'status-' + i">
              <mkp-external-contact-status
                class="w-full border-current text-xs"
                [class]="
                  contactsFilterForm.controls.status.value?.includes(status)
                    ? 'border'
                    : ''
                "
                [count]="statusCounts()?.[status] ?? null"
                [status]="status"
              />
            </label>
          </div>
        }
      </div>

      <!-- Owner filter -->
      <mkp-button-filter-popover
        variant="leads"
        label="Propriétaire"
        (clear)="contactsFilterForm.controls.ownerUuid.setValue([])"
        [hasSelected]="contactsFilterForm.controls.ownerUuid.value.length > 0"
        [isFilterAccessible]="filterPermissions.isFilterAccessible('ownerUuid')"
        [selectedValue]="formatOwnerValue()"
      >
        <icon-person class="size-4" iconSlot />
        <mkp-options-selector
          [formControl]="contactsFilterForm.controls.ownerUuid"
          [options]="ownerOptions()"
          [showSearch]="true"
        />
      </mkp-button-filter-popover>

      <!-- Legal entity filter -->
      <mkp-button-filter-popover
        variant="leads"
        label="Entreprise"
        (clear)="contactsFilterForm.controls.legalEntityUuids.setValue([])"
        [hasSelected]="
          contactsFilterForm.controls.legalEntityUuids.value.length > 0
        "
        [isFilterAccessible]="
          filterPermissions.isFilterAccessible('legalEntityUuids')
        "
        [selectedValue]="formatLegalEntityValue()"
      >
        <icon-company class="size-4" iconSlot />
        <mkp-options-selector
          [formControl]="contactsFilterForm.controls.legalEntityUuids"
          [options]="legalEntitiesOptions()"
          [showSearch]="true"
        />
      </mkp-button-filter-popover>

      <!-- Association Type Filter -->
      <mkp-button-filter-popover
        class="ml-auto"
        variant="leads"
        label="Coordonnées disponibles"
        (clear)="
          contactsFilterForm.controls.associationProExternalContacts.setValue(
            []
          )
        "
        [hasSelected]="
          contactsFilterForm.controls.associationProExternalContacts.value
            .length > 0
        "
        [isFilterAccessible]="
          filterPermissions.isFilterAccessible('associationProExternalContacts')
        "
        [selectedValue]="formatAssociationTypeValue()"
      >
        <icon-address-book class="size-4" iconSlot />
        <mkp-options-selector
          [formControl]="
            contactsFilterForm.controls.associationProExternalContacts
          "
          [options]="associationTypeOptions"
          [showSearch]="false"
        />
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            class="border-granite-200 text-granite-900 hover:bg-granite-100 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-all"
            type="button"
            (click)="selectExploitables()"
          >
            Exploitables (email et/ou téléphone)
          </button>
        </div>
      </mkp-button-filter-popover>
    </form>
  `,
  imports: [
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    SliderModule,
    InputText,
    ButtonFilterPopoverComponent,
    OptionsSelectorComponent,
    ExternalContactStatusComponent,
    IconPersonComponent,
    IconAddressBookComponent,
    IconCompanyComponent,
    IconSearchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalContactsFiltersComponent {
  readonly showSearchContactFilter = input(true);
  readonly filters = model<ExternalContactFilters | null>(null);
  readonly ownerOptions = input<
    Array<{
      label: string;
      value: ContactUuid;
    }>
  >([]);

  readonly statusCounts = input<Record<
    AssociationProExternalContactStatus,
    number
  > | null>(null);

  readonly legalEntitiesOptions = input<
    Array<{
      label: string;
      value: LegalEntityUuid;
    }>
  >([]);

  protected readonly filterPermissions = inject(FilterPermissionsService);

  protected readonly legalEntityTypesOptions = [...LEGAL_ENTITY_TYPES];
  protected readonly statusOptions = Object.values(
    AssociationProExternalContactStatus,
  ) as AssociationProExternalContactStatus[];

  protected readonly contactsFilterForm = new FormGroup({
    search: new FormControl<string | null>(null),
    associationProExternalContacts: new FormControl<
      AssociationTypeOptionValue[]
    >([], {
      nonNullable: true,
    }),
    status: new FormControl<AssociationProExternalContactStatus[]>([]),
    ownerUuid: new FormControl<ContactUuid[]>([], { nonNullable: true }),
    legalEntityUuids: new FormControl<LegalEntityUuid[]>([], {
      nonNullable: true,
    }),
  });

  protected readonly filtersCount = signal(0);

  protected readonly associationTypeOptions = Object.values(
    AssociationProExternalContactType,
  )
    .filter((value) => value !== AssociationProExternalContactType.SEARCHED)
    .map((value) => ({
      label: AssociationProExternalContactsLabels[value],
      value,
    }));

  protected formatAssociationTypeValue() {
    const selected =
      this.contactsFilterForm.controls.associationProExternalContacts.value;
    const labels = this.associationTypeOptions
      .filter((option) => selected.includes(option.value))
      .map((option) => option.label);
    return this.truncateLabel(labels.join(", "));
  }

  protected formatOwnerValue() {
    const selected = this.contactsFilterForm.controls.ownerUuid.value;
    const labels = this.ownerOptions()
      .filter((option) => selected.includes(option.value))
      .map((option) => option.label);
    return this.truncateLabel(labels.join(", "));
  }

  protected formatLegalEntityValue() {
    const selected = this.contactsFilterForm.controls.legalEntityUuids.value;
    const labels = this.legalEntitiesOptions()
      .filter((option) => selected.includes(option.value))
      .map((option) => option.label);
    if (labels.length === 0 && selected.length > 0) {
      return `${selected.length} entreprise(s) sélectionnée(s)`;
    }
    return this.truncateLabel(labels.join(", "));
  }

  private readonly applyInitialFilter = effect(() => {
    const filters = this.filters();
    if (!filters) {
      return;
    }

    this.contactsFilterForm.patchValue(removeNullishProps(filters), {
      emitEvent: false,
    });
    this.filtersCount.set(
      Object.keys(filters).filter(
        (key) => !Object.keys(this.contactsFilterForm.controls).includes(key),
      ).length,
    );
  });

  private readonly syncInputWithFormValues =
    this.contactsFilterForm.valueChanges
      .pipe(
        debounceTime(800),
        takeUntilDestroyed(),
        map((filters) => {
          const associationType = this.normalizeAssociationTypes(
            filters.associationProExternalContacts ?? [],
          );
          return removeNullishProps({
            ...(this.filters() ?? {}),
            ...filters,
            associationProExternalContacts: associationType.length
              ? associationType
              : null,
            search:
              filters.search && filters.search.trim().length >= 2
                ? filters.search.trim()
                : null,
          });
        }),
      )
      .subscribe((filters) => this.filters.set(filters));

  private normalizeAssociationTypes(selected: AssociationTypeOptionValue[]) {
    return Array.from(
      new Set(
        selected.filter(
          (value) => value !== AssociationProExternalContactType.SEARCHED,
        ),
      ),
    );
  }

  private truncateLabel(value: string, maxLength = 30) {
    if (value.length <= maxLength) {
      return value;
    }
    return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
  }

  protected selectExploitables() {
    this.contactsFilterForm.controls.associationProExternalContacts.setValue([
      AssociationProExternalContactType.MAIL,
      AssociationProExternalContactType.PHONE,
      AssociationProExternalContactType.BOTH,
    ]);
  }
}

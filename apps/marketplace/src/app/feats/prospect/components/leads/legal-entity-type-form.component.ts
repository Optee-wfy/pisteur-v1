import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { FormField, type FieldTree } from "@angular/forms/signals";
import type { LeadGeneratorForm } from "@optee/constants";
import {
  LocationTypeNafCategoryEnum,
  TYPE_LOCATION_LABELS,
} from "@optee/constants";
import {
  IconClapperboardComponent,
  IconDrillComponent,
  IconFactoryComponent,
  IconForkliftComponent,
  IconHeadsetComponent,
  IconHomeComponent,
  IconHospitalComponent,
  IconHotelComponent,
  IconSchoolComponent,
  IconStoreComponent,
  IconTertiaireComponent,
} from "@optee/icons";
import { CheckboxComponent } from "@optee/ui/components/atoms/fields/checkbox.component";
import type { FieldOptions } from "@optee/ui/components/atoms/fields/field.types";

@Component({
  selector: "mkp-legal-entity-type-form",
  template: `
    <form class="flex flex-col gap-8">
      <oui-checkbox
        [formField]="form().types"
        [options]="locationTypeOptions"
      />
    </form>
  `,
  imports: [CheckboxComponent, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntityTypeFormComponent {
  readonly form =
    input.required<FieldTree<LeadGeneratorForm["legalEntityForm"]>>();

  protected readonly locationTypeOptions: FieldOptions = [
    {
      value: LocationTypeNafCategoryEnum.BUREAUX_TERTIAIRE,
      label:
        TYPE_LOCATION_LABELS[LocationTypeNafCategoryEnum.BUREAUX_TERTIAIRE],
      icon: IconTertiaireComponent,
      description: "Espaces de bureau",
      color: "#6d28d9",
      bgColor: "#f3e8ff",
    },
    {
      value: LocationTypeNafCategoryEnum.RESIDENTIEL_COLLECTIF_GERE,
      label:
        TYPE_LOCATION_LABELS[
          LocationTypeNafCategoryEnum.RESIDENTIEL_COLLECTIF_GERE
        ],
      icon: IconHomeComponent,
      description: "Copropriétés, HLM",
      color: "#2563eb",
      bgColor: "#dbeafe",
    },
    {
      value: LocationTypeNafCategoryEnum.SITES_INDUSTRIELS_USINES,
      label:
        TYPE_LOCATION_LABELS[
          LocationTypeNafCategoryEnum.SITES_INDUSTRIELS_USINES
        ],
      icon: IconFactoryComponent,
      description: "Production industrielle",
      color: "#d97706",
      bgColor: "#fef3c7",
    },
    {
      value: LocationTypeNafCategoryEnum.LOGISTIQUE_ENTREPOSAGE,
      label:
        TYPE_LOCATION_LABELS[
          LocationTypeNafCategoryEnum.LOGISTIQUE_ENTREPOSAGE
        ],
      icon: IconForkliftComponent,
      description: "Entrepôts, stockage",
      color: "#475569",
      bgColor: "#e2e8f0",
    },
    {
      value: LocationTypeNafCategoryEnum.BTP_BASES_TECHNIQUES,
      label:
        TYPE_LOCATION_LABELS[LocationTypeNafCategoryEnum.BTP_BASES_TECHNIQUES],
      icon: IconDrillComponent,
      description: "Chantiers, ateliers",
      color: "#ea580c",
      bgColor: "#ffedd5",
    },
    {
      value: LocationTypeNafCategoryEnum.HOTELLERIE_TOURISME_LOISIRS,
      label:
        TYPE_LOCATION_LABELS[
          LocationTypeNafCategoryEnum.HOTELLERIE_TOURISME_LOISIRS
        ],
      icon: IconHotelComponent,
      description: "Hôtels, restaurants",
      color: "#db2777",
      bgColor: "#fce7f3",
    },
    {
      value: LocationTypeNafCategoryEnum.SANTE_MEDICO_SOCIAL,
      label:
        TYPE_LOCATION_LABELS[LocationTypeNafCategoryEnum.SANTE_MEDICO_SOCIAL],
      icon: IconHospitalComponent,
      description: "Hôpitaux, EHPAD",
      color: "#16a34a",
      bgColor: "#dcfce7",
    },
    {
      value: LocationTypeNafCategoryEnum.ENSEIGNEMENT_BATIMENTS_PUBLICS,
      label:
        TYPE_LOCATION_LABELS[
          LocationTypeNafCategoryEnum.ENSEIGNEMENT_BATIMENTS_PUBLICS
        ],
      icon: IconSchoolComponent,
      description: "Écoles, mairies",
      color: "#0284c7",
      bgColor: "#e0f2fe",
    },
    {
      value: LocationTypeNafCategoryEnum.COMMERCE_ERP,
      label: TYPE_LOCATION_LABELS[LocationTypeNafCategoryEnum.COMMERCE_ERP],
      icon: IconStoreComponent,
      description: "Magasins, retail",
      color: "#b45309",
      bgColor: "#fef3c7",
    },
    {
      value: LocationTypeNafCategoryEnum.SERVICES_OPERATIONNELS_SUPPORT,
      label:
        TYPE_LOCATION_LABELS[
          LocationTypeNafCategoryEnum.SERVICES_OPERATIONNELS_SUPPORT
        ],
      icon: IconHeadsetComponent,
      description: "Support, maintenance",
      color: "#0f766e",
      bgColor: "#ccfbf1",
    },
    {
      value: LocationTypeNafCategoryEnum.CULTURE_SPORT_SERVICES_PERSONNE,
      label:
        TYPE_LOCATION_LABELS[
          LocationTypeNafCategoryEnum.CULTURE_SPORT_SERVICES_PERSONNE
        ],
      icon: IconClapperboardComponent,
      description: "Sport, culture, loisirs",
      color: "#7c3aed",
      bgColor: "#ede9fe",
    },
  ];
}

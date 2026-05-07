import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  getLegalEntityTypeLabel,
  type LegalEntityType,
} from "@optee/constants";

type LegalEntityTypeTone = LegalEntityType | "unknown";

type LegalEntityTypeChipPalette = {
  backgroundColor: string;
  borderColor: string;
  color: string;
};

export const LEGAL_ENTITY_TYPE_CHIP_COLORS: Record<
  LegalEntityTypeTone,
  LegalEntityTypeChipPalette
> = {
  copro: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    color: "#3730A3",
  },
  tertiaire: {
    backgroundColor: "#E0F2FE",
    borderColor: "#7DD3FC",
    color: "#075985",
  },
  public: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
    color: "#166534",
  },
  unknown: {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
    color: "#374151",
  },
};

@Component({
  selector: "mkp-legal-entity-type-chip",
  template: `
    <span
      class="status-chip"
      [style.backgroundColor]="palette().backgroundColor"
      [style.borderColor]="palette().borderColor"
      [style.color]="palette().color"
    >
      {{ label() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntityTypeChipComponent {
  readonly type = input<LegalEntityType | null | undefined>(null);

  protected readonly tone = computed<LegalEntityTypeTone>(() => {
    return this.type() ?? "unknown";
  });

  protected readonly palette = computed(
    () => LEGAL_ENTITY_TYPE_CHIP_COLORS[this.tone()],
  );

  protected readonly label = computed(() => {
    const type = this.type();
    return getLegalEntityTypeLabel(type) ?? type ?? "NC";
  });
}

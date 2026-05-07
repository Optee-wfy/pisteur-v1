import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { OperationRow } from "@optee/models";
import { InfoComponent } from "@optee/ui/components/molecules/info/info.component";

@Component({
  selector: "mkp-operation-cee-file",
  template: `
    <oui-info heading="Fiches CEE applicables" variant="highlighted">
      @if (ceeFile(); as ceeFile) {
        {{ ceeFile.name + ": (" + ceeFile.file + ")" }}
      } @else {
        Aucune fiche disponible.
      }
    </oui-info>
  `,
  imports: [InfoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationCeeFileComponent {
  readonly operation = input.required<OperationRow>();

  protected readonly ceeFile = computed(() =>
    this.operation().getCeeFile(this.operation().location.mainSector),
  );
}

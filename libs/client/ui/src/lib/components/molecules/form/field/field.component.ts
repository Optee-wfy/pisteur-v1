import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { IconWarningComponent } from "@optee/icons";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "oui-field",
  host: {
    class: "flex flex-col gap-1",
  },
  template: `
    <label
      class="text-primary-900 font-display flex items-center gap-2 text-sm font-medium leading-5 tracking-[0.28px]"
      for="{{ name() }}"
    >
      {{ label() }}
      <ng-content select="suffixLabel" />
    </label>

    <ng-content />

    @if (errorMessage(); as errorMessage) {
      <small
        class="hidden text-xs leading-4 text-red-500 [&:not(:empty)]:block"
      >
        <div class="flex items-center justify-start gap-1">
          <icon-warning class="size-5" aria-label="Attention" />
          <span>{{ errorMessage }}</span>
        </div>

        <ng-content select="errors" />
      </small>
    }
  `,
  imports: [CommonModule, IconWarningComponent],
})
export class FieldComponent {
  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly errorMessage = input<string>();
}

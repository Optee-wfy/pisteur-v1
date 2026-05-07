import { CommonModule } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import type { AbstractControl, FormControl } from "@angular/forms";
import { Tooltip } from "primeng/tooltip";
import { filter, map, shareReplay, switchMap } from "rxjs";

//@todo improve typing of FormControl | AbstractControl => Use FieldComponent in FormFieldComponent

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "oui-form-field",
  host: {
    class: "flex flex-col gap-1.5",
  },
  template: `
    @if (label(); as label) {
      <label
        class="flex items-center gap-2 text-sm font-medium leading-5 tracking-[0.28px]"
        for="{{ name() }}"
        tooltipPosition="top"
        [class.text-granite-500]="!darkMode()"
        [class.text-white]="darkMode()"
        [pTooltip]="tooltipMessage() ?? undefined"
      >
        {{ label }}
        <ng-content select="suffixLabel" />
      </label>
    }

    <div
      tooltipEvent="focus"
      tooltipPosition="top"
      tooltipStyleClass="p-tooltip--error"
      [fitContent]="true"
      [pTooltip]="(errorMessage$ | async) ?? undefined"
    >
      <ng-content />
    </div>
  `,
  imports: [CommonModule, Tooltip],
})
export class FormFieldComponent {
  readonly name = input.required<string>();
  readonly label = input<string>();
  readonly control = input.required<FormControl | AbstractControl>();
  readonly darkMode = input(false, { transform: booleanAttribute });
  readonly tooltipMessage = input<string>();

  private readonly controlEvents$ = toObservable(this.control).pipe(
    switchMap((control) => control.events.pipe(map(() => control))),
  );

  protected readonly errorMessage$ = this.controlEvents$.pipe(
    filter((control) => !!control && (control.dirty || control.touched)),
    map((control) => {
      if (!control.errors) {
        return null;
      }

      if (control.errors["required"]) {
        return "Ce champ est obligatoire";
      }
      if (control.errors["email"]) {
        return "Ce champ n'est pas une adresse email valide";
      }
      if (control.errors["pattern"]) {
        return typeof control.errors["pattern"] === "string"
          ? control.errors["pattern"]
          : "Ce champ est invalide !";
      }

      if (control.errors["maxlength"]) {
        const maxLength = control.validator
          ? control?.validator(control)?.["maxlength"]?.["requiredLength"]
          : null;
        return `Ce champ ne peut pas contenir plus de ${maxLength} caractères.`;
      }
      if (control.errors["max"]) {
        return `La valeur de ce champ doit ête inférieure à ${control.errors["max"]["max"]}.`;
      }

      if (control.errors["minlength"]) {
        return `Ce champ doit contenir au moins ${control.errors["minlength"]["requiredLength"]} caractères.`;
      }
      if (control.errors["min"]) {
        return `La valeur de ce champ doit ête supérieure à ${control.errors["min"]["min"]}.`;
      }

      return null;
    }),
    shareReplay(),
  );
}

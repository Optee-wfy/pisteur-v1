import { FormGroup } from "@angular/forms";

export function refreshFormFieldValidity(form: FormGroup): void {
  for (const control of Object.values(form.controls)) {
    if (control.invalid) {
      control.markAsDirty();
      control.markAllAsTouched();
      control.updateValueAndValidity();
      if (control instanceof FormGroup) {
        refreshFormFieldValidity(control);
      }
    }
  }
}

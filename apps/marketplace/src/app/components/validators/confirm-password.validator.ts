import type {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";

export const confirmPasswordValidator: ValidatorFn = (
  controls: AbstractControl,
): ValidationErrors | null => {
  if (
    controls.value.password &&
    controls.value.confirmPassword &&
    controls.value.password !== controls.value.confirmPassword
  ) {
    return { confirmPasswordValidator: true };
  }

  return null;
};

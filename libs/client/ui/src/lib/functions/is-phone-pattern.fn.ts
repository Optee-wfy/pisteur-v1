import type { AbstractControl, ValidatorFn } from "@angular/forms";
import { PHONE_PATTERN } from "libs/shared/constants/src/lib/pattern.constant";

export const phoneNumberValidator: ValidatorFn = (control: AbstractControl) => {
  if (!control.value) {
    return null;
  }

  const isValid = PHONE_PATTERN.test(control.value);

  return isValid
    ? null
    : {
        pattern:
          "Le numéro de téléphone doit être au format français : commencer par '+33' ou '0', suivi de 9 chiffres.",
      };
};

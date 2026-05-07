import type { AbstractControl, ValidationErrors } from "@angular/forms";

export const checkPasswordComplexity = (
  control: AbstractControl,
  errorMessage = "Le mot de passe ne respecte pas les conditions requises. Veuillez en choisir un autre.",
): ValidationErrors | null => {
  const containsNumber = /[0-9]/;
  const containsLetter = /[a-zA-Z]/;

  const hasNumber = containsNumber.test(control.value);
  const hasLetter = containsLetter.test(control.value);

  if (hasNumber && hasLetter) {
    return null;
  }
  return {
    pattern: errorMessage,
  };
};

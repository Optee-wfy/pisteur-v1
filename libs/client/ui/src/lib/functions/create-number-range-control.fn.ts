import { FormControl, Validators } from "@angular/forms";
import type { NumberRange } from "@optee/constants";
import { isNotNullish } from "@optee/utils";

export const createNumberRangeControl = <T extends number>(
  range: [T, T],
  value: NumberRange = null,
) =>
  new FormControl<NumberRange>(value, {
    validators: [
      range[0] !== undefined && range[0] !== null
        ? Validators.min(range[0])
        : null,
      range[1] !== undefined && range[1] !== null
        ? Validators.max(range[1])
        : null,
    ].filter(isNotNullish),
  });

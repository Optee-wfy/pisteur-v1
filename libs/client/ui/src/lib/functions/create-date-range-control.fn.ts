import type { ValidatorFn } from "@angular/forms";
import { FormControl } from "@angular/forms";
import type { DateRange } from "@optee/constants";
import { isNotNullish } from "@optee/utils";

const minYearValidator = (minYear: number): ValidatorFn => {
  return (control) => {
    const value = control.value as DateRange;
    if (!value?.[0]) {
      return null;
    }
    const year = value[0].getFullYear();
    return year < minYear ? { min: { min: minYear, actual: year } } : null;
  };
};

const maxYearValidator = (maxYear: number): ValidatorFn => {
  return (control) => {
    const value = control.value as DateRange;
    if (!value?.[1]) {
      return null;
    }
    const year = value[1].getFullYear();
    return year > maxYear ? { max: { max: maxYear, actual: year } } : null;
  };
};

export const createDateRangeControl = <T extends Date>(
  range: [T, T],
  value: DateRange = null,
) =>
  new FormControl<DateRange>(value, {
    validators: [
      range[0] ? minYearValidator(range[0].getFullYear()) : null,
      range[1] ? maxYearValidator(range[1].getFullYear()) : null,
    ].filter(isNotNullish),
  });

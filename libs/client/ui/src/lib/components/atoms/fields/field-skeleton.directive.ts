import { Directive, booleanAttribute, input, model } from "@angular/core";
import type { FieldMode } from "./field.types";

@Directive()
export abstract class FieldSkeleton {
  readonly label = input<string>();
  readonly mode = input<FieldMode>("field");
  readonly disabled = model(false);
  readonly restrictedAccess = input(false, {
    transform: booleanAttribute,
  });

  readonly showClearButton = input(false, {
    transform: booleanAttribute,
  });
}

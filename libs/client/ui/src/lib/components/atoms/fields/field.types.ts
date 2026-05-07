import type { Type } from "@angular/core";

export type FieldMode = "field" | "button";

export type FieldOptions =
  | string[]
  | {
      label: string;
      value: string;
      icon?: Type<unknown>;
      description?: string;
      color?: string;
      bgColor?: string;
    }[]
  | Record<string, string>;

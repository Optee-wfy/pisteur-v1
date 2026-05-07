import { Injectable } from "@angular/core";
import { isNotNullish } from "@optee/utils";
import type { z, ZodTypeAny } from "zod";

@Injectable({ providedIn: "root" })
export class LocalStorageService {
  set = (key: string, value: unknown) => {
    const isPrimitive = ["string", "boolean", "number"].includes(typeof value);
    const toStore: string = isPrimitive ? String(value) : JSON.stringify(value);
    localStorage.setItem(key, toStore);
  };

  private get = (key: string): unknown => {
    const content = localStorage.getItem(key);

    if (!content || !content.length) {
      return null;
    }

    try {
      return JSON.parse(content);
    } catch (e) {
      return content;
    }
  };

  safeGet = <Schema extends ZodTypeAny>(
    key: string,
    schema: Schema,
  ): z.infer<Schema> | null => {
    const value = this.get(key);

    if (isNotNullish(value)) {
      const parsed = schema.safeParse(value);

      if (!parsed.success) {
        console.error(
          "Une erreur est survenue lors de la récupération de l'objet: ",
          parsed.error,
        );

        return null;
      }

      return parsed.data;
    }

    return null;
  };

  check = (key: string) => !!localStorage.getItem(key);

  clear = (key: string) => localStorage.removeItem(key);

  setOrClear = (key: string, value: unknown) => {
    if (value !== null && value !== undefined) {
      this.set(key, value);
    } else {
      this.clear(key);
    }
  };
}

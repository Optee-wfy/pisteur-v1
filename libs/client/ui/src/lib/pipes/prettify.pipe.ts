import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";

const replacements: Record<string, string> = {
  "√©": "é",
  "√®": "è",
  "√à": "È",
  "√â": "Ê",
  "√¨": "ê",
  "√™": "î",
  "√´": "í",
  "√±": "ñ",
  "√§": "ç",
  "√£": "ã",
  "√¥": "å",
  "√¶": "ö",
  "√º": "ú",
  "√°": "à",
  "√¢": "â",
  "√»": "û",
};

const replacementPatterns = Object.entries(replacements).map(
  ([key, value]) => ({
    pattern: new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
    replacement: value,
  }),
);

function replaceChars(str: string): string {
  return replacementPatterns.reduce(
    (acc, { pattern, replacement }) => acc.replace(pattern, replacement),
    str,
  );
}

@Pipe({ name: "prettify", pure: true })
export class PrettifyPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return "";
    }
    try {
      const res = decodeURIComponent(value);

      const cleaned = replaceChars(res);

      return cleaned
        .split(" ")
        .map((word) => {
          const lower = word.toLowerCase();
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join(" ");
    } catch {
      return value;
    }
  }
}

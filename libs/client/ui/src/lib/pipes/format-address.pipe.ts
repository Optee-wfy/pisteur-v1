import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";

@Pipe({
  name: "formatAddress",
})
export class FormatAddressPipe implements PipeTransform {
  transform(addressInput: {
    streetNumber?: string | null;
    streetName?: string | null;
    zipcode?: string | null;
    city?: string | null;
    streetType?: string | null;
  }): string {
    const cityParts = [addressInput.zipcode, addressInput.city]
      .map((part) => part?.trim() ?? "")
      .filter((part) => part !== "")
      .join(" ");

    const rawStreetNumber = addressInput.streetNumber?.trim() ?? "";
    let streetName = addressInput.streetName?.trim() ?? "";
    let streetNumber: string | undefined = "";

    if (rawStreetNumber) {
      const [firstToken, ...restTokens] = rawStreetNumber.split(/\s+/);
      streetNumber = firstToken?.split(/[.,]/)[0];

      // Some providers send the whole address in streetNumber; recover the name if missing.
      if (!streetName && restTokens.length) {
        streetName = restTokens.join(" ");
      }
    }

    const streetParts = [
      streetNumber,
      addressInput.streetType?.trim(),
      streetName,
    ]
      .filter((part) => part && part.trim() !== "")
      .join(" ");

    return [streetParts, cityParts]
      .filter((part) => part && part.trim() !== "")
      .join(", ");
  }
}

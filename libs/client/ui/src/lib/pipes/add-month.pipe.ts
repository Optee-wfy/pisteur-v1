import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";

@Pipe({
  name: "addMonth",
})
export class AddMonthPipe implements PipeTransform {
  transform(value: Date, nbMonthsToAdd: number) {
    const newDate = new Date(value.getTime());
    newDate.setMonth(newDate.getMonth() + nbMonthsToAdd);
    return newDate;
  }
}

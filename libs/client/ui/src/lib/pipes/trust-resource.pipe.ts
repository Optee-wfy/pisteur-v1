import type { PipeTransform } from "@angular/core";
import { inject, Pipe } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
  name: "trustResource",
  pure: true,
})
export class TrustResourcePipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(path: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(path);
  }
}

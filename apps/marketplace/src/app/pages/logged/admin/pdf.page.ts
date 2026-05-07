import { ChangeDetectionStrategy, Component } from "@angular/core";
import { PdfGeneratorComponent } from "../../../components/pdf/pdf-generator.component";

@Component({
  selector: "mkp-admin-pdf-page",
  template: `
    <mkp-pdf-generator />
  `,
  imports: [PdfGeneratorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminPdfPageComponent {}

import type { OnInit } from "@angular/core";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "mkp-admin-index-page",
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminIndexPageComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Rediriger vers la page pro par défaut
    this.router.navigate(["/admin/pro"], { replaceUrl: true });
  }
}

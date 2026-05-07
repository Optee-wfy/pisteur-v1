import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { UserType } from "@optee/constants";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { map, shareReplay } from "rxjs";
import { AuthService } from "../../../services/auth.service";
import { ProService } from "../../../services/pro.service";
import { ProSelectComponent } from "../pro-select/pro-select.component";

@Component({
  selector: "mkp-pro-admin",
  host: {
    class: "flex flex-col gap-4",
  },
  template: `
    @let pro = proService.pro$ | async;
    <oui-bob class="flex-auto" heading="Pro actif">
      <div class="flex items-center justify-start gap-2">
        <mkp-pro-select />
        @if (pro?.status) {
          <button
            class="text-primary-700 hover:text-primary-800 underline"
            (click)="goToDashboard()"
          >
            Aller vers le dashboard pro
          </button>
        }
      </div>
      @if (proService.pro$ | async; as pro) {
        <div class="bg-primary-50 mt-4 rounded-lg p-4 text-gray-600">
          <h2 class="mt-3 font-bold">Description</h2>
          <p class="max-w-prose">"{{ pro.description }}"</p>

          <div class="flex gap-6">
            <div>
              <h2 class="mt-3 font-bold">Informations principales</h2>
              <ul class="list-inside list-disc pl-3">
                <li>
                  Nom: {{ pro.name }}

                  <a
                    class="text-primary-700 hover:text-primary-800 underline"
                    href="https://app-eu1.hubspot.com/contacts/144886321/record/2-130916544/{{
                      pro.id
                    }}/"
                    rel="noopener"
                    target="_blank"
                  >
                    [Ouvrir dans HubSpot]
                  </a>
                </li>
                <li>UUID: {{ pro.uuid }}</li>
                <li>Siren: {{ pro.siren }}</li>
                <li>Siret: {{ pro.siret }}</li>
                <li>Status: {{ pro.status ?? "Null" }}</li>
                <li>Mail contact: {{ pro.mailContact }}</li>
                <li>Téléphone contact: {{ pro.phoneContact }}</li>
                <li>
                  Éligibilité CEE: {{ pro.eligibilityCee ? "oui" : "non" }}
                </li>
              </ul>
            </div>
            <div>
              <h2 class="mt-3 font-bold">Prestations</h2>
              <ul class="list-inside list-disc pl-3">
                @for (prestation of proPrestations$ | async; track $index) {
                  <li>
                    {{ prestation }}
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
      }
    </oui-bob>
  `,
  imports: [AsyncPipe, ProSelectComponent, BobComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProAdminComponent {
  protected readonly proService = inject(ProService);
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  protected readonly ProType = UserType.PRO;

  proPrestations$ = this.proService.pro$.pipe(
    map((pro) => (pro?.prestations ?? "").split(";")),
    shareReplay(1),
  );

  goToDashboard() {
    this.authService.changeUserType(UserType.PRO);
    this.router.navigate(["/pro"]);
  }
}

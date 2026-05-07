import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { DialogService } from "@optee/dialog";
import { isNotNullish } from "@optee/utils";
import type { MenuItem } from "primeng/api";
import { MenubarModule } from "primeng/menubar";
import type { Observable } from "rxjs";
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  of,
  startWith,
} from "rxjs";
import { ImportLocationBdnbDialogComponent } from "../../../components/location/import-location-bdnb/import-location-bdnb.dialog";
import { AuthService } from "../../../services/auth.service";
import { ClientService } from "../../../services/client.service";
import { EnumService } from "../../../services/enum.service";
import { LocationService } from "../../../services/location.service";
import { ProService } from "../../../services/pro.service";

@Component({
  selector: "mkp-admin-page",
  host: {
    class: "h-full",
  },
  template: `
    <div class="flex flex-col-reverse gap-4 p-4 lg:flex-col xl:p-8">
      @if (tabs$ | async; as tabs) {
        <p-menubar class="sticky" [model]="tabs" />
      }

      <div class="flex-auto">
        <router-outlet />
      </div>
    </div>
  `,
  imports: [AsyncPipe, MenubarModule, RouterOutlet],
  providers: [EnumService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminPageComponent {
  protected readonly authService = inject(AuthService);
  protected readonly clientService = inject(ClientService);
  protected readonly proService = inject(ProService);
  protected readonly locationService = inject(LocationService);
  protected readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);
  protected readonly enumService = inject(EnumService);

  protected readonly clientName$ = this.clientService.self$.pipe(
    map((client) => client?.name),
    startWith("Loading..."),
    filter(isNotNullish),
    distinctUntilChanged(),
    catchError(() => of("Error loading client")),
  );

  protected readonly proName$ = this.proService.pro$.pipe(
    map((pro) => pro?.name),
    startWith("Loading..."),
    filter(isNotNullish),
    distinctUntilChanged(),
    catchError(() => of("Error loading pro")),
  );

  protected readonly tabs$: Observable<Array<MenuItem>> = combineLatest([
    this.clientName$,
    this.proName$,
  ]).pipe(
    map(([clientName, proName]) => {
      return [
        {
          label: `Client (${clientName})`,
          command: () => this.router.navigate(["/admin/client"]),
        },
        {
          label: `Pro (${proName})`,
          command: () => this.router.navigate(["/admin/pro"]),
        },
        {
          label: "Pros",
          command: () => this.router.navigate(["/admin/pros"]),
        },

        {
          label: "Marketplace",
          items: [
            {
              label: "Sites",
              items: [
                {
                  label: "Tous les sites",
                  command: () => this.router.navigate(["/admin/locations"]),
                },
                {
                  label: "Import CSV",
                  command: () => this.router.navigate(["/admin/csv-upload"]),
                },
              ],
            },
            {
              label: "Opérations",
              items: [
                {
                  label: "Types d'opérations",
                  command: () =>
                    this.router.navigate(["/admin/operation-types"]),
                },
                {
                  label: "Non synchronisées",
                  command: () => this.router.navigate(["/admin/unsynced"]),
                },
                {
                  label: "Sans prestations",
                  command: () =>
                    this.router.navigate(["/admin/operations/no-prestation"]),
                },
                {
                  label: "Sans estimation",
                  command: () =>
                    this.router.navigate(["/admin/operations/no-simulation"]),
                },
                {
                  label: "Recalculer estimation",
                  command: () =>
                    this.router.navigate(["/admin/operations/re-simulation"]),
                },
              ],
            },
            {
              label: "Devis",
              command: () => this.router.navigate(["/admin/quotes"]),
            },
          ],
        },
        {
          label: "Pisteur",
          items: [
            {
              label: "Personnes morales",
              command: () => this.router.navigate(["/admin/legal-entities"]),
            },
          ],
        },

        {
          label: "Contacts",
          items: [
            {
              label: "Partenaires",
              command: () => this.router.navigate(["/admin/contacts/pro"]),
            },
            {
              label: "Clients",
              command: () => this.router.navigate(["/admin/contacts/client"]),
            },
          ],
        },

        {
          label: "Outils",
          items: [
            {
              label: "Générateur de PDF",
              command: () => this.router.navigate(["/admin/pdf"]),
            },
            {
              label: "Simulation",
              command: () => this.router.navigate(["/admin/simulation"]),
            },
            {
              label: "Enums (dev)",
              command: () => this.enumService.showAllUnsyncedEnums(),
            },
            {
              label: "Importation de bâtiments BDNB (dev)",
              command: () =>
                this.dialogService.open(ImportLocationBdnbDialogComponent, {
                  disableClose: true,
                }),
            },
          ],
        },
      ];
    }),
  );
}

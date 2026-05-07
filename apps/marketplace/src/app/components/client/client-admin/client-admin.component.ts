import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { UserType } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import type { Location } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { map, shareReplay } from "rxjs";
import { AuthService } from "../../../services/auth.service";
import { ClientService } from "../../../services/client.service";
import { LocationService } from "../../../services/location.service";
import { OperationService } from "../../../services/operation.service";
import { LocationEditFormDialogComponent } from "../../location/location-form-dialog/location-edit-form-dialog.component";
import { LocationsGroupAdminComponent } from "../../location/locations-group-admin/locations-group-admin.component";
import { ClientSelectComponent } from "../client-select/client-select.component";

@Component({
  selector: "mkp-client-admin",
  host: {
    class: "flex flex-col gap-4",
  },
  template: `
    <oui-bob class="flex-auto" heading="Client actif">
      <div class="flex gap-2">
        <mkp-client-select />
        <button
          class="text-primary-700 hover:text-primary-800 underline"
          (click)="goToDashboard()"
        >
          Aller vers le dashboard client
        </button>
      </div>

      @if (clientService.self$ | async; as client) {
        <div class="bg-primary-50 mt-4 rounded-lg p-4 text-gray-600">
          <ul>
            <li>
              <strong>{{ client.name }}</strong>
              <a
                class="text-primary-700 hover:text-primary-800 underline"
                href="https://app-eu1.hubspot.com/contacts/144886321/record/2-130916146/{{
                  client.id
                }}/"
                rel="noopener"
                target="_blank"
              >
                [Ouvrir dans HubSpot]
              </a>
            </li>
            <li>UUID: {{ client.uuid }}</li>
            <li>Propriétaire: {{ client.ownerId }}</li>
            <li>
              <a
                class="text-primary-700 hover:text-primary-800 underline"
                href="https://supabase.com/dashboard/project/mtpdtpaupumtxmcipgde/editor/134194?schema=public&filter=clients_id:eq:{{
                  client.id
                }}"
                rel="noopener"
                target="_blank"
              >
                [DB] Tous les sites
              </a>
            </li>
            <li>
              <a
                class="text-primary-700 hover:text-primary-800 underline"
                href="https://supabase.com/dashboard/project/mtpdtpaupumtxmcipgde/editor/134202?schema=public&filter=client_id:eq:{{
                  client.id
                }}"
                rel="noopener"
                target="_blank"
              >
                [DB] Toutes les opérations
              </a>
            </li>
          </ul>
        </div>
      }
    </oui-bob>

    <oui-bob class="flex-auto" [heading]="(heading$ | async) ?? ''">
      <div class="flex items-center gap-2" aside>
        @if (locationsBdnbPrune$ | async; as locationsBdnbPrune) {
          @if (locationsBdnbPrune.length > 0) {
            <oui-button
              variant="litePrimary"
              (click)="updateBdnb(locationsBdnbPrune)"
            >
              Enrichir {{ locationsBdnbPrune.length }} adresses avec la BDNB
            </oui-button>
          }
        }
      </div>

      <mkp-locations-group-admin
        theme="green"
        (locationClick)="openAddLocationModal($event)"
        [locations]="(locationsBdnbPruneAndBlocked$ | async) ?? []"
        [rowsPerPage]="50"
        [visibleColumns]="[
          'bdnbFailureEmoji',
          'surfaceArea',
          'facadeArea',
          'glazingArea',
          'nbStoreys',
          'nbUnits',
          'nbBuildings',
          'mainSector',
          'climateZone',
        ]"
      />
    </oui-bob>
  `,
  imports: [
    AsyncPipe,
    ButtonComponent,
    ClientSelectComponent,
    LocationsGroupAdminComponent,
    BobComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAdminComponent {
  protected readonly clientService = inject(ClientService);
  protected readonly operationService = inject(OperationService);
  protected readonly locationService = inject(LocationService);
  protected readonly dialogService = inject(DialogService);
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  protected readonly ClientType = UserType.CLIENT;

  locationsBdnbPruneAndBlocked$ = this.locationService.allForClient$.pipe(
    map((locations) =>
      locations.filter(
        (location) => location.needsBdnbCheck || location.bdnbFailure,
      ),
    ),
    shareReplay(1),
  );

  locationsBdnbPrune$ = this.locationService.allForClient$.pipe(
    map((locations) => locations.filter((location) => location.needsBdnbCheck)),
    shareReplay(1),
  );

  heading$ = this.locationsBdnbPruneAndBlocked$.pipe(
    map((locations) => `Sites sans données BDNB (${locations.length})`),
  );

  openAddLocationModal(location: Location) {
    this.dialogService.open(LocationEditFormDialogComponent, {
      data: { location, mode: "edit" },
    });
  }

  async updateBdnb(locations: Location[]) {
    await this.locationService.showBdnbLoader(locations);
    this.locationService.refresh();
  }

  goToDashboard() {
    this.authService.changeUserType(UserType.CLIENT);
    this.router.navigate(["/client"]);
  }
}

import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { DialogService } from "@optee/dialog";
import type { LocationUuid } from "@optee/models";
import { Location, simulateOperationsFromLocation } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import { InputText } from "primeng/inputtext";
import { catchError, filter, map, of, Subject, switchMap, tap } from "rxjs";
import trpcClient from "../../../trpc-client";
import { AppService } from "../../services/app.service";
import { handleError } from "../../utils/handleTRPCError";
import { LocationBdnbComponent } from "../location/location-bdnb/location-bdnb.component";
import { OperationsGroupComponent } from "../operation/operations-group/operations-group.component";
import { SimulatedLocationGeneratorComponent } from "./simulated-location-generator/simulated-location-generator.component";

@Component({
  selector: "mkp-simulator-admin",
  host: {
    class: "flex items-start justify-center gap-4 p-4 xl:p-10",
  },
  template: `
    @let location = location$ | async;

    <aside
      class="shadow-o bg-primary-700 sticky top-0 h-full w-[350px] shrink-0 overflow-y-auto overflow-x-hidden rounded-3xl p-6 text-white"
    >
      <mkp-location-bdnb [location]="location">
        <div class="grid grid-cols-3 gap-4">
          <input
            class="col-span-1"
            pInputText
            placeholder="Numéro"
            (keydown.enter)="enterKey$.next()"
            [formControl]="streetNumber"
          />
          <input
            class="col-span-2"
            pInputText
            placeholder="Rue"
            (keydown.enter)="enterKey$.next()"
            [formControl]="streetName"
          />
          <input
            class="col-span-1"
            pInputText
            placeholder="Code postal"
            (keydown.enter)="enterKey$.next()"
            [formControl]="zipcode"
          />
          <input
            class="col-span-2"
            pInputText
            placeholder="Ville"
            (keydown.enter)="enterKey$.next()"
            [formControl]="city"
          />
        </div>
      </mkp-location-bdnb>
    </aside>

    <div class="flex max-w-screen-xl flex-auto flex-col gap-6">
      <oui-bob heading="Simulateur">
        <div class="flex gap-4" aside>
          @if (location && location.rawBdnb?.batiment_groupe_id) {
            <oui-button
              variant="primary"
              [href]="
                'https://particulier.gorenove.fr/map?bnb_id=' +
                location.rawBdnb?.batiment_groupe_id
              "
            >
              Ouvrir dans GoRenove
            </oui-button>
          }

          <oui-button variant="outline" (click)="launchSimulation()">
            Simulation Marketing
          </oui-button>
        </div>

        <div class="flex flex-col gap-4">
          <oui-title-tight>Opérations disponibles</oui-title-tight>

          <mkp-operations-group
            preventSimulation
            [actions]="[]"
            [operations]="(operations$ | async) ?? []"
            [rowsPerPage]="100"
            [visibleColumns]="[
              'score',
              'sortableCost',
              'sortableFunding',
              'sortableRemainingAmount',
              'estimatedEnergyImpact',
            ]"
          />
        </div>
      </oui-bob>
    </div>
  `,
  imports: [
    AsyncPipe,
    BobComponent,
    InputText,
    TitleTightComponent,
    ReactiveFormsModule,
    ButtonComponent,
    LocationBdnbComponent,
    OperationsGroupComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorAdminComponent {
  protected readonly appService = inject(AppService);
  protected readonly toastService = inject(ToastService);
  protected readonly dialogService = inject(DialogService);

  streetNumber = new FormControl("");
  streetName = new FormControl("", {
    nonNullable: true,
    validators: [Validators.required],
  });

  city = new FormControl("", {
    nonNullable: true,
    validators: [Validators.required],
  });

  zipcode = new FormControl("", {
    nonNullable: true,
    validators: [Validators.required],
  });

  enterKey$ = new Subject<void>();

  address$ = this.enterKey$.pipe(
    map(() =>
      Location.makeAddress({
        streetNumber: this.streetNumber.getRawValue(),
        streetName: this.streetName.getRawValue(),
        city: this.city.getRawValue(),
        zipcode: this.zipcode.getRawValue(),
      }),
    ),
  );

  bdnbData$ = this.address$.pipe(
    tap(() => this.appService.isLoading.set(true)),
    switchMap((address) => trpcClient.locations.getBdnbData.query({ address })),
    catchError(() => of(null)),
    tap(() => this.appService.isLoading.set(false)),
    filter(isNotNullish),
    map((res) => ({ ...res.formattedData, rawBdnb: res.rawData })),
  );

  location$ = this.bdnbData$.pipe(
    map((bdnbData) =>
      Location.init({
        uuid: "1" as LocationUuid,
        streetNumber: this.streetNumber.getRawValue(),
        streetName: this.streetName.getRawValue(),
        city: this.city.getRawValue(),
        zipcode: this.zipcode.getRawValue(),
        name: "",
        ...bdnbData,
      }),
    ),
  );

  operations$ = this.location$.pipe(
    filter(isNotNullish),
    map((location) => simulateOperationsFromLocation(location)),
    handleError(this.toastService, "Création des opérations", []),
  );

  launchSimulation() {
    this.dialogService.open(SimulatedLocationGeneratorComponent);
  }
}

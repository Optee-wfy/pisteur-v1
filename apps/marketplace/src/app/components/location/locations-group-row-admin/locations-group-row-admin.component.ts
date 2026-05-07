import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from "@angular/core";
import type { XFactorParams } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import { Location } from "@optee/models";
import { ToastService } from "@optee/ui/services/toast.service";
import { observeSize } from "@optee/ui/utils/observers/observe-size";
import { ProgressBarModule } from "primeng/progressbar";
import { TooltipModule } from "primeng/tooltip";
import { combineLatest, distinctUntilChanged, map } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { AuthService } from "../../../services/auth.service";
import { OperationService } from "../../../services/operation.service";
import { PermissionService } from "../../../services/permission.service";
import { LocationBdnbPillComponent } from "../location-bdnb/location-bdnb-row-pill/location-bdnb-row-pill.component";
import { LocationEditFormDialogComponent } from "../location-form-dialog/location-edit-form-dialog.component";

export type LocationListColumn = Extract<
  keyof Location,
  "bdnbFailureEmoji" | keyof XFactorParams
>;

@Component({
  selector: "mkp-locations-group-row-admin",
  host: {
    class: "table-row align-middle border border-gray-300 last:round-b-lg",
  },
  template: `
    <td class="text-primary-900 text-sm">
      <div class="truncate font-semibold">
        {{ location().shortAddress }}
      </div>

      {{ location().zipcode }}
      {{ location().city }}
    </td>

    @if (visibleColumns().includes("bdnbFailureEmoji")) {
      <td class="text-sm">
        {{ location().bdnbFailureEmoji }}
      </td>
    }

    @if (visibleColumns().includes("surfaceArea")) {
      <td class="relative" #tdSurfaceArea>
        @if (location().needsBdnbCheck) {
          <div
            class="simulator"
            (click)="updateBdnb()"
            [style.width.px]="simulationW$ | async"
          >
            Analyser le site
          </div>
        } @else if (location().bdnbFailure) {
          <div
            class="simulator missingData"
            (click)="editLocation()"
            [style.width.px]="simulationW$ | async"
          >
            <strong>Simulation impossible.</strong>
            Adresse non reconnue
          </div>
        }

        <mkp-location-bdnb-pill
          key="surfaceArea"
          pipe="roundedNumber"
          suffix="m²"
          variant="blue-white"
          [location]="location()"
          [variantNC]="variantNC()"
        />
      </td>
    }

    @if (visibleColumns().includes("facadeArea")) {
      <td #facadeArea>
        <mkp-location-bdnb-pill
          key="facadeArea"
          pipe="roundedNumber"
          suffix="m²"
          variant="blue-white"
          [location]="location()"
          [variantNC]="variantNC()"
        />
      </td>
    }

    @if (visibleColumns().includes("glazingArea")) {
      <td #glazingArea>
        <mkp-location-bdnb-pill
          key="glazingArea"
          pipe="roundedNumber"
          suffix="m²"
          variant="blue-white"
          [location]="location()"
          [variantNC]="variantNC()"
        />
      </td>
    }

    @if (visibleColumns().includes("nbStoreys")) {
      <td #nbStoreys>
        <mkp-location-bdnb-pill
          key="nbStoreys"
          pipe="roundedNumber"
          variant="blue-white"
          [location]="location()"
          [variantNC]="variantNC()"
        />
      </td>
    }

    @if (visibleColumns().includes("nbUnits")) {
      <td #nbUnits>
        <mkp-location-bdnb-pill
          key="nbUnits"
          pipe="roundedNumber"
          variant="blue-white"
          [location]="location()"
          [variantNC]="variantNC()"
        />
      </td>
    }

    @if (visibleColumns().includes("nbBuildings")) {
      <td #nbBuildings>
        <mkp-location-bdnb-pill
          key="nbBuildings"
          pipe="roundedNumber"
          variant="blue-white"
          [location]="location()"
          [variantNC]="variantNC()"
        />
      </td>
    }

    @if (visibleColumns().includes("mainSector")) {
      <td #mainSector>
        {{ location().mainSector }}
      </td>
    }

    @if (visibleColumns().includes("climateZone")) {
      <td #climateZone>
        {{ location().climateZone }}
      </td>
    }
  `,
  styles: `
    .simulator {
      @apply font-display absolute inset-3 left-0 z-10 flex cursor-pointer select-none items-center justify-center gap-2 rounded-lg border border-transparent p-3 text-sm transition-opacity;

      :host:not(:hover) &:not(.isSimulating) {
        @apply opacity-0;
      }

      &:not(.missingData) {
        @apply text-primary-700 bg-gray-100;
      }

      &.missingData {
        @apply bg-red-100 text-red-500;
      }
    }

    td {
      @apply p-4;
    }
  `,
  imports: [
    TooltipModule,
    LocationBdnbPillComponent,
    ProgressBarModule,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsGroupRowAdminComponent {
  location = model.required<Location>();
  visibleColumns = input.required<LocationListColumn[]>();

  tdSurfaceArea = viewChild<ElementRef>("tdSurfaceArea");
  tdFacadeArea = viewChild<ElementRef>("facadeArea");
  tdGlazingArea = viewChild<ElementRef>("glazingArea");
  tdNbStoreys = viewChild<ElementRef>("nbStoreys");
  tdNbUnits = viewChild<ElementRef>("nbUnits");
  tdNbBuildings = viewChild<ElementRef>("nbBuildings");

  protected readonly el = inject(ElementRef);
  protected readonly dialogService = inject(DialogService);
  protected readonly toastService = inject(ToastService);
  protected readonly operationService = inject(OperationService);
  protected readonly authService = inject(AuthService);
  protected readonly permissionService = inject(PermissionService);

  isSimulating = signal(false);

  variantNC = computed(() =>
    this.location().bdnbFailure ? "red-white" : "grey-black",
  );

  simulationW$ = combineLatest([
    observeSize(this.tdSurfaceArea, "width"),
    observeSize(this.tdFacadeArea, "width"),
    observeSize(this.tdGlazingArea, "width"),
    observeSize(this.tdNbStoreys, "width"),
    observeSize(this.tdNbUnits, "width"),
    observeSize(this.tdNbBuildings, "width"),
  ]).pipe(
    map((widths) => widths.reduce((acc, width) => acc + width, 0)),
    distinctUntilChanged(),
  );

  async updateBdnb() {
    const actionAttempted = "Analyse du site";

    try {
      const res = await trpcClient.locations.updateBdnbData.mutate({
        uuid: this.location().uuid,
      });

      const updatedLocation = Location.init(res.updatedLocation);
      if (!updatedLocation) {
        throw new Error("Impossible de mettre à jour le site");
      }

      this.location.set(updatedLocation);

      this.toastService.open(
        "success",
        actionAttempted,
        "Les données du site ont été mises à jour",
      );
    } catch (e) {
      const updatedHsLocations =
        await trpcClient.locations.markAsBdnbFailure.mutate({
          uuid: this.location().uuid,
        });

      const updatedHsLocation = updatedHsLocations[0];

      const updatedLocation = updatedHsLocation
        ? Location.init(updatedHsLocation)
        : null;

      if (!updatedLocation) {
        throw new Error("Impossible de mettre à jour le site");
      }

      this.location.set(updatedLocation);

      this.toastService.open(
        "error",
        actionAttempted,
        "L'adresse du site n'a pas pu être analysée",
      );
    }
  }

  async editLocation() {
    if (!this.authService.isAdminOptee()) {
      return;
    }

    await this.dialogService.open(LocationEditFormDialogComponent, {
      data: { location: this.location(), mode: "edit" },
    });
  }
}

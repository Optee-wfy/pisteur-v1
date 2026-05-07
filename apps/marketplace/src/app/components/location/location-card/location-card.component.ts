import { DatePipe } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { LOCATION_SECTORS } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import { IconArrowComponent, IconUpdateComponent } from "@optee/icons";
import type { Location } from "@optee/models";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { PillComponent } from "@optee/ui/components/atoms/pill/pill/pill.component";
import { CapitalizePipe } from "@optee/ui/pipes/capitalize.pipe";
import { TooltipModule } from "primeng/tooltip";
import { LocationService } from "../../../services/location.service";
import { OperationService } from "../../../services/operation.service";
import { LocationEditFormDialogComponent } from "../location-form-dialog/location-edit-form-dialog.component";

@Component({
  selector: "mkp-location-card",
  host: {
    class:
      "flex flex-col md:flex-row rounded-2xl border bg-white border-gray-100 overflow-hidden shadow-o",
  },
  template: `
    <div class="relative shrink-0 cursor-pointer">
      <!-- Don't remove width and height as it allows the browser to properly prepare the space before it loads -->
      <img
        class="bg-primary-100 w-full object-cover md:h-full md:w-60"
        alt="Image street view du bâtiment"
        height="300"
        width="600"
        [src]="location().streetViewUrl"
      />

      @if (operationsCount(); as operationCount) {
        <oui-pill
          class="absolute left-2 top-2 cursor-pointer"
          variant="white-blue"
        >
          {{ operationCount }}
          {{ operationCount > 1 ? "opérations" : "opération" }}
        </oui-pill>
      }

      <oui-dpe-label
        class="absolute bottom-2 right-2"
        variant="rounded-square"
        [letter]="location().dpeLabel || '?'"
      />
    </div>

    <div class="flex w-full flex-col items-start gap-4 p-4">
      <div class="flex w-full justify-between">
        <div class="flex cursor-pointer flex-col">
          <span class="font-display text-lg font-semibold leading-7">
            {{ location().shortAddress }}
          </span>
          <span class="text-sm leading-5 text-gray-600">
            {{ location().zipcode }} {{ location().city }}
          </span>
        </div>
        <div class="flex gap-2">
          @if (editable()) {
            <oui-button-icon
              pTooltip="Modifier les données de mon site"
              tooltipPosition="top"
              (click)="openAddLocationModal($event)"
            >
              <icon-update class="size-5" colorMode="colored" />
            </oui-button-icon>
          }

          <oui-button-icon
            pTooltip="Accéder aux données détaillées du bâtiment"
            tooltipPosition="top"
            (click)="
              $event.stopPropagation(); locationService.showPanel(location())
            "
          >
            <icon-arrow class="size-4" colorMode="colored" />
          </oui-button-icon>
        </div>
      </div>

      <div class="font-display flex flex-wrap gap-2 font-medium">
        <oui-pill variant="grey-black">
          {{ location().energyType | capitalize }}
        </oui-pill>
        <oui-pill variant="grey-black">
          {{ location().heatingSystem | capitalize }}
        </oui-pill>
        <oui-pill variant="grey-black">
          {{ location().heatingType | capitalize }}
        </oui-pill>
      </div>

      <div class="flex w-full items-center gap-6 lg:flex-row">
        <div class="flex flex-col">
          <span class="truncate">Catégorie d’usage</span>
          <span class="text-gray-600">
            {{ location().mainSectorLabel }}
          </span>
        </div>

        <div class="flex flex-col">
          <span class="truncate">Emprise au sol</span>
          <span class="text-gray-600">{{ location().surfaceArea }}m2</span>
        </div>

        <div class="flex flex-col">
          <span class="truncate">Année</span>
          <span class="text-gray-600">
            {{ location().creationDate | date: "yyyy" }}
          </span>
        </div>
      </div>
    </div>
  `,
  imports: [
    DpeLabelComponent,
    DatePipe,
    PillComponent,
    IconUpdateComponent,
    IconArrowComponent,
    ButtonIconComponent,
    TooltipModule,
    CapitalizePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationCardComponent {
  readonly location = input.required<Location>();
  readonly editable = input(false, { transform: booleanAttribute });

  protected readonly operationService = inject(OperationService);
  protected readonly dialogService = inject(DialogService);
  protected readonly locationService = inject(LocationService);

  protected readonly sectorList = LOCATION_SECTORS;

  private readonly allOperations = toSignal(this.operationService.all$);

  protected readonly operationsCount = computed(() => {
    return (this.allOperations() ?? []).filter(
      (row) =>
        row.operation.location.uuid === this.location().uuid &&
        row.operation.isInProgress,
    ).length;
  });

  protected openAddLocationModal(e: Event) {
    e.stopPropagation();

    this.dialogService.open(LocationEditFormDialogComponent, {
      data: { location: this.location(), mode: "edit" },
    });
  }
}

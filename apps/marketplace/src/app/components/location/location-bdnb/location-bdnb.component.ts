import { animate, style, transition, trigger } from "@angular/animations";
import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  signal,
} from "@angular/core";
import type { XFactorsKey } from "@optee/constants";
import { IconChevronRightComponent, IconLocationComponent } from "@optee/icons";

import { isOpteeLocation, Location } from "@optee/models";

import { InputNumber } from "primeng/inputnumber";
import trpcClient from "../../../../trpc-client";
import { LocationBdnbCategoryIconComponent } from "./location-bdnb-category-icon/location-bdnb-category-icon.component";
import { LocationBdnbPillComponent } from "./location-bdnb-row-pill/location-bdnb-row-pill.component";
import { LocationBdnbRowComponent } from "./location-bdnb-row/location-bdnb-row.component";
import { OPTEE_BDNB_PROP_CONFIG } from "./location-bdnb.constant";
import type {
  BdnbPropConfig,
  BdnbPropertyCategory,
  BdnbPropertyCategoryKey,
  LocationBdnbProperty,
} from "./location-bdnb.type";

@Component({
  selector: "mkp-location-bdnb",
  host: {
    class: "flex flex-col gap-6",
  },
  template: `
    <!-- Informations de l'Adresse -->
    @if (!hideAddress()) {
      <div class="flex flex-col items-start gap-4" [@fadeIn]>
        <div class="op-category">
          <icon-location class="size-6" colorMode="semi" />
          Adresse du site
        </div>
        <ng-content />
      </div>
    }

    @let loc = location();

    <!-- ----------------------- CARACTÉRISTIQUES ----------------------- -->
    @for (section of bdnbProperties(); track section.key) {
      <div
        class="flex flex-col gap-4 {{
          theme() === 'dark' ? 'text-white' : 'text-primary-700'
        }}"
        [@fadeIn]
      >
        <div class="op-category" (click)="toggleCategory(section.key)">
          <mkp-location-bdnb-category-icon [category]="section.key" />
          {{ section.label }}
          <icon-chevron-right
            class="ml-auto size-4"
            [class.rotate-90]="section.isOpen"
          />
        </div>

        @if (section.isOpen) {
          <div class="flex flex-col gap-1">
            @for (cfg of section.properties; track cfg.key) {
              <mkp-location-bdnb-row
                [isHighlighted]="isHighlighted(cfg)"
                [label]="cfg.label"
                [theme]="theme()"
              >
                @if (loc) {
                  <mkp-location-bdnb-pill
                    [canUpdate]="cfg.editable && canUpdate()"
                    [inputType]="cfg.inputType"
                    [key]="cfg.key"
                    [location]="loc"
                    [pipe]="cfg.pipe"
                    [suffix]="cfg.suffix"
                    [variant]="
                      theme() === 'dark' ? 'trans-white' : 'blue-white'
                    "
                    [variantNC]="
                      theme() === 'dark' ? 'trans-white' : 'grey-black'
                    "
                  />
                } @else {
                  <ng-container *ngTemplateOutlet="noLocation" />
                }
              </mkp-location-bdnb-row>
            }
          </div>
        }
      </div>
    }

    <!-- Skeleton partagé -->
    <ng-template #noLocation>
      <p-inputnumber
        class="p-input-pill p-input-pill-nobg w-36 lg:w-48"
        fluid
        size="small"
        [disabled]="true"
      />
    </ng-template>

    <ng-template #categoryIcon let-section>
      {{ section.label }}
    </ng-template>
  `,
  imports: [
    LocationBdnbRowComponent,
    InputNumber,
    LocationBdnbPillComponent,
    NgTemplateOutlet,
    IconLocationComponent,
    IconChevronRightComponent,
    LocationBdnbCategoryIconComponent,
  ],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("0.3s", style({ opacity: 1 })),
      ]),
    ]),
  ],
  styles: `
    .op-category {
      @apply font-display flex cursor-pointer select-none items-center gap-2 text-sm font-medium;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationBdnbComponent {
  readonly location = model.required<Location | null>();
  readonly hideAddress = input(false, { transform: booleanAttribute });
  readonly shownProps = input<LocationBdnbProperty[]>([]);
  readonly canUpdate = input(false, { transform: booleanAttribute });
  readonly highlightXFactors = input<XFactorsKey[]>([]);
  readonly theme = input<"dark" | "light">("dark");

  protected readonly openBdnbCategories = signal<BdnbPropertyCategoryKey[]>([
    "characteristics",
  ]);

  protected readonly bdnbProperties = computed(() => {
    const shownProps = this.shownProps();
    return OPTEE_BDNB_PROP_CONFIG.map((cfg) => {
      if (shownProps.length > 0) {
        cfg.properties = cfg.properties.filter((prop) =>
          shownProps.includes(prop.key),
        );
      }
      return {
        ...cfg,
        isOpen: this.openBdnbCategories().includes(cfg.key),
      };
    });
  });

  private readonly needUpdateBdnb = computed(() => {
    const loc = this.location();
    if (!loc) {
      return false;
    }

    const defined = this.bdnbProperties()
      .filter(
        (section) =>
          section.key !== "characteristics" && section.key !== "energy",
      )
      .map((section) => section.properties)
      .flat()
      .find((prop) => !!loc[prop.key]);

    return !defined && !this.fetchedBdnb();
  });

  private readonly fetchedBdnb = signal(false);

  private readonly refreshBdnData = effect(async () => {
    const location = this.location();
    if (!this.needUpdateBdnb() || !location || !isOpteeLocation(location)) {
      return;
    }
    // If the location is fetched and needs an update, we can trigger a refresh
    try {
      const bdnb = await trpcClient.locations.getBdnbData.query({
        address: location.address,
        lat: location.latitude,
        lng: location.longitude,
      });
      this.fetchedBdnb.set(true);
      const updated = Location.init({
        ...location,
        ...(bdnb?.formattedData ?? {}),
        creationDate: location.creationDate?.toISOString(),
        name: location.name ?? "",
      });
      this.location.set(updated);
    } catch (error) {
      console.error("Error fetching BDNB data:", error);
    } finally {
      this.fetchedBdnb.set(true);
    }
  });

  protected isHighlighted = (cfg: BdnbPropConfig) =>
    !!cfg.highlight && this.highlightXFactors().includes(cfg.highlight);

  protected toggleCategory(category: BdnbPropertyCategory["key"]) {
    if (this.openBdnbCategories().includes(category)) {
      this.openBdnbCategories.set(
        this.openBdnbCategories().filter((c) => c !== category),
      );
    } else {
      this.openBdnbCategories.set([...this.openBdnbCategories(), category]);
    }
  }
}

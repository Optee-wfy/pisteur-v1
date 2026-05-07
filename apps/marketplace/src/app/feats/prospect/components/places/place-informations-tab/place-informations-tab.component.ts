import { NgTemplateOutlet } from "@angular/common";
import { httpResource } from "@angular/common/http";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  resource,
} from "@angular/core";
import type { BdnbApiResponse } from "@optee/constants";
import {
  apiBdnbDPEUrl,
  apiBdnbUrl,
  buildAssetUrl,
  CONTACT_CONNECTION_COST,
  normalizeBdnbApiResponse,
} from "@optee/constants";
import {
  IconChevronRightComponent,
  IconCompanyComponent,
  IconLocationPinComponent,
} from "@optee/icons";
import { ExternalLocation } from "@optee/models";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { FormatAddressPipe } from "@optee/ui/pipes/format-address.pipe";
import z from "zod";
import { trpcClient } from "../../../../../../trpc-client";
import { EnedisDataGridComponent } from "../../enedis-data-grid/enedis-data-grid.component";
import { EnedisDataService } from "../../enedis-data-grid/enedis-data.service";
import { PillCreditsComponent } from "../../pill-credits/pill-credits.component";
import { PlaceDataGridComponent } from "../../place-data-grid/place-data-grid.component";
import { EXTERNAL_BDNB_PROP_CONFIG } from "../../place-data-grid/place-props.constant";
import { SolicitationIndicatorComponent } from "../../solicitation-indicator/solicitation-indicator.component";

const BdnbEfResponseSchema = z.array(
  z.object({
    batiment_groupe_id: z.string().nullish(),
    conso_5_usages_ef_m2: z.preprocess(
      (v) => (v === "" ? null : v),
      z.coerce.number().nullish(),
    ),
  }),
);

type BdnbEfResponse = z.infer<typeof BdnbEfResponseSchema>;

@Component({
  selector: "mkp-place-informations-tab",
  template: `
    <ng-template #propsList>
      @if (hasDataChanged()) {
        <oui-message class="w-full max-w-xl" severity="info" [showIcon]="false">
          <span [class.text-sm]="compact()">{{ dataHasChangedMessage() }}</span>
        </oui-message>
      }
      @for (category of BDNB_PROP_CONFIG; track category.key) {
        <mkp-place-data-grid
          class="w-full lg:max-w-xl"
          [category]="category"
          [compact]="compact()"
          [compareLocation]="placeLatestDataFormatted()"
          [consumptionEfM2]="consumptionEfM2()"
          [location]="place()"
          [variant]="variant()"
        />
      }
    </ng-template>

    @switch (displayMode()) {
      @case ("dashboard") {
        <section
          class="flex max-w-screen-xl flex-wrap-reverse gap-6 p-4"
          style="align-items: start;"
        >
          <!-- Data columns -->
          <div
            class="flex h-full min-w-96 flex-col items-start justify-start gap-4 overflow-y-auto pr-2 lg:mr-auto lg:flex-1"
          >
            <ng-container *ngTemplateOutlet="propsList" />
          </div>

          <div class="flex max-w-lg flex-1 flex-col gap-4">
            <mkp-solicitation-indicator
              displayMode="message"
              entityType="building"
              [count]="solicitationCount()"
            />

            <!-- Street View -->
            @if (place().streetViewUrl) {
              <article class="w-full">
                <h2 class="mb-4 flex items-center gap-2">
                  <div
                    class="bg-granite-100 flex size-5 items-center justify-center rounded-lg"
                  >
                    <icon-location-pin
                      class="text-granite-700 size-2 text-sm font-medium"
                    />
                  </div>
                  <span class="text-granite-900 text-sm font-medium">
                    {{ place() | formatAddress }}
                  </span>
                </h2>
                <img
                  class="w-full rounded-lg object-fill"
                  [alt]="'Vue de ' + (place() | formatAddress)"
                  [src]="streetView()"
                  [style.height.px]="streetViewHeight"
                />
              </article>
            }

            <!-- Entreprises -->
            <div class="flex flex-col gap-4">
              <section
                class="pister-link !justify-between capitalize"
                (click)="goToLegalEntities.emit()"
              >
                <div class="flex items-center gap-2">
                  <icon-company
                    class="size-4 rounded-[4px] bg-green-200 p-[3px] text-green-600"
                  />
                  <span class="text-granite-900 text-sm font-medium">
                    Entreprises
                  </span>
                </div>

                @if (legalEntitiesCount()) {
                  <button class="flex items-center gap-2">
                    @if (
                      hasAccessToLocation.status() === "resolved" &&
                      !hasAccessToLocation.value()
                    ) {
                      <mkp-pill-credits [credits]="CONTACT_CONNECTION_COST" />
                    }
                    <span
                      class="text-granite-900 flex items-center gap-2 text-sm font-medium"
                    >
                      {{ legalEntitiesCount() }}
                      <icon-chevron-right class="size-3" />
                    </span>
                  </button>
                }
              </section>

              <mkp-enedis-data-grid [variant]="variant()" />
            </div>
          </div>
        </section>
      }
      @case ("panel") {
        <section class="mx-auto flex w-full flex-col items-center gap-6">
          <ng-container *ngTemplateOutlet="propsList" />

          <mkp-enedis-data-grid [isOpen]="enedisOpen()" [variant]="variant()" />
        </section>
      }
    }
  `,
  imports: [
    EnedisDataGridComponent,
    FormatAddressPipe,
    IconChevronRightComponent,
    IconCompanyComponent,
    IconLocationPinComponent,
    SolicitationIndicatorComponent,
    MessageComponent,
    PillCreditsComponent,
    PlaceDataGridComponent,
    NgTemplateOutlet,
  ],
  providers: [EnedisDataService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceInformationsTabComponent {
  readonly place = input.required<ExternalLocation>();
  readonly legalEntitiesCount = input<number>();
  readonly solicitationCount = input<number | null>(null);
  readonly enedisOpen = input(true);

  readonly displayMode = input<"dashboard" | "panel">("dashboard");
  readonly compact = input(false, { transform: booleanAttribute });
  readonly variant = input<"default" | "colored">("default");

  readonly goToLegalEntities = output<void>();

  protected readonly BDNB_PROP_CONFIG = EXTERNAL_BDNB_PROP_CONFIG;
  protected readonly CONTACT_CONNECTION_COST = CONTACT_CONNECTION_COST;
  protected readonly streetViewHeight = 266;
  protected readonly streetViewWidth = 472;

  private readonly enedisData = inject(EnedisDataService);

  private readonly syncEnedisLocation = effect(() => {
    this.enedisData.setLocationUuid(this.place().uuid);
  });

  protected readonly locationGroupId = computed(() => this.place().batimentId);

  protected readonly streetView = computed(() => {
    const place = this.place();
    if (place?.streetViewUrl) {
      return place.streetViewUrl;
    }
    return buildAssetUrl("batiment.png");
  });

  protected readonly hasAccessToLocation = resource({
    params: () => this.place()?.uuid,
    loader: async ({ params }) => {
      if (!params) {
        return false;
      }
      return trpcClient.pros.hasAccessToLocationBdnb.query(params);
    },
  });

  protected readonly hasDataChanged = computed(() => {
    const place = this.place();
    const latestPlace = this.placeLatestDataFormatted();
    if (!place || !latestPlace) {
      return false;
    }

    const fieldsToCompare = this.BDNB_PROP_CONFIG.flatMap((category) =>
      category.properties.map((prop) => prop.key),
    );

    return fieldsToCompare.some((field) => {
      const placeValue = place[field];
      const latestValue = latestPlace[field];

      return JSON.stringify(placeValue) !== JSON.stringify(latestValue);
    });
  });

  protected readonly dataHasChangedMessage = computed(() => {
    return `Données vérifiées le ` + new Date().toLocaleDateString() + `.`;
  });

  protected readonly placeLatestData = httpResource<BdnbApiResponse[]>(() =>
    this.locationGroupId()
      ? apiBdnbUrl + this.locationGroupId() + "&limit=1"
      : undefined,
  );

  protected readonly placeLatestDataFormatted = computed(() => {
    if (this.placeLatestData.error()) {
      console.warn(
        "Erreur lors de la récupération des dernières données BDNB sur le bâtiment ",
        this.place().uuid,
        "avec batiment_groupe_id ",
        this.locationGroupId(),
        this.placeLatestData.error(),
      );
      return null;
    }

    const latestData = this.placeLatestData.value();
    // Do not log while the resource is still loading; wait until it has settled.
    if (!this.placeLatestData.hasValue()) {
      return null;
    }

    const data = latestData?.[0];
    if (!data) {
      console.warn(
        "Erreur lors de la récupération des dernières données BDNB sur le bâtiment ",
        this.place().uuid,
        "avec batiment_groupe_id ",
        this.locationGroupId(),
      );
      return null;
    }
    const batimentBdnb = normalizeBdnbApiResponse(data);
    return ExternalLocation.init(batimentBdnb);
  });

  protected readonly bdnbEfConsumption = httpResource<BdnbEfResponse>(
    () => {
      const bdnbId = this.locationGroupId();
      if (!bdnbId) {
        return undefined;
      }
      return `${apiBdnbDPEUrl}${bdnbId}&limit=1&select=batiment_groupe_id,conso_5_usages_ef_m2`;
    },
    {
      parse: (value) => this.parseBdnbEfResponse(value),
      defaultValue: [],
    },
  );

  protected readonly consumptionEfM2 = computed(() => {
    return this.bdnbEfConsumption.value()?.[0]?.conso_5_usages_ef_m2 ?? null;
  });

  private parseBdnbEfResponse(value: unknown): BdnbEfResponse {
    const parsed = BdnbEfResponseSchema.safeParse(value);
    if (parsed.success) {
      return parsed.data;
    }
    console.warn("Invalid BDNB EF response shape", parsed.error);
    return [];
  }
}

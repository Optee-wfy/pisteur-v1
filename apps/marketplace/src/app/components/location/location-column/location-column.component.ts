import { NgxGpAutocompleteModule } from "@angular-magic/ngx-gp-autocomplete";
import { AsyncPipe } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import type { XFactorsKey } from "@optee/constants";
import { buildAssetUrl } from "@optee/constants";
import type { Location } from "@optee/models";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { PrettifyPipe } from "@optee/ui/pipes/prettify.pipe";
import {
  combineLatest,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
} from "rxjs";
import trpcClient from "../../../../trpc-client";
import { LocationBdnbComponent } from "../location-bdnb/location-bdnb.component";

const FALLBACK_PREVIEW_SRC = buildAssetUrl("batiment.png");

@Component({
  selector: "mkp-location-column",
  host: {
    class: "bg-primary-700 text-white",
  },
  template: `
    <div class="relative h-[33%] max-h-64">
      <img
        class="h-full w-full object-cover"
        alt="Photo Street view du site"
        [height]="streetViewHeight"
        [src]="previewSrc$ | async"
        [width]="streetViewWidth"
      />

      <div
        class="from-primary-700 absolute inset-0 bg-gradient-to-t to-transparent"
      >
        @if (location(); as location) {
          <div
            class="font-display flex h-full flex-col justify-end gap-2 p-6 text-white"
          >
            <div class="text-4xl font-bold">
              {{ location.shortAddress | prettify }}
            </div>
            <div class="text-2xl">
              {{ location.zipcode }} {{ location.city | prettify }}
            </div>
          </div>
        }
      </div>

      @if (location()?.dpeLabel; as dpe) {
        <oui-dpe-label class="absolute right-2 top-2" [letter]="dpe" />
      }
    </div>

    <ng-content />

    <div class="flex flex-col gap-6 p-4">
      <div class="flex flex-col gap-2">
        <div class="h-1 w-32 bg-white"></div>
        <div class="font-display text-lg">Scan intelligent de votre site.</div>
        <p class="max-w-prose text-xs">
          Les données ci-dessous ont été récupérées grâce à notre technologie, à
          partir de sources fiables telles que: ENEDIS et GRDF, fichiers
          fonciers de la DGFIP, les bases de données de l'ADEME et des données
          ouvertes de l'État.
        </p>
      </div>

      <mkp-location-bdnb
        canUpdate
        hideAddress
        [(location)]="location"
        [canUpdate]="canUpdate()"
        [highlightXFactors]="highlightXFactors()"
      />
    </div>
  `,
  imports: [
    DpeLabelComponent,
    LocationBdnbComponent,
    NgxGpAutocompleteModule,
    AsyncPipe,
    PrettifyPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationColumnComponent {
  readonly location = model<Location | null>(null);
  readonly highlightXFactors = input<XFactorsKey[]>([]);
  readonly previewSrc = input<string | null>(null);
  readonly canUpdate = input(false, { transform: booleanAttribute });

  protected readonly streetViewHeight = 228;
  protected readonly streetViewWidth = 400;

  readonly previewSrc$ = combineLatest([
    toObservable(this.location).pipe(
      map((location) => location?.address),
      distinctUntilChanged(),
    ),
    toObservable(this.previewSrc).pipe(distinctUntilChanged()),
  ]).pipe(
    switchMap(async ([address, previewSrc]) => {
      if (previewSrc) {
        return previewSrc;
      }

      if (!address) {
        return FALLBACK_PREVIEW_SRC;
      }

      return trpcClient.locations.getStreetViewUrl.query({
        address,
        width: this.streetViewWidth,
        height: this.streetViewHeight,
      });
    }),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );
}

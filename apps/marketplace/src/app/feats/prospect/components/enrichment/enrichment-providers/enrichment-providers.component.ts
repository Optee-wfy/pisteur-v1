import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  buildAssetUrl,
  PUBLIC_ASSETS,
} from "libs/shared/constants/src/lib/assets.constant";

@Component({
  selector: "mkp-enrichment-providers",
  host: { class: "flex flex-col gap-3" },
  template: `
    @if (!hideHeader()) {
      <h4>Liste des fournisseurs de données</h4>
    }
    @let prv = shownProviders();

    <div class="flex flex-wrap gap-4 text-sm">
      @for (provider of prv; track provider.name) {
        <div class="flex items-center gap-2">
          <img
            class="size-5 object-contain"
            [alt]="provider.name"
            [src]="provider.img"
          />
          <span class="font-medium">{{ provider.name }}</span>
        </div>
      }

      @if (prv.length < providers.length) {
        <div class="flex items-center gap-2">
          <span
            class="bg-granite-100 text-granite-600 rounded-full px-2 py-1 text-xs font-medium"
          >
            +{{ providers.length - prv.length }} autres
          </span>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnrichmentProvidersComponent {
  readonly hideHeader = input(false, { transform: booleanAttribute });
  readonly maxShownProviders = input(10);

  protected readonly providers = [
    {
      img: buildAssetUrl(PUBLIC_ASSETS.TOOLS_FULLENRICH),
      name: "Full Enrich",
    },
    {
      img: buildAssetUrl(PUBLIC_ASSETS.TOOLS_APOLLO),
      name: "Apollo.io",
    },
    {
      img: buildAssetUrl(PUBLIC_ASSETS.TOOLS_CONTACTOUT),
      name: "ContactOut",
    },
    {
      img: buildAssetUrl(PUBLIC_ASSETS.TOOLS_DATAGMA),
      name: "Datagma",
    },
    {
      img: buildAssetUrl(PUBLIC_ASSETS.TOOLS_FIRMABLE),
      name: "Firmable",
    },
    {
      img: buildAssetUrl(PUBLIC_ASSETS.TOOLS_PEOPLEDATALAB),
      name: "PeopleDataLab",
    },
    {
      img: buildAssetUrl(PUBLIC_ASSETS.TOOLS_SNOV),
      name: "Snov",
    },
    {
      img: buildAssetUrl(PUBLIC_ASSETS.TOOLS_WIZA),
      name: "Wiza",
    },
    {
      img: buildAssetUrl(PUBLIC_ASSETS.TOOLS_HUNTER),
      name: "Hunter",
    },
    {
      img: buildAssetUrl(PUBLIC_ASSETS.TOOLS_PHONEANDEMAILPROVIDER),
      name: "Phone and Email Provider",
    },
  ] as const;

  protected shownProviders = computed(() => {
    return this.providers.slice(0, this.maxShownProviders());
  });
}

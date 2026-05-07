import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from "@angular/core";
import {
  IconBuildingComponent,
  IconChevronRightComponent,
  IconCompanyComponent,
  IconPersonComponent,
} from "@optee/icons";
import type { LegalEntityUuid } from "@optee/models";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { PRO_LEGAL_ENTITY_ASSOCIATIONS } from "libs/shared/constants/src/lib/associations.constant";
import { TabsModule } from "primeng/tabs";
import { TooltipModule } from "primeng/tooltip";
import trpcClient from "../../../../../../trpc-client";
import { LegalEntityContactsTableComponent } from "../../../../../feats/prospect/components/external-contacts/legal-entity-contacts-table/legal-entity-contacts-table.component";
import { LegalEntityInformationsTabComponent } from "../../../../../feats/prospect/components/legal-entities/legal-entity-informations-tab/legal-entity-informations-tab.component";
import { PlacesTableComponent } from "../../../../../feats/prospect/components/places/places-table/places-table.component";
import { ProService } from "../../../../../services/pro.service";

@Component({
  selector: "mkp-legal-entity-details-page",
  host: { class: "h-full flex flex-col" },
  template: `
    <header
      class="border-granite-200 flex w-full items-center border-b bg-white px-4 py-1 shadow-sm"
    >
      <button class="pister-link" (click)="goBack()">
        <icon-chevron-right
          class="size-3 rotate-180 transition-transform group-hover:translate-x-[-2px]"
        />
        <span class="font-medium">Retour</span>
      </button>
    </header>

    <section class="flex h-full flex-1 flex-col">
      @if (proLegalEntityAssociations.isLoading() || legalEntity.isLoading()) {
        <oui-loader label="Chargement des détails de l'entreprise..." />
      } @else if (legalEntity.error() || proLegalEntityAssociations.error()) {
        <div class="flex h-full items-center justify-center px-4">
          <div class="text-center">
            <div
              class="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-red-50"
            ></div>
            <h3 class="text-granite-900 mb-2 text-base font-semibold">
              Erreur de chargement
            </h3>
            <p class="text-granite-600 text-sm">
              Impossible de charger les données du site
            </p>
          </div>
        </div>
      } @else {
        @if (legalEntity.value(); as legalEntityData) {
          <!-- Title bar -->
          <header
            class="border-granite-200 flex w-full items-center gap-2 border-b bg-white px-4 py-3 shadow-sm"
          >
            <div
              class="bg-granite-100 flex size-8 items-center justify-center rounded-lg"
            >
              <icon-company class="text-granite-700 size-4" />
            </div>
            <h1 class="text-granite-900 text-sm font-semibold">
              {{ legalEntityData.name }}
            </h1>
          </header>

          <p-tabs class="h-full" scrollable [(value)]="activeTab">
            <p-tablist
              class="p-tablist--small border-granite-200 flex w-full border-b bg-white p-2"
            >
              <p-tab value="informations">
                <button
                  class="pister-link"
                  [class.bg-granite-100]="activeTab() === 'informations'"
                >
                  <icon-company class="size-3" slot="icon" />
                  <span>Informations</span>
                </button>
              </p-tab>
              <p-tab value="locations">
                <button
                  class="pister-link"
                  [class.bg-granite-100]="activeTab() === 'locations'"
                >
                  <icon-building class="size-3" slot="icon" />
                  <span>Bâtiments</span>
                </button>
              </p-tab>

              @let contactsTabDisabled = noContacts();
              <span
                class="flex"
                tooltipPosition="bottom"
                [class.cursor-not-allowed]="contactsTabDisabled"
                [pTooltip]="
                  contactsTabDisabled
                    ? 'Aucune personne trouvée pour cette entreprise.'
                    : undefined
                "
              >
                <p-tab value="contacts" [disabled]="contactsTabDisabled">
                  <button
                    class="pister-link disabled:cursor-not-allowed disabled:opacity-40"
                    [class.bg-granite-100]="activeTab() === 'contacts'"
                    [disabled]="contactsTabDisabled"
                  >
                    <icon-person class="size-3" slot="icon" />
                    <span>Personnes</span>
                  </button>
                </p-tab>
              </span>
            </p-tablist>

            <div class="relative flex h-full overflow-y-auto">
              <p-tabpanels class="absolute inset-0 !p-0">
                <p-tabpanel value="informations">
                  <mkp-legal-entity-informations-tab
                    (goToContacts)="goToContacts()"
                    (refetchData)="refetchData()"
                    [externalContactsCount]="membersCount.value() ?? 0"
                    [hasAccessToGlobalData]="hasAccessToGlobalData()"
                    [isLoading]="legalEntity.isLoading()"
                    [legalEntity]="legalEntityData"
                    [legalEntityUuid]="uuid()"
                    [nbRelatedPros]="nbRelatedPros.value() ?? 0"
                  />
                </p-tabpanel>

                <p-tabpanel value="locations">
                  <ng-template #content>
                    <mkp-places-table
                      hideHeader
                      showSelection
                      [legalEntityUuid]="legalEntityData?.uuid ?? null"
                    />
                  </ng-template>
                </p-tabpanel>

                <p-tabpanel class="!p-4" value="contacts">
                  <ng-template #content>
                    <mkp-legal-entity-contacts-table
                      [legalEntityUuid]="legalEntityData?.uuid ?? null"
                    />
                  </ng-template>
                </p-tabpanel>
              </p-tabpanels>
            </div>
          </p-tabs>
        } @else {
          <!-- No data state -->
          <div
            class="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4"
          >
            <div class="text-center">
              <h3 class="text-granite-900 mb-2 text-base font-semibold">
                Aucune donnée disponible
              </h3>
              <p class="text-granite-600 text-sm">
                Les informations de ce site ne sont pas disponibles
              </p>
            </div>
          </div>
        }
      }
    </section>
  `,
  imports: [
    TabsModule,
    TooltipModule,
    IconChevronRightComponent,
    IconBuildingComponent,
    IconCompanyComponent,
    IconPersonComponent,
    PlacesTableComponent,
    LegalEntityContactsTableComponent,
    LegalEntityInformationsTabComponent,
    LoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntityDetailsPage {
  readonly uuid = input.required<LegalEntityUuid>();

  protected readonly activeTab = signal("informations");

  protected readonly proService = inject(ProService);

  protected readonly legalEntity = resource({
    params: () => {
      const associations = this.proLegalEntityAssociations.value();
      if (associations === undefined) {
        return null;
      }

      return {
        uuid: this.uuid(),
        hasAccessToGlobalData: this.hasAccessToGlobalData(),
      };
    },
    loader: async ({ params }) => {
      if (!params || !params.uuid) {
        return null;
      }
      const { uuid, hasAccessToGlobalData } = params;
      if (!hasAccessToGlobalData) {
        const response =
          await trpcClient.legalEntities.getBasicData.query(uuid);
        return response;
      }
      const response = await trpcClient.legalEntities.get.query(uuid);
      return response;
    },
  });

  protected readonly proLegalEntityAssociations = resource({
    params: () => this.uuid(),
    loader: async ({ params: uuid }) => {
      const associations =
        await trpcClient.legalEntities.getAssociationsWithPro.query(uuid);
      return associations;
    },
  });

  protected readonly nbRelatedPros = resource({
    params: () => this.uuid(),
    loader: async ({ params: legalEntityUuid }) => {
      return trpcClient.legalEntities.getNbRelatedPros.query(legalEntityUuid);
    },
  });

  protected readonly membersCount = resource({
    params: () => {
      if (!this.hasAccessToGlobalData()) {
        return null;
      }
      return this.uuid();
    },
    loader: async ({ params: legalEntityUuid }) => {
      if (!legalEntityUuid) {
        return 0;
      }
      return trpcClient.legalEntities.getMembersCount.query(legalEntityUuid);
    },
  });

  protected readonly hasAccessToGlobalData = computed(() => {
    const associations = this.proLegalEntityAssociations.value();
    if (!associations) {
      return false;
    }
    return associations.some(
      (association) =>
        PRO_LEGAL_ENTITY_ASSOCIATIONS.GLOBAL.id ===
        association.associationTypeId,
    );
  });

  protected readonly noContactsCanBeFound = computed(() => {
    const legalEntity = this.legalEntity.value();
    if (!legalEntity || !("noContactCanBeFound" in legalEntity)) {
      return false;
    }
    return Boolean(legalEntity.noContactCanBeFound);
  });

  protected readonly noContacts = computed(() => {
    if (!this.hasAccessToGlobalData()) {
      return false;
    }

    const membersCount = this.membersCount.value();
    if (membersCount !== undefined) {
      return membersCount === 0;
    }

    return this.noContactsCanBeFound();
  });

  protected readonly refetchData = async () => {
    this.proLegalEntityAssociations.reload();
    this.proService.refresh();
    this.legalEntity.reload();
    this.nbRelatedPros.reload();
  };

  protected readonly goToContacts = () => {
    if (this.noContacts()) {
      return;
    }
    this.activeTab.set("contacts");
  };

  goBack() {
    history.back();
  }
}

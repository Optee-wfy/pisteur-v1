import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  resource,
} from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import type { LocationUuid, SimulatedLocationUuid } from "@optee/models";
import { Location, simulateOperationsFromLocation } from "@optee/models";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import trpcClient from "../../../trpc-client";
import { LocationBdnbComponent } from "../../components/location/location-bdnb/location-bdnb.component";
import type { LocationBdnbProperty } from "../../components/location/location-bdnb/location-bdnb.type";
import { OperationRowComponent } from "../../components/operation/operation-row/operation-row.component";

@Component({
  selector: "mkp-simulation-page",
  host: {
    class:
      "h-full w-full flex flex-wrap items-start justify-center p-6 gap-8 relative",
  },
  template: `
    @let simulation = simulationResource.value();
    @if (simulation) {
      <oui-bob [heading]="simulation.accountName ?? ''">
        <h3
          class="text-primary-700 font-display text-2xl font-semibold leading-loose"
        >
          Simulation des opérations de rénovation énergétique pour
          {{ simulation.buildingName ?? "cette adresse" }}
        </h3>
        <p class="font-display text-lg font-semibold leading-7 tracking-wide">
          {{ simulation.streetNumber }} {{ simulation.streetName }},
          {{ simulation.zipcode }} {{ simulation.city?.toLocaleUpperCase() }}
        </p>
        <hr class="text-primary-200 my-6" />

        @if (simulation.mostProfitableOperation) {
          <oui-message
            class="mb-6"
            severity="info"
            summary="Une opération est particulièrement intéressante !"
          >
            {{ simulation.mostProfitableOperation }}
          </oui-message>
        }

        @if (simulation.location) {
          <div class="flex gap-4">
            <aside
              class="shadow-o bg-primary-700 sticky top-0 h-full w-[350px] shrink-0 overflow-y-auto overflow-x-hidden rounded-3xl p-6 text-white"
            >
              <mkp-location-bdnb
                [location]="simulation.location"
                [shownProps]="shownAddressProps"
              >
                {{ simulation.location.address }}
              </mkp-location-bdnb>
            </aside>

            <table class="table-fixed border-separate border-spacing-y-4">
              <thead
                class="font-display text-left text-sm tracking-tight text-gray-600"
              >
                <tr>
                  <td class="w-80 px-2">Opération</td>
                  <td class="w-36 px-2">Coût</td>
                  <td class="w-36 px-2">Subventions</td>
                  <td class="w-36 px-2">Reste à charge</td>
                  <td class="px-2">Impact/ROI</td>
                </tr>
              </thead>

              <tbody>
                @for (
                  operation of simulation.operations;
                  track operation.uuid
                ) {
                  <mkp-operation-row
                    class="w-full"
                    [class.bg-blue-300]="
                      operation.prestationId === selectedOperationPrestationId
                    "
                    [operation]="operation"
                  />
                }
              </tbody>
            </table>
          </div>
        }
      </oui-bob>
    }

    @if (simulationResource.isLoading()) {
      <oui-bob heading="Chargement de la simulation">
        <p>Chargement en cours...</p>
      </oui-bob>
    }

    @if (simulationResource.error()) {
      <oui-message severity="error" summary="Erreur de chargement">
        Cette simulation n'a pas pu être chargée. Si le problème persiste,
        contactez le support.
      </oui-message>
    }
  `,
  imports: [
    BobComponent,
    MessageComponent,
    LocationBdnbComponent,
    OperationRowComponent,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SimulationPageComponent {
  readonly simulationUuid = input.required<SimulatedLocationUuid>();

  protected readonly meta = inject(Meta);
  protected readonly titleService = inject(Title);
  protected readonly route = inject(ActivatedRoute);

  protected readonly selectedOperationPrestationId =
    decodeURIComponent(
      this.route.snapshot.queryParams["selectedOperationPrestationId"],
    ) || null;

  protected readonly simulationResource = resource({
    params: () => this.simulationUuid(),
    loader: async ({ params: simulationUuid }) => {
      this.meta.updateTag({
        name: "Optee - Vos recommandations personnalisées",
      });
      this.titleService.setTitle("Optee - Vos recommandations personnalisées");

      const simulation = await trpcClient.simulator.get.query({
        uuid: simulationUuid,
      });

      if (!simulation) {
        return null;
      }

      const location = Location.init({
        ...simulation,
        uuid: simulation.uuid as unknown as LocationUuid,
        city: simulation.city ?? undefined,
        name: simulation.buildingName ?? undefined,
      });

      if (!location) {
        return null;
      }

      const operations = simulateOperationsFromLocation(location)
        .sort((a, b) => {
          if (a.prestationId === this.selectedOperationPrestationId) {
            return -1;
          }
          if (b.prestationId === this.selectedOperationPrestationId) {
            return 1;
          }

          return (
            (a?.estimatedPaybackPeriod ?? 0) - (b?.estimatedPaybackPeriod ?? 0)
          );
        })
        .slice(0, 8);

      return {
        ...simulation,
        location,
        operations,
      };
    },
  });

  protected readonly shownAddressProps: LocationBdnbProperty[] = [
    "sector",
    "surfaceArea",
    "creationDate",
    "energyType",
    "heatingType",
    "heatingSystem",
    "dpeLabel",
    "electricityConsumptionPerSquareMeter",
    "annualElectricityCost",
  ];
}

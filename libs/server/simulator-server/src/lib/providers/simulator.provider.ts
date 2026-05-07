import { BdnbProvider } from "@optee/bdnb-server";
import {
  MARKETPLACE_UI_URL,
  type OperationHubspotPrestationId,
} from "@optee/constants";
import { GooglePlacesProvider } from "@optee/google-places-server";
import type {
  LocationToSimulate,
  LocationUuid,
  SimulatedLocationUuid,
} from "@optee/models";
import { Location, simulateOperationsFromLocation } from "@optee/models";
import { SimulatorRepository } from "../repositories/simulator.repository";

// @todo should be extracted:in utils but similar function already exists. Refactor needed to unify
const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  useGrouping: true,
  currency: "EUR",
  maximumFractionDigits: 0,
});

const invalidAddressReturn = (address: string, dto: LocationToSimulate) => ({
  uuid: "--",
  accountName: dto.accountName,
  buildingName: dto.buildingName,
  address,
  paybackPeriod: "NA",
  annualSaving: 0,
  remainingAmount: 0,
  url: "NA",
  sellingPoint: "NA",
  selectedOperation: null,
});

export const SimulatorProvider = {
  /**
   * Multiple steps:
   * * Convert object to address
   * * get bdnb data from address
   * * Generate a new Location object
   * * Generate operations available on the building
   * * Determines the most profitable operation on the building
   * * Generate a link redirecting to simulation page (app.optee.io/simulation/[ID])
   * * Add sentence for most profitable operation on the building (for marketing)
   * * Insert new row in SimulatedLocation table
   * @param dto location to be simulated
   */
  async create(
    dto: LocationToSimulate,
    selectedOperationIdToSimulateBy?: OperationHubspotPrestationId,
  ) {
    let index = 0;
    const address = Location.makeAddress(dto);

    const isValidAddress = await GooglePlacesProvider.isValidAddress(address);
    if (!isValidAddress) {
      return invalidAddressReturn(address, dto);
    }

    try {
      // Fetch BDNB Data
      const bdnbDataFull = await BdnbProvider.getDataFromAddress({ address });

      if (!bdnbDataFull) {
        throw new Error(
          "Aucun site ne semble correspondre à cette adresse. Veuillez vérifier l'adresse et réessayer. Si le problème persiste, contactez le support.",
        );
      }

      // Initialize Location
      const simulatedLocation = Location.init({
        uuid: ("sml-" + index++) as LocationUuid,
        streetNumber: dto.streetNumber,
        streetName: dto.streetName,
        city: dto.city,
        zipcode: dto.zipcode,
        name: `Simulated Location for "${dto.buildingName}"`,
        ...bdnbDataFull.formattedData,
        rawBdnb: bdnbDataFull.rawData,
      });

      if (!simulatedLocation) {
        console.error(
          `Failed to create simulated location for "${dto.buildingName}"`,
        );
        return invalidAddressReturn(address, dto);
      }

      // Simulate Operations
      const mostProfitableOperations = simulateOperationsFromLocation(
        simulatedLocation,
      ).sort(
        (a, b) =>
          (a?.estimatedPaybackPeriod ?? 0) - (b?.estimatedPaybackPeriod ?? 0),
      );

      const selectedOperation = selectedOperationIdToSimulateBy
        ? mostProfitableOperations.find(
            (mPO) => mPO.prestationId === selectedOperationIdToSimulateBy,
          )
        : mostProfitableOperations[0];

      if (!selectedOperation) {
        console.error(
          `Failed to simulate operations for "${dto.buildingName}"`,
        );
        return invalidAddressReturn(address, dto);
      }

      // Calculate Financials
      const remainingAmount = currencyFormatter.format(
        selectedOperation.remainingAmount.value ?? 0,
      );
      const annualSaving = currencyFormatter.format(
        selectedOperation.estimatedAnnualSavings ?? 0,
      );
      const paybackPeriod =
        selectedOperation.estimatedPaybackPeriodFormatted === "immédiat"
          ? selectedOperation.estimatedPaybackPeriodFormatted
          : `de ${selectedOperation.estimatedPaybackPeriodFormatted}`;

      const sellingPoint = `Réaliser ${selectedOperation.formattedSentence} pour un coût de ${remainingAmount} vous permettrait d'économiser ${annualSaving} par an sur vos consommations énergétiques, soit un ROI ${paybackPeriod} pour cet investissement.`;

      // Prepare Data for Simulation
      const { uuid: oldId, creationDate, ...input } = simulatedLocation;
      const locationToSimulate = {
        ...input,
        creationDate: creationDate ? creationDate.toISOString() : null,
        buildingName: dto.buildingName,
        accountName: dto.accountName,
        mostProfitableOperation: sellingPoint,
        operationSimulatedBy: selectedOperation.prestationId,
      };

      // Store Simulated Location
      const uuid =
        await SimulatorRepository.createSimulatedLocation(locationToSimulate);

      const queryParams = encodeURIComponent(selectedOperation.prestationId);

      return {
        uuid,
        accountName: dto.accountName,
        buildingName: dto.buildingName,
        address,
        paybackPeriod,
        annualSaving,
        remainingAmount,
        url: `${MARKETPLACE_UI_URL}/simulation/${uuid}?selectedOperationPrestationId=${queryParams}`,
        mostProfitableOperation: sellingPoint,
        selectedOperation: selectedOperationIdToSimulateBy,
      };
    } catch (e) {
      console.error("An error occurred:", e);
      return invalidAddressReturn(address, dto);
    }
  },

  get(uuid: SimulatedLocationUuid) {
    return SimulatorRepository.getSimulatedLocation(uuid);
  },
};

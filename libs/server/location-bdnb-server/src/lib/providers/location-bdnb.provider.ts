import type { LocationBdnb } from "@optee/models";

export const LocationBdnbProvider = {
  buildExteriorWallCondition(location: LocationBdnb): string {
    const insulation = location.exteriorWallInsulationType ?? [];
    const materials = location.wallMaterial ?? [];
    const hasInsulation = insulation.length > 0;
    const hasHighLoss =
      typeof location.lossWall === "number" && location.lossWall > 0;

    if (hasInsulation && hasHighLoss) {
      return `Murs isolés (${insulation.join(
        ", ",
      )}) mais encore fortement déperditifs selon les données BDNB.`;
    }

    if (hasInsulation) {
      return `Murs extérieurs déjà isolés (${insulation.join(
        ", ",
      )}), avec un potentiel d’optimisation complémentaire.`;
    }

    if (materials.length > 0) {
      return `Murs extérieurs non isolés, structure ${materials.join(
        ", ",
      )}, probablement à l’origine d’une partie des déperditions.`;
    }

    return "Murs extérieurs probablement peu ou pas isolés, avec un fort potentiel de réduction des déperditions.";
  },

  buildHeatingType(location: LocationBdnb): string | null {
    if (location.heatingSystem && location.energyType) {
      return `${location.heatingSystem} (${location.energyType})`;
    }
    return location.heatingSystem ?? location.energyType ?? null;
  },

  buildDetectedIssues(location: LocationBdnb): string {
    const issues: string[] = [];

    const dpe =
      location.dpeAssessmentClass ??
      location.dpeLabel ??
      location.mainGesClass ??
      null;
    if (dpe && ["D", "E", "F", "G"].includes(dpe.toUpperCase())) {
      issues.push(
        `étiquette DPE ${dpe}, au-dessus des niveaux visés aujourd’hui`,
      );
    }

    const consumption =
      location.estimatedEnergyConsumption ??
      location.consumption5Usages ??
      location.electricityConsumptionPerSquareMeter ??
      null;
    if (consumption && Number(consumption) > 200) {
      issues.push(
        `consommation énergétique estimée autour de ${Math.round(
          Number(consumption),
        )} kWh/m².an, au-dessus des standards actuels`,
      );
    }

    if (location.priorityDistrict) {
      issues.push(
        "bâtiment situé en quartier prioritaire, avec des enjeux forts sur le confort et le budget énergie des occupants",
      );
    }

    if (issues.length === 0) {
      return "plusieurs signaux de surconsommation et de déperditions ressortent des données bâtimentaires.";
    }

    if (issues.length === 1) {
      return issues[0] + ".";
    }
    if (issues.length === 2) {
      return issues.join(" et ") + ".";
    }
    return (
      issues.slice(0, -1).join(", ") + " et " + issues[issues.length - 1] + "."
    );
  },
};

import type { EnergyType } from "./location.constant";
import type { LocationTypeNafCategory } from "./naf-code.constant";
import { getLocationBuildingTypeSelection } from "./naf-code.constant";

// Incompressible electricity share based on type location rules
export const INCOMPRESSIBLE_ELECTRICITY_SHARE_BY_LOCATION_TYPE: Record<
  LocationTypeNafCategory,
  number
> = {
  BUREAUX_TERTIAIRE: 0.45,
  RESIDENTIEL_COLLECTIF_GERE: 0.15,
  SITES_INDUSTRIELS_USINES: 0.2,
  LOGISTIQUE_ENTREPOSAGE: 0.15,
  BTP_BASES_TECHNIQUES: 0.2,
  HOTELLERIE_TOURISME_LOISIRS: 0.3,
  SANTE_MEDICO_SOCIAL: 0.25,
  ENSEIGNEMENT_BATIMENTS_PUBLICS: 0.35,
  COMMERCE_ERP: 0.4,
  SERVICES_OPERATIONNELS_SUPPORT: 0.3,
  CULTURE_SPORT_SERVICES_PERSONNE: 0.25,
};

export const getIncompressibleShareFromNafCodes = (
  nafCodes: string[],
): number | null => {
  if (!nafCodes.length) {
    return null;
  }
  const counts = new Map<LocationTypeNafCategory, number>();
  nafCodes.forEach((code) => {
    const types = getLocationBuildingTypeSelection([code]);
    types.forEach((type) => {
      counts.set(type, (counts.get(type) ?? 0) + 1);
    });
  });
  if (counts.size === 0) {
    return null;
  }

  const maxCount = Math.max(...counts.values());

  const candidates = Array.from(counts.entries())
    .filter(([, count]) => count === maxCount)
    .map(([type]) => type);

  return candidates.reduce<number | null>((max, type) => {
    const share = INCOMPRESSIBLE_ELECTRICITY_SHARE_BY_LOCATION_TYPE[type];
    return max === null || share > max ? share : max;
  }, null);
};

// Energy split rules (values are expressed in MWh).
export const calculateTotalConsumptionMwh = ({
  surfaceThatRequiresHeating,
  consumptionEfM2,
  energyType,
  enedisMwh,
}: {
  surfaceThatRequiresHeating: number | null;
  consumptionEfM2: number | null;
  energyType: EnergyType | null;
  enedisMwh: number | null;
}): number | null => {
  if (consumptionEfM2 === null || !surfaceThatRequiresHeating) {
    return null;
  }
  if (energyType === "Electrique" && enedisMwh !== null) {
    return enedisMwh;
  }
  return (surfaceThatRequiresHeating * consumptionEfM2) / 1000;
};

export const calculateElectricityConsumptionMwh = ({
  energyType,
  totalConsumptionMwh,
  enedisMwh,
  incompressibleShare,
  hasConsumptionEfM2,
}: {
  energyType: EnergyType | null;
  totalConsumptionMwh: number | null;
  enedisMwh: number | null;
  incompressibleShare: number | null;
  hasConsumptionEfM2: boolean;
}): number | null => {
  if (!hasConsumptionEfM2 || totalConsumptionMwh === null) {
    return null;
  }
  if (enedisMwh !== null && enedisMwh <= totalConsumptionMwh) {
    return enedisMwh;
  }
  if (energyType === "Electrique") {
    return totalConsumptionMwh;
  }
  if (incompressibleShare === null) {
    return null;
  }
  return totalConsumptionMwh * incompressibleShare;
};

export const calculateNonElectricConsumptionMwh = ({
  energyType,
  totalConsumptionMwh,
  electricityConsumptionMwh,
  hasConsumptionEfM2,
}: {
  energyType: EnergyType | null;
  totalConsumptionMwh: number | null;
  electricityConsumptionMwh: number | null;
  hasConsumptionEfM2: boolean;
}): number | null => {
  if (!hasConsumptionEfM2) {
    return null;
  }
  if (!energyType || energyType === "Electrique") {
    return null;
  }
  if (totalConsumptionMwh === null || electricityConsumptionMwh === null) {
    return null;
  }
  return Math.max(0, totalConsumptionMwh - electricityConsumptionMwh);
};

type ExplanationInput = {
  label: string;
  value: number;
  format: "number" | "mwh";
};

type ConsumptionExplanation =
  | { kind: "unknown"; reason: string }
  | {
      kind: "formula";
      formula: string;
      inputs?: ExplanationInput[];
      result?: number;
      extra?: string[];
    };

type EnedisExplanation = {
  value: number;
  source: string;
  details: string;
};

export const explainTotalConsumption = ({
  surfaceThatRequiresHeating,
  consumptionEfM2,
  energyType,
  enedis,
}: {
  surfaceThatRequiresHeating: number | null;
  consumptionEfM2: number | null;
  energyType: EnergyType | null;
  enedis: EnedisExplanation | null;
}): { value: number | null; explanation: ConsumptionExplanation } => {
  if (!energyType) {
    return {
      value: null,
      explanation: { kind: "unknown", reason: "Type d'energie inconnu" },
    };
  }
  if (consumptionEfM2 === null) {
    return {
      value: null,
      explanation: { kind: "unknown", reason: "Conso EF manquante" },
    };
  }
  if (!surfaceThatRequiresHeating) {
    return {
      value: null,
      explanation: { kind: "unknown", reason: "Surface chauffee manquante" },
    };
  }

  const value = calculateTotalConsumptionMwh({
    surfaceThatRequiresHeating,
    consumptionEfM2,
    energyType,
    enedisMwh: enedis?.value ?? null,
  });

  if (energyType === "Electrique" && enedis) {
    return {
      value,
      explanation: {
        kind: "formula",
        formula: "Conso annuelle = Enedis (energie electrique)",
        result: value ?? undefined,
        extra: [`Source: ${enedis.source}`, enedis.details],
      },
    };
  }

  return {
    value,
    explanation: {
      kind: "formula",
      formula:
        "Conso annuelle = Surface chauffee (m2) x Conso 5 usages EF (kWh/m2/an) / 1000",
      inputs: [
        {
          label: "Surface chauffee",
          value: surfaceThatRequiresHeating,
          format: "number",
        },
        {
          label: "Conso 5 usages EF",
          value: consumptionEfM2,
          format: "number",
        },
      ],
      result: value ?? undefined,
    },
  };
};

export const explainElectricityConsumption = ({
  energyType,
  totalConsumptionMwh,
  enedis,
  incompressibleShare,
  hasConsumptionEfM2,
}: {
  energyType: EnergyType | null;
  totalConsumptionMwh: number | null;
  enedis: EnedisExplanation | null;
  incompressibleShare: number | null;
  hasConsumptionEfM2: boolean;
}): { value: number | null; explanation: ConsumptionExplanation } => {
  if (!energyType) {
    return {
      value: null,
      explanation: { kind: "unknown", reason: "Type d'energie inconnu" },
    };
  }
  if (!hasConsumptionEfM2) {
    return {
      value: null,
      explanation: { kind: "unknown", reason: "Conso EF manquante" },
    };
  }
  if (totalConsumptionMwh === null) {
    return {
      value: null,
      explanation: { kind: "unknown", reason: "Conso annuelle inconnue" },
    };
  }

  const value = calculateElectricityConsumptionMwh({
    energyType,
    totalConsumptionMwh,
    enedisMwh: enedis?.value ?? null,
    incompressibleShare,
    hasConsumptionEfM2,
  });

  if (value === null) {
    const reason =
      energyType !== "Electrique" && incompressibleShare === null
        ? "Part incompressible manquante (NAF inconnu)"
        : "Calcul indisponible";
    return { value: null, explanation: { kind: "unknown", reason } };
  }

  if (enedis && enedis.value <= totalConsumptionMwh) {
    return {
      value,
      explanation: {
        kind: "formula",
        formula: "Conso elec = Enedis",
        result: value,
        extra: [`Source: ${enedis.source}`, enedis.details],
      },
    };
  }

  if (energyType === "Electrique") {
    return {
      value,
      explanation: {
        kind: "formula",
        formula: "Conso elec = Conso annuelle (energie electrique)",
        inputs: [
          {
            label: "Conso annuelle",
            value: totalConsumptionMwh,
            format: "mwh",
          },
        ],
        result: value,
      },
    };
  }

  return {
    value,
    explanation: {
      kind: "formula",
      formula: "Conso elec = Conso annuelle x Part incompressible",
      inputs: [
        {
          label: "Conso annuelle",
          value: totalConsumptionMwh,
          format: "mwh",
        },
        {
          label: "Part incompressible",
          value: incompressibleShare!, // already checked not null above
          format: "number",
        },
      ],
      result: value,
    },
  };
};

export const explainNonElectricConsumption = ({
  energyType,
  totalConsumptionMwh,
  electricityConsumptionMwh,
  hasConsumptionEfM2,
}: {
  energyType: EnergyType | null;
  totalConsumptionMwh: number | null;
  electricityConsumptionMwh: number | null;
  hasConsumptionEfM2: boolean;
}): { value: number | null; explanation: ConsumptionExplanation } => {
  if (!energyType) {
    return {
      value: null,
      explanation: { kind: "unknown", reason: "Type d'energie inconnu" },
    };
  }
  if (!hasConsumptionEfM2) {
    return {
      value: null,
      explanation: { kind: "unknown", reason: "Conso EF manquante" },
    };
  }
  if (energyType === "Electrique") {
    return {
      value: null,
      explanation: { kind: "unknown", reason: "Energie electrique" },
    };
  }
  if (totalConsumptionMwh === null) {
    return {
      value: null,
      explanation: { kind: "unknown", reason: "Conso annuelle inconnue" },
    };
  }
  if (electricityConsumptionMwh === null) {
    return {
      value: null,
      explanation: { kind: "unknown", reason: "Conso elec inconnue" },
    };
  }

  const value = calculateNonElectricConsumptionMwh({
    energyType,
    totalConsumptionMwh,
    electricityConsumptionMwh,
    hasConsumptionEfM2,
  });

  if (value === null) {
    return {
      value: null,
      explanation: { kind: "unknown", reason: "Calcul indisponible" },
    };
  }

  return {
    value,
    explanation: {
      kind: "formula",
      formula: "Conso non-elec = Conso annuelle - Conso elec",
      inputs: [
        {
          label: "Conso annuelle",
          value: totalConsumptionMwh,
          format: "mwh",
        },
        {
          label: "Conso elec",
          value: electricityConsumptionMwh,
          format: "mwh",
        },
      ],
      result: value,
    },
  };
};

export const formatConsumptionExplanation = ({
  explanation,
  formatNumber,
  formatMwh,
}: {
  explanation: ConsumptionExplanation;
  formatNumber: (value: number) => string;
  formatMwh: (value: number) => string;
}): string => {
  if (explanation.kind === "unknown") {
    return explanation.reason;
  }

  const lines: string[] = [explanation.formula];

  if (explanation.inputs?.length) {
    explanation.inputs.forEach((input) => {
      const formatted =
        input.format === "mwh"
          ? `${formatMwh(input.value)}`
          : formatNumber(input.value);
      lines.push(`${input.label}: ${formatted}`);
    });
  }

  if (explanation.result != null) {
    lines.push(`Resultat: ${formatMwh(explanation.result)}`);
  }

  if (explanation.extra?.length) {
    explanation.extra.forEach((line) => {
      if (line) {
        lines.push(line);
      }
    });
  }

  return lines.join("\n");
};

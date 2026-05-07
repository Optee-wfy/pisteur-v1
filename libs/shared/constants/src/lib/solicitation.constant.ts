export const SOLICITATION_THRESHOLDS = {
  LOW_MAX: 2,
  MEDIUM_MAX: 7,
  HIGH_MAX: 15,
} as const;

export const SOLICITATION_LEVELS = [
  "low",
  "medium",
  "high",
  "veryHigh",
] as const;
export type SolicitationLevel = (typeof SOLICITATION_LEVELS)[number];

export const SOLICITATION_LEVEL_LABELS: Record<SolicitationLevel, string> = {
  low: "Faible",
  medium: "Modérée",
  high: "Forte",
  veryHigh: "Très forte",
};

export const getSolicitationLevel = (
  nbRelatedPros: number | null | undefined,
): SolicitationLevel | null => {
  if (nbRelatedPros === null || nbRelatedPros === undefined) {
    return null;
  }

  const value = Math.max(0, nbRelatedPros);
  if (value <= SOLICITATION_THRESHOLDS.LOW_MAX) {
    return "low";
  }
  if (value <= SOLICITATION_THRESHOLDS.MEDIUM_MAX) {
    return "medium";
  }
  if (value <= SOLICITATION_THRESHOLDS.HIGH_MAX) {
    return "high";
  }
  return "veryHigh";
};

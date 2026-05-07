/**
 * Convert a duration in years (e.g., 1.5) into a French human-friendly string.
 *
 * Examples:
 *    0.5  => "6 mois"
 *    1    => "1 an"
 *    2    => "2 ans"
 *    1.5  => "1 an et 6 mois"
 *
 * @param durationInYears - The duration in years as a number (can be fractional).
 * @returns A string describing the duration in French.
 */
export function formatDuration(durationInYears = 0): string {
  // Partie entière (années)
  const fullYears = Math.floor(durationInYears);
  // Partie décimale
  const fraction = durationInYears - fullYears;
  // Convertir la partie décimale en mois (12 mois par an)
  const months = Math.round(fraction * 12);

  if (months === 0 && fullYears === 0) {
    return "immédiat";
  }

  let result = "";

  // Gestion du texte pour les années
  if (fullYears === 1) {
    result += "1 an";
  } else if (fullYears > 1) {
    result += `${fullYears} ans`;
  }

  // Gestion du texte pour les mois
  if (months > 0) {
    // Ajouter " et " seulement si on a déjà des années
    if (result.length > 0) {
      result += " et ";
    }
    if (months === 1) {
      result += "1 mois";
    } else {
      result += `${months} mois`;
    }
  }

  // Si la durée est inférieure à 1 mois (ex.: 0.0 ou 0.03 années)
  if (!result) {
    result = "0 mois";
  }

  return result;
}

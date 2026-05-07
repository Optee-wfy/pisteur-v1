export function normalize(str: string | null | undefined): string {
  if (typeof str !== "string") {
    return "";
  }
  return str
    .normalize("NFD") // décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, "") // supprime les diacritiques (accents)
    .replace(/[^a-zA-Z0-9\s-]/g, " ") // remplace tous les caractères spéciaux par des espaces (garde lettres, chiffres, espaces et tirets)
    .replace(/[\s-]+/g, "-") // remplace toute suite d'espaces et/ou de tirets par un seul tiret
    .toLowerCase()
    .replace(/^-+|-+$/g, ""); // trim les tirets en début/fin
}

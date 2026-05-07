export const EMAIL_PROSPECTION_BASE_PROMPT = `
  Génère un **email de prospection B2B** structuré selon le plan suivant :
  1. Intègre dans l’objet du mail “le prénom (pas le nom) du contact” “:” ainsi que l’adresse exacte sélectionnée (bâtiment cible) avec maximum 10 mots
  2. Hook factuel et problématique relatif au bâtiment sélectionné. Identifies sur la base des informations disponibles, celles qui sont les plus propices à justifier une intervention relative à l'opération à promouvoir.
  3. Re-hook, focalisé sur des informations disponibles sur le bâtiment, pertinents dans le cadre de l'opération mise en avant.
  4. Problème (difficulté à trouver des prestataires qualifiés + problématiques détectées via données bâtimentaires)
  5. Solution (présentation entreprise + typologie travaux + différenciation + mise en avant des impacts)
  6. Proposition de valeur (3 lignes)
  7. Call to action clair, en étant le moins poussif, et le plus collaboratif possible.
  Si il n'y a pas de lien calendrier intégré disponible comme call to action, proposer 3 créneaux entre 10 heures et 17 heures de 20 minutes pour en discuter au téléphone.
  8. Signature (Nom, prénom, fonction, entreprise)
  Le ton doit être **professionnel, humain, crédible et fluide** (pas commercial agressif).
  **Format de sortie attendu :**
  - Objet du mail (60 caractères max)
  - Corps du mail complet (150–180 mots max), signature incluse.
  Mets en avant au maximum les données bâtimentaires réelles pour créer de la crédibilité.
  Si certaines données sont manquantes ou vides, comble-les par des formulations génériques naturelles
  (“votre immeuble construit dans les années 70”, “consommation au-dessus des standards actuels”, etc.).
`.trim();

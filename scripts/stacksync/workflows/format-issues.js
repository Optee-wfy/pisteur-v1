/**
 * Known issues that could happen in database
 */
const ISSUES =
[
  {
    key: "usersWithoutAssociation",
    name: "Utilisateurs de la plateforme sans association à un compte",
    howToResolve:
      "S'il s'agit d'un véritable utilisateur, il faut recréer les associations (via HubSpot) ; sinon, supprimer l'utilisateur et ses relations.",
    queryUrl: "https://supabase.com/dashboard/project/mtpdtpaupumtxmcipgde/sql/f658b14c-7f38-4159-ad9d-f11a43f103dc",
    needProductConfirmation: true,
  },
  {
    key: "unsyncedContact",
    name: "Utilisateurs et contacts désynchronisés",
    howToResolve: "Ces contacts n'ont pas d'utilisateur associé alors qu'un utilisateur existe avec le même email. Vérifier s'il s'agit de réels utilisateurs de l'application. Le cas échéant, agir selon la situation ; cela peut être lié à une fusion ou à une suppression de contact côté HubSpot.",
    queryUrl: "https://supabase.com/dashboard/project/mtpdtpaupumtxmcipgde/sql/f7800e89-5df1-4ce5-ba6a-0923f2aebabd",
    needProductConfirmation: true,
  }
];

/**
 * Point d'entrée du script pour le workflow Stacksync « BDD News » (ne pas renommer ni modifier les arguments).
* @param {Record<string, unknown>} WORKFLOW_CONTEXT Défini dans l'UI Stacksync ; permet de passer des paramètres personnalisés à la fonction.
* @returns {string} Chaîne formatée contenant l'état des rapports sur la base de données.
 * @see https://workflows.stacksync.com/workspaces/2545/workflows/dd631f56-41d5-494e-97eb-03cfd05a0445?region=besg&tab=designer
 */
function main(WORKFLOW_CONTEXT) {
  return ISSUES.map(issue => {
    const count = WORKFLOW_CONTEXT[issue.key].length;
    const messages = [`${count > 0 ? '🚩' : '✔'} ${issue.name}: ${count}`];

    if(count > 0) {
      messages.push(`Voir tous les résultats: ${issue.queryUrl}`);
      messages.push(`Piste de résolution : ${issue.howToResolve}`);
      if(issue.needProductConfirmation) {
        messages.push("Attention: Ces modifications doivent être faites après validation du pôle produit.");
      }
    }
    return messages.join('\n');
  }).join('\n\n')
}

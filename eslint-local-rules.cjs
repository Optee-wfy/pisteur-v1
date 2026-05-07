/**
 * Règles ESLint personnalisées pour Optee
 */

module.exports = {
  "no-this-in-object-methods": {
    meta: {
      type: "problem",
      docs: {
        description: "Interdit l'utilisation de 'this' dans les méthodes d'objets JavaScript",
        category: "Possible Errors",
      },
      messages: {
        noThisInObjectMethod: "Évitez 'this.{{property}}' dans un objet JavaScript. Utilisez le nom de l'objet explicitement.",
      },
    },
    create(context) {
      return {
        MemberExpression(node) {
          // Détecte this.quelquechose
          if (node.object.type === "ThisExpression") {
            // Vérifie si on est dans une fonction qui est propriété d'un objet
            let parent = node.parent;
            let isInObjectMethod = false;

            // Remonte l'AST pour voir si on est dans une méthode d'objet
            while (parent) {
              // Support pour les Property avec method: true (ES6 method syntax)
              if (parent.type === "Property" && parent.method === true) {
                isInObjectMethod = true;
                break;
              }

              // Support pour les Property avec function expression
              if (parent.type === "Property" && parent.method === false) {
                // C'est une propriété avec une fonction comme valeur
                if (parent.value &&
                    (parent.value.type === "FunctionExpression" ||
                     parent.value.type === "ArrowFunctionExpression")) {
                  isInObjectMethod = true;
                  break;
                }
              }

              parent = parent.parent;
            }

            if (isInObjectMethod) {
              context.report({
                node,
                messageId: "noThisInObjectMethod",
                data: {
                  property: node.property.name || "property",
                },
              });
            }
          }
        }
      };
    },
  },
};

# Optee Showcase app

## SSG (Static Site Generation)

Cette application utilise le SSG au moment du build pour générer statiquement toutes les pages, y compris les routes dynamiques (`blog/:slug`, `clients/:slug`).

### Configuration actuelle

- **Routes de l'app** : `src/app/app.routes.ts` (routes Angular standards)
- **Routes à pré-générer** : `routes.txt` (généré automatiquement depuis Contentful)
- **Script de génération** : `scripts/generate-routes.js` (récupère les contenus depuis Contentful)

### Build

```bash
# Build complet avec génération automatique des routes
npm run swc:build

# Ou manuellement :
npm run swc:generate:routes  # Génère routes.txt depuis Contentful
npx nx build showcase    # Build avec prerendering
```

Le script récupère automatiquement tous les posts de blog et use cases depuis Contentful pour générer le fichier `routes.txt` utilisé par Angular pour le prerendering.

Plus d'informations sur le prerendering Angular : [Documentation officielle](https://angular.dev/guide/prerendering)

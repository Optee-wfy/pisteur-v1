# Marketplace

Application principal d'Optee; regroupe les espaces public, pro et client du marketplace

## Get Started

Retrouvez ci-dessous les commandes disponible pour le projet:
(N'oubliez pas d'installer les dépendances au préalable)

|Commande|Description|
|---|---|
|`mkp:lint`|Vérification des règles (eslint &prettier)|
|`mkp:test`|Lancement des tests unitaires du projet|
|`mkp:serve`|Lancement local de l'application. Disponible à l'adresse <http://localhost:4200/> |
|`mkp:build`|Création du build dans le dossier `dist/apps/marketplace`|

> Chacune de ces commandes doit être précédées de `npm run` pour fonctionner correctement. Elles doivent être lancées depuis la racine du monorepo.

## Architecture du projet

```markdown
src/
└── app/
    └── pages/
        └── (public)/
            ├── auth.page.ts
            └── auth
                └── ...
        └── (logged)/
          └── pro/
              └── (layout).page.ts
              └── dashboard.page.ts
              └── ...
          └── client/
              └── (layout).page.ts
              └── dashboard.page.ts
              └── ...
          └── (redirect).page.ts # Redirige vers le bon espace
          └── [...not-found].page.ts # Redirige vers la home si la page n'existe pas
```

De cette façon, l'application délivreras 3 espaces distincts:

- <https://localhost:4200> pour l'espace PUBLIC
- <https://localhost:4200/pro> pour l'espace des PRO
- <https://localhost:4200/client> pour l'espace des CLIENT

## Gestion des environnements

Pour utiliser des variables d'environnement dans le projet, il faut les rajouter dans le fichier `.env` à la racine du monorepo mais également dans le fichier `getEnv.ts`.

Le projet utilisant `vite` comme builder, il est nécessaire de précédé les noms des variable de `VITE_` (ex: pour la variable `API_KEY` il faudra rajouter la clef `VITE_API_KEY`)

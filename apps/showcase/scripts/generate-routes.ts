import { createClient } from "contentful";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  CONTENTFUL_ACCESS_TOKEN,
  CONTENTFUL_SPACE_ID,
} from "../../../libs/shared/utils/src/lib/public-env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  console.error(
    "❌ Erreur: Variables d'environnement CONTENTFUL_SPACE_ID et CONTENTFUL_ACCESS_TOKEN requises",
  );
  process.exit(1);
}

const POST_TYPE_ID = "pageBlogPost";
const USE_CASE_TYPE_ID = "useCase";

async function generateRoutes() {
  console.log("🚀 Génération des routes pour le prerendering...");

  // Créer le client Contentful
  const client = createClient({
    space: CONTENTFUL_SPACE_ID,
    accessToken: CONTENTFUL_ACCESS_TOKEN,
  });

  const routes: string[] = [];

  try {
    // Routes statiques
    routes.push("/");
    routes.push("/appel-offres");
    routes.push("/professionnel");
    routes.push("/gtb");
    routes.push("/cvc");
    routes.push("/isolation");
    routes.push("/audit");
    routes.push("/blog");
    routes.push("/clients");
    routes.push("/politique-de-confidentialite");
    routes.push("/demo");

    // Landing pages
    routes.push("/strategie-l");
    routes.push("/appel-offres-l");
    routes.push("/strategie-hotel-l");
    routes.push("/appel-offres-hotel-l");
    routes.push("/strategie-copro-l");
    routes.push("/appel-offres-copro-l");
    routes.push("/strategie-inter-l");
    routes.push("/appel-offres-inter-l");
    routes.push("/professionnels-l");

    //@todo remove anys below
    // Récupérer les posts de blog
    console.log("📖 Récupération des posts de blog...");
    const blogResponse = await client.getEntries({
      content_type: POST_TYPE_ID,
      include: 0,
      select: "fields.slug" as any,
    });

    console.log(`✅ ${blogResponse.items.length} posts trouvés`);
    blogResponse.items.forEach((post) => {
      if (post.fields && post.fields["slug"]) {
        routes.push(`/blog/${post.fields["slug"]}`);
      }
    });

    // Récupérer les use cases
    console.log("🏢 Récupération des use cases...");
    const useCaseResponse = await client.getEntries({
      content_type: USE_CASE_TYPE_ID,
      include: 0,
      select: "fields.slug" as any,
    });

    console.log(`✅ ${useCaseResponse.items.length} use cases trouvés`);
    useCaseResponse.items.forEach((useCase) => {
      if (useCase.fields && useCase.fields["slug"]) {
        routes.push(`/clients/${useCase.fields["slug"]}`);
      }
    });

    // Écrire le fichier routes.txt
    const routesFilePath = join(__dirname, "../routes.txt");
    writeFileSync(routesFilePath, routes.join("\n"));

    console.log(`✅ Fichier routes.txt généré avec ${routes.length} routes`);
    console.log(`📍 Chemin: ${routesFilePath}`);
  } catch (error) {
    console.error("❌ Erreur lors de la génération des routes:", error);
    process.exit(1);
  }
}

generateRoutes();

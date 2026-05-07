#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ⇨ Dossiers racine contenant tes composants d'icônes
const ICON_DIRS = [
  path.resolve(__dirname, "./lib"),
  // path.resolve(__dirname, './projects-company'), // ajoute d'autres dossiers ici
];

// Icônes à exclure
const EXCLUDE_PREFIXES = [
  "icon-operation",
  "icon-conditional-success",
  "icon-success",
  "icon-signature",
];

const COMPONENT_GLOB = /\.component\.ts$/;

/**
 * Lit récursivement un dossier et retourne la liste des chemins de fichier
 */
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? walk(res) : res;
    }),
  );
  return files.flat().filter((f) => COMPONENT_GLOB.test(f));
}

/**
 * Extrait le bloc template (inline) — retourne null si absent
 */
function extractSvg(source) {
  const match = source.match(/template\s*:\s*`([\s\S]*?)`/);
  return match ? match[1].trim() : null;
}

/**
 * Nettoie l'attribut Angular [class]="colorMode() === 'current' ? 'fill-current' : 'fill-*-*'"
 *
 *  – remplace l'attribut entier par class="fill-current"
 *  – tolère retours à la ligne, espaces, palette (lettres/tirets) et nuance (1–3 chiffres)
 */
function cleanSvg(svg) {
  console.log(svg);
  return svg.replace(
    /\[class\]\s*=\s*"([\s\S]*?)colorMode\([\s\S]*?fill-current'[\s\S]*?:[\s\S]*?'fill-[a-zA-Z-]+-\d{1,3}'[\s\S]*?"\s*/gs,
    'class="fill-current" ',
  );
}

/**
 * Déduit le nom d'icône : selector ou à défaut le fichier
 */
function extractName(source, filePath) {
  const sel = source.match(/selector\s*:\s*'([^']+)'/);
  if (sel) return sel[1];
  return path.basename(filePath).replace(".component.ts", "");
}

/**
 * Construit la page HTML
 * @todo Some icons are not displayed correctly because of the `fill` attribute (should be `currentColor`)
 */
function buildHtml(snippets) {
  return /* html */ `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Aperçu des icônes</title>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<style>
  body{margin:0;font-family:sans-serif;padding:2rem;color: #6680FF;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:1.5rem}
  .icon{display:flex;flex-direction:column;align-items:center;font-size:.75rem;text-align:center}
  .icon svg{width:48px;height:48px;flex-shrink:0;fill: currentColor;}
  code{margin-top:.5rem;background:#f2f2f2;padding:.2rem .4rem;border-radius:4px}
</style>
</head>
<body>
<div class= "flex items-center mb-4 justify-between">
<h1>Aperçu des icônes (${snippets.length - EXCLUDE_PREFIXES.length})</h1>
<span>Icônes exclues : ${EXCLUDE_PREFIXES.join(", ")}</span>
</div>
<div class="grid">
${snippets
  .map(
    ({ name, svg }) => `
  <div class="icon">
    ${svg}
    <code>${name}</code>
  </div>`,
  )
  .join("")}
</div>
</body>
</html>`;
}

(async () => {
  // Tous les .component.ts trouvés dans les dossiers déclarés
  const filesNested = await Promise.all(ICON_DIRS.map(walk));
  const componentFiles = [...new Set(filesNested.flat())]; // déduplication

  const snippets = [];
  for (const file of componentFiles) {
    const source = await fs.readFile(file, "utf8");
    const rawSvg = extractSvg(source);
    if (!rawSvg) continue;

    const svg = cleanSvg(rawSvg);
    const name = extractName(source, file);

    if (EXCLUDE_PREFIXES.some((p) => name.startsWith(p))) continue; // exclu

    snippets.push({ name, svg });
  }

  const html = buildHtml(snippets);
  const outPath = path.resolve(__dirname, "../icon-preview.html");
  await fs.writeFile(outPath, html, "utf8");
  console.log(`✅  Aperçu généré : ${outPath}`);
})();

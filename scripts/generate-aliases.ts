import fs from "fs";
import path from "path";

/**
 * Lit les alias depuis tsconfig.base.json au lieu de scanner le FS
 */
export function generateAliases(projectRoot: string): Record<string, string> {
  const tsconfigPath = path.join(projectRoot, "tsconfig.base.json");
  const content = fs.readFileSync(tsconfigPath, "utf-8");
  // Retirer les commentaires JSON avant parsing
  const cleaned = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const tsconfig = JSON.parse(cleaned);

  const aliases: Record<string, string> = {};
  const paths = tsconfig.compilerOptions?.paths || {};

  for (const [alias, targets] of Object.entries(paths)) {
    if (alias.startsWith("@optee/")) {
      // Prendre le premier target et le résoudre
      const target = (targets as string[])[0];
      if (target) {
        aliases[alias] = path.resolve(projectRoot, target);
      }
    }
  }

  return aliases;
}

// Si exécuté directement, afficher les alias
if (import.meta.url === `file://${process.argv[1]}`) {
  const aliases = generateAliases(process.cwd());

  console.log("🔗 Alias depuis tsconfig.base.json :");
  console.log(JSON.stringify(aliases, null, 2));
  console.log(`\n📊 Total : ${Object.keys(aliases).length} alias`);
}

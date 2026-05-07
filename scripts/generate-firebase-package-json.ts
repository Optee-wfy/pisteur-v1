import * as fs from "fs";

const bundlePath = "dist/apps/api/firebase-entry.js";
const rootPackagePath = "package.json";

let bundleCode: string;
let rootPackage: {
  dependencies?: Record<string, string>;
  engines?: { node?: string };
};

try {
  bundleCode = fs.readFileSync(bundlePath, "utf-8");
} catch (error) {
  throw new Error(`Failed to read bundle file ${bundlePath}: ${error.message}`);
}

try {
  rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, "utf-8"));
} catch (error) {
  throw new Error(`Failed to read or parse ${rootPackagePath}: ${error.message}`);
}

const regex = /(?:import\s+(?:[^'"]*?\s+from\s*)?["']|require\(\s*["'])(@?[^/"']+(?:\/[^/"']+)*)["']/g;

const matchedModules = new Set<string>();
let match;

while ((match = regex.exec(bundleCode)) !== null) {
  const moduleName = match[1].startsWith("@")
    ? match[1].split("/").slice(0, 2).join("/") // ie: @supabase/supabase-js
    : match[1].split("/")[0]; // ie: express

  matchedModules.add(moduleName);
}

const deps = rootPackage.dependencies || {};
const enginesNode = typeof rootPackage.engines?.node === "string"
  ? rootPackage.engines.node
  : "24";
const filteredDepsEntries: [string, string][] = [];
matchedModules.forEach(name => {
  const version = deps[name];
  if (version) {
    filteredDepsEntries.push([name, version]);
  }
});
const filteredDeps = Object.fromEntries(filteredDepsEntries);

const firebasePackage = {
  name: "api",
  private: true,
  type: "module",
  main: "firebase-entry.js",
  engines: { node: enginesNode },
  dependencies: filteredDeps,
};

const outputPath = "dist/apps/api/package.json";

try {
  fs.writeFileSync(outputPath, JSON.stringify(firebasePackage, null, 2));
} catch (error) {
  throw new Error(`Failed to write Firebase package.json to ${outputPath}: ${error.message}`);
}

console.log("✅ Firebase package.json generated with:", Object.keys(filteredDeps));

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Construct __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required environment variables
const apiFnName = process.env["FIREBASE_API_FN_NAME"];

if (!apiFnName) {
  console.error("Missing required environment variables:");

  if (!apiFnName) {
    console.error("- FIREBASE_API_FN_NAME");
  }

  process.exit(1);
}

const cors = process.env["VITE_ENV"] === "production"
  ? '["https://optee.io", "https://www.optee.io", "https://app.optee.io", "https://app-eu1.hubspot.com"]'
  : 'true'; // @todo That means that someone might call a Preview API from anywhere. Could be risky. Adding the preview URL would be better.

const minInstances = process.env["VITE_ENV"] === "production" ? 1 : 0;
const maxInstances = process.env["VITE_ENV"] === "production" ? 4 : 1;

const firebaseEntryPath = path.join(__dirname, '../apps/api/src/firebase-entry.ts');

const firebaseEntryContent = `
import "./instrument"; // Toujours en haut
import { onRequest } from "firebase-functions/v2/https";
import app from "./index";

export const ${apiFnName} = onRequest(
  {
    region: "europe-west1",
    invoker: "public",
    maxInstances: ${maxInstances},
    cors: ${cors},
    cpu: 1,
    memory: "2GiB",
    concurrency: 10,
    minInstances: ${minInstances}
  },
  app,
);
`;

try {
  fs.writeFileSync(firebaseEntryPath, firebaseEntryContent);
  console.log(`✅ Firebase entry generated at ${firebaseEntryPath}`);
  console.log(firebaseEntryContent);
} catch (error) {
  console.error(`❌ Failed to generate Firebase entry: ${error}`);
  process.exit(1);
}

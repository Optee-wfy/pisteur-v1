import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { API_BASE_ROUTE } from "../libs/shared/constants/src/lib/routing.constant.js";

// Construct __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseTemplateJsonPath = path.join(__dirname, "firebase.template.json");
const firebaseJsonPath = path.join(__dirname, "../firebase.json");

// Validate required environment variables
const apiFnName = process.env["FIREBASE_API_FN_NAME"];

if (!apiFnName) {
  console.error("Missing required environment variables:");

  if (!apiFnName) {
    console.error("- FIREBASE_API_FN_NAME");
  }

  process.exit(1);
}

// Define the content of firebase.json
const firebaseJson = JSON.parse(fs.readFileSync(firebaseTemplateJsonPath, "utf8"));

const rewrites = [
  {
    source: `${API_BASE_ROUTE}/**`,
    function: apiFnName,
    // pinTag: true // We want to separate both deployments, otherwise the nx "affected" feature might not work properly
  },
  {
    source: "**",
    destination: "/index.html", // SPA
  },
];

// Marketplace
firebaseJson.hosting[0].rewrites = rewrites;

const configStr = JSON.stringify(firebaseJson, null, 2);

try {
  fs.writeFileSync(firebaseJsonPath, configStr);
  console.log(
    `✅ firebase.json has been generated with function name: ${process.env["FIREBASE_API_FN_NAME"]}`,
  );

  console.log(configStr);
} catch (error) {
  console.error(`❌ Failed to write firebase.json: ${error.message}`);
  process.exit(1);
}


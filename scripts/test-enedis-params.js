// test-enedis-params.js
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import pLimit from "p-limit";


// ⚠️ Node 18+ : fetch est global

const CONCURRENCY = 5; // ⚠️ ne pas monter au-dessus
const MAX_BATIMENTS = Number.parseInt(process.env.MAX_BATIMENTS ?? "50000", 10);
const SAMPLE_LIMIT = Number.parseInt(process.env.SAMPLE_LIMIT ?? "20", 10);
const limit = pLimit(CONCURRENCY);
const databaseUrl = "http://127.0.0.1:54321";
const databaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

if (!databaseUrl || !databaseKey) {
  console.error("❌ Veuillez définir les variables databaseUrl et databaseKey dans le script avant de l’exécuter.");
  process.exit(1);
}

const supabase = createClient(databaseUrl, databaseKey);
function normalize(value) {
  if (!value) return undefined;
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

const PARAM_SETS = [
  {
    name: "adresse_complete",
    build: (b) => {
      const address = normalize(b.address);
      if (!address) return null;
      return { adresse_search: address };
    },
  },
  {
    name: "adresse_exacte",
    build: (b) => {
      const address = normalize(b.address);
      if (!address) return null;
      return { adresse_eq: address };
    },
  },
  {
    name: "voie_numero",
    build: (b) => {
      const streetName = normalize(b.streetName);
      if (!streetName || !b.streetNumber) return null;
      return {
        libelle_de_voie_search: streetName,
        numero_de_voie_eq: b.streetNumber,
      };
    },
  },
  {
    name: "voie_numero_iris",
    build: (b) => {
      const streetName = normalize(b.streetName);
      if (!streetName || !b.streetNumber || !b.codeIris) return null;
      return {
        libelle_de_voie_search: streetName,
        numero_de_voie_eq: b.streetNumber,
        code_iris_eq: b.codeIris,
      };
    },
  },
  {
    name: "voie_numero_epci",
    build: (b) => {
      const streetName = normalize(b.streetName);
      if (!streetName || !b.streetNumber || !b.codeEpci) return null;
      return {
        libelle_de_voie_search: streetName,
        numero_de_voie_eq: b.streetNumber,
        code_epci_eq: b.codeEpci,
      };
    },
  },
  {
    name: "voie_iris",
    build: (b) => {
      const streetName = normalize(b.streetName);
      if (!streetName || !b.codeIris) return null;
      return {
        libelle_de_voie_search: streetName,
        code_iris_eq: b.codeIris,
      };
    },
  },
  {
    name: "voie_epci",
    build: (b) => {
      const streetName = normalize(b.streetName);
      if (!streetName || !b.codeEpci) return null;
      return {
        libelle_de_voie_search: streetName,
        code_epci_eq: b.codeEpci,
      };
    },
  },
  {
    name: "voie_seule",
    build: (b) => {
      const streetName = normalize(b.streetName);
      if (!streetName) return null;
      return { libelle_de_voie_search: streetName };
    },
  },
  {
    name: "voie_exacte",
    build: (b) => {
      const streetName = normalize(b.streetName);
      if (!streetName) return null;
      return { libelle_de_voie_eq: streetName };
    },
  },
  {
    name: "voie_commence",
    build: (b) => {
      const streetName = normalize(b.streetName);
      if (!streetName) return null;
      return { libelle_de_voie_starts: streetName };
    },
  },
  {
    name: "voie_contient",
    build: (b) => {
      const streetName = normalize(b.streetName);
      if (!streetName) return null;
      return { libelle_de_voie_contains: streetName };
    },
  },
  {
    name: "adresse_iris",
    build: (b) => {
      const address = normalize(b.address);
      if (!address || !b.codeIris) return null;
      return { adresse_search: address, code_iris_eq: b.codeIris };
    },
  },
  {
    name: "adresse_epci",
    build: (b) => {
      const address = normalize(b.address);
      if (!address || !b.codeEpci) return null;
      return { adresse_search: address, code_epci_eq: b.codeEpci };
    },
  },
  {
    name: "adresse_voie_numero_iris_epci",
    build: (b) => {
      const address = normalize(b.address);
      const streetName = normalize(b.streetName);
      if (
        !address ||
        !streetName ||
        !b.streetNumber ||
        !b.codeIris ||
        !b.codeEpci
      ) {
        return null;
      }
      return {
        adresse_search: address,
        libelle_de_voie_search: streetName,
        numero_de_voie_eq: b.streetNumber,
        code_epci_eq: b.codeEpci,
        code_iris_eq: b.codeIris,
      };
    },
  },
  {
    name: "adresse_voie_iris_epci",
    build: (b) => {
      const address = normalize(b.address);
      const streetName = normalize(b.streetName);
      if (!address || !streetName || !b.codeIris || !b.codeEpci) return null;
      return {
        adresse_search: address,
        libelle_de_voie_search: streetName,
        code_epci_eq: b.codeEpci,
        code_iris_eq: b.codeIris,
      };
    },
  },
];

function buildEnedisUrlFromParams(paramsOverrides) {
  const params = new URLSearchParams({
    select: "consommation_annuelle_totale_de_ladresse_mwh",
    annee_eq: "2020",
    size: "1",
  });

  for (const [key, value] of Object.entries(paramsOverrides)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  return `https://opendata.enedis.fr/data-fair/api/v1/datasets/consommation-annuelle-residentielle-par-adresse/lines?${params.toString()}`;
}

async function testOne(b, paramSet) {
  const paramsOverrides = paramSet.build(b);
  if (!paramsOverrides) {
    return {
      id: b.id,
      paramSet: paramSet.name,
      skipped: true,
      reason: "missing_fields",
    };
  }

  const url = buildEnedisUrlFromParams(paramsOverrides);

  try {
    const res = await fetch(url);
    const json = await res.json();

    const conso =
      json?.results?.[0]?.consommation_annuelle_totale_de_ladresse_mwh ?? null;

    return {
      id: b.id,
      paramSet: paramSet.name,
      success: conso !== null,
      conso,
      url,
      params: paramsOverrides,
    };
  } catch (e) {
    return {
      id: b.id,
      paramSet: paramSet.name,
      success: false,
      error: String(e),
      url,
      params: paramsOverrides,
    };
  }
}


async function get50kBatiments() {
  const { data, error } = await supabase
    .from("batiments_bdnb")
    .select(`
      id:id_pg,
      streetNumber:numero_de_la_rue,
      streetName:nom_de_la_rue,
      address:source_address,
      codeIris:code_iris,
      codeEpci:code_commune_insee
    `)
    .limit(MAX_BATIMENTS);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data;
}



async function run(batiments) {
  const statsBySet = Object.fromEntries(
    PARAM_SETS.map((s) => [
      s.name,
      {
        tested: 0,
        success: 0,
        failure: 0,
        skipped: 0,
        samples: [],
      },
    ]),
  );
  let processed = 0;

  const tasks = batiments.map((b) =>
    limit(async () => {
      for (const paramSet of PARAM_SETS) {
        const r = await testOne(b, paramSet);
        const stats = statsBySet[paramSet.name];
        if (r.skipped) {
          stats.skipped++;
          continue;
        }

        stats.tested++;
        r.success ? stats.success++ : stats.failure++;

        if (stats.samples.length < SAMPLE_LIMIT) {
          stats.samples.push({
            id: r.id,
            success: r.success,
            conso: r.conso ?? null,
            url: r.url,
            params: r.params,
            address: b.address ?? null,
            streetName: b.streetName ?? null,
            streetNumber: b.streetNumber ?? null,
            codeIris: b.codeIris ?? null,
            codeEpci: b.codeEpci ?? null,
            error: r.error ?? null,
          });
        }
      }

      processed++;
      if (processed % 100 === 0) {
        console.log(`Progress: ${processed}/${batiments.length}`);
      }
    }),
  );

  await Promise.all(tasks);

  fs.writeFileSync(
    "enedis-report.json",
    JSON.stringify(
      {
        total: batiments.length,
        paramSets: Object.fromEntries(
          Object.entries(statsBySet).map(([name, s]) => [
            name,
            {
              tested: s.tested,
              success: s.success,
              failure: s.failure,
              skipped: s.skipped,
              successRate:
                s.tested === 0
                  ? "0.00%"
                  : ((s.success / s.tested) * 100).toFixed(2) + "%",
              samples: s.samples,
            },
          ]),
        ),
      },
      null,
      2,
    ),
  );

  console.log("✅ Terminé");
  for (const [name, s] of Object.entries(statsBySet)) {
    const rate =
      s.tested === 0 ? "0.00%" : ((s.success / s.tested) * 100).toFixed(2) + "%";
    console.log(
      `📊 ${name}: tested=${s.tested} success=${s.success} failure=${s.failure} skipped=${s.skipped} rate=${rate}`,
    );
  }
}

// 🔌 Exécution
(async () => {
  console.log("🚀 Script Enedis lancé");

console.log("📡 Chargement des bâtiments depuis Supabase...");
const batiments = await get50kBatiments();
console.log(`📦 ${batiments.length} bâtiments chargés`);

await run(batiments);

})();

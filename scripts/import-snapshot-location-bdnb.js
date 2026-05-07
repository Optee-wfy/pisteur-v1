import { createClient } from "@supabase/supabase-js";
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { TextDecoder } from 'util';
const TERTIAIRE_NAF_PARTS = [7, 8, 9, 10, 11, 12, 13, 14, 15]; // New parts of the "tertiaire" BDNB files to process for NAF codes
const NAF_CODE_COLUMNS = ["activitePrincipale_1", "activitePrincipale_2", "activitePrincipale_3"];
const NAF_CODES_COUNT_OUTPUT = "./assets/bdnb/bdnb-raw-tertiaire_naf_counts.csv";

// Le script lit le fichier .csv ligne par ligne grâce au module csv-parser.
// À chaque ligne lue, on fait un petit nettoyage :
// → si un champ est vide (""), on le remplace par null.
// Les lignes telles quelles sont stockées par batch de 500 ou 200.
// Une fois qu’on atteint 500 lignes, on envoie le batch dans la table Supabase snapshot-public-location-bdnb-raw.
// Ensuite, on vide le batch et on continue à lire les lignes suivantes.
// À la fin du fichier, s’il reste quelques lignes (moins de 500), elles sont aussi envoyées.
// *** utilisation ***
// lancer le script "node import-snapshot-location-bdnb.js" avec le bon nom de fichier (copro.csv ou sans-copro.csv qui sont dans ./script)
// il faut vérifier que la première colonne dans le header du CSV n’est pas vide. Si c’est le cas, il faut la nommer index.

const databaseUrl = "http://127.0.0.1:54321";
const databaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

if (!databaseUrl || !databaseKey) {
  console.error("❌ Veuillez définir les variables databaseUrl et databaseKey dans le script avant de l’exécuter.");
  process.exit(1);
}

const supabase = createClient(databaseUrl, databaseKey);

const MAC_MOJIBAKE_PATTERN = /[√¬‚≈]/;
const macDecoder = new TextDecoder('macintosh');
const macCharToByte = new Map();
for (let i = 0; i < 256; i++) {
  const char = macDecoder.decode(Uint8Array.of(i));
  if (!macCharToByte.has(char)) {
    macCharToByte.set(char, i);
  }
}

// BDNB CSVs semblent avoir été décodés en MacRoman par erreur : certaines
// lettres accentuées apparaissent donc sous forme de suites "√©", "√†", etc.
// On reconstitue les octets MacRoman puis on les relit en UTF-8 uniquement
// lorsque l'on détecte ces séquences dégradées.
function restoreAccentsIfNeeded(value) {
  if (typeof value !== "string" || !MAC_MOJIBAKE_PATTERN.test(value)) {
    return value;
  }

  const bytes = [];
  for (const char of value) {
    const macByte = macCharToByte.get(char);
    if (macByte !== undefined) {
      bytes.push(macByte);
    } else {
      const fallback = Buffer.from(char, "utf8");
      for (const b of fallback) bytes.push(b);
    }
  }

  return Buffer.from(bytes).toString("utf8");
}

const BATCH_SIZE = 200;
const failedRows = [];
const totals = { inserted: 0, failed: 0 };

// new files to fill when needed
const NEW_FILES_ONLY = ["bdnb-groupe_geom_part8.csv", "bdnb-groupe_geom_part9.csv", "bdnb-groupe_geom_part10.csv", "bdnb-groupe_geom_part11.csv", "bdnb-groupe_geom_part12.csv", "bdnb-groupe_geom_part13.csv", "bdnb-groupe_geom_part14.csv", "bdnb-groupe_geom_part15.csv", "bdnb-groupe_geom_part16.csv", "bdnb-raw-tertiaire_part7.csv", "bdnb-raw-tertiaire_part8.csv", "bdnb-raw-tertiaire_part9.csv", "bdnb-raw-tertiaire_part10.csv", "bdnb-raw-tertiaire_part11.csv", "bdnb-raw-tertiaire_part12.csv", "bdnb-raw-tertiaire_part13.csv", "bdnb-raw-tertiaire_part14.csv", "bdnb-raw-tertiaire_part15.csv"];

// If new files are added, update this list length accordingly
const FILE_CONFIGS = Array.from({ length: 16 }, (_, index) => ({
  path: `./assets/bdnb/bdnb-groupe_geom_part${index + 1}.csv`,
  table: "geom_groupe",
}));


['copro', 'public'].forEach((type) => {
  FILE_CONFIGS.push(...Array.from({ length: 4 }, (_, index) => ({
    path: `./assets/bdnb/bdnb-raw-${type}_part${index + 1}.csv`,
    table: "snapshot_public_location_bdnb_raw",
  })));
});

['tertiaire'].forEach((type) => {
  FILE_CONFIGS.push(...Array.from({ length: 15 }, (_, index) => ({
    path: `./assets/bdnb/bdnb-raw-${type}_part${index + 1}.csv`,
    table: "snapshot_public_location_bdnb_raw",
  })));
});

// Check if zipped files are unzipped
const shouldBeUnzipped = [
  "groupe_geom_part5",
  ...Array.from({ length: 4 }, (_, i) => `raw-copro_part${i + 1}`),
  ...Array.from({ length: 4 }, (_, i) => `raw-tertiaire_part${i + 1}`),
];
const missingFiles = [];
for (const file of shouldBeUnzipped) {
  if (!fs.existsSync("./assets/bdnb/bdnb-" + file + ".csv")) {
    missingFiles.push(file);
  }
}

// Check if only new files are required to import, if not, then we check the missing files
const newFilesPaths = NEW_FILES_ONLY.map((file) => path.join("./assets/bdnb", file));
const onlyNewFilesRequired =
  NEW_FILES_ONLY.length > 0 && newFilesPaths.every((filePath) => fs.existsSync(filePath));

if (missingFiles.length && !onlyNewFilesRequired) {
  console.error(`❌ Certains fichiers BDNB semblent encore zippés : ${missingFiles.join(", ")}. Veuillez les dézipper dans le dossier "./assets/bdnb/" avant de relancer le script.`);
  process.exit(1);
}

console.log(`📥 Import des données BDNB en cours...`);

(async function main() {
  try {
    // await extractTertiaireNafStats(); // Uncomment to generate counts before importing

    const filesToProcess = onlyNewFilesRequired
      ? FILE_CONFIGS.filter(({ path: filePath }) =>
          NEW_FILES_ONLY.includes(path.basename(filePath)),
        )
      : FILE_CONFIGS;

    for (const { path, table } of filesToProcess) {
      console.log(`➡️ Traitement du fichier ${path} → table ${table}`);
      const { inserted, failed, errors } = await processFile(path, table);
      totals.inserted += inserted;
      totals.failed += failed;
      if (errors.length) failedRows.push(...errors);
      console.log(`   ✅ Insérées: ${inserted} | ❌ Échecs: ${failed}`);
    }

    console.log(`📊 Bilan global: ✅ ${totals.inserted} | ❌ Échecs: ${totals.failed}`);
    if (failedRows.length) {
      fs.writeFileSync('bdnb_failed_rows.jsonl', failedRows.map((e) => JSON.stringify(e)).join('\n'));
      console.warn(`Détails des échecs dans bdnb_failed_rows.jsonl (${failedRows.length} lignes).`);
    }
  } catch (error) {
    console.error("❌ Import interrompu :", error);
    process.exitCode = 1;
  }
})();



function detectDelimiter(path) {
  const SAMPLE_SIZE = 4096;
  let fd;

  try {
    fd = fs.openSync(path, 'r');
    const buffer = Buffer.alloc(SAMPLE_SIZE);
    const bytesRead = fs.readSync(fd, buffer, 0, SAMPLE_SIZE, 0);
    const sample = buffer.slice(0, bytesRead).toString('utf-8');
    const firstLine = sample.split(/\r?\n/)[0] ?? '';
    const count = (delimiter) => (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) ?? []).length;
    const comma = count(',');
    const semicolon = count(';');

    if (comma === 0 && semicolon === 0) return ';';
    return comma > semicolon ? ',' : ';';
  } catch (error) {
    console.warn(`⚠️ Impossible de détecter le délimiteur automatiquement (${error?.message ?? error}). Utilisation du point-virgule par défaut.`);
    return ';';
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

// Extract NAF code statistics from the "tertiaire" BDNB files
async function extractTertiaireNafStats() {
  const codeCounts = new Map();
  let zeroCodeBuildings = 0;
  let rowsWithAtLeastOneCode = 0;

  // Modify TERTIAIRE_NAF_PARTS to include all parts if needed
  for (const part of TERTIAIRE_NAF_PARTS) {
    const filePath = `./assets/bdnb/bdnb-raw-tertiaire_part${part}.csv`;
    const delimiter = detectDelimiter(filePath);
    let warnedMissingColumn = false;

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath, { encoding: "UTF-8" })
        .pipe(csv({ separator: delimiter }))
        .on("data", (row) => {
          const rowCodes = [];

          for (const column of NAF_CODE_COLUMNS) {
            if (!(column in row)) {
              if (!warnedMissingColumn) {
                console.warn(`⚠️ Colonne ${column} absente dans ${filePath}. Les codes NAF peuvent être incomplets.`);
                warnedMissingColumn = true;
              }
              rowCodes.push(null);
              continue;
            }

            const raw = row[column];
            if (raw === "" || raw === "[ND]" || raw == null) {
              rowCodes.push(null);
              continue;
            }

            const cleaned = restoreAccentsIfNeeded(String(raw)).trim();
            rowCodes.push(cleaned || null);
          }

          const validCodes = rowCodes.filter(Boolean);
          if (validCodes.length === 0) {
            zeroCodeBuildings += 1;
            return;
          }

          rowsWithAtLeastOneCode += 1;

          for (const code of validCodes) {
            const current = codeCounts.get(code) ?? 0;
            codeCounts.set(code, current + 1);
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });
  }

  const sortedCounts = Array.from(codeCounts.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const lines = ["code,count", ...sortedCounts.map(([code, count]) => `${code},${count}`)];
  fs.writeFileSync(NAF_CODES_COUNT_OUTPUT, lines.join("\n"));

  console.log(`🆕 Comptage NAF généré : ${NAF_CODES_COUNT_OUTPUT}`);
  console.log(`📈 Lignes avec au moins un code NAF : ${rowsWithAtLeastOneCode}`);
  console.log(`📉 Lignes sans code NAF : ${zeroCodeBuildings}`);
}

async function processFile(filePath, table) {
  const delimiter = detectDelimiter(filePath);
  let batch = [];
  let inserted = 0;
  let failed = 0;
  const fileErrors = [];

  return new Promise((resolve, reject) => {
    let settled = false;
    let stream;

    const resolveOnce = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const rejectOnce = (err) => {
      if (settled) return;
      settled = true;
      if (stream && typeof stream.destroy === "function") {
        stream.destroy(err);
      }
      reject(err);
    };

    stream = fs
      .createReadStream(filePath, { encoding: 'UTF-8' })
      .pipe(csv({ separator: delimiter }))
      .on("error", rejectOnce)
      .on("data", async (row) => {
        try {
          const cleanedRow = {};
          for (const key in row) {
            const val = row[key];
            if (val === "" || val === "[ND]") {
              cleanedRow[key] = null;
            } else {
              cleanedRow[key] = restoreAccentsIfNeeded(val);
            }
          }

          batch.push(cleanedRow);

          if (batch.length >= BATCH_SIZE) {
            stream.pause();
            const res = await insertBatchResilient(batch, table);
            inserted += res.inserted;
            failed += res.failed;
            if (res.errors?.length) fileErrors.push(...res.errors);
            batch = [];
            stream.resume();
          }
        } catch (err) {
          rejectOnce(err);
        }
      })
      .on("end", async () => {
        try {
          if (batch.length) {
            const res = await insertBatchResilient(batch, table);
            inserted += res.inserted;
            failed += res.failed;
            if (res.errors?.length) fileErrors.push(...res.errors);
          }
          resolveOnce({ inserted, failed, errors: fileErrors });
        } catch (err) {
          rejectOnce(err);
        }
      });
  });
}

async function insertBatchResilient(rows, table, depth = 0,) {
  if (!rows.length) return { inserted: 0, failed: 0, errors: [] };

  const MAX_SPLIT_DEPTH = 8; // ~ log2(256)
  const fatalCodes = new Set(["42P01","42703","42501"]); // table/col inconnue, permission
  const isTransient = (code, msg) =>
    code === "57014" /* timeout */ ||
    code === "53300" /* too many connections */ ||
    /(?:timeout|tim(?:ing)? out|Too Many Requests|rate ?limit|ECONNRESET|ETIMEDOUT|EAI_AGAIN|^429\b)/i.test(String(msg));


  try {
    const { error } = await supabase.from(table).insert(rows, { returning: "minimal" });
    if (error) throw error;
    return { inserted: rows.length, failed: 0, errors: [] };
  } catch (err) {
    const msg = String(err?.message ?? err);
    const code = err?.code;

    console.warn(`⚠️ Échec insertion batch de ${rows.length} lignes (depth ${depth}) :`, msg, code);

    // 1) Erreurs fatales: inutile de splitter, on marque tout le batch en échec
    if (fatalCodes.has(code)) {
      return {
        inserted: 0,
        failed: rows.length,
        errors: rows.map((row) => ({ row, error: { code, msg } })),
      };
    }

    // 2) Premier retry simple pour les erreurs transitoires avant de splitter
    if (isTransient(code, msg) && depth === 0) {
      const delayMs = 800; // backoff initial
      console.warn(`↻ Retry transitoire dans ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
      return insertBatchResilient(rows, table, depth + 1);
    }

    // Si petit batch (1) : on le marque en échec et on log l’erreur
    if (rows.length === 1) {
      console.error("❌ Échec insertion ligne :", rows[0], msg, code);
      return { inserted: 0, failed: 1, errors: [{ row: rows[0], error: { code, msg } }] };
    }

    // Timeout ou erreur data : on scinde et on réessaie
    const mid = Math.floor(rows.length / 2);
    const left = rows.slice(0, mid);
    const right = rows.slice(mid);

     // Backoff en cas d’erreur transitoire
    if (isTransient(code, msg)) {
      const delayMs = Math.min(1600 * (depth + 1), 10_000); // borné
      console.warn(`⚠️ Erreur transitoire, retry après split dans ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }

    // 3) Limite de profondeur: au-delà, on tente en séquentiel unité par unité
    if (depth >= MAX_SPLIT_DEPTH) {
      let agg = { inserted: 0, failed: 0, errors: [] };
      for (const row of rows) {
        const res = await insertBatchResilient([row], table, depth + 1);
        agg.inserted += res.inserted; agg.failed += res.failed; agg.errors.push(...res.errors);
      }
      return agg;
    }

    const [a, b] = await Promise.all([
      insertBatchResilient(left, table, depth + 1),
      insertBatchResilient(right, table, depth + 1),
    ]);

    console.error(`⚠️ Résultat scindé :`, { inserted: a.inserted + b.inserted, failed: a.failed + b.failed, errors: [...a.errors, ...b.errors] });
    return {
      inserted: a.inserted + b.inserted,
      failed: a.failed + b.failed,
      errors: [...a.errors, ...b.errors],
    };
  }
}

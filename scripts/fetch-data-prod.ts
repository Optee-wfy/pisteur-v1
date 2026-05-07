import { config as loadEnv } from 'dotenv';
import { spawn } from 'node:child_process';
import console from 'node:console';
import { access, copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = dirname(__filename);
const projectRoot = resolve(scriptDir, '..');

// Load workspace-level env first, allow the script-specific file to override.
loadEnv({ path: resolve(projectRoot, '.env') });
loadEnv({ path: resolve(scriptDir, '.env'), override: true });

const password = process.env.DB_PASSWORD;

if (!password) {
  console.error('❌ Vous devez définir une variable DB_PASSWORD (dans  le fichier .env à la racine du repo) contenant le mot de passe de la base de données.');
  process.exit(1);
}

const seedFile = resolve(projectRoot, 'supabase/seed.sql');

const supabaseDbUrl = `postgresql://postgres:${encodeURIComponent(password)}@db.mtpdtpaupumtxmcipgde.supabase.co:5432/postgres?sslmode=require`;

const exclusionList = [
  'auth.refresh_tokens',
  'auth.one_time_tokens',
  'auth.sessions',
  'stacksync_logging.change_history_7c312c23',
  'auth.audit_log_entries',
  'public.simulated_locations',
  // those tables can be very large and are not useful in dev/staging;
  // can be hydrated manually if needed via `npm run db:import-bdnb`
  'public.snapshot_public_location_bdnb_raw',
  'public.batiments_bdnb',
  'public.personne_morale',
  'public.personne_morale_public',
  'public.personne_morale_tertiaire',
  'public.personne_morale_copropriete',
  'public.associations_batiments_bdnb_personne_morale',
  'public.geom_groupe'
];

const supabaseArgs = [
  'db',
  'dump',
  '--db-url',
  supabaseDbUrl,
  '-f',
  seedFile,
  '--debug',
  '--data-only',
];

for (const table of exclusionList) {
  supabaseArgs.push('-x', table);
}

const runSupabaseDump = () =>
  new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn('supabase', supabaseArgs, { stdio: 'inherit' });

    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`supabase db dump exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      rejectPromise(error);
    });
  });



const sanitizeEmails = async () => {

  try {
    await access(seedFile);
  } catch {
    throw new Error(`Le fichier de seed n'existe pas : ${seedFile}. Le dump a probablement échoué.`);
  }

  const backupFile = `${seedFile}.backup`;
  await copyFile(seedFile, backupFile);

  try {
    const seedContent = await readFile(seedFile, 'utf8');
     const updatedContent = seedContent.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '$1-dev');
    await writeFile(seedFile, updatedContent, 'utf8');
  } catch (error) {
    console.error('Erreur lors de la sanitisation, restauration du backup...');
    await copyFile(backupFile, seedFile);
    throw error;
  }
};

async function main() {
  try {
    console.log('Lancement du dump de la base de données...');
    await runSupabaseDump();
    console.log('⏳ Dump terminé, nettoyage des adresses e-mail...');
    await sanitizeEmails();
    console.log(`☑ Fichier de seed prêt à ${seedFile}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readdirSync, statSync, watch, writeFileSync } from 'fs';
import { join, relative } from 'path';

const PUBLIC_DIR = 'libs/public/assets';
const OUTPUT_FILE = 'libs/shared/constants/src/lib/assets.constant.ts';

interface Asset {
  name: string;
  path: string;
  size: number;
}

/**
 * Scan directory recursively for all files
 */
function scanAssets(dir: string): Asset[] {
  const assets: Asset[] = [];

  function scan(currentDir: string) {
    for (const item of readdirSync(currentDir)) {
      if (item.startsWith('.')) continue; // Skip hidden files

      const fullPath = join(currentDir, item);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        scan(fullPath);
      } else {
        const relativePath = relative(join(process.cwd(), PUBLIC_DIR), fullPath);
        const name = generateConstantName(relativePath);

        assets.push({
          name,
          path: relativePath.replace(/\\/g, '/'),
          size: stats.size
        });
      }
    }
  }

  scan(dir);
  return assets.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Convert file path to CONSTANT_NAME
 */
function generateConstantName(path: string): string {
  return path
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[\/\\]/g, '_')   // Replace slashes
    .replace(/[^a-zA-Z0-9_]/g, '_') // Replace special chars
    .replace(/_+/g, '_')       // Remove multiple underscores
    .toUpperCase();
}

/**
 * Format file size
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/**
 * Generate TypeScript constants file
 */
function generateCode(assets: Asset[]): string {
  const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);

  return `/**
 * Auto-generated asset constants
 * DO NOT EDIT MANUALLY - Your changes will be overwritten
 *
 * Total assets: ${assets.length}
 */

export const PUBLIC_ASSETS = {
${assets.map(asset => `  ${asset.name}: "${asset.path}", // ${formatSize(asset.size)}`).join('\n')}
} as const;

export type PublicAssetPath = typeof PUBLIC_ASSETS[keyof typeof PUBLIC_ASSETS];

export function buildAssetUrl(path: PublicAssetPath, baseUrl = "/assets"): string {
  return \`\${baseUrl}/\${path}\`;
}

export function isValidAssetPath(path: string): path is PublicAssetPath {
  return Object.values(PUBLIC_ASSETS).includes(path as PublicAssetPath);
}

export const ASSET_METADATA = {
  totalAssets: ${assets.length},
  totalSize: ${totalSize},
} as const;
`;
}

/**
 * Apply ESLint fixes
 */
async function applyLintFixes(filePath: string): Promise<void> {
  try {
    execSync(`npx eslint "${filePath}" --fix`, { stdio: 'pipe' });
    console.log('✅ ESLint fixes applied');
  } catch {
    try {
      execSync(`npx prettier "${filePath}" --write`, { stdio: 'pipe' });
      console.log('✅ Prettier formatting applied');
    } catch {
      console.log('⚠️  No linting tools available');
    }
  }
}

/**
 * Main generation function
 */
async function generate(): Promise<void> {
  const publicDir = join(process.cwd(), PUBLIC_DIR);
  const outputFile = join(process.cwd(), OUTPUT_FILE);

  console.log(`🔍 Scanning: ${publicDir}`);

  const assets = scanAssets(publicDir);
  const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);

  console.log(`✅ Found ${assets.length} assets (${formatSize(totalSize)})`);

  const code = generateCode(assets);
  writeFileSync(outputFile, code, 'utf-8');
  console.log(`📝 Generated: ${outputFile}`);

  await applyLintFixes(outputFile);
  console.log('🎉 Done!');
}

/**
 * Watch mode
 */
async function watchMode(): Promise<void> {
  console.log(`👀 Watching: ${PUBLIC_DIR}`);

  await generate();

  watch(join(process.cwd(), PUBLIC_DIR), { recursive: true }, async (eventType, filename) => {
    if (filename && !filename.startsWith('.')) {
      console.log(`\n📁 Change detected: ${filename}`);
      await generate();
    }
  });
}

// CLI
const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');

if (isWatch) {
  watchMode().catch(console.error);
} else {
  generate().catch(console.error);
}

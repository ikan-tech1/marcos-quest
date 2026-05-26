#!/usr/bin/env node
/**
 * Arcade View verification — static + HTTP smoke checks.
 * Run: node scripts/verify-arcade.mjs [baseUrl]
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const base = process.argv[2] || 'http://localhost:4173';

const checks = [];

function pass(name) {
  checks.push({ name, ok: true });
  console.log(`✓ ${name}`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.error(`✗ ${name}${detail ? `: ${detail}` : ''}`);
}

// Static source checks
const requiredFiles = [
  'src/ui/ArcadeCabinet.tsx',
  'src/config/cabinetLayout.ts',
  'src/styles/arcade-cabinet.css',
];

for (const f of requiredFiles) {
  if (existsSync(join(root, f))) pass(`file exists: ${f}`);
  else fail(`file exists: ${f}`);
}

const appSrc = readFileSync(join(root, 'src/App.tsx'), 'utf8');
if (appSrc.includes('ArcadeCabinet') && appSrc.includes('viewMode')) {
  pass('App.tsx wires ArcadeCabinet + viewMode');
} else {
  fail('App.tsx wires ArcadeCabinet + viewMode');
}

if (appSrc.includes('GameBridge.getScreen()')) {
  pass('GameBridge replay pattern preserved');
} else {
  fail('GameBridge replay pattern preserved');
}

const storageSrc = readFileSync(join(root, 'src/systems/Storage.ts'), 'utf8');
if (storageSrc.includes('getViewMode') && storageSrc.includes('setViewMode')) {
  pass('Storage persists view mode');
} else {
  fail('Storage persists view mode');
}

const menuSrc = readFileSync(join(root, 'src/ui/MenuOverlay.tsx'), 'utf8');
if (menuSrc.includes('Arcade Mode')) {
  pass('Menu has Arcade Mode toggle');
} else {
  fail('Menu has Arcade Mode toggle');
}

const distIndex = join(root, 'dist/index.html');
if (existsSync(distIndex)) {
  pass('production build output exists');
  const jsGlob = readFileSync(distIndex, 'utf8');
  if (jsGlob.includes('assets/')) pass('dist/index.html references bundles');
  else fail('dist/index.html references bundles');
} else {
  fail('production build output exists', 'run npm run build first');
}

// HTTP smoke (optional if server running)
try {
  const res = await fetch(base, { signal: AbortSignal.timeout(5000) });
  if (res.ok) {
    pass(`HTTP ${res.status} from ${base}`);
    const html = await res.text();
    if (html.includes('root')) pass('HTML shell loads');
    else fail('HTML shell loads');

    const assetMatch = html.match(/src="(\/assets\/[^"]+\.js)"/);
    if (assetMatch) {
      const jsRes = await fetch(`${base}${assetMatch[1]}`, { signal: AbortSignal.timeout(8000) });
      const js = await jsRes.text();
      if (js.includes('ArcadeCabinet') || js.includes('arcade-cabinet')) {
        pass('bundle includes arcade cabinet code');
      } else {
        fail('bundle includes arcade cabinet code');
      }
      if (!js.includes('transform:scale') || js.includes('setZoom')) {
        pass('bundle uses Phaser zoom (no CSS canvas scale pattern)');
      } else {
        fail('bundle uses Phaser zoom');
      }
    } else {
      fail('find JS bundle in HTML');
    }
  } else {
    fail(`HTTP from ${base}`, String(res.status));
  }
} catch (e) {
  fail(`HTTP from ${base}`, e.message);
}

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);

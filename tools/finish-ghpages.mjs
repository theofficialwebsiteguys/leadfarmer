/**
 * Post-processes the docs/ build for GitHub Pages.
 *
 * This repository's Pages site is served from the `main` branch's /docs folder
 * — NOT from a gh-pages branch. Deploying with angular-cli-ghpages pushes to a
 * branch Pages ignores, which looks like it worked and changes nothing.
 *
 * Two files Pages needs that the Angular build does not produce:
 *   404.html   — Pages serves this for unknown paths, so copying index.html into
 *                it is what makes deep links like /strains/mac1 work on refresh.
 *   .nojekyll  — stops Jekyll from dropping files whose names start with "_".
 *
 * Run via: npm run build:ghpages
 */

import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docs = resolve(repoRoot, 'docs');
const index = resolve(docs, 'index.html');

if (!existsSync(index)) {
  console.error('docs/index.html not found — did the build run?');
  process.exit(1);
}

copyFileSync(index, resolve(docs, '404.html'));
writeFileSync(resolve(docs, '.nojekyll'), '');

// Fail loudly if the base href is wrong: a corrupted one produces a page that
// loads nothing at all, and it is not obvious from the build output.
const html = (await import('node:fs')).readFileSync(index, 'utf8');
const base = html.match(/<base href="([^"]*)">/)?.[1];

if (base !== '/leadfarmer/') {
  console.error(`\nBase href is "${base}", expected "/leadfarmer/".`);
  console.error('The site will load nothing. Check the ghpages configuration in angular.json.');
  process.exit(1);
}

console.log('docs/ ready for GitHub Pages');
console.log(`  base href : ${base}`);
console.log('  404.html  : written (SPA deep links)');
console.log('  .nojekyll : written');

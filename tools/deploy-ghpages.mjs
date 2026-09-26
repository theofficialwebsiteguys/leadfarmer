/**
 * Publishes the docs/ build to the `gh-pages` branch, which is what GitHub Pages
 * actually serves for this repository.
 *
 * Pushing main does NOT deploy: Pages watches gh-pages, so a main-only push
 * triggers no build and silently leaves the old site live. This script copies
 * docs/ onto that branch via a temporary worktree, so the working tree and the
 * current branch are never disturbed.
 *
 * Run via: npm run deploy:ghpages   (after npm run build:ghpages)
 */

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docs = resolve(repoRoot, 'docs');
const BRANCH = 'gh-pages';

const git = (...args) =>
  execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// Refuse to publish a build that is missing or misconfigured — a wrong base href
// produces a page that loads nothing, and that is easy to miss.
if (!existsSync(join(docs, 'index.html'))) {
  console.error('docs/index.html not found — run `npm run build:ghpages` first.');
  process.exit(1);
}
const base = readFileSync(join(docs, 'index.html'), 'utf8').match(/<base href="([^"]*)">/)?.[1];
if (base !== '/leadfarmer/') {
  console.error(`docs/ has base href "${base}", expected "/leadfarmer/". Not publishing.`);
  process.exit(1);
}

const bundle = readdirSync(docs).find((f) => /^main-[A-Z0-9]+\.js$/.test(f));
console.log(`Publishing docs/ to ${BRANCH} (bundle: ${bundle})`);

git('fetch', 'origin', BRANCH);

const worktree = mkdtempSync(join(tmpdir(), 'lf-ghpages-'));
try {
  git('worktree', 'add', '--force', worktree, `origin/${BRANCH}`);
  git('-C', worktree, 'checkout', '-B', BRANCH, `origin/${BRANCH}`);

  // Clear the branch's contents, keeping git's own bookkeeping, then lay down
  // the fresh build. Removing tracked files this way means deletions are staged.
  execFileSync('git', ['rm', '-rq', '--ignore-unmatch', '.'], { cwd: worktree, stdio: 'ignore' });
  for (const entry of readdirSync(worktree)) {
    if (entry !== '.git') rmSync(join(worktree, entry), { recursive: true, force: true });
  }
  cpSync(docs, worktree, { recursive: true });

  execFileSync('git', ['add', '-A'], { cwd: worktree, stdio: 'ignore' });

  const staged = execFileSync('git', ['status', '--porcelain'], { cwd: worktree, encoding: 'utf8' }).trim();
  if (!staged) {
    console.log('gh-pages already matches docs/ — nothing to publish.');
  } else {
    const head = git('rev-parse', '--short', 'HEAD');
    execFileSync('git', ['commit', '-q', '-m', `Publish build from ${head} (${bundle})`], { cwd: worktree });
    execFileSync('git', ['push', 'origin', BRANCH], { cwd: worktree, stdio: 'inherit' });
    console.log(`\nPushed to ${BRANCH}. Pages builds in about a minute:`);
    console.log('  https://theofficialwebsiteguys.github.io/leadfarmer/');
  }
} finally {
  try {
    git('worktree', 'remove', '--force', worktree);
  } catch {
    rmSync(worktree, { recursive: true, force: true });
  }
  git('worktree', 'prune');
}

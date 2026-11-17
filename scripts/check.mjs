#!/usr/bin/env node
// Verifies every internal link, image, script and stylesheet in _site
// resolves to a real file, and that each page has exactly one <h1>,
// a unique <title> and a meta description. Exits non-zero on problems.
//   node scripts/check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const base = new URL(site.siteUrl).pathname.replace(/\/$/, '');
const problems = [];
const titles = new Map();

const htmlFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(OUT);

let checked = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(OUT, file);
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) problems.push(`${rel}: has ${h1s} <h1> elements`);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title) problems.push(`${rel}: missing <title>`);
  else if (titles.has(title) && rel !== '404.html') problems.push(`${rel}: duplicate title with ${titles.get(title)}`);
  else titles.set(title, rel);
  if (!/<meta name="description" content="[^"]{50,}"/.test(html)) problems.push(`${rel}: missing/short meta description`);

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    let url = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|data:)/.test(url) || url.startsWith('//')) continue;
    checked++;
    const [p, hash] = url.split('#');
    let target;
    if (p === '') target = file;
    else if (p.startsWith('/')) {
      if (!p.startsWith(base + '/')) { problems.push(`${rel}: absolute link outside repo path: ${url}`); continue; }
      target = path.join(OUT, p.slice(base.length).split('?')[0]);
    } else target = path.resolve(path.dirname(file), p.split('?')[0]);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) { problems.push(`${rel}: broken link → ${url}`); continue; }
    if (hash) {
      const targetIds = target === file ? ids : new Set([...fs.readFileSync(target, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]));
      if (!targetIds.has(hash)) problems.push(`${rel}: missing anchor #${hash} in ${url}`);
    }
  }
}

// Brand safety: no Restore + Revive branding beyond the (flagged) email address.
for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8').replace(/drrainey@restoreandrevive\.com/g, '');
  if (/restore\s*(\+|&amp;|and)\s*revive/i.test(text)) problems.push(`${path.relative(OUT, file)}: mentions Restore + Revive`);
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n  ` + problems.join('\n  '));
  process.exit(1);
}
console.log(`✓ ${htmlFiles.length} pages, ${checked} internal links/assets checked — no problems.`);

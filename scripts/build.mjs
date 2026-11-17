#!/usr/bin/env node
// Build the static site from /content into /_site.
//   node scripts/build.mjs
// No dependencies — requires Node 18+.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontMatter, renderMarkdown, escapeHtml as esc } from './markdown.mjs';
import {
  layout, pageHero, photo, ctaBand, contactCard, serviceHref, homePage, physicianJsonLd, button, textLink, pending,
} from './templates.mjs';
import { icons } from './icons.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, '_site');

const site = JSON.parse(fs.readFileSync(path.join(CONTENT, 'site.json'), 'utf8'));
const photos = JSON.parse(fs.readFileSync(path.join(CONTENT, 'photos.json'), 'utf8'));
delete photos._readme;
const version = Date.now().toString(36);
const basePath = new URL(site.siteUrl).pathname.replace(/\/$/, ''); // e.g. /Doctor-Rainey

const read = (p) => parseFrontMatter(fs.readFileSync(path.join(CONTENT, p), 'utf8'));
const hasAsset = (file) => !!file && fs.existsSync(path.join(ROOT, 'assets/images', file));

/** Build a context for a page living at `pagePath` (e.g. "/about/"). */
function makeCtx(pagePath, { absolute = false } = {}) {
  const depth = pagePath.split('/').filter(Boolean).length;
  const prefix = depth ? '../'.repeat(depth) : './';
  const ctx = {
    site, photos, version, hasAsset,
    url(href) {
      if (!href || !href.startsWith('/') || href.startsWith('//')) return href;
      if (absolute) return basePath + href;
      const rest = href.slice(1);
      return rest ? (depth ? prefix + rest : rest) : prefix;
    },
  };
  ctx.photo = (id) => photo(ctx, id);
  return ctx;
}

const pages = []; // { path, lastmod }
function write(pagePath, html) {
  const file = pagePath === '/404.html' ? path.join(OUT, '404.html') : path.join(OUT, pagePath, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (pagePath !== '/404.html') pages.push({ path: pagePath });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'README.md') continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

/* ---------------------------------------------------------------------------
   Load content
--------------------------------------------------------------------------- */
const services = fs
  .readdirSync(path.join(CONTENT, 'services'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ slug: f.replace(/\.md$/, ''), ...read(`services/${f}`) }))
  .sort((a, b) => a.data.order - b.data.order);

const articles = fs
  .readdirSync(path.join(CONTENT, 'articles'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ slug: f.replace(/\.md$/, ''), ...read(`articles/${f}`) }))
  .filter((a) => site.previewMode || a.data.reviewStatus === 'approved')
  .sort((a, b) => String(b.data.date).localeCompare(String(a.data.date)) || a.data.title.localeCompare(b.data.title));

const md = (src, ctx) => renderMarkdown(src, ctx).html;

/* ---------------------------------------------------------------------------
   Pages
--------------------------------------------------------------------------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// HOME ----------------------------------------------------------------------
{
  const { data, body } = read('home.md');
  const ctx = makeCtx('/');
  const sections = {};
  for (const part of body.split(/<!--\s*section:\s*([a-z]+)\s*-->/).slice(1).reduce((acc, v, i, arr) => (i % 2 === 0 ? acc.concat([[v, arr[i + 1]]]) : acc), [])) {
    sections[part[0]] = md(part[1], ctx);
  }
  write('/', homePage(ctx, { fm: data, sections, services }));
}

// Generic Markdown page ------------------------------------------------------
function proseLayout(ctx, html, aside = '') {
  return `<div class="container page-body${aside ? ' page-body--aside' : ''}">
  <div class="prose prose--page" data-reveal>${html}</div>
  ${aside}
</div>`;
}

// ABOUT ---------------------------------------------------------------------
{
  const { data, body } = read('about.md');
  const p = '/about/';
  const ctx = makeCtx(p);
  const aside = `<aside class="glance" aria-labelledby="glance-title" data-reveal>
    <h2 id="glance-title" class="glance__title">At a glance</h2>
    <dl>
      <div><dt>Name</dt><dd>${esc(site.physicianName)}</dd></div>
      <div><dt>Degree</dt><dd>Doctor of Osteopathic Medicine</dd></div>
      <div><dt>Specialty</dt><dd>Pediatrics</dd></div>
      <div><dt>Office</dt><dd>${esc(site.contact.streetAddress)}, Fort Worth</dd></div>
      <div><dt>Training</dt><dd>${pending(ctx, 'To be supplied') || '—'}</dd></div>
      <div><dt>Board certification</dt><dd>${pending(ctx, 'To be confirmed') || '—'}</dd></div>
    </dl>
    ${textLink(ctx, '/new-patients/', 'Become a patient')}
  </aside>`;
  write(
    p,
    layout(ctx, {
      title: data.title, description: data.description, path: p, bodyClass: 'page-about',
      breadcrumb: [{ label: 'Home', href: '/' }, { label: 'About Dr. Rainey', href: p }],
      jsonLd: [physicianJsonLd(ctx)],
      body: pageHero(ctx, data) + proseLayout(ctx, md(body, ctx), aside) +
        ctaBand(ctx, {
          title: 'Welcoming new families',
          text: 'Learn how to become a patient of Dr. Rainey.',
          primary: { href: '/new-patients/', label: 'New patient information', variant: 'light' },
          secondary: { href: '/contact/', label: 'Contact the office' },
        }),
    })
  );
}

// PEDIATRIC CARE ------------------------------------------------------------
{
  const { data } = read('pediatric-care.md');
  const p = '/pediatric-care/';
  const ctx = makeCtx(p);
  const list = services
    .map(
      (s, i) => `<section id="${s.slug}" class="service" aria-labelledby="svc-${s.slug}">
    <div class="service__meta" data-reveal>
      <span class="service__num">${String(i + 1).padStart(2, '0')}</span>
      <span class="service__icon">${icons[s.data.icon] || icons.leaf}</span>
    </div>
    <div class="service__body" data-reveal style="--d:1">
      <h2 id="svc-${s.slug}" class="service__title">${esc(s.data.title)}</h2>
      <p class="service__summary">${esc(s.data.summary)}</p>
      <div class="prose">${md(s.body, ctx)}</div>
      ${s.data.published ? textLink(ctx, serviceHref(s), `More about ${s.data.title.toLowerCase()}`) : ''}
    </div>
  </section>`
    )
    .join('\n');
  const toc = `<nav class="service-toc" aria-label="Areas of care" data-reveal style="--d:3"><ul>${services
    .map((s) => `<li><a href="#${s.slug}">${esc(s.data.title)}</a></li>`)
    .join('')}</ul></nav>`;
  write(
    p,
    layout(ctx, {
      title: data.title, description: data.description, path: p, bodyClass: 'page-care',
      breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Pediatric Care', href: p }],
      body: pageHero(ctx, data, { aside: toc }) +
        `<div class="container services">${list}</div>` +
        ctaBand(ctx, {
          title: 'Ready to get started?',
          text: 'Learn what to expect as a new patient, or call the office with your questions.',
          primary: { href: '/new-patients/', label: 'New patient information', variant: 'light' },
          secondary: { href: `tel:${site.contact.phoneE164}`, label: `Call ${site.contact.phoneDisplay}`, icon: 'phone' },
        }),
    })
  );

  // Individual service pages — generated only once a service is confirmed (published: true).
  for (const s of services.filter((s) => s.data.published)) {
    const sp = `/pediatric-care/${s.slug}/`;
    const sctx = makeCtx(sp);
    write(
      sp,
      layout(sctx, {
        title: `${s.data.title} in Fort Worth | ${site.title}`,
        description: s.data.summary, path: sp, bodyClass: 'page-service',
        breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Pediatric Care', href: p }, { label: s.data.title, href: sp }],
        body: pageHero(sctx, { eyebrow: 'Pediatric Care', h1: s.data.title, lede: s.data.summary }) +
          proseLayout(sctx, md(s.body, sctx)) +
          ctaBand(sctx, {
            title: 'Questions about your child’s care?', text: 'Call the office or learn how to become a patient.',
            primary: { href: '/new-patients/', label: 'New patient information', variant: 'light' },
          }),
      })
    );
  }
}

// NEW PATIENTS ----------------------------------------------------------------
{
  const { data, body } = read('new-patients.md');
  const p = '/new-patients/';
  const ctx = makeCtx(p);
  write(
    p,
    layout(ctx, {
      title: data.title, description: data.description, path: p, bodyClass: 'page-new-patients',
      breadcrumb: [{ label: 'Home', href: '/' }, { label: 'New Patients', href: p }],
      body: pageHero(ctx, data) + proseLayout(ctx, md(body, ctx)) +
        ctaBand(ctx, {
          title: 'Have a question before you begin?',
          text: 'The office is happy to help. Please call rather than sending medical details by email.',
          primary: { href: `tel:${site.contact.phoneE164}`, label: `Call ${site.contact.phoneDisplay}`, variant: 'light', icon: 'phone' },
          secondary: { href: '/contact/', label: 'Contact & directions' },
        }),
    })
  );
}

// RESOURCES + ARTICLES -----------------------------------------------------
const reviewLabel = (a) =>
  a.data.reviewStatus === 'approved'
    ? `Medically reviewed by ${esc(a.data.reviewer)}${a.data.reviewedDate ? ` · ${esc(a.data.reviewedDate)}` : ''}`
    : `Draft · Medical review pending (${esc(a.data.reviewer)})`;

{
  const { data } = read('resources.md');
  const p = '/resources/';
  const ctx = makeCtx(p);
  const cards = articles
    .map(
      (a) => `<li class="article-card" data-reveal>
      <a class="article-card__link" href="${ctx.url(`/resources/${a.slug}/`)}">
        <span class="article-card__cat">${esc(a.data.category)}</span>
        <h3 class="article-card__title">${esc(a.data.title)}</h3>
        <p class="article-card__desc">${esc(a.data.description)}</p>
        <span class="article-card__meta"><span class="review-badge review-badge--${a.data.reviewStatus}">${reviewLabel(a)}</span><span>${esc(a.data.readingTime || '')}</span></span>
        <span class="article-card__more">Read article ${icons.arrow}</span>
      </a>
    </li>`
    )
    .join('\n');
  const resources = [
    ['HealthyChildren.org', 'Parent information from the American Academy of Pediatrics.', 'https://www.healthychildren.org/'],
    ['CDC — Vaccines & Immunizations', 'Immunization information from the Centers for Disease Control and Prevention.', 'https://www.cdc.gov/vaccines/'],
    ['Safe to Sleep', 'Safe infant sleep guidance from the National Institutes of Health.', 'https://safetosleep.nichd.nih.gov/'],
    ['Poison Help — 1-800-222-1222', 'Free, confidential help from poison control experts, 24 hours a day.', 'https://poisoncenters.org/'],
    ['988 Suicide & Crisis Lifeline', 'Call or text 988 for free, confidential support, 24 hours a day.', 'https://988lifeline.org/'],
  ];
  const body = `${pageHero(ctx, data)}
<section class="container articles" aria-labelledby="articles-title">
  <div class="articles__grid">
    <div>
      <h2 id="articles-title" class="h-section" data-reveal>Articles for parents</h2>
      <ul class="article-list" role="list" data-stagger>${cards}</ul>
    </div>
    <div class="articles__side">${photo(ctx, 'detail-texture', { parallax: '0.05' })}</div>
  </div>
</section>
<section class="container trusted" aria-labelledby="trusted-title">
  <h2 id="trusted-title" class="h-section" data-reveal>Trusted resources</h2>
  <p class="trusted__intro" data-reveal>Reliable national sources for health information. ${pending(ctx, 'Resource list pending Dr. Rainey’s approval.')}</p>
  <ul class="trusted__list" role="list" data-stagger>
    ${resources
      .map(
        ([t, d, h]) => `<li data-reveal><a href="${h}" rel="noopener" target="_blank"><span class="trusted__name">${t}${icons.external}</span><span class="trusted__desc">${d}</span><span class="visually-hidden"> (opens in a new tab)</span></a></li>`
      )
      .join('\n    ')}
  </ul>
  <aside class="callout callout--note" data-reveal><p class="callout__label">In an emergency</p><p>These resources are for general information. If your child has a medical emergency, call <a href="tel:911">911</a>.</p></aside>
</section>`;
  write(
    p,
    layout(ctx, {
      title: data.title, description: data.description, path: p, bodyClass: 'page-resources',
      breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Articles & Resources', href: p }],
      body,
    })
  );

  for (const a of articles) {
    const ap = `/resources/${a.slug}/`;
    const actx = makeCtx(ap);
    const others = articles.filter((o) => o !== a).slice(0, 2);
    const abody = `<article class="article">
  <header class="article__head container">
    <nav class="breadcrumb" aria-label="Breadcrumb" data-reveal><ol><li><a href="${actx.url('/')}">Home</a></li><li><a href="${actx.url('/resources/')}">Articles &amp; Resources</a></li><li aria-current="page">${esc(a.data.title)}</li></ol></nav>
    <p class="eyebrow" data-reveal>${esc(a.data.category)}</p>
    <h1 class="article__title" data-reveal style="--d:1">${esc(a.data.title)}</h1>
    <p class="lede" data-reveal style="--d:2">${esc(a.data.description)}</p>
    <dl class="byline" data-reveal style="--d:3">
      <div><dt>Written by</dt><dd>${esc(a.data.author)}</dd></div>
      <div><dt>Medical review</dt><dd><span class="review-badge review-badge--${a.data.reviewStatus}">${reviewLabel(a)}</span></dd></div>
      <div><dt>${a.data.reviewStatus === 'approved' ? 'Published' : 'Drafted'}</dt><dd><time datetime="${esc(a.data.date)}">${new Date(a.data.date + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time></dd></div>
    </dl>
  </header>
  <div class="container page-body">
    <div class="prose prose--page" data-reveal>${md(a.body, actx)}
      <aside class="callout callout--disclaimer"><p>This article is general information for parents and is not a substitute for medical advice about your own child. If you are worried about your child's health, contact your pediatrician. In an emergency, call <a href="tel:911">911</a>.</p></aside>
    </div>
  </div>
  ${others.length ? `<nav class="container related" aria-labelledby="related-title"><h2 id="related-title" class="h-section">More for parents</h2><ul role="list">${others.map((o) => `<li><a href="${actx.url(`/resources/${o.slug}/`)}">${esc(o.data.title)}${icons.arrow}</a></li>`).join('')}</ul></nav>` : ''}
</article>`;
    write(
      ap,
      layout(actx, {
        title: `${a.data.title} | ${site.title}`, description: a.data.description, path: ap, bodyClass: 'page-article', ogType: 'article',
        breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Articles & Resources', href: '/resources/' }, { label: a.data.title, href: ap }],
        jsonLd: [{
          '@context': 'https://schema.org', '@type': 'Article', headline: a.data.title, description: a.data.description,
          datePublished: a.data.date, url: site.siteUrl + ap,
          ...(a.data.reviewStatus === 'approved' ? { reviewedBy: { '@type': 'Physician', name: a.data.reviewer } } : {}),
        }],
        body: abody,
      })
    );
  }
}

// CONTACT ---------------------------------------------------------------------
{
  const { data } = read('contact.md');
  const p = '/contact/';
  const ctx = makeCtx(p);
  const body = `${pageHero(ctx, data)}
<section class="container contact" aria-label="Contact details and directions">
  <div class="contact__grid">
    <div>${contactCard(ctx, { headingLevel: 2 })}</div>
    <div class="contact__media">${photo(ctx, 'office-exterior')}</div>
  </div>
  <div class="contact__notes">
    <section class="note-block" data-reveal aria-labelledby="dir-title">
      <h2 id="dir-title">Finding the office</h2>
      <p>The office is at ${esc(site.contact.streetAddress)}, Fort Worth, Texas ${esc(site.contact.postalCode)}, in the west side of the city.</p>
      <p>${pending(ctx, 'Parking, building entrance, suite number, and accessibility details to be supplied.')}</p>
    </section>
    <section class="note-block" data-reveal style="--d:1" aria-labelledby="privacy-title">
      <h2 id="privacy-title">Why there is no contact form</h2>
      <p>To protect your family's privacy, this website does not collect messages or medical information. Please call the office, and share health details during your visit or by phone.</p>
    </section>
    <section class="note-block note-block--urgent" data-reveal style="--d:2" aria-labelledby="urgent-title">
      <h2 id="urgent-title">If it can't wait</h2>
      <p>If your child has a medical emergency, call <a href="tel:911">911</a> or go to the nearest emergency room. For a possible poisoning, call Poison Help at <a href="tel:+18002221222">1-800-222-1222</a>.</p>
      <p>${pending(ctx, 'After-hours instructions for current patients to be supplied.')}</p>
    </section>
  </div>
</section>`;
  write(
    p,
    layout(ctx, {
      title: data.title, description: data.description, path: p, bodyClass: 'page-contact',
      breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Contact', href: p }],
      jsonLd: [physicianJsonLd(ctx)],
      body,
    })
  );
}

// PRIVACY ---------------------------------------------------------------------
{
  const { data, body } = read('privacy.md');
  const p = '/privacy/';
  const ctx = makeCtx(p);
  write(
    p,
    layout(ctx, {
      title: data.title, description: data.description, path: p, bodyClass: 'page-privacy',
      breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Privacy', href: p }],
      body: pageHero(ctx, data) + proseLayout(ctx, md(body, ctx)),
    })
  );
}

// 404 (served from any depth, so it uses absolute repository-path links) ---------
{
  const ctx = makeCtx('/404.html', { absolute: true });
  write(
    '/404.html',
    layout(ctx, {
      title: `Page not found | ${site.title}`,
      description: 'The page you were looking for could not be found on the website of Shane Rainey, DO, pediatrician in Fort Worth, Texas.',
      path: '/404.html', bodyClass: 'page-404',
      body: `<section class="page-hero" aria-labelledby="page-title"><div class="container page-hero__inner"><div class="page-hero__text">
  <p class="eyebrow">Page not found</p>
  <h1 id="page-title" class="page-hero__title">This path wanders off the map.</h1>
  <p class="lede">The page you were looking for may have moved. These links will get you back on the trail.</p>
  <div class="btn-row">${button(ctx, { href: '/', label: 'Return home' })}${button(ctx, { href: '/contact/', label: 'Contact the office', variant: 'outline' })}</div>
</div></div></section>`,
    })
  );
}

/* ---------------------------------------------------------------------------
   Assets, sitemap, robots, photo guide
--------------------------------------------------------------------------- */
copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${site.siteUrl}${p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`
);
fs.writeFileSync(
  path.join(OUT, 'robots.txt'),
  site.previewMode
    ? `# Preview draft — please do not index.\nUser-agent: *\nDisallow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`
    : `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`
);

// PHOTO-GUIDE.md is generated from content/photos.json so it never drifts.
const guide = [
  '# Photo & Video Guide',
  '',
  '_This file is generated from `content/photos.json` by `node scripts/build.mjs`. Edit the JSON, not this file._',
  '',
  'Every image slot on the site is listed below. Until a file exists at the path shown, the site displays an outlined wireframe placeholder in the exact size and position the photo will occupy.',
  '',
  '## How to replace a placeholder',
  '',
  '1. Export the photo as **JPG** (quality ~80) at the recommended size. Keep files under ~400 KB where possible ([squoosh.app](https://squoosh.app) works well).',
  '2. Save it with **exactly** the filename and folder listed below, inside `assets/images/`.',
  '3. Run `node scripts/build.mjs` (or just push — the GitHub Action rebuilds the site). The placeholder is replaced automatically; no layout changes are needed.',
  '4. If the photo differs from the description, update its `alt` text in `content/photos.json`.',
  '',
  '**Never** use stock photographs presented as Dr. Rainey, his family, his patients, or his office. Patient photographs require a signed release from a parent or guardian.',
  '',
  '| # | Slot | File (in `assets/images/`) | Ratio | Recommended size | Used on |',
  '|---|---|---|---|---|---|',
  ...Object.entries(photos).map(([id, p]) => `| ${p.number} | ${p.title} | \`${p.file}\` | ${p.ratio.replace('/', ':')} | ${p.size} | ${p.usedOn} |`),
  '',
  ...Object.entries(photos).flatMap(([id, p]) => [
    `## ${p.number}. ${p.title}`,
    '',
    `- **Slot id:** \`${id}\``,
    `- **File:** \`assets/images/${p.file}\`${p.poster ? `  \n- **Poster image:** \`assets/images/${p.poster}\`` : ''}${p.captions ? `  \n- **Captions:** \`assets/images/${p.captions}\`` : ''}`,
    `- **Aspect ratio:** ${p.ratio.replace('/', ':')}`,
    `- **Recommended size:** ${p.size}`,
    `- **What to capture:** ${p.description}`,
    `- **Cropping:** ${p.crop}`,
    `- **Alt text:** "${p.alt}"`,
    `- **Used on:** ${p.usedOn}`,
    `- **Permission:** ${p.permission}`,
    `- **Status:** ${hasAsset(p.file) ? 'Supplied ✔' : 'Needed'}`,
    '',
  ]),
].join('\n');
fs.writeFileSync(path.join(ROOT, 'PHOTO-GUIDE.md'), guide);

console.log(`Built ${pages.length + 1} pages → _site/ (preview mode: ${site.previewMode})`);

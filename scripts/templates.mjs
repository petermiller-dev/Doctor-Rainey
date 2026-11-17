// Reusable page templates and components.
// Every page is assembled from layout() + the components below, so the
// header, footer, buttons, cards and photo frames are defined exactly once.

import { escapeHtml as esc } from './markdown.mjs';
import { icons } from './icons.mjs';
import { landscapeScene } from './landscape.mjs';

/* ---------------------------------------------------------------------------
   Small helpers
--------------------------------------------------------------------------- */
const year = new Date().getFullYear();

export function button(ctx, { href, label, variant = 'primary', icon = 'arrow', attrs = '' }) {
  const ext = /^(https?:|tel:|mailto:)/.test(href);
  const target = /^https?:/.test(href) ? ' rel="noopener" target="_blank"' : '';
  return `<a class="btn btn--${variant}" href="${esc(ext ? href : ctx.url(href))}"${target} ${attrs}><span>${label}</span>${icons[icon] || ''}${
    target ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ''
  }</a>`;
}

export function textLink(ctx, href, label) {
  return `<a class="text-link" href="${esc(ctx.url(href))}"><span>${label}</span>${icons.arrow}</a>`;
}

const sectionMark = (num, label) =>
  `<p class="section-mark" data-reveal><span class="section-mark__num">${num}</span><span class="section-mark__rule" aria-hidden="true"></span><span>${label}</span></p>`;

export const pending = (ctx, text) => (ctx.site.previewMode ? `<span class="pending">${text}</span>` : '');

/* ---------------------------------------------------------------------------
   Photo / video slots — real media if the file exists, otherwise a wireframe
--------------------------------------------------------------------------- */
function dims(size) {
  const m = String(size).match(/(\d[\d,]*)\s*[×x]\s*(\d[\d,]*)/);
  return m ? [m[1].replace(/,/g, ''), m[2].replace(/,/g, '')] : [1600, 1200];
}

export function photo(ctx, id, opts = {}) {
  const p = ctx.photos[id];
  if (!p) throw new Error(`Unknown photo id "${id}" — add it to content/photos.json`);
  const cls = ['media', opts.className].filter(Boolean).join(' ');
  const ratio = opts.ratio || p.ratio;
  const [w, h] = dims(p.size);
  const parallax = opts.parallax ? ` data-parallax-media="${opts.parallax}"` : '';
  const loading = opts.eager ? 'eager" fetchpriority="high' : 'lazy';

  if (p.kind === 'video') {
    if (ctx.hasAsset(p.file)) {
      const poster = ctx.hasAsset(p.poster) ? ` poster="${ctx.url('/assets/images/' + p.poster)}"` : '';
      const track = ctx.hasAsset(p.captions)
        ? `<track kind="captions" srclang="en" label="English" src="${ctx.url('/assets/images/' + p.captions)}" default>`
        : '';
      return `<figure class="${cls} media--video" style="--ratio:${ratio}" data-reveal>
  <video controls preload="none" playsinline${poster} width="${w}" height="${h}" aria-label="${esc(p.alt)}">
    <source src="${ctx.url('/assets/images/' + p.file)}" type="video/mp4">${track}
  </video>
</figure>`;
    }
  } else if (ctx.hasAsset(p.file)) {
    return `<figure class="${cls}" style="--ratio:${ratio}" data-reveal${parallax}>
  <img src="${ctx.url('/assets/images/' + p.file)}" alt="${esc(p.alt)}" width="${w}" height="${h}" loading="${loading}" decoding="async">${
    opts.caption ? `<figcaption>${opts.caption}</figcaption>` : ''
  }
</figure>`;
  }

  // Wireframe placeholder
  const num = String(p.number).padStart(2, '0');
  const kindLabel = p.kind === 'video' ? 'Video' : 'Photo';
  const aria = `${kindLabel} placeholder: ${p.title}. ${p.description}`;
  return `<figure class="${cls} ph${p.kind === 'video' ? ' ph--video' : ''}" style="--ratio:${ratio}" data-photo-slot="${id}" data-reveal${parallax}>
  <div class="ph__frame" role="img" aria-label="${esc(aria)}">
    <svg class="ph__guides" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <line x1="0" y1="0" x2="100" y2="100"/><line x1="100" y1="0" x2="0" y2="100"/>
      <line class="ph__third" x1="33.333" y1="0" x2="33.333" y2="100"/><line class="ph__third" x1="66.666" y1="0" x2="66.666" y2="100"/>
      <line class="ph__third" x1="0" y1="33.333" x2="100" y2="33.333"/><line class="ph__third" x1="0" y1="66.666" x2="100" y2="66.666"/>
    </svg>
    <span class="ph__corner ph__corner--tl" aria-hidden="true"></span><span class="ph__corner ph__corner--tr" aria-hidden="true"></span>
    <span class="ph__corner ph__corner--bl" aria-hidden="true"></span><span class="ph__corner ph__corner--br" aria-hidden="true"></span>
    ${p.kind === 'video' ? `<span class="ph__play" aria-hidden="true">${icons.play}</span>` : ''}
    <span class="ph__label" aria-hidden="true">
      <span class="ph__num">${kindLabel} ${num} · ${p.kind === 'video' ? 'Video Needed' : 'Photography Needed'}</span>
      <span class="ph__title">${esc(p.title)}</span>
      <span class="ph__desc">${esc(p.description)}</span>
      <span class="ph__spec">${esc(p.ratio.replace('/', ':'))} · ${esc(p.size.split(';')[0])}<br>assets/images/${esc(p.file)}</span>
    </span>
  </div>${opts.caption ? `<figcaption>${opts.caption}</figcaption>` : ''}
</figure>`;
}

/* ---------------------------------------------------------------------------
   Structured data — only verified facts are included
--------------------------------------------------------------------------- */
export function physicianJsonLd(ctx) {
  const { site } = ctx;
  const c = site.contact;
  const v = site.verified;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: site.physicianName,
    url: site.siteUrl + '/',
    medicalSpecialty: 'https://schema.org/Pediatric',
    areaServed: { '@type': 'City', name: `${site.city}, ${site.region}` },
  };
  if (v.streetAddress)
    data.address = {
      '@type': 'PostalAddress',
      streetAddress: c.streetAddress,
      addressLocality: c.addressLocality,
      addressRegion: c.addressRegion,
      postalCode: c.postalCode,
      addressCountry: 'US',
    };
  if (v.phone) data.telephone = c.phoneE164;
  if (v.email) data.email = c.email;
  if (v.hours && c.hours) data.openingHours = c.hours;
  return data;
}

function breadcrumbJsonLd(ctx, trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.label,
      item: ctx.site.siteUrl + t.href,
    })),
  };
}

/* ---------------------------------------------------------------------------
   Layout: <head>, header, footer
--------------------------------------------------------------------------- */
export function layout(ctx, { title, description, body, path, bodyClass = '', jsonLd = [], ogType = 'website', breadcrumb }) {
  const { site } = ctx;
  const canonical = site.siteUrl + path;
  const ld = [...jsonLd];
  if (breadcrumb) ld.push(breadcrumbJsonLd(ctx, breadcrumb));
  const ogImage = site.siteUrl + '/assets/images/og/og-default.png';

  return `<!doctype html>
<html lang="${site.language}" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${site.previewMode ? '<!-- Preview draft: keep pages out of search results until launch. -->\n  <meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">'}
  <link rel="canonical" href="${canonical}">
  <meta name="theme-color" content="#f5efe3">
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="${esc(site.title)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Shane Rainey, DO — Pediatrician, Fort Worth, Texas">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <script>
    document.documentElement.className = document.documentElement.className.replace("no-js", "js");
    setTimeout(function () { if (!window.__siteReady) document.documentElement.classList.add("reveal-fallback"); }, 2500);
  </script>
  <link rel="icon" href="${ctx.url('/assets/images/favicon.svg')}" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&amp;family=Hanken+Grotesk:wght@400;500;600&amp;display=swap">
  <link rel="stylesheet" href="${ctx.url('/assets/css/main.css')}?v=${ctx.version}">
  <script src="${ctx.url('/assets/js/main.js')}?v=${ctx.version}" defer></script>
  <link rel="sitemap" type="application/xml" href="${ctx.url('/sitemap.xml')}">
${ld.map((d) => `  <script type="application/ld+json">${JSON.stringify(d)}</script>`).join('\n')}
</head>
<body class="${bodyClass}">
  <a class="skip-link" href="#main">Skip to main content</a>
${site.previewMode ? `  <div class="preview-bar" role="note"><span class="preview-bar__dot" aria-hidden="true"></span>Preview draft for review. Highlighted items are pending Dr.&nbsp;Rainey's approval or verification.</div>\n` : ''}${header(ctx, path)}
  <main id="main" tabindex="-1">
${body}
  </main>
${footer(ctx)}
</body>
</html>
`;
}

function header(ctx, path) {
  const { site } = ctx;
  const links = site.nav
    .map((n, i) => {
      const current = n.href === '/' ? path === '/' : path.startsWith(n.href);
      return `<li style="--i:${i}"><a href="${ctx.url(n.href)}"${current ? ' aria-current="page"' : ''}>${n.label}</a></li>`;
    })
    .join('\n          ');
  return `  <header class="site-header" data-header>
    <div class="container site-header__inner">
      <a class="brand" href="${ctx.url('/')}" aria-label="${esc(site.title)}, home">
        <span class="brand__mark" aria-hidden="true">${monogram()}</span>
        <span class="brand__text"><span class="brand__name">${esc(site.title)}</span><span class="brand__sub">Pediatrician · Fort Worth, Texas</span></span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" hidden>
        <span class="nav-toggle__label">Menu</span>
        <span class="nav-toggle__icon" aria-hidden="true"><span></span><span></span></span>
      </button>
      <nav id="site-nav" class="site-nav" aria-label="Main">
        <ul>
          ${links}
        </ul>
        <div class="site-nav__extra">
          <p class="site-nav__address">${esc(site.contact.streetAddress)}<br>${esc(site.contact.addressLocality)}, ${esc(site.contact.addressRegion)} ${esc(site.contact.postalCode)}</p>
          <a class="site-nav__phone" href="tel:${site.contact.phoneE164}">${icons.phone}<span>${esc(site.contact.phoneDisplay)}</span></a>
        </div>
      </nav>
    </div>
  </header>`;
}

export function monogram() {
  return `<svg viewBox="0 0 40 40" focusable="false"><circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" stroke-width="1"/><path d="M8 27c4-1.6 7-1.2 12 0s8 1.6 12 0" fill="none" stroke="currentColor" stroke-width="1"/><text x="20" y="22.5" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-size="13" font-style="italic" fill="currentColor">SR</text></svg>`;
}

function footer(ctx) {
  const { site } = ctx;
  const c = site.contact;
  const p = (t) => pending(ctx, t);
  return `  <footer class="site-footer">
    <div class="site-footer__horizon" aria-hidden="true"></div>
    <div class="container">
      <div class="site-footer__top">
        <div class="site-footer__brand">
          <a class="brand brand--light" href="${ctx.url('/')}" aria-label="${esc(site.title)}, home">
            <span class="brand__mark" aria-hidden="true">${monogram()}</span>
            <span class="brand__text"><span class="brand__name">${esc(site.title)}</span><span class="brand__sub">Pediatrician · Fort Worth, Texas</span></span>
          </a>
          <p class="site-footer__cred">${esc(site.physicianName)} · ${esc(site.credential)}<br>Independent pediatric practice in Fort Worth, Texas.</p>
          <p class="site-footer__cred-pending">${p('Board certification and professional credentials to be confirmed.')}</p>
        </div>
        <div class="site-footer__col">
          <h2 class="site-footer__heading">Visit</h2>
          <address>
            ${esc(c.streetAddress)}<br>${esc(c.addressLocality)}, ${esc(c.addressRegion)} ${esc(c.postalCode)} ${site.verified.streetAddress ? '' : p('Verify')}
          </address>
          <p><a href="tel:${c.phoneE164}">${esc(c.phoneDisplay)}</a> ${site.verified.phone ? '' : p('Verify')}<br>
          <a href="mailto:${esc(c.email)}">${esc(c.email)}</a> ${site.verified.email ? '' : p('Verify')}</p>
          <p class="site-footer__small">Hours: ${c.hours && site.verified.hours ? esc(c.hours) : 'to be confirmed'}</p>
        </div>
        <div class="site-footer__col">
          <h2 class="site-footer__heading">Explore</h2>
          <ul class="site-footer__links">
            ${site.nav.map((n) => `<li><a href="${ctx.url(n.href)}">${n.label}</a></li>`).join('\n            ')}
            <li><a href="${ctx.url('/privacy/')}">Privacy &amp; Disclaimer</a></li>
          </ul>
        </div>
        <div class="site-footer__col site-footer__notice">
          <h2 class="site-footer__heading">In an emergency</h2>
          <p>If your child has a medical emergency, call <a href="tel:911">911</a> or go to the nearest emergency room.</p>
          <p>Poison Help: <a href="tel:+18002221222">1-800-222-1222</a></p>
        </div>
      </div>
      <div class="site-footer__bottom">
        <p>The information on this website is general and educational, is not medical advice, and does not create a physician–patient relationship. Please do not send medical information by email.</p>
        <p>&copy; ${year} ${esc(site.physicianName)} · <a href="${ctx.url('/privacy/')}">Privacy</a> · This site uses no cookies, analytics, or tracking.</p>
      </div>
    </div>
  </footer>`;
}

/* ---------------------------------------------------------------------------
   Shared page pieces
--------------------------------------------------------------------------- */
export function pageHero(ctx, fm, { aside = '' } = {}) {
  const hasPhoto = fm.heroPhoto;
  return `<section class="page-hero${hasPhoto ? ' page-hero--split' : ''}" aria-labelledby="page-title">
  <div class="page-hero__bg" aria-hidden="true"><span data-parallax="0.12"></span></div>
  <div class="container page-hero__inner">
    <div class="page-hero__text">
      <p class="eyebrow" data-reveal>${esc(fm.eyebrow || '')}</p>
      <h1 id="page-title" class="page-hero__title" data-reveal style="--d:1">${esc(fm.h1)}</h1>
      ${fm.lede ? `<p class="lede" data-reveal style="--d:2">${esc(fm.lede)}</p>` : ''}
      ${aside}
    </div>
    ${hasPhoto ? `<div class="page-hero__media">${photo(ctx, fm.heroPhoto, { eager: true })}</div>` : ''}
  </div>
</section>`;
}

export function ctaBand(ctx, { title, text, primary, secondary }) {
  return `<section class="cta-band" aria-labelledby="cta-title">
  <div class="container cta-band__inner" data-reveal>
    <div>
      <h2 id="cta-title" class="cta-band__title">${title}</h2>
      <p>${text}</p>
    </div>
    <div class="btn-row">
      ${button(ctx, primary)}
      ${secondary ? button(ctx, { ...secondary, variant: 'ghost-light' }) : ''}
    </div>
  </div>
</section>`;
}

export function contactCard(ctx, { headingLevel = 3 } = {}) {
  const { site } = ctx;
  const c = site.contact;
  const p = (t) => pending(ctx, t);
  const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${c.streetAddress}, ${c.addressLocality}, ${c.addressRegion} ${c.postalCode}`);
  const apple = 'https://maps.apple.com/?q=' + encodeURIComponent(`${c.streetAddress}, ${c.addressLocality}, ${c.addressRegion} ${c.postalCode}`);
  const H = `h${headingLevel}`;
  return `<div class="contact-card" data-reveal>
  <${H} class="contact-card__title">${esc(site.physicianName)}</${H}>
  <p class="contact-card__sub">Pediatrician</p>
  <dl class="contact-list">
    <div><dt>${icons.pin}<span>Office</span></dt><dd>${esc(c.streetAddress)}<br>${esc(c.addressLocality)}, ${esc(c.addressRegion)} ${esc(c.postalCode)} ${site.verified.streetAddress ? '' : p('Verify suite / entrance')}</dd></div>
    <div><dt>${icons.phone}<span>Phone</span></dt><dd><a href="tel:${c.phoneE164}">${esc(c.phoneDisplay)}</a> ${site.verified.phone ? '' : p('Confirm direct line')}</dd></div>
    <div><dt>${icons.mail}<span>Email</span></dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a> ${site.verified.email ? '' : p('Confirm address')}<br><span class="contact-list__note">For general questions only — please do not email medical information.</span></dd></div>
    <div><dt>${icons.clock}<span>Hours</span></dt><dd>${c.hours && site.verified.hours ? esc(c.hours) : p('Office hours to be supplied')}</dd></div>
  </dl>
  <div class="btn-row">
    ${button(ctx, { href: `tel:${c.phoneE164}`, label: 'Call the office', icon: 'phone' })}
    ${button(ctx, { href: maps, label: 'Google Maps', variant: 'outline', icon: 'external' })}
    ${button(ctx, { href: apple, label: 'Apple Maps', variant: 'outline', icon: 'external' })}
  </div>
</div>`;
}

export function serviceHref(svc) {
  return svc.data.published ? `/pediatric-care/${svc.slug}/` : `/pediatric-care/#${svc.slug}`;
}

export function serviceCards(ctx, services) {
  return `<ul class="care-grid" role="list" data-stagger>
  ${services
    .map(
      (s, i) => `<li class="care-card" data-reveal>
    <a class="care-card__link" href="${ctx.url(serviceHref(s))}">
      <span class="care-card__top"><span class="care-card__num">${String(i + 1).padStart(2, '0')}</span><span class="care-card__icon">${icons[s.data.icon] || icons.leaf}</span></span>
      <h3 class="care-card__title">${esc(s.data.title)}</h3>
      <p class="care-card__text">${esc(s.data.summary)}</p>
      <span class="care-card__more">Learn more ${icons.arrow}</span>
    </a>
  </li>`
    )
    .join('\n  ')}
</ul>`;
}

/* ---------------------------------------------------------------------------
   HOME
--------------------------------------------------------------------------- */
export function homePage(ctx, { fm, sections, services }) {
  const { site } = ctx;
  const c = site.contact;
  const s = sections;
  const heroBackdrop = ctx.hasAsset(ctx.photos['hero-landscape'].file)
    ? `<div class="scene scene--photo" aria-hidden="true"><img data-parallax="0.15" src="${ctx.url('/assets/images/' + ctx.photos['hero-landscape'].file)}" alt="" fetchpriority="high" decoding="async"></div>`
    : landscapeScene();

  const body = `
<section class="hero" aria-labelledby="hero-title" data-hero>
  ${heroBackdrop}
  <div class="hero__veil" aria-hidden="true"></div>
  <div class="container hero__inner">
    <p class="eyebrow hero__eyebrow hero-in" style="--d:0">${esc(fm.heroEyebrow)}</p>
    <h1 id="hero-title" class="hero__title">
      <span class="hero__line"><span class="hero-in" style="--d:1">${esc(fm.heroHeadlineLine1)}</span></span>
      <span class="hero__line"><span class="hero-in" style="--d:2">${esc(fm.heroHeadlineLine2)}</span></span>
      <span class="hero__line"><em class="hero-in" style="--d:3">${esc(fm.heroHeadlineEmphasis)}</em></span>
    </h1>
    <p class="hero__intro hero-in" style="--d:4">${esc(fm.heroIntro)}</p>
    <div class="btn-row hero-in" style="--d:5">
      ${button(ctx, { href: fm.heroPrimaryHref, label: fm.heroPrimaryLabel })}
      ${button(ctx, { href: fm.heroSecondaryHref, label: fm.heroSecondaryLabel, variant: 'ghost' })}
    </div>
  </div>
  <div class="hero__foot hero-in" style="--d:6">
    <div class="container hero__foot-inner">
      <ul class="hero__facts" role="list">
        <li>Shane Rainey, DO</li>
        <li>Independent pediatric practice</li>
        <li>${esc(c.streetAddress)}, ${esc(c.addressLocality)}</li>
      </ul>
      <a class="hero__scroll" href="#meet"><span>Scroll</span><span class="hero__scroll-line" aria-hidden="true"></span></a>
    </div>
  </div>
</section>

<section id="meet" class="section meet" aria-labelledby="meet-title">
  <div class="container meet__grid">
    <div class="meet__media">
      ${photo(ctx, 'portrait-professional', { parallax: '0.06' })}
      <p class="meet__tag" aria-hidden="true">Pediatrician · Fort Worth</p>
    </div>
    <div class="meet__text">
      ${sectionMark('01', 'Meet Dr. Rainey')}
      <div class="prose prose--intro" data-reveal style="--d:1">${s.meet.replace('<h2', '<h2 id="meet-title"')}</div>
      <p data-reveal style="--d:2">${textLink(ctx, '/about/', 'Read more about Dr. Rainey')}</p>
    </div>
  </div>
</section>

<section class="section intro-video" aria-labelledby="video-title">
  <div class="container">
    <div class="intro-video__head">
      ${sectionMark('02', 'A Personal Introduction')}
      <div class="prose" data-reveal style="--d:1">${s.video.replace('<h2', '<h2 id="video-title"')}</div>
    </div>
    <div class="intro-video__frame">
      ${photo(ctx, 'intro-video')}
      <p class="intro-video__meta" data-reveal><span>60–90 seconds</span><span>Captioned</span><span>Plays only when you press play</span></p>
    </div>
  </div>
</section>

<section class="section care" aria-labelledby="care-title">
  <div class="container">
    <div class="care__head">
      <div>
        ${sectionMark('03', 'Areas of Care')}
        <div class="prose" data-reveal style="--d:1">${s.care.replace('<h2', '<h2 id="care-title"')}</div>
      </div>
      <p data-reveal style="--d:2">${textLink(ctx, '/pediatric-care/', 'All pediatric care')}</p>
    </div>
    ${serviceCards(ctx, services)}
  </div>
</section>

<section class="section personal" aria-labelledby="personal-title">
  <div class="container personal__grid">
    <div class="personal__media">
      ${photo(ctx, 'family', { parallax: '0.08' })}
    </div>
    <div class="personal__card" data-reveal>
      ${sectionMark('04', 'More Than a Physician')}
      <div class="prose">${s.personal.replace('<h2', '<h2 id="personal-title"')}</div>
    </div>
  </div>
</section>

<section class="section approach" aria-labelledby="approach-title">
  <svg class="approach__branch" data-parallax="-0.08" viewBox="0 0 600 400" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M0 330C120 300 210 250 300 180S470 60 600 40"/><path d="M150 285c10-40 40-70 80-85M230 240c30-10 70-5 100 15M300 180c-10-40 0-80 30-110M370 140c40 0 80 20 100 50M440 95c10-30 35-50 65-55"/><path d="M80 312c-8-22-4-44 10-60"/></g><g fill="currentColor" opacity=".55"><ellipse cx="232" cy="196" rx="12" ry="5" transform="rotate(-30 232 196)"/><ellipse cx="330" cy="256" rx="12" ry="5" transform="rotate(20 330 256)"/><ellipse cx="330" cy="70" rx="12" ry="5" transform="rotate(-60 330 70)"/><ellipse cx="470" cy="190" rx="12" ry="5" transform="rotate(50 470 190)"/><ellipse cx="505" cy="40" rx="12" ry="5" transform="rotate(-10 505 40)"/><ellipse cx="90" cy="250" rx="10" ry="4" transform="rotate(-70 90 250)"/></g></svg>
  <div class="container">
    ${sectionMark('05', 'His Approach to Care')}
    <div class="approach__statement prose" data-reveal style="--d:1">${s.approach.replace('<h2', '<h2 id="approach-title"')}</div>
    <ol class="principles" role="list" data-stagger>
      <li class="principle" data-reveal>
        <span class="principle__num">i.</span>
        <h3>Time to listen</h3>
        <p>Visits leave room for the details parents notice and the questions that matter to them. A good conversation is part of a good examination.</p>
      </li>
      <li class="principle" data-reveal>
        <span class="principle__num">ii.</span>
        <h3>The whole child</h3>
        <p>Growth, sleep, learning, family, and emotional health are connected. Care considers how they fit together, not only the reason for today's visit.</p>
      </li>
      <li class="principle" data-reveal>
        <span class="principle__num">iii.</span>
        <h3>Parents as partners</h3>
        <p>You know your child best. Decisions are explained plainly and made together, so you always understand the plan and the reasons behind it.</p>
      </li>
    </ol>
  </div>
</section>

<section class="section newpatients" aria-labelledby="np-title">
  <div class="container">
    <div class="newpatients__head">
      ${sectionMark('06', 'New Patients')}
      <div class="prose" data-reveal style="--d:1">${s.newpatients.replace('<h2', '<h2 id="np-title"')}</div>
    </div>
    <ol class="steps" role="list" data-stagger>
      <li class="step" data-reveal><span class="step__num">1</span><h3>Reach out</h3><p>Call the office to introduce your family and ask about new-patient availability.</p></li>
      <li class="step" data-reveal><span class="step__num">2</span><h3>Schedule a first visit</h3><p>Choose a time for your child to be seen and to get to know Dr. Rainey.</p></li>
      <li class="step" data-reveal><span class="step__num">3</span><h3>Share records</h3><p>Bring immunization records and past medical history, or ask your previous office to send them.</p></li>
      <li class="step" data-reveal><span class="step__num">4</span><h3>Settle in</h3><p>Arrive a few minutes early, bring your questions, and let the visit take the time it needs.</p></li>
    </ol>
    <ul class="info-tiles" role="list" data-stagger>
      <li class="info-tile" data-reveal><h3>Scheduling</h3><p>${pending(ctx, 'How to book, availability, and same-day sick visits — to be confirmed.') || 'Details coming soon.'}</p></li>
      <li class="info-tile" data-reveal><h3>Membership</h3><p>${pending(ctx, 'Whether a membership or direct-care model is offered — to be confirmed.') || 'Details coming soon.'}</p></li>
      <li class="info-tile" data-reveal><h3>Insurance</h3><p>${pending(ctx, 'Accepted plans, if any — to be confirmed.') || 'Details coming soon.'}</p></li>
      <li class="info-tile" data-reveal><h3>Pricing</h3><p>${pending(ctx, 'Fees and payment information — to be confirmed.') || 'Details coming soon.'}</p></li>
    </ul>
    <div class="btn-row newpatients__cta" data-reveal>
      ${button(ctx, { href: '/new-patients/', label: 'New patient information' })}
      ${button(ctx, { href: `tel:${c.phoneE164}`, label: `Call ${c.phoneDisplay}`, variant: 'outline', icon: 'phone' })}
    </div>
  </div>
</section>

<section class="section location" aria-labelledby="location-title">
  <div class="container location__grid">
    <div class="location__media">
      ${photo(ctx, 'office-exterior', { parallax: '0.05' })}
    </div>
    <div class="location__text">
      ${sectionMark('07', 'Location & Contact')}
      <div class="prose" data-reveal style="--d:1">${s.location.replace('<h2', '<h2 id="location-title"')}</div>
      ${contactCard(ctx)}
      <p class="location__more" data-reveal>${textLink(ctx, '/contact/', 'Directions and contact details')}</p>
    </div>
  </div>
</section>`;

  return layout(ctx, {
    title: fm.title,
    description: fm.description,
    path: '/',
    bodyClass: 'page-home',
    body,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'WebSite', name: site.title, url: site.siteUrl + '/' },
      physicianJsonLd(ctx),
    ],
  });
}

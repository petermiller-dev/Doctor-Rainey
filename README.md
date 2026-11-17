# Shane Rainey, DO — Website

Website for **Shane Rainey, DO**, Pediatrician, Fort Worth, Texas.

A lightweight static site with no frameworks or runtime dependencies. Editable
content lives in Markdown files under `content/`. A small Node build script turns
it into plain HTML using shared templates, and GitHub Actions publishes the
result to GitHub Pages.

> **Status: preview draft.** `previewMode` is `true` in `content/site.json`. While
> it is on, every page carries `noindex, nofollow`, `robots.txt` disallows
> crawling, a slim "Preview draft" bar appears at the top, and every item awaiting
> Dr. Rainey's approval is shown as a highlighted ◇ marker.

- **Preview:** https://petermiller-dev.github.io/Doctor-Rainey/
- **Photo & video slots:** see [`PHOTO-GUIDE.md`](PHOTO-GUIDE.md)

---

## Structure

```
content/                    ← EDIT CONTENT HERE
  site.json                 Name, contact details, navigation, preview flag, verification flags
  photos.json               Every photo/video slot: filename, size, crop, alt text
  home.md                   Homepage text (hero in front matter; sections marked <!-- section: name -->)
  about.md                  About Dr. Rainey
  pediatric-care.md         Pediatric Care page intro
  services/*.md             One file per area of care (cards + Pediatric Care sections)
  new-patients.md           New Patients
  resources.md              Articles & Resources intro
  articles/*.md             One file per article (with authorship & medical-review fields)
  contact.md, privacy.md    Contact & Privacy pages
assets/
  css/main.css              All styles. Colors/fonts/spacing are tokens at the top.
  js/main.js                Menu, scroll reveals, parallax (site works without it)
  images/                   Photos go here (see PHOTO-GUIDE.md); favicon; social image
scripts/
  build.mjs                 Builds content → _site/  (also regenerates PHOTO-GUIDE.md)
  templates.mjs             Shared layout, header, footer, cards, photo frames, homepage
  markdown.mjs              Tiny Markdown renderer
  landscape.mjs             Illustrated hero landscape (until a photo is supplied)
  check.mjs                 Link, heading, title and branding checks
  serve.mjs                 Local preview server that mimics the GitHub Pages subpath
.github/workflows/pages.yml Build → check → deploy on every push to main
```

`_site/` is generated output and is not committed.

## Setup & local preview

Requires **Node 18+** and nothing else (no `npm install`).

```bash
node scripts/build.mjs
```

```bash
node scripts/check.mjs
```

```bash
node scripts/serve.mjs
```

Then open http://localhost:4000/Doctor-Rainey/. The local server serves the site under the
same repository subpath that GitHub Pages uses, so what works locally works live.

## Editing content

- **Text:** edit the Markdown file in `content/`, then rebuild. Front matter (between the
  `---` lines) holds the page title tag, meta description, eyebrow, H1 and intro.
- **Formatting:** standard Markdown (`##` headings, `**bold**`, `*italic*`, `[links](/about/)`,
  lists, `>` quotes). Internal links are written from the site root (`/new-patients/`) and the
  build rewrites them so they work on any path.
- **Pending marker:** `{{pending: text}}` shows a highlighted "awaiting approval" note.
- **Callout box:** start a line with `::: pending Label` (or `::: note Label`) and end with `:::`.
- **Photo slot:** a paragraph containing only `{{photo: slot-id}}` (ids are in `photos.json`).
- **Contact details:** `content/site.json` → `contact`. Once Dr. Rainey confirms each
  detail, set its flag in `verified` to `true`. This removes the "Verify" marker and adds the
  detail to the search-engine structured data. Only verified facts are ever added to it.

### Areas of care

Each file in `content/services/` becomes a homepage card and a section on the Pediatric
Care page (ordered by `order`). Cards link to that section (`/pediatric-care/#slug`).
When Dr. Rainey confirms a service and wants it to have its own page, set
`published: true` in its front matter. The build then generates
`/pediatric-care/<slug>/`, and the card and sitemap link to it automatically.

### Articles

Add a Markdown file to `content/articles/`. Required front matter: `title`, `description`,
`date`, `category`, `author`, `reviewer`, `reviewStatus` (`pending` or `approved`),
`reviewedDate` (once approved). Pending articles show "Medical review pending" and are only
published while `previewMode` is on. **No clinical article should go live until
`reviewStatus: approved`.**

## Replacing photos (no redesign needed)

1. Look up the slot in `PHOTO-GUIDE.md` (filename, size, crop and alt text).
2. Save the photo at exactly that path inside `assets/images/`.
3. Rebuild, or just commit and push.

The build detects the file and replaces the wireframe placeholder with the photo, using the
same frame, aspect ratio and animation. Update the `alt` text in `content/photos.json` if it
no longer matches. The hero landscape illustration is replaced the same way
(`assets/images/hero/texas-landscape.jpg`). The intro video becomes a real `<video>` player
(never autoplaying) once `video/rainey-introduction.mp4` is added; add the poster image and
the `.vtt` captions file beside it.

## Changing colors and fonts

All colors are CSS custom properties at the top of `assets/css/main.css` (palette first,
then semantic roles, then the hero illustration colors). Replace the hex values when
Dr. Rainey's preferred colors arrive. Fonts are set by `--font-display` (Newsreader) and
`--font-body` (Hanken Grotesk), loaded from Google Fonts in `scripts/templates.mjs`. To
self-host them instead, place the `.woff2` files in `assets/fonts/`, add `@font-face` rules,
and remove the Google Fonts `<link>`.

## Motion & accessibility

- Section reveals, staggered card entrances, photo "developing" reveals, the hero text
  entrance and the layered parallax landscape all use `transform`/`opacity` only and are
  driven by one small script (IntersectionObserver plus one requestAnimationFrame scroll handler).
- **No JavaScript:** everything is visible. The `no-js` class leaves content unhidden, and a
  2.5-second fallback reveals all content if the script fails to load.
- **`prefers-reduced-motion`:** reveals, parallax and the hero entrance are all disabled.
- Cross-page fades use the browser's native View Transitions where supported.
- Mobile menu: Menu/Close button with `aria-expanded`, Escape to close, focus kept inside the
  open menu. Skip link, visible focus styles, one `<h1>` per page, semantic landmarks.

## Publishing

Every push to `main` runs `.github/workflows/pages.yml`: build → check → deploy to GitHub
Pages. In repository **Settings → Pages**, the source must be **GitHub Actions**.

All links are relative, so the site works at `/Doctor-Rainey/` today and at the root of a
custom domain later. When launching on Dr. Rainey's domain:

1. Update `siteUrl` in `content/site.json` (used for canonical URLs, the sitemap and social tags).
2. Set `previewMode` to `false`. This removes `noindex`, the preview bar and pending markers, and
   allows crawling.
3. Add the custom domain in **Settings → Pages**.

## Privacy & medical-content rules

- No forms, cookies, analytics, trackers or patient-data collection. Do not add an
  unsecured intake or "ask a question" form.
- Do not invent testimonials, credentials, insurance participation, fees, hours,
  certifications or scheduling services.
- Never present stock photos as Dr. Rainey, his family, patients or office. Patient photos
  need a signed parent/guardian release.
- The site must not use Restore + Revive branding or imply that Dr. Rainey owns it.
  `scripts/check.mjs` fails the build if the name appears anywhere except the (to-be-verified)
  email address.

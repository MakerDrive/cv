# CV

Static CV, portfolio, and blog site built with JSDA-Kit and prepared for GitHub Pages deployment.

## Stack

- JSDA-Kit for static site generation and optional dynamic routes.
- Symbiote.js web components with SSR support.
- npm with `package-lock.json`.
- GitHub Actions deployment to GitHub Pages.

## Development

```bash
npm ci
npm test
npm run build
```

The production build is written to `dist/`.

## Runtime Markdown pages

Pages that provide `MD_URL` use the client-side `<markdown-viewer>` component. The
page shell is generated during the build, while the Markdown source is fetched
and converted in the browser with `jsda-kit/iso/md2html.js` after the page opens.
This keeps the GitHub Pages deployment static and avoids embedding the remote
Markdown document into the generated HTML. The renderer is built as the separate
JSDA entrypoint `dist/js/markdown-viewer/index.js` and loaded through its runtime
URL only when a page contains `<markdown-viewer>`; it is not part of the primary
`dist/js/index.js` bundle.

Portfolio project articles and Pulse publication bodies follow the same static
runtime model. Their localized sources live under
`src/static-pages/copy-content/{projects,publications}/<slug>/<locale>.md`.
JSDA copies that directory to `dist/content/` without bundling it. The portfolio
bundle contains only navigation, localization, relation, and SEO metadata; it
fetches the selected Markdown asset on demand, cancels stale navigation
requests, and passes the loaded source to the Symbiote source viewer. The
viewer keeps rendered/source modes and composes media and feed content slots
after the requested article arrives.

For local static development with a watcher:

```bash
npx jsda ssg
```

For the dynamic JSDA server:

```bash
npx jsda serve
```

The default dynamic server port is `3000`.

## Social cards

The build derives social cards from the project and publication registries. Each
published Pulse article and project page gets a 1200×630 PNG for `og:image` and
`twitter:image`. The renderer tries catalog media associated with the page or
its project; the project cover is the last source. If those sources are
unavailable, it renders the title on a gradient background with size-aware line
wrapping.

```bash
npm run render-social-cards
npm run publish-social-cards
```

`render-social-cards` writes the generated files under the ignored
`cit/cit-store/social/` directory. Normal builds copy them to
`dist/social-cards/`, so a card that has not been uploaded yet has a deployable
local URL.
`publish-social-cards` uploads content-addressed versions to CIT and rewrites the
generated `cit/social-cards.json` map. Superseded objects remain available for
30 days. A later sync deletes an expired object only when no current card map
entry references it.

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` builds `dist/` and deploys it to GitHub Pages on pushes to `main`.

## Production Build Contract

The production build runs as a self-contained, native bundle located in `dist/`. It enforces the following production invariants:

- **Self-contained execution assets**: Exactly four JavaScript execution assets are allowed in `dist/js/`: `index.js`, `markdown-viewer/index.js`, `tour-player/index.js`, and `ForceWorker.js`. The Markdown viewer and CV Show player are independent JSDA bundles; localized Markdown remains non-executable content under `dist/content/`.
- **No Import Maps or external library CDNs**: The HTML files contain no `<script type="importmap">` or static jsDelivr/unpkg library mappings, and no raw package directories or copies (e.g. no `node_modules` inside `dist`).
- **No static JS imports**: Emitted JavaScript files contain no statically resolvable import statements (e.g., zero parser-visible import records from packages like `@symbiotejs/symbiote`).
- **Main bundle budget**: `dist/js/index.js` must not exceed the pre-runtime-Markdown baseline of 3,208,785 bytes raw or 773,574 bytes with gzip level 9.
- **Local Font Assets**: External Google Fonts references are replaced with local Material Symbols font assets (`dist/js/material-symbols.css` and `dist/js/material-symbols-outlined-400.ttf`).
- **Deliberate limits**: Provider-controlled media (like YouTube video players) or dynamic IMS media spots remain network-backed.

## Build Verification

A fail-closed verifier script validates all production invariants:

```bash
node scripts/verify-production-build.js
```

This verifier recursively inspects HTML pages, checks CSS files, validates all
126 localized runtime Markdown assets, verifies the Markdown renderer/main-bundle
boundary and size budget, and uses `esbuild` to verify that JS files contain zero
parser-visible import records.

Before publishing, create the GitHub repository and confirm that `homepage`, `repository.url`, and `project.cfg.js` sitemap `baseUrl` match the final GitHub Pages URL.

## Project Layout

- `src/static-pages/` - static pages used by the GitHub Pages build.
- `src/dynamic-pages/` - optional dynamic routes for the JSDA server.
- `src/ui-components/` - reusable web components.
- `src/common-styles/` - shared CSS modules and design tokens.
- `project.cfg.js` - JSDA build and routing configuration.
- `cit-config.json` - Cloud Images Toolkit configuration.

## Verification

```bash
npm test
npm run build
npm audit
```

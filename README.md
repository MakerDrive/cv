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

For local static development with a watcher:

```bash
npx jsda ssg
```

For the dynamic JSDA server:

```bash
npx jsda serve
```

The default dynamic server port is `3000`.

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` builds `dist/` and deploys it to GitHub Pages on pushes to `main`.

## Production Build Contract

The production build runs as a self-contained, native bundle located in `dist/`. It enforces the following production invariants:

- **Self-contained execution assets**: Exactly two JavaScript execution assets are allowed in `dist/js/`: `index.js` and `ForceWorker.js`. All other dependencies are fully bundled at compile-time.
- **No Import Maps or external library CDNs**: The HTML files contain no `<script type="importmap">` or static jsDelivr/unpkg library mappings, and no raw package directories or copies (e.g. no `node_modules` inside `dist`).
- **No static JS imports**: Emitted JavaScript files (`index.js` and `ForceWorker.js`) contain no statically resolvable import statements (e.g., zero parser-visible import records from packages like `@symbiotejs/symbiote`).
- **Local Font Assets**: External Google Fonts references are replaced with local Material Symbols font assets (`dist/js/material-symbols.css` and `dist/js/material-symbols-outlined-400.ttf`).
- **Deliberate limits**: Provider-controlled media (like YouTube video players) or dynamic IMS media spots remain network-backed.

## Build Verification

A fail-closed verifier script validates all production invariants:

```bash
node scripts/verify-production-build.js
```

This verifier recursively inspects HTML pages, checks CSS files, and uses `esbuild` to verify that JS files contain zero parser-visible import records.

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

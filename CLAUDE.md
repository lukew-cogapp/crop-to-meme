# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build
npm run preview  # serve dist/
npm run lint     # biome check .
npm run format   # biome check . --write (fixes + organises imports)
```

No test runner. Type-check is part of `build` (`tsc -b`).

GH Pages deploy: push to `main` → `.github/workflows/deploy.yml` builds with `GITHUB_PAGES_BASE=/<repo>/` and publishes via `actions/deploy-pages`. Pages must be enabled in repo settings (Source: GitHub Actions) - `gh api repos/<owner>/<repo>/pages -f build_type=workflow -X POST` enables it.

## Architecture

Single-page React app. All state in URL search params, so any meme view is a shareable link. Hash router (`HashRouter`) - works on GitHub Pages without server config.

### Source providers (pluggable)

`src/lib/providers.ts` defines the `Provider` interface. Each provider implements:

- `kind: "search" | "paste"` - drives which input UI renders.
- `name` (English fallback) and optional `nameKey` (i18n lookup) so built-in providers can be translated.
- `search?(query)` - returns `SearchHit[]` w/ thumbnail + opaque `sourceRef` string.
- `resolve(sourceRef)` - returns `ResolvedSource` with `serviceBase` (IIIF Image API base URL), dims, label, optional metadata.

Concrete providers in `src/providers/`:

- `aic.ts` - Art Institute of Chicago. Search via their public API, IIIF base built from `image_id`. Encodes title/artist/date into the `sourceRef` so MemePage can render captions without re-fetching.
- `getty.ts` - Getty Museum. Hits `https://www.getty.edu/search/api/search`, filters results to those with an `image_service` thumbnail. Parses the description string for date/artist/medium. Defaults to seeding the search box with `portrait`.
- `wellcome.ts` - Wellcome Collection. Hits `api.wellcomecollection.org/catalogue/v2/works` with `workType=k,q` (Pictures + Digital Images) and `availabilities=online`. Extracts the IIIF image base from the thumbnail URL pattern.
- `iiif-paste.ts` - Generic. Accepts an info.json URL, Presentation manifest URL (v2 or v3), or raw JSON paste. Parser in `lib/iiif-source.ts` handles both Presentation versions and falls back through them if structure is ambiguous.

Providers can set `defaultQuery` so the search box prefills when the tab opens (Getty + Wellcome do, AIC explicitly defaults empty so the user sees the prompt).

To add a provider: create `src/providers/<id>.ts`, `registerProvider(...)`, then `import` it from `src/providers/index.ts`. No other file needs to change.

`providerForRef(ref)` routes a `sourceRef` back to its provider via the `<id>:` prefix; falls back to the IIIF paste provider for raw URLs.

### URL state machine

- `/` → `HomePage` - provider tabs (ARIA `role="tablist"`), search or paste
- `/faces?src=<ref>` → `FacesPage` - resolves source, runs face detection, shows thumbnails
- `/meme?src=<ref>&x&y&w&h&top&bottom&title&artist&date` → `MemePage` - all meme state in URL
- `/about` → `AboutPage`

Caption metadata (`title`, `artist`, `date`) gets carried in the URL alongside the crop region. The MemePage seeds `top`/`bottom` from `generateCaption(meta)` if not in URL, then writes them back via `setSearchParams({ replace: true })` so refreshes persist.

### IIIF helpers

`lib/iiif.ts` has `iiifUrl(imageId, ...)` (AIC convenience) and `iiifUrlFromBase(serviceBase, ...)` (generic). Components always use the generic form; `serviceBase` comes from the resolved provider source.

`lib/iiif-source.ts` parses Presentation API v2 (`sequences[].canvases[].images[].resource`) and v3 (`items[].items[].items[].body`) plus standalone info.json. The fetch step catches network errors and rethrows with a CORS-aware hint pointing the user at the raw-JSON paste fallback.

### Face detection

`lib/faces.ts` wraps MediaPipe's `FaceDetector` (`@mediapipe/tasks-vision`). Singleton `detectorPromise` so the model loads once. Detection runs on a downscaled image (`DETECT_WIDTH = 843`); boxes are then `scaleBox`-ed back to full image coords and `expandBox`-ed (factor 1.6) so the crop has padding around the face. WASM + model load from jsDelivr/Google CDN.

### Meme rendering

`lib/meme.ts` draws onto a Canvas 2D context. Word-wraps top/bottom text against `canvas.width - 2*sideMargin`, capping at 3 lines and shrinking the font (down to ~50% of base) if it still won't fit. White Impact text with thick black stroke. Export defaults to JPEG quality 0.92 - paintings don't compress as PNG.

Filename is built from `lib/slug.ts` `memeFilename([title, top, bottom])` so downloads land like `two-sisters-on-the-terrace--this-you--yeah-this-me.jpg`.

### Original-image viewer

`/view?src=<ref>&from=<url>` mounts Samvera's Clover IIIF `Image` component as a deep-zoom viewer (OpenSeadragon-backed). The route is `lazy()`-loaded, so the ~110 KB Clover chunk only downloads when used. The `from` param round-trips the full caller URL so the back link returns to the exact meme state (caption, region, sunglasses).

Clover wants the IIIF Image service ID (no `/info.json` suffix) plus `isTiledImage={true}`. We pass `source.serviceBase` directly.

### Sunglasses overlay

`lib/sunglasses.ts` exports five styles: `deal-with-it`, `classic`, `aviator`, `round`, `monocle`. Each draws onto the canvas after the image, before the text, rotated to match eye angle. Monocle anchors at the right eye (positive x in midpoint frame) instead of straddling both.

- Eyes come from MediaPipe's `FaceDetector` keypoints. The detector returns subject-relative `leftEye`/`rightEye`; MemeEditor reorders by `x` so the rotation maths works regardless of which side of the face the keypoint label refers to.
- `deal-with-it` is a hardcoded 5-row × 32-col pixel grid drawn with `fillRect` per cell. Eye-anchor columns are constants (`DWI_LEFT_EYE_COL`, `DWI_RIGHT_EYE_COL`) so the glasses scale to the actual eye distance.
- The other three styles are pure path geometry (rounded rects, teardrops, circles).
- Sunglasses style is URL-state (`?sg=deal-with-it|classic|aviator|round`, omitted = off) so it survives share links.

### Captions

`lib/captions.ts` is a template registry. Each template is a data record `{ top, bottom, needs?: Slot[] }`. `generateCaption(meta)` filters templates by `needs` (so paste-IIIF sources without metadata only get generic templates), picks one by seed, then interpolates `{title}`, `{titleLower}`, `{artistShort}`, `{year}`. Pure function.

These templates are *generated content*, not UI chrome - they live in `lib/`, not in `locales/`.

### i18n

Uses **react-i18next** + i18next-browser-languagedetector. Init in `src/i18n.ts`. JSON dicts in `src/locales/{en,es}.json`. Detected order: localStorage (`locale`) → navigator. Switching languages also writes `document.documentElement.lang` via the `languageChanged` event so screen readers pick up the change.

Components use `useTranslation()` directly: `const { t } = useTranslation()`. Interpolation syntax is `{{var}}` (i18next style).

About page is MDX (`content/about.mdx` and `about.es.mdx`), swapped at runtime in `AboutPage` based on `i18n.resolvedLanguage`.

Rules:

- All UI strings → `locales/*.json`.
- Runtime data (artwork titles from APIs, IIIF labels) → stays in code.
- Provider names: built-ins set `nameKey` so they translate; third-party providers can omit it and use `name` directly.
- Caption templates → content, not chrome - separate from i18n.

### Accessibility (WCAG 2.2 AA)

- `:focus-visible` outline defined in `index.css` - never remove it. Inputs use `focus-visible:border-neutral-100`, not `focus:`.
- `<main id="main">` landmark; skip link at top of `App.tsx`. `<nav aria-label>` in header.
- Every page has an `<h1>` (often `sr-only` when the visual title sits in the header).
- Inputs have `<label htmlFor>` (use `useId()`).
- Source tabs use `role="tablist"` / `role="tab"` / `aria-selected` / `aria-controls`.
- Loading states use `role="status" aria-live="polite"`. Errors use `role="alert"`.
- Meme `<canvas>` has `role="img"` and dynamic `aria-label` describing top/bottom text.
- Text colour: prefer `text-neutral-200`/`-300`. `text-neutral-400`/`-500` fail contrast on the dark background - don't reach for them.

## Tooling notes

- Tailwind v4 via `@tailwindcss/vite`. CSS-first config in `src/index.css` (`@theme` block). No `tailwind.config.js`.
- Biome v2 for both lint and format. Tabs, double quotes, organise imports on. CSS uses `tailwindDirectives` parser option.
- TypeScript strict, `noUnusedLocals`, `noUnusedParameters`, `resolveJsonModule`. Prefix unused params with `_`.
- React 19, react-router-dom v7, react-i18next, MDX via `@mdx-js/rollup`.
- `vite.config.ts` reads `GITHUB_PAGES_BASE` from env so dev runs at `/` and CI builds at `/<repo>/`.

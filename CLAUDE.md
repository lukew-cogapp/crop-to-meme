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

No test runner configured. Type-check is part of `build` (`tsc -b`).

GH Pages deploy: push to `main` → `.github/workflows/deploy.yml` builds with `GITHUB_PAGES_BASE=/<repo>/` and publishes via `actions/deploy-pages`.

## Architecture

Single-page React app. All state in URL search params, so any meme view is a shareable link. Hash router (`HashRouter`) so it works on GitHub Pages without server config.

### Source providers (pluggable)

`src/lib/providers.ts` defines the `Provider` interface. Each provider implements:

- `kind: "search" | "paste"` — drives which input UI renders
- `search?(query)` — returns `SearchHit[]` w/ thumbnail + opaque `sourceRef` string
- `resolve(sourceRef)` — returns `ResolvedSource` with `serviceBase` (IIIF Image API base URL), dims, label, optional metadata

Concrete providers in `src/providers/`:

- `aic.ts` — Art Institute of Chicago. Search via their public API, IIIF base built from `image_id`. Encodes title/artist/date into the `sourceRef` so MemePage can render captions without re-fetching.
- `iiif-paste.ts` — Generic. Accepts an info.json URL, Presentation manifest URL (v2 or v3), or raw JSON. Parser in `lib/iiif-source.ts` handles both Presentation versions.

To add a provider: create `src/providers/<id>.ts`, `registerProvider(...)`, then `import` it from `src/providers/index.ts`. No other file needs to change.

`providerForRef(ref)` routes a `sourceRef` back to its provider via the `<id>:` prefix; falls back to the IIIF paste provider for raw URLs.

### URL state machine

- `/` → `HomePage` — provider tabs, search or paste
- `/faces?src=<ref>` → `FacesPage` — resolves source, runs face detection, shows thumbnails
- `/meme?src=<ref>&x&y&w&h&top&bottom&title&artist&date` → `MemePage` — all meme state in URL
- `/about` → `AboutPage`

Caption metadata (`title`, `artist`, `date`) gets carried in the URL alongside the crop region. The MemePage seeds `top`/`bottom` from `generateCaption(meta)` if not in URL, then writes them back to the URL via `setSearchParams({ replace: true })` so refreshes persist.

### IIIF helpers

`lib/iiif.ts` has both `iiifUrl(imageId, ...)` (AIC convenience) and `iiifUrlFromBase(serviceBase, ...)` (generic). Components always use the generic form; `serviceBase` comes from the resolved provider source.

`lib/iiif-source.ts` parses Presentation API v2 (`sequences[].canvases[].images[].resource`) and v3 (`items[].items[].items[].body`) plus standalone info.json. Falls through versions if structure is ambiguous.

### Face detection

`lib/faces.ts` wraps MediaPipe's `FaceDetector` (`@mediapipe/tasks-vision`). Singleton `detectorPromise` so model loads once. Detection runs on a downscaled image (`DETECT_WIDTH = 843`); boxes are then `scaleBox`-ed back to full image coords and `expandBox`-ed (factor 1.6) so the crop has padding around the face. WASM + model load from jsDelivr/Google CDN.

### Meme rendering

`lib/meme.ts` draws onto a Canvas 2D context: image, then Impact-style stroked white text top/bottom, sized relative to canvas width. Export via `canvasToBlob` + `downloadBlob`.

### Captions

`lib/captions.ts` is a template registry. Each template is `(meta) => MemeText` where `meta = { title, artist, date }`. Pure function, deterministic given a seed. The shuffle button in MemeEditor calls `generateCaption(meta)` with a fresh random seed.

These templates are *generated content* (the meme itself), not UI chrome — they live in `lib/`, not in `locales/`.

### i18n

`src/i18n.ts` is a typed `t(key, vars?)` helper backed by `src/locales/en.json`. The `TKey` type is computed from the JSON shape so unknown keys fail at compile time.

Rules:

- All UI strings (labels, placeholders, buttons, alt text, error messages) → en.json.
- Runtime data (artwork titles from APIs, IIIF labels from manifests, provider names) → stays in code.
- Interpolation uses `{name}` placeholders, never string concatenation — word order varies by language.
- Caption templates (`lib/captions.ts`) are content, not chrome — separate from i18n.

## Tooling notes

- Tailwind v4 via `@tailwindcss/vite`. CSS-first config in `src/index.css` (`@theme` block). No `tailwind.config.js`.
- Biome v2 for both lint and format. Tabs, double quotes, organise imports on. CSS uses `tailwindDirectives` parser option.
- TypeScript strict, `noUnusedLocals`, `noUnusedParameters`. Prefix unused params with `_`.
- React 19, react-router-dom v7.
- `vite.config.ts` reads `GITHUB_PAGES_BASE` from env so dev runs at `/` and CI builds at `/<repo>/`.

# Crop to Meme

Browse IIIF artworks, detect faces with MediaPipe, crop via the IIIF Image API, slap meme text on top, share via URL, export JPEG. All client-side.

Built with Claude Code as a "fun with IIIF" experiment.

**Live:** https://lukew-cogapp.github.io/crop-to-meme/
**Source:** https://github.com/lukew-cogapp/crop-to-meme

## Sources

- **Art Institute of Chicago** - search their collection (portraits filter on by default).
- **Paste IIIF URL** - info.json (Image API) or Presentation manifest (v2 or v3) from any IIIF-supporting institution. Paste raw JSON if the host blocks CORS. Extensible - see `src/providers/`.

## Features

- MediaPipe face detection runs on-device (WebGPU/WASM).
- Captions auto-generated from artwork metadata using a template pool. Shuffle button rerolls.
- Optional sunglasses overlay (4 styles: deal-with-it, classic, aviator, round) anchored to detected eye keypoints.
- Word-wrapping meme renderer with shrink-to-fit fallback so long titles don't overflow.
- Every meme is a shareable URL - region, caption, and metadata all in the query string.
- Hash router so it works on GitHub Pages with no server.
- English + Spanish via react-i18next, with localStorage persistence and `<html lang>` sync.
- WCAG 2.2 AA pass: focus-visible, landmarks, ARIA tabs, labelled inputs, accessible canvas.
- "View original" opens the IIIF image in a Samvera Clover deep-zoom viewer (lazy-loaded).

## Stack

Vite · React 19 · TypeScript strict · Tailwind v4 · Biome v2 · react-router-dom v7 · react-i18next · MDX · `@mediapipe/tasks-vision` · `@samvera/clover-iiif` · IIIF Image + Presentation APIs · Canvas 2D.

## Develop

```sh
npm install
npm run dev
```

## Lint / format

```sh
npm run lint
npm run format
```

## Deploy

Push to `main`. GitHub Actions workflow builds with `GITHUB_PAGES_BASE=/<repo>/` and publishes to GitHub Pages. Enable Pages → Source: GitHub Actions in repo settings (one-off).

## Architecture

See `CLAUDE.md` for the full breakdown. Quick map:

```
src/
  lib/              pure modules (IIIF, faces, meme, captions, providers)
  providers/        pluggable source registry (AIC, paste-IIIF)
  components/       UI building blocks
  pages/            route components - state lives in URL
  content/          MDX long-form copy (per locale)
  locales/          UI strings (en.json, es.json)
  i18n.ts           react-i18next setup
```

To add a new IIIF source: create `src/providers/<id>.ts`, register it, import from `src/providers/index.ts`. No other file touches.

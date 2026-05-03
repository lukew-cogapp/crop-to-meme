# Crop to Meme

Browse IIIF artworks, detect faces with MediaPipe, crop via the IIIF Image API, slap meme text on top, share via URL, export PNG. All client-side.

Built with Claude Code as a "fun with IIIF" experiment.

## Sources

- **Art Institute of Chicago** — search their collection (portraits filter on by default).
- **Paste IIIF URL** — info.json (Image API) or Presentation manifest (v2 or v3) from any IIIF-supporting institution. Extensible — see `src/providers/`.

## Features

- MediaPipe face detection runs on-device (WebGPU/WASM).
- Captions auto-generated from artwork metadata using template pool. Shuffle button reroles.
- Every meme is a shareable URL — region, caption, and metadata all in query string.
- Hash router so it works on GitHub Pages with no server.

## Stack

Vite · React 19 · TypeScript strict · Tailwind v4 · Biome v2 · react-router-dom v7 · `@mediapipe/tasks-vision` · IIIF Image + Presentation APIs · Canvas 2D.

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

Push to `main`. GitHub Actions workflow builds with `GITHUB_PAGES_BASE=/<repo>/` and publishes to GitHub Pages. Enable Pages → Source: GitHub Actions in repo settings.

## Architecture

See `CLAUDE.md` for the full breakdown. Quick map:

```
src/
  lib/              pure modules (IIIF, faces, meme, captions, providers)
  providers/        pluggable source registry (AIC, paste IIIF)
  components/       UI building blocks
  pages/            route components — state lives in URL
  locales/en.json   all UI strings
  i18n.ts           typed t() helper
```

To add a new IIIF source: create `src/providers/<id>.ts`, register it, import from `src/providers/index.ts`. No other file touches.

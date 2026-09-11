# crop-to-meme-iiif

IIIF image proxy for `artic.edu`, which returns 403 to requests carrying no
`Referer` it recognises. That blocks browser use from any other origin, so
Art Institute of Chicago images cannot load in the app directly.

The app only ever requests AIC images flagged `is_public_domain`, which their
terms place under CC0 ("for any purpose, including commercial and
noncommercial uses, without additional permission"). `robots.txt` does not
disallow `/iiif/`.

## Deploy

```sh
npm install
npm run deploy
```

Then set `VITE_AIC_IIIF_PROXY` in the app to the deployed URL.

## Routes

Mirrors the IIIF Image API path structure, with the `/iiif/2` prefix dropped:

```
/<image-id>/info.json
/<image-id>/<region>/<size>/<rotation>/<quality>.<format>
```

Anything else is a 404. `info.json` has its service id rewritten to the
worker's own origin, or a viewer would follow it back to the blocked host.

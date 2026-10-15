# Brief · mod-film

**Type:** builder · **Wave:** 4 (prep) · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/04-technical.md` (§Timeline, §Rendering, repo layout), `docs/contracts.md` (all), `docs/assets.md`, `docs/shots/README.md`, two shot specs (`docs/shots/s02.md`, `docs/shots/s15.md`), `src/timeline.js`, `lab/lookdev.js`

## Goal
The film's skeleton, so 18 shot builders can work in parallel without touching shared files. It has three parts: `index.html` plays the whole film by time; an asset loader gives shots frozen art when it exists and labelled flat proxies when it doesn't; and a stub module per shot shows its id and time.

## Owns
- `index.html`, `src/film.js`, `src/assets.js`
- `src/shots/_template.js`, and stub files `src/shots/s01.js` … `s18.js`
- `docs/contracts.md` §film, §assets, §shots (new sections, additive)
- `evidence/mod-film/`, `done/mod-film.md`

## Spec
1. **Shot contract** (write it into contracts.md first, then build to it). Each `src/shots/sNN.js` exports `build(ctx) → { update(tLocal) , dispose?() }`. `ctx` = `{ stage, scene, camera, renderer, assets, PALETTE, post }`. Each shot builds its own lights, set and camera, and must not leak state into other shots. `film.js` builds a shot lazily on first entry, keeps at most the current and next shot alive, and calls `dispose`. Deterministic: rendering t out of order (e.g. t=170 then t=3) gives the same pixels as in order.
2. **Assets** (`src/assets.js`): `await assets.load(name)` → `{ pieces: { pieceName: PaperSheet-ready image } }`, keyed by `docs/assets.md` names and piece names. When `assets/frozen/<name>.png` plus `assets/cut/<name>.boxes.json` exist, it returns the cut pieces. Otherwise it returns **proxies**: flat paper.js silhouettes in the right palette colour and rough proportions (a gator-ish shape for gator parts, rectangles or ellipses for props), so blocking reads. Proxy sizes come from a small table in `assets.js` seeded from the shot specs' dimensions. Never invent new asset names.
3. **Stubs:** `s01.js`…`s18.js` copy `_template.js`, with a navy wall, a desk-height kraft strip, and one proxy relevant to the shot, so the whole film plays end to end right now. Shot builders replace their own file only.
4. `index.html` uses `exposeForRender` with `DURATION` and fps 24, so `render.mjs --frames` and `--sheet` work on the film.

## Acceptance
- [ ] `node render.mjs --page=index.html --sheet=<one t inside each of the 18 shots> --cols=6 --out=evidence/mod-film/film_sheet.jpg`: 18 cells, each a different stub
- [ ] Out-of-order determinism: `tools/determinism.mjs --page=index.html --t=170,3,95,3` passes, and t=3 matches across the two passes
- [ ] Proxy contact sheet of all 19 assets' pieces (`evidence/mod-film/proxies.jpg`)
- [ ] With a fake frozen asset (the v2_4 tile cut, in a scratch copy, never committed under `assets/frozen/`) the loader returns real pieces. Show that it switches, then remove the fake.
- [ ] contracts.md diff is additive

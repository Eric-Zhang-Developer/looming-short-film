# Done · mod-film

## What shipped
`index.html` plays the whole 180 s film by time through `src/film.js`: each shot gets its own scene and camera on the shared renderer, is built on its first frame, and is disposed once it is neither current nor next. `src/assets.js` loads cut frozen art when it exists and flat palette-coloured proxy silhouettes otherwise, from a 19-asset piece table. `src/shots/s01.js`…`s18.js` are stubs copied from `_template.js`: navy wall, kraft desk strip, one proxy, the shot number as cream dots and tLocal as a cream bar.

## Where it lives
- `index.html`, `src/film.js`, `src/assets.js`, `src/shots/_template.js`, `src/shots/s01.js`…`s18.js`
- `docs/contracts.md` §shots, §film, §assets (appended)
- `evidence/mod-film/` (`film_sheet.jpg`, `determinism.txt`, `proxies.jpg` + `proxies.html`, `switch.jpg`, `fake_asset.txt`, `contracts_diff.txt`)
- Commits on `task/mod-film`: `40b0672` contract(film), `a805d00` mod(film), plus the evidence/done commit

## How it was checked
- [x] Film sheet, 18 cells, each a different stub: `node render.mjs --page=index.html --sheet=3,10.5,17.5,24,32,40,49,57,63,69,75,83,91.5,97.5,107,124.5,147.5,170 --cols=6 --out=evidence/mod-film/film_sheet.jpg` → 18 frames, 263 ms/frame. Cell n shows n dots; proxies differ by shot. Looked at it.
- [x] Out-of-order determinism: `node tools/determinism.mjs --page=index.html --t=170,3,95,3` → all PASS, `determinism: PASS`; both t=3 rows are `1e0730758e808116` (`evidence/mod-film/determinism.txt`). `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`.
- [x] Proxy sheet of all 19 assets' pieces: `evidence/mod-film/proxies.jpg` (rendered from `evidence/mod-film/proxies.html`, labelled; labels are evidence only).
- [x] Loader switches to real pieces with a fake frozen asset, then back: `evidence/mod-film/switch.jpg`, steps in `evidence/mod-film/fake_asset.txt`. Fake files removed; `git status` shows no `assets/frozen` or `assets/cut` paths.
- [x] contracts.md diff is additive: 47 insertions, 0 removed lines (`evidence/mod-film/contracts_diff.txt`).
- [x] `ctx.post` (not used by any stub): checked by a temporary edit to s01, reverted. It changed the frame and determinism `--t=3,170,3` still passed (`fake_asset.txt`).

## Gaps
- **"Labelled" proxies carry no visible label.** AGENTS.md forbids legible text in frames, so the label is the `proxy: true` flag on the load result. The stubs show their id the same way, as dot counts and a bar instead of text.
- **Piece names are mine.** docs/assets.md lists pieces in prose. I fixed names in `PIECES` (e.g. `gator_sheet.snout`/`jaw`, `face_sheet.eyes_open`…`mouth_line`, `top_figures_sheet.seated_1..6`, `marston_stacks.shelf_1..4`, `roommates_sheet.tall_body/tall_leg_l/…`). No asset names were invented. Cutters must name boxes keys `<name>_<piece>` to match. Proxy sizes are rough, from the shot specs where they give numbers and guesses otherwise (the faces, roommates, custodian and crowd parts).
- **A real cut missing a piece returns no entry for it.** Proxies are not merged in for missing pieces, so a shot that asks for one gets `undefined`. In the fake test the stand-in had only `sheet1`.
- **404 noise.** Each asset with no cut logs one "Failed to load resource: 404" (`boxes.json` probe) per page load in render output. It's harmless.
- **"Current and next alive"** keeps the next shot only if it was already built (e.g. after scrubbing back). The film never prefetches it, because the brief says lazy and prefetching would double each contact-sheet cell's build time.
- `docs/04-technical.md` still says shots export `build(scene)` and `update(scene, tLocal)`. The contract here (`build(ctx)` → `{ update(tLocal) }`) supersedes it. Doc 04 is outside my owns, so it's not edited.
- Wave 1's tile pieces (`style_tile_v2_4_*`) don't follow the `<name>_` key rule. The loader keeps such keys as-is.

## State
built · 2026-10-15

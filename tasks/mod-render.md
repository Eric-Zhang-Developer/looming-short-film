# Brief · mod-render

**Type:** builder
**Wave:** 2 · batch 1 · **Model:** claude-sonnet-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` (Conventions + your section), `docs/04-technical.md` §Rendering, `docs/contracts.md` §render.mjs and §tools

## Goal
The one tool every task uses to look at its work: contact sheets, strips, crops and stills from any page, plus parallel resumable frame export and encoding. Also the determinism checker.

## Owns
- `render.mjs`
- `tools/determinism.mjs`
- `tools/lib/`
- `evidence/mod-render/`
- `done/mod-render.md`

## Inputs
- `~/code/hackathons/knighthacks-2026-video/render.mjs`: the source to port. Read it fully, keep its flags and resumable workers, and swap p5 specifics for `window.renderFrame(t)` / `window.LOOMING`.
- `smoke/paper/render.mjs`: shows the local HTTP server that ES modules need.
- Chrome: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (also honor `--chrome` and `CHROME_PATH`).

## Spec
Implement the `render.mjs` and `tools/determinism.mjs` CLIs exactly as in contracts.
- Add a `--page` flag, defaulting to `index.html`.
- Await `window.LOOMING.ready` (if present) before the first frame.
- Output type comes from the extension. JPEG quality 90.
- `--frames` writes `out/frames/%06d.jpg` and skips existing files. `--encode` uses H.264 `-crf 16 -preset slow -pix_fmt yuv420p` and muxes `--audio` if given.
- Print ms/frame at the end of every run.
- Since `src/core` is being built in parallel, test against `smoke/paper/index.html`. Its page exposes `renderFrame`, but may not set `LOOMING`, so handle that.

## Acceptance
- [ ] `--sheet`, `--strip`, `--stills`, `--crop` all work on `smoke/paper/index.html` (outputs in evidence)
- [ ] `--frames --range=0:1 --workers=2` writes 24 frames, and re-running skips them
- [ ] `--encode` makes a playable 1 s mp4 (ffprobe output in evidence)
- [ ] `tools/determinism.mjs --page=smoke/paper/index.html --t=0.5,4` passes
- [ ] Works with no `index.html` present (clear error, not a crash)

## Evidence required
`evidence/mod-render/`: `sheet.jpg`, `strip.jpg`, `crop.jpg`, `ffprobe.txt`, `determinism.txt`, `log.txt`.

## Out of scope
Anything in `src/`. Audio synthesis. Don't commit `out/`.

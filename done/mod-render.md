# Done · mod-render

## What shipped
`render.mjs` (sheet, strip, stills, crop, resumable parallel frames, encode) and `tools/determinism.mjs`, both on a shared `tools/lib/page.mjs` (local HTTP server, headless Chrome, in-page frame grab). Works on any page exposing `window.renderFrame(t)`; `window.LOOMING` is optional (`ready` is awaited, `fps`/`duration` read if present).

## Where it lives
`render.mjs`, `tools/determinism.mjs`, `tools/lib/page.mjs`, `evidence/mod-render/`. Branch `task/mod-render`, commits `mod(render): ...`.

## How it was checked
All on `smoke/paper/index.html` (no `LOOMING` there; fps defaults to 24, `--frames` needs `--range`).
- [x] `--sheet`, `--strip`, `--stills`, `--crop`: `evidence/mod-render/sheet.jpg`, `strip.jpg` (shows the phone-to-lamp swap at t=2.5), `crop.jpg`; stills written to `out/stills/` (2.8 MB PNG each, not committed). I looked at the three JPEGs.
- [x] `--frames --range=0:1 --workers=2` wrote 24 frames; rerun said "0 frames to render (24 already done)" and the count stayed 24. See `log.txt`.
- [x] `--encode`: `ffprobe.txt` shows h264, yuv420p, 1920x1080, 24 frames, 1.0 s; a run with `--audio` has an aac stream and decodes.
- [x] `node tools/determinism.mjs --page=smoke/paper/index.html --t=0.5,4` passes (`determinism.txt`). Each t is hashed in one page, again in reverse order, and again in a fresh page. A negative control (page using `Math.random`) fails with exit 1.
- [x] No `index.html`: `error: page not found: index.html ...`, exit 1, no stack trace (`log.txt`). Same for `--encode` with no frames.
- ms/frame (smoke scene, 1920x1080): sheet about 20, PNG stills about 150, JPEG frames about 22 effective across 2 workers.

## Gaps
- KnightHacks flags `--crop-at`, `--loop`, `--clip`, `--png`, `--soft-gl` and `--gpu-angle` are not ported. They depend on p5/studio page globals; `--clip` is covered by `--frames` plus `--encode`.
- `--frames` and `--stills` honor `--crop` too (not in the contract); that was free and is harmless.
- `--encode` takes fps from `--fps` (default 24), since no page is loaded. Add `--fps` if a film ever differs.
- Not tested against a real `window.LOOMING` page or `src/core`: not built yet. The `LOOMING.ready`/`fps`/`duration` path is untested.
- `--encode` adds `-vf scale=out_range=tv` beyond the brief's flags. Without it, ffmpeg labels output `yuvj420p` (full-range), not `yuv420p`.
- Contact sheets have no time labels, matching KnightHacks. Cells are in the order given.
- Sheet columns are clamped to the frame count so a 2-frame sheet has no empty cells.

## State
built · 2026-10-15

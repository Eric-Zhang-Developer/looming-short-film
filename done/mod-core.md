# Done · mod-core

## What shipped
`src/core/`: `rng.js` (hash, hash2, mulberry32 ported bit-identically from 1776, plus FNV-1a `seedOf`), `ease.js` (clamp, lerp, ease, easeIn, easeOut, kf, spring from KnightHacks without BPM, plus `onTwos`), `palette.js` (doc 03 table plus `calendarRed`), `stage.js` (`createStage`, `exposeForRender`) and a node self-test. `lab/core.html` shows a cream wall, a kraft floor, one amber SpotLight and a gator-green box that slides on `kf` and wobbles on `spring`.

## Where it lives
- `src/core/rng.js`, `ease.js`, `palette.js`, `stage.js`, `selftest.js`
- `lab/core.html`, `lab/core.js`
- `evidence/mod-core/`: `selftest.txt`, `grep.txt`, `hashes.txt`, `lab_t0.5.jpg`, `lab_t1.5.jpg`, plus `render_lab.mjs` (headless render and hash script) and `xcheck_rng.mjs` (original vs port)
- Commits on `task/mod-core`: `0cae224` (code), `f01a6dc` (evidence), plus the commit for this note.

## How it was checked
- [x] **Every contract export exists with the documented signature.** See the export list at the end of `evidence/mod-core/selftest.txt`: rng `hash, hash2, mulberry32, seedOf`; ease `clamp, lerp, ease, easeIn, easeOut, kf, spring, onTwos`; palette `PALETTE` with exactly the 8 contract keys (asserted); stage `createStage, exposeForRender`. Defaults match the contract (`kf(t, keys, e = ease)`, `spring(t, t0, k = 6, w = 18)`, `onTwos(t, fps = 12)`, `createStage({ width = 1920, height = 1080, fov = 20 } = {})`, `exposeForRender(stage, { duration, fps = 24 })`). The lab page exercises `createStage`, `onFrame`, `renderFrame` and `exposeForRender` end to end.
- [x] **`node src/core/selftest.js` passes.** See `selftest.txt`: 8 groups ok, exit 0. Fixed hash and mulberry32 values come from running 1776's original `rng.ts` (node 24 type stripping). The same file shows the original and the port giving identical outputs on 8 hash inputs, 3 hash2 pairs and two mulberry32 streams. `kf` returns its key values exactly for numbers and arrays, and `onTwos(0.09) === 1/12`.
- [x] **`lab/core.html` renders headless.** `node evidence/mod-core/render_lab.mjs` uses the smoke/paper server approach with puppeteer-core. I looked at both stills: at `lab_t0.5.jpg` the box is mid-slide with a crisp cast shadow on the floor, and at `lab_t1.5.jpg` it's tilted about 15° in the spring wobble, with its low corner on the floor.
- [x] **Two renders of the same t give identical sha256.** See `hashes.txt`. The sequence was t = 0.5, 1.5, 0.5, 1.5, hashing lossless PNGs of the canvas: t=0.5 `a84df322…` and t=1.5 `0ad78fab…` were IDENTICAL both times, and the two times differ from each other. A second separate node process gave the same four hashes.
- [x] **No `Math.random`, `Date.now` or `performance.now` in `src/core/`.** See `grep.txt`: no matches (exit 1) in `src/core/` or `lab/core.js`.

## Gaps
- **`hash(n)` truncates non-integers.** `hash(0.5) === hash(0)`, as in the original (`^` casts to int32). That's faithful to the port, but anyone feeding it raw `t` will get steps. Pass integers such as `seedOf(...)`, frame indices or `boilSeed`.
- **The stage has no hook for post.** `renderFrame` always calls `renderer.render(scene, camera)` after the callbacks. The contract says `createPost`'s `render()` "replaces stage's plain render", but there's no documented way to do that. mod-post can only re-wrap `window.renderFrame`. A small contract addition, such as a replaceable `stage.render`, would fix it. I didn't add it because it's not in the contract.
- **`ready` is `Promise.resolve()`.** Nothing in core is async. Pages that load assets need their own wait, and the contract has no way to extend `stage.ready`.
- **Choices where the spec was silent.** The camera near/far is 0.05/20 and the stage leaves the camera at the origin (pages place it). `PALETTE` is frozen. `seedOf` stringifies parts, so `seedOf(7) === seedOf('7')`. It hashes UTF-16 code units, not UTF-8 bytes, so it isn't byte-for-byte standard FNV-1a for non-ASCII input.
- **Lab look.** With no ambient light and an amber spot, the cream wall reads orange and the off-cone areas go black. It's a mechanics test, not a look test.
- **Console noise.** One 404 in the page console, the same as in smoke-paper (most likely the favicon). Not chased.
- **Repo tools.** `render.mjs` and `tools/determinism.mjs` don't exist on this branch, so the AGENTS.md sheet and determinism commands weren't run. `render_lab.mjs` stands in for them.

## State
built · 2026-10-15

# Done · ts-check

## What shipped
JSDoc types and `// @ts-check` across the film's JavaScript (`src/**/*.js`, `render.mjs`, `tools/**/*.mjs`: 58 files),
checked by `npx tsc --noEmit` with a `tsconfig.json` (checkJs, noEmit, no build step). It's clean: one `@ts-expect-error`,
explained below. The pass is a no-op: the frame hashes, the mix hash and both self-checks are unchanged.

## Where it lives
Branch `task/ts-check` (cut from `wave/3-assets` at 3012a96), worktree `~/code/media/looming-ts-check`. Not pushed or merged.
- `1f5151c` dev deps: typescript 7.0.2, @types/three 0.186.0, @types/node 24.19.2 (package.json, package-lock.json)
- `1ce414b` tsconfig.json, `src/globals.d.ts` (Window's `renderFrame`/`LOOMING`, `Vec3`, `CamKey`), the JSDoc
- `4827451` the `// @ts-check` line in all 58 files (mechanical)
- this commit: `evidence/ts-check/`, this note

## How it was checked
- [x] `npx tsc --noEmit` exits 0 with 59 files in the program (58 + `src/globals.d.ts`): `evidence/ts-check/checks.txt`
- [x] Frames unchanged: 24 stills at 1920×1080, one or more per shot (all 21 in `src/timeline.js`), rendered in order from a
  fresh page with `node render.mjs --page=index.html --stills=… --out=…`. Before (3012a96, rendered twice; both runs match) and
  after (4827451, from the clean commit): **24 / 24 sha256 identical**. `evidence/ts-check/hashes.md`, `before.sha256`, `after.sha256`.
  The 24 hashes are all different from each other, and `sheet_after.jpg` shows they're real frames.
- [x] `node tools/mix.mjs` → `out/audio/mix.wav` sha256 `ccff87a2e3c41e2563fdb0dc331deabfd3dd0ed6583f9d7d4140dfc8e66ecbd9`, the
  expected hash (the same as the main checkout's mix). Same -15.9 LUFS / -4.7 dBTP report.
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 70 beats, 195.0s)`. Its whole output is byte-identical (cmp) to the base checkout's.
- [x] `node src/characters/acting.js` → `acting: ok 1.67 4.92 8.42`, byte-identical to the base checkout's.
- [x] Type-only, for all the code and not just the 24 frames: `python3 evidence/ts-check/typeonly.py wave/3-assets` →
  `58 files checked, 0 non-type changes`. It removes each `/** @type {…} */ (…)` cast with its parentheses and every added comment,
  then requires each line to match the base. I checked it catches real edits: changing one constant in s18 and one `<` to `<=` in
  s03 both got flagged, and both were put back.

## Gaps
- **`strict` is off.** TypeScript 7 turns it on by default. On this code that gives 2,355 errors: 1,047 implicit-any parameters
  (TS7006) and 463 possibly-null or -undefined reads among them. Closing them means a type on every arrow function and null
  guards in shot code, which is a refactor with real behaviour risk. Non-strict gave 294 errors, all now fixed. That's the follow-up
  if the director wants it.
- **Not every function is annotated.** Types went where inference failed or where a shape is shared (PaperOptions, PartSpec,
  Puppet, Preset, Kit, AssetCtx, Vec3, CamKey, the option bags of makePaper, act, buildRig, makeGator, specPose, the light
  factories, kitTools). Most internal helpers' parameters are still inferred `any`, which non-strict allows.
- **13 `any`s**, each at a duck-typed or deliberately loose spot: the boolean-into-Uint8Array stores in paper.js (2) and the
  `2 * (deg < 30)` in s03 (intended JS, cast rather than rewritten), any-kind lights in blob.js's traverse, `aim()`'s
  Vector3-or-Object3D target, the acting self-test's stub rig, `pad()`'s `= {}` default, s04's `inFridge` object, s15's
  `practiceSheet` props kit, s17b's figure list and its `fig.pose` (hazard 1 below), and the "rest goes to paperMesh"
  index signatures on s01's and s05's paper helpers. Callbacks passed around as `art`/`sheet` are typed `Function`.
- **One `@ts-expect-error`:** `tools/check_timeline.mjs` passes a file URL object to `import()`. That works (import() stringifies
  its specifier), but TS only takes a string. Changing it to `.href` would be a code change, so it isn't in this pass.
- **Three latent hazards tsc flagged, reported and not fixed** (a type pass doesn't change behaviour; each would be its own commit):
  1. `src/shots/s17b.js` (exam room): `fig.pose = seat(…)` stores an angle table over each figure's `pose()` method. It renders
     correctly because blend() calls its own closure, but any later `fig.pose(angles)` on those figures would throw. A different
     property name (e.g. `fig.seat`) would remove the trap.
  2. `src/audio/synth.js` `pad()`: `dur` has no default, and `pad(midis)` without it gets length NaN, so a silent empty buffer,
     not an error. Every caller passes `dur` today.
  3. `tools/cut.mjs`: a bare `--in` (no `=path`) makes `args.in === true` and `resolve()` throws a TypeError instead of the usage message.
- **Contract files** (`paper.js`, `lights.js`, `puppet.js`, `blob.js`, `post.js`, `material.js`, `timeline.js`, `render.mjs`) got
  comments only, outside a `contract-*` task: the director's ask named all of `src/`. No interface changed, so `docs/contracts.md`
  doesn't need to. There was no `tasks/ts-check.md`; the brief came from the session that started this one.
- **Not checked:** `lab/`, `smoke/` and `index.html`'s inline module are outside the brief's paths.
- **Frames:** 24 stills, not every frame. s09a's 73.6–74.5 s window (order-dependent, docs/notes/v4-fixlist.md) was left out of the
  times, though these runs were in order anyway. The type-only check is what covers the rest of the code.
- **Setup:** the worktree got the main checkout's `node_modules` and the ignored `assets/cut/*.png` copied in (both gitignored).
  The four 404s every render logs are the four kits that aren't frozen yet (`apt_furniture_sheet`, `apt_props_sheet`,
  `study_props_sheet`, `top_props_sheet` boxes.json); they fall back to proxies by design, and the base checkout logs them too.

## Story
The first thing I rendered was the baseline, twice. If the same commit can't render the same 24 hashes on two runs, a match
after the edit proves nothing. It could, so the comparison meant something. The surprise came from the compiler. The
current TypeScript is 7, it turns `strict` on by default, and my first run printed 2,355 errors. Most were parameters with no
type, so I turned strict off and got 294. Those were the useful ones.

Most of them came from one pattern, the destructured options object. For makePaper's `{ art, path, size, key, seed = 0 } = {}`,
TS 7 kept only the defaulted fields, so passing `art` was an error. For buildRig's, with no `= {}`, every field without a
default became required, so every crowd figure was "missing" `hoodie`. Typing those bags, plus giving the `[x, y, z]` constants
a tuple type so `position.set(...HIP)` checks, cleared nearly everything.

I made one wrong guess. I typed makePaper's `path` as an SVG path string. Then I read acting.js's mouth bar and the
`path.forEach(([x, y]) …)` in paper.js: it's a list of points. After that I read each value's uses before typing it.

The proof had to cover more than 24 frames. No JS parser was installed, so I wrote a small checker: strip each cast's comment
and parentheses, strip the comments, compare line by line. Its first run flagged two lines, both wrongly: in s03 my cast reused
parentheses the code already had, so stripping them changed the code, and in synth.js a new JSDoc block and a trailing
comment landed in one diff chunk. Once it handled both, I broke a
constant on purpose to make sure it would catch a real edit. It did. Rendering again from the clean commit gave the same 24
hashes (`evidence/ts-check/hashes.md`).

## State
built · 2026-10-18

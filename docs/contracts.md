# Contracts

The interfaces every shot is built on. Wave 2 builders implement exactly these. Shot builders call only what's listed here. A change goes through a `contract-<name>` task, and it may add to an interface but not break one (doc 09).

## Conventions

- **Units:** meters. It's a tabletop diorama: a gator is about 8 cm tall and a wall is about 1.6 × 0.9 m.
- **Axes:** +Y up. The camera looks down −Z. The main wall of a set is usually the plane z = 0, with things in front at z > 0.
- **Time:** `t` is global seconds from 0 to 195 (3:15 since G4). Shot code gets `tLocal`, seconds since its shot started. Every function that changes over time takes time as an argument and never reads a clock.
- **Determinism:** randomness comes only from `src/core/rng.js`. The same `t` always draws the same pixels.
- **Colors:** hex strings from doc 03. They're exported once as `PALETTE` in `src/core/palette.js`, so nobody types a hex code anywhere else.
- **Modules:** plain ES modules in `src/`. They import three as `import * as THREE from 'three'`, resolved by an import map in each HTML page to `/node_modules/three/build/three.module.js`. Pages that use `post.js` (or any three addon) also map `"three/examples/jsm/": "/node_modules/three/examples/jsm/"`.
- **Lab pages:** every module ships a `lab/<module>.html` that shows it in isolation and exposes `window.renderFrame(t)`. That page is how the module gets rendered as evidence.

## `src/core/` (task `mod-core`)

```js
// rng.js: ported from 1776's rng.ts
export function hash(n)                  // → float in [0,1), stateless
export function hash2(a, b)              // → float in [0,1)
export function mulberry32(seed)         // → () => float in [0,1), sequential stream
export function seedOf(...parts)         // → uint32 from strings/numbers, e.g. seedOf('gator', 'arm_l', 7)

// ease.js: ported from the KnightHacks core.js
export const clamp, lerp, ease, easeIn, easeOut
export function kf(t, keys, e = ease)    // keys: [[t, value], ...]; value may be a number or an array of numbers
export function spring(t, t0, k = 6, w = 18)   // damped kick at t0 → offset
export function onTwos(t, fps = 12)      // → t snapped to 12 fps steps (characters animate "on 2s")
  // onTwos floors with a 1e-4 epsilon, so the film's float-error local t (100.0833 − 100) still lands on its drawing

// palette.js
export const PALETTE                     // { navy, cream, gator, kraft, phone, lamp, ink, calendarRed }

// stage.js: one renderer, scene and camera per page
export function createStage({ width = 1920, height = 1080, fov = 20 } = {})
  // → { renderer, scene, camera, onFrame(fn), renderFrame(t), setRender(fn), ready: Promise }
  // setRender(fn) replaces the final draw call (default: renderer.render(scene, camera)); post.js uses it.
  // renderFrame(t) runs every onFrame(fn) callback with t, renders synchronously, then returns.
  // The renderer uses preserveDrawingBuffer, PCFShadowMap, sRGB output and NoToneMapping (doc 03 grades color in post, not via tone mapping).
export function exposeForRender(stage, { duration, fps = 24 })
  // sets window.renderFrame = stage.renderFrame and window.LOOMING = { duration, fps, ready }
```

## `render.mjs` (task `mod-render`)

A port of the KnightHacks `render.mjs` for three.js pages. It serves the repo root over local HTTP (ES modules don't load from file://) and drives Chrome via puppeteer-core.

```
node render.mjs --page=lab/paper.html --sheet=0,0.5,1 [--cols=4] [--w=480] --out=evidence/<id>/sheet.jpg
node render.mjs --page=... --strip=0:0.5 [--cols=6] [--w=320] --out=...
node render.mjs --page=... --stills=0.5,4 --out=evidence/<id>/      (full-res PNG per time)
node render.mjs --page=... --crop=x,y,w,h --sheet=... --out=...
node render.mjs --page=index.html --frames [--range=a:b] --workers=4    → out/frames (resumable)
node render.mjs --encode --out=out/film.mp4 [--audio=out/mix.wav]
```

The default page is `index.html` (the film). The default fps comes from `window.LOOMING.fps`. Evidence images are written as JPEG unless the name ends in `.png`.

## `tools/` (tasks `mod-render`, `mod-timeline`, `tool-gen`)

```
node tools/determinism.mjs --page=<html> --t=0.5,4     renders each t twice, prints sha256s and pass/fail
node tools/check_timeline.mjs                          gaps, overlaps, total 195 s ±5, every beat/cue resolves
node tools/gen.mjs --asset=<name> [--variants=3]       doc 08 loop: fresh temp dir, codex exec, copy to assets/raw/, thumb + sidecar
node tools/cut.mjs --in=assets/frozen/<f>.png --boxes=assets/cut/<name>.boxes.json   → assets/cut/<part>.png
```

## `src/timeline.js` (task `mod-timeline`)

```js
export const SHOTS   // [{ id: 's01', start, duration, beats: { name: tLocal } }, ...] from doc 06's shot list
export function shotAt(t)        // → { shot, tLocal }
export function beat(name)       // → global t of a named beat (names unique across the film)
export const DURATION            // 195
```

Shot modules are wired into `index.html` later (wave 4). The timeline only holds data.

Added by `contract-sensor`: three beats were renamed, times unchanged, because Marston's light is a motion-sensor zone, not a lamp: `lampClickMarston` → `sensorWakeMarston` (s15 0.5), `lampClickNeighbor` → `sensorWakeNeighbor` (s16 15), `lampClickFreshman` → `sensorWakeFreshman` (s18 4). `lampClickHome`, `lampOffHome` and `tableLightDies` (a zone timing out) keep their names. No `src/shots/*.js` named the old beats; the cues and the score did. Shot docs `docs/shots/s15`, `s16`, `s18` still use the old names until a doc pass.

## `src/paper.js` (task `mod-paper`)

```js
export const WEIGHTS   // { cardstock, kraft, tissue, vellum } → { tearAmp, tearFreq, rimPx, grain, thickness }

export function makePaper({
  art,          // optional ImageBitmap/HTMLImageElement: a painted piece (with alpha) from assets/cut or assets/frozen
  path,         // optional [[x,y], ...] in 0..1 texture space: a shape when there's no art (set pieces, tests)
  color,        // fill color when there's no art
  weight = 'cardstock',
  size,         // [w, h] in meters; the aspect comes from the art if given
  key,          // stable string for caching, e.g. 'wall-apt'
  seed = 0,     // boil seed: pass boilSeed(t, rate)
  res = 1024,   // texture px on the long edge
  rim = 'auto', // 'auto' | 'none' | 'broken' (look-pass-1); see below
})  // → PaperSheet { map, alphaMap, thickness, size: [w, h], key, seed }

export function boilSeed(t, rate = 10)     // floor(t * rate); quiet shots pass rate = 4
export function clearPaperCache()
```

What it does: it builds the silhouette from the art's alpha (or `path`), tears the edge along its normals with layered noise scaled by weight, adds a pale fiber rim and grain, and caches by `(key, seed, res)`. Painted art keeps its colors; only the edge and grain are added.

Rim (look-pass-1): no rim is ever a constant-width band around a whole shape. `'broken'` adds a thin near-white fiber rim whose width wanders and which has long, irregular breaks. `'none'` adds no rim; if the art already has a painted pale rim (measured once per asset: an edge clearly lighter than the body), that rim is thinned and broken the same way by resampling the painting from further in. `'auto'` is `'none'` on art with a painted pale rim and `'broken'` otherwise. The cache key includes `rim`. A plain `path` fill also gets large mottling and dry-brush streaks scaled by the weight's grain. The sheet cache is an LRU capped by texels (256 M), sized so a held 10 s shot of 8 sheets at 1024 px fits and a second pass hits.

## `src/material.js` (task `mod-material`)

```js
export function paperMesh(sheet, { translucency = sheet.thickness < 0.5 ? 0.8 : 0.05, edgeCatch = 0.6 } = {})
  // → THREE.Mesh: a PlaneGeometry of sheet.size with the paper material, castShadow and receiveShadow on,
  //   customDepthMaterial and customDistanceMaterial set to sample the alphaMap (cut-out shadows), DoubleSide, alphaTest 0.5
export function updatePaperMesh(mesh, sheet)   // swaps textures when the boil seed changes, without new geometry
```

The paper material is Lambert plus a back-light translucency term (doc 04) and an edge catch on torn rims lit from behind.

The edge catch (look-pass-2) is never an even band. Its width wanders along the edge (0.2–0.9 of the full ring), it has long breaks over about two fifths of the edge, and it is brightest where it is thinnest. The pattern is placed by the sheet's `key` and nudged by its boil `seed`, so it boils without reshuffling.

## `src/lights.js` (task `mod-lights`)

```js
export function phoneLight({ color = PALETTE.phone, intensity, angle = 1.2, distance = 0.6, penumbra = 0.45 } = {})  // → SpotLight, shadow on
export function lampLight({ color = PALETTE.lamp, intensity, angle = 0.6, penumbra = 0.5, reach = 2.5 } = {})
  // → { light: SpotLight, cone: Mesh (vellum cone), dust: Points (20–40 specks), update(t) }
  //   the cone runs reach × the light→target distance, so the surface the light lands on cuts it off at the pool
  //   update(t) refits the dust's bounding sphere every call, so a frame's pixels don't depend on which frame drew first
export function dawnLight()                    // → { light: DirectionalLight, update(t, k) }  k: 0 = cold night, 1 = gold
export function fluorescent({ flickerSeed })   // → { light, update(t) }  seeded flicker
export function ambient()                      // → HemisphereLight, very low (navy above, kraft below)

export function shadowScale(lightPos, subjectPos, wallZ)   // → d(light→wall) / d(light→subject), along the light→subject line
export function placeForScale({ subjectPos, wallZ, scale, height, side })  // → Vector3 light position that gives `scale`
export function aim(spot, target)                          // points a spotlight and keeps its shadow camera tight
```

Added by `contract-light-key`:

```js
aim(spot, target, { nearest })   // nearest: optional, m, the closest caster to the light; sets the shadow camera's near
```

`aim()`'s shadow-camera `near` is now `min(0.004, d/20)` (d = light→target) instead of half of d, so a caster a few cm from the light, such as a blob 5 cm from the phone, stays inside the shadow frustum. Evidence: `evidence/contract-light-key/near_before.jpg`, `near_after.jpg`.

Added by `contract-sensor` (docs/shots/README.md §3):

```js
export const SENSOR_WAKE   // [[dt, level], ...] at 0, 1, 2, 4, 5, 7, 9 frames of 24 fps: 0, 0.9, 0.1, 1, 0.2, 1.15, 1; stepped
export const SENSOR_SEED   // seedOf('s11', 'tableLightDies') % 65536: s11's timeout chatter, used by every timeout
export function sensorLevel(t, { wake, timeoutAt, seed = SENSOR_SEED } = {})   // → level multiplier on 1s, pure
export function sensorLight({ at = [0, 0.127, 0.040], aimAt = [0, 0, 0.098], intensity = 0.8, angle = 0.8, penumbra = 0.5, seed } = {})
  // → { light: SpotLight, group: Group (the sensor_trough), tube: Mesh, update(t, { wake, timeoutAt }) → level, level(t, opts) → level }
```

A ceiling fluorescent on a motion sensor over a Marston desk. Add `group`, `light` and `light.target` to the scene; `at` is the tube centre and `aimAt` the blob mark's foot in the shot's coordinates (mirrored units pass their own). The light is fluorescent-toned `lerp(cream, gator, 0.15)`, `castShadow` on, aimed with `aim()`; the housing, 5 louvres and 2 rods cast no shadow. `intensity` 0.8 is s15's lamp pool at the blob (0.16 × (0.136 / 0.060)²).

`sensorLevel(t, { wake, timeoutAt })` is the level on 1s, a pure function of `t`; `wake` and `timeoutAt` are times on whatever clock the shot uses (local or global, the same for both):
- **No `wake`:** lit (1) until `timeoutAt`, forever lit if it is also undefined. **With `wake`:** dark (0) before it.
- **Stutter-on** from `wake`: the `SENSOR_WAKE` keys, stepped, no easing. A relay frame at 0, then three strikes (0.9 at +0.042, 1.0 at +0.167, 1.15 at +0.292), settled at 1 from +0.375. Every wake in the film uses these, so they read as one event.
- **Time-out** from `timeoutAt`: s11's chatter as built, per 24 fps frame for 0.8 s. Each frame is `hash2(seed, floor(t * 24))` (the shot's own `t`, so use local time to reproduce s11's frames): below 0.45 it drops to 0.08 of a ceiling that falls 1 → 0.3, else it is at the ceiling. The first frame is always a drop. Dead (0) from +0.8. Wake and timeout combine (s14: woken at 1.0, times out at 4.2).
- Randomness is the seeded hash only: no clocks, no state. `update` returns the level so a shot can drive the phone's outshone rule (`≥ 0.5` → phone spot 0.2, below it → back).

The lamp's cone (look-pass-2) draws only its far wall, so anything standing in the light hides the vellum behind it instead of wearing an amber film over it. Its sides fade to nothing by view angle, over a width that wanders, so no side is a ruled line.

## `src/puppet.js` (task `mod-puppet`)

```js
export function definePuppet({
  name,
  parts,   // [{ name, sheet: PaperSheet, pivot: [u, v] (0..1 within the part), parent?: name, at: [x, y] (m, in parent space), z: 0.003 }]
  faces,   // { eyes: { open, closed, tired, gasp, worried, side }, mouth: { neutral, smile, o, line } } → PaperSheets
})  // → Puppet

Puppet.group                         // THREE.Group to add to the scene
Puppet.pose(angles)                  // { partName: radians } applied to joints
Puppet.blend(poses, keys, t)         // keys: [[t, poseName], ...] → eased blend, sampled onTwos(t)
Puppet.face({ eyes, mouth })         // swaps on a single frame
Puppet.follow(partName, t, { k, w }) // damped secondary motion (tail, pocket), on 2s
```

Poses live in the shot or character file as plain objects. A temporary test gator built from `paper.js` paths is fine until frozen art exists.

Added by `contract-puppet` (additive; everything above still holds):

```js
// parts[].sheet and every faces take may also be a function (seed) => PaperSheet,
//   e.g. (s) => makePaper({ art, key: 'gator-arm', seed: s }). Plain PaperSheets keep working and never boil.
Puppet.boil(t, rate = 10)            // boilSeed(t, rate); when the seed changes, re-tears every function sheet
                                     //   (and the face take on show) with updatePaperMesh: textures only, no new geometry
Puppet.follow(partName, t, { k = 6, w = 18, gain = 1 })  // gain scales the lag (1 = the part holds its world angle at first)
Puppet.joints                        // { partName: THREE.Group }: the joint at each pivot; rotation.z is the joint angle
Puppet.meshes                        // { partName: THREE.Mesh }: each part's paperMesh
Puppet.name
```

- **Face slots** are ordinary parts named `eyes` and `mouth` (a `faces` key), placed by the part list like any other part. `face()` swaps the slot part's textures, so every take in a slot must match the slot part's `size`; a mismatch throws.
- **`pivot` is v-down:** `[u, v]` in the part's texture space, u right and v down, 0..1, the same as `paper.js` paths and image pixels.
- **`pose()` after `blend()` overrides.** `blend()` sets every joint (joints not in any of its poses go to 0), so a manual angle must come after it in the frame.
- **`face()` must be called every frame,** and so must `boil()`. Both are stateful: skip one and the take or tear from an earlier `t` stays on. Their order within a frame doesn't matter.

## `src/blob.js` (task `mod-blob`)

```js
export function createBlob({ radius = 0.025, seed = 1 })
  // → { mesh, update(tLocal, { squash = 0, wobble = 1, eyes = 'open' }), stain: Mesh }
```

A plane carrying a metaball shader: glossy ink black with a specular highlight driven by the scene's lights, and two cream eyes. Its `customDepthMaterial` runs the same field, so the shadow matches the shape exactly. The stain is a fading decal on the surface below.

Ink (look-pass-2): the room's fill (ambient and hemisphere lights) lights only the eyes, never the body. The body is `PALETTE.ink` where it faces the key light and down to 0.55× that where it turns away, whatever the key's strength. Its only gloss is the key's reflection, a faint wet edge on the key's side and the eye catchlights.

Added by `contract-blob`:

```js
blob.update(tLocal, { squash, wobble, eyes, look = 1 })
  // eyes: 'open' | 'closed' | 'tired' | 'gasp' | 'worried' | 'side' (the gator's names). Any other name throws.
  // look: for 'side' only, which way the glance goes in the plane's own x: +1 → +x (screen right when the blob is
  //   unrotated and unmirrored), −1 → −x. Fractions slide less.
blob.silhouette({ color = PALETTE.ink, soft = 0.1 } = {})  // → THREE.MeshBasicMaterial
  // The blob's outline as a flat decal material, eyes as holes, edge faded over ±soft (radius units of the mesh it's on).
  // Shares the blob's uniforms, so it wobbles and blinks with blob.update(). Use it on new THREE.Mesh(blob.mesh.geometry, m);
  // the caller places and scales that mesh. If the mesh is scaled by s, set m.userData.soft.value = halfEdgeMeters / (s * radius).
```

- **Eyes.** `tired` is a half-lid drooping to the outer corners, `gasp` is wide (1.35× and raised), `side` is a level half-lid with both eyes slid toward `look`. The shadow and any silhouette cut the same shapes as holes. Evidence: `evidence/contract-blob/eyes.jpg`.
- **Key light** (`contract-light-key`) is the light that contributes most at the blob (intensity × colour luminance × distance falloff × spot cone), not the brightest by raw intensity, so a phone spot 5 cm away beats a dim window. `blob.update(t, { key: someLight })` forces a key (ignored while its intensity is 0). Evidence: `evidence/contract-light-key/s03_key_before.jpg`, `s03_key_after.jpg`, `key_auto.jpg`, `key_win.jpg`.
- **Silhouette** is for shadows drawn without a light (s13's crowd). A shot with a real shadow-casting light needs nothing: the shadow pass already uses the same field.

Added by `exam-ink` (Q7 b; supersedes the gloss described above for the body):

```js
blob.update(tLocal, { ..., left })
  // left: the tLocal at which the blob left its stain. From then the stain's opacity eases from 0.6 to 0 over 10 s.
  //   Omit it and update() never touches stain.material.opacity. update() must keep being called while the stain shows.
```

- **Matte ink.** The body is flat ink: no Fresnel rim, no specular reflection, no shading by the key's direction. Pigment pools in a darker band at the outline, the middle is mottled, and a fine grain rides the body (it squashes with it). The room and the key still light the eyes, their catchlights and the highlight.
- **One painted highlight.** A tapered cream stroke on the upper-left shoulder, a fixed distance inside the outline, so it sits up and left of the eyes in every eye state and never under them. It slides a little along the edge toward the key's side; it doesn't follow the view. Evidence: `evidence/exam-ink/before_after.jpg`, `eyes.jpg`.
- **Stain.** A blotted ring 3.2 × 2.2 radii, wider than the drop's foot so it shows around it, opacity 0.6. `stain.material.alphaMap` is still the blot's solid outline (s02 stretches it into its calendar trail); the ring is in `stain.material.map`'s alpha. It stays wherever the shot puts it: to leave a stain behind, stop moving the stain and pass `left`. Evidence: `stain_fade.jpg`, `stain_crop.jpg`, `s02_trail.jpg`.
- **Unchanged:** the field, the shadow (`customDepthMaterial`) and `silhouette()`. Their GLSL wasn't touched; s03's wall shadow and s13's decals are pixel-identical (`s03_diff.txt`, `s13_diff.txt`).

## `src/post.js` (task `mod-post`)

```js
export function createPost(stage, { focus, aperture = 0.02, maxblur = 0.01, lut = null, grain = 0.04, vignette = 0.25 } = {})
  // → { render(), set(opts) }   replaces stage's plain render when used
export function loadLUT(name)  // → texture for the per-act color grade (doc 03 color script), or null for none
```

There's no bloom pass.

The `night` grade (look-pass-1) is a bright picture-book night: navy stays a saturated colour and only cast shadows go near-black. It keeps doc 03's intent: cool, not grey.

## `src/audio/` (task `snd-engine`)

Offline and deterministic: plain Node, no Web Audio. Mono or stereo `Float32Array` at 48 kHz.

```js
// synth.js: voices from doc 05; each returns a Float32Array, seeded where noise is involved
export function feltPiano(midi, { vel = 0.7, dur = 1.5 } = {})
export function musicBox(midi, { vel = 0.6, dur = 1.2 } = {})
export function pad(midis, { dur, attack = 1.5, release = 2 } = {})
export function subSwell({ hz = 50, dur, attack })
export function noise(seed, dur)                 // white noise, seeded
export function lowpass(buf, hz), highpass(buf, hz), env(buf, { a, d, s, r })
export function mixInto(dest, src, atSec, gain = 1)

// foley.js: named sounds from doc 05's foley table
export const FOLEY   // { lampClick, sensorWake, penUncap, inkDrip, paperRustle, fluorescentHum, ... } → (seed, dur?) => Float32Array
                     // dur in seconds; beds and sized one-shots honour it, others ignore it; omitted → the sound's default length

// cues.js
export const CUES    // [{ beat: 'lampClickHome', sound: 'lampClick', gain: 0.8 }, ...]: by beat name, never raw time
// optional per cue: offset (s, may be negative; starts at beat + offset, default 0), dur (s) or until: '<beatName>'
// (length = beat(until) − start), stem ('foley' default | 'ambience' | 'music'), seed (default seedOf(sound))
```

```

Added by `contract-sensor`: `FOLEY.sensorWake(seed)` is the motion sensor's wake, 0.65 s: a relay clack on the beat (lampClick's snap pitched down, with a metallic tail), ticks at +0.042 and +0.167, a glassy ping at +0.292, and the tube's 120 Hz hum rising under it to the bed's level. Its peak is 0.5, under `lampClick`'s 0.57. It is cued once each on `sensorWakeMarston` (s15) and `sensorWakeFreshman` (s18), same seed and gain, so the two are sample-identical; there is none on `sensorWakeNeighbor`. `lampOffHome` now has the `lampClick` too, so the home lamp's two clicks are identical. Beds that stop for a click come back at +0.3 s, or at +0.65 s for a wake (the `ON()` helper in `cues.js`; the off click's window is 0.17 s). `src/audio/selftest.js` checks both pairs in `foley.wav` and `mix.wav`.

```
node tools/mix.mjs [--range=a:b]   → out/audio/stems/{music,foley,ambience}.wav and out/audio/mix.wav,
                                     loudness-normalized to -14 LUFS (ffmpeg loudnorm), prints measured LUFS and true peak
                                     Music stem: fixed +5 dB into a -6 dBFS sample-peak limiter (written post-limiter).
                                     loudnorm is linear (one gain for the file; LRA gate off), so identical cues stay
                                     identical in mix.wav; a full mix throws if loudnorm falls back to dynamic.
```

## `src/shots/` (task `mod-film`)

One file per shot, `src/shots/sNN.js`, ids from `SHOTS` in `src/timeline.js`. A shot builder replaces only its own file (start from `src/shots/_template.js`).

```js
export async function build(ctx)   // may be async (it usually awaits assets.load)
  // → { update(tLocal), dispose?() }
// ctx = {
//   stage,     // this shot's own stage: { renderer, scene, camera, onFrame(fn), setRender(fn) }, the shape createPost expects
//   scene,     // this shot's own THREE.Scene (= stage.scene)
//   camera,    // this shot's own PerspectiveCamera (= stage.camera): fov 20, 16:9, near 0.05, far 20 (createStage's defaults)
//   renderer,  // the one shared WebGLRenderer
//   assets,    // src/assets.js: await assets.load(name)
//   PALETTE,
//   post,      // (opts) => createPost(stage, opts): installs post on this shot only; film disposes its composer
// }
```

- **Own everything.** A shot builds its own lights, set and camera moves inside its own `scene` and `camera`. It never touches another shot's objects, the renderer's settings (shadow type, tone mapping, color space, size, clear color) or any module-level state. Set `scene.background` on your own scene.
- **Pure in `tLocal`.** `update(tLocal)` sets every animated value from `tLocal` alone (seconds since the shot's start), every frame. Nothing carries from one call to the next, so frames can come in any order. `ctx.stage.onFrame(fn)` callbacks run after `update` with the **global** `t` (post uses it for grain).
- **Lifetime.** `film.js` builds a shot on the first frame inside it, keeps at most the current and next shot alive, and disposes the rest: it calls `dispose?.()`, then disposes the post composer and every geometry and material in the shot's scene. Paper textures belong to `paper.js`'s cache and are not disposed. `dispose()` only needs to free what the film can't see (render targets you made, for instance).

## `src/film.js` and `index.html` (task `mod-film`)

```js
export function createFilm(stage)  // stage from createStage(); its own scene and camera go unused
  // → { renderFrame(t): Promise, ready: Promise }
  //   renderFrame(t): shotAt(t), build or reuse that shot, update(tLocal), run its onFrame fns with t, draw it
```

`index.html` creates the stage and the film and calls `exposeForRender(film, { duration: DURATION, fps: 24 })`, so `render.mjs` (`--sheet`, `--strip`, `--frames`) and `tools/determinism.mjs` work on the whole film. Rendering t out of order (t = 170, then 3) gives the same pixels as in order.

## `src/assets.js` (task `mod-film`)

```js
export async function load(name)
  // → { pieces: { pieceName: ImageBitmap }, sizes: { pieceName: [w, h] | undefined }, proxy: boolean }
  // name and piece names are the ones in docs/assets.md and PIECES below. An unknown name throws.
  // Results are cached per name: the same ImageBitmaps come back every time.
export const PIECES   // { name: { pieceName: [w, h, shape, paletteKey] } }: the proxy table, sizes in meters
```

- **Real art:** when `assets/cut/<name>.boxes.json` and `assets/frozen/<name>.png` both exist, each key in the boxes file is loaded from `assets/cut/<key>.png`. The piece name is the key with a leading `<name>_` removed (so `gator_sheet_arm_l` → `arm_l`; this keeps cut part files from colliding across sheets). `proxy` is false. Name boxes keys after the pieces in `PIECES`.
- **Proxies** otherwise: a flat silhouette in the asset's palette colour on a transparent background, at the piece's rough proportions (a gator-ish shape for gator parts, rectangles, rounded rectangles, ellipses or tapers for the rest). `proxy` is true, and that flag is the label: a proxy carries no text.
- `sizes` comes from `PIECES` either way: rough sizes in meters seeded from the shot specs. A shot's own spec numbers win over it.
- Every piece goes straight into `makePaper({ art: pieces.x, size, key, weight, seed })`.

Added by `rig-legs` (additive; everything above still holds):

```js
load(name)  // → { pieces, sizes, visible, proxy }
  // visible: { pieceName: [u0, v0, u1, v1] }: the box around the bitmap's opaque pixels (alpha ≥ 128), in uv, v down
```

- **`sizes[piece]` puts the visible shape at the PIECES size,** for proxies and frozen art alike. Bitmaps carry a transparent border (the proxy margin, `cut.mjs`'s `--pad`), so `sizes` is the whole bitmap's size, scaled so its opaque box spans the PIECES size along the PIECES long axis. It has the bitmap's own aspect, because `makePaper` never stretches art: it is exactly the sheet `makePaper` makes. The short axis follows the art (the torso proxy is drawn 0.9 of its box wide). Checked in `evidence/rig-legs/sizes.txt`: torn shapes within 1.4 % of PIECES on the long axis, proxy and fake frozen piece (the tear's own wobble), against 6.3 % short before.
- A rig or shot placing a pivot in the visible shape maps it into the bitmap with `visible`: `u = u0 + u_shape · (u1 − u0)`, the same for v. `characters/` does this for every part.
- `s01` pads its proxies locally on top of this; its final pass should drop that pad.

## `src/characters/` (task `char-rigs`)

One rig per character, so every shot poses the same gator the same way. Every rig is built from `ctx.assets.load(...)` pieces, so it works on proxies today and on frozen art with no code change. Every builder returns a contract **Puppet** (§puppet): call `boil(t, rate)` and `face(...)` every frame, and `pose()` after `blend()` overrides.

```js
// gator.js: the Student (gator_sheet + face_sheet)
export async function makeGator(ctx, { seed = 0, scale = 1, green, res = 512, facing = 'side' } = {})
  // → Puppet + { hand, hands, head34(on), facing, scale }
  // ctx: anything with ctx.assets (the shot ctx). seed salts the paper keys, so two rigs never share a tear.
  // green: a CSS colour that tints the green pieces (default: the art as painted). res: paper px on the long edge (1024 for close-ups).
  // facing 'side' parts: body (root), tail, arm_l (far), pocket, head, head34 (hidden), snout, jaw, eyes, mouth, arm_r (near)
  // facing 'front' (turn_front) parts: body, arm_l, arm_r, eyes, mouth.   facing 'back' (turn_back) parts: body
export function greenVariant(i)          // → a CSS colour: the i-th green, mixed from PALETTE (crowds, roommates, custodian)

// freshman.js
export async function makeFreshman(ctx, { seed = 0, scale = 0.85, green, res = 512 } = {})
  // freshman_sheet, the side rig at 0.85×: body, tail, backpack, arm_l, head, snout, jaw, eyes, mouth, arm_r (no pocket, no head34)

// roommates.js (s05)
export async function makeRoommateTall(ctx, { seed = 0, scale = 1, green = greenVariant(2), res = 512 } = {})
  // body (root at the hip), leg_l, leg_r, tail, arm_l, head, eyes, mouth, arm_r. Standing feet are 0.027 × scale below the hip.
export async function makeRoommateRound(ctx, { seed = 0, scale = 1, green = greenVariant(3), res = 512 } = {})
  // body (one piece, root at its bottom), arm_l, arm_r, eyes, mouth

// custodian.js (s14)
export async function makeCustodian(ctx, { seed = 0, scale = 1, green = greenVariant(4), res = 512 } = {})
  // body (root at the feet), tail, arm_l, mop (pivot at the handle top), head, cap, arm_r
export async function makeCart(ctx, { seed = 0, scale = 1, res = 512 } = {})
  // frame (root at its bottom center), tray, bucket

// crowd.js (s13, s16, s17)
export async function makeCrowd(ctx, who, { seed = 0, scale = 1, green, res = 512 } = {})
  // who: 'neighbor' | 'sleeper' (crowd_sheet, side view): body (root at the hip), head, arm_r. green defaults per who.
export async function makeHeroTop(ctx, { seed = 0, scale = 1, res = 512 } = {})
  // top_figures_sheet hero_top, seen from above: body (root at its center), tail, backpack, head, eyes, arms
export async function makeSeated(ctx, n, { seed = 0, scale = 1, green = greenVariant(n), res = 512 } = {})
  // n 1..6: top_figures_sheet seated_n as a one-part Puppet (part body, pivot at its center)

// exam.js: the hero's blob. Q5 (a): the body stays 0.012 and shrinks only in s16. Change the numbers here and only here.
export const EXAM_R                       // 0.012 (docs/shots/README.md §1)
export const SHRINK                       // [0.012, 0.0105, 0.009, 0.008, 0.007, 0.006, 0.005]: r after n problems solved
export const BLOB_R                       // { freshman: 0.012, neighbor: 0.013, custodian: 0.004, sleeper17: 0.006 }
export function examRadius(shot, solved = 0)   // → r: SHRINK[solved] in s16, 0.005 in s17 and s18, else EXAM_R
export function makeExam({ shot, seed = 1 })   // → createBlob({ radius: examRadius(shot), seed }) + { radius, scaleAt(solved) }
  // scaleAt(n) = examRadius(shot, n) / radius: multiply it into the mesh scale for s16's shrink steps

// poses.js
export const POSES        // { name: { part: radians } }: every named pose below, plain objects for Puppet.blend/pose
export const POSE_INFO    // { name: { rig, shots: ['s06', ...] } }: which rig takes it and which shots use it
                          // rig: gator | front | back | freshman | tall | round | custodian | neighbor | sleeper | heroTop
export function specPose({ lean = 0, arm = -70, far = arm - 10, head = 0, jaw = 0, tail = 0 })  // degrees → joint radians
export function pressKeys(t0 = 0)                  // → blend keys for s15's K0–K7 hand path, starting at t0
export function walk(t, { set = 'side', step = 1/3, t0 = 0, rise = 0.003 })  // → { keys, lift }
```

**The s15 convention** (`specPose`, every side rig). `lean` is the body's rotation about the hip in degrees, + forward (toward +x). `arm` is the near arm's **world** angle, 0 = +x, − = down; `far` is the far arm's. `head` is the head joint's angle on the body, + = snout up. `jaw` + = open. `tail` + = tip up. At scale 1 the shoulder is hip + (0.013, 0.030) rotated by the lean, and shoulder to fingertip is exactly 0.032, so the specs' fingertip tables hold: at s15's hip, `rest` (K0) puts `hand` at (−0.0511, −0.0121) against the spec's (−0.051, −0.012); every K-path tip lands within 0.6 mm (`evidence/char-rigs/tips.txt`). `specPose` only sets the parts it names, and `far: null` drops `arm_l` (one-armed crowd rigs).

**Rig rules.**
- Every rig faces **+x** (the top-view rigs face +y). A shot that needs it facing −x sets `group.scale.x = -1` and keeps the unmirrored angles (s18's `180° − angle` is what the mirror does for you). Rigs never touch their own `group` transform, so the shot owns its position, mirror and scale.
- **Root** = the hip for seated side rigs, which is also the feet when standing: `gator_sheet` has no legs, so standing he is about 0.053 tall (hip to head top), not 8 cm. The front and back turnarounds are sized to match. Place the group at s15's hip (−0.075, −0.012) at the desk, on the floor when standing, and 0.012 above the floor for `prone` (a pose can't carry translation).
- **z** (desk unit, README §2): body 0, pocket +0.003, near arm +0.012, far arm −0.004, all × scale. Put the group at the body plane (z 0.074 at the desk).
- `hand` is a `THREE.Group` at the near fingertip (`hands.arm_l` is the far one). Add a phone or pen to it.
- `head34(on)` swaps the side head, snout and jaw for `turn_head34` (s14). It's stateful: call it every frame in a shot that uses it.
- `facing: 'front'` arms hang at 0; + swings the tip toward +x, so in s10 `arm_r` swung out is −25°.
- Faces: every take of a slot is padded to one slot size, so `face()` never throws on size. Eyes `open, closed, tired, gasp, worried, side`; mouths `neutral, smile, o, line` (the hero top has eyes only, the custodian, cart, crowd and seated figures none).
- `walk()` loops pose keys `<set>_a → <set>_pass → <set>_b → <set>_pass` with one step per `step` seconds, so `blend()` draws contact, down, pass and up on 2s. `lift` is the root's rise for this drawing (+`rise` on the pass, × your scale is on you). Sets: `side` (`walk_side_*`), `front`, `back`, `tall`, `stoop`. Feed `keys` to `blend(POSES, keys, t)`; walk poses carry their own tail swing, so don't `follow('tail')` while walking.

**Art conventions for the cutter** (so frozen art drops in): side-view pieces as seen facing +x; arms horizontal, shoulder end left; tails pointing −x, root right; legs and the mop vertical, top end up; `hero_tail` pointing down. `turn_front` is painted **without arms** (the rig adds them).

**Poses.** `name — rig — shots`. Gator side rig unless noted; numbers are in `poses.js`.

| Group | Poses (shots) |
|---|---|
| Lamp press (K0–K7) | `rest` (s06, s15, s17), `reach_antic`, `reach_lift`, `reach`, `touch`, `press` (s06, s15; s18 mirrors them standing) |
| Startle | `recoil` (s06), `lean_away` (s06) |
| Sitting | `sit` (s11 `sit_upright`, s14 `sit_watch`, s15), `sit_screen` (s11), `sit_back` (s17), `slump` (s02, s03), `shrug` (s03), `head_down` (s12), `exhale` (s15) |
| Phone | `grab` (s06, s15), `grip` (s06, s11, s15), `lift_phone` (s03, s11), `scroll` (s03, s05, s06, s11 `sit_phone_hunch`), `scroll_flick` (s03, s05, s06) |
| Laptop | `lid_reach`, `lid_lift` (s11) |
| Writing | `write_a`, `write_b`, `write_c` (s15, s16, s17), `poise` (s15, s16), `uncap`, `uncap_pull` (s15), `brace`, `solve`, `think`, `flip` (s16) |
| Kneeling (s04) | `kneel_reach`, `kneel_antic`, `inspect`, `place`, `shake_a`, `shake_b`, `sit_heels` |
| Standing | `stand` (s07, s09 `stand_side`, s18), `look_up`, `sigh` (s09), `nod` (s07) |
| Curtains (s07) | `drill_a`, `drill_b`, `blow`, `crouch`, `lift_rod`, `tug`, `pull_curtain` |
| Floor | `prone`, `prone_flick` (s07, s08), `yawn` (s08) |
| Walks | `walk_side_a`, `walk_side_pass`, `walk_side_b`, `walk_side_pass_b` (s09, s18); `stand_front`, `walk_front_a`, `walk_front_pass`, `walk_front_b` — front (s10); `stand_back`, `walk_back_a`, `walk_back_pass`, `walk_back_b` — back (s09) |
| Freshman (s18) | `freeze`, `glance_up` — freshman |
| Roommates (s05) | `round_mash_a`, `round_mash_b`, `round_cheer_antic`, `round_cheer` — round; `tall_mash_a`, `tall_mash_b`, `tall_lean`, `tall_stand`, `walk_tall_a`, `walk_tall_pass`, `walk_tall_b` — tall |
| Custodian (s14) | `walk_stoop_a`, `walk_stoop_pass`, `walk_stoop_b` (s14's `stoop_walk_a/b`), `mop_a`, `mop_b` — custodian |
| Crowd (s16, s17) | `crowd_hunch`, `crowd_look_up`, `crowd_knob`, `crowd_write` — neighbor; `crowd_sleep` — sleeper |
| Top view (s13) | `top_head_down`, `top_head_up`, `top_look_l`, `top_look_r`, `top_look_back` — heroTop |

Added by `rig-legs` (Q9 (a), additive; where it differs from the text above, this wins):

```js
// gator.js
export const HIP              // 0.02944: standing hip height, the root above the soles when the near leg is plumb (× scale)
export function hipHeight(pose)  // → the root's height above the floor that puts the lower foot on it (scale 1, × scale),
                                 //   from the pose's body + leg_r / leg_l angles (the proxy foot: round heel and toe)
// poses.js
export function specPose({ ..., leg, farLeg = leg })  // leg / farLeg: the near / far leg's WORLD angle in degrees,
                                                      //   0 = straight down, + = foot forward (toward +x). Unset = not posed.
walk(t, opts)  // → { keys, lift, hip } for the side set: hip = the root's height above the floor for this drawing
               //   (× scale); lift = hip − its contact value; rise is unused. Other sets: { keys, lift } as before.
```

- **The Student and the Freshman have legs.** `gator_sheet` and `freshman_sheet` gain `leg_l` (far) and `leg_r` (near): short and stubby, a shin with a foot toward +x. Both hang from one pivot at the hip, behind the body (z −0.003 far, −0.001 near). Side rig parts are now: body (root), leg_l, leg_r, tail, arm_l, pocket, head, head34, snout, jaw, eyes, mouth, arm_r; the Freshman's the same with backpack and without pocket and head34.
- **He stands 8 cm.** The root stays the hip, so s15's numbers (shoulder +0.030, eye +0.042, the K-path) are unchanged; standing, place the root `HIP × scale` above the floor (or `hipHeight(POSES[name]) × scale` for any floor pose). Measured on drawn pixels: 79.8 mm sole to head top (`evidence/rig-legs/height.txt`). The blob ratio (README §1) holds again.
- **The turnarounds** (`facing: 'front' | 'back'`) are now 0.04 × 0.08, root still at the feet, with shoulders at HIP + 0.030, eyes at HIP + 0.041 and arm reach 0.032, matching the side rig.
- **Leg angles by stance** (poses.js): seated poses tuck the legs forward (near 60°, far 54°), clear of the floor at s15's seat; kneels fold them back (−90°) with the hip 0.011 above the floor (s04's 0.06 kneeling height); standing poses have the near leg plumb and the far foot 8° ahead; `crouch` puts both feet ahead (hip 2.9 mm down, s07's −3 mm); `prone`, `prone_flick` and `yawn` lay them flat behind.
- **The side walk has real foot contacts.** Contact: trailing leg −45° on its toe, leading leg +27.7° on its heel, both on the floor and 0.024 apart (s18's step length; move the root 0.024 × scale per step and the planted foot doesn't skate). The swing leg stays back (−36°) through the pass, so the set has a second pass, **`walk_side_pass_b`** (new pose; the walk is a → pass → b → pass_b). Place the root at `walk().hip × scale`. `evidence/rig-legs/feet.txt`: every drawing has the stance foot on the floor (±0.5 mm) and the swing foot above it; both feet down on contact.
- Art convention for the cutter: legs vertical, hip end up, foot pointing +x. `hipHeight` uses the proxy foot's shape; re-measure it from the cut `leg_l` when art lands.

A shot whose numbers differ from a named pose builds its own with `specPose` (the specs' numbers win). New poses go into `poses.js` through this task's owner or a `contract-characters` task.

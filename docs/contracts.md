# Contracts

The interfaces every shot is built on. Wave 2 builders implement exactly these. Shot builders call only what's listed here. A change goes through a `contract-<name>` task, and it may add to an interface but not break one (doc 09).

## Conventions

- **Units:** meters. It's a tabletop diorama: a gator is about 8 cm tall and a wall is about 1.6 × 0.9 m.
- **Axes:** +Y up. The camera looks down −Z. The main wall of a set is usually the plane z = 0, with things in front at z > 0.
- **Time:** `t` is global seconds from 0 to 180. Shot code gets `tLocal`, seconds since its shot started. Every function that changes over time takes time as an argument and never reads a clock.
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
node tools/check_timeline.mjs                          gaps, overlaps, total 180 s ±5, every beat/cue resolves
node tools/gen.mjs --asset=<name> [--variants=3]       doc 08 loop: fresh temp dir, codex exec, copy to assets/raw/, thumb + sidecar
node tools/cut.mjs --in=assets/frozen/<f>.png --boxes=assets/cut/<name>.boxes.json   → assets/cut/<part>.png
```

## `src/timeline.js` (task `mod-timeline`)

```js
export const SHOTS   // [{ id: 's01', start, duration, beats: { name: tLocal } }, ...] from doc 06's shot list
export function shotAt(t)        // → { shot, tLocal }
export function beat(name)       // → global t of a named beat (names unique across the film)
export const DURATION            // 180
```

Shot modules are wired into `index.html` later (wave 4). The timeline only holds data.

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

## `src/lights.js` (task `mod-lights`)

```js
export function phoneLight({ color = PALETTE.phone, intensity, angle = 1.2, distance = 0.6, penumbra = 0.45 } = {})  // → SpotLight, shadow on
export function lampLight({ color = PALETTE.lamp, intensity, angle = 0.6, penumbra = 0.5, reach = 2.5 } = {})
  // → { light: SpotLight, cone: Mesh (vellum cone), dust: Points (20–40 specks), update(t) }
  //   the cone runs reach × the light→target distance, so the surface the light lands on cuts it off at the pool
export function dawnLight()                    // → { light: DirectionalLight, update(t, k) }  k: 0 = cold night, 1 = gold
export function fluorescent({ flickerSeed })   // → { light, update(t) }  seeded flicker
export function ambient()                      // → HemisphereLight, very low (navy above, kraft below)

export function shadowScale(lightPos, subjectPos, wallZ)   // → d(light→wall) / d(light→subject), along the light→subject line
export function placeForScale({ subjectPos, wallZ, scale, height, side })  // → Vector3 light position that gives `scale`
export function aim(spot, target)                          // points a spotlight and keeps its shadow camera tight
```

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
export const FOLEY   // { lampClick, penUncap, inkDrip, paperRustle, fluorescentHum, ... } → (seed, dur?) => Float32Array
                     // dur in seconds; beds and sized one-shots honour it, others ignore it; omitted → the sound's default length

// cues.js
export const CUES    // [{ beat: 'lampClickHome', sound: 'lampClick', gain: 0.8 }, ...]: by beat name, never raw time
// optional per cue: offset (s, may be negative; starts at beat + offset, default 0), dur (s) or until: '<beatName>'
// (length = beat(until) − start), stem ('foley' default | 'ambience' | 'music'), seed (default seedOf(sound))
```

```
node tools/mix.mjs [--range=a:b]   → out/audio/stems/{music,foley,ambience}.wav and out/audio/mix.wav,
                                     loudness-normalized to -14 LUFS (ffmpeg loudnorm), prints measured LUFS and true peak
                                     Music stem: fixed +5 dB into a -6 dBFS sample-peak limiter (written post-limiter).
                                     loudnorm is linear (one gain for the file; LRA gate off), so identical cues stay
                                     identical in mix.wav; a full mix throws if loudnorm falls back to dynamic.
```

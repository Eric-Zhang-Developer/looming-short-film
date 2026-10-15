# 04 · Technical

## Architecture in one sentence

**Flat paper in a real light rig.** Every cutout is a flat textured plane placed at its own depth in a three.js scene. Real lights shine on the planes, glow through the thin ones, and cast shadows from layer to layer. Every frame is a pure function of time and is rendered headless to ffmpeg.

## Division of labor

| Layer | Made by | Why |
|---|---|---|
| **Painted surfaces**: character art, props, background plates, paper textures | Generated once with Codex image gen, curated by the director, frozen in `assets/` | Hand-painted surface detail is where pure procedural code looks fake |
| **Silhouettes**: torn edges, alpha masks | Code (`paper.js`) | Codex images have no alpha. Torn edges are what code does best. |
| **Light, shadow, translucency** | Code (three.js lights + `paperMaterial`) | This is the film's metaphor, and it has to be real |
| **Rigging, acting, timing** | Code (`puppet.js`, `timeline.js`) | Puppets don't drift between shots, so there are no character-consistency problems |
| **The ink blob** | Code (shader) | It is the only non-paper thing, and it must look liquid |
| **Sound** | Code (doc 05) | Locked to the timeline |

**The pitch line:** *the model paints the paper, the code is the scissors and the lamp.*

## Stack

- **three.js** pinned at `0.186.1` (r186, chosen in wave 1), plain ES modules, no framework.
- **Vite** for the dev preview page, with a time scrubber.
- **Puppeteer** (puppeteer-core plus local Chrome) steps time and captures frames.
- **ffmpeg** for encoding and muxing.
- **Node** for audio synthesis and tooling. **Python** only where the existing `build.py` already works.

## Determinism

- `renderFrame(t)` is the only entry point. Scene state is computed from `t` alone.
- No `Date.now()`, `performance.now()` or `Math.random()`. Use a seeded RNG (port `rng.ts` from *SUPER 1776*), seeded per object and per boil step.
- **Never call a generator at render time.** Generated images are assets on disk, committed and hashed.
- Self-test: render the same `t` twice and compare pixel hashes. Run it in CI or before every full render.

## Asset pipeline (generated art)

Claude drives Codex `image_gen` through `codex exec` with long, layered prompts and reference images. Rejects are kept as evidence, and the director picks what gets frozen. **The full workflow, prompt templates and generation order are in [doc 08](08-image-pipeline.md).** The technical constraints that matter here:

- Ask for a transparent background. In wave 1, Codex returned real alpha with clean edges even when green was requested. Keep the chroma key (`#00FF00`, or `#FF00FF` for green subjects) only as a fallback.
- Art must be flat-lit with no baked shadows, because three.js does all the lighting.
- At least 2048 px on the long edge for anything that can fill more than half the frame.
- Frozen picks live in `assets/frozen/` and are recorded in `assets/generated/manifest.json` (prompt file, reference hashes, model, date, sha256). They're never generated at render time.

**Cutting.** `tools/cut.mjs` (offline, run once per asset):
1. Key out the chroma color to get a rough mask.
2. Split part sheets into individual parts using bounding boxes listed in a small JSON file per sheet.
3. Write clean RGB plus mask PNGs to `assets/cut/`. Final alpha comes later from `paper.js`.

**Real paper option.** For plain paper grain (cardstock, kraft, tissue), a phone photo of real paper under flat light may beat generation. It's cheaper, has no model involved, and fits the theme. Both go through the same manifest.

## `paper.js`: from image to cutout

`makePaper({ art, mask, weight, seed, tearAmp, tearFreq })` returns `{ map, alphaMap, thickness }`.

1. **Silhouette:** start from the cut mask (or a vector path for set pieces), then push the edge outward and inward along its normals with layered value noise. This is the torn edge, and amplitude and frequency come from paper weight.
2. **Fiber rim:** a 2–6 px pale band just inside the torn edge, with streaky noise along it. This is the white deckle that says "paper."
3. **Grain:** multiply a fine noise or a scanned grain texture into the map.
4. **Boil:** the edge noise seed is `floor(t × boilRate)`, so edges re-tear 8–12 times a second (4 in quiet shots). Cache textures by `(asset, seed)`, so a 3:00 film only builds a few hundred variants.
5. **Weight presets:** `cardstock`, `kraft`, `tissue`, `vellum` (doc 03) set tear, rim, grain and `thickness`.

## `paperMaterial`: light through paper

Extend `MeshLambertMaterial` with `onBeforeCompile`:

- **Front:** standard Lambert diffuse from the map.
- **Back (translucency):** for each light behind the plane, add `lightColor × paperColor × translucency × (1 − thickness) × max(0, −N·L)`. Tissue and vellum glow; cardstock barely does.
- **Edge catch:** a small boost where alpha is near the edge and the light is behind. This makes torn rims glow when backlit.
- `side: DoubleSide`, `alphaTest: 0.5` (crisp cutouts, no sorting problems).

**Shadows from cutouts (important gotcha).** Without alpha-aware depth, every cutout casts a rectangle. Give each paper mesh a `customDepthMaterial` (and a `customDistanceMaterial` for point lights) that samples the same `alphaMap` and discards below 0.5. Wave 1 proved this works: torn edge and eye holes both show in the shadow. r186 may handle alpha-tested shadows on its own, but that hasn't been tested, so keep the custom depth material until a test shows it's redundant.

## Lights (`lights.js`)

| Light | three.js | Notes |
|---|---|---|
| Phone | `SpotLight`, wide angle (~70°), short `distance`, `decay` 2, cyan | A spot, not a point light: one shadow map instead of six. Placed low and close to the blob. |
| Desk lamp | `SpotLight`, narrow (~35°), amber, soft `penumbra` | Paired with a vellum cone mesh and 20–40 dust specks |
| Fluorescent | One dim `DirectionalLight` (RectAreaLight has no effect on Lambert paper in r186) | Flicker driven by a seeded noise curve on `t` |
| Dawn / window | `DirectionalLight`, color animated cold to gold | One large soft shadow |
| Ambient | `HemisphereLight`, very low | Navy above, kraft below |

**Shadow settings:**
- `PCFShadowMap`. r186 removed `PCFSoftShadowMap`, so softness comes from `light.shadow.radius` and the spotlight `penumbra`.
- Hero light map at 2048–4096.
- Tune `bias` and `normalBias` per light: watch for shadow acne on planes and shadows detaching from cutouts.
- Shadow camera frustums fit tightly to the set.

**The rule in numbers.** Shadow scale on the wall ≈ `d(light→wall) / d(light→blob)`. Shot files set light positions from this formula, so "loom 3×" is a target, not a guess.

## Puppets (`puppet.js`)

- A puppet is a tree of `Group`s. Each part is a paper mesh offset so its pivot is the joint.
- **Depth gaps:** each child part sits 2–6 mm (scene units) in front of its parent, so parts cast small shadows on each other.
- **Poses** are named objects of joint angles. `pose(name, t)` blends between them with easing (port `kf` and `spring` from the KnightHacks `core.js`).
- **On 2s:** characters sample time as `floor(t × 12) / 12`. Lights and camera use the real `t`.
- **Faces:** eye and mouth meshes swap textures from the generated face sheet, on a single frame.
- **Secondary motion:** tail and hoodie pocket follow with a damped spring, also stepped on 2s.

## The ink blob (`blob.js`)

- A plane with a fragment shader: 2D metaballs (3–5 centers animated by `t`) give a smooth field, thresholded into the blob shape.
- Fake normals from the field's gradient give a glossy specular highlight that responds to the scene's real key light.
- The eyes are two cream discs inside the field, animated by the same face-swap system.
- **Stain:** a faint darker decal on the paper it touches, fading over a few seconds.
- **Shadow:** a `customDepthMaterial` running the same field function, so the shadow is exactly the blob's shape.

## Crowds

Marston extras are `InstancedMesh` silhouettes cut from 4–6 generated poses, each with per-instance scale, tint and depth. Each one gets its own small shadow-blob decal, not its own light. The top-down desk grid is mostly static, so render it once per boil step and reuse it.

## Camera and post

- `PerspectiveCamera` with a narrow FOV (15–25°) placed far back. This is the long-lens diorama feel.
- `EffectComposer` passes:
  1. `RenderPass`
  2. `BokehPass` (miniature depth of field, focus animated per shot)
  3. a LUT pass (one LUT per act, doc 03 color script)
  4. a grain plus vignette shader
- **No bloom pass by default.** Use it only for the lamp bulb itself, if at all.

## Timeline and shots

- `timeline.js` is the single source of truth: an ordered list of shots, each with `start`, `duration` and named beats (`{ lampClickHome: 0.36 }` in local time). Sound cues reference beat names.
- One file per shot in `src/shots/`, exporting `build(scene)` and `update(scene, tLocal)`.
- `tools/check_timeline.mjs` (port from KnightHacks): no gaps, no overlaps, total 3:00 ±5 s, every cue resolves.

## Rendering

- Port the KnightHacks `render.mjs` and swap the p5 canvas for the three.js canvas (`preserveDrawingBuffer: true`). Keep its review modes:
  - `--sheet` (contact sheet)
  - `--strip` (every frame of a stretch)
  - `--crop` (full-res crops)
  - `--frames` with workers (parallel, resumable)
  - `--encode`
- 1920×1080 at 24 fps, 4,320 frames. Target under 1 s per frame.
- Encode H.264 (`-crf 16 -preset slow -pix_fmt yuv420p`). Mux the audio from doc 05.

## Planned repo layout

```
looming/
  README.md  docs/
  assets/specs.json  assets/prompts/  # asset specs, versioned prompts (doc 08)
  assets/raw/  assets/frozen/       # all outputs + rejects; director picks
  assets/generated/manifest.json
  assets/cut/                        # keyed, split parts
  assets/scans/                      # real paper photos (optional)
  src/paper.js  material.js  lights.js  puppet.js  blob.js  crowd.js  post.js
  src/timeline.js  src/shots/s01_*.js … s18_*.js
  src/audio/                         # synthesis (doc 05)
  tools/gen.mjs  cut.mjs  check_timeline.mjs  determinism.mjs
  render.mjs  index.html  package.json
  AGENTS.md  NOW.md  templates/      # orchestration (doc 09)
  tasks/  done/  evidence/  reviews/
  docs/contracts.md                  # contract module interfaces, written before wave 2
```

## Reuse from earlier projects

| From | Take |
|---|---|
| `~/code/hackathons/knighthacks-2026-video` | `render.mjs` review and render modes, `tools/check_timeline.mjs`, easing and spring helpers from `src/core.js`, the `emotions()` approach to face takes, `build.py` and `sfx/cues.py` for audio, and `ANIMATION_GUIDE.md`'s timing rules |
| `~/code/media/1776` | Timeline-as-truth design, seeded `rng.ts`, `selftest` invariants, `audio.ts` synthesis |

Copy what's needed into this repo. Don't import across projects.

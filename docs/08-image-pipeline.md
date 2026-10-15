# 08 · Image Pipeline (Claude drives Codex)

## Roles

| Who | Job |
|---|---|
| **Director** | Approves the style tile, picks every frozen asset, gives notes |
| **Claude** | Writes the asset specs and prompts, calls Codex, screens results, cuts and rigs the picks, renders them in context |
| **Codex `image_gen`** | Paints surfaces only: flat-lit, on a chroma-key background |
| **three.js** | All light, shadow and translucency (doc 04) |

Codex never sees the film and never touches code. It gets one asset brief at a time, with reference images, and paints.

## How Claude calls Codex

Claude runs Codex non-interactively from the repo root:

```bash
codex exec -C "$RUN" -s workspace-write --json \
  -i assets/frozen/style_tile.png -i assets/frozen/gator_sheet.png \
  - < assets/prompts/roommate_tall.v1.md
```

- `-i` attaches reference images (the approved style tile and any approved character sheets).
- The prompt file is piped on stdin, so long prompts are versioned files, not shell strings.
- **Run Codex in an empty scratch folder (`$RUN`), not the repo root.** Codex reads `AGENTS.md` and the docs it finds in its workspace. In wave 1 that cost about 190k input tokens for a single image, and it means Codex might try to follow rules written for Claude's subagents. `gen.mjs` makes a fresh temp folder per call, and Claude copies the output into `assets/raw/`.
- `-s workspace-write` lets Codex copy its output into that folder. Its image skill saves to `~/.codex/generated_images/` first, then copies into the workspace.
- The `image_gen` call doesn't appear in `--json` events, so the model name and image cost aren't reported. The sidecar records `"model": "unknown (Codex image_gen)"` and the token usage from `turn.completed`.
- **Resolution:** wave 1's 5-piece sheet came back at 1983×793, about 400 px per piece. That's fine for distant props, but anything that fills a lot of the frame needs **one piece per image** at the largest size.
- `tools/gen.mjs` wraps the call:
  - runs it N times for variants
  - finds each new file
  - writes a sidecar `.json` (prompt file, reference hashes, model, timestamp, output sha256)
  - writes a ≤1024 px JPEG thumbnail to `assets/raw/thumbs/` next to the sidecar

**Not yet verified:** that `codex exec` triggers `image_gen` reliably without a person in the loop, and what each image costs against the ChatGPT plan limit. The W1 smoke test checks both (doc 06).

## Prompting: extensive, layered, with images

Every prompt is a Markdown file in `assets/prompts/`, built from the same five blocks in the same order. Long and specific beats short and clever. Reference images carry the style; the text carries everything the images can't show.

### 1. Style block (identical in every prompt)

> Hand-painted cut-paper illustration for a stop-motion paper diorama. Matte cardstock surfaces painted with dry-brush gouache: visible bristle streaks, slightly uneven pigment, soft paper grain. Limited palette only: night navy #1E2440, cream #F2E8D5, gator green #6F8F5E, kraft brown #A8835A, plus small touches of lamp amber #F0A84A. Picture-book charm, simple rounded shapes, strong readable silhouettes. Match the attached style tile exactly in brushwork, texture and color.

### 2. Lighting block (identical in every prompt)

> Flat, even, shadowless studio lighting, as if the paper were scanned. No cast shadows, no drop shadows, no highlights, no rim light, no glow, no vignette, no ambient occlusion. Lighting will be added later by a 3D engine, so the art must contain none.

### 3. Asset block (per asset)

What it is, the camera view, the layout, and exact parts. Example for the gator sheet:

> A character sheet for "the Student," a young alligator college student, as a paper puppet. Chunky rounded body, short wide snout so the face reads front-on, small round eyes, gentle and a little sleepy. Gator green cardstock body with a lighter cream belly and darker dry-brush texture on the back. Wears an oversized cream hoodie with a front pocket.
> Layout, left to right, evenly spaced, nothing touching or overlapping:
> (1) full figure front view, (2) full figure three-quarter view, (3) the separated parts for a cutout puppet: head without jaw, lower jaw, body with hoodie, left arm, right arm, tail, hoodie pocket. Every part is a complete closed shape with about 40 px of empty background around it. Parts include the small overlap areas needed at the joints.
> Do not draw eyes or mouth. The face is blank (they are a separate sheet).

### 4. Technical block (identical in every prompt)

> Background: fully transparent (real alpha channel), with clean edges and no halo. If transparency isn't possible, use perfectly flat solid pure green #00FF00 instead, with no gradient, no texture and no shadow on it, and no green anywhere in the artwork. Highest available resolution, landscape. No text, letters, numbers, labels, logos, watermarks or borders anywhere.

(For green characters, make the fallback key magenta `#FF00FF` in both the asset and technical blocks. Wave 1: Codex returned real alpha even when asked for green, so expect alpha and treat the key as a fallback.)

### 5. Notes block (only on revisions)

The director's notes, quoted, plus Claude's screening notes, e.g.:
> Revision of v2. Keep the body shape from v2 exactly. Snout 20% shorter. The tail was cut off at the frame edge: keep it fully inside with margin. The hoodie had a cast shadow on the belly: remove it.

## Reference image rules

| Generating | Attach |
|---|---|
| Style tile (first) | 1–2 frames from the torn-paper reference, kept in `reference-videos/frames/` (gitignored, never committed or shipped) |
| Gator sheet | Style tile |
| Face sheet | Style tile + gator sheet |
| Other characters | Style tile + gator sheet (for scale and family resemblance) |
| Sets and props | Style tile + any set already frozen in the same location |
| Crowd poses | Style tile + gator sheet |

Once frozen, an asset can be used as a reference. Rejected outputs are never used as references.

## The loop for each asset

1. **Spec.** Claude adds the asset to `assets/specs.json`: name, purpose, shots, target resolution, key color, parts list, acceptance checklist.
2. **Prompt.** Claude writes `assets/prompts/<name>.v1.md` from the five blocks.
3. **Generate.** `gen.mjs` makes 3–4 variants into `assets/raw/`.
4. **Screen.** Claude views every variant and rejects any that fails the checklist:
   - baked-in light or shadow
   - background not flat
   - parts touching
   - text or artifacts
   - off-palette
   - too low resolution
   Reasons are written into each sidecar.
5. **Pick.** The director sees a contact sheet of the survivors and picks one, or gives notes. Notes become the next prompt version.
6. **Cap.** At most **8 generations per asset**. If it still fails, rethink the spec instead of re-rolling.
7. **Freeze.** The pick is copied to `assets/frozen/` and added to `manifest.json`. It's never edited after that. A change means a new version.
8. **Cut.** `tools/cut.mjs` keys the background, splits parts by bounding boxes, and writes RGB plus mask to `assets/cut/`.
9. **Approve in context.** Claude renders it lit, in its real shot. The director signs off there. A painting that works flat can still fail under the lamp.

## Generation order

1. **Style tile:** a small corner of the apartment as a paper diorama in the palette. It defines the look, and everything after it references it. **Lock this before anything else.**
2. **Gator sheet:** turnaround plus parts.
3. **Face sheet:** all eye and mouth swaps (doc 03 list) on one sheet, the same size and line weight.
4. **Other characters:** roommates ×2, custodian (with cart and a tiny sleeping blob *outline only*), Freshman.
5. **Sets:** apartment walls and furniture, Marston stacks, reading room, desk grid tiles, skyline, window plates.
6. **Props:** phone, desk lamp and tissue shade, calendar sheets, laptop, pens, pages, curtains, drill, ladder, controllers, fridge contents, energy drinks.
7. **Crowd poses:** 4–6 silhouette poses on one sheet.

**Never generated:** the ink blob (a shader, the one thing no image model touches), light cones, shadows, anything with legible text.

Budget: about 25–35 frozen assets from roughly 100–150 generations.

## Files

```
assets/specs.json            # every asset's spec and checklist
assets/prompts/<name>.vN.md  # every prompt, versioned, committed
assets/raw/                  # full-size outputs (gitignored, local only)
assets/raw/thumbs/           # every output as a ≤1024 px JPEG + its sidecar .json (committed: evidence)
assets/frozen/               # director picks, never edited
assets/generated/manifest.json
assets/cut/                  # keyed parts + masks
tools/gen.mjs  tools/cut.mjs
```

## Transparency deliverables

- The manifest, the prompts and every output (as thumbnails, rejects included, each with its screening reason) are public in the repo. Only the frozen picks are committed at full size, which keeps the repo at roughly 100 MB instead of 300–600 MB (doc 09 · Version control).
- The process log (doc 07) records every director pick and note.
- **End card:** one frozen Codex painting beside the same part cut, lit and casting its shadow in the scene. It shows the division of labor at a glance, with no words.

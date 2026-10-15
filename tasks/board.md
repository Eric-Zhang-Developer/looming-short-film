# Board

`id · type · owns · state · evidence`

## Wave 1 · Smoke tests (merged in #1)
- smoke-codex · painter · approved (wave 1 PR merged)
- smoke-paper · builder · approved (wave 1 PR merged)

## Wave 2 · Foundations · `wave/2-foundations`

### batch 1 (no dependencies)
- mod-core · builder · `src/core/`, `lab/core.html`, `lab/core.js`, `evidence/mod-core/`, `done/mod-core.md` · verified (merged) · evidence/mod-core/lab_t1.5.jpg
- mod-render · builder · `render.mjs`, `tools/determinism.mjs`, `tools/lib/`, `evidence/mod-render/`, `done/mod-render.md` · verified (merged) · evidence/mod-render/sheet.jpg
- mod-timeline · builder · `src/timeline.js`, `tools/check_timeline.mjs`, `evidence/mod-timeline/`, `done/mod-timeline.md` · verified (merged) · evidence/mod-timeline/check.txt
- tool-gen · builder · `tools/gen.mjs`, `tools/cut.mjs`, `assets/specs.json`, `assets/prompts/_blocks/`, `evidence/tool-gen/`, `done/tool-gen.md` · verified (merged) · evidence/tool-gen/cut_contact.jpg

### batch 2 (needs mod-core)
- mod-paper · builder · `src/paper.js`, `lab/paper.html`, `lab/paper.js`, `evidence/mod-paper/`, `done/mod-paper.md` · verified (merged) · evidence/mod-paper/painted.jpg
- mod-lights · builder · `src/lights.js`, `lab/lights.html`, `lab/lights.js`, `evidence/mod-lights/`, `done/mod-lights.md` · verified (merged) · evidence/mod-lights/phone.jpg
- mod-blob · builder · `src/blob.js`, `lab/blob.html`, `lab/blob.js`, `evidence/mod-blob/`, `done/mod-blob.md` · verified (merged) · evidence/mod-blob/squash_strip.jpg
- mod-post · builder · `src/post.js`, `lab/post.html`, `lab/post.js`, `assets/luts/`, `evidence/mod-post/`, `done/mod-post.md` · verified (merged) · evidence/mod-post/luts.jpg

### batch 3 (needs mod-paper, mod-lights)
- mod-material · builder · `src/material.js`, `lab/material.html`, `lab/material.js`, `evidence/mod-material/`, `done/mod-material.md` · verified (merged) · evidence/mod-material/tissue_on_off.jpg

### batch 4 (needs all modules)
- mod-puppet · builder · `src/puppet.js`, `lab/puppet.html`, `lab/puppet.js`, `evidence/mod-puppet/`, `done/mod-puppet.md` · verified (merged) · evidence/mod-puppet/action_strip.jpg
- lookdev-composite · builder · `lab/lookdev.html`, `lab/lookdev.js`, `evidence/lookdev-composite/`, `done/lookdev-composite.md` · built (merged; look half passes) · evidence/lookdev-composite/vs_reference.jpg
- contract-puppet · builder · `src/puppet.js`, `lab/puppet.js`, `docs/contracts.md` §puppet · verified (merged) · evidence/contract-puppet/boil_strip.jpg
- look-pass-1 · builder · `src/paper.js`, `src/post.js`, `src/lights.js`, `lab/lookdev.*`, contracts §paper/§post/§lights · verified (merged; 2 rig gaps → look-pass-2) · evidence/look-pass-1/before_after.jpg
- look-pass-2 · builder · `src/material.js`, `src/blob.js`, `src/lights.js`, contracts §material/§blob/§lights · verified (merged) · evidence/look-pass-2/before_after.jpg
- snd-score-reveal · builder · `src/audio/score.js` · verified (merged) · evidence/snd-score-reveal/timeline.png

### wave 4 prep
- mod-film · builder · `index.html`, `src/film.js`, `src/assets.js`, `src/shots/`, contracts §film/§assets/§shots · verified (merged) · evidence/mod-film/film_sheet.jpg
- char-rigs · builder · `src/characters/`, `lab/characters.*`, contracts §characters · verified (merged; legs → Q9) · evidence/char-rigs/cast.jpg
- proxy-margin · builder · `src/assets.js` · verified (merged) · evidence/proxy-margin/proxies.jpg
- contract-blob · builder · `src/blob.js`, `src/shots/s13.js` (API swap), contracts §blob · verified (merged) · evidence/contract-blob/eyes.jpg
- rig-legs · builder · `src/assets.js`, `src/characters/`, contracts §characters · verified (merged) · evidence/rig-legs/poses.jpg
- snd-cues · builder · `src/audio/cues.js` · verified (merged) · evidence/snd-cues/mix.mp3
- snd-foley-2 · builder · `src/audio/foley.js`, `src/audio/cues.js` · verified (merged) · evidence/snd-foley-2/spectra.jpg

### wave 4 · animatic (brief: `tasks/anim-shot.md`)
- anim-s01 · builder · `src/shots/s01.js` · verified (merged) · evidence/anim-s01/sheet.jpg
- anim-s13 · builder · `src/shots/s13.js` · verified (merged) · evidence/anim-s13/strip.jpg
- anim-s15 · builder · `src/shots/s15.js` · built (merged; loom 4.2×, in frame) · evidence/anim-s15/sheet.jpg
- anim-s06 · builder · `src/shots/s06.js` · blocked (merged; mirrors s15 at 4.2×) · evidence/anim-s06/sheet.jpg
- anim-s12 · builder · `src/shots/s12.js` · blocked (merged) · evidence/anim-s12/sheet.jpg
- anim-s14 · builder · `src/shots/s14.js` · in-progress · —
- anim-s16 · builder · `src/shots/s16.js` · in-progress · —
- anim-s17 · builder · `src/shots/s17.js` · in-progress · —
- anim-s18 · builder · `src/shots/s18.js` · in-progress · —
- contract-timing · builder · `src/core/ease.js`, `src/lights.js` (onTwos snap, lamp dust sphere) · verified (merged) · evidence/contract-timing/
- anim-s11 · builder · `src/shots/s11.js` · blocked (merged) · evidence/anim-s11/sheet.jpg
- anim-s05 · builder · `src/shots/s05.js` · verified (merged) · evidence/anim-s05/sheet.jpg
- anim-s10 · builder · `src/shots/s10.js` · verified (merged) · evidence/anim-s10/sheet.jpg
- anim-s08 · builder · `src/shots/s08.js` · built · `evidence/anim-s08/sheet.jpg`
- anim-s07 · builder · `src/shots/s07.js` · blocked (merged; seam light 7.3% vs 5% left for final lighting) · `evidence/anim-s07/sheet.jpg`
- contract-light-key · builder · `src/lights.js`, `src/blob.js`, contracts §lights/§blob · verified (merged) · evidence/contract-light-key/s03_key_after.jpg
- anim-s09 · builder · `src/shots/s09.js` · verified (merged) · evidence/anim-s09/walk_after.jpg
- anim-s04 · builder · `src/shots/s04.js` · verified (merged) · evidence/anim-s04/face_before_after.jpg
- anim-s03 · builder · `src/shots/s03.js` · verified (merged) · evidence/anim-s03/sheet.jpg
- anim-s02 · builder · `src/shots/s02.js` · verified (merged) · evidence/anim-s02/sheet.jpg

### parallel track: storyboard (docs)
- sb-act1 · builder (docs) · `docs/shots/` (s01–s08) · built (merged) · done/sb-act1.md
- sb-act2 · builder (docs) · `docs/shots/` (s09–s14) · built (merged) · done/sb-act2.md
- sb-act3 · builder (docs) · `docs/shots/` (s15–s18) · built (merged) · done/sb-act3.md
- sb-reconcile · builder (docs) · `docs/shots/`, `docs/assets.md`, `src/timeline.js` (additive beats) · built (merged) · docs/shots/QUESTIONS.md
- snd-engine · builder · `src/audio/`, `tools/mix.mjs` · verified (merged) · evidence/snd-engine/loudness.txt

### wave 3, started early
- asset-style-tile · painter · `assets/prompts/style_tile.v2.md`, `assets/specs.json` (style_tile), `tools/gen.mjs` (fixes), `assets/raw/thumbs/`, `evidence/asset-style-tile/`, `done/asset-style-tile.md` · built (merged, awaiting G1) · evidence/asset-style-tile/contact.jpg
- asset-style-tile-v3 · painter · `assets/prompts/style_tile.v3.md`, specs style_tile, `tools/gen.mjs` (cap) · approved (G1: "I like it", v3_4 frozen) · `evidence/asset-style-tile-v3/contact.jpg`
- exam-ink · builder · `src/blob.js`, `lab/blob.js`, contracts §blob · built (merged) · evidence/exam-ink/before_after.jpg
- snd-foley · builder · `src/audio/foley.js`, `evidence/snd-foley/`, `done/snd-foley.md` · verified (merged) · evidence/snd-foley/spectra.jpg
- snd-score · builder · `src/audio/score.js`, `tools/mix.mjs`, `evidence/snd-score/`, `done/snd-score.md` · verified (merged) · evidence/snd-score/score.mp3
- tool-cut-fixes · builder · `tools/cut.mjs`, `tools/gen.mjs`, `evidence/tool-cut-fixes/`, `done/tool-cut-fixes.md` · verified (merged) · evidence/tool-cut-fixes/despill.jpg
- contract-audio · builder · `tools/mix.mjs`, `src/audio/cues.js`, `src/audio/selftest.js`, `src/audio/foley.js` (signatures), `docs/contracts.md` §audio · verified (merged) · evidence/contract-audio/linear_check.txt
- snd-score-clicks · builder · `src/audio/score.js` · verified (merged) · evidence/snd-score-clicks/levels.txt
- asset-gator-sheet · painter · `assets/prompts/gator_sheet.v1.md`, specs gator_sheet · built (awaiting G2) · evidence/asset-gator-sheet/contact.jpg
- ref-ufl · researcher (read-only) · `reference-videos/ufl/` (gitignored), `docs/ref-ufl.md` · built · docs/ref-ufl.md

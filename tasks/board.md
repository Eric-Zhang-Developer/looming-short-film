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
- mod-film · builder · `index.html`, `src/film.js`, `src/assets.js`, `src/shots/`, contracts §film/§assets/§shots · in-progress · —

### parallel track: storyboard (docs)
- sb-act1 · builder (docs) · `docs/shots/` (s01–s08) · built (merged) · done/sb-act1.md
- sb-act2 · builder (docs) · `docs/shots/` (s09–s14) · built (merged) · done/sb-act2.md
- sb-act3 · builder (docs) · `docs/shots/` (s15–s18) · built (merged) · done/sb-act3.md
- sb-reconcile · builder (docs) · `docs/shots/`, `docs/assets.md`, `src/timeline.js` (additive beats) · built (merged) · docs/shots/QUESTIONS.md
- snd-engine · builder · `src/audio/`, `tools/mix.mjs` · verified (merged) · evidence/snd-engine/loudness.txt

### wave 3, started early
- asset-style-tile · painter · `assets/prompts/style_tile.v2.md`, `assets/specs.json` (style_tile), `tools/gen.mjs` (fixes), `assets/raw/thumbs/`, `evidence/asset-style-tile/`, `done/asset-style-tile.md` · built (merged, awaiting G1) · evidence/asset-style-tile/contact.jpg
- snd-foley · builder · `src/audio/foley.js`, `evidence/snd-foley/`, `done/snd-foley.md` · verified (merged) · evidence/snd-foley/spectra.jpg
- snd-score · builder · `src/audio/score.js`, `tools/mix.mjs`, `evidence/snd-score/`, `done/snd-score.md` · verified (merged) · evidence/snd-score/score.mp3
- tool-cut-fixes · builder · `tools/cut.mjs`, `tools/gen.mjs`, `evidence/tool-cut-fixes/`, `done/tool-cut-fixes.md` · verified (merged) · evidence/tool-cut-fixes/despill.jpg
- contract-audio · builder · `tools/mix.mjs`, `src/audio/cues.js`, `src/audio/selftest.js`, `src/audio/foley.js` (signatures), `docs/contracts.md` §audio · verified (merged) · evidence/contract-audio/linear_check.txt
- snd-score-clicks · builder · `src/audio/score.js` · verified (merged) · evidence/snd-score-clicks/levels.txt

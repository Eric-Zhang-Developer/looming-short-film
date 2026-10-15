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
- mod-paper · builder · `src/paper.js`, `lab/paper.html`, `lab/paper.js`, `evidence/mod-paper/`, `done/mod-paper.md` · in-progress · —
- mod-lights · builder · `src/lights.js`, `lab/lights.html`, `lab/lights.js`, `evidence/mod-lights/`, `done/mod-lights.md` · verified (merged) · evidence/mod-lights/phone.jpg
- mod-blob · builder · `src/blob.js`, `lab/blob.html`, `lab/blob.js`, `evidence/mod-blob/`, `done/mod-blob.md` · in-progress · —
- mod-post · builder · `src/post.js`, `lab/post.html`, `lab/post.js`, `assets/luts/`, `evidence/mod-post/`, `done/mod-post.md` · verified (merged) · evidence/mod-post/luts.jpg

### batch 3 (needs mod-paper, mod-lights)
- mod-material · builder · `src/material.js`, `lab/material.html`, `lab/material.js`, `evidence/mod-material/`, `done/mod-material.md` · todo · —

### batch 4 (needs all modules)
- mod-puppet · builder · `src/puppet.js`, `lab/puppet.html`, `lab/puppet.js`, `evidence/mod-puppet/`, `done/mod-puppet.md` · todo · —
- lookdev-composite · builder · `lab/lookdev.html`, `lab/lookdev.js`, `evidence/lookdev-composite/`, `done/lookdev-composite.md` · todo · —

### parallel track: storyboard (docs)
- sb-act1 · builder (docs) · `docs/shots/` (s01–s08) · in-progress · —
- sb-act2 · builder (docs) · `docs/shots/` (s09–s14) · in-progress · —
- sb-act3 · builder (docs) · `docs/shots/` (s15–s18) · in-progress · —
- snd-engine · builder · `src/audio/`, `tools/mix.mjs` · verified (merged) · evidence/snd-engine/loudness.txt

### wave 3, started early
- asset-style-tile · painter · `assets/prompts/style_tile.v2.md`, `assets/specs.json` (style_tile), `tools/gen.mjs` (fixes), `assets/raw/thumbs/`, `evidence/asset-style-tile/`, `done/asset-style-tile.md` · in-progress · —

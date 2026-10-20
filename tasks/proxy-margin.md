# Brief · proxy-margin

**Type:** builder · **Wave:** 4 (prep) · **Model:** claude-sonnet-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` §assets, §paper, `src/assets.js`, `src/paper.js`, `done/anim-s01.md` (the proxy finding)

## Goal
Rectangular proxies fill their canvas edge to edge, so `paper.js` has no edge to tear and they render as ruler-straight lines. s01 worked around it locally. Fix it once in the proxies so the 16 remaining shots don't each hit it.

## Owns
- `src/assets.js`
- `evidence/proxy-margin/`, `done/proxy-margin.md`

## Spec
Every proxy silhouette leaves a transparent margin (about 4% of the long edge, at least 8 px) so `makePaper` tears every edge. Keep proxy proportions: the margin is outside the shape, and the reported size still means the shape's size. Frozen-art pieces are untouched.

## Acceptance
- [ ] `evidence/proxy-margin/proxies.jpg` (same layout as `evidence/mod-film/proxies.jpg`): every edge torn, crop at 200%
- [ ] `tools/determinism.mjs --page=index.html --t=0.5,10,95,0.5` passes
- [ ] s01 still renders the same layout (its local padding may now double up; note it, don't edit s01)

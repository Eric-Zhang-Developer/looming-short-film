# Brief · contract-blob

**Type:** builder · **Wave:** 4 (prep) · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` §blob, §characters, `src/blob.js`, `src/characters/exam.js`, `src/shots/s13.js`, `done/char-rigs.md`, `done/anim-s13.md`, `done/look-pass-2.md`

## Goal
Two additive gaps in the Exam's module, before 16 shots lean on it:
1. **Eye states.** `blob.js` draws only `open`, `closed` and `worried`. The specs also use `tired`, `gasp` and `side`, which silently draw `open` today. Add them, each readable at the blob's film size (r 0.012 m) as its emotion.
2. **Silhouette.** `s13` builds shadow decals by borrowing `blob.js`'s internal shadow-pass hook. Expose it in the contract as `blob.silhouette({ radius, seed }) → Material` (or whatever shape fits), and switch s13 to it **without changing s13's pixels**.

## Owns
- `src/blob.js`, `src/shots/s13.js` (only the import and the call to the new API), `lab/blob.js`
- `docs/contracts.md` §blob (additive)
- `evidence/contract-blob/`, `done/contract-blob.md`

## Acceptance
- [ ] `evidence/contract-blob/eyes.jpg`: all six states at film size and at 4×
- [ ] s13 pixels unchanged: `tools/determinism.mjs` hashes at 89.6 and 92.5 match the pre-change hashes (record both)
- [ ] Determinism passes for `lab/blob.html` and `lab/characters.html`
- [ ] The contracts.md diff is additive only

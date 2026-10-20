# Brief · contract-light-key

**Type:** builder · **Wave:** 4 · **Model:** claude-sonnet-5-5
**Read first:** `AGENTS.md`, `docs/contracts.md` §lights, §blob, `src/lights.js`, `src/blob.js`, `done/anim-s03.md`

## Goal
Two rig gaps found by s03, fixed once instead of in every phone shot:
1. **`aim(spot, target)`** sets the shadow camera's near plane at half the light-to-target distance (~6 cm for a phone). That puts it behind a blob 5 cm from the phone, so the blob casts no shadow. Make `near` small enough for tabletop scale (e.g. `min(0.004, d/20)`), or derive it from an optional `nearest` argument. Additive: the signature stays.
2. **The blob's key light** is chosen by raw intensity, so in s03 a dim window beats the phone spot that actually lights it. Choose by the light's contribution at the blob (intensity × distance falloff × cone/penumbra factor), and add an optional `update(..., { key })` override. Additive.

## Owns
- `src/lights.js`, `src/blob.js`, `docs/contracts.md` §lights and §blob (additive)
- `evidence/contract-light-key/`, `done/contract-light-key.md`

Do **not** edit `src/shots/*`. s03 sets `near` itself, which stays harmless.

## Acceptance
- [ ] A lab render (lights lab or a scratch page) where a blob 5 cm from an aimed spot casts its shadow with the default `aim()` near
- [ ] s03 crop: the blob's highlight now follows the phone (before and after)
- [ ] Determinism passes for `lab/lights.html`, `lab/blob.html`, and `index.html` at 15.6, 89.6 and 0.5
- [ ] contracts.md diff additive

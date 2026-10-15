# Done · tool-cut-fixes

## What shipped
- `cut.mjs` despills keyed sheets: the key is auto-picked from the corner pixel (magenta or green), edge pixels within 2 px of the key are unmixed against it and the key hue clamped out. Interior pixels are untouched.
- `cut.mjs` clamps alpha 250-254 to 255 on real-alpha sheets. New `--out=<dir>` writes parts somewhere other than `assets/cut/` (used for scratch tests).
- `gen.mjs` counts the 8-cap from `codex_images_generated` in each sidecar (1 when absent) instead of counting files.

## Where it lives
`tools/gen.mjs` (710338b), `tools/cut.mjs` and `evidence/tool-cut-fixes/` (see `git log` for the second `mod(tool-gen):` commit). Test parts went to a scratch dir outside the repo.

## How it was checked
- [x] Despill: `evidence/tool-cut-fixes/despill.jpg`, 400% nearest-neighbour crops over navy `#1a2744`. Left old, right new. Rows: v2_4 top-left, v2_4 bottom-right, v2_1 top-left. No fringe on the right. Metric in `cut_runs.txt`: edge pixels with magenta spill > 40 drop 841 → 0 (v2_4 piece 1) and 819 → 0 (v2_1 piece 1).
- [x] Alpha clamp: `evidence/tool-cut-fixes/alpha_hist.txt`, v2_2 piece 1. Before: 250-252 8536, 253 86469, 254 10183, 255 254. After: all 105442 at 255. The 6043 antialiasing pixels (alpha 1-249) are unchanged.
- [x] Cap: `evidence/tool-cut-fixes/gen_cap.txt`. `--dry-run --variants=1` prints `7/8 used`; `--variants=2` is REFUSED with `style_tile_v1 (1), v2_1 (2), v2_2 (1), v2_3 (1), v2_4 (2)`.
- [x] `cut.mjs --auto` on v2_4 finds 6 islands; the boxes JSON is byte-identical to the one the old cut.mjs produced (v2_1 and v2_2 also 6). See `cut_runs.txt`.
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 16 beats, 180.0s)` (unaffected; sanity only).

## Gaps
- Despill is checked on the cream torn rim of piece 1 only, plus the numeric metric on piece 1 of v2_1 and v2_4. I did not eyeball every piece, and no piece has paint that is genuinely pink or purple at its edge. Such a pixel would lose some saturation and alpha in the 2 px band.
- Despill clamps only for magenta and green keys. Any other `--key` still gets the hard key only.
- The auto key pick looks at pixel (0,0) of the sheet. A sheet whose corner is not key-coloured falls back to green, as before. `--key` overrides it.
- The 250 threshold and the 2 px band are my choices; the brief gave the threshold but not the band. Both are single constants.
- The cap's sidecar lookup is by `<stem>.json` in `assets/raw/thumbs/`. A raw PNG with no sidecar counts as 1.
- Not tested live: no codex call was made (dry run only), so counting a freshly written sidecar is untested beyond the 5 existing ones.

## State
built · 2026-10-15

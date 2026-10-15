# Done · sb-act2

## What shipped
Six buildable shot specs for Act 2b, Marston: s09 (exterior), s10 (stacks), s11 (laptop, then phone), s12 (Quiet 1), s13 (crowd reveal, top-down) and s14 (Custodian). Each follows `templates/shot.md` and gives layer z positions, light positions with the blob's target shadow scale, camera FOV and position, poses keyed to local times, face swaps, and sound cues by beat name. s11, s12 and s14 share one table set with fixed coordinates.

## Where it lives
- `docs/shots/s09.md` … `docs/shots/s14.md`
- Branch `task/sb-act2`: `9917937` (s09–s10), `ef76bf4` (s11–s12), `1987080` (s13–s14), `7c3b1fd` (s12 beat fix), plus the commit for this note.

## How it was checked
- [x] **Every template section is filled.** A grep for the Time and Story-job lines plus the 8 `##` headings finds 10 of 10 in every file. Positions, angles, intensities and times are numbers. Light intensities are ratios to a phone reference of 1.0, because no calibrated value exists yet (see Gaps).
- [x] **Every timeline beat is in the right shot.** `quiet1Start` (s12 @ 0), `headLift` (s13 @ 0.5) and `custodianPass` (s14 @ 0.5) each appear in the Beats line and in the action. s09–s11 have no beats in `src/timeline.js`. `node tools/check_timeline.mjs` → `ok (18 shots, 16 beats, 180.0s)` (the timeline is unchanged).
- [x] **Blob shadow scale is stated wherever the blob is visible:** s09 1.0× (≤ 1.5× on the plaza), s10 2.8× → 10.8× (table by second), s11 1.0× → 4.7× → 6.0×, s12 7.5×, s13 hero 7.5× plus each crowd desk's scale (3×–9×), s14 hero 7.5× and the Custodian's tiny blob 1.0×. Phone-key scales come from the doc 04 formula, scale = z_light / (z_light − z_blob) along the light→blob ray with the wall at z = 0. I did the arithmetic by hand; **not verified by a render.**
- [x] **Asset list:** below.
- [x] **Spec conflicts:** below.
- [ ] **Whether these specs are buildable without guessing: not verified.** That shows only when a wave 4 builder blocks a shot from them.

## Asset list (s09–s14)
CU = close-up or hero-scale (needs detail, ≥ 2048 px if it fills more than half the frame). BG = background or small in frame.

| Name | What it is | Shots | Scale |
|---|---|---|---|
| `gator_sheet` | The Student: turnaround (side, front, back, 3/4 head) plus parts | s09 side + back, s10 front, s11 side, s12 side, s14 side + 3/4 head | CU (s11, s12), mid |
| `face_sheet` | Eyes (open, closed, tired, gasp, worried, side) and mouths (neutral, smile, o, line) | s09–s14 | CU |
| `gator_top` | NEW. The Student seen from directly above: body, head, arms, tail, backpack as parts | s13 | BG (about 0.06 m in a 1.0 m frame) |
| `backpack` | NEW. The Student's backpack, side, front and back views, with the right side pocket the blob rides on | s09, s10, s11, s12, s14 | mid |
| `phone` | Reused. The Student's phone | s10, s11, s12, s14 | CU (s11, s12) |
| `laptop` | NEW. Laptop in profile, base and lid as separate parts, screen with glyph scribbles only | s11, s12, s14 | CU |
| `desk_lamp` | Reused. The lamp, **unlit in every Act 2b shot** (planted for s15) | s11, s12, s14 | mid |
| `night_sky` | NEW. Night Navy sky plate (the moon is a `paper.js` path, not art) | s09 | BG |
| `campus_trees` | NEW. Tree-line silhouette strip | s09 | BG |
| `marston_ext` | NEW. Marston façade, 3 × 8 window holes, **no lettering** | s09 | BG, but 70% of frame width, so ≥ 2048 px |
| `marston_doors` | NEW. Entrance vestibule flat with a doorway hole | s09 | mid |
| `plaza_ground` | NEW. Paving ground plane (a real paper scan would do) | s09 | BG |
| `hedge` | NEW. Low foreground hedge | s09 | foreground, soft |
| `marston_wall` | NEW. Plain aisle end wall | s10 | BG (receives the big shadow) |
| `marston_stacks` | NEW. Bookshelf face, blank spines, kraft shelves; at least 4 crops so no wing repeats | s10 (8 wings), s11, s12, s14 | BG; the shadow surface in s11–s14 |
| `ceiling_header` | NEW. Ceiling border flat (the tube is a `paper.js` vellum path) | s10 | BG |
| `marston_floor` | NEW. Tile floor, also used top-down | s10, s11, s13, s14 | BG |
| `marston_table` | NEW. Reading table in profile: top, apron, legs | s11, s12, s14 | CU |
| `marston_chair` | NEW. Chair in profile | s11, s12, s14 | mid |
| `desk_top` | NEW. Desk plus chair seen from above, instanced 15× by seed | s13 | BG |
| `props_top_sheet` | NEW. Top views of: phone, laptop, desk lamp, open textbook, energy-drink can, blank page, pen, oversized backpack | s13 | BG |
| `crowd_top_sheet` | NEW. 6 top-view seated gator poses with 2–3 parts each, including the Sleeper, the Drinks gator and the Freshman | s13 | BG |
| `custodian_sheet` | NEW. Older gator with a hunch and a cap, side view, parts | s14 | mid / foreground |
| `custodian_cart` | NEW. Cleaning cart with top tray and bucket, plus the mop as a separate part | s14 | foreground |
| (code) | Blobs (`blob.js`), shadow decals, moon and tube paths (`paper.js`). No painted asset. | all | — |

That makes 24 painted assets in total: 20 new, plus `gator_sheet`, `face_sheet`, `phone` and `desk_lamp` shared with other acts (the brief's examples, so I assumed they exist across acts). **The top-down views are the expensive part:** `gator_top`, `crowd_top_sheet` and `props_top_sheet` serve one 7-second shot.

## Spec conflicts and what I assumed
1. **The s10 key light contradicts the rule.** Doc 06 lists fluorescent as s10's key, and doc 02 has the shadow "fill the aisles." But fluorescents are overhead, and the doc 02 rule says overhead light makes the shadow small. *Assumed:* the phone, held low in his hand, casts the loom (2.8× → 10.8×). The fluorescents stay as set light and flicker when the blob passes under them. s14 keeps fluorescent as key, and that is consistent: the Custodian's blob is 1× under it.
2. **s13 asks for one shot to do two things.** Doc 02 has him lift his head *and* a wide top-down reveal, the timeline gives that one shot, and doc 03 bans the crane or pull-back that would join them. *Assumed:* one locked top-down shot, with the head lift read from above (gator eyes are on top of the head). This forces new top-view art (above). The alternative is to split s13 into a close head lift and the wide, which is a timeline change.
3. **Quiet 1 has two rules that collide.** Doc 02 says "the shadow slowly breathes," and doc 03 says "only light and boil move." *Assumed:* the blob's mesh breathes (±6% scale, 5 s period), treated as idle motion like the boil, while the gator holds one pose for all 10 s. The 0.55 desaturation (doc 03) is a grade change, not motion.
4. **Most of my sound cues have no beat to hang on.** Doc 05 and the contract say cues are by beat name only, but s09–s11 have no beats, and the reveal chords and the mop need off-beat times. *Proposed beats* (a `contract-timeline` task would add them): `marstonArrive` s09@0, `stacksEnter` s10@0, `stacksFlicker1` s10@0.4, `stacksFlicker2` s10@3.4, `laptopOpen` s11@1.0, `phoneWake` s11@3.6, `tableLightDies` s11@4.2, `revealSleeper` s13@1.4, `revealDrinks` s13@2.4, `revealFreshman` s13@3.4, `tinyBlobSeen` s14@2.3. The 10 mop strokes in s14 need either an `offset` or `repeat` field on `CUES` entries (a contract addition) or 10 more beats.
5. **The contract's blob size doesn't fit the story.** `createBlob` defaults to radius 0.025 (5 cm across), the contract makes the gator 8 cm tall, and doc 03 says "about the size of a coffee mug." *Assumed:* radius **0.012** (2.4 cm, about 30% of his height) for the hero's blob throughout Act 2b. `sb-act1` and `sb-act3` must use the same number, or the blob changes size at the act cuts.
6. **A phone screen faces its user.** A physically aimed phone light would put the hero's own body shadow on the same wall as the blob's, and bigger. *Assumed:* the phone `SpotLight` sits at the phone prop and is aimed at the blob (`aim()`), not along the screen normal. The hero is kept out of the cone (≥ 35° off-axis), and a non-shadow cyan `PointLight` at the phone lights his face. It is one motivated source split into two light objects. **This is a film-wide director call;** Act 1's phone shots have the same problem.
7. **PALETTE has no fluorescent color,** but doc 03 calls Act 2b "fluorescent green-white." *Assumed:* `lerp(PALETTE.cream, PALETTE.gator, 0.15)` everywhere. A `fluorescent` entry in `src/core/palette.js` would be cleaner, and contracts.md fixes PALETTE's keys, so that's a contract addition.
8. **No contract API desaturates one puppet** (doc 03's Quiet 1 drain, used in s12–s14). It needs a `Puppet.tint`/saturation addition or a post mask. Otherwise shot code reaches into materials, which the contract doesn't list.
9. **`fluorescent({ flickerSeed })` has no flicker window or level.** *Assumed:* shot code multiplies `light.intensity` by its own envelope and calls `update(t)` only inside flicker windows.
10. **Blob eye states aren't listed in the contract** (`eyes = 'open'` only). *Assumed:* the gator's names (`open`, `closed`, `side`, ...).
11. **s06 ↔ s15 constrains my set.** The lamp is planted unlit on his Marston table at x = 0.15 (on his right, at the far end of the table) in s11, s12 and s14. s15 must match s06's camera and hand path, so s06's home desk layout must put the lamp in the same place relative to him, or this set has to move. I didn't read the other acts' worktrees, so this is unreconciled.
12. **Doc 02's "a few faint phone glows" vs. "every gator has a shadow."** If a phone is the low light behind every loom, every occupied desk needs one. *Assumed:* all 10 crowd phones glow at 0.35 strength, and 4 desks are empty and dark.
13. **Doc 05's Exam motif.** "Returns softer each time the blob is small": I used it for the Custodian's tiny blob in s14 (gain 0.25). That's an interpretation, since doc 05 may mean only the hero's blob.

There are no timing conflicts. Every shot start, duration and beat in s09–s14 matches doc 02, doc 06 and `src/timeline.js`.

## Gaps
- **Light intensities are ratios** (phone = 1.0) because no module is calibrated yet. The `mod-lights` builder should define the phone reference value; every intensity here scales from it.
- **I couldn't confirm the fluorescent shadow light's size.** doc 04's fluorescent includes a dim `DirectionalLight` for shadows. I treated it as pointing straight down, which gives the 1.0× pools in s11 and s14, but `mod-lights` isn't built.
- **Gator poses are given as a few key joint angles** (body, head, arm_r) plus named poses (`walk_side_a`, `sit_screen`, `head_down`, `top_head_up`, …). The full joint tables belong to the shot builder once `puppet.js` and the part list exist.
- **s13's shadow decals are a doc 04 shortcut,** not real light. The hero's decal deliberately matches his s12 real-light scale (7.5×), but it isn't computed.
- **s14 occlusion:** for about 0.6 s (around t = 3.4–4.0) the Custodian hides the lower half of the hero's head. I judged that acceptable, but it's unchecked.
- **Not read:** the `sb-act1` and `sb-act3` worktrees (out of my ownership). Cross-act consistency (blob radius, lamp placement, Freshman design, boil rate in s17) is listed above for the orchestrator to reconcile.
- No evidence directory: the brief asks for none (documentation task).

## State
built · 2026-10-15

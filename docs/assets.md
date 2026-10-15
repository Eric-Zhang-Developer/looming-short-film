# Assets

The film's single asset list. Every shot spec's **Assets needed** section uses the names on this page, and `evidence/sb-reconcile/check_assets.mjs` checks that it does. Doc 08 covers how each asset is painted, screened, frozen and cut.

## Budget
- **Asked for:** the three storyboard passes named **55 distinct painted assets** (sb-act1 27, sb-act2 20 more, sb-act3 8 more), plus the style tile. Doc 08 budgets **25–35 frozen**.
- **This list:** **19 frozen assets used in shots + the style tile = 20 frozen.** 16 plain shapes became procedural `paper.js` pieces, and the rest were merged into sheets. Nothing in the story was cut.
- **Headroom:** 15 slots under the cap. Doc 08 found a 5-piece sheet gives about 400 px per piece. Any piece that screens too soft for its largest use in a shot gets split out into its own generation, and that's what the headroom is for. The likeliest candidates are `ladder` (about half the frame height in s07) and `phone` in s15's Camera B.

## Frozen assets
A sheet is one generation with several cut pieces (doc 08), and it counts as one asset. Groups are doc 08's generation order: 1 style tile, 2 gator, 3 faces, 4 other characters, 5 sets, 6 props, 7 crowd.

| # | Name | Type | Pieces | Shots | Group | Notes |
|---|---|---|---|---|---|---|
| 1 | `gator_sheet` | character | Turnaround (side, front, back, 3/4 head) and parts: body, head, upper jaw/snout, lower jaw, arm_l, arm_r, leg_l, leg_r (short, stubby, foot forward), tail, pocket | s02–s12, s14–s18 | 2 | Close-up in s06, s15, s18 H: one sheet at the largest size, nothing else on it |
| 2 | `face_sheet` | face | Eyes: open, closed, tired, gasp, worried, side. Mouths: neutral, smile, o, line | s02–s18 | 3 | Shared, scaled, by the roommates and the Freshman; must also read from above in s13 |
| 3 | `roommates_sheet` | character | roommate_tall (split for a walk cycle), roommate_round | s05 | 4 | Merges `roommate_tall` + `roommate_round`: both appear only in s05, medium-wide and background |
| 4 | `custodian_sheet` | character | custodian (body, head, cap, 2 arms, tail), custodian_cart (frame, tray, bucket), mop | s14 | 4 | Merges `custodian_cart`, as doc 08 already pairs them. His tiny blob is code |
| 5 | `freshman_sheet` | character | The Freshman's side-view parts at 0.85× the Student (leg_l, leg_r among them), oversized backpack | s18 | 4 | Also the reference for the Freshman's top view in `top_figures_sheet` |
| 6 | `skyline_sheet` | set | skyline_far (low rooftops, one clock-tower silhouette, no signage), skyline_near (rooftops and oak canopies) | s01 | 5 | Merges 2 strips; both are backlit silhouettes with lit rims |
| 7 | `apt_exterior` | set | Apartment facade, one window hole painted in the key color | s01 | 5 | Single: it fills the frame at the end of the push |
| 8 | `foliage_sheet` | set | oak_branch (with tissue moss), campus_trees (tree-line strip), hedge | s01, s09 | 5 | Merges 3; all three are backlit or defocused |
| 9 | `apt_furniture_sheet` | set | mini_fridge (+ door), kitchen_stool, apt_couch, apt_coffee_table, apt_bed (mattress, pillow, tissue blanket) | s04, s05, s07, s08 | 5 | Merges 5; all medium or background |
| 10 | `marston_ext` | set | Marston façade, 3 × 8 window holes in the key color, no lettering | s09 | 5 | Single, ≥ 2048 px: 70% of the frame width |
| 11 | `marston_stacks` | set | Bookshelf face with blank spines and kraft shelves | s10 | 5 | Cut into ≥ 4 crops so the 8 wings don't repeat. No longer behind the hero's desk: that's the window wall now |
| 12 | `marston_furniture_sheet` | set | marston_desk (top; apron and legs), marston_chair | s02, s03, s06, s11, s12, s14–s18 | 5 | Merges `marston_table` (s11–s14), `marston_desk` (s15–s18) and `marston_chair` into one desk unit. The chair doubles as the home chair |
| 13 | `desk_lamp` | prop | Base, stem, knob (separate part), arm, tissue shade | s02, s03, s06, s11, s12, s14–s18 | 6 | Single: close-up in s06 and s15. One model everywhere (README §3) |
| 14 | `calendar` | prop | Sheet 1 (scribble-glyph month, Friday circled red with an exam glyph), sheet 2 (a new circled date) | s02, s03, s06, s18 | 6 | Two pieces on one image; the only red in the film (Q4 covers sheet 2's circle) |
| 15 | `study_props_sheet` | prop | phone (glyph screen face, back), laptop (base, lid), pen (+ cap), exam_page (glyph problems), energy_drink, backpack (side, front, back, with the right side pocket) | s02, s03, s05–s12, s14–s18 | 6 | Merges `phone`, `laptop`, `pen`, `exam_page`, `energy_drink`, `backpack`. Every glyph is a scribble, never text |
| 16 | `apt_props_sheet` | prop | fridge_contents (3 jars of falling size, 1 carton, blank labels), controllers ×2, ladder, drill | s04, s05, s07, s08 | 6 | Merges 4 |
| 17 | `top_props_sheet` | prop | desk_top (desk and chair from above), and from above: phone, laptop, desk lamp, open textbook, energy-drink can, blank page, pen, oversized backpack | s13 | 6 | Merges `desk_top` + `props_top_sheet`; small in frame |
| 18 | `crowd_sheet` | crowd | Side-view Marston extras, 2–3 parts each: the Drinks gator / neighbor (body, head, arm; seated, slumped asleep by rig), a sleeping extra | s16, s17 | 7 | Different greens from the Student; never cloned |
| 19 | `top_figures_sheet` | crowd | hero_top (body, head, arms, tail, backpack), 6 top-view seated poses including the Sleeper, the Drinks gator and the Freshman | s13 | 7 | Merges `gator_top` + `crowd_top_sheet` |

**Reference, not placed in a shot:** `style_tile` (group 1, awaiting G1). It counts toward the 35.

## Procedural pieces (not frozen)
Plain shapes are built with `makePaper({ path, color, weight })`, or from a real paper scan where doc 04 allows it (`assets/scans/`). They take no generation. Each needs its own seed and tear weight, so no two edges match (doc 03).

| Name | What | Shots | Was |
|---|---|---|---|
| `apt_wall` | Cream cardstock wall, the main shadow receiver | s02, s03, s05–s08, s18 | painted (sb-act1) |
| `apt_desk` | Kraft desk top and apron | s02, s03, s06 | painted (sb-act1) |
| `apt_floor` | Kraft floor (or a kraft scan) | s04, s05, s07, s08 | painted (sb-act1) |
| `apt_ceiling` | Flat Night Navy cardstock | s07, s08 | already procedural |
| `apt_kitchen` | Wall plate plus plain cabinet-door panels and round knobs | s04 | painted (sb-act1) |
| `apt_window` | Tissue pane with a two-strip cardstock mullion | s01, s04, s05, s07, s08 | painted (sb-act1) |
| `blackout_curtains` | 2 opaque Night Navy panels, a rod, 2 brackets | s07, s08 | painted (sb-act1) |
| `dawn_sky` | Three overlapping torn tissue bands, backlit into the navy-to-rose gradient | s01 | painted (sb-act1) |
| `night_sky` | Night Navy plate, plus the moon as a torn cream disk | s09 | painted (sb-act2) |
| `plaza_ground` | Navy ground plane (or a scan) | s09 | painted (sb-act2) |
| `marston_doors` | Vestibule flat with a doorway hole, plus the tissue lobby plate | s09 | painted (sb-act2) |
| `marston_wall` | Plain Night Navy aisle end wall | s10 | painted (sb-act2) |
| `ceiling_header` | Ceiling border flat, plus the fluorescent tube as a vellum strip | s10, s14 | painted (sb-act2) |
| `marston_floor` | Navy-grey tile floor with a scribbled grid | s10–s18 | painted (sb-act2); procedural (sb-act3) |
| `marston_window_wall` | Navy cardstock wall built from piers, sill and header strips around 6 window openings | s11, s12, s14–s18 | painted (sb-act3) |
| `window_tissue` | Tissue window panes, `castShadow` off | s11, s12, s14–s18 | painted (sb-act3) |

## Code, never painted (doc 08)
Every blob (`blob.js`), light cones and dust (`lampLight`), the s13 shadow decals, the name and answer squiggles and every glyph line, the calendar tear edge, the fade.

## Where each storyboard name went
| Storyboard name(s) | Now |
|---|---|
| `gator_sheet`, `face_sheet`, `desk_lamp`, `calendar`, `apt_exterior`, `marston_ext`, `marston_stacks`, `freshman_sheet`, `crowd_sheet` | Kept as they were |
| `roommate_tall`, `roommate_round` | `roommates_sheet` |
| `custodian_sheet`, `custodian_cart` | `custodian_sheet` |
| `skyline_far`, `skyline_near` | `skyline_sheet` |
| `oak_branch`, `campus_trees`, `hedge` | `foliage_sheet` |
| `mini_fridge`, `kitchen_stool`, `apt_couch`, `apt_coffee_table`, `apt_bed` | `apt_furniture_sheet` |
| `fridge_contents`, `controllers`, `ladder`, `drill` | `apt_props_sheet` |
| `phone`, `laptop`, `pen`, `exam_page`, `energy_drink`, `backpack` | `study_props_sheet` |
| `marston_table`, `marston_desk`, `marston_chair` | `marston_furniture_sheet`. `marston_table` is gone: s11–s14 now use s15's desk unit (README §2) |
| `desk_top`, `props_top_sheet` | `top_props_sheet` |
| `gator_top`, `crowd_top_sheet` | `top_figures_sheet` |
| `apt_wall`, `apt_desk`, `apt_floor`, `apt_kitchen`, `apt_window`, `blackout_curtains`, `dawn_sky`, `night_sky`, `plaza_ground`, `marston_doors`, `marston_wall`, `ceiling_header`, `marston_floor`, `marston_window_wall`, `window_tissue` | Procedural (above) |

55 painted names in: 9 kept, 31 merged into 10 sheets, 15 made procedural (plus `apt_ceiling`, procedural from the start). 9 + 10 = 19.

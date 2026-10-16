# Assets

The film's single asset list. Every shot spec's **Assets needed** section uses the names on this page, and `evidence/sb-reconcile/check_assets.mjs` checks that it does. Doc 08 covers how each asset is painted, screened, frozen and cut.

## Budget
- **Asked for:** the three storyboard passes named **55 distinct painted assets** (sb-act1 27, sb-act2 20 more, sb-act3 8 more), plus the style tile. Doc 08 budgets **25–35 frozen**.
- **This list:** **19 frozen assets used in shots + the style tile = 20 frozen.** 16 plain shapes became procedural `paper.js` pieces, and the rest were merged into sheets. Nothing in the story was cut.
- **G4:** 22 frozen in shots + the style tile = **23**: four kits added (`home_kit`, `kitchen_kit`, `props_kit`, `exam_room_kit`), `freshman_sheet` retired. 12 slots under the cap.
- **Headroom:** 15 slots under the cap. Doc 08 found a 5-piece sheet gives about 400 px per piece. Any piece that screens too soft for its largest use in a shot gets split out into its own generation, and that's what the headroom is for. The likeliest candidates are `ladder` (about half the frame height in s07) and `phone` in s15's Camera B.

## Frozen assets
A sheet is one generation with several cut pieces (doc 08), and it counts as one asset. Groups are doc 08's generation order: 1 style tile, 2 gator, 3 faces, 4 other characters, 5 sets, 6 props, 7 crowd.

| # | Name | Type | Pieces | Shots | Group | Notes |
|---|---|---|---|---|---|---|
| 1 | `gator_sheet` | character | Turnaround (side, front, back, 3/4 head) and parts: body, head, upper jaw/snout, lower jaw, arm_l, arm_r, leg_l, leg_r (short, stubby, foot forward), tail, pocket | s02–s12, s14–s17, s17b, s17c, s18 | 2 | Close-up in s06, s15, s18 H: one sheet at the largest size, nothing else on it |
| 1b | `gator_hero` | character | One large side view, the same pose and design as the sheet's side view | s06, s15, s18 close-ups | 2 | Added at G2 round 2: the sheet's ~425 px figure can't hold the close-ups |
| 2 | `face_sheet` | face | Eyes: open, closed, tired, gasp, worried, side. Mouths: neutral, smile, o, line | s02–s17, s17b, s18 | 3 | Shared, scaled, by the roommates and the Freshman; must also read from above in s13 |
| 3 | `roommates_sheet` | character | roommate_tall (split for a walk cycle), roommate_round | s05 | 4 | Merges `roommate_tall` + `roommate_round`: both appear only in s05, medium-wide and background |
| 4 | `custodian_sheet` | character | custodian (body, head, cap, 2 arms, tail), custodian_cart (frame, tray, bucket), mop | s14 | 4 | Merges `custodian_cart`, as doc 08 already pairs them. His tiny blob is code |
| 6 | `skyline_sheet` | set | skyline_far (low rooftops, one clock-tower silhouette, no signage), skyline_near (rooftops and oak canopies) | s01 | 5 | Merges 2 strips; both are backlit silhouettes with lit rims |
| 7 | `apt_exterior` | set | Apartment facade, one window hole painted in the key color | s01 | 5 | Single: it fills the frame at the end of the push |
| 8 | `foliage_sheet` | set | oak_branch (with tissue moss), campus_trees (tree-line strip), hedge | s01, s09 | 5 | Merges 3; all three are backlit or defocused |
| 9 | `apt_furniture_sheet` | set | mini_fridge (+ door), kitchen_stool, apt_couch, apt_coffee_table, apt_bed (mattress, pillow, tissue blanket) | s05 | 5 | Merges 5; all medium or background |
| 10 | `marston_ext` | set | Marston façade, 3 × 8 window holes in the key color, no lettering | s09 | 5 | Single, ≥ 2048 px: 70% of the frame width |
| 11 | `marston_stacks` | set | Bookshelf face with blank spines and kraft shelves | s10 | 5 | Cut into ≥ 4 crops so the 8 wings don't repeat. No longer behind the hero's desk: that's the window wall now |
| 12 | `marston_furniture_sheet` | set | marston_desk (top; apron and legs), marston_chair | s11, s12, s14–s17 | 5 | Merges `marston_table` (s11–s14), `marston_desk` (s15–s18) and `marston_chair` into one desk unit. The chair doubles as the home chair |
| 13 | `desk_lamp` | prop | Base, stem, knob (separate part), arm, tissue shade | s02, s03, s06, s18 | 6 | Single: close-up in s06. **Home only:** Marston has no desk lamps (README §3). In s18 E only its light is used; the lamp is out of frame |
| 14 | `calendar` | prop | Sheet 1 (scribble-glyph month, Friday circled red with an exam glyph), sheet 2 (a new circled date) | s02, s03, s06, s18 | 6 | Two pieces on one image; the only red in the film (Q4 covers sheet 2's circle) |
| 15 | `study_props_sheet` | prop | phone (glyph screen face, back), laptop (base, lid), pen (+ cap), exam_page (glyph problems), energy_drink, backpack (side, front, back, with the right side pocket) | s00, s02, s03, s06, s09–s12, s14–s17, s17b, s18 | 6 | Merges `phone`, `laptop`, `pen`, `exam_page`, `energy_drink`, `backpack`. Every glyph is a scribble, never text |
| 16 | `apt_props_sheet` | prop | fridge_contents (3 jars of falling size, 1 carton, blank labels), controllers ×2, ladder, drill | s05, s07, s08 | 6 | Merges 4 |
| 17 | `top_props_sheet` | prop | desk_top (desk and chair from above), and from above: phone, laptop, open textbook, energy-drink can, blank page, pen, oversized backpack | s13 | 6 | Merges `desk_top` + `props_top_sheet`; small in frame |
| 18 | `crowd_sheet` | crowd | Side-view Marston extras, 2–3 parts each: the Drinks gator / neighbor (body, head, arm; seated, slumped asleep by rig), a sleeping extra | s16, s17 | 7 | Different greens from the Student; never cloned |
| 19 | `top_figures_sheet` | crowd | hero_top (body, head, arms, tail, backpack), 6 top-view seated poses including the Sleeper, the Drinks gator and the Freshman | s13 | 7 | Merges `gator_top` + `crowd_top_sheet` |
| 20 | `home_kit` | set | **Student bedroom and desk (G4):** desk, desk chair, laptop (base, lid, separate screen to glow), bed (frame, mattress, pillow, tissue blanket), window frame, roller blind (rolled-up and down states), bookshelf, posters (abstract shapes), rug, door, floor lamp, laundry pile, wall and floor strips | s00, s02, s03, s05–s08, s18 | 5 | Task `asset-home-kit`. Replaces the procedural `apt_desk` and Marston's chair at home; sizes in **Sizes against the gator** below |
| 21 | `kitchen_kit` | set | **Kitchen (G4):** fridge (door separate), stove with oven, sink with tap, counter run, upper cabinets, microwave, kettle, dish rack, fruit bowl, tiled backsplash strip; small props: jar ×3 (falling sizes), carton, cereal box, mug; **bar stool** (added by `spec-g4`: s04's blob sits on it) | s04 | 5 | Task `asset-home-kit`. Replaces `apt_kitchen` and the s04 pieces of `apt_furniture_sheet` / `apt_props_sheet`. Jar and carton labels blank |
| 22 | `props_kit` | prop | **Story paper (G4):** phone_screen (dark lock screen with one blank banner card and a generic red badge, no logo), practice_sheet (two sheets, ruled, blank where the problems go), test_page (the same layout as a test), graded_test (front and plain back), red marker (capped, uncapped) | s00, s16, s17, s17b, s17c, s18 | 6 | **Every legible word and number is drawn in code over the painted paper, never painted** (see Code below). The red badge is the only painted red |
| 23 | `exam_room_kit` | set | **Exam room (G4):** exam table (side and back views), seated gators from behind ×3 variants (different greens, never cloned), blank board strip, wall clock with tick marks only, floor strip, tall window frame | s17b, s17c | 5 | No task scheduled yet (orchestrator). Morning light; no screens in the room |

**Reference, not placed in a shot:** `style_tile` (group 1, awaiting G1). It counts toward the 35.

**Retired at G4** (no shot uses them now; none was frozen): `freshman_sheet` (#5: the Freshman's s18 scene is cut; `top_figures_sheet` paints their top view without it), and the procedural `apt_desk` (→ `home_kit` desk), `apt_kitchen` (→ `kitchen_kit`) and `blackout_curtains` (→ `home_kit` roller blinds). `apt_furniture_sheet` keeps only the couch and coffee table (s05), and `apt_props_sheet` only the controllers and the drill.

## Sizes against the gator (G4)
The director: "that's a fucking massive table … The furniture is weird." Every G4 kit piece gets a real-world size and a film size. **Set scale 1:22** (1 m real = 0.0455 film m), fixed by the desk unit's heights, which are already real: desk top 0.034 above the floor (75 cm), chair seat 0.021 (46 cm). The gator, measured from the rig (`src/characters/gator.js`: hip 0.029, body 0.080; README §2): **head top 0.109 standing, eye ≈ 0.071 standing** (≈ 1.6 m at 1:22, a normal eye height), **eye 0.030 above the desk seated**. He's a cartoon: a big head on short legs. So pieces he sits at or looks at use 1:22 exactly; pieces his whole body must fit (bed, door, ceiling) get the head room his 0.109 needs, marked *cartoon allowance*.

| Piece | Kit | Real | Film (m) | Against him |
|---|---|---|---|---|
| Desk | home | 120 × 60 cm, top 75 cm | 0.055 × 0.027, top 0.034 | Top just above his hip; seated, his eyes 0.030 over it. *The desk unit's plan is still 0.333 × 0.120 (README §2 scale note): the painted desk must read as a desk at that plan until a scale task shrinks it* |
| Desk chair | home | seat 46 cm, back 90 cm | seat 0.021, back top 0.041 | His seated hip at −0.012 on a desk-top datum |
| Laptop | home | 33 × 23 cm, lid 22 cm | 0.015 × 0.0105, lid 0.010 | About his forearm's length; the screen centre is the light (README §4) |
| Bed (twin XL) | home | 203 × 99 cm, mattress top 55 cm | **0.120** × 0.045, top 0.025 | *Cartoon allowance:* 0.120 long, so he fits lying down (0.109); real would be 0.092 |
| Window | home | 100 × 120 cm, sill 90 cm, head 210 cm | 0.045 × 0.054, sill 0.041, head 0.095 | Sill a little above his hip, head just under his head top: he can reach the blind |
| Roller blind | home | window + 2 cm each side | 0.047 wide, housing 0.004 tall at y 0.097 | Down, it leaves 1.5 mm side gaps (s08's seams) |
| Bookshelf | home | 80 × 180 cm | 0.036 × 0.082 | Taller than his eye, shorter than his head top |
| Poster | home | 50 × 70 cm (s07 uses one 77 × 88) | 0.023 × 0.032 (0.035 × 0.040) | At his eye height |
| Rug | home | 160 × 230 cm | 0.073 × 0.105 | He lies on it in s07 |
| Door | home | 82 × 203 cm | 0.037 × **0.115** | *Cartoon allowance:* real 0.092 would be below his head top |
| Floor lamp | home | 160 cm | 0.073 | At his eye |
| Ceiling | home | 244 cm | **0.130** | *Cartoon allowance* (real 0.111); s04, s07, s08 use 0.13 |
| Couch (`apt_furniture_sheet`) | — | 220 × 90 cm, seat 45 cm, back 88 cm | 0.100 × 0.041, seat 0.020, back 0.040 | Seat at his knee. s05 stretches it to 0.13 (2.9 m) to seat both roommates where they're staged |
| Coffee table (`apt_furniture_sheet`) | — | 120 × 60 × 45 cm | 0.055 × 0.027, top 0.020 | The old one was 0.14 × 0.07 (3 m × 1.5 m) |
| Fridge | kitchen | 175 × 75 × 70 cm | 0.080 × 0.034 × 0.032 | Top between his eye and his head top |
| Counter run | kitchen | top 91 cm, depth 61 cm | top 0.0415, depth 0.028 | A little above his hip (0.029) |
| Stove / oven | kitchen | 76 cm wide, 91 cm high | 0.0345 × 0.0415 | |
| Sink | kitchen | 84 cm wide | 0.038 | In the counter |
| Microwave (over the range) | kitchen | 76 × 42 cm, bottom at 140 cm | 0.0345 × 0.019, bottom 0.064 | Just under his eye |
| Upper cabinets | kitchen | 137–213 cm, 30 cm deep | y 0.062–0.097, depth 0.014 | From his eye to above his head top |
| Backsplash | kitchen | 91–137 cm | y 0.0415–0.062 | |
| Bar stool | kitchen | seat 76 cm, Ø 36 cm | seat 0.035, Ø 0.016 | Just above his hip; the 1.25× blob overhangs it like a cat |
| Kettle, mug, jars, carton | kitchen | 25, 10, 15/12/9, 25 cm | 0.011, 0.0045, 0.007/0.0055/0.004, 0.011 | Hand-sized |
| Exam table | exam room | 180 × 45 cm, top 75 cm | 0.082 × 0.020, top 0.034 | As the desk. *s17b T3 uses the desk unit's plan, as above* |
| Wall clock | exam room | Ø 30 cm | Ø 0.014 | |
| Board strip | exam room | 100–220 cm high | y 0.045–0.100 | |
| Story paper (`props_kit`) | props | US letter, 21.6 × 27.9 cm | 0.010 × 0.013 | *The desk unit's page is 0.025 × 0.030 (2.2× real) and these pages are drawn at the unit's size until a scale task (README §2)* |

The flags are real: the desk unit's plan, the page and the phone are about 2.2× the 1:22 scale, which is part of why the v1 home read wrong. This list gives the real sizes; changing the unit is a separate task because every desk shot (s02, s03, s06, s11–s18) is solved on it.

## Procedural pieces (not frozen)
Plain shapes are built with `makePaper({ path, color, weight })`, or from a real paper scan where doc 04 allows it (`assets/scans/`). They take no generation. Each needs its own seed and tear weight, so no two edges match (doc 03).

| Name | What | Shots | Was |
|---|---|---|---|
| `apt_wall` | Cream cardstock wall, the main shadow receiver | s00, s02–s08, s18 | painted (sb-act1) |
| `apt_floor` | Kraft floor (or a kraft scan) | s04, s05, s07, s08 | painted (sb-act1) |
| `apt_ceiling` | Flat Night Navy cardstock | s04, s07, s08 | already procedural |
| `apt_window` | Tissue pane with a two-strip cardstock mullion | s01, s04, s05, s07, s08 | painted (sb-act1) |
| `dawn_sky` | Three overlapping torn tissue bands, backlit into the navy-to-rose gradient | s01 | painted (sb-act1) |
| `night_sky` | Night Navy plate, plus the moon as a torn cream disk | s09 | painted (sb-act2) |
| `plaza_ground` | Navy ground plane (or a scan) | s09 | painted (sb-act2) |
| `marston_doors` | Vestibule flat with a doorway hole, plus the tissue lobby plate | s09 | painted (sb-act2) |
| `marston_wall` | Plain Night Navy aisle end wall | s10 | painted (sb-act2) |
| `ceiling_header` | Ceiling border flat, plus the fluorescent tube as a vellum strip | s10, s14 | painted (sb-act2) |
| `marston_floor` | Navy-grey tile floor with a scribbled grid | s10–s17 | painted (sb-act2); procedural (sb-act3) |
| `marston_window_wall` | Navy cardstock wall built from piers, sill and header strips around 6 window openings | s11, s12, s14–s17 | painted (sb-act3) |
| `window_tissue` | Tissue window panes, `castShadow` off | s11, s12, s14–s17, s17b | painted (sb-act3) |
| `sensor_trough` | Marston's desk light: a louvred cardstock trough on two rods, with the tube as a vellum strip that glows while its zone is lit (README §3). One per desk unit; listed where it's in frame | s11, s14, s16, s17 | new (spec-sensor) |

## Code, never painted (doc 08)
Every blob (`blob.js`), the home lamp's cone and dust (`lampLight`), Marston's zone lights with their wake and timeout (`sensorLight`), the s13 shadow decals, the name and answer squiggles and every glyph line, the fade, the stain and soak (s18).

**Every legible word and number (G4):** the notification ("Calc 2 Exam · Fri"), the calendar's "Calc 2 exam" and "Final" and its X, the printed problems, his handwritten math, the red checks and the circled 94. Drawn in code, hand-lettered in the paper style, on top of the painted paper. Image generation garbles text and math, and this math has to be exactly right (`done/spec-g4.md`). (The calendar tear edge is gone with the old s18.)

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

55 painted names in: 9 kept, 31 merged into 10 sheets, 15 made procedural (plus `apt_ceiling`, procedural from the start, and `sensor_trough`, added when Marston lost its desk lamps). 9 + 10 = 19.

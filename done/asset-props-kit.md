# Done · asset-props-kit

## What shipped
Two parts kits in the frozen paper style, three variants each, screened and ranked: `props_kit` (17 separate pieces: the lettered story paper plus desk props) and `exam_room_kit` (7 pieces). Six Codex calls, one at a time, no re-rolls. Every lettered and math piece came back exact in all three props variants (read back character by character in `evidence/asset-props-kit/text_check.md`). Nothing frozen, nothing cut into the repo.

## Where it lives
- Prompts: `assets/prompts/props_kit.v1.md`, `assets/prompts/exam_room_kit.v1.md`; specs appended to `assets/specs.json` (commit 9267a7b).
- Outputs: full size in `assets/raw/{props_kit,exam_room_kit}_v1_{1,2,3}.png` (gitignored); thumbs, sidecars with screening reasons and per-kit contact sheets in `assets/raw/thumbs/` (commits 2863267, 5502bb9).
- Evidence: `evidence/asset-props-kit/` with `contact.jpg` (all 6 variants), `scale.jpg` and `scale_table.md` (winners beside the frozen gator at film scale), `islands.txt`, `text_check.md`, the `*.boxes.json` (auto) and `*.named.json` (named, usable as `cut.mjs --boxes`) files, and `scripts/`.
- Boxes for the best variants: `evidence/asset-props-kit/props_kit_v1_1.named.json`, `evidence/asset-props-kit/exam_room_kit_v1_1.named.json` (keys are `props_kit_<piece>` and `exam_room_kit_<piece>`; v2 and v3 props and v2 exam are named too; exam v3 is not, it has 8 islands).

## Ranking (the orchestrator freezes by the director's rule; I did not)
Props: 1. `props_kit_v1_1` (7-column calendar with exactly one empty Friday cell; flaws: smallest sheet, tiny ink drop, one calendar scribble reads as 8 or B), 2. `v1_2` (best ink drop and looped red circle; 6-column calendar with two empty cells), 3. `v1_3` (6-column calendar with two empty cells, notched circle). All three are exact on every lettered piece.
Exam room: 1. `exam_room_kit_v1_1` (desk and chair one piece, proctor reads as a standing gator), 2. `v1_2` (chair joins the desk by a thin bar; proctor more front-on), 3. `v1_3` (8 islands: the chair is separate from the desk).

## How it was checked
- [x] `contact.jpg`, `scale.jpg`, `islands.txt`, `text_check.md`: all in `evidence/asset-props-kit/`.
- [x] Islands (`node tools/cut.mjs --auto`): props 17, 17, 17; exam 7, 7, 8. None dropped.
- [x] Text and math: every lettered piece transcribed from the image with pass or fail, for all three props variants; no variant rejected. I also did the math by hand in that file (the integral, the sign-error line, the ratio test).
- [x] Named boxes cut cleanly with `cut.mjs --boxes` for the two winners (that is how `scale.jpg` was built). Naming is by reading order and matches the shapes by eye.
- [x] Boxes files for the best variant; ranking with one line each; no freeze, nothing in `assets/frozen/`.
- [x] Screening reason in every sidecar's `screening` field.
- [ ] Lit in-context render: **not verified**, no engine work in this task.

## Gaps
- **docs/assets.md disagrees with this brief.** Row 22 says every legible word is drawn in code and never painted; the brief (after the director lifted the rule) says to paint it and reject bad lettering. I followed the brief. The painted lettering is good enough that code may not be needed; the orchestrator should pick one and fix the doc.
- **Pieces the shots name that the brief did not list, so I did not paint them:** the calendar's "Final" square (s18), the second calendar sheet, a face-down graded-test back, the red marker (s18, `props_kit` row in assets.md), tall window frame, exam desk back view, seated-gator backs (s17b), a long exam table. Say so and I will add them.
- **Calendar:** v1's grid is 7 columns but its cell scribbles are cursive-ish and one reads as 8 or B; if that matters, regenerate the grid with tick marks or draw the scribbles in code (s02 already treats them as glyphs). The calendar's red circle and the "Calc 2 exam" square are separate pieces, but I did not check that they line up with a cell at film scale.
- **Sizes:** the practice and test pages are sized to the desk unit's 0.025 x 0.030 page (README s2), 2.2x real, so their lettering is tiny at gator scale (the shot's insert cameras zoom in; see the 40 px cap-height requirement in s00/s16). Painted resolution is about 280 x 380 px per page; at the s16 insert camera that is likely soft. A one-piece-per-image regeneration of the pages is the fix if the insert is blurry.
- **Ink drop:** the art direction says the blob is a shader, never painted. The brief asked for a drop, so it exists as a small painted piece (48 x 68 px in the winner, v2's 92 x 144 is sharper). Probably only useful as a stain or a reference.
- Pieces are 16 px apart in the winner's padded boxes (props), 12 px (exam), not the 60 px the prompt asked for; they are separate alpha islands anyway. Sheet sizes: props v1 1536 x 1024, others 1672 x 941; exam v1 2043 x 770.
- Scale: 0.055 film m per real m (as asset-home-kit, gator = 1.75 m). `docs/assets.md` uses a slightly smaller factor for the exam table (0.0456), so the exam desk may need nudging.
- No `src/assets.js` edit and no cut into `assets/cut/`.

## Story
This one started with a conflict between two documents. The brief said paint the words and reject anything misspelled; `docs/assets.md` said never paint a word, draw it in code. I followed the brief, since the director's note was the newer thing, and wrote that down so nobody finds it later by surprise. The second decision was a green key instead of the magenta the home kit used: these props carry marker red, and I did not want a keyer arguing about red against magenta (in the end Codex returned real alpha anyway).

I wrote the lettering into the prompt as plain strings, character by character, and spelled out the exponents ("a small raised x"), because an image model has no other way to know that eˣ is not "ex". I also put the integral's sign error in the prompt on purpose: line B is the wrong line, struck through, so the film's s16 beat can be painted rather than faked. I expected to throw away at least one sheet. I did not: all three props sheets came back with every line right, including the stacked fractions and the strike-through staying readable. I zoomed into each variant and read the characters off one at a time (`evidence/asset-props-kit/text_check.md`), and worked the integral and the ratio test by hand to make sure the right answers matched the right drawings.

What actually separated the sheets was the unremarkable stuff. Two of three drew a 6-column calendar with two empty cells where I had asked for seven columns and one gap, which is a month that cannot hold a Friday properly. The exam room had one real failure: variant 3 painted the chair as a separate piece, which my island count (8 where I expected 7) caught before my eyes did. The moment I liked was laying the winners beside the gator in `scale.jpg`: the pages are tiny next to him, and the calendar is as big as he is, which is just what the shots ask for.

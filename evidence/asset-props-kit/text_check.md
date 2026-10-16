# Text and math check · asset-props-kit

Method: each variant's lettered pieces were cropped from the full-size PNG, enlarged 2-3x over a grey background and read character by character against what the prompt asked for (`assets/prompts/props_kit.v1.md`). What I read is in the "Read from the image" column. Fractions are drawn stacked (numerator over a bar over denominator); that is the same value as the one-line form in the prompt. The exam room kit has no lettered pieces; its clock has tick marks only and its board scribbles only (checked in all three variants, no digits or letters found).

Math, checked by hand: d(x eˣ)/dx = eˣ + x eˣ, so ∫ x eˣ dx = x eˣ − ∫ eˣ dx = x eˣ − eˣ + C (the struck line, with + eˣ, is the sign error). Ratio test for Σ n/2ⁿ: aₙ₊₁/aₙ = (n+1)/2ⁿ⁺¹ · 2ⁿ/n = (n+1)/(2n) → 1/2 < 1, so it converges.

| piece | asked for | v1 read from the image | v2 | v3 |
|---|---|---|---|---|
| practice_1 | `1. ∫ x eˣ dx` | `1. ∫ x eˣ dx` PASS | same, PASS | same, PASS |
| practice_1 line A | `∫ x eˣ dx = x eˣ − ∫ eˣ dx` | `∫xeˣdx = xeˣ−∫eˣdx` PASS | `∫xeˣdx = xeˣ−∫eˣdx` PASS | `∫xeˣdx = xeˣ−∫eˣdx` PASS |
| practice_1 line B (struck) | `= x eˣ + eˣ + C`, one pen line through it | `= xeˣ + eˣ + C`, one line, readable PASS | same PASS | same PASS |
| practice_1 line C | `= x eˣ − eˣ + C` | `= x eˣ − eˣ + C` PASS | `= xeˣ − eˣ + C` PASS | `= xeˣ−eˣ+C` PASS |
| practice_2 printed | `2. Σ n/2ⁿ` | `2. Σ (n over 2ⁿ)` PASS | same PASS | same PASS |
| practice_2 line A | `(n+1)/(2n) → 1/2 < 1` | `(n+1) over 2n → 1 over 2 < 1` PASS (the final 1 is a bare stroke, reads as 1) | same PASS | same PASS |
| practice_2 line B | `converges` | `converges` PASS | `converges` PASS | `converges` PASS |
| test_page | `1.` `2.` with squiggles, `3. ∫ x e²ˣ dx` | `1.` `2.` + squiggles, `3. ∫ x e²ˣ dx` PASS | same PASS | same PASS |
| graded_test | same page plus three red ✓ and circled red `94` | `1.` `2.` `3. ∫ x e²ˣ dx`, three red checks, red `94` in a ring PASS | same PASS | same PASS |
| calc_exam_square | `Calc 2` over `exam` | `Calc 2` / `exam` PASS | PASS | PASS |
| notification_card | `Calc 2 Exam · Fri`, red badge with white page glyph | `Calc 2 Exam · Fri`, red badge, white page glyph, no logo PASS | `Calc 2 Exam · Fri` PASS | `Calc 2 Exam · Fri` PASS |
| name squiggles, test squiggles | no readable text | PASS | PASS | PASS |
| calendar cells | scribbles only, no readable digits or letters | cursive-ish scribbles; one cell (row 5, column 5) reads as an "8" or "B" and a few as "a" or "o". No words or dates. PASS with a caveat | identical tilde squiggles in every cell, no characters PASS | dots and tildes PASS |
| blank_page | blank | blank PASS | blank PASS | blank PASS |

Result: no variant had to be rejected for lettering or math. The three props sheets all pass; they differ on the non-lettered parts (see the ranking in `done/asset-props-kit.md`).

Non-text flaws that decided the ranking: v2 and v3 draw a 6-column calendar with TWO empty cells in the third row (the prompt asked for a 7-column month grid and one empty cell for Friday); v1 has 7 columns and exactly one empty cell. v3's red circle has a small notch where the stroke ends. v1's ink drop is the smallest (48 x 68 px cut).

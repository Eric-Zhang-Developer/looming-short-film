# Props kit (story paper and desk props) · v1

Blocks 1, 2 and 4 are the shared files in `assets/prompts/_blocks/`, inserted verbatim by `tools/gen.mjs` (block 4 with the green key from `assets/specs.json`). This file supplies block 3, and block 5 carries the one exception to block 4's no-text sentence. Everything above `## 3.` is not sent to Codex.

Task `asset-props-kit`. G4 story props, and the director's updated text rule (2026-10-15: remove the no-text rule, but use text very sparingly): words and math appear only on the pieces named below, hand-lettered, short, spelled and written EXACTLY as given. Three references are attached: the style tile (the look), the frozen gator character sheet (line weight, torn rim, palette; do NOT draw the gator) and the frozen home kit (the same family of flat cut-paper pieces: copy its palette, line and torn fibre rim).

## 3. Asset

A parts kit ("kit of separate cut-paper pieces") of small story props for a paper diorama, to be assembled in code. It is NOT a scene: every piece stands alone on the empty background, nothing arranged, nothing resting on anything. Every piece is flat and seen straight on (front elevation, or plan view for things lying on a desk), with no perspective, no 3D faces and no depth. Cardstock and cream paper only, with the thin pale torn fibre rim of the frozen style. Simple geometric shapes, strong silhouettes.

Palette: night navy, cream, kraft brown, a few touches of lamp amber, and ONE extra colour on the marked pieces only: a warm marker red (about #C8402F), used only where a piece below says red. Pencil and pen lines are dark graphite grey or night navy. No pink, no purple, no magenta, no green anywhere.

Layout: one sheet, landscape, three rows, every piece evenly spaced, nothing touching or overlapping, every piece at least 60 px from every other piece and from the frame edges. Each piece is one closed shape (or the exact parts named). Inside each piece the proportions below (width : height) are exact. Draw the pieces of Row 1 as large as the sheet allows, because their lettering must be big and clear.

LETTERING RULES (these decide whether a variant is kept). Hand-lettered in an upright, plain, slightly wobbly pencil or pen hand, like a student's careful block capitals and lowercase, one stroke weight, large relative to the piece, with generous space between letters and between lines. Every letter, digit and symbol must be exactly as given: the same characters, the same order, the same spelling, no extra words, no missing characters, no look-alike substitutions, no pseudo-letters, no gibberish. Where a piece below has "(scribble)" lines, draw wavy handwriting-like squiggle lines that look like writing from a distance but contain NO readable letters or digits.

Row 1 (the paper pages, portrait, each cream cardstock with a thin torn rim, width : height 0.77 : 1):
1. PRACTICE_1: a Calc 2 practice sheet. At the top left, a short (scribble) squiggle for a name. Below it, printed in small neat dark-grey type: `1. ∫ x eˣ dx` (the digit 1, a full stop, an integral sign, a lowercase x, a lowercase e with a small raised x as its exponent, a space, then the letters dx). Under that, three lines in dark-navy handwriting, one under the other:
   line A: `∫ x eˣ dx = x eˣ − ∫ eˣ dx`
   line B: `= x eˣ + eˣ + C` with ONE firm straight pen line struck right through it (this line is crossed out and stays readable underneath),
   line C: `= x eˣ − eˣ + C`
   The minus signs are real minus signs, the plus sign is a plus. Nothing else is written on the sheet; the rest of the page is empty cream.
2. PRACTICE_2: the second practice sheet. At the top left a short (scribble) name squiggle. Printed in small neat dark-grey type: `2. Σ n/2ⁿ` (the digit 2, a full stop, a capital sigma, the letter n, a slash, the digit 2 with a small raised letter n as its exponent). Under it, two lines in dark-navy handwriting:
   line A: `(n+1)/(2n) → 1/2 < 1`
   line B: `converges`
   Nothing else is written; the rest of the page is empty cream.
3. TEST_PAGE: a test paper, the same size and layout. A short (scribble) name squiggle at the top left. Then the printed numbers `1.` and `2.`, each followed by two faint grey (scribble) squiggle lines standing in for small printed problems already answered, with nothing readable. Then, printed in the same small neat dark-grey type, the line `3. ∫ x e²ˣ dx` (the digit 3, a full stop, an integral sign, a lowercase x, a lowercase e with a small raised "2x" as its exponent, a space, then the letters dx), with a clear empty gap below it. Nothing else is written.
4. GRADED_TEST: the same test paper, now marked. Same content as TEST_PAGE exactly (`1.`, `2.`, then `3. ∫ x e²ˣ dx`, and the same faint squiggles), plus marker-red marks drawn in a confident hand: one red check mark (✓) just to the right of each of the three problems, so three checks in all, and in the top right corner the two-digit number `94` in large red hand-lettering with a red hand-drawn circle around it. No other red, no other text.
5. BLANK_PAGE: a plain blank exam page, cream cardstock, completely empty: no lines, no squiggles, no marks, only a very faint paper grain and the torn rim.

Row 2:
6. CALENDAR: a paper wall calendar sheet, portrait, width : height 0.83 : 1: a cream sheet with a navy header band across the top (no words on it), and below it a month grid of 5 rows by 7 columns of square cells outlined in thin dark-grey lines. Every cell holds only a small (scribble) squiggle or a small dot, with NO readable digits or letters anywhere. In the third row, the fifth cell is left completely empty, because a separate piece covers it. A small kraft hanging tab at the top centre.
7. CALC_EXAM_SQUARE: a small square of cream paper, the same size as one calendar cell (width : height 1 : 1), with a thin dark-grey border and, hand-lettered in dark pencil on two lines, the words `Calc 2` on the first line and `exam` on the second line, centred. Exactly those two lines, nothing else.
8. RED_CIRCLE: a hand-drawn ring in marker red, a loose, slightly uneven, almost-closed circle drawn with one confident pen stroke whose end overlaps its start, width : height 1 : 1, the inside completely empty (transparent background through it), nothing inside.
9. NOTIFICATION_CARD: a phone notification banner, a rounded cream card with a thin dark-grey border, width : height 4.5 : 1. At its left end a marker-red rounded square badge with a small white page glyph (a white folded-corner page outline, no letters, no logo, no brand mark). To the right of the badge, one line of dark-navy hand-lettering reading exactly `Calc 2 Exam · Fri` (capital C, a-l-c, a space, the digit 2, a space, capital E, x-a-m, a space, a centred dot, a space, capital F, r-i). Nothing else on the card.
10. RED_X: a big hand-drawn X in marker red, two crossing confident pen strokes, each stroke slightly curved, width : height 1 : 1, transparent background around and between the strokes, no text.
11. STRIKE_LINE: a single firm strike-through pen line, drawn in night navy ink, a straight slightly wobbly horizontal line with a hint of pen pressure at both ends, width : height 8 : 1, no text.

Row 3:
12. PHONE_FACE_UP: a phone lying face up, seen from directly above, a slim rounded rectangle, width : height 1.9 : 1 (long side horizontal): a night-navy body with a thin cream-grey bezel line and a very dark navy screen filling most of it, flat and empty (draw nothing on the screen: no icons, no clock, no text, no light), a tiny round camera dot at one short end.
13. PHONE_FACE_DOWN: the same phone lying face down, seen from directly above, the same size and outline (width : height 1.9 : 1): the back is a flat cream-grey matte cardstock with a small round navy camera bump near one corner. No logo, no text.
14. PEN: a ballpoint pen without its cap, lying horizontal in side view, width : height 9 : 1: a slim night-navy barrel with a cream grip section and a short metal-grey tip, a small cream clip line near the top end.
15. PEN_CAP: the matching pen cap on its own, horizontal in side view, width : height 3 : 1: a night-navy cap with a small amber clip and a cream band. Not attached to anything.
16. BACKPACK: a student backpack in side elevation, facing right: a rounded kraft-brown and navy body, a front zip pocket, a short top grab loop, one shoulder strap seen edge-on at the back, with a small amber zip pull. Width : height 0.8 : 1. Plain, no patches, no logos, no text.
17. INK_DROP: a single small drop of ink, upright, a round teardrop pointing up, matte liquid black (very dark navy-black) with exactly one small painted cream highlight dot on its upper left, width : height 0.8 : 1, no shadow.

Each piece is finished with the thin pale torn fibre rim of the frozen style (the pen, cap, red marks, X, line and ink drop have no rim). No cast shadows, no inner shadows, no highlights other than the ink drop's one cream dot. Nothing is lit.

Banned: no gator or any character; no scene; no desk or surface under any piece; no ground line; no perspective, no 3D boxes; no real app logos or brand names; no words or digits other than the exact lettering listed above.

## 5. Notes

Exception to the no-text sentence of the technical block above, for this asset only: the lettering listed above on PRACTICE_1, PRACTICE_2, TEST_PAGE, GRADED_TEST, CALC_EXAM_SQUARE and NOTIFICATION_CARD, and the red `94` on GRADED_TEST, must be painted exactly as written, and nothing else on the sheet may contain letters or digits. Wrong or garbled lettering ruins the piece, so draw it large and slowly and keep it simple.

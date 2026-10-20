# Home kit (student bedroom) · v1

Blocks 1, 2 and 4 are the shared files in `assets/prompts/_blocks/`, inserted verbatim by `tools/gen.mjs` (block 4 with the magenta key from `assets/specs.json`). This file supplies block 3. Everything above `## 3.` is not sent to Codex.

Task `asset-home-kit`. Director, G4 notes on the v1 animatic (2026-10-15): "The house is really ugly ... that's a fucking massive table ... The room is really ass. It doesn't look like a room." So: real furniture proportions relative to the gator, read at a glance, one parts kit on one sheet. References attached: the style tile (the look) and the frozen gator sheet (line weight, torn rim, palette, and the character everything is scaled to).

## 3. Asset

A parts kit ("kit of separate cut-paper pieces") for a small student's bedroom, to be assembled in code into a miniature paper diorama set. It is NOT a scene: every piece stands alone on the empty background, with nothing arranged into a room. Two images are attached. The first is the style tile: copy its torn-paper cardstock look, brushwork, paper grain and the thin pale torn fibre rim exactly. The second is the frozen character sheet of the gator student, for the same line weight, rim, flat colour and picture-book simplicity; do NOT draw the gator.

Every piece is a flat orthographic cut-out, like a piece of a theatre set seen straight on, with no perspective, no 3D top faces and no depth: front elevation unless it says otherwise. Flat simple geometric shapes, strong silhouettes that would read if filled solid black, no clutter, no tiny detail. Cardstock, kraft card and cream tissue only. Palette: night navy, cream, gator green (small accents only: a plant leaf is not needed, so green only on a book spine or two), kraft brown, a few touches of lamp amber. No pink, no purple, no magenta, no red.

Layout: one sheet, landscape, four rows, the pieces evenly spaced, nothing touching or overlapping, every piece at least 60 px from every other piece and from the frame edges. Each piece is one closed shape (or the exact set of parts named). Within each piece, the proportions below (width : height) are exact. The pieces may be drawn at different sizes on the sheet so each is as large as the sheet allows, but keep the big furniture in the same relative order of size (door, bookshelf, bed, window, desk, chair, lamp, laundry, laptop).

Row 1 (large furniture):
1. BED_FRAME: a single bed frame in side elevation, long side facing us: a kraft wooden headboard rising at the left end, a lower footboard at the right end, a plain slab base on four short legs between them. Width : height 2.0 : 1.0 (headboard top at height 1.0, footboard about 0.6, base top at 0.5). Empty, no mattress.
2. BED_MATTRESS: the mattress for it, a plain thick cream cardstock slab with rounded ends and a simple quilted seam line, width : height 5 : 1.
3. BED_BLANKET: a night-navy blanket draped as a soft wide shape (flat top edge, two soft hanging sides, a turned-down cream top hem with a few small cream stitch dashes), width : height 2 : 1.
4. BED_PILLOW: a plump cream pillow, rounded rectangle with softly pinched corners, width : height 2.8 : 1.
5. DOOR: a closed interior door in its frame, front elevation: a kraft door slab with two recessed panel rectangles, a round amber knob on the right side, a thin cream frame around it. Width : height 0.45 : 1.

Row 2:
6. BOOKSHELF: a tall kraft bookcase, front elevation, five shelves, filled with chunky books (rectangles in navy, cream, kraft, one gator-green and one amber spine, different heights, a few leaning, no titles, no marks on the spines) and a couple of gaps. Width : height 0.45 : 1.
7. WINDOW_FRAME: a window frame, front elevation, a cream cardstock frame with a cross of two thin muntin bars dividing it into four panes, and a slightly proud sill ledge along the bottom. The panes are EMPTY: show the flat key background through them, because glass is a separate piece. Width : height 0.85 : 1.
8. WINDOW_GLASS: the glass for it: one rectangle of pale cream-blue tissue paper, slightly mottled, exactly the size of the frame's whole inner opening, width : height 0.8 : 0.95 of the frame. Flat, no reflections, no highlight streaks.
9. BLIND_UP: the roller blind rolled up: a short fat horizontal roll of cream tissue paper with its two end caps and a small bracket on each end, width : height 6 : 1, with the little pull cord and its tiny round pull hanging from one end.
10. BLIND_DOWN: the same blind pulled all the way down: a cream tissue sheet with fine horizontal fibre texture, a slightly thicker kraft rod along the bottom edge with a small round pull on a short cord, and a thin roll at the top. Width : height 0.85 : 1.

Row 3:
11. DESK: a student's desk, front elevation: a kraft top slab, a drawer unit on the left with two drawers (small round amber knobs), a plain open kneehole, and a straight leg on the right. Simple, small and ordinary, wide but low: width : height 1.6 : 1.
12. DESK_CHAIR: a desk chair in SIDE profile facing right: a rounded seat, an upright rounded back, four slim kraft legs (two visible), seat height about half the back's height. Navy seat and back, kraft legs. Width : height 0.6 : 1.
13. FLOOR_LAMP: a tall floor lamp: a round cream base disc, a thin kraft pole, and a cream tissue conical shade on top, an amber pull-chain bead hanging from the shade. Light OFF, no glow. Width : height 0.25 : 1.
14. LAUNDRY_PILE: a heap of laundry in a soft low mound: a few overlapping clothes shapes (a cream hoodie sleeve, a navy shirt, a kraft sock-like shape, a cream cloth with a stripe), simple and soft-edged, width : height 1.8 : 1.
15. POSTER_A: a portrait poster, abstract: a cream sheet with a big navy half-circle, a kraft stripe and a small amber dot, no words, width : height 0.7 : 1.
16. POSTER_B: a landscape poster, abstract: a navy sheet with a cream mountain-like triangle pair, an amber disc, no words, width : height 1.5 : 1.

Row 4:
17. LAPTOP_SCREEN: an open laptop's screen, front elevation, face-on: a dark navy bezel with a rounded-rectangle screen area filled with flat plain very dark navy (it will be lit by the engine, draw nothing on it, no icons, no text), width : height 1.5 : 1.
18. LAPTOP_BASE: the same laptop's base seen from the front, as a thin wide slab: a cream-grey cardstock deck with a simple grid of keys and a trackpad rectangle, slightly narrower at the front edge, width : height 8 : 1.
19. RUG: a rug seen from directly above (plan view), a rounded rectangle of cream cardstock with a navy border band, a kraft inner band and a simple row of small amber diamonds, with a short fringe of a few tassels at the two short ends, width : height 1.6 : 1.
20. WALL_STRIP: a wide strip of wall in front elevation: night navy paper, a cream baseboard band along the bottom edge, a thin cream rail line a bit above the baseboard, with a plain smooth surface, so it can be tiled left to right, width : height 3 : 1.
21. FLOOR_STRIP: a strip of floor in plan view: kraft wooden planks running left to right, five planks, each with a slightly different kraft tone and a few simple grain lines, thin dark seams between planks, width : height 4 : 1.

Each piece is finished with the thin pale torn fibre rim of the frozen style, a little ragged on the tissue pieces (window glass, blind, lamp shade, poster edges), tighter on the cardstock. No cast shadows, no inner shadows, no highlights. Nothing is lit.

Banned: no text, letters, numbers or labels anywhere, not even tiny ones on books or posters or the laptop; no gator or any character; no plants, no pictures of a room or a floor under any piece; no ground line; no perspective, no 3D boxes.

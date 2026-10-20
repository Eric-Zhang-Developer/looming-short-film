# Brief · asset-style-tile-v3

**Type:** painter · **Wave:** 3 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md`, `docs/03-art-direction.md` (§Palette, §Characters, §Banned AI tells), `docs/07-process-log.md` (the last two entries), `done/asset-style-tile.md`, `done/tool-cut-fixes.md`, `assets/prompts/style_tile.v2.md`, and look at `evidence/look-pass-2/before_after.jpg` and `evidence/asset-style-tile/contact.jpg`

## Director decisions this brief carries out
- **G1**, verbatim: "make style tile v3 with the value-contrast rule (+4 generations)."
- **Q9:** the gator has short stubby legs.
- **New director note:** "the gator is really ugly ngl." Every v2 gator and the animatic's proxy were judged unappealing, so **character appeal is now this tile's top priority** after value contrast.

## Owns
- `assets/prompts/style_tile.v3.md`
- the `style_tile` entry in `assets/specs.json` (point to v3, add `"cap": 12`)
- `tools/gen.mjs`: only so a spec entry's `cap` overrides the default 8 (default unchanged)
- `assets/raw/` (thumbs committed), `evidence/asset-style-tile-v3/`, `done/asset-style-tile-v3.md`

## Spec
1. **Value contrast (G1).** Navy is for walls and sky **only**. Every prop is a clearly lighter or warmer value than the navy wall: lamp stem and base in kraft or amber, the laptop in cream or kraft, etc. Test it: convert each piece to greyscale; every prop's mean luminance must differ from the wall's by at least 25%. Report the numbers.
2. **An appealing gator (director note).** Run **4 variants, each a different gator design direction**, with the same set pieces, so the director can pick a character as well as a tile. Suggested directions (refine them):
   - (a) **soft and round:** bean-shaped body, short rounded snout, one big expressive eye with a highlight, tiny stubby legs
   - (b) **lanky, sleepy student:** taller, droopy heavy-lidded eye, long hoodie sleeves
   - (c) **chibi:** head about 45% of height, minimal snout, large eye, very readable at small size
   - (d) **graphic picture-book:** flat geometric shapes, strong simple silhouette, a few tiny triangle tooth tips

   Appeal rules for all four: a clear silhouette, a big readable eye (eyes carry the wordless story), a simple shape language, warmth not grossness, no realistic scales or reptile detail, and short stubby legs (Q9). Gator green only on the gator. Same strict side view and ~8 cm scale as v2.
3. Run `node tools/gen.mjs --asset=style_tile --variants=4`, which must now allow 7 + 4 = 11 of 12. At most 2 Codex calls at once. Don't use the 12th unless a variant fails outright.
4. Screen each variant (doc 08 checklist plus the contrast numbers plus your own appeal read). Cut the best one with `cut.mjs --auto` (the despill handles a magenta key) into a scratch dir outside the repo.
5. `evidence/asset-style-tile-v3/contact.jpg`: all 4 over navy and over grey. Also `gators.jpg`: the 4 gators cropped side by side, large, because that's the decision the director makes.

## Acceptance
- [ ] 4 variants, each a distinct gator direction, with thumbs and sidecars
- [ ] The contrast table, with every prop ≥ 25% luminance difference from the wall (or a fail stated)
- [ ] `contact.jpg` and `gators.jpg`
- [ ] Your ranking with one line on appeal per gator. **You do not freeze anything.**

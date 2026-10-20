# Done · v9-ending

## What shipped
The film runs to 3:47 (227 s). s18's fade now takes 2 s (19–21) and lingers on the "1.". Five new shots follow it: s19, the title, where the dot of the *i* is a tiny blob that quivers once; s20, Seneca; s21 and s22, the two credit cards with the director's exact strings; s23, the sting. The theme plays on felt piano under the cards and resolves to C before the sting. Each card cut gets a card tap. The sting reuses s00's buzz and s16's Reel clip, cuts both dead on the face-down flip, then plays room tone.

## Where it lives
- `src/timeline.ts` (DURATION 227, s18 21 s, s19–s23 and their beats), `tools/check_timeline.ts` (TARGET 227)
- `src/shots/s18.ts` (the fade; its lamp and push constants are now exported for s23), new `src/shots/s19.ts` (also `card()`/`block()` for s20–s22), `s20.ts`, `s21.ts`, `s22.ts`, `s23.ts`
- `src/audio/cues.ts`, `src/audio/score.ts`, `src/audio/selftest.ts`
- `docs/shots/s19.md`–`s23.md`, and a v9 block at the top of `docs/shots/s18.md`
- `evidence/v9-ending/`: `sheet.jpg`, `quiver_strip.jpg`, `card_text_1080p.jpg`, `determinism.txt`, `mix.txt`, `selftest.txt`, `stems_vs_v9.txt`, `levels.txt`
- Branch `worktree-agent-a79b107fb8b0da247`, on `v9`: e34192e, a6e123a, 8bbffd0, 2b6ad9e, 50c2038, and this note's commit.

## How it was checked
- [x] `evidence/v9-ending/sheet.jpg` contains every time the brief lists: s18 at 19.0, 20.0, 20.9; s19 at 0.4, 1.2, 2.4; s20 at 2.0; s21 at 1.5; s22 at 2.0; s23 at 0.2, 1.0, 1.9, 2.4, 2.9 (globals 209 … 226.9). I looked at it. Every card is readable, and nothing crosses the 10% margin, because `block()` throws if any line would.
- [x] Small lettering at 1080p: `card_text_1080p.jpg` is a full-res crop of card A's last line and card B's two small lines. ², © and · draw in the hand font (no fallback glyph showed).
- [x] The title's quiver: `quiver_strip.jpg` shows every frame from s19 0.75 to 1.375. The drop trembles from 0.8 and is still by 1.3.
- [x] `node tools/mix.ts` → `premix -18.21 LUFS, -7.23 dBTP → loudnorm linear`; `mix.wav integrated -16.0 LUFS true peak -5.0 dBTP` (`mix.txt`).
- [x] `node src/audio/selftest.ts` → all 9 `ok`, exit 0. The line that matters: `max diff vs lampClickHome [0,1,1] LSB` (`selftest.txt`).
- [x] No cue before 209 moved. All three stems are bit-identical to the `v9` tag's from 0 to 210 s: `music/foley/ambience: 0–209 s max |diff| 0; first difference after 209: none up to 210` (`stems_vs_v9.txt`). To get this I mixed the v9 tag's sources in a scratch copy and diffed the stems.
- [x] `node tools/determinism.ts --t=210.5,212.2,215.5,218.5,222,225.9` → all PASS (`determinism.txt`). That is s18's new fade plus one time per new shot.
- [x] `node tools/check_timeline.ts` → `ok (27 shots, 91 beats, 227.0s)`
- [x] `npm run typecheck` → clean.
- [ ] s18 before 19.0 is pixel-identical to v8: **not verified by render**. The diff shows only `export` keywords and the fade branch (`t < FADE` keeps the old `baseLUT` path). I did not run `tools/hashes.ts`, because it renders the whole film.

## Gaps
- **The sting's "sad" is `tired`.** The brief says so. `SAD` in `s23.ts` is the one constant to swap after v9-blob merges, and then s23 needs a re-render.
- **The sting's shadow is a loom decal, not a spot-light shadow.** It is s13's loom: the blob's silhouette on the wall. It is sized and placed by the point-light projection from the screen (S ≈ 4.6), and it shows only while the phone is lit. A real light can't make a shadow "spring" without moving. s16 used a real spot shadow, so the director may prefer that.
- **Spec timing decisions in s23.** The buzz and lock screen land at 0.3. The Reel's picture and sound start at 0.65, once the buzz's 0.33 s has ended, so the buzz stays sample-identical to s00's. The spec has the Reel autoplay "at 0.3". The shadow springs at 0.8 (over 0.5 s).
- **Set choices in s23, not in the spec:**
  - The laptop, page and calendar are put away. s18's X and "Final" are drawn inside s18, and showing the calendar un-crossed would contradict it.
  - The phone sits at the desk's right end with its screen tipped 25° toward the lens. Lying flat, it was a sliver from this angle.
  - The chair is visible only at frame left and falls out as the camera pushes in.
  - There's no clock on the wall: any time on it would be invented.
- **The cards' piano is −6 dB (`CARD_GAIN`).** At full gain it measured −15 dBFS RMS against the tag's −22 (`levels.txt`). Nobody has listened to the ending; every audio judgement here comes from measurements.
- **The selftest's buzz check now expects 3 buzzes instead of 2.** It still checks an exact count, one seed, one gain, and sample identity for every buzz, so it is not weaker.
- **s18's beds still end at 3:30 (210), and 210–211 is silent apart from the tag chord's tail.** Running them to 211 re-synthesized them and changed the ambience stem back to 77.3 s. I caught that by diffing the stems.
- **The mix's last-second fade (tools/mix.ts, not mine) has moved with DURATION to 226–227.** It no longer fades s18; the fade now falls on the sting's last second.
- **The card text is set in straight double quotes**, exactly as written in v9-beats.

## Story
The ending was meant to be cards, so I started with one card and made it serve all four. The surprise came on the first sheet: the title read "Looïng", with two dots over the i. Caveat's hand slants, so the painted tittle sits to the right of the i's advance box. My search for it found nothing, and the code fell back to placing the drop beside the real dot. The fix was to search into the n's column, since an n has nothing above its x-height. The next render then made the drop the size of a pea, because the measurement had caught the i's stem, so I capped it at 34 px. After that the quiver was invisible: s18's wobble at that size moves a few pixels. One decaying squash made it show (`quiver_strip.jpg`).

In the sting, the first framing hid the phone. It lay flat in front of the blob, a cyan slit at its foot, and the shadow came up behind the lamp shade. Moving the phone right and tipping it toward the lens fixed both: the shadow went up and left, and its eyes, which are holes, droop when the blob's lids go heavy (`sheet.jpg`, last row).

The audio held one more surprise. The selftest passed on the first mix, but I wanted proof that nothing before 209 had moved, so I mixed the v9 tag in a scratch copy and diffed the stems. The ambience differed from 77.3 s on. The beds are synthesized for their length, and I had stretched s18's beds by a second. I put them back at 3:30, and all three stems came out bit-identical (`stems_vs_v9.txt`).

## State
built · 2026-10-20

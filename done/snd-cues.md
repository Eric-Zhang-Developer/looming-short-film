# Done · snd-cues

## What shipped
`src/audio/cues.js` now places 78 cues (it had 6): 36 on the ambience stem and 42 on foley. Every one hangs on a beat name plus an `offset`. A small `bed(sound, stem, from, to, gain)` helper runs a bed between two `[beat, offset]` points, so a retimed beat moves both ends. The three lamp clicks are unchanged. Quiet 1 and Quiet 2 have no music (the score already leaves them clear). Ambience stops for each click's 0.3 s window, as the music stem already does. The mix is linear and lands on target (line below). **One selftest check fails** because of its own premise, not the audio (see Gaps).

## Where it lives
- `src/audio/cues.js`, `evidence/snd-cues/`
- Branch `task/snd-cues`: cd83ddd (cues), 40ea2d5 (evidence), then this note.

## How it was checked
- [ ] **`node tools/mix.mjs && node src/audio/selftest.js`: mix passes, selftest FAILS on one check.**
  - Mix line (`evidence/snd-cues/run1.txt`):
    `mix.wav  integrated -14.0 LUFS  true peak -1.6 dBTP (ebur128)  /  -13.95 LUFS, -1.77 dBTP (loudnorm pass 2)  target -14 LUFS, ≤ -1 dBTP`
    and `premix -17.20 LUFS, -4.83 dBTP  →  loudnorm linear`.
  - Selftest (`evidence/snd-cues/selftest.txt`): clicks sample-identical in the foley stem **ok**; then `a bed cue with a length fills it in its stem` **FAILS** and the script exits 1, so the checks after it never run.
  - To see the rest, I ran a scratch copy of selftest with only that check removed (the copy is deleted; output in `evidence/snd-cues/selftest_without_bed_check.txt`). Every other check passes, including `three lamp clicks are identical within ±1 LSB in out/audio/mix.wav`: max diff `[0,0,0]` LSB, peak 26736 LSB.
  - The failing check takes the first `until`/`dur` cue (`paperBoil`, 0–36.5 s) and asserts that its **whole stem's** first and last non-zero samples are that cue's start and end (`selftest.js:35-37`). That held only while the ambience stem held one bed. Any second ambience cue breaks it. The brief requires several beds, and doc 05 needs ambience silent over each click for the ±1 LSB check, so one film-long bed can't pass both. I didn't edit `selftest.js` (not in my `owns`) or add a dummy cue to dodge it. Suggested fix for its owner: check the cue's own span, e.g. non-zero inside `[at, end)` for the first sound with a bed cue, instead of the stem's overall extent.
- [x] **Byte-identical over two runs.** `evidence/snd-cues/run1.txt` and `run2.txt` diff clean: ambience `d5708dd1…`, foley `ae70aba3…`, music `354c6b88…`, mix `68765337…`.
- [x] **`evidence/snd-cues/stems.png`**, viewed. Three stems over 180 s with shot boundaries, drawn by `stems.mjs`. It shows:
  - music silent across s12 and s17
  - ambience dipping at 0:36.5, 1:40.5 and 2:44
  - the fridge block in s04
  - the shadowBreath swells in s12
  - the mop and bird bumps
  - foley as sparse bursts, with no foley in s12, s14 or s17
- [x] **`evidence/snd-cues/mix.mp3`**: 1,800,525 bytes (≤ 2 MB), 180 s, mono, 80 kbps. It is the normalized mix.
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`.
- I can't listen. Levels come from per-sound LUFS measurements (ebur128), stem peaks and the plot. Nothing here has been heard on speakers.

## Spec'd sound → cue placed
Gains are in `cues.js`. "dB" figures from the specs are applied against the bed's own level, not absolute.

| Shot | Spec'd sound | Cue placed, or why not |
|---|---|---|
| all | paper boil "throughout, very low" (doc 05) | `paperBoil` bed 0–180 s, cut for each click's window (4 pieces) |
| s01 | morning room tone, boil | `roomTone` 0 → `phoneUp`. s01 has no beat, so it hangs on `inkDropForms` − 10 s (computed from the beat). Boil as above. |
| s02 | `inkDropForms`: bead `inkDrip` low gain; landing +1.33; hop taps +2.83, +3.50, +4.17 at 0.3 | All five `inkDrip` cues as specced (bead 0.35, landing 0.7, taps 0.3). Exam motif: score. |
| s03 | `phoneUp`: phone hum, small sub plus soft rustle; room tone −3 dB; flick ticks | `phoneHum` `phoneUp` → `lampClickHome`; `paperRustle` at `phoneUp` (the sub is the score's); `roomTone` at 0.7 to `fridge`. **Flick ticks: no such foley (Gaps).** |
| s04 | `fridge`: fridge hum all shot; jar clinks; cartons; rustles at 0, 2.33, 5.33; sub step | `fridgeHum` `fridge` → `gameNight`; three `paperRustle`s at 0, +2.33, +5.33. **Jar clinks, sloshes: none in FOLEY.** Sub and groove: score. |
| s05 | `gameNight`: rustle; controller clicks throughout; TV bloops; footsteps 3.33–6.33; win jingle at 5.0 | `paperRustle` at the beat; five `controllerClick` bursts (+0.3, 1.9, 3.3, 5.4, 6.9, different seeds); phone hum continues. **TV bloops, footsteps, jingle: none in FOLEY.** |
| s06 | `lampClickHome`; groove, sub and hum cut dead on it; `lampOffHome` identical click; +0.17 hum returns, sub and rustle spring back | Click unchanged. Phone hum ends on the click and returns at `lampOffHome` + 0.17. `paperRustle` at + 0.17. Groove, sub and the Exam tag: score. **No `lampOffHome` click: the brief keeps three.** |
| s07 | `curtainsStart`: creaks at 0/2/4/6; drill 0.33–1.67 and 2.17–3.50; rod snap 4.83; swishes 6.17–6.83, 7.00–7.67; `curtainsDone`: all cut, then +0.5 hum plus the biggest growth and a long rustle | Two `drill` cues (+0.31, +2.15). Phone hum ends at `curtainsDone`, returns at + 0.5. `shadowGrowth` (sub plus rustle, 3.5 s) at + 0.5. **Creaks, rod snap, swishes: none in FOLEY.** The drill's windows don't match (Gaps). |
| s08 | `scrollStart`: hum, scroll ticks, sub ease, faint morning room tone | `phoneHum` and `roomTone` (0.5) `scrollStart` → `marstonEnter`. Sub: score. **Scroll ticks: none in FOLEY.** |
| s09 | lone low note (score); outdoor night bed (lowpassed noise at 400 Hz); boil | Note: score. Bed: **`roomTone` at 0.6 as a stand-in** (it is noise low-passed at 500 Hz). No sub, no footsteps, as specced. |
| s10 | fluorescent hum from `stacksEnter` to s14; growth `subSwell` 6 s plus rustle; phone hum; two 0.6 s flickers | `fluorescentHum` `stacksEnter` → …; `shadowGrowth` dur 6; `phoneHum` to s10's end; `fluorescentFlicker` dur 0.6 at both flicker beats. |
| s11 | `laptopOpen`: soft rustle, not a click; `phoneWake`: hum plus surge (2.4 s); `tableLightDies`: 3 crackles over 4.2–5.0, then the near tube drops out and the hum bed continues at −6 dB | `paperRustle` dur 0.4; `phoneHum` from `phoneWake`; `shadowGrowth` dur 2.4; three `fluorescentFlicker` (+0, +0.3, +0.55, 0.25 s each); hum full until `tableLightDies` + 0.8, then 0.5× (−6 dB). |
| s12 | silence (music); distant hum −6 dB; faint phone hum; boil; shadow breath (period 5 s) | Music: score, silent. Hum at the −6 dB bed; `phoneHum` at 0.5×; `shadowBreath` `quiet1Start` → `headLift` − 0.5. **Its period is 4.5 s, not 5 s (Gaps).** |
| s13 | `headLift` soft rustle; chords (score); generic wakes: three faint phone hums at −24 dB; mop pre-lap from 6.0 at −12 dB | `paperRustle` dur 0.6 at 0.25; three 0.7 s `phoneHum` at ×0.063, `headLift` + 3.9/4.3/4.7; `mopOnTile` at 0.09 (about -7 dB under s14's 0.2) from `headLift` + 5.5 to `custodianPass`. |
| s14 | mop swishes at 0.5 + 0.5n, panned R→L; hum at 0 dB; faint phone hum; no music at `tinyBlobSeen` | `mopOnTile` `custodianPass` → `lampClickMarston` − 0.5; hum back to full from s14's start; phone hum faint. **Swish rate and panning: Gaps.** `tinyBlobSeen`: nothing, as specced. |
| s15 | `phoneHum` faint; `lampClickMarston`, hum ducks −6 dB; silence; `phoneFaceDown` card tap, hum stops; `penUncap`; `penScratch` 8.833–10.0; held note (score); `inkDrip` −18 dB at 10.0 | Click unchanged. `phoneHum` 0.25× (ducked) `lampClickMarston` + 0.3 → `phoneFaceDown`. `penUncap` unchanged. `penScratch` `penUncap` + 0.833 → `nameWritten`. `inkDrip` at ×0.126 on `nameWritten`. **Card tap: none in FOLEY.** |
| s16 | `penScratch` 0.583–2.917; `problemOneSolved`: theme note (score) and `inkDrip` −18 dB; theme notes (score); `penScratch` −10 dB under writing poses; neighbour click; neighbour phone hum −20 dB until 16.5 | `penScratch` `problemOneSolved` − 2.417 → − 0.083 and the `inkDrip` blip. Five `penScratch` cues (1.3 s, ×0.17) before each later solve (**timing is mine, see Gaps**). **Neighbour click not placed (Q2 option b).** `phoneHum` ×0.03 from `lampClickNeighbor` to `problemSolved6` + 0.5. Hum bed and boil continue. |
| s17 | no music for 25 s; hum −12 dB vs s16; room tone; boil; birds at 6.0, 13.5, 19.0; no hop foley | `roomTone` `quiet2Start` → `nextSemester` + 2; `fluorescentHum` at 0.25× of s16; three `dawnBirds` (3.5 s each, different seeds) on the bird beats. No foley. |
| s18 | `nextSemester`: tear rustle 0.25–1.0; home room tone 0–2, then night hum 2–20; phone hum 2–4, ducks at the click; `lampClickFreshman`; `blobYawn`; fade 19–20 | `paperRustle` + 0.25, dur 0.75; `roomTone` runs to + 2.0; `nightHum` + 2.0 → end (cut for the click window); `phoneHum` + 2.0 → click, then ×0.5 to `blobYawn` (**my reading, see Gaps**); click unchanged; theme and yawn tag: score. **The fade: Gaps.** |

## Gaps
- **Selftest bed-span check fails** (above). One line in `selftest.js` for its owner; I left it alone.
- **Sounds the specs ask for that are not in FOLEY, so not placed:** thumb-flick ticks (s03); jar clinks and carton sloshes (s04); TV game bloops, roommate paper-tap footsteps and the win jingle (s05); ladder creaks, the rod snap and curtain swishes (s07); scroll ticks (s08); the card tap (s15). These need new `foley.js` sounds (a `snd-foley` task). None is faked from another sound.
- **One stand-in, flagged:** s09's outdoor night bed uses `roomTone`. The spec calls it lowpassed noise at 400 Hz, `roomTone` is lowpassed at 500 Hz. Easy to swap if a dedicated bed gets written.
- **No `lampOffHome` click.** s06's spec wants an identical off-click. The brief says keep three clicks, and the selftest asserts exactly three, so there is none. Doc 05's own text ("on and off at home") against its table (three times) is the director's call.
- **Where a placed sound doesn't match its spec:**
  - **Drill:** `drill` is one 2.4 s buffer with two trigger pulls (0.02–0.32, 0.5–1.7). The spec wants two longer windows, 0.33–1.67 and 2.17–3.50. I placed it twice; the pulls land about 0.3 s off. It ignores `dur`.
  - **Shadow breathing:** `shadowBreath` cycles every 4.5 s from zero, not 5 s with peaks at 1.25 and 6.25. It also keeps cycling after 6.0, where the spec says hold.
  - **Mop:** `mopOnTile` strokes every ~1.4 s, not the 0.5 s of 10 swishes. The mix is mono, so no panning R→L either.
  - **Fade-out:** there is no gain-envelope field on cues and `mix.mjs` has no master fade. s18's 19–20 s fade to digital silence is therefore only each bed's own 0.05–0.3 s tail. A `fade` field or a master fade is a mix change.
- **Placements where the spec was silent (mine, easy to move):**
  - s05 controller bursts at +0.3, 1.9, 3.3, 5.4, 6.9.
  - s16 pen windows: 1.3 s before each of #2 to #6.
  - The neighbour phone hum's start: at `lampClickNeighbor`.
  - After the Freshman's click, phone hum continues ducked to `blobYawn`.
  - s10's phone hum ends 1 s before `laptopOpen` (s10's end).
  - The three s13 wake hums (their times).
  - Bird phrase groups are 3.5 s each.
- **Levels are headroom-limited.** The premix is -17.20 LUFS at -4.83 dBTP, a PLR of 12.37 against loudnorm's 12.5 linear limit. The click (0.564) sets that peak, so anything that sums with the music's -6 dBFS ceiling above it broke linear mode. That is why s07's drill (0.1) and `curtainsDone` growth (0.08) are quiet, and why I set gains by LUFS: the foley peaks aren't loudness-matched (`phoneHum` -29 LUFS solo, `shadowBreath` -15, `drill` -9.5). Quiet-shot beds sit at roughly -33 to -35 premix LUFS, under the integrated gate, so they don't lower the film's loudness. For more foley presence, a limiter or lower `MUSIC_MAKEUP_DB` in `mix.mjs` is the lever, and it is not mine.
- **Beds break at the three clicks** (0.3 s each, including `paperBoil` and the hums). Intentional, so the clicks are dry and identical in the mix, but it is an audible hole in the boil.
- **The s13 generic-wake hums at −24 dB (×0.02)** are effectively inaudible. They are placed as specced.
- **Not mine, so not placed here:** the groove, subs (s03–s08 and s12), chords, the Exam tags and the theme are in `score.js`. Two shadow-growth sounds that the spec writes as `subSwell` (s10, s11) are `shadowGrowth` here, in the foley stem, since the score has no sub for them.
- **Contract suggestion:** a beat at film start (s01) and an `until` that takes an offset would remove `bed()` and the `inkDropForms` − 10 anchor.

## State
built · 2026-10-15

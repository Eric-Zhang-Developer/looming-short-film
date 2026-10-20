# Done · snd-foley-2

## What shipped
`FOLEY` now has the eleven sounds the shot specs asked for and that were missing: thumbFlick, scrollTick, jarClink, cartonSlosh, tvBloops, roommateStep, winJingle, ladderCreak, rodSnap, curtainSwish and cardTap. All are synthesized, take `(seed)` or `(seed, dur)` and are deterministic. Each one is placed in `cues.js` by beat name plus the spec's offsets.

Three placed sounds now match their specs. `drill` is one trigger pull sized by `dur`, placed on 0.33–1.67 and 2.17–3.50. `shadowBreath` has a 5 s period, peaks at 1.25 and 6.25, holds from 6.0 and runs at 45 Hz. `mopOnTile` swishes on an exact 0.5 s grid. The mix is still linear and on target.

## Where it lives
- `src/audio/foley.js`, `src/audio/cues.js`
- `evidence/snd-foley-2/`: `check.mjs`, `check.txt`, `spectra.jpg`, `run1.txt`, `run2.txt`, `mix.mp3`
- Branch `task/snd-foley-2`: 2ec131f (foley), a2a9b73 (cues and evidence), then this note.

## How it was checked
- [x] **Every sound in the table below is placed.** Nothing was skipped.
- [x] **`node tools/mix.mjs && node src/audio/selftest.js`: all pass, linear, −14 ±0.5 LUFS** (`evidence/snd-foley-2/run1.txt`):
  - `premix -17.15 LUFS, -4.79 dBTP → loudnorm linear` (PLR 12.36 dB against the 12.5 limit)
  - `mix.wav integrated -13.9 LUFS true peak -1.6 dBTP (ebur128) / -13.92 LUFS, -1.66 dBTP (loudnorm pass 2)`
  - All five selftest checks are `ok`: the clicks are sample-identical in the foley stem; all 36 bed cues sound at both ends; voices and foley are deterministic; every foley sound renders; the clicks in mix.wav differ by `[0,0,0]` LSB.
- [x] **Byte-identical over two runs.** `run1.txt` and `run2.txt` match line for line, including mix sha256 `3e68e01e…`. `run2.txt` also lists the stem hashes (music `354c6b88…`, unchanged from snd-cues; foley `456852c3…`; ambience `7fccc00b…`). `run1.txt` has no stem hashes because I added that step after run 1.
- [x] **Per-sound determinism.** `node evidence/snd-foley-2/check.mjs` → `check.txt` renders all 30 FOLEY entries twice. It reports `all deterministic, finite, |peak| < 1, |dc| < 1% of peak, edges < 1% of peak`.
- [x] **`evidence/snd-foley-2/spectra.jpg` viewed** (Read). It has one tile for each new or changed sound, in alphabetical order (listed in check.txt).
  - The first look found two problems. The jarClink and rodSnap rings stopped on a step at the end of their buffer (a vertical line), so they now taper. cartonSlosh was bright up to 16 kHz, so it is now low-passed at 2 kHz.
  - Re-viewed after the fix: the mop shows 12 swishes in 6 s, shadowBreath has a null at 3.75 s and holds flat from 6 s, the drill is a single held pull, and the jingle is three steps up to a vibrato chord.
- [x] **`mix.mp3` is 1,800,525 bytes** (≤ 2 MB): mono, 80 kbps, the normalized mix.
- [x] `node tools/check_timeline.mjs` → `ok (18 shots, 41 beats, 180.0s)`.
- **I can't listen.** Everything here comes from spectrograms, peak and LUFS numbers and the code. Nothing has been heard.

## Spec'd sound → cue placed
Offsets are from the named beat. Gains are in `GAIN` in `cues.js`. All of these are on the foley stem.

| Shot | Sound | Cue |
|---|---|---|
| s03 | thumb-flick ticks, very low | `thumbFlick` at `phoneUp` +1.33, 1.83, 2.33, 2.83, 3.33, 3.83 (×0.2, about −24 dBFS peak) |
| s04 | jar clinks 0.83, 2.17, 3.33 | `jarClink` at `fridge` + those (×0.4) |
| s04 | three carton sloshes 3.50–4.00 | `cartonSlosh` at +3.50, 3.67, 3.83 (×0.5) |
| s05 | TV game bloops throughout | `tvBloops` bed `gameNight` → +4.9, then +6.0 → s05 end (×0.4) |
| s05 | roommate paper-tap footsteps, every 0.33 s over 3.33–6.33 | 10 × `roommateStep` at +3.33 + k/3 (×0.4), alternating two seeds for the left and right foot |
| s05 | win jingle at 5.0 | `winJingle` at +5.0 (×0.3, **headroom-capped**) |
| s07 | ladder creak at 0, 2, 4, 6 | `ladderCreak` at `curtainsStart` + those (×0.2, **headroom-capped**) |
| s07 | drill 0.33–1.67, 2.17–3.50 | `drill` beds on exactly those windows (×0.1, unchanged and **headroom-capped**). **Fixed:** the whirr now fills each window. |
| s07 | rod snap 4.83 | `rodSnap` at +4.83 (×0.2, **headroom-capped**) |
| s07 | curtain swishes 6.17–6.83, 7.00–7.67 | `curtainSwish` beds on those windows (×0.3) |
| s08 | soft scroll tick on each thumb flick (0.25, 0.75 … 5.75) | 12 × `scrollTick` at `scrollStart` + 0.25 + 0.5k (×0.25) |
| s15 | soft card tap at `phoneFaceDown` | `cardTap` at `phoneFaceDown` (×0.4). The phone hum already stops there. |
| s12 | shadow breath, period 5 s, peaks 1.25/6.25, holds after 6.0, 45 Hz | **Fixed in `shadowBreath`.** The cue is unchanged and still starts on `quiet1Start`. |
| s13–s14 | mop swish at 0.5 + 0.5n through 5.0 (10), continuing s13's pre-lap from 6.0 | **Fixed.** `mopOnTile` swishes every 0.5 s from 0. Pre-lap `headLift`+5.5 → `custodianPass` (3 swishes); s14 bed `custodianPass` → +4.95 (10 swishes, the last ends 0.05 s before the Marston click). |

## Gaps
- **Levels are headroom-limited in s05 and s07.** The music is at its −6 dBFS ceiling there, and linear loudnorm needs premix PLR ≤ 12.5 dB. With my first gains (jingle 0.4, creaks and rod 0.3), the PLR reached 12.96 and loudnorm fell back to dynamic. I lowered the jingle to 0.3 and the creaks and rod snap to 0.2, which brought the PLR to 12.36. The drill stays at 0.1, which is about −24 dBFS peak against the controller clicks' −13.
  - The shortfall: the specs give no numbers for these sounds, but "comic, exaggerated" s07 foley is quieter than the s05 controller.
  - The lever is `MUSIC_MAKEUP_DB` or a bus limiter in `tools/mix.mjs`. That file isn't mine, so I didn't touch it.
- **No panning.** The mix is mono (`mix.mjs` writes `[s, s]`), so the mop can't pan R→L as s14 asks.
- **Placements where the spec was silent (mine, easy to move):**
  - The TV bloops stop for the jingle from +4.9 to +6.0 and resume when he goes back to mashing.
  - The footsteps alternate two seeds. Their level and timing never change.
  - Each flick and scroll tick gets its own seed.
- **Also fixed: `shadowBreath`'s frequency, 48 → 45 Hz.** The brief named only the period, but s12 says `hz: 45`.
- **`drill`'s signature changed** from `(seed)` to `(seed, dur)`, default 1.34 s. Each pull now coasts down in its last 0.25 s. The old built-in "brr… BRRR" double pull is gone because the spec's windows are equal.
- **The evidence spectrogram tiles are not committed.** `check.mjs` writes them to `out/audio/spec/` (gitignored), so the evidence images are just the one JPEG. `spectra.jpg` has no labels because this ffmpeg has no `drawtext`. The tile order is in check.txt.
- **Untouched:** the lamp clicks. Nothing new lands in Quiet 1 (s12) or Quiet 2 (s17). No click window gets a new sound (the selftest click checks pass).

## State
built · 2026-10-15

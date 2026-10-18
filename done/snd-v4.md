# Done · snd-v4

## What shipped
The sound now follows the v4 cut (195 s) and carries the climax. The music thins in bed and goes out on `clockThree`, so at 3 a.m. the clock ticks alone. A low held note sits under the choice, and the door opens on the hall's hush. On the walk the tick doubles into a 120 bpm pulse and one score layer joins per lamp: a dissonance at the block that resolves when he steps around it, then the climb, the peak on the door push, and one held C major chord on the light. Near-silence and the exhale follow. Act 4 opens on the theme in major. New foley is built the film's way, each sound with one physical joke: the tick and its distance filters, the pulse, the breaths and the exhale, the backpack, the latch and hinge, the hall's hush, the night air, the swallow, the footsteps and the push bar. The clock is one buffer everywhere it appears. The mix measures −15.9 LUFS and −4.7 dBTP, and two renders are bit-identical.

## Where it lives
Branch `task/snd-v4`, on top of `a830510`:
- `586c1bb` the clock's one tick, the pulse built from it, the climax foley (`src/audio/foley.js`, `src/audio/synth.js`: `pad` bend/open)
- `a570be6` cues and score re-hung on v4 beats; the climax built (`src/audio/cues.js`, `score.js`, `selftest.js`)
- `8ae4ba6` the loudness fit (`tools/mix.mjs`, the click's cue gain)
- `090c990` `docs/05-sound.md` (three stale prose lines), `evidence/snd-v4/`, this note · then the last commit on the branch, the swallow at doc 05's −24 dB (the level the evidence was rendered with)
- `evidence/snd-v4/`: `loudness.txt`, `swell.txt` (+ `swell.mjs`), `cues.txt` (+ `cues.mjs`), `tick.txt` (+ `tick.mjs`), `selftest.txt`, `check_timeline.txt`, `mix_run{1,2}.txt`, `hashes_run{1,2}.txt`

## How it was checked
- [x] `node tools/mix.mjs` writes `out/audio/mix.wav`: 48 kHz, 16-bit stereo, `duration=195.000000` (`loudness.txt`). The selftest passes (`selftest.txt`, exit 0):
  ```
  ok  every cue and score event hangs on a beat the v4 timeline has      (292 cues, 251 score events)
  ok  three lamp clicks (s06 on, s06 off, s09a nightstand) are sample-identical in out/audio/stems/foley.wav
  ok  the clock is one buffer: clockTick ignores its seed, and every tick cue sits on a whole second of global time
  ok  the two penUncaps are one seed and gain, sample-identical in foley.wav
  ok  the two phoneBuzzs are one seed and gain, sample-identical in foley.wav
  ok  every bed cue with a length sounds at both ends of its own span
  ok  voices and foley are deterministic and finite
  ok  every foley sound renders, deterministic and finite
  ok  the three lamp clicks are identical within ±1 LSB in out/audio/mix.wav   max diff [0,1,1] LSB
  ```
- [x] Loudness (`loudness.txt`, ffmpeg `ebur128=peak=true` on the final mix.wav): **I −15.9 LUFS, true peak −4.7 dBFS**, LRA 16.3 LU. Target: −16 ±1 LUFS and ≤ −4 dBTP. Met. loudnorm ran linear (premix PLR 11.3 dB).
- [x] `cues.txt`: every cue and score event with its time and beat, 293 rows marked `NEW`.
- [x] `swell.txt`: short-term (S) and momentary (M) loudness every 0.5 s over 60–110 s, from the same meter. Values are S in LUFS:

  | t | beat | S |
  |---|---|---|
  | 60.0 | end of s07 | −16.4 |
  | 63–71 | s08, the tick alone | −31.1 to −31.9 |
  | 72–81 | the held note, the door, the hall | −28.4 rising to −22.3 |
  | 84.0 | `lamp1`, the pulse alone | −27.2 |
  | 87.5 | `lamp2` | −24.9 |
  | 90.5 | `lamp3` | −22.7 |
  | 92.0 | `blobBlocks` | −20.0 |
  | 94.0 | `stepAround` | −16.5 |
  | 95.5 | `lamp4` | −15.8 |
  | 97.0 | `lamp5` | −14.6 |
  | 98.0 | `marstonSeen` | −14.5 |
  | 100.0 | | −12.6 |
  | 103.0 | `doorPush` | **−11.0** (M −10.7) |
  | 104.5 | | −12.3 (M −18.5) |
  | 106.0 | | M −25.7 |
  | 107.0 | `exhale` | M −34.5 |

  The film's loudest S is at 101.7 s (−11.0). The next loudest is −11.3 at 47.6 s (s06's groove), so the margin is only 0.3 LU.
- [x] Two mixes hash identically: `mix.wav` `ccff87a2…ecbd9` in `hashes_run1.txt` and `hashes_run2.txt`, and all three stems match too. `node tools/check_timeline.mjs` → `ok (21 shots, 70 beats, 195.0s)`.
- [x] s08's tick on a phone (`tick.txt`), measured, not heard. Each tick peaks at −10.1 to −13.7 dBFS in mix.wav, 22.2–27.5 dB over the floor between ticks. Through a 500 Hz high-pass (a phone speaker's roll-off) the peaks are −11.4 to −15.5 dBFS, 23.6–32.1 dB over the floor. The lamp click, the film's loudest transient, peaks at −5.0. s08's S (−31 LUFS) is 15 LU under the film's integrated loudness: quiet, but the ticks themselves are loud, isolated transients in the band phones reproduce. My inference is that they are audible. Nobody has checked on a device.
- [x] `pad()` with neither new option is bit-identical to before (hash compared before and after the change).
- [ ] **Not listened to.** Nothing here was heard. The checks are meters, peaks, hashes and the selftest.

## Gaps
- **Loudness decision (`8ae4ba6`).** v4 swaps G4's 12 s of full groove (s07–s08) for the quiet climax, and the premix PLR rose to 12.8 dB, against 11.5 allowed. The true peak is the lamp click: −4.8 dBTP at 40.5 and 74.0, and every other 10 s span is lower. I lowered the clicks' shared gain from 0.8 to 0.6 and moved the music ceiling (−6 → −7.6 dBFS) down with it. The makeup gain stays at 7.5 dB, so music and foley keep G4's balance. The click's level in the delivered mix doesn't change, because it is always the normalized true peak.
  - The cost: the music limiter works about 2.6 dB harder than in G4 at its hot spots: piano attacks in s06's groove, the climb at 100–103 (up to about 8 dB on piano transients), and the grade.
  - The alternative also passed (makeup 8.5, music 1 dB over foley).
- **Sub swells lowered.** At G4 levels, s07's gulp-3 sub (0.55 → 0.3), the s06 spring-back sub (0.35 → 0.22) and the s09b shadow sub (0.4 → 0.15) out-measured the door push or the start of the build. I removed the sub G4 had on `bedRot` (the blinds' growth), because doc 05 hangs no shadow growth there. They are 45–56 Hz sines: loud on the meter, faint on phones.
- **No tick at 74.0.** The nightstand click lands on that second and takes the tick's place. Doc 05 says "on the tick at 74.0", but a tick under the click would break the three clicks' identity. The music gate also opens a 0.3 s hole in s09a's held low note at 74.0, the same treatment s06's clicks get. **Listen for whether that dip reads as a dropout.**
- **No tick under s07**, though its second hand moves from 48.0 (my call, as the orchestrator allowed). The tick's first close appearance is the frame the music goes out.
- **Where I chose because the spec was silent:**
  - The walk's harmony: C pad (doubled G slides to F# on the block and back on `stepAround`), then G at `marstonSeen` with the music box's F making G7, resolving to the C chord on the light.
  - The rising motif: cells C-E-A, D-G-B, E-A-C, D, E, landing on the top A half a beat early at 98.0.
  - The piano's held A is re-struck every second, because a felt piano can't hold for 5 s.
  - The peak adds a struck G chord.
  - Act 4: the theme's first phrase, one note every 2 s, over major chords. The s13 Freshman chord is C/E, not G4's E7.
  - s16: the phrase completes on #5 as F then D (145.0, 145.5). G4's fast montage replay after the last solve is gone, because there's no room before Quiet 2.
  - At the grade, the "one voice added at `gradeGrin`" is a second piano voice a third above the theme.
  - The avoidance groove's third layer (G4's blinds tune) now enters after the lamp's off click (bars 2–3), so the 2/4 bars at the 7 s dodges keep each dodge on a downbeat.
- **Not placed:** s11's page and pen tap, s13's distant pens and page turns. They are in the shot specs but not in doc 05's table. There is no caption file (doc 05 §Mix).
- **Unused but kept in foley.js** (the brief says extend, don't clean up): `sensorWake`, `drill`, `blindRattle`, `rodSnap`, `mopOnTile`, `shadowBreath`, `fluorescentFlicker`, `ladderCreak`, `curtainSwish`, `thumbFlick`, `inkRoll`.
- **Timeline / doc 05 / spec issues (not mine to change):**
  - `s09c.js` doesn't export `DECIDE` (blobBlocks + 7/6) or `TURN` (18.0). `cues.js` mirrors them with a `ponytail:` note. If the walk is retimed there, the side-steps and the back-view steps drift.
  - Doc 05 says footsteps run "to `doorPush`", while s10.md stops them on `lightFlood`. The picture has a step across the sill at 103.25, and I placed it.
  - Doc 05's s08 breath "from 65.0" is superseded by climax-a1's as-built 65.67.
  - s16/s17b/s18.md's Sound sections are still G4 text (six solves, shrink pitches −3…+1). Doc 05's v4 table won, and I followed it.
  - Doc 05 §Leitmotifs said "2× peak" (now 2.5×, Q16). The lamp click was "heard twice" (now three times, Q17). §Mix said −14 LUFS / −1 dBTP. I fixed those three prose lines. The cue table is untouched.
  - `check_timeline` still doesn't check cue names (G4 noted this). The selftest now does.

## Story
I started with the error G4 left behind: `cues.js` wouldn't import, because v4 had cut the blinds, the stacks and the sensors. Every cue went back onto the beat doc 05 names, so the next re-cut still moves the sound. The clock was the heart of the brief, so I designed it once: a paper-and-wood tick whose small joke is the second hand's overshoot rebound, one frame later. It ignores its seed, so no cue can make a second clock. The pulse is that same tick at half speed on a thump.

I can't listen, so the swell had to be read off a meter. The first render looked like a build and measured like a wall. Short-term loudness rose only 1.6 LU over the climb's +4 dB, and a per-layer probe showed why: the pulse alone peaked at +1.4 dBFS after makeup, and the 45 Hz bass swell drove the music limiter into 19 dB of gain reduction. The limiter was eating the climb. I rebalanced the layers until the build sat under the ceiling. Then the meter said bed rot, the film's saddest and thinnest shot, was louder than the door push. Two G4 sub swells were doing it: the blinds' sub, which no v4 beat asks for, went, and gulp 3's came down. After the s06 groove's tail and one more change (doubling the climb's sustained pad, so the top was less transient-heavy), the door push became the loudest moment, by 0.3 LU.

The loudness fit came last. With the build no longer squashed, the PLR was 12.8 dB. I measured where the true peak lived: the lamp click, every time. So I lowered the click against the film rather than raising the music over the noises the director likes. The numbers are in `swell.txt`. Whether it swells is a question for someone with ears.

## State
built · 2026-10-18

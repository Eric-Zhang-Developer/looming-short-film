# Done · snd-score

## What shipped
`src/audio/score.js` holds the film's score: `SCORE` is a flat list of `{ beat, at, voice, midi, vel, dur, motif? }` note events. Each event is anchored to a beat name from `src/timeline.js` plus an offset, never a global time. `renderScore(durSec)` returns a mono 48 kHz `Float32Array` built from doc 05's four voices in `synth.js`. `tools/mix.mjs` now renders the score into the music stem, replacing snd-engine's placeholder Exam bed. No new voices were needed. The only local helper is a linear `fadeOut` for the Marston sub.

## Where it lives
- `src/audio/score.js`, plus a 3-line change to `tools/mix.mjs`
- `evidence/snd-score/`
- Branch `task/snd-score`: a8d2ec1 (score), c8ab384 (evidence), then this note

## How it was checked
- [x] **Full mix renders, loudness in range.** `node tools/mix.mjs` prints:
  `mix.wav  integrated -13.9 LUFS  true peak -1.3 dBTP (ebur128)  /  -13.95 LUFS, -1.50 dBTP (loudnorm pass 2)  target -14 LUFS, ≤ -1 dBTP`. The premix measures -20.91 LUFS and -4.83 dBTP, and loudnorm runs in **dynamic** mode (see Gaps). Wall time is about 16 s.
- [x] **Byte-identical over two runs.** mix `21aa39b0…66a0`, and the music, foley and ambience stems match too. See `evidence/snd-score/run1.txt` and `run2.txt`.
- [x] **Spectrogram and timeline, both viewed.** `evidence/snd-score/spectrogram.jpg` covers the full music stem, log frequency from 20 Hz to 8 kHz. `evidence/snd-score/timeline.png` shows doc 05's sections, every beat, one lane per voice or motif, and the music stem's RMS. The script that draws it is `timeline.mjs`. Both images show:
  - zero music at 78–88 s (Quiet 1), 98.6–110 s (the Marston click and the held silence after the uncap), and 135–160 s (Quiet 2)
  - a gap at 36–40 s around both home clicks
  - a gap at about 163–165.5 s around the Freshman click
- [x] **`evidence/snd-score/score.mp3`.** 1.80 MB, 180 s, mono, 80 kbps. It is the full normalized mix, so the clicks can be judged in context, not the bare stem.
- [x] **`node src/audio/selftest.js` still passes** (`evidence/snd-score/selftest.txt`). All three checks pass, the clicks are sample-identical in the foley stem, and `check_timeline` returns `ok (18 shots, 16 beats, 180.0s)`.
- [x] **Section-by-section description:** below. Music levels for each section are in `levels.txt`.
- I can't listen. Everything here comes from the code, spectrograms, RMS and peaks, not from my ears.

## What I wrote, by section (doc 05 §Structure by section)
**Leitmotifs.**
- **Exam:** music box, C5 E5 A5 D#5, each a few cents off, 0.55 s apart. These are snd-engine's notes, kept for continuity. It plays three times, softer each time the blob is small: at the ink drop (vel 0.55), at the home lamp (0.40) and on the yawn (0.28).
- **Theme:** felt piano, C E A G E F D. It takes the Exam's opening leaps (up a major 3rd, up a 4th) and plays them in tune. The sour fall to D# becomes a step down to G. The fear motif, faced, turns into the theme. Every return keeps the same intervals.
- **Avoidance groove:** 120 bpm, I–vi–IV–V. It has no beat names of its own, so it runs on a grid hung from `lampClickHome` (see Gaps).

**The film, section by section.**
- **0:00–0:20 Birth.**
  - A quiet dawn pad (C add9) fades out as the ink forms.
  - The Exam motif starts at `inkDropForms` + 0.3.
  - A first faint sub swell (42 Hz) starts at `phoneUp`, as the shadow climbs the wall.
- **0:20–1:00 Avoidance.** Each dodge lands on a bar downbeat and adds one layer:
  - fridge (bar −8): oom-pah bass
  - game night (−4): chord stabs on 2 and 4
  - lamp (0): **stop-time**
  - curtains (4): walking bass and offbeat-eighth stabs
  - scroll (9): the melody doubled an octave up

  The stop-time drops bars 0–1 (36–40 s). Both lamp clicks sound in the open. A tiny Exam motif fits between them and ends before the off click. The bouncy tune enters as the groove snaps back at bar 2.

  A sub swell runs under each dodge, rising from 44 to 56 Hz and from gain 0.25 to 0.5. It ends exactly on `lampClickHome` (the shadow snaps down) and comes back with a fast attack on `lampOffHome` (the shadow springs back).
- **1:00–1:18 Marston.** The groove cuts on bar 12. One low A1 piano note follows. The sub stays (the shadow follows him in) and fades out 0.5 s before `quiet1Start`.
- **1:18–1:28 Quiet 1.** No music.
- **1:28–1:40 Reveal.** Four sparse piano chords, one per shadow revealed, at `headLift` + 1, 2.5, 4 and 5.5 s: Am, Fmaj7, Dm7, then E7 left hanging. They decay by about 97.6 s.
- **1:40–2:15 First step.**
  - Nothing sounds through the Marston click or the uncap.
  - At `nameWritten`, one held C4: the first note of the theme.
  - At `problemOneSolved`, E4. Then one theme note per solved problem, with the left hand joining.
  - The montage plays the whole theme faster with the melody in octaves. It ends **open on Gsus4**, anchored to `quiet2Start` − 8 s so it always dies before Quiet 2.
- **2:15–2:40 Quiet 2.** No music.
- **2:40–3:00 Button.**
  - The theme in time, from `nextSemester`: C E A G.
  - It breaks around the Freshman's click.
  - It resumes at `lampClickFreshman` + 1.5: E F D over G7, then **resolves to C**.
  - A warm C pad sits under the ending.
  - The Exam tag plays on `blobYawn`, the softest of the three.
  - The pad releases by 179.1 s.

## Gaps
- **Click identity in the final mix is lost.** snd-engine predicted this. In the stems the three clicks are still sample-identical, and in `mix.wav` their peaks match exactly (-1.56 dBFS). But their samples differ by up to 811 and 2078 LSB (`clicks_in_mix.txt`), because loudnorm runs in dynamic mode and its gain depends on the surrounding music.

  Linear mode needs peak-to-loudness ≤ 12.5 dB. The premix is at 16.1 dB: the click peaks are transient and the piano has a wide range. I can't close that from the score alone, and I didn't add a limiter or change the loudnorm settings, because `mix.mjs` is only mine for wiring the score in. This needs a mix decision, for example a gentle limiter or compressor on the music stem before summing, or a mix-stage task.
- **Contract request: more beat names.** The dodges at 0:20, 0:28, 0:44 and 0:54, Marston's 1:00 and the reveal's individual shadows have no beat names. I anchored them to `lampClickHome` through a 120 bpm grid (and `headLift` + offsets for the reveal). That moves correctly if s06 moves, but not if s04, s05, s07 or s08 are retimed on their own. Adding `fridge`, `gameNight`, `curtainsStart`, `scrollStart` and `marstonEnter` to `timeline.js` would let the grid follow them. That is a contract change, so I didn't make it.
- **Quiet 1's "shadow breathing (sub)"** is in doc 05's ambience column, so it isn't in the music stem. The ambience stem is still silent, and nobody owns this yet.
- **The 1:45 blob look and the custodian's tiny blob get no Exam motif.** Doc 05's table says "click, silence, single note" and "chords" for those spots, so I kept them clear.
- **`lampOffHome` (39 s) is not a foley cue** (snd-engine's gap still stands). The music leaves room for it anyway.
- **Decisions I made because the spec was silent**, all reversible numbers in `score.js`:
  - keys: A minor for Marston and the reveal, C major for the theme
  - all pitches, velocities and the 120 bpm tempo
  - 60:40 swing
  - music level 0.5 under the foley, so the click (-5 dBFS in its stem) stays the loudest transient
- **Sound quality is unchecked by ear.** The engine note's honest read still applies: the felt piano may sound more like a mellow electric piano.
- Music is mono, like the other stems, because `mix.mjs` writes dual mono.

## State
built · 2026-10-15

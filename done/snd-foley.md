# Done · snd-foley

## What shipped
All 11 stubbed sounds in `src/audio/foley.js` are now synthesized: penScratch, phoneHum, inkRoll, shadowGrowth, fridgeHum, controllerClick, drill, fluorescentFlicker, mopOnTile, paperBoil, dawnBirds. I also added three ambience beds that doc 05's section table names but the file lacked: roomTone (morning room tone and Quiet 2), nightHum (Button) and shadowBreath ("the shadow's breathing (sub)", Quiet 1). The `todo` helper is gone. Each function has a one-line signature comment.

## Where it lives
`src/audio/foley.js`, `evidence/snd-foley/{check.mjs,check.txt,spectra.jpg,spec/*.png,selftest.txt}`, and solo WAVs in `out/audio/solo/<name>.wav` (gitignored). Branch `task/snd-foley`: 598767f (sounds), 377112a (evidence), then this note.

## How it was checked
- [x] No `todo(` left in `foley.js`: `grep -c 'todo(' src/audio/foley.js` → `0`.
- [x] Every sound is deterministic. `node evidence/snd-foley/check.mjs` → `evidence/snd-foley/check.txt`. It renders all 19 FOLEY entries twice with `seedOf(name)`, and the sha256 values match for each. It also checks that all output is finite, peak < 0 dBFS (max −3.0), |DC| < 1% of peak (max 1.1e-3) and first/last sample < 1% of peak (all 0.0000). Result: `all deterministic, finite, |peak| < 1, |dc| < 1% of peak, edges < 1% of peak`, exit 0.
- [x] Spectrogram sheet `evidence/snd-foley/spectra.jpg` (tiles in the alphabetical order of check.txt), plus one PNG per sound in `spec/`. I viewed it with Read. The first look found three problems, which I fixed and re-viewed. (1) The drill's brush hiss was full-band and nearly as loud as the motor, so it's now 3–7 kHz and quieter. (2) The mop strokes were bright to 16 kHz, so the mop is now low-passed at 5 kHz. (3) The engine's `inkDrip` showed a vertical line where the buffer stopped on a step at 0.3 s, so it now has a 20 ms tail-only fade. The peak (−3.4 dBFS) and attack are unchanged.
- [ ] `node src/audio/selftest.js` still passes: **FAIL, by design conflict** (`evidence/snd-foley/selftest.txt`). After `node tools/mix.mjs` (−14.5 LUFS, −1.2 dBTP), the first two checks pass: the three lamp clicks are sample-identical, and the voices and foley are deterministic. The third check, `unbuilt foley throws "not implemented"`, asserts `FOLEY.penScratch(1)` throws, and it now can't, because acceptance item 1 removes every stub. The two items contradict each other. I don't own `selftest.js`, so I left it alone. Fix (selftest owner): delete line 35, or change it to assert that every FOLEY entry renders. Side effect: selftest now exits before writing `out/audio/solo/{lampclick,piano_c4}.wav`.
- [x] An honest guess per sound. **I can't listen. These come from spectrograms, levels and the code only.**
  - penScratch: reads as fast ballpoint scribbling on paper. It may sound more like sandpaper hiss than a pen, because there's no pitch to the nib.
  - phoneHum: a thin, cold whine at the edge of hearing. On laptop speakers at mix level it may be inaudible, and that's arguably the point.
  - inkRoll: soft wet "blub-blub" bubbling over a dark gurgle. It might read as a draining sink rather than a rolling drop.
  - shadowGrowth: a felt 45 Hz swell under a quiet rustle. On laptops and earbuds, only the rustle will survive.
  - fridgeHum: a buzzy, wobbling, cartoonish drone with a faint rattle. Probably convincing as a comic fridge, maybe too rough.
  - controllerClick: a quick clatter of plastic taps. Plausible button mashing, though the clicks are sharper and brighter than real rubber-dome buttons.
  - drill: a cartoony "brr… BRRRR" with spin-up and coast-down. It'll read as a drill or electric razor, and is buzzier than a real drill.
  - fluorescentFlicker: buzz cutting in and out with crackly ticks. Probably reads well as a failing tube.
  - mopOnTile: slow "shhh… shhh" swishes with a wet slap. It may read as brushing or sweeping more than mopping.
  - paperBoil: a barely-there hiss with sparse crinkles. At "very low" it might just sound like tape hiss.
  - dawnBirds: two or three high, quick chirp-trills with faint echo. Will read as "synth birds", not a specific species, and is clearly artificial up close.
  - roomTone, nightHum: dark, steady air. nightHum adds a faint 60/120 Hz drone. Both will be nearly inaudible on laptop speakers.
  - shadowBreath: a slow 48 Hz throb on a 4.5 s cycle. Felt, not heard, on small speakers.

## Gaps
- **The selftest fails at its stub check** (see above). It needs a one-line change in `src/audio/selftest.js` from its owner. I didn't weaken or edit it.
- **The signatures are mixed.** The new beds take `(seed, dur)`, as the brief says. The engine's `paperRustle` and `fluorescentHum` still take `(seed, { dur })`. Contracts §src/audio says only `(seed) => Float32Array`, and `tools/mix.mjs` calls `FOLEY[sound](seed)` with no duration, so every bed currently renders at its default length (2–8 s) if cued. Mix wiring for bed length is the next owner's call. A contract change to declare `(seed, dur)` may be wanted.
- **Levels:** each sound's output peak is my guess at its loudness relative to the others at cue gain 1 (phoneHum −30.5 dBFS, paperBoil −22, roomTone −24, birds −16.5, one-shots around −3 to −8). None of this is placed in `cues.js` or heard in a mix.
- **New local helpers in `foley.js`:** `norm` (peak normalize) and `fade` (linear in/out). No synth primitive was needed. `shadowGrowth` reuses `subSwell` and `paperRustle`, and `fluorescentFlicker` reuses `fluorescentHum`.
- **Changed one engine sound:** `inkDrip` (tail fade, see above). This changes the foley stem's samples at `inkDropForms`, so the mix hash differs from snd-engine's.
- **Decisions where the spec was silent:**
  - penScratch's stroke speed is seeded, not driven by the animation's real pen path.
  - controllerClick is a 4–7 press burst, not a single click.
  - drill is two fixed trigger pulls.
  - phoneHum is 7.9 kHz.
  - The bird count is 2 or 3 per seed.
  - Default durations are the ones in check.txt.
- The spectrogram tiles have no name labels because this ffmpeg has no `drawtext`. Their order is the alphabetical list in check.txt.

## State
built · 2026-10-15

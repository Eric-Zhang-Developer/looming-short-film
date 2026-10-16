# Done · snd-g4

## What shipped
The sound now follows the 3:15 G4 cut. `cues.js` imports again, and every cue and score note hangs on a G4 beat name. Eleven new foley voices are placed, built from the same toolkit and with the same habit as the old ones: each gets one small physical joke. The gulps and shrink answers that doc 05 described but nothing ever played are in. At the grade, the motif resolves: the music box plays its opening in tune for the first time. The mix is −15.9 LUFS with a −4.8 dBTP true peak, renders bit-identically twice, and fades to digital silence at 195.0 s.

## Where it lives
Branch `task/snd-g4`, commits `bf6958a`…`70de719` on top of `496aba1`:
- `bf6958a` re-time and rename map · `3803883` new foley and cues · `379f7b2` gulps, shrinks, resolution, tag reprise · `1f14a3d` loudness, master limiter, fade · `53f79ba` doc 05 prose · `e330daf` evidence · `70de719` selftest pair check
- `src/audio/{cues,score,foley,synth,selftest}.js`, `tools/mix.mjs`, `docs/05-sound.md` (structure table, sensor-wake prose, shrink line)
- `evidence/snd-g4/`: `loudness.txt`, `cues.txt` (+ `cues.mjs`), `hashes_run{1,2}.txt`, `mix_run{1,2}.txt`, `selftest.txt`, `check_timeline.txt`, `master_limiter.txt` (+ `.mjs`), `spectrogram.jpg` with `solo.txt` (+ `solo.mjs`)

## How it was checked
- [x] `node tools/mix.mjs` writes `out/audio/mix.wav` at 195.0 s: `duration=195.000000` (`loudness.txt`), 9,360,000 samples, last samples 0. The selftest passes (`evidence/snd-g4/selftest.txt`, exit 0):
  ```
  ok  two lamp clicks (home on, home off) are sample-identical in out/audio/stems/foley.wav
  ok  the s15 sensor wake: one cue on its beat, the seeded buffer, alone in foley.wav for its window; none on the neighbor
  ok  the two blindRattles are one seed and gain, sample-identical in foley.wav
  ok  the two penUncaps are one seed and gain, sample-identical in foley.wav
  ok  the two phoneBuzzs are one seed and gain, sample-identical in foley.wav
  ok  every bed cue with a length sounds at both ends of its own span      (43 bed cues)
  ok  voices and foley are deterministic and finite
  ok  every foley sound renders, deterministic and finite
  ok  the two lamp clicks are identical within ±1 LSB in out/audio/mix.wav (over the first 0.17 s)   max diff [0,0] LSB
  ```
- [x] Loudness: `evidence/snd-g4/loudness.txt` (ffmpeg `ebur128=peak=true` on the final `mix.wav`): **I −15.9 LUFS, true peak −4.8 dBFS**, LRA 20.0 LU. Target −16 ±1 and ≤ −4: met. `mix.mjs` now throws if a full mix misses it.
- [x] `evidence/snd-g4/cues.txt`: 192 cues and the score's events (groove notes included), sorted by time, with beat+offset. `NEW` marks a doc 05 "new" G4 sound (76 rows). `NEW-CODE` marks something doc 05 already described but no code played until now (47 rows: gulps, shrinks, the resolution, the test's notes, the dissolve's note).
- [x] Two mixes hash identically: `mix.wav` `8c97f322…e144` in both `hashes_run1.txt` and `hashes_run2.txt`, and all three stems match too.
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 58 beats, 195.0s)`
- [x] Refactors that touch existing sound were checked by hash. `penScratch` (moved into `scratch()`) and `musicBox` with `vib: 0` give bit-identical output to before (4 and 3 cases).
- [ ] **Not listened to.** Nothing in this pass was heard. The checks are the spectrogram (`spectrogram.jpg`, which I looked at), the hit times in `solo.txt`, and the selftest.

## Gaps
- **The balance moved toward the music.** At the old makeup (5 dB), the 3:15 premix's peak-to-loudness ratio was 12.7 dB. Linear loudnorm at −16 / −4.5 allows 11.5. I raised `MUSIC_MAKEUP_DB` to 7.5 (7 measured 11.55, 7.5 measured 11.24). Quiet score passages now sit up to 2.5 dB louder against the foley the director praised. Someone needs to check this by ear. The margin is only 0.26 dB, and if a later cue breaks it, `mix.mjs` throws with the PLR in the message.
- **New: a master safety limiter.** Its ceiling is the lamp click's own peak, so the click stays the loudest transient as doc 05 asks. It was active for 6.35 s of the film, worst −1.33 dB at 56.7 s (gulp 3 on the groove). The other places are s02's landing, s05, s06, the s07 blinds, 1:17, and s18's X (`master_limiter.txt`). The lamp clicks pass untouched (selftest ±1 LSB, measured 0).
- **Stale docs outside my owns:** doc 05 §Mix still says −14 LUFS / −1 dBTP. `docs/contracts.md` §audio (a contract file) still says the sensor wake is cued twice, says −14 LUFS, and lacks `musicBox`'s new optional `vib, vibHz, vibUntil`. Both need a `contract-*` task.
- **`check_timeline` doesn't catch broken cue names.** It printed `ok` while `cues.js` threw `unknown beat: nextSemester`, although its doc line says "every beat/cue resolves". Not mine to fix.
- **Where I chose because the spec was silent or split (all easy to move):**
  - The motif "resolves at the grade": the music box doubles the theme's first four notes (C E A G, in tune) on `gradeReveal`. The theme then lands on C at `blobAbsorbed − 1.5`, held through the dissolve.
  - The test's solve note is E over C/E. It leans home but doesn't land, so the landing stays the grade's.
  - s06 blips start at local 4.5, from the action (taps from 4.0, skipping gulp 2's frame), not at `lampOffHome + 0.17` as the s06 Sound line says.
  - s07 has no blips on the picture's taps at 6.67 and 7.17, because its Sound section limits them to 4.0–5.5 and from 9.0.
  - The exam room's clock is its own bed, so it keeps ticking through the −6 dB dip. It drops −12 dB at 174.0, not 173.5, to stay on whole seconds.
  - The cough is at `examRoom + 1.6`. The examHush segments overlap by 50 ms.
  - blind2 cuts the music for 0.48 s, so gulp 4's onset isn't inside the gate's fade-in.
  - The s16 replay spacing is 0.33 s, and its last note is off by 23.98 s per s16 (its room tail rings about 1 s into Quiet 2, as it did before).
- **Kept as they were (re-time only):** the Marston sub swell (s09 says no sub), s09's `roomTone` standing in for the night bed, and mono output.
- **Unplaced but kept in `foley.js`:** `thumbFlick`, `scrollTick`, `ladderCreak`, `curtainSwish`, `nightHum`. The laptop, the roller blinds and the cut Button removed their cues.
- **Not verified on the spectrogram:** the blind ratchet's rising pitch is not clearly visible. Its clack lands at 0.200 s (`solo.txt`).
- No caption file (doc 05 §Mix accessibility); it was not in the brief.

## Story
I started with the error, not the music: `unknown beat: nextSemester`. The shortcut was to alias the seven dead beat names. I didn't, because the point of hanging sound on beats is that a re-cut moves it. So every cue was re-hung on whatever beat the G4 specs name. The first full mix after that failed on loudness: the premix ratio was 13.26 dB, and the old mix needed at most 12.5.

The new sounds had to be "odd and so animated", made by something that can't hear them. I copied what the old sounds do rather than invent a new style. Each is a few seeded-noise filters and sines plus one physical joke you could point at. The phone motor wobbles and the phone skitters once just before it stops. The clock tocks lower every other second. The marker's squeak glides up and down around the circle. Then I checked them the only way I could. `solo.mjs` renders them back to back, and I read `spectrogram.jpg`: the gameBlip power-up shows as two stacked lines, the clock ticks sit on whole seconds with two slap echoes, and the marker's circle is a visible arch. I can't vouch for the timbre, only the shapes.

The loudness work had a real bug of mine in it. I added a limiter capped at the click's peak, and the premix still peaked at −3.5 dB, above the cap. One debug print showed a cap of 0.706 instead of 0.565: `CUES.find(c => c.beat === 'lampClickHome')` had found the paper-boil bed that restarts on that beat, not the click. After matching on the sound name, I swept the music makeup through 5, 7, 7.5 and 8 and took the smallest that went linear. The cost is in Gaps: the music now sits a little louder against the noises the director liked, and nobody has heard it yet.

## State
built · 2026-10-15

# Done · v11-home

## What shipped
s02–s06 on the v11 size table: the blob is born a drop (r 0.005) and gulps on every act of procrastination at home, 0.005 → 0.010 (s03 `gulp1`) → 0.015 (s04 `gulpFridge`, new) → 0.022 (s05 `gulpGame`, new) → 0.030 (s06 `gulp2`). Each gulp is s03's gulp1 drawing for drawing (squash 0.3 eyes closed one drawing before, snap stretched −0.2, settled in 0.25 s, wobble 0.8 for a second), with v9's `plead` after it. Shadows follow from the lights; where the bigger body broke a set-up (s05's snout, s06's lamp), the staging moved, not the timing.

**New beats (local / global):**
- `gulpFridge` · s04 local **5.5** · global 34.5 (third fridge open)
- `gulpGame` · s05 local **6.0** · global 42.0 (1.0 s clear of s06's lamp click at 43.0)

**Per shot:**
- **s02:** `BLOB_R.start` 0.005. Bead, run and perch stay mesh scales on it, so the birth plays at 0.42 of v10's size; `LIP_Y`, the hop arc (8 → 3.3 mm) and the glint scale with it. Camera, timing and acting unchanged.
- **s03:** `{ start: 0.005, gulp1: 0.010 }`. Light kept at v10's S 3.6: shadow 1.5 → 3.0 units (v10 3.6 → 5.4).
- **s04:** `{ start: 0.010, gulpFridge: 0.015 }`, the gulp on the third open; it replaces v9's blink at 5.5, `plead` 5.67–6.17. Marks kept at v10's (solved for r 0.018): 2.2 → 2.5 → 2.9 units, 4.3 after the gulp.
- **s05:** `{ start: 0.015, gulpGame: 0.022 }`; replaces v9's blink at 6.33, `plead` 6.17–6.67. On the snap the contact slides 8 mm left (right edge fixed) so the bigger body clears his snout. Mark kept: 6.7 → 9.8 units; the loom's top now runs off the top of the wall.
- **s06:** `{ start: 0.022, gulp2: 0.030 }`. Mark z 0.0159 → 0.0142 so the loom keeps v10's 6.8 units after the gulp (5.0 before). Lamp h 0.064 → 0.076 (its mouth must clear the 0.044-tall blob) and x 0.020 → 0.012 (at 0.020 the chain's bead sat inside the blob's outline).
- A v11 block at the top of `docs/shots/s02.md` … `s06.md`.

## Where it lives
Branch `worktree-agent-a30ca6d16f1780449`. Commits: 1182985 (s02), 6a7eca1 (s03), 03b4d0d (s04 + timeline), df4153c (s05), 5d428c6 (s06), a8cdeab (docs), then this note and the evidence.
Files: `src/shots/s02.ts`–`s06.ts`, `src/timeline.ts` (s04's and s05's rows), `docs/shots/s02.md`–`s06.md`, `evidence/v11-home/sheet.jpg`, `evidence/v11-home/checks.log`.

## How it was checked
- [x] `evidence/v11-home/sheet.jpg`, one row per shot: s02 the perched drop in the insert (15.5), the swelled drop (17.2), the drop beside him at full frame (18.9); s03 4.5 (insert), 5.42 (before, wide), 7.0 (after); s04 5.33 / 5.75 / 6.5 (before, after with `plead`, settled); s05 5.83 / 6.33 / 6.9 (before, after with `plead`, settled); s06 2.5 (lamp on, him and the blob both whole), 3.0 (before), 4.33 (after). Every row has a frame with him and the blob both whole.
- [x] Determinism, one time per changed shot, one Chrome each (`evidence/v11-home/checks.log`): t=17.2, 24.5, 34.5, 42.0, 47.0 → `PASS` (3 identical hashes each).
- [x] `node tools/check_timeline.ts` → `ok (27 shots, 93 beats, 228.0s)`, with `gulpFridge local 5.5 global 34.5` and `gulpGame local 6.0 global 42.0`.
- [x] `npm run typecheck` → clean (`tsc -p tsconfig.json`, no output).
- Every render went through a gate (≥ 25% free by `memory_pressure -Q`, no other headless Chrome except the long-lived 9333 one), one page per Chrome, each sheet's times within 6 s, `--w` ≤ 800.

## Gaps
- **Audio isn't wired** for `gulpFridge` and `gulpGame` (not mine: `src/audio/*`). For whoever wires it: cues.ts already has controller clicks at `gameNight` +5.4 and +6.0, so `gulpGame`'s swallow lands on a click.
- **s06's chain pull never reaches the bead,** in v10 and v11 alike: `seatReach` can't get his hand from the chair to the bead (v10 frame at 43.5 checked against v11's crop). I made the bead visible beside the blob but didn't re-stage his reach.
- **s06 after the gulp:** the 2.5× body stands in front of his snout. Its plane (z 0.0142) really is nearer the camera than his head's (about 0.012), as v10's 2× was. It reads as standing in front of him, not as a clip, but I didn't move it behind him: that would shrink the loom below v10's.
- **s05's loom (9.8 units) runs off the top of the wall** after the gulp. I kept it because the beat sheet allows the set to cut it off. Its eyes stay on the wall.
- s04's 1.25× body overhangs the stool seat a little. I left it.
- s05's renders log two `404`s. They come from the unfrozen `apt_furniture_sheet` / `apt_props_sheet` proxies (s05.ts's own header says so). I didn't touch them.
- Only sheets and crops were rendered, never a motion strip, so the snaps between drawings are checked on stills only.
- Not checked by me: the v11-night builder's s07 starts from s06's r 0.030, which the table requires.

## State
built · 2026-10-20

## Story
I started by pulling ten frames of v10 out of the 720p master with ffmpeg rather than rendering. That gave a picture of what the old sizes looked like without spending a Chrome. Two things in it mattered later. s06's desk is narrow, and the 2× blob already hung off its right end. And s06's lamp chain was never reached by his hand.

The first pass was mostly arithmetic. The radii came off the table. s04's and s05's marks had been solved to hold fixed shadow units, so changing the radius would have silently moved the blob. I pinned those marks to their v10 values instead (`V10_R = 0.018`). The look sheets (one gated Chrome per shot, 1.1–4.7 s a frame) showed s02's drop reading fine at full frame and s03 and s04 reading fine too. Two shots broke.

In s05, grown about its centre, the 1.8× body ran into his snout. Letting it grow away from him, with its right edge fixed, fixed it in one line.

s06 broke twice. The 1.8× body stood taller than the lamp's mouth, which is exactly the side-lit failure v3 had documented, so the lamp grew. Then a crop of the pull showed his hand stopping short with the bead hidden inside the blob, so it looked like he was poking the blob. Moving the lamp left put the bead back in the gap. A v10 crop then showed his hand never reached the bead there either. I wrote that up as a gap rather than chasing it.

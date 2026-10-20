# Done · v3-readability

## What shipped
Changes in pictures and timing for every cold-viewer failure in the brief. Beat times did not move (`check_timeline` ok). s03's shadow now swells with the screen as the lid lifts. s06's lamp hangs over the blob and the lit wall is clean. In s15 his reach is visible and lands just before the wake. s12 pushes in slowly. s17's windows go from night to gold. s11's lit desk reads, and s08 shows him in profile.

## Where it lives
Branch `task/v3-readability`: `d21d1c9` (s03, s06), `0e028e3` (s15), `1d8c54a` (s12), `618ad1d` (s17), `9146b20` (s11), `286857e` (s08), `5e6c934` (evidence). Code: `src/shots/s03.js` (it also exports `screenHalo`, which s06 imports), `s06.js`, `s08.js`, `s11.js`, `s12.js`, `s15.js`, `s17.js`. I didn't touch `s10.js` (see P4). Evidence: `evidence/v3-readability/`.

## What a cold viewer would now see, per priority
1. **The rule (s03, s06).** In s03 the screen lights the moment the lid cracks. The light rides the lid up toward the wall, and the shadow climbs and swells with each drawing of the lift. It grows from nothing at 20.5 to full by 21.0, with the glowing screen and the wall in the same frame, then holds 3.5 s until the gulp (`rule_s03.jpg`, rows 1–2). In s06 the lamp's shade now hangs right over the blob's head. On the click the big wall shadow vanishes in one frame and the wall stays clean for 2.5 s. On the off the shadow springs back from the glowing laptop (`rule_s06.jpg`). The loom used to leave a ghost with eye holes on the lit wall; that's gone.
2. **The turn (s15).** He is no longer a black shape in the loom. He stays still for two drawings, swings his arm up high and brings it down on the pen at 108.417. The relay clacks two frames later at 108.5, the light stutters on, and the loom is gone by 108.6, leaving a small pool under the blob. The lit wide holds to 110.5, then pushes slowly in to the blob and his face by 117 (`turn_s15.jpg`). The light and he are in the same frame throughout, so I didn't add a cut.
3. **Stalls.** s12 pushes in over its whole 10 s: from a wide that holds him whole, the blob and the loom's top edge, to his face and the blob's eyes, so the shadow closes over the frame. He doesn't move (`s12_before/after.jpg`). In s17 the panes start as night and warm to a textured gold (`s17_after.jpg`). The brown foreground figure is gone, and the white strip is now gold paper.
4. **Dark frames.** s11 at 80.5/82 went from luma 16.9/21.0 to 29.5/33.1. The gator, desk, chair and backpack read, and it's still night (`checks.txt`, `s11_before/after.jpg`).
5. **s08.** He's the profile rig sitting up against the pillow: long snout, hoodie above the covers, laptop on his lap. The cast is warmer (`s08_before/after.jpg`).

## How it was checked
- [x] Before and after sheets at the same times for each shot touched: `sNN_before.jpg` / `sNN_after.jpg` for s03, s06, s08, s11, s12, s15, s17. I looked at all of them, plus full-res crops along the way.
- [x] `rule_s03.jpg` (every 2 frames, 20.33–21.33, then the hold and the gulp), `rule_s06.jpg` (every 2 frames over the click and the off, then the gulp), `turn_s15.jpg` (the end of s14, then every 2 frames over 108.0–108.92, then the hold and the push). Source and shadow are in frame together in every cell.
- [x] `node tools/check_timeline.mjs` → `ok (21 shots, 58 beats, 195.0s)` (`checks.txt`)
- [x] `node tools/determinism.mjs --t=20.75,43.5,64,82,91,108.6,156` (one time per shot touched) → all PASS (`checks.txt`)
- [ ] **Not verified with a real cold viewer.** The "a cold viewer would now see" lines above are my own judgement from the strips. Only a fresh viewer on a motion render can confirm them.

## Gaps
- **s06's lamp is taller than s02/s03's** (h 0.064 against `DESK.lamp.h` 0.044, moved to x 0.020 behind the blob). That partly reverses v3-fix-home's lamp fix, but in s06 only. At 0.044 the lamp's mouth sat level with the blob's top, so it lit the blob from the side and no pool could form. `DESK` belongs to s02, so I left it alone. The two lamps differ across the s03→s06 gap, which is another night. The real fix is a desk-scale architect lamp asset.
- **s06's pool is hard to see.** The camera sits only about 7° above the desk, so the pool on the desk top is a thin band. What reads is that the wall goes clean under a lamp right above the blob.
- **s03's shadow is bigger than v3's.** v3 lit from the closed lid's centre (the light was computed before the lid opened), so in practice it threw about S 2.5, not the 4.33 its notes claim. It now throws the 4.33, and the camera pulled back (`CAM` z 0.40 → 0.47) to fit the gulp. The s03 spec and README §1/§4 numbers are stale: docs aren't mine.
- **s15:** the press moved from drawing 6 to drawing 5, so the wake lags his hand by two frames, and the push starts at 2.5 instead of 5. The s15 spec's K-table and camera section need updating. s14's timeout chatter just before s15 still looks like s15's wake stutter. s14 isn't mine.
- **s12 is no longer a locked shot** (spec: fully locked; the brief asked for one development). **s17's grade no longer crossfades to `dawn`.** It holds s16's `amber`, because the crossfade cooled and washed out the room. The foreground sleeper and its desk are gone (the spec lists them).
- **P4:** ~72 s is s09, not mine. It already measures 45.9 after v3-fix-marston. I measured s10 at 51.2 and didn't touch it. s11 after the timeout (85.3, about 31) is dark by design.
- **s08:** his hands sit roughly at the laptop. I didn't re-solve the reach. In the wide he's large for the bed.
- **s17's blob is still tiny in the wide.** Its shrink isn't the change here: story rules allow shrinking only on solved problems.

## Story
I started from the cold viewer's two failures and found a bug behind the first. In s03 I wanted the shadow to swell as the lid lifts. Once I lit the screen from the moment the lid cracked and made the light follow the screen's real position, the final shadow came out far bigger than v3's. v3 had computed the light before the lid opened, so it always lit from the closed lid's centre, about S 2.5 instead of the 4.33 its notes claimed. Opening the lid moves the screen 5 mm toward the wall, so honest optics swell the shadow with the lift, which was exactly what the brief asked for. I pulled the camera back so the gulp still fits (`rule_s03.jpg`).

s06's problem was geometry, not exposure. The lamp's mouth sat level with the blob's top, so it lit from the side, the pool never formed, and the screen at 0.05 left a ghost of the loom's eyes on the lit wall (`s06_before.jpg`). A taller lamp standing behind the blob fixed both. That partly reverses an earlier fix, so I kept it to s06 and wrote it down.

For s15 the dense strip of v3 (`s15_before.jpg`) showed the real issue: in the dark he was nearly black (fill 0.003), so no reach could read. I raised the fill along with re-pacing the reach. A full-res crop then showed the lift only reached his chest, so it went higher (`turn_s15.jpg`). s17's "blown strip" turned out to be partly the grade crossfade, which cooled the whole room. Turning the pane glow down from 0.38 to 0.18 left the band at 211. The brightness came from the sun lighting the tissue, and darkening the tissue's colour brought it to a textured gold at 202 (`checks.txt`).

## State
built · 2026-10-16

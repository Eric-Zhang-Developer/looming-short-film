# Brief · fix-bedroom (fix round 1: the decision, bed rot, 3 a.m.)

**Type:** builder (fix round) · **Wave:** 6 (v4) · **Model:** given at dispatch · **Time box: committed by 18:00 today** (the final is due 23:59; the master render follows this round)
**Read first:** `AGENTS.md`, `evidence/cold-v4/report.md` (all of it: your spec is what a first-time viewer could and couldn't read), `docs/notes/v4-fixlist.md`, `docs/02-story.md` (s07–s09a and the acting map), `docs/shots/s07.md`, `s08.md`, `s09a.md`, `done/climax-a1.md`, `src/shots/s07.js`, `s08.js`, `s09a.js`, `src/characters/acting.js`, `docs/shots/README.md` §12. Look at `evidence/cold-v4/sheet_03.jpg` and `sheet_04.jpg` (0:48–1:34 of the cut).

## Goal
The director: "the keystone decision in my life … is to go to the library … I'm super scared but I made the decision." The cold viewer saw the film's rule clearly but **never saw him decide**: "the film cuts from lying awake at 3:00 straight to standing packed … I never see him decide." Make the decision the clearest moment in the bedroom, and make bed rot read as plainly as the director asked ("really obvious and really plain").

## Owns
`src/shots/s07.js`, `s08.js`, `s09a.js`; `evidence/fix-bedroom/`; `done/fix-bedroom.md`

## Frozen (do not change)
- **Every beat time in `src/timeline.js`**, shot starts and durations. The sound (`src/audio/`) is built on them: the breath in at 71.75, the resolve at 73.0, the lamp click at 74.0 are heard. Picture changes must land on the same beats.
- `ROOM`, `ROOM.LAMP`, `ROOM.NIGHTSTAND`, `ROOM.SHADE` exports in s07.js (s09b and others read them), and `tools` imports from s02.
- No other files. If a fix needs a sound change, write it in the done note; don't make it.

## Fixes, in priority order (stop at the time box; the first two matter most)
1. **s09a: the decision is on his face.** The C4 close-up (1.5–4.25) reads as "an extreme close-up of the blob's huge eye looming over his body". Re-frame C4 on **his face**: the painted `dread` head (lying, snout-up as now), the eyes close for the breath, then the painted **`resolve`** head reads clearly, held at least 1 s before he sits up (cheat the sit-up later within 3.5–4.25 if needed, not the beat). The blob may be at the frame edge (one eye) or off frame; it must not dominate. Then **the lamp click is a visible beat**: his hand reaches into frame to the nightstand lamp and the warm light hits his face on 74.0, so cause and effect are both seen. The viewer must be able to say "he decided" from the frames at 72, 73 and 74 alone.
2. **s07: plainly in bed on his phone.** "His face and body are under the covers, so I can't tell whether he's on his phone"; "the ceiling ellipse reads as a UFO or ceiling fixture". (a) His face and the phone must be visible in the wide: phone in both hands, screen glow on his face from below, the painted `numb` head where it's a close framing. (b) **One cut in**: a medium or close on the phone and his face (the scrolling thumb) for 3–4 s inside the 12 s, so it isn't one repeated wide. (c) The ceiling shadow must read as the blob's: the blob, its shadow and the phone glow in one frame, with the shadow's shape clearly the blob's (round body plus the eye holes), not a flat ellipse. Keep the gulp at 55.5.
3. **s08 darker than s07.** 3 a.m. is the bottom: measured mean luma clearly below s07's (it's 68.17 vs 68.18 now). Target at least 20% lower, faces still readable.
4. **s09a after `lampOn` reads as night.** At 1:14 "the light looks like day". Keep the lamp warm but low and local (falloff to dark corners), and keep a dark window in frame.

## Acceptance
- [ ] `evidence/fix-bedroom/before_after.jpg`: the cold viewer's frames (48–76 s every 2 s, from `evidence/cold-v4/`) against yours at the same times
- [ ] `evidence/fix-bedroom/decision_strip.jpg`: every 4th frame from 71.5 to 75.0 (the breath, the resolve, the sit-up, the lamp click)
- [ ] s08 vs s07 mean luma, measured and stated
- [ ] `node tools/check_timeline.mjs` ok; determinism passes for s07, s08, s09a; one frame each of s09b and s02 still builds
- [ ] Done note ends with `## Story`

## Machine and git
One headless Chrome at a time, foreground, `--w ≤ 960`, closed after use (another builder renders in parallel). Sheets and strips only, in your worktree's `out/`; delete frames once the jpg is made. Stay inside your worktree. Commit on `task/fix-bedroom` with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push, merge or open PRs.

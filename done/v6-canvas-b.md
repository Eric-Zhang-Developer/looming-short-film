# Done · v6-canvas-b

## What shipped
Each gulp now has a cause on screen: a light-mode Canvas reminder arrives, he swipes it away, and the blob gulps on the swipe (s03 23.5, s06 44.0, s07 55.5). At 3 a.m. (s09a) the reminder comes once more and he taps it open on `phoneFaceDown` (70.5). It expands into the exam's detail, he breathes in (71.5), and he turns the phone face down at 72.75, in the wide. Every banner reads through a short insert of the screen, and the cut back to the wide falls on the gulp's frame. There is one chime for all four arrivals and a soft flick on each swipe.

## Where it lives
- `src/shots/s03.js`: `reminderInsert()`, the shared insert (frame-unit layout in front of the shot camera, depth-test off, drawn last; the phone or laptop, the banner, the thumb), and s03's laptop insert at 3.25–4.5.
- `src/shots/s06.js`: the phone on the desk lights at lampOffHome, and the insert runs 3.167–4.0.
- `src/shots/s07.js`: the insert runs 6.25–7.5 and the swipe goes up.
- `src/shots/s09a.js`: the To-do insert 0–1.5 (tap and open), C4 1.5–2.5 lit by the phone, C3 2.5–3.0 with the phone face down at 2.75, then C4 from 3.0 as before.
- `src/audio/cues.js`: the chime, the flicks, the tap, and the moved card tap.
- `docs/02-story.md` (the s03, s06, s07 and s09a lines) and a v6 block in `docs/shots/s03.md`, `s06.md`, `s07.md`, `s09a.md`.
- Commits on `task/v6-canvas-b`:
  - `97f198c`: s09a tap, with a stand-in module
  - `a60879b`: the s03, s06 and s07 inserts
  - `e7a68d3`: cherry-pick of v6-canvas-a's `f5da680` (src/props/canvas.js)
  - `905a082`: switched to the module, stand-in deleted, cues added
  - plus the docs-and-note commit after it

## How it was checked
- [x] `evidence/v6-canvas-b/gulps.jpg` (400 px frames). Each gulp row shows −1.0, −0.5, the swipe (−0.16), the gulp (0) and +0.5: s03 at 22.5, 23.0, 23.34, 23.5, 24.0; s06 at 43.0, 43.5, 43.84, 44.0, 44.5; s07 at 54.5, 55.0, 55.34, 55.5, 56.0. The banner text (`Calc 2 Exam`, `Starts in N hours`) is legible at 400 px.
- [x] `evidence/v6-canvas-b/tap.jpg` shows s09a every 0.5 s from 70.0 to 74.0: the banner over the To-do list, the thumb and the open, the detail (`Calc 2 Exam`, `EXAM`, `Tomorrow 9:00 AM`), C4 lit with eyes open and then closed, the wide lit with the ceiling shadow at 72.5, then the resolve in the dark at 73.0 and 73.5, and the lamp at 74.0.
- [x] `node tools/check_timeline.mjs` → `ok (22 shots, 73 beats, 201.0s)`
- [x] `node tools/determinism.mjs --t=23.5,44.0,55.5,71.0` → all PASS. A second run at `--t=22.8,43.6,70.5` (mid-insert) also passed.
- [x] `npx tsc --noEmit -p .` is clean.
- [x] `node tools/mix.mjs` → `integrated -15.9 LUFS  true peak -4.7 dBTP`. In `node src/audio/selftest.js` every test passed: the lamp clicks are still identical, the phoneBuzz pair is still 2, and the ticks are on whole seconds.

## Gaps
- **s06's banner reads about 0.6 s, not ≥ 1 s.** The lamp-off and the loom's spring-back (3.0–3.167) keep their wide, and the gulp is at 4.0. It reads in the sheet, but the time is short.
- **The gulp anticipation frames fall inside the inserts.** These are s03's 4.417 squash and s07's 7.417 squash. Each cut back lands on the gulp's snap.
- **s03 shows no hand on screen.** The flick is a trackpad swipe and the banner just slides right. The laptop insert scales the game texture up, so it reads as flat teal with one platform.
- **s07's clock glance is cut to 6.0–6.25 in the wide.** The buzz pulls him back to the phone.
- **The phone on the desk in s06 (3.0–4.0 in the wide) is a plain pale screen with a halo.** It carries no banner, because at that scale one wouldn't read.
- **I didn't use the module's banner-on-screen for s03, s06 and s07.** `todoScreen()` always draws the To-do list, and he isn't in Canvas there. Those three shots put the module's `banner()` card on their own plane over the game, the lock screen or the feed. Only s09a uses `todoScreen().set({ banner, open })`.
- **The insert is drawn over the scene in front of the camera, not as a separate setup with its own background.** A dim backdrop card fills the frame behind the device.
- **I moved `phoneFaceDown`'s card-tap cue to +2.25, where the phone actually goes down.** A tap on glass (scrollTick) now sounds on the beat.
- **COUNTDOWN is the module's table.** s06's 10 hours rests on v6-canvas-a's assumed 11 p.m.
- **Not checked:** a full-speed watch of the cuts. I looked only at sheets.

## Story
The order was the s09a tap first, then s07, then s03, then s06. The module didn't exist yet, so I put a stand-in banner in s03.js next to `screenHalo`, the file the other shots already import from. The first question was how a banner on an 8 mm phone could read at 400 px. I settled on one insert for all four. It is a group in frame units, scaled to the camera's frustum 6 cm out, drawn last with depth-test off, so it frames the same behind any shot camera and its depth still sits at the focus I give the DOF. The first s09a sheet worked on its first render. The s03 sheet looked broken until I saw that I had read 23.5 as s03's local time. The frames I asked for were wrong, not the shot.

The real decision in s09a was where the phone goes down. The shot was built on one frame: the phone turns and the ceiling shadow dies, in the same shot. The tap now takes 0.5, so I moved the face-down to 2.75 and gave it a half-second of the wide, between the breath in close-up and the resolve.

The module arrived mid-s06 with a different API (the banner drawn inside the To-do screen). That fits the tap, because opening the banner is opening Canvas, but it doesn't fit the swipes. So only s09a uses the screen. The audio selftest pins phoneBuzz to exactly two uses, which is why the reminder got its own two-note chime. The same sound four times seems right anyway. s06 is the one I'm least happy with: about 0.6 s of banner, squeezed between the lamp-off and the gulp. See `evidence/v6-canvas-b/gulps.jpg`.

## State
built · 2026-10-19

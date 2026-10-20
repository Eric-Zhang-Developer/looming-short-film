# Done · v7-bed

## What shipped
s07's doom scroll is now **H**, a head-on cheat set built by `headOn()` in `src/shots/s07.js`. The blob sits big and dark in the foreground, its back to us, with a thin rim in the phone's colour. He lies propped on the pillow (`front` rig), blanket to the chest, the phone a dark slab on his chest lighting his face from below. He's numb and half-lidded. Behind him are the nightstand (lamp off), the clock (~1:45) and the calendar's red circle. Each REELS flick turns the phone's colour (cyan, violet, green, pale cool white). The new cut is H 0–6.25, the v6 insert 6.25–7.5, the side-on wide W 7.5–8.5 for gulp3 (the rule), then H to 12 with the silhouette at 2.5×. s08's C3 (7–10) is H at 3 a.m.: cold cyan, clock at 3:00, `dread` with the sweat, still.

## Where it lives
- `src/shots/s07.js` (`headOn()`, `HUES`, `hueAt`, `H_CAM`, `H_FOCUS`, `WALL_HUE`, the new `build`; `bedroom()` untouched), `src/shots/s08.js` (C3 → H; the blob blink dropped), `docs/shots/s07.md`, `docs/shots/s08.md` (a v7 block at the top of each).
- `evidence/v7-bed/`: `h_first.jpg`, `h_first_v0.jpg`, `s07_sheet.jpg`, `s08_sheet.jpg`, `hues.jpg`, `glance.jpg`, `determinism.txt`, `s09a_hashes_before.txt`, `s09a_hashes_after.txt`, `check_timeline.txt`. `preview.mp4` is on disk but **not committed** (see Gaps).
- Branch `worktree-agent-a316c2146b6609752`: `7648a74` (H in s07), `88a3c53` (s08 C3 → H, fourth colour), `c3e50f9` (docs), `2745b3a` (orchestrator review: colour on him only, camera in), `5b5d792` (evidence), plus the commit for this note.
- No cue changed: the cut needed no sound moved. `REELS`, `s09a.js` and `timeline.js` are untouched.

## How it was checked
- [x] `h_first.jpg`: H at s07 2.0 (global 50.0), 1920 wide. The first stand-up is kept as `h_first_v0.jpg`. I checked the face on it before building further: half-lids, pupils meeting on the phone, the snout lit from below. That render also showed the bugs I fixed next: the phone slab floating 2 cm in front of him, the blanket hidden, the clock clipped by the blob. `h_first.jpg` is the same frame on the final staging.
- [x] `s07_sheet.jpg` (48.0–60.0 every 0.5 s) and `s08_sheet.jpg` (60.0–70.0). Both re-rendered after the orchestrator's review. Looked at: H, the insert at 54.5/55.0, W at 55.5/56.0 with the ceiling shadow, H at 2.5× from 56.5, and s08's H from 67.0.
- [x] `hues.jpg`: H one drawing after each flick (48.584, 51.334; 56.5 is H's first frame after the 7.75 flick, which falls inside W; 58.084). Four distinct colours on his face, the phone's edge and the rim. The wall stays cyan with about a third of the colour.
- [x] `glance.jpg`: clockGlance face crops at s07 5.917 / 6.0 / 6.083 / 6.167. Pupils on the phone, then down-right to the blob for two drawings, then back.
- [x] `preview.mp4`: 46–72, 960×540, 26.0 s, 1.0 MB, muxed with `out/audio/mix.wav` from `node tools/mix.mjs --range=46:72` (`range 46:72 s premix -17.49 LUFS, -7.34 dBTP → loudnorm linear`; `mix.wav integrated -15.6 LUFS true peak -5.9 dBTP`). The audio is not silent: volumedetect over 48.5–56.5 gives `mean_volume: -18.1 dB`, `max_volume: -5.8 dB`. No missing-clip warning from mix.mjs. **I haven't listened to it.**
- [x] s09a hashes unchanged. Before my first edit (`s09a_hashes_before.txt`) and at the end (`s09a_hashes_after.txt`), byte-identical files:
  ```
  t=70.5  f201b31c32860a7c f201b31c32860a7c f201b31c32860a7c  PASS
  t=72.5  a3d6542ac882256e a3d6542ac882256e a3d6542ac882256e  PASS
  t=74  85da56d0d7dd651d 322f52c10068b94c 85da56d0d7dd651d  FAIL
  ```
  74.0 fails the tool's reverse-order pass, and it already did **before** any edit. All three of its columns match across before and after (see Gaps).
- [x] `node tools/determinism.mjs --t=50,55.75,58.084,66,68` (s07: H, W, H at 2.5×; s08: C2, H): all PASS, `determinism: PASS` (`determinism.txt`).
- [x] `node tools/check_timeline.mjs` → `ok (22 shots, 73 beats, 201.0s)`, exit 0.
- [x] `npx tsc --noEmit -p .` → no output, exit 0.

## Gaps
- **Branch base.** The worktree was cut from `main` (12862a4), which doesn't have this brief or any v6/v7 code. With no commits on it yet, I reset the branch to `wave/3-assets` (d34e510, where the main checkout is and where `tasks/v7-bed.md` lives). Merge into `wave/3-assets`, not `main`.
- **`preview.mp4` isn't committed.** It is muxed with the director's Reels clips, third-party audio the repo keeps out of git (cues.js REELS comment). I committed it once by accident and amended it out of my last unpushed commit. No ref contains it (`git log --all -- evidence/v7-bed/preview.mp4` is empty). It sits untracked at `evidence/v7-bed/preview.mp4`. `.gitignore` isn't in my owns: someone should ignore `evidence/*/preview.mp4`, or this file will show as untracked at merge.
- **Swap rule broken once.** The first `hues.jpg` render started with 0.43 GB free swap, because I ran the check and the render in one command and didn't stop on the reading. After that, every render went through a script that waits for ≥ 1 GB free. That file was re-rendered after the review anyway.
- **s09a at 74.0** isn't deterministic under reverse order (85da56d0 forward, 322f52c1 reverse), before and after my change, same hashes. The brief names 74.5 as the known order-dependent frame; 74.0 has it too. I didn't touch it (s09a isn't mine).
- **The arms.** The front rig has no front-view arms: they are the side arms turned 90°, foreshortened to 0.45 and angled up to the phone. In the close H frame they read as bulky grey sleeves, close to mittens. A front-view forearm/hand piece would fix it (asset or rig work, not mine).
- **dread's eyes in H.** The worried take with its sweat drops, mirrored as a pair, puts the pupils slightly apart. It reads as worried at sheet size; not checked further.
- **Calls the spec left to me (reversible):** the four colours (the fourth is a pale cool white, because lemon read olive and too close to the lamp's amber). Before the first flick (48.0–48.5) the phone shows the fourth reel's colour, so the feed reads as a loop. `WALL_HUE` 0.3: the room gets 30% of a reel's colour, his face 100% (orchestrator's "at most about a third"). W's spot gets 30% too, so the 7.75 flick shows on the ceiling in W, but W's on-phone glow texture stays cyan. The blob blink in s08 is dropped, not moved.
- **Framing at 2.5×.** In H the blob's top is cropped by the frame at 2.5× (it stays in frame at 2×). The calendar's red circle and the clock stay clear of it in every H frame I looked at.
- **The thumb flick in H** (the near arm +4° for one drawing) wasn't checked with a strip. On the foreshortened arm it is probably too small to see. The colour change is what carries the flick.
- **s08 → s09a.** The cut at 70.0 was invisible (same camera) in v6. Now it goes from H to s09a's phone insert. s09a is unchanged per the brief, so this was left as is.

## Story
The first thing I found was that my worktree didn't contain the brief: it had been cut from `main`, 241 commits behind. The brief was in `c166d80` on `wave/3-assets`, so I moved my empty branch there and hashed three s09a frames before touching anything. 74.0 already failed the determinism tool's reverse pass,, so I knew not to blame myself for it later.

The design decision that made everything else small was not to re-stage the side-on bedroom for a second lens. s09a imports `bedroom()`, so any change there would ripple into a shot I don't own. H became its own little diorama three metres away, where none of the bedroom's lights reach.

The first full-width frame (`h_first_v0.jpg`) taught me more than the plan. The face worked: the face sheet's half-lid eye, mirrored as a pair, happens to put both pupils on a phone held at his chest, which is the deadpan for free. Drawing that same eye twice without the mirror gave the glance at the blob. Everything else was wrong in visible ways. The phone hovered 2 cm in front of him because I had offset it twice. The blanket hid under the bed plane. The blob's painted highlight showed as a dark eyebrow on its back.

The orchestrator's review caught what I had stopped seeing: full-strength reel colour on the wall read as party lights, and he was small over a dark band. Splitting the light so his face takes all the colour and the wall a third fixed the first. Moving in fixed the second, but it pushed the red circle under the 2.5× blob, which took three renders of moving the calendar and dropping the headboard to win back. Last, I nearly committed the preview with the Reels in it, and amended it out.

## State
built · 2026-10-19

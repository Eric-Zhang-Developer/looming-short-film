# Done · v6-stacks-2

## What shipped
s10b now walks him clearly toward the lens: z 0.06 → 0.45, about 1.8× his starting height on screen by the cut, the blob growing with him. He is the side rig turned 50° to us instead of the front turnaround, so his snout shows in every frame. The camera is 4 cm higher and tipped 6° down, and each strip light now lights only its own patch of carpet, so the blob's shadow on its beats is a dark pool you can see at sheet size. Beats `pocketPhone` 1.0, `underLight1` 2.0, `underLight2` 4.5 are unchanged.

## Where it lives
- `src/shots/s10b.js`, `docs/shots/s10b.md`: commit `37cebc6` on `task/v6-stacks-2`, plus the evidence/done commit after it
- Evidence: `evidence/v6-stacks-2/sheet.jpg`, `determinism.txt`, `check_timeline.txt`

## How it was checked
- [x] `evidence/v6-stacks-2/sheet.jpg` (4 columns, unlabeled: this ffmpeg has no `drawtext`). Rows 1–3: 110.0 to 115.5 every 0.5 s. Row 4: 116.0 (s11's first frame, the seam), then **v6-stacks' 110.5 and 115.5**, cropped from `evidence/v6-stacks/sheet.jpg` (not re-rendered).
  - Approach: by geometry his distance goes from 0.89 to 0.5325 at 115.5 (1.67×) and 0.50 at the cut (1.78×). On the sheet he's about 80 px tall at 110.0 and about 135 px at 115.5, measured by eye on the 480 px tiles.
  - Snout: shows on every frame from 110.0 to 115.5, with the head in profile, pointing screen right and toward us.
  - Pools: a dark shape ahead of the blob on the lit carpet at 112.0–112.5 and 114.5–115.5. I checked it in a full-res crop at 112.5 and 115 (looked at, then deleted).
- [x] `node tools/check_timeline.mjs` → `ok (22 shots, 73 beats, 201.0s)`
- [x] `node tools/determinism.mjs --t=110.5,112.5,115.2` → all three PASS, `determinism: PASS`. It ran on the final logic. The only edits after it were comments.
- [x] `npx tsc --noEmit -p .` → clean (exit 0)

## Gaps
- **The blob's eyes dim between tubes.** The narrow cones that make the pools also leave its eyes (lit only by the key) dull brown at 112.0, 113.0 and 113.5. Letting the blob choose its brightest tube (`key` no longer forced to the nearest) fixed 114–115.5 but not those frames. That's physically right, but it's a change from v6-stacks' always-bright eyes.
- **The phone business is small.** The phone is in his near hand at hip height, and his snout tips up in 110–111.5 rather than reading as "head down at it". The timing (gone by 1.0) is unchanged, so the pocket rustle cue still fits.
- **He can look like he's floating.** Only the blob casts (README v4), so his feet have no contact shadow, and the blob's pool runs in front of his feet. I checked his feet against the blob's base in the 112.5 crop and they're on the floor.
- He's hot (near blown out) at 115–115.5, under the tube ahead of him. v6-stacks' 115.5 was hot too.
- The walk direction (mostly +z, drifting 6 cm in x) is about 20° off the way the rig faces (50°). It's a cutout compromise: facing exactly along the path would make him nearly edge-on.
- Spec-silent choices: the 50° turn (s10 used 20° for a stop), a fifth wing at z 0.49 so he's still in the stacks at the end, s09c's side backpack (`props_kit`) instead of `backpack_front`, and the light values set by eye: key 0.6 cd, cone 0.6 rad, range 0.3; set light 0.75, from (0, 0.45, 1.0); ambient ×0.4.
- The pre-existing `[page] Failed to load resource: 404` is still logged on every render. I didn't trace it.

## Story
The brief ranked three problems, and the first two turned out to share a fix. The front turnaround has no snout, and s10 had already solved "reads as a frog" with the side rig turned toward the lens. A ¾ head on the front body looked tempting until I found the only ¾ drawing has a painted face, which would have lost the closed eyes on the relief beat. So he became the side rig at 50°, and once he was walking that way, sending him further toward the lens was just a matter of a faster walk and one more wing of shelves.

The pool was the stubborn one. Raising the camera and pushing the tubes further behind the blob helped a little, and turning up the key and turning down the fill helped hardly at all. A full-res crop showed the shadow was there, just weak. The cause was that all four tubes lit the whole carpet, so wherever one tube's shadow fell, the other three filled it in. Narrowing the cones gave each tube its own patch of light, and the shadow went dark (`evidence/v6-stacks-2/sheet.jpg`, 112.5 and 115). That cost me the blob's bright eyes between lights, since the blob lights its eyes from a single key. Letting it pick the tube that lit it most got them back near the end, but not in the middle frames. That's under Gaps.

## State
built · 2026-10-18

# Done · v6-stacks

## What shipped
s10b, "The stacks", a 6 s shot at 110–116. It is v3's walk toward a locked camera down a Marston stacks aisle, flipped to fit the v4 rule. He looks at his phone and slides it into his hoodie pocket by 1.0. One warm downward spot per strip light keys him from above, and as the 2.5× blob passes under tubes 1 and 2 its shadow is a small pool on the carpet. Every later shot starts 6 s later, so the film is now 201 s (3:21). Two cue lines give s10b soft carpet steps and the pocket rustle.

## Where it lives
- `src/shots/s10b.js` (new), `src/timeline.js`, `tools/check_timeline.mjs` (TARGET), `src/audio/cues.js` (two s10b lines), `docs/shots/s10b.md` (new), `docs/02-story.md` (Act 4 line)
- Commits on `task/v6-stacks`: `bcc96b1` shot + timeline, `bffc5cd` cues, `a653cb0` spec, plus the evidence/done commit after it
- Evidence: `evidence/v6-stacks/sheet.jpg`, `seams.jpg`, `determinism.txt`, `check_timeline.txt`

## How it was checked
- [x] `evidence/v6-stacks/sheet.jpg`: 110.0 to 115.5 every 0.5 s (12 frames). The phone shows at 110.0 and 110.5 and is gone at 111.0. His eyes close on relief at 112.0 and are open from 113.0. The dark pool in front of the blob is visible in a full-res crop at 112.5 (looked at, then deleted). It's thin at this camera height.
- [x] `evidence/v6-stacks/seams.jpg`: 109.5 (s10's CU), 110.0 (s10b), 115.9 (s10b), 116.1 (s11)
- [x] `node tools/check_timeline.mjs` → `ok (22 shots, 73 beats, 201.0s)`
- [x] `node tools/determinism.mjs --t=110.5,112.5,115.2,118.5,190` → all PASS, `determinism: PASS` (three s10b times, s11 at local 2.5, s18 at local 9)
- [x] `npx tsc --noEmit -p .` → clean
- [x] `node tools/mix.mjs` → `range 0:201 s`, loudnorm linear, `mix.wav integrated -15.9 LUFS true peak -4.7 dBTP`. `node src/audio/selftest.js` passes (the lamp clicks stay identical within ±1 LSB).

## Gaps
- **The score has a hole: the music is silent from about 107 to 116.5.** I measured the music stem's mean level per second: −47 dB at 106, then −91 dB (digital silence) from 107 to 115, and −19.8 dB from 116. Before v6 this silence ran about 3.5 s (lightFlood's chord decays by ~107, and s11's theme starts on deskSit). Now it is about 9.5 s. Per the brief, `score.js` is untouched. The ambience has no hole: room tone, the fluorescent hum and the paper boil hold −40 dB through 105–117.
- **Hard-coded global times:** the only one that mattered was `TARGET = 195` in `tools/check_timeline.mjs`. It's now 201, the director's approved runtime. The ±5 s window is unchanged, so the check is no looser. Mix, cues, score, selftest, `render_film.sh` and `splice.sh` all read `DURATION` or beat names. The grep of `src/shots/` found no global times; s18's numbers are local frames and comments. Old evidence scripts under `evidence/*/` that import the timeline are records of past tasks, not checks, so I left them alone.
- **Stale timestamps in `docs/02-story.md`:** I added the s10b line and moved s11's stamp to 1:56. The later Act 4/Payoff/Ending stamps (1:57, 2:02, … "2:55–3:15") and the Act 4 heading range are still the old ones. They're outside the one line this brief owns. The shot docs' `**Time:**` lines for s11 onward are stale too.
- **No cloth sound exists** in `foley.js`, so the pocket is a 0.3 s `paperRustle` at gain 0.2 (s09a's blanket precedent). Two cue lines, not three.
- **Spec-silent choices:** walk step 1/3 s (v3 used 0.25: calmer); the beats are pocketPhone 1.0, underLight1 2.0, underLight2 4.5; the face is resolve, then relief on underLight1, then eyes open on relief's smile from 3.0, because a 3 s eyes-closed walk would read as sleepwalking. The pools are thin from this camera (y 0.085, nearly grazing the floor). They read as a dark sliver ahead of the blob, not a round pool. Light intensities were set by eye: key spots 0.2 cd, set directional 1.0, ambient ×0.55.
- Only the nearest strip light shows on screen; the coffers hide the rest. This matches v3's frame (`evidence/v3-fix-marston/s10_after.jpg`).
- Every render and determinism run logs one `[page] Failed to load resource: 404`. I didn't trace it. It appeared on the first render, before any lighting changes.

## Story
The brief was clear about what to keep from v3 and what to turn around, so the first job was mechanical: put s10b into the timeline and push everything after it back six seconds. Because the cues and score are hung on beat names, the only number that broke was the timeline check's own target, 195, the director's old runtime. Making it 201 was a matter of using his new number, not loosening the check.

The shot itself was v3's s10 with the phone light pulled out and spots put in. The first sheet came out blown-out yellow, and he went dark at exactly the moments he was "under the light". A spot straight overhead only grazes a cutout that faces the camera, so the beat that was meant to be the light was the dimmest frame. Lowering the spots and letting a front-high directional carry his face fixed that. The second problem was that the blob cast no visible shadow. Three's spot shadow camera starts at 0.5 m, and the whole set sits inside that. The current s10 already sets `shadow.camera.near = 0.004` for the same reason, and I'd missed it when porting. Once the shadows showed, a third problem was visible: a light directly over the blob casts only a line. So the two tubes now sit 1.5 cm behind the blob on their beats, and the pool falls forward where the camera can see it. It's still thin from a camera this low (`evidence/v6-stacks/sheet.jpg`).

The mix rebuilt first time at 201 s, −15.9 LUFS. Measuring the stems turned up the one real cost: nine and a half seconds with no music.

## State
built · 2026-10-18

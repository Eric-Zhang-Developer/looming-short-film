# 07 · Process Log

## Why this exists

The judges score **Strategies** (methods, experimentation, research, attributions) and the ethics principles of **Transparency** and **Accountability**. A film made with an AI collaborator is open to the charge that the AI did the work. This log is the evidence of who decided what. It gets published with the film.

It also keeps the project honest. If a log entry would be embarrassing to publish, the decision behind it is probably wrong.

## What to log

- **Decisions:** any choice about story, look, timing, sound or tools, with the alternatives considered.
- **Overrides:** every time the director rejected or changed what the AI produced, and why. These are the most valuable entries.
- **Experiments:** what was tried, what it looked like (link a contact sheet or frame), and the verdict.
- **Outside input:** feedback from cold viewers, critiques, and what changed because of them.
- **Cost:** rough hours, render time, and anything paid for.

Don't log routine coding steps. Git history covers those.

## Entry format

```markdown
### YYYY-MM-DD · Short title
**Decision:** what was decided, in one sentence.
**Alternatives:** what else was on the table.
**Why:** the reason.
**Who:** director / Claude-proposed, director-approved / director override.
**Evidence:** link to frames, sheets or commits (optional).
```

## Log

### 2026-10-15 · Concept: an exam story told through a shadow
**Decision:** make *Looming*: procrastination before a final, with the exam as an ink blob whose shadow grows when avoided.
**Alternatives:** about a dozen pitches, including a Lake Alice bat at night, an out-of-tune Century Tower bell, a mascot love story told through the 34th Street Wall, a move-in day story, and a vending machine.
**Why:** procrastination is something every student knows, and it can be filmed without words through a single visual rule.
**Who:** director chose from Claude-proposed pitches.

### 2026-10-15 · The turn is the first step
**Decision:** the climax is the hero uncapping a pen and writing his name, and problem #1 turning out to be easy.
**Alternatives:** a rescue by another character; the monster being "misunderstood" as the main reveal.
**Why:** the director's point: the turning point is taking the first step, not being saved.
**Who:** director.

### 2026-10-15 · Outside cold read
**Decision:** run the treatment past a reviewer with no context, scoring it against the competition criteria.
**Result:** they rated it warm but familiar (C6 / I4 / R5 / S4 / Im5). They flagged:
- the custodian taking the hero's moment
- wrong light physics
- a missing "it was easy" beat
- a redundant exam-hall ending
- the irony of the AI framing
**Changes made:**
- The hero turns on the lamp himself.
- The phone is low and close, the lamp overhead.
- Added the problem #1 beat.
- Cut the exam hall.
- Planned this log.
**Who:** Claude-run review; director approved the changes.

### 2026-10-15 · Runtime: 3:00
**Decision:** 3:00 with about 30 s of held quiet shots.
**Alternatives:** 5:00 for more quiet; 2:00.
**Why:** cost comes from acting shots, not seconds, so the quiet survives at 3:00. A shorter film also protects craft quality.
**Who:** director.

### 2026-10-15 · Look: lit paper diorama
**Decision:** torn-paper cutouts on depth planes, with real light and shadow.
**Alternatives:**
- the director's earlier watercolor-chibi p5.brush style (rejected as stale)
- pixel art (faces can't act at that size)
- 3D toon (rigging trap)
- risograph print (no link to shadow)
**Why:** the film is about shadow, so the medium should be a shadow theater. The director picked the torn-paper reference from a study of eight code-made films.
**Who:** director.

### 2026-10-15 · Reference study
**Decision:** review eight code-made films with a standard scoring sheet, one reviewer each.
**Finding:** none use real cast shadows, and none hold a shot longer than about 6 s. Those two gaps became the film's differentiators.
**Who:** Claude-run study; director chose the references.

### 2026-10-15 · Sound synthesized in code
**Decision:** score and foley are synthesized in code and locked to the timeline.
**Alternatives:** an AI music generator; a hybrid of the two.
**Why:** keeps the whole film readable source, and reuses the *SUPER 1776* audio approach.
**Who:** director.

### 2026-10-15 · Hybrid: the model paints, the code cuts and lights
**Decision:** Codex image gen paints surfaces (character design sheets, props, background plates, optional paper textures) once, as frozen assets. Code does silhouettes, torn edges, alpha, light, shadow, rigging, timing and sound.
**Alternatives:**
- fully procedural surfaces (risk of looking fake)
- generating images per shot (character drift, breaks determinism)
- a local open-weight model (better for Openness, slow on this laptop, UF approval unverified)
- photographing real paper (still an option for plain grain)
**Why:** painted surface detail is where code looks weakest, and character appeal was the lowest score across every reference film. Generating each character once and rigging it in code avoids the drift problem.
**Limits found in research:** Codex output has no alpha, so we use a chroma-key background. Recurring characters drift across generations, so we generate one sheet per character. Default sizes are about 1.2–1.5K, so we need 2K or more for close-ups.
**Who:** director proposed; Claude researched and set the limits.

### 2026-10-15 · Claude drives Codex, with extensive prompts
**Decision:** Claude writes the asset specs and long, layered prompts (style, lighting, asset, technical and notes blocks), attaches approved images as references, and calls Codex through `codex exec`. The director picks every frozen asset. Rejects are kept in the repo as evidence. Full workflow in doc 08.
**Alternatives:** the director prompting Codex by hand in the app; one-line prompts.
**Why:** versioned prompt files and reference chaining keep 30-odd assets consistent with one style tile, and make every image traceable.
**Who:** director.

### 2026-10-15 · Version control: task → wave → main, cuts as tags
**Decision:** Each subagent works on its own task branch, squash-merged into a wave branch. Each wave lands on `main` as one PR, and the director's gate approval is the merge. Watchable cuts are tags with the MP4 on a Release. Rejected generations are committed only as thumbnails.
**Alternatives:**
- committing tasks straight to `main` (simpler, but a half-built shot can land and there's no per-gate review)
- one PR per task (about 60 PRs, too noisy)
- Git LFS for images (the free bandwidth is too small for a public repo)
**Why:** `main` stays watchable, each gate gets one readable review on GitHub, and the repo stays around 100 MB instead of 300–600 MB.
**Who:** director asked; Claude proposed; director approved.

### 2026-10-15 · Wave 1 smoke tests
**Decision:** both pipelines are viable, so proceed to wave 2.
**Evidence:**
- `evidence/smoke-codex/contact.jpg`: headless Codex style tile with real alpha.
- `evidence/smoke-paper/phone_t0.5.jpg` and `lamp_t4.0.jpg`: cutout-shaped shadow, 2.95× loom, small lamp pool.
**What surprised us:**
- Codex ignored the green key and returned alpha.
- Codex read `AGENTS.md` and the docs, which cost about 190k input tokens for one image.
- three r186 has no `PCFSoftShadowMap`.
- Procedural paper surfaces read as vector, not paper.
**Changes made:** docs 04 and 08 updated. Painted surfaces from Codex are now the main path to the paper look.
**Cost:** 1 image generation. About 193k input tokens (167k cached) and 1.4k output tokens on the Codex side. Image cost isn't reported.
**Who:** orchestrator-run; the director approves via the wave PR.

## Publishing

At submission, link this file from the README and the synopsis. Include 6–10 before/after frames for the biggest overrides. Leave in the experiments that failed. They're the most convincing evidence that a human was directing.

## 2026-10-15 · Lookdev: the rig works, the look half passes

The first full-rig composite (`evidence/lookdev-composite/`) proved the mechanics: a 3.04× loom with eye holes under the phone, a 1.4× pool under the lamp, deterministic frames, about 15 ms per frame. Side by side with the reference, it reads as paper only where it's lit. Four rig problems went to `look-pass-1`: a doubled rim that reads as a stroke, a night grade much darker than the reference's picture-book night, 3D-looking light shapes, and a paper cache smaller than one shot. The fifth problem is the art itself. The v2 style tiles paint the props in the wall's navy, so they vanish into it and only their rims show. That's a palette call, so it goes back to the director at G1, with a recommendation to make a v3 tile under a value-contrast rule rather than freeze a v2.

## 2026-10-15 · Wave 2 merged (#2)

All modules verified and the lookdev passes the rig. Two look passes fixed every code-side problem the composite exposed. What still reads as vector is the art: navy props on a navy wall. That goes back to the director at G1. Sound is ahead of schedule: score, foley and a linear master with identical lamp clicks. Wave 3 (`wave/3-assets`) starts with `mod-film` in flight and G1 plus 8 story questions open.

## 2026-10-15 · G1 and Q1–Q9 decided

Director, verbatim: "G1: make style tile v3 with the value-contrast rule (+4 generations). Q1–Q9: go with every recommendation."
- **G1:** no v2 is frozen. A v3 style tile is painted under a value-contrast rule (props in cream, kraft, green, amber or red; navy only for walls and sky), and the style_tile cap rises from 8 to 12.
- **Q1–Q9:** every recommendation stands. Most were already built as the "(current)" option. Two need work:
  - **Q7:** the Exam becomes matte ink with one painted highlight and a visible stain.
  - **Q4:** doc 03's red rule now reads "only on the calendar circles".

## 2026-10-15 · G1 approved: style tile v3_4 frozen
Director, after asking "which one is v3_4" and being shown it: "I like it".
- **Frozen:** `assets/frozen/style_tile.png` (v3_4, the graphic picture-book gator), recorded in `assets/generated/manifest.json`. It is now the reference for every later generation, per doc 08's table.
- **Carried into the gator sheet (G2)** as the painter's notes, from the v3 screening: the surface reads as felt rather than torn paper; the tile's gator stands about lamp height (the sheet fixes proportions, and scale is set in code); the legs are about 20% of height while the rig's are 37%, and the sheet's `leg_l` sets the truth.

## 2026-10-15 · G2 round 1: v1_1 is the base, one revision round
The orchestrator recommended v1_1, plus one more round to fix the front view (no muzzle, so it reads as a frog), the 3/4 head (it came out as a side head), the size for close-ups (a separate large hero side view) and the faint paper edges. Director: "sounds good ok we can continue". Nothing is frozen yet.

## 2026-10-15 · Marston has no desk lamps: motion-sensor lights carry the turn
The director pointed out that Marston has no desk lamps, and research found no source showing any (`docs/ref-ufl.md` §0). The orchestrator offered motion-sensor lights, the hero bringing his home lamp, flipping the phone, dawn light, or a different library. Director, verbatim: "Go with motion-sensor lights at Marston: stillness lets the lights die, his movement (pen, standing, walking past) brings them back in s15, s16 and s18. Keep the home lamp for s06."
- **The rule still holds.** Overhead light means a small shadow and low phone light means a huge one. At Marston the overhead light is a ceiling fluorescent on a motion sensor.
- **The arc:** at home he clicks the lamp off and chooses the dark (s06). At Marston, stillness lets the lights time out (s11), and moving brings them back (s15 the pen, s16 standing, s18 walking past the Freshman).
- **Unverified:** whether Marston's upper floors actually use occupancy sensors. It's common in libraries and plausible to a UF audience.

## 2026-10-15 · The blob's size becomes the dread meter
The director, after watching the Act 1 preview: "I think the blob should get bigger… I think there's a lot of stuff going on in the first act that you can't really tell from subtext. I think we need to make things a little bit more explicit. While still remaining tasteful." The orchestrator proposed:
- an explicit birth: a tight insert of ink beading on the red Friday circle next to the exam glyph, then the blob's first look going to the glyph and then to him
- the blob growing one step with each avoidance (glance at the exam, look away, gulp and swell on a beat, the Exam motif a little lower each time), peaking at about the gator's head size
- the shadow kept on top as "how it feels"
- one step of shrinking per solved problem

Director: "agree I like those changes".

## 2026-10-15 · G2 (gator): sheet v2_1 and hero_1 frozen
Director, verbatim: "G2: freeze gator sheet v2_1 and hero_1."
- `assets/frozen/gator_sheet.png` (v2_1) and `assets/frozen/gator_hero.png` (hero_1) are in the manifest. `gator_hero` is a new asset row in `docs/assets.md`.
- Known: the box gaps are under 40 px (side view against body), but `cut.mjs --auto` gives 14 clean islands. On v2_1's front view the nostril dots could read as eyes until the face sheet's eyes sit on top.
- Next: the face sheet (references: style tile plus gator sheet), then refit the rig to the frozen parts (`hipHeight` from the real `leg_l`).

## 2026-10-15 · Submission answers become a living draft
The director shared the ProposalSpace form and asked for markdown answers that stay updated "as we go". The draft is `docs/10-submission.md`, and updating it is now a standing duty in `NOW.md`. Finding: the form caps each file at **10 MB**, so a 3:00 film gets about 440 kbit/s. The Act 1 preview scales to about 14 MB at the current encode, so the final encode needs work (HEVC or a two-pass target bitrate).

## 2026-10-15 · Roadmap: rough first, then final, shown side by side
Facts found today: the ProposalSpace deadline is Oct 15 at 11:59 PM EDT, and Gator Create's competition day is Oct 26 (AI Days page). Director, verbatim: "having a shitty rough draft, fully fleshed out, and then doing a final compared to the final polished version will be really, really satisfying." The new roadmap is `docs/11-roadmap.md`, which supersedes doc 06's calendar:
- **M1:** `v1-animatic`, submitted tonight
- story lock, then look lock, then final art
- `v3-final`
- a frame-aligned split screen for competition day

The rule that makes the comparison work is one shared timeline: beat times and cut points freeze after M1, except by director notes.

## 2026-10-15 · Distribution: YouTube at full quality, plus a compressed backup
Director: "You don't have to do the under 10 MB. I'm going to upload it on YouTube in full quality. We should do one, like a compressed one, just in case." The master is encoded at full quality for YouTube, and the link goes in the answers. A compressed copy of 10 MB or less is still uploaded to ProposalSpace as a backup. The director does the YouTube upload himself.

## 2026-10-15 · Final fidelity target
Director: "The final version should be as high fidelity as possible." `v3-final` is mastered in 4K, which YouTube rewards with better codecs, with supersampled edges, higher shadow-map resolution, art checked against its on-screen size, and a near-lossless master. The full render is planned overnight because of RAM. Details are in doc 11.

## 2026-10-15 · Deadline clarified: final due Sunday, Oct 18
The director spoke to the organisers. Today needs only an incomplete draft. The final is due Sunday at 11:59 PM, and a YouTube link and the GitHub repo can be submitted. About 70 proposals are in progress and 30–50 submissions are expected. The roadmap (doc 11) is compressed to Sunday: tonight the draft, then the rough reel (v1-animatic), story lock, look lock and final art, with the 4K master rendered overnight Saturday into Sunday.

## 2026-10-15 · G4 on v1-animatic: story notes, and two polish passes overnight
The director's notes are in full in `docs/notes/g4-2026-10-15.md`. Orchestrator's decisions, given to the director before the overnight run:
- **Keep:** the sound's odd, animated voice; the library and its lighting. **New rule: everything is cut paper except the dread.** The blob stays ink: smooth, too alive, not paper ("It's more animated and less paper-cut, which makes it unnatural. I think you should keep it that way").
- **Home and kitchen** are repainted as Codex kits, each piece sized against the gator (the "massive table" was unscaled placeholder).
- **Home avoidance becomes a laptop game.** A low screen still casts the big shadow, and the phone stays for Marston.
- **The blinds stay, and are made causal:** each blind down removes daylight, and the blob's shadow steps up.
- **The opening is explicit:** a phone buzz, a generic school notification (no Canvas branding), and a zoom to the calendar date. Math, not words: ∫ … dx marks the exam, which keeps the film wordless. The director may overrule this in favour of literal words.
- **Payoff, about 15–20 s:** a Calc 2 practice sheet (∫x·eˣ dx, a series), test day with a problem he recognises, then the graded paper (checks and a circled score).
- **Ending:** the exam date is crossed off, the blob shrinks to an ink dot and is absorbed by the calendar. Tag: a new date, a small drop, and he uncaps his pen. This replaces the pocket.
- **Runtime 3:00 → about 3:15** (the rules set no limit). The v1/v3 comparison aligns by scene, as doc 11 allows when G4 changes the story.
- **Overnight authority:** the orchestrator freezes art itself (most cut-paper, most Marston, simplest), listing each freeze with its alternatives for the morning. No public actions. No story changes beyond these notes.

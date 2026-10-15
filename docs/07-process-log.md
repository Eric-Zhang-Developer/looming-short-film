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

## Publishing

At submission, link this file from the README and the synopsis. Include 6–10 before/after frames for the biggest overrides. Leave in the experiments that failed. They're the most convincing evidence that a human was directing.

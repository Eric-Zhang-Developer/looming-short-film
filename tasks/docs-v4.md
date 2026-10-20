# Brief · docs-v4 (the submission text, the art rules and the making-of for v4)

**Type:** briefer (docs only) · **Wave:** 6 (v4) · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/02-story.md` (v4), `docs/02-story-v4-draft.md` (why it changed, the director's words), `docs/10-submission.md`, `docs/03-art-direction.md`, `docs/07-process-log.md`, `docs/12-making-of/README.md` and chapters 10–11 (for voice), `docs/shots/QUESTIONS.md` Q16–Q17, `docs/notes/v4-fixlist.md`, and the v4 done notes: `done/rig-v4.md`, `done/asset-v4-kit.md`, `done/spec-v4.md`, `done/climax-a1.md`, `done/climax-a2.md`, `done/snd-v4.md`, `done/trims-home.md`, `done/trims-marston.md`

## Goal
The words around the film match the film. v4 cut the motion-sensor lights, the custodian, the blinds and the stacks, and made the walk to the library the climax. The submission text and the art rules still describe the old film, so a judge reading them would be told about scenes that no longer exist. Fix that, and tell the v4 story in the making-of.

## Owns
- `docs/10-submission.md`
- `docs/03-art-direction.md`: **rules 2 and 8 only** (and any line elsewhere in doc 03 that only restates them)
- `docs/07-process-log.md`: append entries for 2026-10-17 → 18 that are missing (check what's there first; don't rewrite old entries)
- new `docs/12-making-of/12-the-walk.md` (title is yours), and its line in `docs/12-making-of/README.md`
- `done/docs-v4.md`

## Spec
1. **doc 10:** reword every claim that v4 made false: the motion sensors (lines ~58, 84, 95, 141), anything about the custodian, the blinds, quiet 1 or the stacks, and the runtime (3:15). Describe the v4 turn as it is: at 3 a.m. he turns the phone face down, clicks his nightstand lamp on and walks to Marston; the street lamps make his shadow stretch and shrink; at Marston's door the light from above shrinks it to a puddle. The clock motif. The rule ("light held low and close makes the shadow loom; light from above makes it small") now has one job. Keep every `[now: …]` / `[director: …]` status tag style the doc uses; mark the sensor question in line ~141 as moot. **Do not claim anything about the final render, captions or the flash check that hasn't happened**; say "planned" where it's planned.
2. **doc 03 rules 2 and 8:** rule 8 now says Marston's light is warm, from above, and stays on (no sensors). Rule 2: read it and fix only what v4 contradicts. Quote the director where it helps.
3. **Making-of chapter 12:** the story of v4, from the director's v3 critique to the built climax, for the judges and for the director. True events only, each tied to evidence (commits, done notes, evidence images by path). The director's words verbatim where they matter (`docs/02-story-v4-draft.md` has them). Include: the critique and why the janitor turn was wrong; the clock and the Codex close-up heads; the approval; the two questions he answered (2.5×; "I don't have a night light though I have a nightstand lamp", which became the lamp click rhyming with s06); building the climax in two rooms in parallel; the sound designed by an agent that can't listen, with the swell's measured shape; what's still missing (the v4 fix list). 1,200–2,000 words, in the voice of chapters 10–11. No private material (this is a public repo): no journal, no personal details beyond what's already in the public docs.
4. **doc 07:** short dated entries for decisions that aren't logged yet (check first): story v4 approved, the 1080p master, Q16/Q17 answers, the out/ swap to a local folder, the render crash and the resume fix.

## Acceptance
- [ ] `grep -n -i "sensor\|custodian\|janitor\|blinds" docs/10-submission.md` lists only lines that say these were cut (paste the output in the done note)
- [ ] Every claim in the new text traces to a doc, a done note or evidence; the done note lists any claim you couldn't trace and left out
- [ ] Chapter 12 cites at least five evidence paths that exist (check each with `ls`)
- [ ] Done note ends with `## Story`

## Git
Commit on `task/docs-v4` with messages that argue the decision. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push, merge or open PRs. Don't run headless Chrome (a full render is running on this machine). Stay inside your worktree.

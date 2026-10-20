# Brief · v6-docs-shift (the docs follow the 6 s the stacks added)

**Type:** builder (mechanical, no rendering) · **Version:** v6 · **Model:** given at dispatch · **Time box:** about 30 minutes.

v6 inserted s10b at 1:50–1:56, so every shot from s11 on starts 6 s later and the film runs 3:21 (201 s), per `src/timeline.js` (the source of truth). The docs still give the old times.

## Do
- In `docs/02-story.md`: shift every timestamp at or after 1:50 by +6 s (e.g. "1:57" → "2:03", Act headings' ranges, "Ending (2:55–3:15)" → "(3:01–3:21)", "3:15" → "3:21" where it means this cut's runtime). The s10b line is already right.
- In `docs/shots/*.md`: the `**Time:**` (or similar) lines for s11 onward, from the timeline.
- `README.md`, `NOW.md`, `docs/04-technical.md`, `docs/06-production-plan.md`, `docs/11-roadmap.md`: where a runtime or time describes **the current cut**, update it. Don't touch historical statements (things that were true of v1–v5), `docs/07-process-log.md`, `docs/10-submission.md` or `docs/10b-*` (submitted text), or anything under `done/`, `tasks/` or `evidence/`.
- Check every new time against `src/timeline.js` (`node -e` it); list each file and line count changed in the done note.

## Owns
Only the docs named above, and `done/v6-docs-shift.md`. No code. Commit on `task/v6-docs-shift` as one mechanical commit (it is churn: it rides alone). **No trailers.** Don't push or merge.

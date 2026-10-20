# Brief · v11-home (v11: the blob's size tells the story · s02–s06)

**Type:** builder · **Version:** v11 · **Time box:** about 3 hours; committed working beats polished. The director wants v11 out today: ship what works.
**Read first:** `AGENTS.md`, `docs/notes/v11-beats.md` (**the size table is your spec**), `docs/notes/v9-beats.md` §2 (the acting map, unchanged), `docs/shots/README.md` §1 (sizes, the light rule), and each of your shots' `src/shots/*.ts` and `docs/shots/*.md` before you touch it.

## The director, verbatim
"I want to make the blob start smaller and get a lot bigger. It should be taller than the [gator]. It should be massive as we're going to the library … Every moment of procrastination, the blob should get bigger. I know the shadow is supposed to be smart and whatnot, but look, again, it's a matter of legibility."

## Do
- Set your shots' blob radii to the v11 table exactly (each shot's `BLOB_R`; a gulp is a squash-and-grow on its beat, the way the existing gulps are animated: find gulp1 in s03 or gulp2 in s06 and match it).
- **s02:** born at r 0.005, a drop of ink: its bead, fall and landing scaled to match (it still reads as the same character, eyes and all).
- **s04, new beat `gulpFridge`:** one gulp on one of the fridge opens (your pick, where it reads best). **s05, new beat `gulpGame`:** one gulp during game night, at least 0.75 s clear of 43.0 (the next shot's lamp click is a dry, exposed sound).
- **Re-stage and re-frame so the new size reads:** cameras, the blob's placement and its contact point may move; shot lengths and beat times may not (other than adding the new beats named above, in your own shots' rows of `src/timeline.ts`). Keep his acting, the light rule (a low, close light makes the shadow loom), and v9's acting map (blank and still while huge). The blob must never clip through him or a prop in a way that reads as a bug; where a set cuts it off (a ceiling, a doorframe), that is fine and intended.
- Keep every shadow consistent with the new size (they follow from the light; re-check any hand-placed shadow or loom scale).
- A **v11** block at the top of each touched shot doc, winning over the text below it.

## Owns
`src/shots/s02.ts`, `s03.ts`, `s04.ts`, `s05.ts`, `s06.ts`, their `docs/shots/*.md`, your rows of `src/timeline.ts` (beat additions only), `evidence/v11-home/`, `done/v11-home.md`.
**Not yours:** `src/audio/*` (the orchestrator wires the new gulps' sound after the merge), `src/blob.ts`, every other shot (three other builders work beside you on the rest of s02–s16).

## Acceptance
- [ ] `evidence/v11-home/sheet.jpg`: each shot before and after its gulp (s02 the landed drop beside him at full frame, s03 4.5 → 7.0, s04 before/after gulpFridge, s05 before/after gulpGame, s06 before/after gulp2) and one frame per shot with him and the blob both whole
- [ ] `node tools/determinism.ts --page=index.html --t=…` at one time per changed shot; `node tools/check_timeline.ts`; `npm run typecheck` clean
- [ ] `done/v11-home.md` ending with `## Story`; list every new beat name and its local time

## Machine and git
You're in a fresh git worktree, which may be cut from `main`: first `git reset --hard v11` (it must contain the commit adding `docs/notes/v11-beats.md`). Then `ln -s /Users/ericzhang/code/media/looming/node_modules node_modules`; `cp /Users/ericzhang/code/media/looming/assets/cut/*.png assets/cut/`; `mkdir -p assets/raw/reels && cp /Users/ericzhang/code/media/looming/assets/raw/reels/*.mp3 assets/raw/reels/`. Never commit those.
**Memory (hard rule: the director caps Chrome at 8 GB).** One headless Chrome at a time on this machine, and three other builders render beside you. Before each render batch, wait (a background loop, not a foreground `sleep`, which is blocked) until `memory_pressure -Q` reports at least 25% free **and** `pgrep -f -- '--headless'` finds nothing (a headless Chrome on port 9333 that has been up for days is not a render; ignore it). One page per Chrome, renders of 6 s or less per Chrome, `--w ≤ 960`, sheets and strips only, no full-film renders. A watchdog (tools/watchdog.sh) may kill your Chrome if memory runs out: wait for the gate and retry, don't fight it.
Code is strict TypeScript (`npm run typecheck`; no ts-ignore, `any` only with a why-comment). Never weaken a check. Commit with messages that argue the decision; **no `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge. Write `done/<id>.md` last (from `templates/done-note.md`, ending with `## Story`) and report your branch name and last commit.

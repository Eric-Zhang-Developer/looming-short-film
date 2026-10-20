# Brief · v11-relapse (v11: the blob's size tells the story · s16)

**Type:** builder · **Version:** v11 · **Time box:** about 3 hours; committed working beats polished. The director wants v11 out today: ship what works.
**Read first:** `AGENTS.md`, `docs/notes/v11-beats.md` (**the size table is your spec**), `docs/notes/v9-beats.md` §2 (the acting map, unchanged), `docs/shots/README.md` §1 (sizes, the light rule), and each of your shots' `src/shots/*.ts` and `docs/shots/*.md` before you touch it.

## The director, verbatim
"I want to make the blob start smaller and get a lot bigger. It should be taller than the [gator]. It should be massive as we're going to the library … Every moment of procrastination, the blob should get bigger. I know the shadow is supposed to be smart and whatnot, but look, again, it's a matter of legibility."

## Do
- Set your shots' blob radii to the v11 table exactly (each shot's `BLOB_R`; a gulp is a squash-and-grow on its beat, the way the existing gulps are animated: find gulp1 in s03 or gulp2 in s06 and match it).
- **s16:** starts at 0.054; `gulp4` → 0.060 (the biggest it ever is, and the wall shadow with it); then the five solves: `problemOneSolved` → 0.018, `problemSolved2` → 0.012, `problemSolved3` → 0.0085, `problemSolved4` → 0.0065, `problemSolved5` → 0.005 (s17 starts at 0.005). He sits at his desk with a blob that towers over it; re-frame the wide so both read.
- **Re-stage and re-frame so the new size reads:** cameras, the blob's placement and its contact point may move; shot lengths and beat times may not (other than adding the new beats named above, in your own shots' rows of `src/timeline.ts`). Keep his acting, the light rule (a low, close light makes the shadow loom), and v9's acting map (blank and still while huge). The blob must never clip through him or a prop in a way that reads as a bug; where a set cuts it off (a ceiling, a doorframe), that is fine and intended.
- Keep every shadow consistent with the new size (they follow from the light; re-check any hand-placed shadow or loom scale).
- A **v11** block at the top of each touched shot doc, winning over the text below it.

## Owns
`src/shots/s16.ts`, their `docs/shots/*.md`, your rows of `src/timeline.ts` (beat additions only), `evidence/v11-relapse/`, `done/v11-relapse.md`.
**Not yours:** `src/audio/*` (the orchestrator wires the new gulps' sound after the merge), `src/blob.ts`, every other shot (three other builders work beside you on the rest of s02–s16).

## Acceptance
- [ ] `evidence/v11-relapse/sheet.jpg`: 0.5, 6.5, 9.5 (after gulp4, the shadow), 11.0, 16.0, 17.0 (after the first solve), 21.75, 25.5
- [ ] `node tools/determinism.ts --page=index.html --t=…` at one time per changed shot; `node tools/check_timeline.ts`; `npm run typecheck` clean
- [ ] `done/v11-relapse.md` ending with `## Story`; list every new beat name and its local time

## Machine and git
You're in a fresh git worktree, which may be cut from `main`: first `git reset --hard v11` (it must contain the commit adding `docs/notes/v11-beats.md`). Then `ln -s /Users/ericzhang/code/media/looming/node_modules node_modules`; `cp /Users/ericzhang/code/media/looming/assets/cut/*.png assets/cut/`; `mkdir -p assets/raw/reels && cp /Users/ericzhang/code/media/looming/assets/raw/reels/*.mp3 assets/raw/reels/`. Never commit those.
**Memory (hard rule: the director caps Chrome at 8 GB).** One headless Chrome at a time on this machine, and three other builders render beside you. Before each render batch, wait (a background loop, not a foreground `sleep`, which is blocked) until `memory_pressure -Q` reports at least 25% free **and** `pgrep -f -- '--headless'` finds nothing (a headless Chrome on port 9333 that has been up for days is not a render; ignore it). One page per Chrome, renders of 6 s or less per Chrome, `--w ≤ 960`, sheets and strips only, no full-film renders. A watchdog (tools/watchdog.sh) may kill your Chrome if memory runs out: wait for the gate and retry, don't fight it.
Code is strict TypeScript (`npm run typecheck`; no ts-ignore, `any` only with a why-comment). Never weaken a check. Commit with messages that argue the decision; **no `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge. Write `done/<id>.md` last (from `templates/done-note.md`, ending with `## Story`) and report your branch name and last commit.

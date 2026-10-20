# Brief · v8-trims (s10b 4 s, s17 8 s, s17c 6 s; s18's tag shows the change)

**Type:** builder · **Version:** v8 · **Time box:** about 2 hours; committed working beats polished.
**Read first:** `AGENTS.md`, `docs/notes/v8-beats.md` (the whole v8 story change; the timeline table and **s18's block are your spec**), `docs/shots/s10b.md`, `s17.md`, `s17c.md`, `s18.md` and their `src/shots/*.ts`, `src/timeline.ts`.

## The director, verbatim
On the stacks walk: "the library scene, where I'm walking straight down the library, could lose a little bit" (2 s). The story change: "the second half is weak on the moral and the lessons learned"; the tag must show what he learned without words.

## Do
- **s10b, 6 → 4 s** (beats now `pocketPhone` 0.75, `underLight1` 1.5, `underLight2` 3.0): keep the phone going into the hoodie pocket (s16's relapse pulls it back out) and both strip lights' small pools; tighten the walk, don't just truncate it.
- **s17, 12 → 8 s** (beats `quiet2Start` 0, `dawnBird1` 3, `dawnBird2` 6): keep the sit-back (3.0), the glance and his eyes closing (6.0) and the blob asleep; compress the dawn crawl so the gold light still arrives by the cut.
- **s17c, 7 → 6 s** (beats unchanged): only the end of the grin's hold goes. If the code needs nothing, say so.
- **s18, same 20 s, the tag (14.5–20.0) changes:** the closed laptop stays in its corner and a blank practice page lies on the desk. **14.5–15.5:** his eyes flick to the laptop (the flinch, half a second), then back to the new drop. **16.5 `tagPenUncap`:** he uncaps the pen and makes the first mark on the practice page; the drop stays tiny. It mirrors s03 (same desk, same flinch, the other answer).
- A **v8** block at the top of each shot doc, winning over the text below it.

## Owns
`src/shots/s10b.ts`, `s17.ts`, `s17c.ts`, `s18.ts`, their `docs/shots/*.md`, `evidence/v8-trims/`, `done/v8-trims.md`.
**Not yours:** `src/timeline.ts`, `src/audio/*`, s03, s16 (other builders), every other shot.

## Acceptance
- [ ] `evidence/v8-trims/sheet.jpg`: s10b at 0.5, 1.5, 3.0, 3.9; s17 at 0.5, 3.0, 6.0, 7.9; s17c at 2.0, 5.9; s18 at 14.0, 15.0, 16.5, 19.0 (local; global from `src/timeline.ts`)
- [ ] `node tools/determinism.ts` at one time per changed shot; `node tools/check_timeline.ts`; `npm run typecheck` clean
- [ ] `done/v8-trims.md` ending with `## Story`

## Machine and git
You're in a fresh git worktree, which may be cut from `main`: first `git reset --hard wave/3-assets` (it must contain `5152daa`, the v8 spec). Then `ln -s /Users/ericzhang/code/media/looming/node_modules node_modules`; `cp /Users/ericzhang/code/media/looming/assets/cut/*.png assets/cut/`; `mkdir -p assets/raw/reels && cp /Users/ericzhang/code/media/looming/assets/raw/reels/*.mp3 assets/raw/reels/`. Never commit those.
One headless Chrome at a time on this machine, and two other builders render beside you. Before each render batch, wait (a background loop, not a foreground `sleep`, which is blocked) until `sysctl vm.swapusage` shows at least 1 GB free **and** `pgrep -f 'Chrome.*disable-renderer-backgrounding'` finds nothing; a headless Chrome on port 9333 that has been up for days is not a render, ignore it. `--w ≤ 960`, sheets and strips only, no full-film renders. Code is strict TypeScript (`npm run typecheck`; no ts-ignore, `any` only with a why-comment). Commit with messages that argue the decision; **no `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge. Write `done/<id>.md` last (from `templates/done-note.md`, ending with `## Story`) and report your branch name and last commit.

# Brief · v9-blob (the blob acts; s17c's 85; "Today 9:00 AM")

**Type:** builder · **Version:** v9 · **Time box:** about 3 hours; committed working beats polished. The director is asleep and reviews the rendered film when he wakes: ship what works.
**Read first:** `AGENTS.md`, `docs/notes/v9-beats.md` (**sections 2, 3 and 4 are your spec**), `docs/10-submission.md` (Influences: No-Face), `src/blob.ts`, `src/props/canvas.ts`, and each shot's `src/shots/*.ts` and `docs/shots/*.md` before you touch it.

## The director, verbatim
"Can we add more emotion to the blob? … It's more of a force of nature, so we would really have to think this through from a storytelling perspective." On No-Face: "I wouldn't want to borrow too much from it, but the idea, I like it." On the grade: "I think the 94 is a little unbelievable … 85." On s09a: "the exam is today at 9 am."

## Do
1. **`src/blob.ts`:** add the eye states `plead`, `blank`, `sad`, `shy`, `sleepy` (the table in v9-beats §2). Eyelids, gaze and wobble only: no mouth, brows or new geometry. Keep the `EYE_LIDS` compile gate so a shot that never shows a lidded eye renders bit-identical to v8. Prove it: `node tools/hashes.ts` against `evidence/ts-refactor/baseline.json` for frames in shots whose code you didn't touch (read the tool for its flags), and say in the done note which frames moved and why.
2. **The acting map** (v9-beats §2) in s02, s03, s04, s05, s06, s07, s08, s09a, s09b, s09c, s10, s10b, s11, s13, s15, s16, s17, s17b, s17c. Blinks are two frames of `closed` on 2s. **Big = blank:** from gulp3 in s07 through s10b, no blink and `wobble: 0`, apart from the threshold's confused beat. Keep every shot's timing and every non-blob element unchanged. s13 is crowd-shadow sensitive: if a change there would move its silhouettes, leave s13 alone and say so.
3. **s17c, 94 → 85** (§3): cover the painted 94 with the page's own paper (sample it) and hand-letter a red circled 85 in the film's hand font. Add two red marks on his lines. The CU becomes relief (an existing face, a breath out), not the `pride` grin. The tap lands on the 85. Update the `NINETY_FOUR` naming honestly.
4. **Today** (§4): the root fix in `src/props/canvas.ts`, so the due label derives from the screen's clock (after midnight and before 9:00 → "Today 9:00 AM"). Check every caller (s00, s03, s06, s07, s09a). s00 has no clock and stays "Tomorrow".
5. A **v9** block at the top of each touched shot doc, winning over the text below it.

## Owns
`src/blob.ts`, `src/props/canvas.ts`, `src/shots/s02.ts` through `s17c.ts` (not s00, s01, s18), their `docs/shots/*.md`, `evidence/v9-blob/`, `done/v9-blob.md`.
**Not yours:** `src/timeline.ts`, `src/audio/*`, s18 and the new ending shots (builder v9-ending works beside you).

## Acceptance
- [ ] `evidence/v9-blob/sheet.jpg`: one frame per new eye state, large, plus each shot's key acting beat (s02 blink, s03 plead, s08 blank, s10 confused, s16 sad and shy, s17c the 85 and the relief, s09a's detail screen reading "Today 9:00 AM")
- [ ] The hashes proof for untouched shots (output pasted in the done note)
- [ ] `node tools/determinism.ts` at one time per changed shot; `node tools/check_timeline.ts`; `npm run typecheck` clean
- [ ] `done/v9-blob.md` ending with `## Story`

## Machine and git
You're in a fresh git worktree, which may be cut from `main`: first `git reset --hard v9` (it must contain the commit adding `docs/notes/v9-beats.md`). Then `ln -s /Users/ericzhang/code/media/looming/node_modules node_modules`; `cp /Users/ericzhang/code/media/looming/assets/cut/*.png assets/cut/`; `mkdir -p assets/raw/reels && cp /Users/ericzhang/code/media/looming/assets/raw/reels/*.mp3 assets/raw/reels/`. Never commit those.
**Memory (hard rule: the director caps Chrome at 8 GB).** One headless Chrome at a time on this machine, and another builder renders beside you. Before each render batch, wait (a background loop, not a foreground `sleep`, which is blocked) until `memory_pressure -Q` reports at least 25% free **and** `pgrep -f -- '--headless'` finds nothing (a headless Chrome on port 9333 that has been up for days is not a render; ignore it). One page per Chrome, renders of 6 s or less per Chrome, `--w ≤ 960`, sheets and strips only, no full-film renders. A watchdog (tools/watchdog.sh) may kill your Chrome if memory runs out: wait for the gate and retry, don't fight it.
Code is strict TypeScript (`npm run typecheck`; no ts-ignore, `any` only with a why-comment). Never weaken a check. Commit with messages that argue the decision; **no `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge. Write `done/<id>.md` last (from `templates/done-note.md`, ending with `## Story`) and report your branch name and last commit.

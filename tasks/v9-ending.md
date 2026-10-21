# Brief · v9-ending (s18's slow fade, the title, Seneca, two credit cards, the sting: 3:30 → 3:47)

**Type:** builder · **Version:** v9 · **Time box:** about 3 hours; committed working beats polished. The director is asleep and reviews the rendered film when he wakes: ship what works.
**Read first:** `AGENTS.md`, `docs/notes/v9-beats.md` (**section 1 is your spec**), `docs/contracts.md` (§film, §shots), `src/timeline.ts`, `src/shots/_template.ts`, `src/shots/s18.ts` and `docs/shots/s18.md`, `src/shots/s16.ts` (the phone's light and the wall shadow you echo in the sting), `src/audio/cues.ts`, `src/audio/score.ts`, `tools/check_timeline.ts`.

## The director, verbatim
"I think version 8 ends abruptly." On the Seneca line: "Damn, that Seneca quote goes so fucking hard. I like this longer exit, so yeah, 15 seconds." On the credits: "I like card A, card B, and then after-credit sting, which would be funny." Links: "Maybe just send them to my website?" On the Reels: "we could do its creators. I don't have the creators."

## Do
1. **Timeline:** s18 20 → 21 s (its fade runs 2 s, 19–21, slow on the "1."), then new shots **s19** title 2.5, **s20** Seneca 3.5, **s21** card A 3, **s22** card B 4, **s23** sting 3. DURATION and check_timeline's TARGET become **227**. Every time before s18's fade must stay exactly as v8's.
2. **The cards (s19–s22):** cream cardstock under the lamp's warm key, the paper boil, navy lettering in the film's hand font (find where s18 letters "Final" and "1."), hard cuts, **no red**. Use the **exact strings** from v9-beats §1, character for character (AI², the ·, the ©). Invent nothing. Text must be readable at 1080p for the shot's whole length; keep a safe margin. In s19 the dot of the *i* in *Looming* is the drop: tiny, black, and it quivers once.
3. **The sting (s23):** v9-beats §1, as written. Use s18's desk, lamp and empty chair, the phone from s16 (face up, lit by itself, the Reel), and the light rule's wall shadow. The blob uses the eye states that exist today (`open`, `closed`, `side`, `tired`, `worried`); the orchestrator swaps in v9-blob's new `sad` after both merge. The blob does not grow (no gulp).
4. **Audio:** the theme on felt piano from the title (s19) through card B (score.ts's existing theme and `piano` voice), resolving by the sting. A card-tap foley on each card's cut. For the sting: the buzz, then `DepVdpeJdCN` from its build (the same clip as s16; never commit it), cut dead on the face-down flip, then room tone. **The selftest must still pass** (`node src/audio/selftest.ts`, including the lamp clicks ±1 LSB); don't move any cue before 209.
5. `docs/shots/s19.md`–`s23.md` (short), and a v9 block at the top of `docs/shots/s18.md`.

## Owns
`src/timeline.ts`, `tools/check_timeline.ts`, `src/audio/*`, `src/shots/s18.ts`, new `src/shots/s19.ts`–`s23.ts`, their docs, `evidence/v9-ending/`, `done/v9-ending.md`.
**Not yours:** `src/blob.ts`, `src/props/canvas.ts`, s00–s17c (builder v9-blob works beside you).

## Acceptance
- [ ] `evidence/v9-ending/sheet.jpg`: s18 at 19.0, 20.0, 20.9; s19 at 0.4, 1.2, 2.4; s20 at 2.0; s21 at 1.5; s22 at 2.0; s23 at 0.2, 1.0, 1.9, 2.4, 2.9 (local times)
- [ ] `node tools/mix.ts` then `node src/audio/selftest.ts` passing (output in the done note)
- [ ] `node tools/determinism.ts` at one time per new shot; `node tools/check_timeline.ts`; `npm run typecheck` clean
- [ ] `done/v9-ending.md` ending with `## Story`

## Machine and git
You're in a fresh git worktree, which may be cut from `main`: first `git reset --hard v9` (it must contain the commit adding `docs/notes/v9-beats.md`). Then `ln -s /Users/ericzhang/code/media/looming/node_modules node_modules`; `cp /Users/ericzhang/code/media/looming/assets/cut/*.png assets/cut/`; `mkdir -p assets/raw/reels && cp /Users/ericzhang/code/media/looming/assets/raw/reels/*.mp3 assets/raw/reels/`. Never commit those.
**Memory (hard rule: the director caps Chrome at 8 GB).** One headless Chrome at a time on this machine, and another builder renders beside you. Before each render batch, wait (a background loop, not a foreground `sleep`, which is blocked) until `memory_pressure -Q` reports at least 25% free **and** `pgrep -f -- '--headless'` finds nothing (a headless Chrome on port 9333 that has been up for days is not a render; ignore it). One page per Chrome, renders of 6 s or less per Chrome, `--w ≤ 960`, sheets and strips only, no full-film renders. A watchdog (tools/watchdog.sh) may kill your Chrome if memory runs out: wait for the gate and retry, don't fight it.
Code is strict TypeScript (`npm run typecheck`; no ts-ignore, `any` only with a why-comment). Never weaken a check. Commit with messages that argue the decision; **no `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge. Write `done/<id>.md` last (from `templates/done-note.md`, ending with `## Story`) and report your branch name and last commit.

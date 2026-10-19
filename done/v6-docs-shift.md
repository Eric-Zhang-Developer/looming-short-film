# Done · v6-docs-shift

v6's s10b (1:50-1:56, 6 s) pushes every shot from s11 on 6 s later; the film is 3:21 (201 s). `src/timeline.js` is the source of truth. Docs only; one mechanical commit.

Checked with `node`: every s11-onward start in `docs/02-story.md`, every shot-file `**Time:**` range, and every local/global beat time on those lines match the timeline (all ok), and `node tools/check_timeline.mjs` passes (22 shots, 73 beats, 201.0 s).

| File | Lines changed |
|---|---|
| `docs/02-story.md` | 14 (beat-sheet runtime, Act 4 / Payoff / Ending ranges, s13 s15 s16 s17 s17b s17c s18 and Tag times) |
| `docs/shots/s11.md` | 1 |
| `docs/shots/s13.md` | 1 |
| `docs/shots/s15.md` | 1 |
| `docs/shots/s16.md` | 1 |
| `docs/shots/s17.md` | 1 |
| `docs/shots/s17b.md` | 1 |
| `docs/shots/s17c.md` | 1 |
| `docs/shots/s18.md` | 4 (time line; last frame 194.958 -> 200.958; silence at 195.0 -> 201.0, twice-stated) |
| `README.md` | 2 (doc 02 blurb, Runtime row) |
| `docs/04-technical.md` | 1 (`check_timeline` target, 3:00 -> 3:21, matches `TARGET = 201`) |

Total 28 lines in 11 files.

## Left alone
- `NOW.md`: every runtime in it is a dated statement about a past build (v5 master 3:15, v2/v3 3:15, v1 3:00). No current-cut line to change.
- `docs/06-production-plan.md`, `docs/11-roadmap.md`, `docs/04-technical.md` line 58: the 3:00 figures are the original plan, budget and milestone targets, not the current cut.
- `docs/shots/README.md` line 5 ("the v4 cut, 3:15") and its shot order, which lacks s10b; adding s10b is a content edit, not a time shift.
- `docs/shots/QUESTIONS.md`: dated, superseded Q3 mentions 2:44.0; s11 sensor-era text elsewhere untouched.
- Historical and submitted docs, `done/`, `tasks/`, `evidence/`.

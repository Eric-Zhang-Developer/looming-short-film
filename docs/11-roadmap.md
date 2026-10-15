# 11 · Roadmap: rough first, then final

**This supersedes doc 06's six-week calendar.** Doc 06's principles and checklists still apply. Its week table assumed a much slower build than the agents actually run at, and a deadline that turned out to be Oct 15.

## The plan in one line
**Ship a complete rough draft tonight. Finish the polished film before competition day. Show the two side by side.**

Director, 2026-10-15: "having a shitty rough draft, fully fleshed out, and then doing a final compared to the final polished version will be really, really satisfying."

Why this is the right shape:
1. **It's the film's own thesis.** The first step is small and ugly and still the thing that matters. The rough cut is the production's "write your name at the top of the page".
2. **The comparison is evidence.** A rough-against-final split screen shows the process (the Strategies criterion) in a way a black-box AI video can't.
3. **Story locks before art.** A change after watching the rough is cheap; a change after the art is painted is expensive.

## Key dates
| Date | What | Source |
|---|---|---|
| **Thu Oct 15, 11:59 PM EDT** | ProposalSpace submission deadline | ProposalSpace call page (read 2026-10-15) |
| **Mon Oct 26** | AI Days student competitions (Gator Create), Reitz Union Grand Ballroom | ai.ufl.edu AI Days page |
| **Tue Oct 27** | People's Choice announced (if it runs as in 2025) | UF News, 2025 |
| Open | Can submitted files be updated before Oct 26? | Director to ask ai@ufl.edu / (352) 294-1895 |

## Milestones
| Milestone | Tag | Content | Target |
|---|---|---|---|
| **M1 · Rough draft** | `v1-animatic` | A complete 3:00 story reel: all 18 shots readable and on their beats, with placeholder art, motion-sensor lights at Marston and temp sound. Published on YouTube at full quality (the director uploads it), with a compressed backup copy under 10 MB in ProposalSpace. | **Oct 15, by 8 PM for director review** |
| M2 · Story lock (G4) | none | The director's notes pass on M1, plus 3 cold viewers. Fold in the blob dread meter and any notes. | Oct 16–17 |
| M3 · Look lock (G2 / G3) | `v0-test-shot` | Face sheet frozen. Rig refit to the frozen gator. One shot (s15) at final art as the test. | Oct 17–18 |
| M4 · Final art | `v2-rough-cut` | Sets and props painted from the UF reference (Marston, Plaza). Every shot at final art. First mix. | Oct 18–22 |
| M5 · Final | `v3-final` | Colour, final mix (measured on the exported MP4, aiming at YouTube's ~−14 LUFS), captions, a full-quality master for YouTube, plus a compressed backup copy under 10 MB for ProposalSpace. | Oct 23–24 |
| **M6 · The comparison** | (in the `v3-final` release) | A split screen of `v1-animatic` and `v3-final`, frame-aligned, plus a short "paintings vs lit and cut" panel. For competition day and the write-up. | Oct 24–25 |

Dates after M1 assume files can be updated before Oct 26. If the organisers say tonight's upload is final, M2–M6 still happen, for the competition-day screening, the public release and the portfolio. The dates hold either way.

## The rule that makes the comparison work
**The rough and the final share one timeline.**
- Beat **times** and **cut points** don't move after M1 unless the director's notes change the story at G4. If they do, the comparison aligns by beat name, not by frame.
- Each shot keeps its camera framing between rough and final unless a note changes it. Art and light quality improve, while the staging stays.
- `v1-animatic` is tagged and released with its MP4 **before** any later work, and is never overwritten.
- Shots keep tunables like `BLOB_R` as named constants at the top of the file, so a final pass changes values without re-staging.

## Status (keep current)
- **M1:** s01–s13 and s15 are merged as blocking. Tonight's reel bar is running for s15 (sensor turn) and s16, with s14, s17 and s18 next. Then render, encode and review.
- Frozen: the style tile, gator sheet and gator hero. Face sheet v1 is awaiting a pick.
- Decided today: motion-sensor lights at Marston, the blob dread meter (spec in progress), and this roadmap.

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
| **Thu Oct 15, 11:59 PM EDT** | Draft submission: **an incomplete draft is fine** | Organisers, by phone (director, 2026-10-15) |
| **Sun Oct 18, 11:59 PM** | **Final submission deadline.** A YouTube link and the GitHub repo can be submitted. | Organisers, by phone (director, 2026-10-15) |
| **Mon Oct 26** | AI Days student competitions (Gator Create), Reitz Union Grand Ballroom | ai.ufl.edu AI Days page |
| **Tue Oct 27** | People's Choice announced (if it runs as in 2025) | UF News, 2025 |
| Context | About 70 proposals in progress, 30–50 submissions expected | Organisers, by phone |

## Milestones (compressed to the Sunday deadline)
| Milestone | Tag | Content | Target |
|---|---|---|---|
| M0 · Draft submitted | none | Tonight's answers (`docs/10b`) and the current preview. Incomplete is fine. | **Thu Oct 15, by 11:59 PM** |
| **M1 · Rough draft** | `v1-animatic` | The complete 3:00 story reel: all 18 shots on the final timeline, placeholder art, motion-sensor lights, temp sound. Tagged and released before anything else lands. | Thu night / Fri morning |
| M2 · Story lock (G4) | none | The director's notes on M1, plus 3 cold viewers. Blob dread meter into the shots (spec merged). Q11–Q15 answered. | Fri Oct 16 |
| M3 · Look lock (G2 / G3) | `v0-test-shot` | Face sheet frozen (v1_3 recommended). Rig refit to the frozen gator. s15 at final art as the test. | Fri Oct 16 |
| M4 · Final art | `v2-rough-cut` | Sets and props painted from the UF reference. Every shot at final art. First mix. | Sat Oct 17 |
| M5 · Final | `v3-final` | Colour, final mix, captions, and a **4K master rendered overnight Sat→Sun**, with nothing else running. | Sun Oct 18, morning |
| **M6 · Submit** | (release) | The director uploads to YouTube. The comparison split screen (v1 against v3) goes in the release. The final answers, the YouTube link and the GitHub repo go into ProposalSpace. | **Sun Oct 18, well before 11:59 PM** |

The schedule is tight but realistic at today's pace: about 17 shots blocked in one day. The real limits are machine RAM (two builders at once) and the 4K render time, not agent speed. Buffer: if M4 slips, ship a 1080p final on Sunday and keep 4K for a post-deadline release.

## Fidelity target for `v3-final` (director: "The final version should be as high fidelity as possible.")
- **Render a 4K master** (3840×2160, 24 fps). YouTube serves 4K uploads with better codecs (VP9 or AV1) to every viewer, so even people watching at 1080p see a cleaner picture than a 1080p upload gives them.
- **Anti-aliasing:** render with supersampling, or at 4K and downscale for any HD copy. The torn paper edges and fibre rims are where aliasing shows first.
- **Shadows:** raise shadow-map resolution per shot until the soft edges stop stepping at 4K, especially the s15 loom collapse.
- **Art resolution:** close-ups use `gator_hero` and the largest generations available. Any frozen asset that's softer than its on-screen size at 4K gets regenerated or upscaled before the final pass, and listed here.
- **Master files:** a near-lossless master (ProRes 422 HQ or H.264/H.265 at a high bitrate) for YouTube and the GitHub Release. Audio at 48 kHz/24-bit in the master and AAC 320 kbps in the upload. The compressed copy under 10 MB is cut from the master.
- **Cost, honestly:** a 4K frame has 4× the pixels, so the 3:00 film takes a few hours with one browser on this laptop, which needs RAM headroom. Plan the final render overnight, with nothing else running.

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

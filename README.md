# Looming

A 3-minute wordless short film about procrastination, made from paper and light. Every frame is rendered by code.

> A gator student has a final on Friday. The exam is a small drop of ink, but its shadow fills the room.
> The shadow grows with every hour he avoids the work and shrinks the moment he faces it.

**Status:** pre-production. This repo holds only the spec right now. There is no code yet.
**For:** AI² Gator Create Competition 2026, University of Florida. Category: Visual Arts, Narrative & Experimental Animation.
**Made by:** Eric Zhang (director), with Claude as the code collaborator.

## What makes it different

Most AI-made films use glow instead of light, and they cut every two seconds. *Looming* is built on the two things they skip:

1. **Real shadows.** The story's central metaphor, a shadow that looms larger than its source, is computed by a real light rig. The metaphor is the algorithm.
2. **Stillness.** Two long held shots where nothing happens except light moving across paper.

## Read the spec in this order

| Doc | What it covers |
|---|---|
| [01 Competition](docs/01-competition.md) | Brief, criteria, category, AI framing, submission answers |
| [02 Story](docs/02-story.md) | Logline, the visual rule, characters, 3:00 beat sheet |
| [03 Art Direction](docs/03-art-direction.md) | Paper diorama look, materials, palette, lighting, references |
| [04 Technical](docs/04-technical.md) | three.js 2.5D architecture, paper generator, render pipeline |
| [05 Sound](docs/05-sound.md) | Code-synthesized score, foley, mix |
| [06 Production Plan](docs/06-production-plan.md) | Test shot, milestones, shot list, risks |
| [07 Process Log](docs/07-process-log.md) | Director's log format and the decisions made so far |
| [08 Image Pipeline](docs/08-image-pipeline.md) | How Claude drives Codex image gen: prompts, references, the pick-and-freeze loop |

## Locked decisions

| Decision | Choice |
|---|---|
| Runtime | 3:00 (about 30 s of it held quiet shots) |
| Dialogue | None. No legible text anywhere on screen. |
| Characters | Paper-cutout gators. The Exam is the only thing made of ink. |
| Look | Lit paper diorama: torn-paper cutouts on separate depth planes, real light, real shadows |
| Engine | three.js scene of flat paper planes; frames rendered headless and encoded with ffmpeg |
| Painted surfaces | Claude prompts Codex image gen with reference images; the director picks; picks are frozen in `assets/` with a manifest. Code cuts, lights and rigs them. |
| Sound | Synthesized in code and locked to the timeline. No vocals. |
| Team | Solo director plus Claude as code collaborator |
| Deadline | Final due date to confirm on ProposalSpace; the plan assumes 6+ weeks |

## Ground rules for anyone (human or AI) working in this repo

- Read `docs/` before writing code. If the code and the spec disagree, fix the spec first, then the code.
- Every frame is a pure function of time `t`. No wall-clock time, no unseeded randomness.
- No on-screen words, captions, HUDs or UI. If a beat needs text to read, the beat is wrong.
- Every non-trivial decision goes in the process log (see doc 07).
- Generated images are assets, never render-time calls. Every one is listed in `assets/generated/manifest.json` with its prompt, model, date and hash.
- `reference-videos/` is gitignored. It holds third-party videos used only for study.

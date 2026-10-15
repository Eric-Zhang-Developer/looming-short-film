# Done · smoke-codex

## What shipped
One headless `codex exec` call made one style-tile image. Codex copied it into `assets/raw/style_tile_v1.png` itself, with no person in the loop. The five-block prompt, the thumbnail and sidecar, the keyed preview and a contact sheet are committed. 1 of 2 allowed generations used.

## Where it lives
- Prompt: `assets/prompts/style_tile.v1.md` (commit 4d13da0)
- Output: `assets/raw/style_tile_v1.png`, 1983x793 RGBA, sha256 `63d28358…bbadc` (gitignored, local only)
- Thumb and sidecar: `assets/raw/thumbs/style_tile_v1.jpg`, `assets/raw/thumbs/style_tile_v1.json` (commit 9c88477)
- Evidence: `evidence/smoke-codex/` `codex_events.jsonl`, `last_message.txt`, `keyed_preview.png`, `contact.jpg` (commit 9c88477)

## How it was checked
Command (run from the worktree root; the run-time prompt is the committed file plus a two-line `## Output` block asking for `assets/raw/style_tile_v1.png`):
`codex exec -C <worktree> -s workspace-write --json -o evidence/smoke-codex/last_message.txt -i /Users/ericzhang/code/media/looming/reference-videos/frames/torn_paper_ref.jpg - < <prompt> > evidence/smoke-codex/codex_events.jsonl`

- [x] No interactive prompt: exit code `0`. stderr held only `Reading prompt from stdin...`. Events go `thread.started` → `turn.started` → 6 items → `turn.completed`, with no approval request. Ran inside the normal shell sandbox, with no sandbox override.
- [x] `assets/raw/style_tile_v1.png` exists. **Codex saved it there itself**: event `item_5` is its own `cp ~/.codex/generated_images/01a13f9d-…/exec-dc6b48b6-….png assets/raw/style_tile_v1.png`. The sha256 values of the source and the copy match. No manual copy.
- [x] Thumbnail (1024x410, alpha flattened over white) and sidecar are in `assets/raw/thumbs/`.
- [x] Keyed preview: `evidence/smoke-codex/keyed_preview.png`. The output has **real alpha, not a green key** (64.5% of pixels alpha 0, with RGB 0,0,0 underneath). The preview composites that alpha over #808080 with ffmpeg `overlay`. I checked 3x crops of the wall and desk edges: the cutout is clean, the soft edge is 1–2 px, and I saw no halo or spill. On black, a few very low-alpha edge pixels carry saturated red or yellow RGB. They don't show over grey. `colorkey` on #00FF00 had nothing to key.
- [x] Screening covers each checklist item. Details are in the sidecar `screening` field:
  - **Baked light:** no cast or drop shadows and no glow. Mild form shading remains on the desk apron, the lamp-shade pleats and the laptop bevel.
  - **Background:** flat and keyable via alpha, but not the green that was asked for.
  - **Pieces:** 5 pieces, all separated, none cropped. Gaps are 32–36 px (asked ~40).
  - **Text:** none. The calendar boxes are blank.
  - **Palette:** mostly on palette, with one red circle. The desk is darker than kraft.
  - **Resolution:** 1983x793.
- [x] Usage: from `turn.completed`: `input_tokens 192810, cached_input_tokens 166784, output_tokens 1355, reasoning_output_tokens 175`. These are Codex agent tokens only. **Image cost: unknown.** No event carries an image or `image_gen` usage field, and the `image_gen` call does not appear in the event stream at all. Plan-limit cost was not checked: there is no field for it, and I didn't open account pages.
- [x] Wall clock: 88 s, 2026-10-15T12:50:46Z → 12:52:14Z.

## Gaps
- **The key colour was ignored.** The prompt asked for #00FF00 three times and Codex returned transparency. Its last message says so ("the background is transparent instead of solid green"). The `image_gen` request isn't logged, so I can't tell whether Codex asked for transparency or the model produced it. Its imagegen `SKILL.md` steers transparent requests to native alpha. I didn't spend run 2 on this: the brief says not to regenerate for quality, and the alpha keys clean. Doc 08 / `cut.mjs` may want to accept alpha as well as a key colour. That is a contract decision for the orchestrator.
- **Model unknown.** No model name appears in the events.
- **Unrequested content.** The wall piece has a window with a moon, stars and a city skyline, plus pinned notes.
- **"Largest landscape size" unverified.** 1983x793 is what came back. Each piece is only about 300–500 px wide.
- **Codex read the repo on its own initiative.** It read `AGENTS.md`, the brief and the docs (`item_1`, `item_3`, `item_4`), and it read its own `~/.codex/skills/.system/imagegen/SKILL.md`. Their full text is now in `codex_events.jsonl`. No secrets matched in a grep for key/token patterns.
- **Spec tension, noted, not changed.** The verbatim style block lists gator green. The asset block overrides it ("no gator green here") as the brief asked.
- **Process log not updated.** Doc 06 wants the usage noted in the process log, but `docs/07` isn't in my owns.

## State
built · 2026-10-15

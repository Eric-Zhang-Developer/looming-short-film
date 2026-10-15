# Done · tool-gen

## What shipped
`tools/gen.mjs` runs the doc 08 loop for one asset. It builds the prompt from the shared blocks plus the asset's own block, runs one `codex exec` per variant in a fresh temp dir, copies the image into `assets/raw/`, and writes a thumbnail, a sidecar and a contact sheet. It enforces the 8-generation cap. `tools/cut.mjs` crops a sheet into RGBA parts, using boxes you give it or boxes it proposes from alpha islands (`--auto`). The shared blocks live in `assets/prompts/_blocks/`, and `assets/specs.json` has the style tile entry.

## Where it lives
- `assets/prompts/_blocks/{style,lighting,technical}.md`, `assets/specs.json` (62c9d76)
- `tools/gen.mjs`, `evidence/tool-gen/dryrun.txt`, `evidence/tool-gen/cap.txt` (138204f)
- `tools/cut.mjs`, `evidence/tool-gen/cut.txt`, `evidence/tool-gen/cut_contact.jpg`, `evidence/tool-gen/style_tile_v1.boxes.json` (3fa118f)

## How it was checked
- [x] Dry run prints the full prompt and the exact command: see `evidence/tool-gen/dryrun.txt`. It shows blocks 1–4 in order plus the `## Output` run-time line, and for each of 3 variants the `RUN=$(mktemp -d …)` line followed by `codex exec -C "$RUN" -s workspace-write --json --skip-git-repo-check -o "$RUN/last_message.txt" -i <ref> -`, with the prompt on stdin. Block 5 (notes) is only included when the asset file has a `## 5.` section. style_tile v1 has none, so the dry run prints four blocks.
- [x] 8-generation cap: see `evidence/tool-gen/cap.txt`. I added empty placeholder PNGs to `assets/raw/` and removed them afterwards. At 7 used, 7+1 is allowed (exit 0) and 7+2 is `REFUSED` (exit 1). At 8 used, `--variants=1` is refused in dry-run mode and in live mode. The live-mode refusal exits before any `codex` call.
- [x] `cut.mjs --auto` finds 5 pieces and writes 5 clean RGBA parts: `evidence/tool-gen/cut.txt` reads `5 alpha island(s): 5 kept, 0 dropped`. The 5 parts are rgba at 520x604, 384x312, 308x368, 320x412 and 375x167. I looked at `evidence/tool-gen/cut_contact.jpg` (each part scaled to 300 px tall, over grey and over magenta): wall, desk, calendar, lamp and laptop each appear whole, with no slivers from neighbours and no visible halo. A 3x zoom of the lamp crop's lower right corner, where it overlaps the laptop, showed only magenta, and a pixel count of that area gives 0 nonzero-alpha px.
- [x] No credential or auth file is read: `grep -n -i "auth" tools/*.mjs` gives no matches (exit 1). `grep -n -i "codex/\|\.codex\|token\|secret\|credential" tools/*.mjs` also gives no matches (exit 1). gen.mjs only searches the Codex event stdout for a `generated_images/…png` path. It reads no file under `~/.codex`.
- [x] I also checked the green-key fallback, which isn't an acceptance item. I flattened the tile over #00FF00 in a scratch dir and ran `cut.mjs --auto` on it. It reported `keyed #00FF00 (tol 80)` and found 5 islands. The test parts were deleted afterwards.
- [x] I ran gen.mjs's ffmpeg thumbnail and contact-sheet filters by hand on the style tile. The thumbnail came out at 1024x409 with alpha over white, and the contact sheet hstacked correctly.

## Gaps
- **The live gen.mjs path has never run.** The brief bans live generation, so the spawn, the image search, the copy, the sidecar and the per-run contact sheet are all unverified end to end. The first wave 3 call is the real test.
- **`--skip-git-repo-check` is new.** Wave 1 ran inside the worktree, which is a git repo. A mkdtemp dir isn't one, and `codex exec --help` says the flag is needed outside a repo. That Codex still triggers `image_gen` and saves `out.png` in a temp dir is unverified.
- **Ref paths in a worktree.** `reference-videos/` is gitignored, so `reference-videos/frames/torn_paper_ref.jpg` is missing in this worktree. The dry run warns about it, and a live run refuses. Live runs need to happen in the main checkout, or with the frames copied in.
- **The style_tile v1 asset block conflicts with the new technical block.** `assets/prompts/style_tile.v1.md` was written in wave 1 as a complete prompt. Its block 3 still says "Background key: green #00FF00", while the shared technical block now asks for alpha first (doc 08 wording). gen.mjs uses only that file's `## 3.` section. A v2 prompt should drop the green line, but `assets/prompts/*.md` outside `_blocks/` isn't in my owns.
- **cut.mjs writes RGBA, not RGB plus a separate mask.** Doc 08 step 8 says "RGB plus mask", and the brief and contracts say RGBA. I followed the brief. Doc 08 needs a one-line fix.
- **cut.mjs also clears faint alpha.** Pixels below alpha 16 that sit outside every island's 4 px cells (1.9k–7k per part on this tile) are cleared along with neighbour islands. This could shave an outermost AA pixel at about 6% opacity. I saw no difference in the contact sheet.
- **The color key is a hard key** with no despill and no soft edge, marked `ponytail:` in the code. It only runs when a sheet has no transparency at all.
- **Choices made where the spec was silent:**
  - `--auto` writes and cuts in one step. Auto part names are `<stem>_1..N`, left to right, and can be renamed in the boxes JSON and re-cut with `--boxes`.
  - The cap refuses when count plus requested variants would exceed 8, not only once 8 is reached.
  - The count includes legacy names like `style_tile_v1` and committed sidecars.
  - The spec gains an optional `key: { name, hex }` field (default green #00FF00) for magenta-keyed green characters.
  - The sidecar `screening` starts as `null`.
- **Full-size parts aren't committed.** `assets/cut/style_tile_v1_{1..5}.png` are untracked in the worktree, as the brief requires. `assets/cut/` isn't gitignored, and `.gitignore` isn't in my owns, so a careless `git add -A` would pick them up.
- **An unrelated file is in the tree:** `Gator Create Competition - Transcription.md` at the repo root, from commit 309bb41, not mine. I left it alone.

## State
built · 2026-10-15

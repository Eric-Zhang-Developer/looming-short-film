# ts-check: frames before vs after

24 stills at 1920×1080, rendered in order (ascending t) from a fresh page each run:
`node render.mjs --page=index.html --stills=<times> --out=<dir>`, then `shasum -a 256` on each PNG.

- **before:** `wave/3-assets` at 3012a96, in the `task/ts-check` worktree before any edit. Rendered twice (runs A and B); the two runs match on all 24.
- **after:** the type pass at 4827451 (tsconfig, JSDoc, `// @ts-check` on 58 files), same worktree, same command, run from the clean commit (rendered as fb42861: the same tree, 2369b9d, before an earlier commit message was reworded).
- **result:** 24 / 24 identical (before A = before B = after). Full 64-hex hashes: `before.sha256`, `after.sha256`.

Times: one or more per shot in `src/timeline.js` (21 shots), none inside s09a's 73.6–74.5 s window
(docs/notes/v4-fixlist.md: that window differs only when rendered out of order; these runs are in order anyway).
`sheet_after.jpg` tiles the after stills (sorted by file name, so not in time order) to show they're real frames, not
24 copies of a blank canvas: the 24 hashes are all distinct.

| t (s) | shot | before (sha256) | after (sha256) | identical |
|---:|---|---|---|---|
| 2 | s00 | `71b79e8901a75b70…` | `71b79e8901a75b70…` | yes |
| 6.5 | s01 | `d595d1d163dca352…` | `d595d1d163dca352…` | yes |
| 14 | s02 | `ce2b205df3405b73…` | `ce2b205df3405b73…` | yes |
| 23.5 | s03 | `35c7416ab1850bd5…` | `35c7416ab1850bd5…` | yes |
| 29.5 | s04 | `1dbc8b03fa505191…` | `1dbc8b03fa505191…` | yes |
| 36.5 | s05 | `eb61e880b16bcd24…` | `eb61e880b16bcd24…` | yes |
| 44 | s06 | `8f355593635883b9…` | `8f355593635883b9…` | yes |
| 54 | s07 | `e6b4818e91a19195…` | `e6b4818e91a19195…` | yes |
| 66.5 | s08 | `75b62d2768168610…` | `75b62d2768168610…` | yes |
| 72.5 | s09a | `4cc307e8e773ac85…` | `4cc307e8e773ac85…` | yes |
| 79 | s09b | `c7992b9a597fc362…` | `c7992b9a597fc362…` | yes |
| 87.5 | s09c | `1c0c86ad3c2815d1…` | `1c0c86ad3c2815d1…` | yes |
| 94 | s09c | `aedd62f65dae9fe3…` | `aedd62f65dae9fe3…` | yes |
| 104 | s10 | `0706e971e223573b…` | `0706e971e223573b…` | yes |
| 113.5 | s11 | `54eacdac24e8db21…` | `54eacdac24e8db21…` | yes |
| 119.5 | s13 | `47f9a7975f68ec35…` | `47f9a7975f68ec35…` | yes |
| 127 | s15 | `c709e8a428f64d5a…` | `c709e8a428f64d5a…` | yes |
| 136.5 | s16 | `93966ed7ec34b1dc…` | `93966ed7ec34b1dc…` | yes |
| 143 | s16 | `cec3d1beb6ef4e21…` | `cec3d1beb6ef4e21…` | yes |
| 152 | s17 | `4d17b4d9425611de…` | `4d17b4d9425611de…` | yes |
| 163.5 | s17b | `03329ac8476bf506…` | `03329ac8476bf506…` | yes |
| 172 | s17c | `7de6aae2ad03d944…` | `7de6aae2ad03d944…` | yes |
| 180 | s18 | `0768a0954153c578…` | `0768a0954153c578…` | yes |
| 190 | s18 | `67b32a8ed4dee564…` | `67b32a8ed4dee564…` | yes |

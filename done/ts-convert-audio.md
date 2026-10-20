# Done · ts-convert-audio

## What shipped
All six files in `src/audio/` (synth, wav, cues, foley, score, selftest) are now strict TypeScript. Every parameter is typed and the JSDoc types are now annotations. Cues have a `Cue` type and score events a `ScoreEvent` type, and `PadOpts` and `SubOpts` describe the synth voices' options. Nothing runs differently: the mix, its stems and the selftest output are byte-identical to the baseline.

## Where it lives
- `src/audio/{synth,wav,cues,foley,score,selftest}.ts` (`git mv` from `.js`)
- Importers, specifier only (`.js` → `.ts`): `tools/mix.mjs` (5 imports), `src/shots/s07.js` (`REELS` from cues)
- Branch `worktree-agent-aba29c6e736d7b8fa`: `9e453fe` (the conversion), plus this note's commit
- Evidence: `evidence/ts-convert-audio/proof.txt` (all five proofs, commands and output)

## How it was checked
All five ran after the code commit `9e453fe`. Output is in `evidence/ts-convert-audio/proof.txt`.
- [x] `npm run -s typecheck`: exit 0, no output (both configs). I had grepped `src/audio/*.ts` for `ts-ignore`, `ts-expect-error`, `ts-nocheck` and `any`: no matches.
- [x] `node src/core/selftest.ts`: `selftest: all passed`
- [x] `node src/audio/selftest.ts`: all `ok`. Its output minus the `wrote …` line diffs **identical** against `evidence/ts-refactor/baseline_selftest.txt` (314 cues, 284 score events, clicks `[0,1,1]` LSB, peak 17525).
- [x] `node tools/mix.mjs` → `9801f68535b73559936b6c221e7c3b7dd361c1c8c39624ab0331b318896f51d2`, the baseline's hash. `premix.wav` and the three stems also match `baseline_audio.txt` line for line. This ran with the six clips copied into `assets/raw/reels/` (not committed).
- [x] `node tools/check_timeline.mjs`: `ok (22 shots, 77 beats, 204.0s)`
- [x] `node tools/hashes.mjs --check=evidence/ts-refactor/baseline.json`: `hashes: PASS (240 frames identical)`, exit 0. I waited until free swap was 1059 MB before starting it. The page logged four `404 (Not Found)` resource errors. I didn't look into them because all 240 frame hashes matched the baseline.
- [x] I also checked the code directly. Node's own type stripper (`module.stripTypeScriptTypes`, the same one `node file.ts` uses) stripped each `.ts`. I compared the result with the old `.js` at `3b50a98`, with comments and whitespace removed. The only differences are the import specifiers and redundant grouping parens: `({})` → `{}` in `pad`'s default, and the parens around the six inline tuple tables that took an `as`.

## Gaps
- **Legacy importers annotated: none.** `mix.mjs` and `s07.js` still type-check under `tsconfig.json` with only the specifier changed. `Cue` declares `until?` and `in?`, which `mix.mjs` reads. No cue sets `until` today, but the header comment says it can.
- **`any`: none.** `pad`'s default was `/** @type {any} */ ({})` and is now `{} as PadOpts`. It is still a cast, because `dur` has no default by design.
- **Casts I added (type-only):** three in `renderScore`'s voice dispatch (`e.midi as number[]` and `e as PadOpts` for pad, `e as SubOpts` for sub, `e.midi as number | number[]` for notes). A comment explains them. `ScoreEvent` is one flat shape because a union per voice would need `ev()` rewritten as an overloaded function, and that is a runtime change. Two `!` mark values that can't be null: `dodge(n)!`, since every bar from −8 up finds a dodge, and `cache.get(k)!`, which is set on the line before. In the selftest, `beat(c.until!)` relies on the bed filter `(c.until || c.dur)`.
- Two inline tuple tables in `score.ts` had no JSDoc cast in the `.js`: the `underLight` pair and the `problemSolved` list. Strict mode infers `(string | number)[][]` for them, so they got `as [string, number, number][]`.
- `selftest.ts`'s first-line usage comment now says `node src/audio/selftest.ts`, as `src/core/selftest.ts`'s does. All other comments are unchanged, including the ones that still name `*.js` files (e.g. "src/timeline.js").
- Not verified in a browser beyond the hash run. `s07.js` is the only browser path into this batch.

## Story
The audio is the easiest corner of the import graph to convert. Its six files import only each other and the core, which went first in `8532bfc`, so the brief's rule that a `.ts` file imports only `.ts` files never came up. Most of the work was naming types the JavaScript had never needed: in foley alone, about thirty `(at, g, s)` helpers and filter signatures.

The one real decision was the score. Each event's fields depend on its voice: a pad has a chord and a `dur`, a sub swell a `hz` and a `dur`, the pulse nothing. A discriminated union would say that best, but every event comes from one arrow function, `ev()`, and TypeScript can only connect `voice` to a union member through overloads. That means turning `ev` into a function declaration, which the brief rules out. So `ScoreEvent` is one flat type, and the three places that dispatch on voice cast. The comment above them says why.

Both typechecks passed on the first run. I didn't want "it compiles" to stand for "nothing changed", so before rendering anything I stripped the types with Node's own stripper and diffed the result against the old JavaScript. Ten differences came back, all import specifiers or parentheses. Then the mix gave `9801f685…`, and the stems matched too.

## State
built · 2026-10-19

# 11 · The overnight run

## What the director said, and what he said before bed

Eric watched `v1_animatic` on the evening of October 15 and wrote his notes in one go. They're saved verbatim in [`docs/notes/g4-2026-10-15.md`](../notes/g4-2026-10-15.md). The orchestrator committed them at 22:00 together with its decisions (`3670600`) so that overnight agents would "work from the decision rather than a summary of it."

What he liked was short. "I really like the noises here. It's odd and I like how it's so animated." He liked the blob, "more animated and less paper-cut", and told them to keep it that way. He liked the library: "I really like how lighting is used. I think it's a really smart design decision."

What he didn't like was longer. "The house is really ugly in the first scene and also that's a fucking massive table." The kitchen "really doesn't look like a kitchen." The blinds scene didn't tie into the story. The film needed context scenes at the start, a calendar that says "calculus exam" or something close, and "maybe 10 to 20 seconds of satisfying payoff", with the gator practising Calc 2 and then getting a good grade. The pocket ending "doesn't pay off"; the blob should shrink or disappear when the calendar event is over.

The rules for the night came from him too: "I just want you to do two polish passes, with version 3 being close to complete. I don't look at it, and we can still make drastic changes because we still have time." The orchestrator's version of that, written down in [doc 07](../07-process-log.md), was: v2 complete, then v3 close to complete, and it may freeze art by rule ("most cut-paper, most Marston, simplest") if every freeze is listed with its alternatives for the morning ([`morning-picks.md`](../notes/morning-picks.md)). No public actions. No story changes beyond the notes. The commit at 22:03 (`4d1c136`) also set the pace: two agents at most, because of the director's usage limit.

## The rule that changed at 22:01

The orchestrator's first reading of the G4 notes was to keep the film wordless: draw the exam as ∫ … dx and let the director overrule. He overruled it while the run was starting. Doc 07 has his words: "Let's remove that rule, but use text very sparingly." The commit (`e8a4e32`, 22:01) turned "no legible text" into "rare and deliberate", because the film's restraint was part of its taste. The same commit froze face sheet v1_3, since nothing could build the real gator without one.

## The gator was already approved

The first big task was the one the earlier chapters had been waiting for. [`cut-gator`](../../done/cut-gator.md) (`f2bcd22`, 22:35) swapped the stand-in rig for the frozen art, and its builder's plan broke on the first overlay. The cut parts aren't the figure taken apart: the sleeve was about twice the arm's length, the snout 1.45× too big. Each part got its own scale, pinned on hip-to-shoulder = 0.030 because every desk shot's hand path depended on it. The cost: the gator became 9.3 cm tall, not 8. [`evidence/cut-gator/shots.jpg`](../../evidence/cut-gator/shots.jpg) shows the felt-paper gator in six shots, and the six shots show the frozen felt-paper gator in place of the proxy.

## The table was the desk

[`spec-g4`](../../done/spec-g4.md) (`428a0ac`, 22:41) put the notes on paper: 21 shots, 3:15, with the timeline check at "ok (21 shots, 58 beats, 195.0s)". Its builder found the surprise. Sized at the scale the desk's height implied, the home desk came out 7.3 metres wide. The "massive table" wasn't a placeholder painting. It was the desk unit that every desk shot had been solved on. The builder wrote that down rather than fix it, which sent the problem to the v2 shots.

Two things went wrong here. The README and the contracts weren't spec-g4's to change, so they stayed stale until the orchestrator fixed them by hand (`aab8a89`): "the next builders would read 180 s and 'no on-screen words' and fight the new specs." The spec's honest beat names also broke `cues.js`, so the sound had to wait.

## Five kits, by rule

Between 22:51 and 00:36 the painters worked through the kits, one Codex call at a time, with every freeze entered in the morning picks:

- **Home and kitchen** ([`asset-home-kit`](../../done/asset-home-kit.md), `aa7cef1`). Every piece is sized against the gator in [`scale.jpg`](../../evidence/asset-home-kit/scale.jpg). The brief said the gator stood 0.125 m, while the code said 0.096, and the builder trusted the code. Its first launch ran a tidy-up `sed` in front of the Codex call. The `sed` failed, the chain stopped before the commit, and the generation on the next line ran anyway.
- **Marston** ([`asset-marston-kit`](../../done/asset-marston-kit.md), `413c299`). Painted from the director's own photos, described in text only because they show real students. The Y-backed chair was the one thing that mattered, and the first sheets drew it only from behind. Two revision calls fixed the Y in the three-quarter and rear views. The side chair only got a dark rib, and the builder stopped there.
- **Props** ([`asset-props-kit`](../../done/asset-props-kit.md), `d654322`). Now that words were allowed, Codex had to paint them. The builder read every lettered piece back from crops ([`text_check.md`](../../evidence/asset-props-kit/text_check.md)) and worked the integral by hand. The sign error is painted on purpose, struck through, for a later shot.
- **Cast** ([`asset-cast-kit`](../../done/asset-cast-kit.md), `89e75b3`). A heron and a bear for the roommates, gators at Marston, and a tortoise custodian. The tortoise wasn't in doc 02, which says "older gator". It came from the orchestrator's brief, and the commit flags it for the director. The mop came back more than three times too wide, because the image model ignores aspect ratios.

Each freeze took the painter's first-ranked variant (for Marston's interior, that was the revision v2_1), as the morning picks table records.

## The sound, from a machine that can't hear

[`snd-g4`](../../done/snd-g4.md) (`ea0dead`, 23:05) began with an error, `unknown beat: nextSemester`. The shortcut was to alias the seven dead beat names. It re-hung every cue on the spec's beats instead, because "a re-cut moves it." The first mix failed loudness, and the builder's own bug was in the limiter: its search for the lamp click had found the paper-boil bed that restarts on the same beat. The final mix targets −16 LUFS and −4 dBTP. v1 had run at −13.9 and −1.6. Nobody has heard it. The note's Gaps say the director's listening pass is still owed.

## v2: the rooms get built

Four shot batches followed, each on the frozen kits: [`v2-home-b`](../../done/v2-home-b.md) (kitchen and bedroom, `b9e7eec`, 23:43), [`v2-marston-a`](../../done/v2-marston-a.md) (`9b821df`, 23:53), [`v2-home-a`](../../done/v2-home-a.md) (the opening and the home desk at real scale, `331c5db`, 00:10), [`v2-marston-b`](../../done/v2-marston-b.md) (`a0b53fd`, 00:18). Two of them hit an `assets.js` conflict with a neighbouring kit and resolved it by keeping both blocks.

The blinds became causal. Each blind lowers the loom's contrast, 18% → 47% → 90%, and the builder had to measure and re-light until it reached exactly 90.0% (`evidence/v2-home-b/checks.txt`).

Last came [`v2-payoff`](../../done/v2-payoff.md) (`c75dc33`, 00:44): test day, the graded 94, and a calendar ending that replaced the pocket. Its ink soak was nearly invisible at the spec's opacity, because the stain's darkness is only a fraction of it ([`s18_soak_strip.jpg`](../../evidence/v2-payoff/s18_soak_strip.jpg)).

The commit messages are honest about the leftovers. s01's skyline, s05's roommates, the custodian and the writing hand were all still proxies ("Rough: …"). The orchestrator's own v2 review is the first half of the v3 fix list ([`v3-fixlist.md`](../notes/v3-fixlist.md)).

## What a stranger saw

The v2 render ran in 30-second chunks, logged in the local `out/v2_render.log` between 00:44 and 01:26, and wrote `out/v2_rough_cut.mp4` at 01:29: 195.000 seconds of film, with the log never showing less than 10 GB free. Then a fresh agent saw nine frame sheets, one frame every two seconds, with no spec and no sound. Its answers were saved verbatim ([`evidence/cold-v2/report.md`](../../evidence/cold-v2/report.md), `4b7df3b`, 01:32).

It got the story: a notification, a calendar, a blob that appears under the circled exam, a 94, and "Final" circled with a small blob under it. It couldn't say why the shadow grows and shrinks ("Can't tell what triggers each swell"). It couldn't see the hinge: "I saw no clear turning point." It also couldn't find the gator in the exam hall, which it called a "lecture hall of frogs".

The report carries its own caveat. Stills every two seconds hide fast cause and effect, such as a light snapping on, so the two failures are probably understated. But the rule and the turn are the film's thesis, and the commit says they outrank every polish item. One loose end: the report's own header says 1:50 AM, while the commit that saved it is stamped 01:32.

## v3: two passes before the stranger's note

Two v3 passes had landed, and the third was running, when the cold read came in. [`v3-fix-home`](../../done/v3-fix-home.md) and [`v3-fix-marston`](../../done/v3-fix-marston.md) landed at 01:30, [`v3-fix-payoff`](../../done/v3-fix-payoff.md) at 01:49 (`6f45587`).

- **Home.** A kraft ground colour in `ambient()` made s03's shadow pale and s04's brown. Draining the ambient and pulling the screen 3 mm closer made it loom, and a cool hemisphere light turned the brown navy (`checks.txt`: 62,54,53 → 18,29,41). The lamp isn't fully solved: at 80 cm it's a floor lamp, not a desk lamp.
- **Marston.** s09 was under-lit, not under-exposed. s12 looked like a framing slip until the builder did the arithmetic: the loom's top sat at 16.5 cm and the camera saw only 11.6. The six-step shrink got close cutaways at each solve (10 cuts where the spec said 5), because the wide shot alone lost it.
- **Payoff.** The handwriting was a system font, which breaks re-rendering on any other machine, so it became bundled Caveat. s18's reach took two failed restagings (moving his feet, then pitching the snout) before the fix that worked: switch the legs off behind the desk. The determinism check's reversed-order render caught a ghost shadow that the usual run couldn't see ([`after_s18.jpg`](../../evidence/v3-fix-payoff/after_s18.jpg)).

## The rule and the turn

At 01:33 the orchestrator wrote the next brief, [`tasks/v3-readability.md`](../../tasks/v3-readability.md): "If the light isn't in frame when the shadow changes, the rule is invisible." Its builder had three commits on `task/v3-readability` by 01:48, covering s03 and s06, the s15 turn, and s12's stall. When this chapter was written, there was no done note for it, nothing merged, and no v3 render. Whether a cold viewer can now see the rule and the turn is not yet known.

## What went wrong, and what this proves

- The home-kit brief gave the gator's height as 0.125 m, and the code said 0.096.
- Specs were written against a desk unit four times too long, and the director's "massive table" proved it.
- The orchestrator's tortoise wasn't in the story doc.
- The first painters couldn't hold aspect ratios.
- The orchestrator's own v2 review, [the fix list](../notes/v3-fixlist.md), is about exposure, shadow size and proxies. It doesn't mention the rule or the turn, and the stranger's read did.

The night gave the director a built v2 and most of a v3. It couldn't yet give him proof that the film reads, and the only cold viewer said it didn't.

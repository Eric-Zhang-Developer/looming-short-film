# 12 · The walk

## What he said about v3

The v3 draft was rendered at 02:44 on October 16. A cold viewer found the turn "roughly 1:44–1:50, but soft; can't see his action cause it", and the morning picks left "how explicit the turn gets" to the director ([`morning-picks.md`](../notes/morning-picks.md), [`cold-v3/report.md`](../../evidence/cold-v3/report.md)). He answered a bigger question than he was asked ([`docs/02-story-v4-draft.md`](../02-story-v4-draft.md)):

> "the keystone decision in my life to get overcoming procrastination is to go to the library … I'm super scared but I made the decision and that's the keystone decision not the fucking random janitor"

The problem wasn't that the turn was soft. It was somebody else's. In v3 a tortoise custodian walked past in s14 (painted the night before, [chapter 11](11-the-overnight-run.md)), and Marston's motion-sensor lights did the rest. Doc 02 already had a story rule that reads "The hero takes the first step himself. Nobody rescues him", and the director was asking the film to keep it at its most important moment. The draft puts the cut in one line: "The janitor was a turn the director never made."

He had other notes, quoted in the same file and in [`tasks/rig-v4.md`](../../tasks/rig-v4.md). The bottom should be "really obvious and really plain": him in bed, on his phone. The blinds scene is "really funny, but also it just makes no sense in context". He wanted "an analog clock that shows the time". The gator "is missing a neck. It looks odd." The roommates should be gators "because everything everyone else is a gator". And: "We need more emotion for our gator, even just some simple face changes."

## The new story, in one evening

On October 17 at 22:33 the orchestrator wrote the rig brief for the neck, the roommates and the acting kit (`cd38619`). At 22:35 it committed a new story draft (`7134553`). The draft's central move is that the light rule gets one job. Light held low and close makes the shadow loom, and light from above makes it small. Home is all low light: the laptop, the phone in bed, the door's backlight. Marston is light from above. So going to the library *is* walking into the light that shrinks the dread, and the rule and the turn become the same event.

That let the draft cut the motion sensors, the custodian, the blinds, the stacks and quiet 1. Marston stopped being the film's bottom and became its reward. The bottom moved to bed, at 3 a.m., with a clock.

The clock is the film's new pulse: one plain analog wall clock, tick marks and no numbers, beside the calendar. The draft gave it a table of readings: about 9:00 at the calendar push-in, about 1:45 in bed, 3:00 at rock bottom, a slow calm tick in the exam room. Its tick is also a sound. At 3 a.m. it plays alone, on the walk it doubles into a heartbeat, and at Marston's door it resolves into one held chord.

The approval is in [doc 07](../07-process-log.md): "I approve everything. I looked at the script, and I like it. Let's do it." He also approved a Codex close-up head kit for the big emotional beats,. By 22:40 the story was promoted into doc 02 (`d429d5e`), the spec-writing brief went out (`1666298`), and he had sent one more line: "quick update master render should be in 1080p" (`dae735a`). That dropped the 4K plan, and the overnight-render risk with it.

## Before any shot: a neck, two heads and a clock

[`rig-v4`](../../done/rig-v4.md) gave the Student a neck, rebuilt both roommates on his own rig as gators (tall and lanky in a blue hoodie, round and stout in kraft), and added an acting kit with eight expression presets, paper brows, seeded blinks and breathing that follows the feeling. Its builder laid the rig over the frozen figure and found the head sat about ten figure pixels low, with no throat under the jaw. The first neck rendered grey until it was slid a hair behind the jaw ([`neck.jpg`](../../evidence/rig-v4/neck.jpg)). At phone size `resolve` and `neutral` were hard to tell apart, and the note says so rather than calling the kit done ([`expressions.jpg`](../../evidence/rig-v4/expressions.jpg)). The home-shots builder later fixed it with a drawn mouth bar ([`resolve.jpg`](../../evidence/trims-home/resolve.jpg)).

[`asset-v4-kit`](../../done/asset-v4-kit.md) painted the close-up heads (six moods, three variants) and the clock (two variants). The heads all read at phone size. The measurement was less kind: laid beside `gator_hero`, every variant's eye bump rose 2.2–2.5× as much and its snout was 4–9% thicker ([`heads_vs_hero.jpg`](../../evidence/asset-v4-kit/heads_vs_hero.jpg)). The clock's hands measured about 1.4× too long for the dial ([`clock_vs_calendar.jpg`](../../evidence/asset-v4-kit/clock_vs_calendar.jpg)). Both kits were frozen at v1_2 at 03:10 on October 18 (`35133b2`), with the drift flagged in the morning picks rather than re-rolled away.

## Two questions, and the lamp

[`spec-v4`](../../done/spec-v4.md) (`b3234b6`) put the new film on paper: 21 shots, 3:15, six of them new for the climax. It could render nothing, so two calls were built to its own recommendations and put to him ([`QUESTIONS.md`](../shots/QUESTIONS.md), Q16 and Q17).

The first was where the blob's size peaks. The spec had 2×. He answered: "can we somehow do 2.5x". The gulps became half-sizes over the same three (1 → 1.5 → 2 → 2.5).

The second came from physics. Doc 02 put "the hallway light" behind him as he leaves, but a ceiling light makes the shadow small, which is the film's own rule. The spec's builder worked out that the only light that is low, behind him and in the hall at once is a night-light by his door. His answer:

> "Q17 is fine uhh I don't have a night light though I have a nightstand lamp"

That was better than the recommendation. He clicks the nightstand lamp on in s09a, the same click as the lamp he clicked *off* in s06, and it stays on behind him as the shadow runs down the hall. Leaving now rhymes with refusing then, and the sound keeps it as one design: the lamp click is the identical buffer all three times it is heard.

## The climax, in two rooms at once

Both climax briefs went out at 03:13 (`94b0e55`), split by room so two builders never shared a file. `climax-a1` built the bedroom (s07 bed rot, s08 the 3 a.m. clock, s09a the choice, and the clock module). `climax-a2` built the hall, the walk and the door (s09b, s09c, s10).

[`climax-a2`](../../done/climax-a2.md) had started on the night-light and a 2× blob. Its first renders put the shadow on the hall's side wall, because a light beside a door throws sideways. The answers arrived mid-build and fixed the direction (lamp, doorway, blob, hall and front door on one line), but every number had to be re-solved for the larger blob. Then it hit a lesson it says it should have seen coming: from the obvious camera, in his room behind the lamp, the blob covers its own shadow. A camera near the light can't see it. The shot became a cutaway paper theatre with the camera off to one side, and that frame is the [poster](../../evidence/climax-a2/poster.jpg). On the walk the first shadows came out short, because the spotlight cone clipped their tips. Opening it to 1.45 gave the long spans back: 3.20× before a lamp, 1.33× under it, 2.84× after ([`lamp_strip.jpg`](../../evidence/climax-a2/lamp_strip.jpg)). At the threshold the shadow snaps from a tongue 3.9 times the blob's rest width to a 1.14× puddle ([`snap.jpg`](../../evidence/climax-a2/snap.jpg)).

[`climax-a1`](../../done/climax-a1.md) had a different first failure: its ceiling shadow was a thin line, because the blob is a flat card and the phone sits almost in its plane, so the light saw it edge-on. A shadow-only twin that turns to face the light fixed it ([`s07_sheet.jpg`](../../evidence/climax-a1/s07_sheet.jpg)). It then measured the shadow instead of trusting its eye: 68% of the visible ceiling against a spec of 80%, and kept that rather than move the camera and lose the clock ([`ceiling_shadow.txt`](../../evidence/climax-a1/ceiling_shadow.txt)).

## The swell, from a machine that can't hear

[`snd-v4`](../../done/snd-v4.md) (`5f80ea1`) was written by an agent with no way to listen, so the swell is a meter reading. The first render looked like a build and measured like a wall: short-term loudness rose only 1.6 LU over a climb the score raised by 4 dB, because the 45 Hz bass swell was driving the music limiter into 19 dB of gain reduction. Rebalancing fixed that. Then the meter said bed rot, the film's thinnest shot, was louder than the door push, because two sub swells carried over from the old cut were out-measuring it. The blinds' sub, which no v4 beat asks for, went, and gulp 3's came down.

The shape it ended with ([`swell.txt`](../../evidence/snd-v4/swell.txt), short-term LUFS):

| Where | Level |
|---|---|
| s08, the tick alone | −31.1 to −31.9 |
| `lamp1`, the pulse alone | −27.2 |
| `blobBlocks`, the dissonance | −20.0 |
| `stepAround`, resolved | −16.5 |
| `doorPush`, the peak | **−11.0** |
| `exhale`, after the held chord | momentary −34.5 |

The door push is the loudest moment in the film by 0.3 LU; the next is s06's groove at −11.3. The mix is −15.9 LUFS and −4.7 dBTP ([`loudness.txt`](../../evidence/snd-v4/loudness.txt)), and two renders hash identically. To fit the loudness target it lowered the lamp click, the film's true-peak driver, rather than raising the music over the noises the director likes. **Nobody has heard any of it.** The note's gaps list what to listen for, including whether a dip at the nightstand click reads as a dropout.

## The trims and the first look at all 21

After the climax, two more builders ran in parallel: `trims-home` (s01–s06, s18, two rig fixes) and `trims-marston` (s11, s13, s15–s17c, and deleting the cut s12 and s14). They merged at 07:33 and 07:45. [`trims-marston`](../../done/trims-marston.md) found that at 2.5× the blob stands as tall as the desk and covers him, so it waits in front of the desk and climbs the apron. [`trims-home`](../../done/trims-home.md) found s03's shadow ran off the frame, and left s06's lamp pool at 1.77× (spec 1.37×) because raising the lamp would break his reach.

A commit at 07:47 holds one frame per shot from the merged branch, taken "before committing hours of machine time to the full render" ([`smoke_all_shots.jpg`](../../evidence/render-v4/smoke_all_shots.jpg), `599444e`). It shows that all 21 shots build together, not that they read.

## The machine, again

The Seagate drive holding `out/` was unplugged, and the director's instruction was "Swap the out/ link for a local folder on the internal disk for the v4 render; put the link back later" (`62649b3`). The v4 render then lost its second chunk to a Chrome "Target closed" crash at frame 722, under heavy swap. The same frames render fine alone, so it was the machine, not the shot. Restarting from zero on deadline day would have redone good chunks, so `render_film.sh` learned to resume and retry (`64c4480`).

## What's still missing

This chapter was written before any finished v4 render appears in the record. The same goes for a cold viewer on v4, the director's own look, and anyone listening to the mix. Captions and the flash check haven't been done either. [`v4-fixlist.md`](../notes/v4-fixlist.md) is the builders' own list of misses:
- s07's ceiling shadow covers 68% where 80% was specified, and a third of it runs off frame.
- s08 isn't darker than s07 (mean luma 68.17 against 68.18), though the 3 a.m. bottom should read darker.
- s09b's end-wall shadow covers 57% against 80%.
- On the walk, the ground shadow is a faint thin streak on screen, so "long, under his feet, long" may not read, and the side-step around the blob skates.
- Is he obviously in bed on his phone in s07? The director asked for "really obvious and really plain", and in the wide the lying gator reads as a green shape. If a cold viewer misses it, the fix is a close shot on the phone.

The honest summary: v4 is built, merged and measured, and unwatched. The last cold viewer, on v3, found the turn soft. Whether the walk fixes that is not yet known.

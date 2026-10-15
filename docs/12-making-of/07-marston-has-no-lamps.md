# 7 · Marston has no lamps

## A climax built on a lamp

By early afternoon on October 15 the film's turn rested on a desk lamp. The rule had been taught twice. In s03 the phone's low light throws a giant shadow up the wall. In s06, at home, he clicks a desk lamp on, sees the shadow drop to a small pool, flinches and clicks it off. Then the story moved to Marston Science Library, and the spec put lamps on three Marston desks:
- **s15:** his own, which he clicks on. That's the first step.
- **s16:** a neighbour's, which they click on after watching him.
- **s18:** the Freshman's, which he clicks on as he passes, passing it on.

All three were written as the same gesture and the same sound as the click at home. The sound team had already spent four tasks making that click bit-for-bit identical ([chapter 6](06-the-sound.md)).

## "Okay, one problem"

At 12:28 Eric asked whether photos of Marston would help: "I think we should ground it in UF's campus architecture." At 13:14 he asked for a subagent to find reference images of the upper floors and the Plaza of the Americas. A research subagent went out at 13:17 (`4e1aee6`).

Nine minutes later, before it reported, Eric wrote:

> "Okay, one problem is that Marston Library doesn't have lamps. Or at least those sitting like desk lamps that you see in the pictures and whatnot"

The orchestrator agreed it was real, listed the three desks the turn depended on, and made its first recommendation: **he brings his lamp from home.** It's the same lamp he clicked off in s06, so the click would be identical because it's literally the same lamp, and in s18 he could leave it on the Freshman's desk. It also gave the counterargument: "carrying a desk lamp across campus is a stretch."

At 13:31 the researcher reported, and [`docs/ref-ufl.md`](../ref-ufl.md) §0 holds what it found, each item marked by how sure it is:
- **Verified:** "no source shows desk lamps on the upper floors, and none shows built-in task lights. The room is lit from overhead."
- **Verified:** a UF student essay calls Marston's lighting "harsh fluorescent".
- **Verified:** the 2022 furniture refit added outlets, not lamps.
- **Verified:** the carrels with built-in lights belong to the Architecture and Fine Arts Library, not Marston.
- **Not found:** the researcher found no openly licensed photo of Marston's upper study floors. So the room in the film is, in the brief's words, "informed invention". The 23 openly licensed photos it did find of the building, the atrium, the courtyard and Century Tower are kept out of git in `reference-videos/ufl/`.

## Turning the problem into the turn

At 13:36 Eric asked what to do: "Because there are literally no lamps on Mars, we might have to change up the storyboard. various other ideas?"

The orchestrator's answer at 13:38 changed its own recommendation. It proposed **motion-sensor lights**: library lights that switch off when nobody moves. It argued from what was already on screen:
- **s11 already did half of it.** In the animatic, the room light stutters out just as he picks up the phone. That reads perfectly as a sensor timing out.
- **The turn gets stronger.** He doesn't reach for a knob. He picks up the pen, and the movement trips the sensor. The overhead light flickers on, and the giant shadow collapses into a small pool, because light from above makes small shadows. "The first step literally brings the light back."
- **s16:** when he stands to grab a book, his movement wakes the lights over a frozen neighbour.
- **s18:** walking past a Freshman frozen over a phone lights their corner. He passes it on without a prop.

It also set out the costs. s15 would lose the hand-on-knob gesture that matched s06. s15, s16 and s18 would need rework. And "Nobody has verified that Marston's lights are on sensors."

Less than a minute later Eric decided:

> "Go with motion-sensor lights at Marston: stillness lets the lights die, his movement (pen, standing, walking past) brings them back in s15, s16 and s18. Keep the home lamp for s06."

[Doc 07](../07-process-log.md) records it under "Marston has no desk lamps", and it states the open fact plainly: "**Unverified:** whether Marston's upper floors actually use occupancy sensors."

The theme came out sharper. At home he clicks the lamp off and chooses the dark. At Marston he can't choose the light at all. Stillness takes it away, and only moving, starting the work, brings it back.

## Rewriting the light

What followed was the system working the way doc 09 intends:
1. **Shots paused.** s14, s16, s17 and s18 had been built around desk lamps, so they were paused until the spec changed (`4242e43`).
2. **`spec-sensor`** (`3ee9184`, 14:03) rewrote docs 02, 03 and 05, the asset list and shot specs s10–s18 ([`done/spec-sensor.md`](../../done/spec-sensor.md)). Each Marston desk got a louvred cardstock fluorescent trough on its own sensor zone. Its overhead pool works out to 1.10× the blob, so the film's rule still holds. Every beat time stayed the same.
3. **`contract-sensor`** (`674b538`, 14:10) built it in code: a `sensorLight` with one shared three-strike stutter, and one `sensorWake` sound for both wakes ([`done/contract-sensor.md`](../../done/contract-sensor.md)).
4. **The shots were rebuilt for the story reel, one after another:**
   - **s15** (`44cc607`, 14:26): his reach now ends on the capped pen. The pen touching the name line on drawing 0.500 is the wake. The light strikes at 0.542, 0.667 and 0.792, and the giant shadow flashes back on each dark frame before settling into a pool (`evidence/reel-s15/sheet.jpg`). The phone dims to 0.02 under the overhead light "because at 0.05 its ghost still read as a face."
   - **s16** (14:29): the neighbour's light wakes when he stands.
   - **s14** (14:31): the custodian's cart wakes the light over our gator. Then, because *he* doesn't move, it times out again, so the custodian can't take the first step from him. That keeps the cold read's fix from the morning ([chapter 1](01-the-idea.md)).
   - **s18** (14:45): the Freshman's light wakes mid-stride as he walks past.

## The lamp that wasn't there

The lamp had one last word. At 14:52 the first full render of the film stopped at frame ~864 with an error in s06 (`out/v1_render.log`). The cause is in the fix commit (`993b169`): the sensor rewrite of s15 had removed the desk-lamp measurements from s15's file, and s06, the home lamp shot, had been borrowing them. Each shot had passed its own checks. Only rendering the whole film end to end caught it.

The fix kept the director's ruling intact. s06, "where the lamp stays (director: 'Keep the home lamp for s06')", now owns its lamp geometry. s12 is at Marston, "where the director ruled out desk lamps", so its unlit lamp was removed rather than patched back in.

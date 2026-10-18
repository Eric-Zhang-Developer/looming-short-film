# 05 · Sound

## Approach

**All sound is synthesized in code** and locked to the same timeline that drives the picture, the same way `audio.ts` worked on *SUPER 1776*. No samples, no vocals, no dialogue. The score and the effects are part of the open source, so the "readable all the way down" claim covers sound as well as picture.

Since the film is wordless, sound carries a lot of the storytelling: where we are, what time it is, and when something changes. **Silence is an instrument.** 3 a.m. (s08) is scored with a clock and nothing else, and Quiet 2 with ambience only.

## Palette

The score is small and intimate, like music played in the room.

| Voice | Synthesis | Role |
|---|---|---|
| **Felt piano** | Additive partials, soft hammer noise, a low-pass that opens with velocity, short room reverb | The main voice. The theme lives here. |
| **Music box** | A sine plus a bright inharmonic partial with fast decay | The blob's voice: curious, childlike |
| **Warm pad** | Detuned saws through a slow low-pass, very quiet | Under the dawn and the ending |
| **Sub swell** | A sine at 40–60 Hz with a slow attack | The shadow growing. Felt more than heard. |

## Leitmotifs

- **The Exam motif:** four music-box notes rising and falling, played slightly out of tune. It plays when the ink drop forms, and returns softer each time the blob is small.
- **The gulp** (the meter, doc 02): each of the **three** gulps (v4: `gulp1` s03, `gulp2` s06, `gulp3` s07) plays the Exam motif's **first two notes** (its rising major third) on the music box, the first on the gulp's snap drawing and the second 0.275 s later, half the motif's spacing, so it sounds like a swallow. **Each gulp is one semitone lower than the last:** −1, −2, −3 against the motif's own pitch. The interval stays the motif's, so the ear hears the same creature getting heavier. Velocity 0.30 rising to 0.42, and the second note a few cents flatter each time. A soft `inkDrip` swallow at −18 dB under the first note. The shadow's swell rides on the existing `subSwell` for that dodge; the gulp adds no sub. (G4's `gulp4` and `gulp5` are cut with the blinds and old s11.)
- **The shrink:** each solved problem in s16 answers with the same two notes falling (second note first), at −6 dB under that problem's theme note, starting 0.25 s after it. v4 has five solves from the 2× peak: **#1 −2** (one above the deepest gulp), **#2 0** (birth size at birth pitch), **#3 +1, #4 +2, #5 +3**; then the test (`testSolved`, **+4**) and the cross-off (`examCrossedOff`, **+5**), just before it soaks back into the calendar.
- **The avoidance groove:** a light, bouncy piano figure for the Act 2a montage. Each dodge adds a layer, and the sub swell grows under it with the shadow.
- **The first step:** **one piano note**, held, at the moment he writes his name. Then the theme enters slowly, one note per solved problem.
- **The walk build** (v4, s09c–s10): the clock's tick doubles into a **pulse** at `lamp1`, and one layer joins per lamp: pulse, felt piano (the Exam motif **rising**, the gulps' falling pair turned upward), strings pad, the music box (the motif's opening, in tune for the first time), the bass swell. A small dissonance on `blobBlocks` resolves on `stepAround`. The peak is s10's `doorPush`; on `lightFlood` everything cuts to **one held major chord**, then near-silence and a breath. Act 4's theme in major, softly, from s11.

## Foley and ambience

Two sounds carry the story, and they are the most important sounds in the film.

- **The lamp click (home only).** Heard twice, in s06: on, then off. Design it once, carefully: a dry plastic click with a tiny filament "tink" as the light comes up. Both are the identical buffer.
- **The clock's tick (`clockTick`, v4).** One dry, close, slightly woody tick, the voice of the wall clock (`docs/shots/README.md` §13). Planted faintly in s02 (−30 dB), the film's loudest small sound in s08 where it plays **alone** at 1 Hz, under s09a–s09b, then **doubled into the walk's pulse** at `lamp1` (s09c), and back slow and calm in the exam room (s17b) and faint in s18. Every tick is on a whole second of global time, so it locks to the pulse's 0.5 s grid. Design it once: every appearance is the same buffer, filtered for distance or the room.
- **Removed in v4: the sensor relay.** The motion-sensor lights are cut (doc 02), so `sensorWake` (s15's relay clack, ticks and ping), the fluorescent timeout crackle (s11, s14) and the stacks' flicker crackles (s10) have no cue. The `FOLEY.sensorWake` voice can stay in `foley.js` unused or go in the sound pass; nothing in the timeline names it.

Cues hang on beat names (`src/timeline.js`); the times are the **v4 cut's** (3:15, `spec-v4`) and move with the beats. **New** marks a cue added since G4; a new sound name is a new `foley.js` voice (or score part) for the sound pass. Global times in seconds.

| Sound | Where (beat, global time) | Notes |
|---|---|---|
| **Phone buzz** (`phoneBuzz`) | `notifyBuzz` 0.5, and +1.5 (2.0) | Over black. Unchanged |
| **Clock tick** (`clockTick`) · new | s02 W only (9.0–10.5, 16.08–19.0) at −30 dB; **s08 `clockThree` 60.0 → 69.0, every whole second, alone** (−12 dB close in C1, never under −20); s09a–s09b 70.0–81.0 (−16 dB, room-distant from 76.0); s09c 82.0, 83.0, then it becomes the pulse; s17b `examRoom` 158.0 → 167.0 at 1 Hz with room reverb (−18 dB in the clock insert, −26 dB after); s18 W only at −30 dB | The film's pulse. One buffer |
| Lamp click | `lampClickHome` 40.5, `lampOffHome` 43.0 | Home only. The identical buffer twice. Unchanged |
| Game blips (`gameBlip`) | `laptopUp` 20.0 (boot), then his key taps in s03, s05, s06 (cut on the click, back at `lampOffHome` + 0.17) | s07/s08's taps are gone (no laptop there now) |
| Screen glow hum (`phoneHum`) | The laptop from `laptopUp` 20.0 through s06 (not in the lamp's window); the phone in s07 (48.0–60.0); **off from `clockThree` 60.0** | No screen at Marston in v4 |
| **Scroll tick** (`scrollTick`) · new | s07 thumb flicks: `bedRot` + 0.5, then every 0.75 s to +5.75 (48.5…53.75), paused for `clockGlance`, again from +7.0 (55.0…59.75) | A tiny dry tick, −22 dB, seeded per flick |
| Ink drip / roll | `inkDropForms` 14.0 and the birth's hops; a swallow under every gulp; a blip under every shrink; `blobBlocks` 92.0; s11's climb (`blobClimbs` 113.0, +0.5, +0.83); s15's flinch at `nameWritten` 126.5; s18's hop and run | Filtered noise blip plus a pitch drop; wet |
| Gulp (score) | `gulp1` 23.5 (−1), `gulp2` 44.0 (−2), **`gulp3` 55.5 (−3, s07, bed rot)** | Three gulps (Leitmotifs) |
| Shadow growth | Every dodge: `laptopUp`, `fridge` (+2.33, +5.33), `gameNight`, `lampOffHome` + 0.17, `gulp3`; **`shadowAhead` 78.5** (the hallway's shadow) | The sub swell plus a soft paper rustle |
| Fridge hum, game controller clicks | `fridge` 26.0–33.0; `gameNight` 33.0–40.0 | Comic. (The drill is cut with the blinds) |
| **The score thins** (score) · new | `bedRot` 48.0 → 60.0 | The groove drops to one sustained, slightly flat felt-piano dyad that decays across s07 |
| **Music out** · new | `clockThree` 60.0 | Every music and sub layer stops on this frame. Only the tick and the night room tone |
| **Breath** (`breath`) · new | s08 from 65.0 (short, nasal, 20/min); **`breathIn` 71.5 (slow: in 71.75–72.5, out 72.5–72.92)**; `shadowAhead` 78.5 (one catch); s09c 82.0–102.0 (fast, 36→40/min); **`exhale` 107.0 (the long exhale)**; `lampSitBack` 182.5 (long, soft) | Close, small, −20 to −24 dB, except the threshold's exhale, which is clear and alone |
| Phone face-down (`phoneFaceDown`) | **`phoneFaceDown` 70.5 (s09a, on his hoodie)**; `deskSit` + 2.0 = 112.5 (s11, on the desk, −6 dB) | The card tap; was s15's |
| **Held low note** (score) · new | `breathIn` 71.5 → fades into `doorOpen` 77.0 | Felt piano low C, −20 dB, a slow pad swell under it (doc 02 cue 3) |
| Blanket rustle, backpack | `sitUp` 73.5 (`paperRustle`, soft); **`backpackGrab` 75.0** (`backpackGrab`, new: a fabric grab and zip jingle); s11 backpack down `deskSit` + 0.25 | |
| **Door and hall** (`doorLatch`, `hallHum`) · new | `doorOpen` 77.0: the latch and hinge, then **a swell of room tone and the hall's hum** (+6 dB over 0.5 s; a faint electric night-light hum) to 82.0 | Doc 02 cue 4 |
| **Swallow** · new | 79.67 (s09b's close-up) | A tiny dry throat sound, −24 dB |
| **Footsteps** (`footstep`) · new | `stepIntoShadow` 80.5, 81.0 (runner); s09c on every step (paving, quickening), −20 dB; s10 to `doorPush` | The film's first footsteps |
| **The pulse** (score) · new | **`lamp1` 84.0** → `lightFlood` 103.5, every 0.5 s (lub on the beat, dub +0.18) | Layer 1: the tick, an octave down, with a soft low thump |
| **Layer 2: felt piano, rising** · new | **`lamp2` 87.5** → 103.5 | The Exam motif rising, one note per two pulses |
| **Layer 3: strings pad** · new | **`lamp3` 90.5** → 103.5 | `pad`, attack 1.5 s |
| **The block's dissonance** · new | **`blobBlocks` 92.0** → **`stepAround` 94.0** | One pad/piano voice a semitone flat; slides back up on `stepAround` |
| **Layer 4: music box** · new | **`lamp4` 95.5** → 103.5 | The motif's opening rising, in tune |
| **Layer 5: bass swell** · new | **`lamp5` 97.0** → 103.0 | `subSwell` 45 Hz, attack 6 s |
| **The climb** · new | `marstonSeen` 98.0 → `doorPush` 103.0 | The piano holds the motif's top note; the pad opens; all layers +4 dB |
| **Door push** (`doorPush`) · new | **`doorPush` 103.0** | A heavy push-bar clunk and a hiss of air, on the score's peak |
| **The held chord** (score) · new | **`lightFlood` 103.5**: one held C-major chord, felt piano and pad; **everything else stops on this frame** | Decays to near-silence by ~106; the lobby's warm hush under it |
| Blob's note · new | `blobBlinks` 104.5 | One music-box note at the birth pitch, −24 dB |
| Theme in major (score) · new | `deskSit` 110.5 → rests by `penUncap` 123.5; chords on `revealDrinks` 118.5 and `revealFreshman` 119.75 | Act 4, softly (doc 02 cue 7); the s13 chords in major |
| **Music box answer** · new | `blobSettles` 115.0 | The motif's first note, alone, soft |
| Fluorescent hum | Marston interior, `lightFlood` 103.5 → `examRoom` 158.0, −24 dB distant bed | No crackles, no dropouts (no sensors) |
| Pen uncap | `penUncap` 123.5; **`tagPenUncap` 191.5, the same buffer** | Unchanged pairing |
| Pen scratch | `penUncap` + 0.833 → `nameWritten` (124.33–126.5); the practice insert 130.5–136.1 with a stop and **one pen tap at 134.35**; P2's lines (139.5, 140.0, 140.5) at −6 dB; the montage under writing poses (−10 dB); the test, `testSolved` − 3.0 → − 0.1 (164.5–167.4); s18's X, two strokes ending on `examCrossedOff` (176.5, 176.8) | |
| Crossing-out | `crossOut` 134.6 | One quick, harder stroke, 0.15 s |
| The first step (score) | `nameWritten` 126.5: one felt-piano note, held into s16 | Unchanged |
| Shrink answer (score) | `problemOneSolved` 136.5 (−2), `problemSolved2` 141.5 (0), `problemSolved3` 143.0 (+1), `problemSolved4` 144.0 (+2), `problemSolved5` 145.0 (+3); **`testSolved` 167.5 (+4)**; **`examCrossedOff` 177.0 (+5)** | Five solves (Leitmotifs) |
| Theme phrase completes | 145.0 → released by 146.0 | s17 opens in silence |
| Dawn birds | `dawnBird1` 149.0, `dawnBird2` 153.0, `dawnBird3` 156.0 | Quiet 2 |
| Exam-room hush (`examHush`) | `examRoom` 158.0 → `gradeSlide` 168.5, then −12 dB under s17c | Its clock **is `clockTick`** (above). −6 dB for one second at `testRecognise` 162.0; a felt-piano note at `testSmile` 163.5 |
| Paper slide (`paperSlide`) | `gradeSlide` 168.5, flip at + 0.83 | Unchanged |
| Theme, resolved (score) | `gradeReveal` 170.0 → the end; **one voice added at `gradeGrin` 172.0**; rests (a held chord) on `blobAbsorbed` 180.5; ends on one held note after `tagPenUncap` | |
| The dissolve (`inkSoak`) | `blobAbsorbed` 180.5 | With the motif's last note at its birth pitch |
| Marker (`markerScratch`) | `newDate` − 2.0 → 0 (185.5–187.5) | "Final" and its circle |
| Tag motif reprise (score) | `dropQuivers` 189.0 → `tagPenUncap` 191.5 | Trembling; stops on the uncap's frame |
| Paper boil | Throughout, very low | |
| The fade | 194.0–195.0 | To digital silence at 195.0 |

**Removed since G4** (no beat names them now): the blind rattle (`blind1`, `blind2`) and the drill (`blindsStart`); the groove's return and fade on `sunriseGame`; s09's lone piano note (`marstonEnter`); the stacks' hum start and flicker crackles (`stacksEnter`, `stacksFlicker1/2`); `laptopOpen`'s rustle, `phoneWake`'s surge, `tableLightDies`'s crackle; gulp 4 and gulp 5; Quiet 1's silence (`quiet1Start`); the Sleeper's chord (`revealSleeper`); the mop and its pre-lap (`custodianPass`, `tinyBlobSeen`); **`sensorWake` on `sensorWakeMarston`**; the silent `sensorWakeNeighbor`; the sixth shrink (`problemSolved6`).

**Beat renames for `src/audio/cues.js` and `score.js`** (v4; G4 name → v4). Until they land, the cues that name a cut beat won't resolve (`beat()` throws):

| G4 beat | v4 | Note |
|---|---|---|
| `blindsStart`, `blind1`, `blind2`, `sunriseGame` | none | Blinds and game-to-sunrise cut. s07's anchor is `bedRot` |
| `gulp3` | `gulp3` | Same name, new moment: s07 @ 7.5 (bed rot), 55.5 global |
| `gulp4`, `gulp5` | none | Three gulps now |
| `marstonEnter`, `stacksEnter`, `stacksFlicker1`, `stacksFlicker2` | none | The Marston exterior and the stacks are cut. The walk's cues hang on `walkStart`, `lamp1`…`lamp5`, `blobBlocks`, `stepAround`, `marstonSeen` |
| `laptopOpen`, `phoneWake`, `tableLightDies` | none | Old s11 cut. New s11: `deskSit`, `blobClimbs`, `blobSettles` |
| `quiet1Start` | none | s12 cut |
| `revealSleeper` | none | s13's chords: `revealDrinks`, `revealFreshman` |
| `custodianPass`, `tinyBlobSeen` | none | s14 cut |
| `sensorWakeMarston`, `sensorWakeNeighbor` | none | Sensors cut |
| `phoneFaceDown` | `phoneFaceDown` | Moved: s15 7.417 → **s09a 0.5** (70.5) |
| `problemSolved6` | none | Five solves |
| every other G4 beat | same name | Times move with their shots (e.g. `gulp1` 24.5 → 23.5, `nameWritten` 118.0 → 126.5) |

## Structure by section

The v4 cut, 3:15.

| Section | Music | Ambience |
|---|---|---|
| 0:00–0:19 Birth | Silence under the phone's two buzzes (s00), then the Exam motif on music box at the drop (0:14) | Room tone; the clock's first faint ticks (s02) |
| 0:19–0:48 Avoidance | Avoidance groove, a layer per dodge; gulps 1–2 on the music box (0:23.5, 0:44) | Laptop blips, comic foley, rising sub |
| 0:48–1:00 Bed rot | The groove thins to one flat dyad; gulp 3, the deepest (0:55.5) | Night room tone, the scroll ticks, the phone's hum |
| 1:00–1:10 3 a.m. | **Music out.** | **The tick alone**, then his breath |
| 1:10–1:22 The choice, the door | One low held note under the breath, dissolving into the door's swell | The tick; the hall's hum; the first footsteps |
| 1:22–1:42 The walk | **The build**: the pulse from the tick, one layer per lamp (piano rising, pad, music box, bass swell), the block's dissonance and its resolve, the climb | Night air, footsteps quickening, fast breath |
| 1:42–1:50 The threshold | The peak on the door push, **one held major chord** on the light, then near-silence | The lobby's warm hush, the exhale |
| 1:50–2:10 Under the light | Act 4's theme in major, softly; chords on the reveals; the first-step note at the name | Reading room hush, pen, page |
| 2:10–2:26 Practice | A theme note and a shrink per problem; the phrase completes | Pen scratch (the practice is the closest) |
| 2:26–2:38 Quiet 2 | **Silence** | Room tone, distant birds |
| 2:38–2:55 The test and the grade | Ambience only, then s15's note recalled at the smile; the test's shrink (+4); the theme at the grade, a voice added at the grin | The exam room's hush and its slow tick; the paper slide |
| 2:55–3:15 Ending | The theme rests through the dissolve; the tag's trembling reprise, then one held note into the fade | Home room tone, a faint ordinary tick, the marker |

## Sync

- Audio events are defined in the **same timeline** as the picture, by beat name, not by raw timestamp (e.g. `cue('penUncap')`). Moving a beat moves its sound.
- The score has a tempo map. Act 2a dodges land on downbeats. The quiet shots are free time with no tempo.
- Render picture and audio separately, then mux with ffmpeg.

## Mix

- Deliver at **-14 LUFS integrated**, true peak at or below -1 dBTP (the norm for streaming).
- Export stems (music, foley, ambience) so the mix can be rebalanced without re-synthesizing.
- Check the mix on laptop speakers and on earbuds. Most judges will watch on one of those.
- **Accessibility:** prepare a caption file with sound descriptions only (`[lamp clicks]`, `[clock ticking]`, `[heartbeat]`, `[door opens]`, `[a long breath out]`) for Deaf and hard-of-hearing viewers. Burn nothing into the picture.

## Reuse

From *SUPER 1776*: `audio.ts`'s synthesis approach (oscillators, envelopes, echo) and its beat-locked timeline. From the KnightHacks kit: `build.py` for mixing, loudness normalization and muxing, plus `sfx/cues.py` as the pattern for cue sheets. Port the ideas, and keep the new code in this repo.

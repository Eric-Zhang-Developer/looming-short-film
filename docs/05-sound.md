# 05 · Sound

## Approach

**All sound is synthesized in code** and locked to the same timeline that drives the picture, the same way `audio.ts` worked on *SUPER 1776*. No samples, no vocals, no dialogue. The score and the effects are part of the open source, so the "readable all the way down" claim covers sound as well as picture.

Since the film is wordless, sound carries a lot of the storytelling: where we are, what time it is, and when something changes. **Silence is an instrument.** Both quiet shots are scored with ambience only.

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
- **The gulp** (the meter, doc 02): each of the five gulps plays the Exam motif's **first two notes** (its rising major third) on the music box, the first on the gulp's snap drawing (`gulp1`…`gulp5`) and the second 0.275 s later, half the motif's spacing, so it sounds like a swallow. **Each gulp is one semitone lower than the last:** −1, −2, −3, −4, −5 against the motif's own pitch. The interval stays the motif's, so the ear hears the same creature getting heavier; five semitones over 60 s is clear without turning ominous. Velocity 0.30 rising to 0.42, and the second note a few cents flatter each time (the motif's out-of-tune drift growing). A soft `inkDrip` swallow at −18 dB under the first note. The shadow's swell rides on the existing `subSwell` for that dodge; the gulp adds no sub.
- **The shrink:** each solved problem in s16 answers with the same two notes falling (second note first), **one semitone higher each time**, −4 at #1 up to +1 at #6, at −6 dB under that problem's theme note, starting 0.25 s after it. G4 adds two more: the test (`testSolved`, +2) and the cross-off (`examCrossedOff`, +3), so the blob ends three semitones above its birth pitch, just before it soaks back into the calendar.
- **The avoidance groove:** a light, bouncy piano figure for the Act 2a montage. Each dodge adds a layer, and the sub swell grows under it with the shadow.
- **The first step:** **one piano note**, held, at the moment he writes his name. Then the theme enters slowly, one note per solved problem.

## Foley and ambience

Two sounds carry the light, and they are the most important sounds in the film.

- **The lamp click (home only).** Heard twice, in s06: on, then off. Design it once, carefully: a dry plastic click with a tiny filament "tink" as the light comes up. Both are the identical buffer.
- **The sensor wake (Marston only).** Heard once since G4: when he reaches for the pen (s15). The Freshman's wake in s18 was cut with his scene. One buffer, `sensorWake`, timed to the wake's light keys (`docs/shots/README.md` §3): a dry relay *clack* from the ceiling on the beat, a faint tick on each of the first two strikes (+0.042, +0.167 s), a small glassy fluorescent *ping* as the third strike catches (+0.292 s), then the tube's 120 Hz hum rising under it over about 0.3 s. Build the clack's transient from the lamp click's, pitched down with a short metallic tail, so the ear links the two. Nothing else may sound in its 0.65 s window.
- **Every other zone change is seen, not heard:** the Custodian's passing in s14 (the mop covers it) and the neighbor's zone in s16 (Q2: under the montage's theme). A timeout is heard as the fluorescent crackle (s11, and s14 under the mop), never as the wake.

Cues hang on beat names (`src/timeline.js`); the times are the G4 cut's (3:15) and move with the beats. **New** marks a G4 cue; a new sound name is a new `foley.js` voice for the sound pass.

| Sound | Where (beat, global time) | Notes |
|---|---|---|
| **Phone buzz** (`phoneBuzz`) · new | `notifyBuzz` 0:00.5, and +1.5 | The film's first sound, over black. A short buzz with the phone rattling on wood, 0.33 s. Physical, not a UI chime |
| Lamp click | `lampClickHome` 0:42.5, `lampOffHome` 0:45 | Home only. See above |
| Sensor wake | `sensorWakeMarston` 1:48.5 | Marston, his own movement only. **Heard once since G4** (the Freshman's wake in s18 is cut) |
| **Game blips** (`gameBlip`) · new | `laptopUp` 0:21 (a two-note boot), then his key taps: s03, s05 (under the TV, quieter and higher), s06 (cut on the click, back at `lampOffHome` + 0.17), s07 4.0–5.5 and from 9.0, s08 | The laptop game's voice: small, cheerful square-wave blips, very low (−24 to −18 dB), seeded per tap. Never on a gulp's frame |
| Screen glow hum (`phoneHum`) | Whenever a screen is the key light: the laptop from `laptopUp` (0:21) through s08, except the lamp's window in s06; the phone at Marston (s10–s15); the neighbor's in s16 | A very faint high sine, so the screen "sounds" cold. In s07 it steps up with each blind (masked by the room before `blind1`) |
| **Blind rattle** (`blindRattle`) · new | `blind1` 0:56, `blind2` 0:58 | A fast ratcheting roll-down, about 0.2 s, ending in the bottom bar's soft clack on the beat. One buffer, identical both times. Everything cuts on the second clack |
| Ink drip / roll | `inkDropForms` 0:15 and the birth's hops; a swallow under every gulp; a blip under every shrink; s18's hop and run (3:01.5–3:02) | Filtered noise blip plus a pitch drop; wet |
| Gulp (score) | `gulp1` 0:24.5, `gulp2` 0:46, `gulp3` 0:56.5, `gulp4` 0:58.5, `gulp5` 1:25.25 | The motif's first two notes, −1 to −5 semitones (Leitmotifs). G4 moved gulp 2 from the fridge to the lamp beat and gave the blinds gulps 3 and 4; the count is still five |
| Shadow growth | Every dodge: `laptopUp`, `fridge` (+2.33, +5.33 as it scoots), `gameNight`, `lampOffHome` + 0.17, `blind1`, and the biggest at `gulp4` | The sub swell plus a soft paper rustle |
| Fridge hum, game controller clicks, drill | `fridge` 0:26–0:34; `gameNight` 0:34–0:42; `blindsStart` + 0.33–1.67 (0:50.3–0:51.7) | Comic and slightly exaggerated |
| Fluorescent hum and flicker | Marston, `marstonEnter` 1:08 to `examRoom` 2:44 | A 120 Hz buzz with harmonics; crackles when lights flicker or a zone times out. The nearby tube's hum drops out when his zone dies (s11) and returns with the wake (s15) |
| Mop on tile | `custodianPass` 1:43.5 | Slow, rhythmic |
| Pen uncap | `penUncap` 1:56; **`tagPenUncap` 3:11.5, the same buffer** | Small, crisp. Followed by a held silence (s15) or one held piano note into the fade (s18) |
| Pen scratch | `penUncap` + 0.833 → `nameWritten` (1:56.8–1:58); the practice insert 2:03–2:08.6, with a stop and **one pen tap at 2:06.85**; the montage under each writing pose; the test, `testSolved` − 3.0 → − 0.1 (2:49.5–2:52.4), steady with no gaps; s18's X, two strokes ending on `examCrossedOff` (2:59.5, 2:59.8) | Granular noise shaped by stroke speed. The practice is the closest and most present pen in the film |
| **Crossing-out** · new | `crossOut` 2:07.1 | One quick, harder `penScratch` stroke, 0.15 s. A fix, not anger |
| Shrink answer (score) | `problemOneSolved` 2:09 … `problemSolved6` 2:23; **`testSolved` 2:52.5 (+2); `examCrossedOff` 3:00 (+3)** | The motif's two notes falling, a semitone higher each time; G4 adds the test and the cross-off after s16's six |
| Dawn birds | `dawnBird1` 2:30, `dawnBird2` 2:36, `dawnBird3` 2:41 (Quiet 2) | Two or three synthesized chirps, far off, sparse |
| **Exam-room hush** (`examHush`) · new | `examRoom` 2:44 to `gradeSlide` 2:53.5, then −12 dB under s17c | A large quiet room: distant page turns, far pens, one soft cough, a wall clock ticking at 1 Hz. **−6 dB for one second at `testRecognise` (2:47)**, the world narrowing; the tick goes on. A felt-piano note at `testSmile` (2:48.5), s15's first-step note recalled |
| **Paper slide** (`paperSlide`) · new | `gradeSlide` 2:53.5, then a short `paperRustle` flip at + 0.83 | A dry slide of paper on a table, 0.5 s, ending on a skid. No grader is ever heard or seen |
| Theme, resolved (score) | `gradeReveal` 2:55 to the end | Felt piano, carrying through s18. It rests (a held chord) on `blobAbsorbed` and ends on one held note after `tagPenUncap` |
| **The dissolve** (`inkSoak`) · new | `blobAbsorbed` 3:03.5 | A soft, short wet soak: a filtered-noise swell that closes on a tiny dry tick, as if the paper drank it. With it, the Exam motif's last note once on the music box at its birth pitch |
| **Marker** (`markerScratch`) · new | `newDate` − 2.0 → 0 (3:05.5–3:07.5) | A felt-tip squeak for the letters of "Final", then one round stroke for the circle, ending on the beat |
| **Tag motif reprise** (score) · new | `dropQuivers` 3:09 → `tagPenUncap` 3:11.5 | The Exam motif's first two notes on the music box at its birth pitch, softer than at `inkDropForms`, with a faint trembling vibrato that **stops on the uncap's frame** |
| Paper boil | Throughout, very low | A faint crinkle bed that makes the world sound like paper |
| The fade | 3:14–3:15 | Everything fades with the picture to digital silence at 195.0 |

**Beat renames for `src/audio/cues.js` and `score.js`** (G4; until they land, neither resolves: `evidence/spec-g4/dropped_beat_refs.txt`):

| Old name | New beat | Note |
|---|---|---|
| `phoneUp` | `laptopUp` | s03; same moment, the laptop's screen |
| `curtainsStart` | `blindsStart` | s07 @ 0 |
| `curtainsDone` | `blind2` | s07 @ 8.0, the last blind (was 8.0, the last gap) |
| `scrollStart` | `sunriseGame` | s08 @ 0 |
| `nextSemester` | none | Old s18's tear. The ending's cues hang on `gradeReveal`, `examCrossedOff`, `blobAbsorbed`, `newDate`, `dropQuivers`, `tagPenUncap` |
| `sensorWakeFreshman` | none | Cut with the Freshman's scene. The beds that stopped on it end at `examRoom` (Marston's hum) or `gradeReveal` |
| `blobYawn` | none | The pocket is cut; the music-box tag moves to `dropQuivers` |

## Structure by section

The G4 cut, 3:15.

| Section | Music | Ambience |
|---|---|---|
| 0:00–0:20 Birth | Silence under the phone's two buzzes (s00), then the Exam motif on music box at the drop (0:15) | Room tone, lowest over black, then morning |
| 0:20–1:08 Avoidance | Avoidance groove, a layer per dodge; gulps 1–4 on the music box (0:24.5, 0:46, 0:56.5, 0:58.5); everything cuts on the second blind | Laptop blips, comic foley, rising sub |
| 1:08–1:26 Marston | Groove gone. A lone low piano note. Gulp 5 (1:25.25). | Fluorescent hum |
| 1:26–1:36 Quiet 1 | **Silence** | Hum and the shadow's breathing (sub) |
| 1:36–1:48 Reveal | A sparse chord on each new shadow revealed | Hum, mop |
| 1:48–2:26 First step | Sensor wake, silence, single note, then a theme note and a shrink per problem | Pen scratch (the practice is the closest), the woken tube's hum |
| 2:26–2:44 Quiet 2 | **Silence** | Room tone, distant birds |
| 2:44–2:55 The test and the grade | Ambience only, then s15's note recalled at the smile; the test's shrink (+2) | The exam room's hush and its clock; the paper slide |
| 2:55–3:15 Ending | The motif resolves at the grade (the music box plays its opening in tune with the piano's theme); the theme lands on C and rests through the dissolve; the tag's trembling reprise, then one held note into the fade | Home room tone; the marker |

## Sync

- Audio events are defined in the **same timeline** as the picture, by beat name, not by raw timestamp (e.g. `cue('penUncap')`). Moving a beat moves its sound.
- The score has a tempo map. Act 2a dodges land on downbeats. The quiet shots are free time with no tempo.
- Render picture and audio separately, then mux with ffmpeg.

## Mix

- Deliver at **-14 LUFS integrated**, true peak at or below -1 dBTP (the norm for streaming).
- Export stems (music, foley, ambience) so the mix can be rebalanced without re-synthesizing.
- Check the mix on laptop speakers and on earbuds. Most judges will watch on one of those.
- **Accessibility:** prepare a caption file with sound descriptions only (`[lamp clicks]`, `[relay clacks, lights flicker on]`, `[fluorescent hum]`) for Deaf and hard-of-hearing viewers. Burn nothing into the picture.

## Reuse

From *SUPER 1776*: `audio.ts`'s synthesis approach (oscillators, envelopes, echo) and its beat-locked timeline. From the KnightHacks kit: `build.py` for mixing, loudness normalization and muxing, plus `sfx/cues.py` as the pattern for cue sheets. Port the ideas, and keep the new code in this repo.

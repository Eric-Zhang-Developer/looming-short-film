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
- **The avoidance groove:** a light, bouncy piano figure for the Act 2a montage. Each dodge adds a layer, and the sub swell grows under it with the shadow.
- **The first step:** **one piano note**, held, at the moment he writes his name. Then the theme enters slowly, one note per solved problem.

## Foley and ambience

The **lamp click** is the most important sound in the film. It is heard three times: on and off at home, then on at Marston, then on for the Freshman. Design it once, carefully: a dry plastic click with a tiny filament "tink" as the light comes up. The second and third clicks must be identical to the first.

| Sound | Where | Notes |
|---|---|---|
| Lamp click | 0:36, 1:40, 2:44 | See above |
| Pen uncap | 1:48 | Small, crisp. Followed by a held silence. |
| Pen scratch | 1:48–2:15 | Granular noise shaped by stroke speed |
| Phone glow hum | Whenever the phone is the key light | A very faint high sine, so the phone "sounds" cold |
| Ink drip / roll | 0:10, blob movement | Filtered noise blip plus a pitch drop; wet |
| Shadow growth | Every dodge | The sub swell plus a soft paper rustle |
| Fridge hum, game controller clicks, drill | Act 2a | Comic and slightly exaggerated |
| Fluorescent hum and flicker | Marston | A 120 Hz buzz with harmonics; crackles when lights flicker |
| Mop on tile | Custodian | Slow, rhythmic |
| Paper boil | Throughout, very low | A faint crinkle bed that makes the world sound like paper |
| Dawn birds | Quiet 2 | Two or three synthesized chirps, far off, sparse |

## Structure by section

| Section | Music | Ambience |
|---|---|---|
| 0:00–0:20 Birth | Exam motif on music box | Morning room tone |
| 0:20–1:00 Avoidance | Avoidance groove, building | Comic foley, rising sub |
| 1:00–1:18 Marston | Groove drops out. A lone low piano note. | Fluorescent hum |
| 1:18–1:28 Quiet 1 | **Silence** | Hum and the shadow's breathing (sub) |
| 1:28–1:40 Reveal | A sparse chord on each new shadow revealed | Hum, mop |
| 1:40–2:15 First step | Click, silence, single note, then the theme builds | Pen scratch |
| 2:15–2:40 Quiet 2 | **Silence** | Room tone, distant birds |
| 2:40–3:00 Button | Theme on felt piano, resolved; music-box tag on the yawn | Night hum |

## Sync

- Audio events are defined in the **same timeline** as the picture, by beat name, not by raw timestamp (e.g. `cue('lampClickMarston')`). Moving a beat moves its sound.
- The score has a tempo map. Act 2a dodges land on downbeats. The quiet shots are free time with no tempo.
- Render picture and audio separately, then mux with ffmpeg.

## Mix

- Deliver at **-14 LUFS integrated**, true peak at or below -1 dBTP (the norm for streaming).
- Export stems (music, foley, ambience) so the mix can be rebalanced without re-synthesizing.
- Check the mix on laptop speakers and on earbuds. Most judges will watch on one of those.
- **Accessibility:** prepare a caption file with sound descriptions only (`[lamp clicks]`, `[fluorescent hum]`) for Deaf and hard-of-hearing viewers. Burn nothing into the picture.

## Reuse

From *SUPER 1776*: `audio.ts`'s synthesis approach (oscillators, envelopes, echo) and its beat-locked timeline. From the KnightHacks kit: `build.py` for mixing, loudness normalization and muxing, plus `sfx/cues.py` as the pattern for cue sheets. Port the ideas, and keep the new code in this repo.

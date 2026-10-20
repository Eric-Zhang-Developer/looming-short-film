# Brief · spec-sensor

**Type:** builder (docs only) · **Wave:** 4 · **Model:** claude-opus-5-5
**Read first:** `AGENTS.md`, `docs/07-process-log.md` (the last entry), `docs/ref-ufl.md`, `docs/02-story.md`, `docs/03-art-direction.md` (§Lighting rules), `docs/05-sound.md`, `docs/assets.md`, `docs/shots/README.md`, `docs/shots/QUESTIONS.md`, `docs/shots/s06.md`, and `docs/shots/s09.md`–`s18.md`, plus `done/anim-s11.md`, `done/anim-s12.md`, `done/anim-s15.md` for what is already built

## Director decision (verbatim)
"Go with motion-sensor lights at Marston: stillness lets the lights die, his movement (pen, standing, walking past) brings them back in s15, s16 and s18. Keep the home lamp for s06."

## Goal
Rewrite the spec so Marston has **no desk lamps**. Its light is ceiling fluorescents on motion sensors. Every downstream builder works from these docs, so they must be consistent end to end.

## Owns
- `docs/02-story.md`, `docs/03-art-direction.md` (lighting only), `docs/05-sound.md`, `docs/assets.md`
- `docs/shots/README.md`, `docs/shots/QUESTIONS.md`, `docs/shots/s09.md` to `docs/shots/s18.md`
- `done/spec-sensor.md`

Don't touch `src/`, `tools/` or any other doc. Code changes go in your done note as a list for the orchestrator.

## What to write
- **The rule is unchanged:** low phone light makes a huge shadow, and light from above makes a small one. At Marston the light from above is a **ceiling fluorescent trough on a motion-sensor zone**: one zone over each desk unit, so lights can be dead over his desk while another zone is lit. Give the fixture's position, size and light type in the README (it replaces §3's lamp), placed so the shadow scale under it is a small pool like the lamp's (state the scale). Use `docs/ref-ufl.md` §1 for the look: troughs between louvred panels, a faint green-cream tint.
- **The arc:** at home he clicks the lamp off and chooses the dark (s06, unchanged). At Marston, stillness lets the lights time out, and movement brings them back.
- **s11:** `tableLightDies` becomes the sensor timing out because he has gone still over the phone. Keep the beat time.
- **s12–s13:** dark zone, phone light only (check they already are).
- **s14 (`custodianPass`, `tinyBlobSeen`):** consider whether the custodian walking past should briefly wake the zone, so the shadow shrinks for a moment, the blob is seen as tiny, and the light times out again as they leave. Use it if it serves the spec's story job; otherwise say why not.
- **s15, the turn:** the reach becomes a reach for the pen. Keep Camera A and K0–K7's timing (the press drawing = the pen touching the page). The movement trips the sensor: the relay click, then the tube stutters on, two or three flickers, mirroring s11's death in reverse. The shadow collapses to a pool. Keep every s15 number that doesn't involve the lamp (`done/anim-s15.md`).
- **s16:** the neighbour sits frozen in a dead zone. He stands (to fetch a book or stretch), and his movement wakes the neighbour's zone. They look up and start working. Q2 (seen, not heard) still applies to the neighbour's light coming on.
- **s17:** check it for lamp references and fix them.
- **s18:** next semester, a Freshman is frozen over a phone in a dead zone. He walks past without stopping, his movement wakes their lights, and the blob yawns in his pocket. "He passes it on" now happens by walking past.
- **Sound (doc 05):** the lamp click at home (s06 on and off) is unchanged. Design one **sensor wake** sound, a relay clack then the fluorescent ping and hum, with the same buffer at s15 and s18 (s16 per Q2), and update the "heard three times" rule to match.
- **Assets:** take `desk_lamp` out of every Marston shot in `docs/assets.md`; it stays for home. Add a ceiling fixture asset if one is needed, or say it's built in code.
- **QUESTIONS.md:** mark the old lamp-related questions superseded, and add any new open question (for example, the timeout length on screen).
- **Beats:** keep every beat **time** unchanged so the score and the built shots don't move. If a beat **name** like `lampClickMarston` or `lampClickNeighbor` becomes misleading, list the rename in your done note. Don't edit `src/timeline.js`.

## Done note must include
- A table: each shot from s09 to s18 with what changed and whether its built or in-progress code needs rework (s11, s12, s15 are merged; s14, s16, s17, s18 are paused mid-build).
- The code-change list: `src/timeline.js` renames, `src/audio/cues.js`, a `lights.js` helper if needed (e.g. a `sensorLight`), and asset changes.
- Every doc that still mentions a Marston desk lamp afterwards (`grep -n -i lamp`), with each remaining mention justified (home only).

Docs only: no renders, no headless Chrome (the machine is short on RAM and disk).

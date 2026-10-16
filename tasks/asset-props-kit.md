# Brief · asset-props-kit

**Type:** painter (Codex, no headless Chrome) · **Wave:** 5a · **Model:** given at dispatch
**Read first:** `AGENTS.md`, `docs/08-image-pipeline.md`, `docs/03-art-direction.md`, `docs/02-story.md` (G4 version), `docs/shots/s00.md`, `s02.md`, `s15.md`, `s16.md`, `s17b.md`, `s17c.md`, `s18.md`, `docs/assets.md` (kit rows), and the frozen `assets/frozen/home_kit.png` and `kitchen_kit.png` (match their palette and line)

## Goal
The props that make the G4 story explicit, plus the exam room. The text rule is now "sparingly": words appear only where a spec calls for them, hand-lettered, short.

## Owns
`assets/prompts/props_kit.v1.md`, `assets/prompts/exam_room_kit.v1.md`, `assets/specs.json` (append), `assets/raw/` (thumbs committed), `evidence/asset-props-kit/`, `done/asset-props-kit.md`

## Spec
- **props_kit:**
  - the paper wall calendar (a month grid, plus a separate hand-lettered "Calc 2 exam" square and a red circle)
  - a phone, face up and face down, with the notification card as a separate piece reading "Calc 2 Exam · Fri" and a red badge (generic, no real app branding)
  - pen and cap
  - a blank exam page
  - the **Calc 2 practice sheet**, with legible, correct math: ∫x·eˣ dx = x·eˣ − eˣ + C; a series with the ratio test; one crossed-out line
  - the **test page**, with a similar integration-by-parts problem
  - the **graded paper**: red checks and a circled "94"
  - a red X and a strike pen-line for crossing off a date
  - a backpack
  - a small ink drop
  Text must be spelled exactly as given. Codex often garbles lettering: generate the lettered pieces separately if needed, and **reject any variant with misspelled or wrong math** (say which in the screening).
- **exam_room_kit:** rows of exam desks with attached chairs (side view), a wall clock, a chalkboard or whiteboard with faint scribbles, a proctor silhouette, a door, a wall strip and a floor strip.
- Size everything against the gator (about 0.096 m tall; `src/characters/gator.js`). Prefix the boxes keys with the kit name (`props_kit_<piece>`, `exam_room_kit_<piece>`).
- 3 variants per kit (cap 6). One Codex call at a time.

## Acceptance
- [ ] `contact.jpg`, `scale.jpg` (beside the frozen gator), `islands.txt`, `text_check.md` (every lettered or math piece transcribed from the image, with pass or fail)
- [ ] Boxes files for the best variant; a ranking with one line each. **You do not freeze.**
- [ ] The done note ends with `## Story`

**Memory:** no headless Chrome. Never read or print `~/.codex/auth.json` or any token file.

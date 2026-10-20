# Brief · v6-canvas-a (the Canvas screens, the to-do opening, the word that drips)

**Type:** builder · **Version:** v6 · **Model:** given at dispatch · **Time box:** about 60 minutes; committed working beats polished. A second builder (v6-canvas-b) starts from your commit and uses your module for the swipe-away gulps (s03, s06, s07) and the 3 a.m. tap (s09a), so ship the module first.
**Read first:** `AGENTS.md`, `docs/02-story.md` (Story rules: text, sparingly; the clock), `docs/shots/s00.md`, `s02.md`, `src/shots/s00.js`, `src/shots/s02.js`, and how text is drawn on paper today (grep `handFont`, `pageWithInk` in `src/shots/s17b.js`; the calendar's marks in `s18.js`). The director's reference (a screenshot of Canvas Student's To-do on iPhone, dark mode; not in the repo, it shows real coursework) has: a status bar; a round hamburger button left, a centred school logo, a round filter button right; then rows grouped by date, the date in a left column ("Tue" over "20"); each row a small line icon (rocket for quizzes, pencil-on-page for assignments), a thin bar, the course code (`MAS3114`) in grey, the title in large type (`LQ17`, `Practice Exam 2`), the due time below in grey (`11:59 PM`), and an orange outlined rounded checkbox at the right; thin grey dividers; a floating rounded tab bar at the bottom: Dashboard, Calendar, To-do (selected, orange, with a red `43` badge), Notifications, Inbox (red `17` badge).

## The director, verbatim
"people still kinda dont get the plot … we gotta simplify it … make it more explicit"; "the beginning needs to be more explict somehow"; "this should be light mode". Approved: "build the light-mode Canvas countdown opening (MAC2312, no UF logo), the swipe-away gulps, and tapping it open at 3 a.m."

## The plot this serves
One gesture everyone knows carries the plot. A Canvas reminder counts down to the exam; each time he swipes it away, the blob grows on the beat; at 3 a.m. he taps it open instead. Viewers learn: the blob is the exam, avoiding it feeds it.

## 1. A shared module: the Canvas screens (new file, e.g. `src/props/canvas.js`)
Drawn in code on a 2D canvas → a texture for a phone or laptop screen (self-lit, like the existing screens). **Light mode**, after the reference's layout:
- **`todoScreen`:** status bar, a plain header (hamburger and filter icons; **no UF logo, no Canvas wordmark**), a To-do list: a date column (day and number), each row a small type icon, `| COURSE`, the title, the due time, an orange outlined checkbox on the right; thin dividers; the bottom tab bar (Dashboard, Calendar, **To-do** selected with a red count badge, Notifications, Inbox). White/near-white background, dark grey text, Canvas-like orange accents. A few ordinary rows (`MAC2312 · WebAssign 9.3`, `MAC2312 · Quiz 8`, another course's assignment) and **the exam row: `MAC2312` · `Calc 2 Exam` · `Tomorrow 9:00 AM`**, with a red exam marker (red marks the exam: doc 03's rule).
- **`banner`:** an iOS-style notification card (light): small app glyph (an orange-and-cream square, not Canvas's logo), "Canvas" is fine as plain text or omit, title `Calc 2 Exam`, body text set per use (`Starts in 7 hours` etc.). Must read at 400 px wide when the shot frames it as an insert.
- **API (keep it this small):** `todoScreen(opts) → { texture, set(t, opts) }` and `banner({ body }) → { texture, w, h }`, plus a helper to place a banner on a screen with a `swipe` 0..1 (it slides off to one side) and an `open` 0..1 (it expands into the exam row's detail view). Export the countdown strings as one table, e.g. `COUNTDOWN = { s03: 'Starts in 22 hours', s06: …, s07: …, s09a: … }`, with hours computed from each shot's clock against the exam at 9:00 the next morning (s02 reads ~9:00; s07 ~1:45; s08 3:00; s17b 9:00). Fit the text style to the film: crisp screen type, the paper boil only on the phone's body, not the UI.

## 2. s00, the cold open: the to-do list (0–4 s)
The phone on the desk, pre-dawn, buzzes (`notifyBuzz` 0.5). The screen wakes on the light-mode **To-do list**, framed so the exam row reads (fill most of the frame; a slow push to the exam row is fine). The second buzz (2.0) brings the exam row's red marker up, or a banner `Calc 2 Exam · Tomorrow 9:00 AM`. Times out (3.5) for the cut, as now.

## 3. s02, the word drips (the birth, `inkDropForms` 5.0)
The calendar's square says `Calc 2 exam` inside the red circle. **The ink of those words runs out of the letters** and gathers into the bead, so the square is left blank (or ghosted) and the blob is visibly made of the exam's name. The bead then forms and wobbles as now. Keep every beat; the circle stays.

## Owns
The new module; `src/shots/s00.js`, `src/shots/s02.js` (s02 exports `DESK`, `tools`, `homeDesk`: keep their behaviour, s03/s06/s18 build the room from them); `evidence/v6-canvas/`; `done/v6-canvas-a.md`; s00's and s02's lines in `docs/02-story.md` and their shot docs.

## Frozen
Every beat in `src/timeline.js`. s02's exports. No other shot files (v6-canvas-b owns s03, s06, s07, s09a). Sound: none needed from you, but list any cue the new picture wants.

## Acceptance
- [ ] `evidence/v6-canvas/screens.jpg`: the to-do screen and two banners rendered flat at 400 px wide, legible
- [ ] `evidence/v6-canvas/s00_s02.jpg`: s00 every 0.5 s, and s02 every 0.5 s from 13.0 to 16.0 (the word dripping)
- [ ] `node tools/check_timeline.mjs` ok (22 shots, 201 s); determinism at 1.0, 3.0, 14.5; one frame each of s03, s06, s18 still builds; `npx tsc --noEmit -p .` clean
- [ ] Done note `done/v6-canvas-a.md` with the module's API and the COUNTDOWN table, ending with `## Story`

## Machine and git
One headless Chrome at a time, foreground, `--w ≤ 960`, closed after use. Sheets and strips only; delete frames after. Stay in your worktree. Commit on `task/v6-canvas-a`; commit the module as soon as it works, in its own commit. **No `Co-Authored-By:` or `Claude-Session:` trailers.** Don't push or merge.

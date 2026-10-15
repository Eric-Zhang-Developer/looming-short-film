# Done · <task-id>

## What shipped
<2–4 lines: what now exists.>

## Where it lives
<Paths, and commit hash(es) on your branch.>

## How it was checked
<Each acceptance item from the brief, with the evidence path or the command and its output. Write `not verified` and what's missing where you couldn't check.>
- [x] Runs 0:00–0:14: `node tools/check_timeline.mjs` → `ok (18 shots, 180.2s)`
- [x] Pool size: see `evidence/<id>/crop_after.jpg`
- [ ] Matches shot 6 hand path: **not verified**, shot 6 not built yet

## Gaps
<Everything cut, skipped, faked, unverified or unknown, and why. Any contract change you need. Anything you decided because the spec was silent.>

## Story
<150–300 words, in prose, for the making-of (`docs/12-making-of/`). How this piece actually got made: what you set out to do, what surprised you, what failed and how you noticed, what you changed your mind about, and one concrete moment. Write it like you're telling a friend, not filing a ticket. True events only: no invented drama, no feelings you didn't have, every moment backed by a commit, evidence image or command output (link it). "Nothing surprising happened" is a fine story if it's true; say what was routine and why.>

## State
built · <date>

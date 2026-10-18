# Submit tonight (due Sun Oct 18, 11:59 PM)

What only the director can do, in order. The orchestrator prepares every file; uploading, submitting and anything public is the director's action.

## Files (the orchestrator makes these when the master render finishes)
- `out/looming_final.mp4`: the 1080p master, 3:15. **This goes to YouTube.**
- `out/looming_final_backup.mp4`: the ProposalSpace upload, ≤ 10 MB (`tools/backup.sh`; the v4 cut came to 8.66 MB).
- `out/stills/`: 2–3 PNG stills for the form (optional; the doc 10 plan lists them as "possibly").

## The director's steps
1. **Watch** `out/looming_final.mp4` once, with sound. No agent has listened to it. The listen list from the sound pass is in `done/snd-v4.md` ("What the director should listen for").
2. **Upload to YouTube** at full quality (title *Looming*). Copy the link.
3. **Confirm the five lines in `docs/10-submission.md`** the docs pass flagged:
   1. The synopsis describes the film you intend.
   2. The refreshed counts (commits, done notes, frozen images) and the 410 kbit/s figure.
   3. The Oct 15 "process line" in the synopsis: drop or reword.
   4. The irony line, and the department and associates fields.
   5. Captions and the flash check are marked "planned"; **cut those lines** if they won't exist tonight (they won't from this run).
4. **Fill the ProposalSpace form** from doc 10, section by section, with the YouTube link in Project Context (and the Synopsis if there's room), and the GitHub repo link.
5. **Upload** `out/looming_final_backup.mp4` (and stills if wanted). **Submit.**

## After submitting (the director's call; nothing here is done without a yes)
- Merge `wave/3-assets` into `main` (a PR).
- Tag and release the final cut on GitHub with the MP4 attached, as v1-animatic was.
- Put the `out/` link back to the Seagate drive (`NOW.md` has the one-line restore), after copying the final files across.
- The after-the-deadline fix list: `docs/notes/v4-fixlist.md`.

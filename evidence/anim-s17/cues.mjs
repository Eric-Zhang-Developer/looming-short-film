// node evidence/anim-s17/cues.mjs → cues.txt. Acceptance 5: no music sounding between quiet2Start and nextSemester, exactly 3 bird cues.
const root = new URL('../..', import.meta.url).href.replace(/\/$/, '');
const { SCORE } = await import(root + '/src/audio/score.js');
const { CUES } = await import(root + '/src/audio/cues.js');
const { beat } = await import(root + '/src/timeline.js');
const a = beat('quiet2Start'), b = beat('nextSemester');
const mus = SCORE.map((e) => ({ ...e, t: beat(e.beat) + e.at })).filter((e) => e.t + (e.dur ?? 0) + (e.release ?? 0) > a && e.t < b);
console.log(`music events sounding in [${a}, ${b}): ${mus.length}`, mus.map((e) => `${e.voice}@${e.t.toFixed(2)}+${e.dur}`).join(' '));
const last = SCORE.map((e) => ({ ...e, t: beat(e.beat) + e.at })).filter((e) => e.t < a).sort((x, y) => (y.t + (y.dur ?? 0)) - (x.t + (x.dur ?? 0)))[0];
console.log(`last music note before quiet2Start: ${last.voice} at ${last.t.toFixed(2)} dur ${last.dur} release ${last.release ?? '-'} → ends ${(last.t + (last.dur ?? 0) + (last.release ?? 0)).toFixed(2)}`);
const musicCues = CUES.filter((c) => c.stem === 'music' && beat(c.beat) + (c.offset ?? 0) >= a && beat(c.beat) + (c.offset ?? 0) < b);
const birds = CUES.filter((c) => c.sound === 'dawnBirds');
console.log(`music-stem cues in s17: ${musicCues.length}; dawnBirds cues: ${birds.length} on ${birds.map((c) => c.beat).join(', ')}`);

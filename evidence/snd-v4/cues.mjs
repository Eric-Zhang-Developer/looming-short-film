// node evidence/snd-v4/cues.mjs > evidence/snd-v4/cues.txt — every cue (CUES) and score event (SCORE), sorted by time,
// with its beat name. NEW = a sound or score part added for v4 (doc 05's "new" rows): a new voice, or a cue on a beat the
// v4 cut added. Unmarked rows are G4 cues re-hung on v4 beats.
import { CUES } from '../../src/audio/cues.js';
import { SCORE } from '../../src/audio/score.js';
import { beat } from '../../src/timeline.js';

const NEW_SOUND = /^(clockTick|breath|exhale|backpackGrab|doorLatch|hallHum|nightAir|swallow|footstep|doorPush|scrollTick|nightHum)/;
const NEW_BEAT = new Set(['bedRot', 'clockThree', 'phoneFaceDown', 'breathIn', 'sitUp', 'lampOn', 'backpackGrab', 'doorOpen', 'shadowAhead',
  'stepIntoShadow', 'walkStart', 'lamp1', 'lamp2', 'lamp3', 'lamp4', 'lamp5', 'blobBlocks', 'stepAround', 'marstonSeen', 'doorPush',
  'lightFlood', 'blobBlinks', 'exhale', 'deskSit', 'blobClimbs', 'blobSettles', 'gradeGrin', 'lampSitBack']);
const mmss = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;
const off = (o) => (o ? `${o > 0 ? '+' : ''}${+o.toFixed(3)}` : '');
const rows = [];
for (const c of CUES) {
  const t = beat(c.beat) + (c.offset ?? 0), mark = NEW_SOUND.test(c.sound) || NEW_BEAT.has(c.beat) ? 'NEW' : '';
  rows.push([t, mark, `${c.stem ?? 'foley'}`.padEnd(8), `${c.sound}${c.dur ? ` (${+c.dur.toFixed(3)} s)` : ''} ${(20 * Math.log10(c.gain ?? 1)).toFixed(0)} dB`.padEnd(34), `${c.beat}${off(c.offset)}`]);
}
for (const e of SCORE) {
  const t = beat(e.beat) + e.at, mark = NEW_BEAT.has(e.beat) || ['gulp3'].includes(e.beat) && e.voice === 'sub' ? 'NEW' : '';
  const what = `${e.voice}${e.motif ? `:${e.motif}` : ''} ${e.midi == null ? (e.hz ? `${e.hz} Hz` : '') : [e.midi].flat().map((m) => +m.toFixed(2)).join('/')}${e.until ? ` →|${e.until}` : ''}`;
  rows.push([t, mark, 'music   ', what.padEnd(34), `${e.beat}${off(e.at)}`]);
}
rows.sort((a, b) => a[0] - b[0]);
console.log(`# snd-v4 cue sheet: ${CUES.length} cues + ${SCORE.length} score events (groove notes and the 78 pulse hits included), sorted by start time`);
console.log('# time      mark  stem     sound (cue gain) / voice:motif notes (→|beat = stops dead there)   beat+offset');
for (const [t, mark, ...r] of rows) console.log(`${mmss(t).padStart(8)}  ${mark.padEnd(5)} ${r.join(' ')}`);
console.log(`# ${rows.filter((r) => r[1] === 'NEW').length} NEW rows`);

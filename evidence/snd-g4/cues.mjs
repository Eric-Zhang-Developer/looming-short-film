// node evidence/snd-g4/cues.mjs > evidence/snd-g4/cues.txt — every cue (CUES) and score event (SCORE), sorted by time,
// with its beat name. NEW = a doc 05 "new" G4 sound; NEW-CODE = in doc 05 before G4 but never played until snd-g4.
import { CUES } from '../../src/audio/cues.js';
import { SCORE } from '../../src/audio/score.js';
import { beat } from '../../src/timeline.js';

const NEW = new Set(['phoneBuzz', 'gameBlip', 'blindRattle', 'penStroke', 'penTap', 'examHush', 'clockTick', 'cough', 'paperSlide', 'inkSoak', 'markerScratch']);
const mmss = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;
const off = (o) => (o ? `${o > 0 ? '+' : ''}${+o.toFixed(3)}` : '');
const rows = [];
for (const c of CUES) {
  const t = beat(c.beat) + (c.offset ?? 0);
  const mark = NEW.has(c.sound) || (c.sound === 'inkDrip' && /^gulp|problemSolved|testSolved|examCrossedOff/.test(c.beat) && c.gain === 0.126) ? (NEW.has(c.sound) ? 'NEW' : 'NEW-CODE') : '';
  rows.push([t, mark, `${c.stem ?? 'foley'}`.padEnd(8), `${c.sound}${c.dur ? ` (${+c.dur.toFixed(3)} s)` : ''}`.padEnd(28), `${c.beat}${off(c.offset)}`]);
}
for (const e of SCORE) {
  const t = beat(e.beat) + e.at;
  const mark = ['gulp', 'shrink', 'exam-resolved', 'reprise'].includes(e.motif) || ['testSmile', 'testSolved', 'tagPenUncap'].includes(e.beat)
    || (e.beat === 'blobAbsorbed' && e.voice === 'box') ? (e.motif === 'reprise' ? 'NEW' : 'NEW-CODE') : '';
  const what = `${e.voice}${e.motif ? `:${e.motif}` : ''} ${e.midi == null ? `${e.hz} Hz` : [e.midi].flat().map((m) => +m.toFixed(2)).join('/')}`;
  rows.push([t, mark, 'music   ', what.padEnd(28), `${e.beat}${off(e.at)}`]);
}
rows.sort((a, b) => a[0] - b[0]);
console.log(`# snd-g4 cue sheet: ${CUES.length} cues + ${SCORE.length} score events (groove notes included), sorted by start time`);
console.log('# time      mark      stem     sound / voice                beat+offset');
for (const [t, mark, ...r] of rows) console.log(`${mmss(t).padStart(8)}  ${mark.padEnd(9)} ${r.join(' ')}`);
const n = (m) => rows.filter((r) => r[1] === m).length;
console.log(`# ${n('NEW')} NEW, ${n('NEW-CODE')} NEW-CODE`);

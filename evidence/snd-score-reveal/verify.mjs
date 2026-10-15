// node verify.mjs : each re-anchored score event, old vs new global time, and its error against the target beat.
// score_before.mjs is src/audio/score.js at 809ae72~1 with absolute imports. Events are matched by order within (voice, midi, motif).
import { SCORE as OLD } from './score_before.mjs';
import { SCORE as NEW } from '../../src/audio/score.js';
import { beat } from '../../src/timeline.js';
const T = (e) => beat(e.beat) + e.at, key = (e) => JSON.stringify([e.voice, e.midi, e.vel, e.dur, e.motif, e.hz, e.gain]);
const rows = [];
// 1. time-preserving re-anchors: same event, same global time, new beat name
const left = [...OLD];
for (const n of NEW) {
  const i = left.findIndex((o) => key(o) === key(n) && Math.abs(T(o) - T(n)) < 1e-9);
  if (i >= 0) { const [o] = left.splice(i, 1); if (o.beat !== n.beat) rows.push({ kind: 'same time', old: `${o.beat} ${o.at >= 0 ? '+' : ''}${+o.at.toFixed(3)}`, new: `${n.beat} +${+n.at.toFixed(3)}`, t_old: T(o), t_new: T(n), target: beat(n.beat) + n.at, err: T(n) - (beat(n.beat) + n.at) }); }
}
const changed = left;                                  // old events with no same-time twin: the ones that moved or went
const moved = NEW.filter((n) => !OLD.some((o) => key(o) === key(n) && Math.abs(T(o) - T(n)) < 1e-9));
console.log('re-anchored, time unchanged:', rows.filter((r) => r.kind === 'same time').length);
const g = {}; for (const r of rows) (g[`${r.old} -> ${r.new}`] ??= []).push(r);
for (const [k, v] of Object.entries(g).filter(([k]) => !/lampClickHome.*(fridge|gameNight|curtainsStart|scrollStart|marstonEnter)/.test(k))) console.log(' ', k, 'x' + v.length);
const byBeat = {}; for (const r of rows) { const b = r.new.split(' ')[0]; (byBeat[b] ??= []).push(r); }
for (const [b, v] of Object.entries(byBeat)) console.log(`  -> ${b}: ${v.length} events, from ${[...new Set(v.map((r) => r.old.split(' ')[0]))].join('/')}, max |err| ${Math.max(...v.map((r) => Math.abs(r.err))).toExponential(1)} s`);
console.log('\nmoved or removed (old time -> new time):');
const fmt = (e) => `${e.beat} ${e.at >= 0 ? '+' : ''}${+e.at.toFixed(3)} (${T(e).toFixed(3)} s) ${e.voice} ${JSON.stringify(e.midi)}`;
for (const o of changed) console.log('  old', fmt(o));
for (const n of moved) { const target = beat(n.beat); console.log('  new', fmt(n), `| offset from beat ${n.at}, target ${target.toFixed(3)}`); }
console.log('\nreveal chords vs target beats:');
for (const b of ['revealSleeper', 'revealDrinks', 'revealFreshman']) { const e = NEW.filter((n) => n.beat === b); console.log(`  ${b} ${beat(b).toFixed(3)} s: ${e.length} chord, at=${e[0].at}, t=${T(e[0]).toFixed(3)}, error ${(T(e[0]) - beat(b)).toFixed(6)} s`); }
console.log('problem notes vs target beats:');
for (const b of ['problemSolved2', 'problemSolved3', 'problemSolved4', 'problemSolved5', 'problemSolved6']) { const e = NEW.filter((n) => n.beat === b && n.motif === 'theme' && n.at === 0); console.log(`  ${b} ${beat(b).toFixed(3)} s: theme note ${e[0].midi} at ${T(e[0]).toFixed(3)}, error ${(T(e[0]) - beat(b)).toFixed(6)} s`); }

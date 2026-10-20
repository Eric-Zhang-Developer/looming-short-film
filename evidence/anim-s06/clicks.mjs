// node evidence/anim-s06/clicks.mjs → clicks.txt. The spec's "both clicks are the same buffer": which lampClick cues sit on
// s06's beats, and the sha256 of the lampClick buffer each would render (FOLEY.lampClick(seed), times gain).
import crypto from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { FOLEY } from '../../src/audio/foley.js';
import { CUES } from '../../src/audio/cues.js';
import { seedOf } from '../../src/core/rng.js';
const out = [], log = (s) => { out.push(s); console.log(s); };
const sha = (c) => { const x = FOLEY.lampClick(c.seed ?? seedOf('lampClick')).map((v) => v * (c.gain ?? 1));
  return crypto.createHash('sha256').update(Buffer.from(new Float32Array(x).buffer)).digest('hex'); };
for (const beat of ['lampClickHome', 'lampOffHome']) {
  const c = CUES.filter((c) => c.beat === beat && c.sound === 'lampClick');
  log(`${beat}: ${c.length ? c.map((c) => `lampClick gain ${c.gain} sha256 ${sha(c)}`).join('; ') : 'NO lampClick cue in src/audio/cues.js'}`);
}
writeFileSync(new URL('./clicks.txt', import.meta.url), out.join('\n') + '\n');

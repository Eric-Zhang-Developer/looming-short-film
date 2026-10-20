// The acting kit (rig-v4): one shared module so every shot can give the gators a face to act with. A pure function of t.
// Director, 2026-10-17: "our gator itself is not very emotional. We need more emotion for our gator, even just some
// simple face changes."
//
//   act(rig, t, cues, opts?) → { name, eyes, mouth }
//     rig    any side rig built on sideParts with brow: true (makeGator side, both roommates). Uses body, head, tail, brow,
//            eyes and mouth; a rig without some of them (front, freshman) gets the rest (face, blinks, breath).
//     t      shot-local seconds. Everything is sampled on 2s (onTwos), like blend().
//     cues   [[t0, preset], ...], ascending. The first preset also holds before its t0. Each later change gets ANTIC
//            (2 film frames, one drawing) of anticipation before its t0: eyes squeezed shut, brow and body pushed the
//            opposite way. So the new face lands exactly on t0 (on the beat), and the body settles into it over SETTLE.
//            Every preset must hold MIN_HOLD (12 film frames) before the next anticipation starts, or act() throws.
//     opts   { breath, depth, slump, tilt, tail, blink = true, seed = 0 }: breath = seconds per breath, depth = the body's
//            y-scale swing, slump (+ forward and down, − upright: 1 = 7° of lean, 8° of head drop), tilt = head degrees
//            (+ up), tail = degrees (+ curl up, − droop). Each one given replaces every preset's own value (e.g. slump: 0
//            on a shot whose hand is pinned to a prop). seed picks the blink times (3–5 s apart, one drawing each).
//   Call it every frame AFTER blend()/pose() and follow(): it adds to the head, body and tail angles, and sets
//   body.scale.y, the face takes and the brow. It replaces s11's idle(); don't call both on one rig.
//
//   PRESETS: numb, guilt, flinch, dread, resolve, relief, pride, neutral (table below). pride is two beats: eyes wide and
//   mouth open for its first 0.5 s, then the smile.
//   e.g. act(hero, tLocal, [[0, 'numb'], [2.5, 'dread'], [6, 'resolve']], { slump: 0 })
import * as THREE from 'three';
import { onTwos, kf, lerp, ease } from '../core/ease.ts';
import { hash2 } from '../core/rng.ts';
import { PALETTE } from '../core/palette.ts';
import { makePaper, boilSeed } from '../paper.ts';
import type { PaperSheet } from '../paper.ts';
import { paperMesh, updatePaperMesh } from '../material.ts';
import type { PaperMesh } from '../material.ts';
import type { Puppet } from '../puppet.ts';
import { FIG_K } from './gator.ts';

const D = Math.PI / 180;
export const ANTIC = 2 / 24, MIN_HOLD = 12 / 24, SETTLE = 4 / 12;
const BLINK = [3, 5];    // seconds between blinks
const LEAN = 7, DROP = 8, SAG = 0.04;   // per unit of slump: body lean °, head drop °, body y-scale

// brow: [angle °, + = the snout end up (worried); dy figure px, + = down] or null (hidden: the painted design has none).
// breath: seconds per breath. depth: body y-scale swing.
export type Preset = { eyes: string, mouth: string, bar?: boolean, brow: number[] | null, tilt: number, slump: number, tail: number,
  breath: number, depth: number, first?: { eyes: string, mouth: string, for: number } };
export const PRESETS: Readonly<Record<string, Preset>> = Object.freeze({
  neutral: { eyes: 'open', mouth: 'neutral', brow: [0, 0], tilt: 0, slump: 0, tail: 0, breath: 3.2, depth: 0.010 },
  numb: { eyes: 'tired', mouth: 'neutral', brow: [-3, 7], tilt: -6, slump: 0.9, tail: -14, breath: 4.2, depth: 0.006 },
  guilt: { eyes: 'side', mouth: 'line', brow: [20, 2], tilt: -12, slump: 0.5, tail: -10, breath: 2.6, depth: 0.010 },
  flinch: { eyes: 'gasp', mouth: 'o', brow: [8, -12], tilt: 7, slump: -0.8, tail: 20, breath: 0.9, depth: 0.018 },
  dread: { eyes: 'worried', mouth: 'line', brow: [32, -4], tilt: 2, slump: 0.6, tail: -16, breath: 1.2, depth: 0.018 },
  // trims-home: brows lower and flatter, and `bar`: the mouth is a torn strip as thick as the brow (see mouthBar), not the
  // face sheet's hair-thin `line`, so resolve reads against neutral at phone size.
  resolve: { eyes: 'open', mouth: 'line', bar: true, brow: [-2, 13], tilt: 2, slump: -0.5, tail: 4, breath: 3.8, depth: 0.010 },
  relief: { eyes: 'closed', mouth: 'smile', brow: [12, -7], tilt: 8, slump: 0.2, tail: 8, breath: 5.0, depth: 0.020 },
  pride: { eyes: 'open', mouth: 'smile', brow: [8, -6], tilt: 10, slump: -0.9, tail: 24, breath: 3.0, depth: 0.012,
    first: { eyes: 'gasp', mouth: 'o', for: 0.5 } },
});
type Num = 'tilt' | 'slump' | 'tail' | 'depth';
const NUM: Num[] = ['tilt', 'slump', 'tail', 'depth'];
type Vals = Record<Num, number> & { brow: number[] | null };   // a preset's numbers after opts, plus its brow

// The firm mouth (resolve): one torn strip of the brow's dark green, 78 × 16 figure px (the face sheet's `line` is 73 px
// long and about 3 px thick), laid over the mouth slot on the head. Built on first use, boiled with the film's 10/s boil.
const BAR = { size: [78 * FIG_K, 16 * FIG_K], path: [[0.02, 0.5], [0.14, 0.28], [0.5, 0.2], [0.86, 0.28], [0.98, 0.48], [0.96, 0.74], [0.7, 0.82], [0.4, 0.78], [0.1, 0.82]] };
type ActRig = Puppet & { scale: number };
const bars = new WeakMap<ActRig, { mesh: PaperMesh, make: (seed: number) => PaperSheet }>();
function mouthBar(rig: ActRig, t: number) {
  let b = bars.get(rig);
  if (!b) {
    const color = '#' + new THREE.Color(PALETTE.gator).lerp(new THREE.Color(PALETTE.ink), 0.72).getHexString();   // sideParts' brow
    const make = (seed: number) => makePaper({ path: BAR.path, color, size: BAR.size, key: 'acting-mouthbar', res: 256, seed });
    const mesh = paperMesh(make(0));
    mesh.castShadow = false;
    rig.joints.head.add(mesh);
    bars.set(rig, b = { mesh, make });
  }
  updatePaperMesh(b.mesh, b.make(boilSeed(t, 10)));
  const m = rig.joints.mouth.position;
  b.mesh.position.set(m.x, m.y, m.z + 0.0004);
  return b.mesh;
}

function check(cues: [number, string][]) {
  if (!cues.length) throw new Error('act: cues is empty');
  cues.forEach(([t0, n], i) => {
    if (!PRESETS[n]) throw new Error(`act: unknown preset "${n}" (${Object.keys(PRESETS).join(', ')})`);
    if (i && t0 - cues[i - 1][0] < MIN_HOLD + ANTIC - 1e-6)
      throw new Error(`act: "${cues[i - 1][1]}" at ${cues[i - 1][0]} holds under 12 frames before "${n}" at ${t0}`);
  });
}

// Breath phase in cycles: ∫ dt / period from 0, with each cue's period from its t0, so a rate change never jumps.
function phase(T: number, cues: [number, string][], period: number | undefined) {
  let ph = 0;
  for (let i = 0; i < cues.length; i++) {
    const a = i ? Math.max(0, cues[i][0]) : 0, b = Math.min(T, i + 1 < cues.length ? Math.max(0, cues[i + 1][0]) : T);
    if (b > a) ph += (b - a) / (period ?? PRESETS[cues[i][1]].breath);
  }
  return ph;
}

// Is drawing T a blink? Blink k is at onTwos(b_k), b_0 = 1 + 2·h, then 3–5 s apart (seeded).
function blinking(T: number, seed: number) {
  let b = 1 + 2 * hash2(seed, 9999);
  for (let k = 0; onTwos(b) <= T + 1e-6; k++) {
    const d = onTwos(b);
    if (T >= d - 1e-6 && T < d + 1 / 12 - 1e-6) return true;
    b += BLINK[0] + (BLINK[1] - BLINK[0]) * hash2(seed, k);
  }
  return false;
}

// t: shot-local seconds
export function act(rig: ActRig, t: number, cues: [number, string][], { breath, depth, slump, tilt, tail, blink = true, seed = 0 }: { breath?: number, depth?: number, slump?: number, tilt?: number, tail?: number, blink?: boolean, seed?: number } = {}) {
  check(cues);
  const T = onTwos(t), over = { depth, slump, tilt, tail };
  let i = 0;
  while (i + 1 < cues.length && T >= cues[i + 1][0] - 1e-6) i++;
  const [t0, name] = cues[i], P = PRESETS[name];
  const val = (p: Preset) => { const v = {} as Vals; for (const k of NUM) v[k] = over[k] ?? p[k]; v.brow = p.brow; return v; };
  const cur = val(P), prev = i ? val(PRESETS[cues[i - 1][1]]) : cur;
  const nextAt = cues[i + 1]?.[0], antic = nextAt !== undefined && T >= nextAt - ANTIC - 1e-6;
  let v = {} as Vals, eyes = P.eyes, mouth = P.mouth;
  if (antic) {  // one drawing before the change: squeeze, and push away from where we're going
    const nx = val(PRESETS[cues[i + 1][1]]);
    for (const k of NUM) v[k] = cur[k] + 0.35 * (cur[k] - nx[k]);
    v.brow = cur.brow && nx.brow ? cur.brow.map((x, j) => x + 0.35 * (x - nx.brow![j])) : cur.brow;
    eyes = 'closed';
  } else {
    const u = T < t0 ? 1 : ease((T - t0) / SETTLE);
    for (const k of NUM) v[k] = lerp(prev[k], cur[k], u);
    v.brow = cur.brow && prev.brow ? cur.brow.map((x, j) => lerp(prev.brow![j], x, u)) : cur.brow;
    if (P.first && T >= t0 && T < t0 + P.first.for - 1e-6) ({ eyes, mouth } = P.first);
    const near = Math.abs(T - t0) < 0.25 || (nextAt !== undefined && nextAt - T < 0.25 + ANTIC);
    if (blink && eyes !== 'closed' && !near && blinking(T, seed)) eyes = 'closed';
  }

  const J = rig.joints, ph = phase(T, cues, breath);
  J.body.rotation.z -= v.slump * LEAN * D;
  J.body.scale.y = (1 - SAG * v.slump) * (1 + v.depth * Math.sin(2 * Math.PI * ph));
  if (J.head) J.head.rotation.z += (v.tilt - v.slump * DROP) * D;
  if (J.tail) J.tail.rotation.z += (v.tail + 2.5 * Math.sin(2 * Math.PI * T / 2.6)) * D;
  if (J.brow) {
    const br = J.brow, m = rig.meshes.brow;
    br.userData.restY ??= br.position.y;
    m.visible = !!v.brow && rig.meshes.head.visible;   // hidden under head34
    if (v.brow) { br.rotation.z = v.brow[0] * D; br.position.y = br.userData.restY - v.brow[1] * FIG_K * rig.scale; }
  }
  rig.face({ eyes, mouth });
  if (J.head && J.mouth && typeof document !== 'undefined' && rig.meshes.mouth) {   // the resolve bar replaces the mouth take
    const on = !!P.bar && rig.meshes.head.visible;
    mouthBar(rig, t).visible = on;
    rig.meshes.mouth.visible = !on && rig.meshes.head.visible;
  }
  return { name, eyes, mouth };
}

// The self-check the brief's timing rules lean on: node src/characters/acting.js (no browser; a stub rig).
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const j = () => ({ rotation: { z: 0 }, scale: { y: 1 }, position: { y: 0 }, userData: {} });
  const rig = ({ scale: 1, joints: { body: j(), head: j(), tail: j(), brow: j() }, meshes: { brow: {}, head: { visible: true } }, face(f: unknown) { this.f = f; } }) as any;   // a stub rig: plain objects standing in for three Groups and meshes
  const at = (t: number, cues: [number, string][], o?: Parameters<typeof act>[3]) => { for (const k of Object.values<{ rotation: { z: number } }>(rig.joints)) { k.rotation.z = 0; } return act(rig, t, cues, { blink: false, ...o }); };
  const C: [number, string][] = [[0, 'numb'], [2, 'dread'], [4, 'pride']];
  console.assert(at(1, C).eyes === 'tired', 'numb holds');
  console.assert(at(2 - 1 / 12, C).eyes === 'closed', 'one anticipation drawing before the change');
  console.assert(at(2 - 2 / 12, C).eyes === 'tired', 'only one');
  console.assert(at(2, C).eyes === 'worried' && at(2, C).mouth === 'line', 'the face lands on t0');
  console.assert(at(4.25, C).eyes === 'gasp' && at(4.5, C).mouth === 'smile', 'pride: wide, then the smile');
  let threw = false; try { at(0, [[0, 'numb'], [0.5, 'dread']]); } catch { threw = true; }
  console.assert(threw, 'a hold under 12 frames throws');
  const blinks: number[] = []; for (let f = 0; f < 240; f++) if (act(rig, f / 24, [[0, 'neutral']]).eyes === 'closed') blinks.push(f / 24);
  const draw = [...new Set(blinks.map((b) => onTwos(b)))];
  console.assert(draw.length >= 2 && draw.every((b, k) => !k || (b - draw[k - 1] >= 3 - 1e-6 && b - draw[k - 1] <= 5 + 1 / 12)), 'blinks 3–5 s apart', draw);
  console.assert(blinks.length === 2 * draw.length, 'each blink is one drawing (2 frames)');
  rig.joints.body.rotation.z = 0; act(rig, 3, [[0, 'pride']], { slump: 0 });
  console.assert(rig.joints.body.rotation.z === 0, 'opts.slump replaces the preset');
  console.log('acting: ok', draw.map((b) => b.toFixed(2)).join(' '));
}

// Jointed paper cutouts (doc 04 · Puppets, contract in docs/contracts.md).
//
// Each part is a joint Group at its pivot, holding a paper mesh offset so the pivot lands on the joint.
// `at` is the pivot's position in the parent's joint frame (m, +Y up); `z` is the gap in front of the parent
// (default 3 mm; negative tucks a part behind it, e.g. tail and far arm). `pivot` is [u, v] in the part's
// texture space, as paper.js paths use it: u right, v DOWN, 0..1.
// Face slots are ordinary parts named after a `faces` key ('eyes', 'mouth'); face() swaps their textures.
// Every take in a slot must share the slot part's size: a swap changes textures, never geometry.
// Boil: a part's sheet (or a face take) may be a function seed → PaperSheet. boil(t, rate) re-tears every such
// part at boilSeed(t, rate) by swapping textures; plain sheets never change.
//
// Time: blend() and follow() sample at onTwos(t), so characters step at 12 fps while lights run at 24.
// follow() lags a part behind its ancestors' blended rotation with a damped spring, the same response as
// core's spring(): impulse e^(-k·s)·sin(w·s)/w. It integrates from the first blend key every call, so it is a
// pure function of t and of the last blend() call's poses and keys.
import { kf, onTwos } from './core/ease.ts';
import { paperMesh, updatePaperMesh } from './material.ts';
import type { PaperMesh } from './material.ts';
import { boilSeed } from './paper.ts';
import type { PaperSheet } from './paper.ts';
import * as THREE from 'three';

const DT = 1 / 240;  // follow() integration step (s)

export type Puppet = ReturnType<typeof definePuppet>;
export type SheetSource = PaperSheet | ((seed: number) => PaperSheet);   // a sheet, or seed → sheet for a part that boils
export type PuppetPart = { name: string, sheet: SheetSource, pivot: number[], parent?: string, at: number[], z?: number };
export type Pose = Record<string, number>;   // part → radians

export function definePuppet({ name, parts, faces = {} }: { name: string, parts: PuppetPart[], faces?: Record<string, Record<string, SheetSource>> }) {
  const group = new THREE.Group();
  group.name = name;
  const joints: Record<string, THREE.Group> = {}, meshes: Record<string, PaperMesh> = {}, parentOf: Record<string, string | undefined> = {};
  const src: Record<string, SheetSource> = {};  // part → what it shows now: a PaperSheet or seed → PaperSheet (face() changes it for face slots)
  let seed = 0;
  const at = (s: SheetSource) => (typeof s === 'function' ? s(seed) : s);
  for (const p of parts) {
    if (joints[p.name]) throw new Error(`puppet ${name}: duplicate part "${p.name}"`);
    const parent = p.parent ? joints[p.parent] : group;
    if (!parent) throw new Error(`puppet ${name}: part "${p.name}" needs parent "${p.parent}" defined before it`);
    const joint = new THREE.Group();
    joint.name = p.name;
    joint.position.set(p.at[0], p.at[1], p.z ?? (p.parent ? 0.003 : 0));
    joint.userData.base = 0;
    const sheet = at(p.sheet);
    const mesh = paperMesh(sheet);
    const [w, h] = sheet.size, [u, v] = p.pivot;
    mesh.position.set((0.5 - u) * w, (v - 0.5) * h, 0);
    joint.add(mesh);
    parent.add(joint);
    joints[p.name] = joint; meshes[p.name] = mesh; parentOf[p.name] = p.parent; src[p.name] = p.sheet;
  }

  function pose(angles: Pose) {
    for (const [part, a] of Object.entries(angles)) {
      const j = joints[part];
      if (!j) throw new Error(`puppet ${name}: no part "${part}"`);
      j.userData.base = j.rotation.z = a;
    }
  }

  // The last blend's joint tracks, kept so follow() can read the ancestors' motion over time.
  let track: { names: string[], ks: [number, number[]][], at: (s: number) => number[] } | null = null;
  function blend(poses: Record<string, Pose>, keys: [number, string][], t: number) {
    for (const [, n] of keys) if (!poses[n]) throw new Error(`puppet ${name}: no pose "${n}"`);
    const names = [...new Set(keys.flatMap(([, n]) => Object.keys(poses[n])))];  // joints missing from a pose rest at 0
    const ks = keys.map(([kt, n]): [number, number[]] => [kt, names.map((j) => poses[n][j] ?? 0)]);
    track = { names, ks, at: (s: number) => kf(s, ks) };
    const v = track.at(onTwos(t));
    // Poses the whole puppet, so no angle left by an earlier pose() call leaks in: the frame depends on t alone.
    pose(Object.fromEntries(Object.keys(joints).map((j) => [j, names.includes(j) ? v[names.indexOf(j)] : 0])));
  }

  function face(takes: Record<string, string>) {
    for (const [slot, take] of Object.entries(takes)) {
      const pick = faces[slot]?.[take], mesh = meshes[slot];
      if (!pick) throw new Error(`puppet ${name}: no face ${slot}.${take}`);
      if (!mesh) throw new Error(`puppet ${name}: no part named "${slot}" to carry faces.${slot}`);
      const sheet = at(pick), [w, h] = mesh.userData.sheet.size;
      if (Math.abs(sheet.size[0] - w) > 1e-9 || Math.abs(sheet.size[1] - h) > 1e-9) throw new Error(`puppet ${name}: face ${slot}.${take} size differs from the slot`);
      src[slot] = pick;
      updatePaperMesh(mesh, sheet);
    }
  }

  // Re-tears every function-sheet part (and the face take on show) when the boil seed changes. Call it every frame;
  // order against face() doesn't matter, both resolve takes at the current seed.
  function boil(t: number, rate = 10) {
    const s = boilSeed(t, rate);
    if (s === seed) return;
    seed = s;
    for (const [part, sh] of Object.entries(src)) if (typeof sh === 'function') updatePaperMesh(meshes[part], sh(seed));
  }

  // gain scales the lag (1 = the part holds its world angle at first, like a loose tail).
  // ponytail: integrates from the first key on every call, O(shot length) per frame; cache the state if a long shot gets slow.
  function follow(part: string, t: number, { k = 6, w = 18, gain = 1 } = {}) {
    const j = joints[part];
    if (!j) throw new Error(`puppet ${name}: no part "${part}"`);
    let off = 0;
    const idx: number[] = [];
    for (let a = parentOf[part]; a; a = parentOf[a]) if (track?.names.includes(a)) idx.push(track.names.indexOf(a));
    const T = onTwos(t), t0 = track?.ks[0][0]!;   // read only when idx is non-empty, which needs a track
    if (idx.length && T > t0) {
      const phi = (s: number) => { const v = track!.at(s); return idx.reduce((sum, i) => sum + v[i], 0); };  // ancestors' summed rotation
      const n = Math.max(1, Math.round((T - t0) / DT)), dt = (T - t0) / n, kk = k * k + w * w;
      // y is the part's world angle offset; it is pulled toward the ancestors' angle phi by a damped spring.
      let y = phi(t0), vy = 0;
      for (let i = 0; i < n; i++) {
        const s = t0 + i * dt, p = phi(s), dp = (phi(s + dt) - phi(s - dt)) / (2 * dt);
        vy += (-kk * (y - p) - 2 * k * (vy - dp)) * dt;
        y += vy * dt;
      }
      off = gain * (y - phi(T));
    }
    j.rotation.z = j.userData.base + off;
  }

  return { name, group, joints, meshes, pose, blend, face, follow, boil };
}

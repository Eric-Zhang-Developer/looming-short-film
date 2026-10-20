// s13 · Everyone has one (docs/shots/s13.md, v7). One locked top-down shot of the Marston reading room, 8 s: v3's build,
// then the room turns. He's already under the light (his phone went into his pocket in s10b), so his desk sits in its
// warm pool with a small shadow from the first frame, in a dark room. He lifts his head (headLift); desk by desk the
// other gators' phones wake and each one's shadow springs up big from its blob, on a note (S13_DESKS in timeline.ts,
// which score.ts reads too): the Sleeper, Drinks, the Freshman a second apart, then the other seven closing round him,
// until the shadows overlap across the room. From the peak (phonesDown), desk by desk outward from his, each gator turns
// their phone face down: its glow goes, its shadow collapses to a small pool under the pendant, and they start working.
// The grade warms from v3's teal to s11's gold as the last phones go down; he goes back to his page.
// The light rule stays literal: a big shadow only ever hangs off a lit phone (low and close); the pendant over each desk
// (not drawn: it would hang between camera and desk, README §8) makes the pool and the small round shadow.
// v3's rig (phones, glows, cyan fills, decals that grow from 1× on easeOut) plus v6's figures, props and pools. His head
// from above is the plain hero_head piece, like the crowd's: no eye overlay; his looks are head turns.
// The carpet is marston_kit's, the pages, pens, phones and backpack props_kit's; desk tops, figures, textbooks and cans are
// top_props_sheet / top_figures_sheet proxies. Shadows are decals cut from each blob's own silhouette (doc 04 Crowds).
// This shot only: the floor is z = 0 and z is height above it; +Y is north (up the frame).
import * as THREE from 'three';
import { makePaper, boilSeed } from '../paper.ts';
import { paperMesh, updatePaperMesh } from '../material.ts';
import { ambient } from '../lights.ts';
import { createBlob } from '../blob.ts';
import { kf, clamp, ease, easeOut, onTwos } from '../core/ease.ts';
import { mulberry32, seedOf } from '../core/rng.ts';
import { SHOTS, S13_DESKS } from '../timeline.ts';
import { loadLUT } from '../post.ts';
import { carpetCanvas } from './s11.ts';
import type { ShotCtx } from '../film.ts';
import type { PaperOptions } from '../paper.ts';
import type { PaperMesh } from '../material.ts';
import type { Kit } from '../assets.ts';

const ID = 's13', DEG = Math.PI / 180;
const B = SHOTS.find((s) => s.id === ID)!.beats;
const at = ([b, o]: [string, number]) => B[b] + o;                           // an S13_DESKS point → s13 local seconds
const XS = [-0.32, -0.16, 0, 0.16, 0.32], YS = [0.13, 0, -0.13];   // desk centers; d1 is top-left, row-major

// Crowd desks: pose piece, mirrored, faces (+1 N, −1 S), figure scale, blob r, loom scale S (v3's: the decal's width ÷ the
// blob's), phone side (ph −1: on the occupant's left, so Drinks' shadow falls toward him, not over the Freshman's), props,
// and the working read once their phone is down: 'pen' wiggles the pen on 2s, a number is a page turn that many seconds
// after it, 'scribble' moves the Freshman's pen along the page. The sheet has 6 poses for 10 figures, so 4 are mirrored.
type Desk = { who: string, pose: string, mir: number, f: number, ph?: number, sc: number, r: number, S: number, props: string[], work?: string | number };
// deskRig()'s result: every desk's pool and blob; a crowd desk (with a phone) also has the phone rig, the loom and its times.
type Glow = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
type BaseRig = { key: string, who: string, blob: ReturnType<typeof createBlob>, pool: Glow, r: number };
type DeskRig = (BaseRig & { loom?: undefined }) | (BaseRig & { up: PaperMesh, down: PaperMesh, screen: Glow, glow: Glow,
  loom: Glow, fill: THREE.PointLight, S: number, wake: number, off: number });
export const CROWD: Record<string, Desk> = {
  d1:  { who: 'G1', pose: 'seated_3', mir: 0, f: 1, sc: 0.95, r: 0.010, S: 4, props: ['page', 'pen'], work: 'pen' },
  d2:  { who: 'sleeper', pose: 'seated_1', mir: 0, f: 1, sc: 1.05, r: 0.012, S: 5, props: ['textbook'] },   // head down over the book
  d4:  { who: 'drinks', pose: 'seated_2', mir: 0, f: -1, ph: -1, sc: 1.00, r: 0.013, S: 7, props: ['page', 'pen', 'can', 'can', 'can'], work: 'pen' },
  d5:  { who: 'G2', pose: 'seated_4', mir: 0, f: 1, sc: 1.10, r: 0.009, S: 3, props: ['page', 'pen'], work: 'pen' },
  d7:  { who: 'G3', pose: 'seated_5', mir: 0, f: -1, sc: 0.90, r: 0.011, S: 6, props: ['page', 'textbook'], work: 1.0 },
  d9:  { who: 'G4', pose: 'seated_1', mir: 1, f: 1, sc: 1.15, r: 0.012, S: 5, props: ['page', 'pen'], work: 'pen' },
  d11: { who: 'G5', pose: 'seated_2', mir: 1, f: 1, sc: 1.00, r: 0.010, S: 4, props: ['page'], work: 0.75 },
  d12: { who: 'G6', pose: 'seated_4', mir: 1, f: -1, sc: 0.95, r: 0.014, S: 6, props: ['page', 'pen', 'textbook'], work: 'pen' },
  d14: { who: 'G7', pose: 'seated_5', mir: 1, f: -1, sc: 1.05, r: 0.011, S: 3, props: ['page', 'pen'], work: 'pen' },
  d15: { who: 'freshman', pose: 'seated_6', mir: 0, f: 1, sc: 0.80, r: 0.010, S: 9, props: ['page', 'pen', 'backpack'], work: 'scribble' },
};
// Where props sit, in the occupant's frame (x to their right, y away from them), and their turn (deg).
const PROP_AT: Record<string, number[]> = { page: [0.026, 0.010, 8], pen: [0.016, -0.004, -30], textbook: [-0.024, -0.008, -6], backpack: [0, -0.088, 12] };
const PHONE_AT = [0.030, -0.020], BLOB_AT = [0, 0.005], SEAT_AT = [0, -0.050];
const HERO = { r: 0.030, at: [0.030, -0.028] };      // 2.5× (README §1, Q16), on the desk's right beside his page (s11's side)
// Pool scale: the pendant 0.127 above the desk, the blob's height ≈ its radius above it (README §3: 0.127 / (0.127 − r)).
const POOL = (r: number) => 0.127 / (0.127 - r);
const SOUTH = 0.002, SOFT = 0.004;                     // pool shadows 2 mm south of the blob (the pendants hang north); soft edge
// The drop's silhouette is ~0.91 as tall as it is wide (evidence/anim-s13/measure.txt), so the loom is 1.5 × as long as wide.
const LONG = 1.5 / 0.91;
const GROW = 0.5, FALL = 0.25;                         // v3: a loom springs up over 0.5 s; v7: it collapses twice as fast
const FROZEN_PROPS = new Set(['page', 'pen', 'backpack']);   // drawn from props_kit; the rest stay top_props_sheet proxies

// Hero head (relative to his body, deg, + = clockwise from camera) and body turn. Build: he looks at each featured desk
// a quarter-second after its phone wakes (v3's order and angles: the Sleeper −42°, Drinks +42°, the Freshman over his
// shoulder, 105° in all) and holds on the Freshman while the room fills. Turn: back to centre for the first phones down,
// a glance left as the Sleeper's goes and right as Drinks' goes, then back to his page on the home chord.
const look = (b: string, d = 0.25) => B[b] + d;
const HEAD_ROT: [number, number][] = [[look('revealSleeper'), 0], [look('revealSleeper', 0.5), -42], [look('revealDrinks'), -42], [look('revealDrinks', 0.5), 42],
  [look('revealFreshman'), 42], [look('revealFreshman', 0.5), 65], [B.phonesDown - 0.25, 65], [B.phonesDown, 0],
  [at(S13_DESKS.d2.down) + 0.167, 0], [at(S13_DESKS.d2.down) + 0.333, -42], [at(S13_DESKS.d4.down) + 0.167, -42], [at(S13_DESKS.d4.down) + 0.333, 42],
  [B.homeChord - 0.25, 42], [B.homeChord, 0]];
const BODY_ROT: [number, number][] = [[look('revealFreshman'), 0], [look('revealFreshman', 0.5), 40], [B.phonesDown - 0.25, 40], [B.phonesDown, 0]];
const DOWN = B.homeChord + 0.333;                      // head down to the page
const HEAD_Z: [number, number][] = [[0.3, 0.036], [B.headLift, 0.034], [B.headLift + 0.167, 0.075], [B.homeChord, 0.075], [DOWN, 0.040]];   // the sink, the lift, down to work
const HEAD_Y: [number, number][] = [[B.headLift, 0.030], [B.headLift + 0.167, 0.012], [B.homeChord, 0.012], [DOWN, 0.028]];
const ARMS_Y: [number, number][] = [[DOWN + 0.167 - 1 / 12, 0.024], [DOWN + 0.167, 0.030]];   // his pen hand comes forward onto the page
// His blob looks where he looks: side eyes toward each glance, open between.
const blobLook = (t: number) => kf(t, HEAD_ROT, () => 0) < -20 ? -1 : kf(t, HEAD_ROT, () => 0) > 20 ? 1 : null;

const POOL_I = 0.55, POOL_DIM = 0.15;                // light-pool decal opacity (additive); crowd pools at 0.15 of it while their phone is up
// The room, v3 → v6 as the phones go down: v3's dim cool light from straight above (no shadows) and ambient ×0.3 under the
// 'marston' grade, to v6's warm pendant light and ambient ×0.6 under 'amber' (the grade s11 and s15 use).
const ROOM_I = [0.9, 0.55], AMB_K = [0.3, 0.6];
const FILL = 0.14, FILL_Z = 0.2, GLOW = 0.35;         // v3's crowd phone: fill (cd), its height, glow strength
const HOODIE_K = 0.8;                                 // v3: the hero's hoodie (green[0]), as a multiplier
const BREATH = 0.012;                                 // v3 seated breath, as a scale
const tone = (a: THREE.ColorRepresentation, b: THREE.ColorRepresentation, k: number) => new THREE.Color(a).lerp(new THREE.Color(b), k);
const warmAt = (t: number) => ease((t - B.phonesDown) / (B.homeChord + 0.5 - B.phonesDown));

export async function build({ scene, camera, assets, PALETTE, post }: ShotCtx) {
  scene.background = tone(PALETTE.navy, PALETTE.ink, 0.5);
  camera.up.set(0, 1, 0);
  camera.position.set(0, 0, 1.60);
  camera.lookAt(0, 0, 0);

  // The grade: one 3D LUT re-mixed between v3's 'marston' and v6's 'amber' in 1/24 steps (a pure function of t).
  const [lutA, lutB] = [loadLUT('marston')!, loadLUT('amber')!], N = lutA.image.width;
  const lut = new THREE.Data3DTexture(new Uint8Array(lutA.image.data!.length), N, N, N);
  Object.assign(lut, { format: THREE.RGBAFormat, type: THREE.UnsignedByteType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping, wrapR: THREE.ClampToEdgeWrapping, unpackAlignment: 1 });
  let lutK = -1;
  const grade = (w: number) => {
    const k = Math.round(w * 24) / 24;
    if (k === lutK) return;
    lutK = k;
    const a = lutA.image.data!, b = lutB.image.data!, d = lut.image.data!;
    for (let i = 0; i < d.length; i++) d[i] = Math.round(a[i] + (b[i] - a[i]) * k);
    lut.needsUpdate = true;
  };
  grade(0);
  post({ focus: 1.56, aperture: 0.008, maxblur: 0.004, lut });

  const WARM = tone(PALETTE.lamp, PALETTE.cream, 0.3);   // v4 Marston warm (README v4)
  const COOL = tone(PALETTE.phone, PALETTE.cream, 0.5);  // v3's dead-ceiling leak
  const amb = ambient(), AMB0 = amb.intensity;
  amb.position.set(0, 0, 1);  // sky is above in this shot
  scene.add(amb);
  const ROOM = new THREE.DirectionalLight(COOL, ROOM_I[0]);   // the room's paper light from straight above; casts nothing
  ROOM.position.set(0, 0, 2);
  scene.add(ROOM, ROOM.target);

  const [figs, props, kitp, mkit] = await Promise.all(['top_figures_sheet', 'top_props_sheet', 'props_kit', 'marston_kit'].map((n) => assets.load(n)));
  const KP: Record<string, string> = { page: 'blank_page', pen: 'pen', backpack: 'backpack' };
  const prop = (p: string, key: string) => (FROZEN_PROPS.has(p) ? art(kitp, KP[p], key) : art(props, p, key));
  const boiling: { mesh: PaperMesh, opts: PaperOptions }[] = [];
  const piece = (opts: PaperOptions, parent: THREE.Object3D = scene) => {
    const mesh = paperMesh(makePaper({ ...opts, seed: 0 }));
    boiling.push({ mesh, opts }); parent.add(mesh); return mesh;
  };
  const art = (sheet: Kit, name: string, key: string, extra: PaperOptions = {}): PaperOptions => ({ art: sheet.pieces[name], size: sheet.sizes[name], key, res: 128, ...extra });
  const place = <T extends THREE.Object3D>(m: T, x: number, y: number, z: number, rot = 0): T => { m.position.set(x, y, z); m.rotation.z = rot; return m; };
  const flat = <M extends THREE.Material>(w: number, h: number, mat: M) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);

  // ---------- floor: marston_kit's carpet, laid tile by tile, seen from above; darkened so the lit desks are islands ----------
  const rng = mulberry32(seedOf(ID, 'set'));
  // On a backing of the tile's own colour: the tiles' rounded corners leave pinholes that read as rows of dots from above.
  const floorArt = (() => {
    const tiles = carpetCanvas(mkit, [1.2, 0.7]), c = Object.assign(document.createElement('canvas'), { width: tiles.width, height: tiles.height });
    const g = c.getContext('2d')!, t = mkit.pieces.carpet_tile;
    g.drawImage(t, t.width / 2 - 8, t.height / 2 - 8, 16, 16, 0, 0, c.width, c.height);   // the tile's middle, stretched: its colour
    g.drawImage(tiles, 0, 0);
    g.fillStyle = 'rgba(20, 24, 40, 0.35)'; g.fillRect(0, 0, c.width, c.height);         // a little darker between the desks
    return c;
  })();
  piece({ art: floorArt, size: [1.2, 0.7], key: `${ID}-marston_floor`, res: 1024 });

  // ---------- 15 desk tops, each torn from its own seed, each turned a little ----------
  for (let i = 0; i < 15; i++) {
    place(piece(art(props, 'desk_top', `${ID}-desk-${i + 1}`, { weight: 'kraft', res: 256 })),
      XS[i % 5], YS[Math.floor(i / 5)], 0.032, (rng() * 6 - 3) * DEG);
  }

  // ---------- shared desk rig: the pendant's pool, a blob and its pool shadow; a crowd desk adds v3's phone and loom ----------
  const glowTex = (inner: number) => {
    const c = Object.assign(document.createElement('canvas'), { width: 128, height: 128 }), g = c.getContext('2d')!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(inner, `rgba(255,255,255,${inner === 0.5 ? 0.55 : 0.45})`); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const poolTex = glowTex(0.5), phoneTex = glowTex(0.35);   // v6's pool falloff, v3's phone glow
  const rigs: DeskRig[] = [];
  function deskRig({ key, who, cx, cy, f, r, bx = cx + f * BLOB_AT[0], by = cy + f * BLOB_AT[1], d = null }:
    { key: string, who: string, cx: number, cy: number, f: number, r: number, bx?: number, by?: number, d?: Desk | null }): DeskRig {
    // The pool: falls to 0 at r 0.05 round the desk centre, additive, on the desk top under every prop.
    const pool = place(flat(0.10, 0.10, new THREE.MeshBasicMaterial({ color: WARM, map: poolTex, transparent: true, opacity: POOL_I,
      blending: THREE.AdditiveBlending, depthWrite: false })), cx, cy, 0.0322);
    const blob = createBlob({ radius: r, seed: seedOf(ID, key) });
    place(blob.mesh, bx, by, 0.036);
    // The pendant's shadow: the blob's own silhouette at its pool scale, centred under it, 2 mm south. Always there. The
    // mesh's origin is its contact point (its south edge), about r below its centre, so the scaled decal is moved back by
    // r (S − 1) to share the blob's centre.
    const P = POOL(r), small = place(new THREE.Mesh(blob.mesh.geometry, blob.silhouette()), bx, by - r * (P - 1) - SOUTH, 0.0325);
    small.scale.set(P, P, 1);
    small.material.opacity = 0.85;
    small.material.userData.soft.value = (SOFT / 2) / (P * r);   // half the soft edge, in blob-radius units
    scene.add(pool, blob.mesh, small);
    const rig: DeskRig = { key, who, blob, pool, r };
    rigs.push(rig);
    if (!d) return rig;

    // v3's phone rig. The phone at the desk's front corner on the occupant's side, face up; its screen and cyan glow light
    // on the wake over 2 frames, and an unshadowed cyan fill above lights this desk and the floor round it, so the room
    // appears desk by desk. Face down: the phone flips over 2 drawings and all three go out.
    const loc = ([x, y]: number[]) => [cx + f * x, cy + f * y];
    const [px, py] = loc([(d.ph ?? 1) * PHONE_AT[0], PHONE_AT[1]]), phoneRot = (f < 0 ? Math.PI : 0) + Math.PI / 2;   // painted landscape
    const up = place(piece(art(kitp, 'phone_face_up', `${ID}-${key}-phone`)), px, py, 0.033, phoneRot);
    const down = place(piece(art(kitp, 'phone_face_down', `${ID}-${key}-phone-down`)), px, py, 0.033, phoneRot);
    const screen = place(flat(0.0062, 0.0125, new THREE.MeshBasicMaterial({ color: PALETTE.phone, transparent: true, depthWrite: false })), px, py, 0.0335, phoneRot - Math.PI / 2);
    const glow = place(flat(0.08, 0.08, new THREE.MeshBasicMaterial({ color: PALETTE.phone, map: phoneTex, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false })), px, py, 0.0332);
    // The loom: the same silhouette, starting at the blob's centre and thrown away from the phone, width S × the blob's
    // and 1.5 × as long (a low light grazing a flat surface). It springs up from 1× on the wake and falls back on the down.
    const u = new THREE.Vector2(bx - px, by + r - py).normalize(), rot = Math.atan2(u.y, u.x) - Math.PI / 2;
    const loom = place(new THREE.Mesh(blob.mesh.geometry, blob.silhouette()), bx, by + r, 0.0326, rot);
    const len = d.S * 2.2 * r * 1.5;   // full loom length (the silhouette is ~1.1 × 2r wide)
    const fill = place(new THREE.PointLight(PALETTE.phone, 0, 0.75 * len + FILL_Z, 2), px + 0.4 * len * u.x, py + 0.4 * len * u.y, FILL_Z);
    scene.add(screen, glow, loom, fill);
    const ev = S13_DESKS[key];
    return Object.assign(rig, { up, down, screen, glow, loom, fill, S: d.S, wake: at(ev.wake), off: at(ev.down) });
  }

  // ---------- the crowd ----------
  const figRng = mulberry32(seedOf(ID, 'crowd'));
  let n = 0;
  const breathers: { m: PaperMesh, sx: number, sy: number, ph: number, slow: boolean }[] = [],
    workers: { d: Desk, f: number, ph: number, from: number, pen?: PaperMesh, page?: PaperMesh, base?: THREE.Vector3 }[] = [];
  const cast: { who: string, pose: string, mirror: boolean, turnDeg: number, scale: number }[] = [];   // (who, pose, mirror, turn, scale): read by evidence/anim-s13/measure.html
  for (const [key, d] of Object.entries(CROWD)) {
    const i = Number(key.slice(1)) - 1, cx = XS[i % 5], cy = YS[Math.floor(i / 5)], f = d.f;
    const loc = ([x, y]: number[]) => [cx + f * x, cy + f * y], facing = f < 0 ? Math.PI : 0;
    const [sx, sy] = loc(SEAT_AT), rot = facing + (figRng() * 16 - 8) * DEG;
    const fig = place(piece(art(figs, d.pose, `${ID}-${key}-${d.pose}`)), sx, sy, 0.048 + 0.002 * n++, rot);
    fig.scale.set(d.mir ? -d.sc : d.sc, d.sc, 1);
    breathers.push({ m: fig, sx: d.mir ? -d.sc : d.sc, sy: d.sc, ph: figRng(), slow: d.who === 'sleeper' });   // v3: a breath each, none in step
    const placed: Partial<Record<string, PaperMesh>> = {};
    d.props.forEach((p, j) => {
      if (p === 'can') { const [x, y] = loc([0.006 + 0.0085 * (j - 2), 0.016]); return place(piece(art(props, 'can', `${ID}-${key}-can${j}`)), x, y, 0.033); }
      const [ox, oy, deg] = PROP_AT[p], [x, y] = loc([ox, oy]);
      placed[p] = place(piece(prop(p, `${ID}-${key}-${p}`)), x, y, p === 'backpack' ? 0.045 : p === 'pen' ? 0.0335 : 0.033, facing + deg * DEG);
    });
    const rig = deskRig({ key, who: d.who, cx, cy, f, r: d.r, d });   // a crowd desk: deskRig adds the phone rig (and off)
    if (d.work !== undefined) workers.push({ d, f, ph: figRng(), from: (rig as Extract<DeskRig, { off: number }>).off + 1 / 12, ...placed, base: placed.pen?.position.clone() });
    cast.push({ who: d.who, pose: d.pose, mirror: !!d.mir, turnDeg: +(rot / DEG).toFixed(1), scale: d.sc });
  }

  // ---------- the hero (d8, centre), from hero_top parts; already lit, no phone (it's in his pocket since s10b) ----------
  const hero = place(new THREE.Group(), SEAT_AT[0], SEAT_AT[1], 0);
  scene.add(hero);
  const arms = place(piece(art(figs, 'hero_arms', `${ID}-hero-arms`), hero), 0, 0.024, 0.034);
  const green = [
    place(piece(art(figs, 'hero_body', `${ID}-hero-body`), hero), 0, 0, 0.055),
    arms,
    place(piece(art(figs, 'hero_tail', `${ID}-hero-tail`), hero), 0.004, -0.038, 0.030, 8 * DEG),
  ];
  const neck = new THREE.Group(); hero.add(neck);   // the neck pivot; the head sits just in front of it
  green.push(place(piece(art(figs, 'hero_head', `${ID}-hero-head`), neck), 0, 0.006, 0));   // plain from above, as the crowd's
  place(piece(art(figs, 'hero_backpack', `${ID}-hero-backpack`)), -0.042, -0.072, 0.010, -15 * DEG);
  // his page and pen as s11 left them
  place(piece(prop('page', `${ID}-hero-page`)), -0.012, 0.004, 0.033, 4 * DEG);
  place(piece(prop('pen', `${ID}-hero-pen`)), -0.020, -0.012, 0.0335, -30 * DEG);
  const heroRig = deskRig({ key: 'd8', who: 'hero', cx: 0, cy: 0, f: 1, r: HERO.r, bx: HERO.at[0], by: HERO.at[1] });

  return {
    rigs, cast,   // read by evidence/anim-s13/measure.html
    parts: { exam: heroRig.blob, camera },
    update(tLocal: number) {
      const seed = boilSeed(tLocal, 10);
      for (const p of boiling) updatePaperMesh(p.mesh, makePaper({ ...p.opts, seed }));

      // The room warms as the last phones go down (light on 1s).
      const w = warmAt(tLocal);
      grade(w);
      ROOM.color.copy(COOL).lerp(WARM, w);
      ROOM.intensity = ROOM_I[0] + (ROOM_I[1] - ROOM_I[0]) * w;
      amb.intensity = AMB0 * (AMB_K[0] + (AMB_K[1] - AMB_K[0]) * w);

      // Hero: characters step on 2s.
      const tc = onTwos(tLocal);
      hero.rotation.z = -kf(tc, BODY_ROT) * DEG;
      neck.position.set(0, kf(tc, HEAD_Y), kf(tc, HEAD_Z));
      neck.rotation.z = -kf(tc, HEAD_ROT) * DEG;
      arms.position.y = kf(tc, ARMS_Y, (u) => (u >= 1 ? 1 : 0));
      for (const b of breathers) {   // v3 secondary motion: a seated breath on 2s, the Sleeper's slower and deeper
        const k = 1 + (b.slow ? BREATH * 1.6 : BREATH) * Math.sin(2 * Math.PI * (tc / (b.slow ? 4.2 : 3.2) + b.ph));
        b.m.scale.set(b.sx * k, b.sy * k, 1);
      }
      hero.scale.setScalar(1 + BREATH * Math.sin(2 * Math.PI * tc / 3.6));
      green.forEach((m, i) => m.material.color.setScalar(i === 0 ? HOODIE_K : 1));   // v3: the cream hoodie clipped to white

      // Crowd desks (light on 1s, the phone's flip on 2s). Wake: the screen and glow light over 2 frames, the loom springs
      // up from 1× over GROW on easeOut, at full opacity from wake + 0.1 (v3). Down: the phone flips (2 drawings) and its
      // light dies over FALL as it turns onto its face, the loom falling back to 1× and fading with it (so no loom ever
      // outlasts its light), and the pendant's pool comes up to full. The screen goes on the first flip drawing.
      for (const g of rigs) {
        if (!g.loom) continue;
        const dw = tLocal - g.wake, dd = tLocal - g.off, fall = clamp(dd / FALL), lit = dd < 0 ? clamp(dw * 12 + 0.5) : 1 - fall;
        g.screen.material.opacity = lit * (0.4 + 0.6 * GLOW);
        g.glow.material.opacity = lit * GLOW;
        g.fill.intensity = lit * FILL;
        const grown = 1 + (g.S - 1) * easeOut(dw / GROW), s = dd < 0 ? grown : 1 + (grown - 1) * (1 - easeOut(fall));
        g.loom.visible = dw > 0 && fall < 1;
        g.loom.scale.set(s, LONG * s, 1);
        g.loom.material.opacity = 0.85 * clamp(dw / 0.1) * (1 - fall);
        g.loom.material.userData.soft.value = 0.003 / (s * g.r);   // half of v3's 0.006 m soft edge, in blob-radius units
        g.pool.material.opacity = POOL_I * (POOL_DIM + (1 - POOL_DIM) * ease(fall));
        const flip = dd < 0 ? -1 : Math.floor(dd * 12 + 1e-4);   // drawings since the down: −1 before; 0 and 1 are the flip
        g.up.visible = flip < 1; g.down.visible = !g.up.visible; g.screen.visible = flip < 0;
        g.up.scale.x = g.down.scale.x = flip === 0 || flip === 1 ? 0.45 : 1;
      }

      // The crowd at work once their phone is down, on 2s: pens wiggle ±1 mm, a page turn, the Freshman's pen along the page.
      const dn = Math.round(tc * 12);   // drawing number (12 per second)
      for (const wk of workers) {
        const dt = tc - wk.from;
        if (wk.pen && wk.base) {
          const k = dt < 0 ? 0 : Math.floor(dn / 2 + 7 * wk.ph) % 2 ? 1 : -1;
          let dx = 0.001 * k, dy = 0;
          if (wk.d.work === 'scribble') {
            const u = clamp(dt / 0.6);
            dx = 0.006 * u + 0.001 * k; dy = u > 0 && u < 1 ? 0.0015 * k : 0;
          }
          wk.pen.position.set(wk.base.x + wk.f * dx, wk.base.y + wk.f * dy, wk.base.z);
        }
        if (typeof wk.d.work === 'number' && wk.page) {   // one 2-drawing flip: the page folded over on its spine
          const t0 = wk.from - 1 / 12 + wk.d.work, turning = tc >= t0 - 1e-6 && tc < t0 + 2 / 12 - 1e-6;
          wk.page.scale.x = turning ? (tc < t0 + 1 / 12 - 1e-6 ? 0.45 : -0.45) : 1;
        }
      }

      // Blobs: the crowd's look at their own gator's page; his follows his looks and squashes at the Freshman's loom.
      for (const g of rigs) {
        if (g.who !== 'hero') { g.blob.update(tLocal, { wobble: 0.5, eyes: 'open', look: g.who === 'sleeper' ? -1 : 1 }); continue; }
        const l = blobLook(tc), dt = tc - B.revealFreshman, sq = dt >= 0 ? 0.1 * Math.exp(-6 * dt) * Math.cos(18 * dt) : 0;
        g.blob.update(tLocal, { wobble: 1, eyes: l === null ? 'open' : 'side', look: l ?? 1, squash: sq });
      }
    },
  };
}

// The named pose library (contract: docs/contracts.md §characters). Poses are plain { part: radians } objects for
// Puppet.blend() and Puppet.pose(). Side-rig poses are written in the s15 convention through specPose():
// lean = body about the hip, + forward (toward +x); arm / far = the near / far arm's WORLD angle, 0 = +x, − = down;
// head = head on body, + snout up; jaw + open; tail + tip up; leg / farLeg = the near / far leg's WORLD angle, 0 = straight
// down, + = foot forward (toward +x). All in degrees. Numbers come from the shot specs; leg angles are mine (Q9).
import { kf, onTwos } from '../core/ease.js';
import { hipHeight } from './gator.js';

const D = Math.PI / 180;

export function specPose({ lean = 0, arm = -70, far = arm - 10, head = 0, jaw, tail, leg, farLeg = leg } = {}) {
  const p = { body: -lean * D, arm_r: (arm + lean) * D, head: head * D };
  if (far !== null) p.arm_l = (far + lean) * D;
  if (leg !== undefined) { p.leg_r = (leg + lean) * D; p.leg_l = (farLeg + lean) * D; }
  if (jaw !== undefined) p.jaw = -jaw * D;
  if (tail !== undefined) p.tail = -tail * D;
  return p;
}
const sp = specPose;
const deg = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v * D]));
const HANG = -95;  // standing arms
// Legs by stance (root heights from hipHeight). Seated: tucked forward under the desk, feet 2 mm clear of the floor at
// s15's seat (hip 0.022 up). Kneeling: folded back, toes down, hip 0.011 up (s04's 0.06 kneeling height). Standing:
// near leg plumb (hip HIP up), the far foot 8° ahead so two feet read. Lying: legs flat behind.
const seat = (o) => sp({ leg: 60, farLeg: 54, ...o }), kneel = (o) => sp({ leg: -90, ...o });
const up = (o) => sp({ leg: 0, farLeg: 8, ...o }), lie = (o) => sp({ leg: -90, farLeg: -94, ...o });

// [name, rig, shots, pose]. rig: gator (side), front, back, freshman, tall, round, custodian, neighbor, sleeper, heroTop.
const TABLE = [
  // The lamp press, K0–K7 (s15 table, identical in s06; s18 mirrors it standing)
  ['rest', 'gator', ['s06', 's15', 's17'], seat({ lean: 0, arm: -70 })],
  ['reach_antic', 'gator', ['s06', 's15'], seat({ lean: -4, arm: -80, head: -3 })],
  ['reach_lift', 'gator', ['s06', 's15'], seat({ lean: 6, arm: 0 })],
  ['reach', 'gator', ['s06', 's15'], seat({ lean: 14, arm: 22 })],
  ['touch', 'gator', ['s06', 's15'], seat({ lean: 16, arm: 18 })],
  ['press', 'gator', ['s06', 's15'], seat({ lean: 16, arm: 15 })],
  // Startle
  ['recoil', 'gator', ['s06'], seat({ lean: -6, arm: -55, far: -60, head: 4, tail: 12 })],
  ['lean_away', 'gator', ['s06'], seat({ lean: -9, arm: -70 })],
  // Sitting
  ['sit', 'gator', ['s11', 's14', 's15'], seat({ lean: 0, arm: -30 })],
  ['sit_screen', 'gator', ['s11'], seat({ lean: 4, arm: -30, head: -5 })],
  ['sit_back', 'gator', ['s17'], seat({ lean: -8, arm: -50, head: 6 })],
  ['slump', 'gator', ['s02', 's03'], seat({ lean: 10, arm: 35, far: -40, head: -8 })],
  ['shrug', 'gator', ['s03'], seat({ lean: 8, arm: 55, far: -20, head: 6 })],
  ['head_down', 'gator', ['s12'], seat({ lean: 35, arm: -30, far: -30, head: -20, tail: -30 })],
  ['exhale', 'gator', ['s15'], seat({ lean: 9, arm: -26 })],
  // Phone
  ['grab', 'gator', ['s06', 's15'], seat({ lean: 24, arm: -10 })],
  ['grip', 'gator', ['s06', 's11', 's15'], seat({ lean: 30, arm: -12 })],
  ['lift_phone', 'gator', ['s03', 's11'], seat({ lean: 23, arm: -5 })],
  ['scroll', 'gator', ['s03', 's05', 's06', 's11'], seat({ lean: 24, arm: -11, head: -10 })],
  ['scroll_flick', 'gator', ['s03', 's05', 's06'], seat({ lean: 24, arm: -9, head: -10 })],
  // Laptop
  ['lid_reach', 'gator', ['s11'], seat({ lean: 23, arm: -12 })],
  ['lid_lift', 'gator', ['s11'], seat({ lean: 28, arm: 10 })],
  // Writing
  ['write_a', 'gator', ['s15', 's16', 's17'], seat({ lean: 10, arm: -30 })],
  ['write_b', 'gator', ['s15', 's16', 's17'], seat({ lean: 14, arm: -26 })],
  ['write_c', 'gator', ['s15', 's16', 's17'], seat({ lean: 18, arm: -24 })],
  ['poise', 'gator', ['s15', 's16'], seat({ lean: 12, arm: -24 })],
  ['uncap', 'gator', ['s15'], seat({ lean: 10, arm: -8, far: -4 })],
  ['uncap_pull', 'gator', ['s15'], seat({ lean: 10, arm: -8, far: 20 })],
  ['brace', 'gator', ['s16'], seat({ lean: 18, arm: -24, head: -4 })],
  ['solve', 'gator', ['s16'], seat({ lean: 8, arm: -20 })],
  ['think', 'gator', ['s16'], seat({ lean: 4, arm: -40, head: 6 })],
  ['flip', 'gator', ['s16'], seat({ lean: 20, arm: -8 })],
  // Kneeling at the fridge (root 0.011 above the floor)
  ['kneel_reach', 'gator', ['s04'], kneel({ lean: 10, arm: -5 })],
  ['kneel_antic', 'gator', ['s04'], kneel({ lean: -3, arm: -20 })],
  ['inspect', 'gator', ['s04'], kneel({ lean: 0, arm: 50, head: 8 })],
  ['place', 'gator', ['s04'], kneel({ lean: 6, arm: 20 })],
  ['shake_a', 'gator', ['s04'], kneel({ lean: 2, arm: 50 })],
  ['shake_b', 'gator', ['s04'], kneel({ lean: 2, arm: 30 })],
  ['sit_heels', 'gator', ['s04'], kneel({ lean: -10, arm: -70, head: 4 })],
  // Standing
  ['stand', 'gator', ['s07', 's09', 's18'], up({ lean: 0, arm: HANG, far: HANG })],
  ['look_up', 'gator', ['s09'], up({ lean: 0, arm: HANG, far: HANG, head: 10 })],
  ['sigh', 'gator', ['s09'], up({ lean: -3, arm: HANG, far: HANG, head: 6 })],
  ['nod', 'gator', ['s07'], up({ lean: 0, arm: -80, far: -90, head: -6 })],
  // Curtains (s07)
  ['drill_a', 'gator', ['s07'], up({ lean: -4, arm: 61, far: 56, head: 20 })],
  ['drill_b', 'gator', ['s07'], up({ lean: -4, arm: 59, far: 54, head: 20 })],
  ['blow', 'gator', ['s07'], up({ lean: 4, arm: 40, far: 35, head: 10, jaw: 10 })],
  ['crouch', 'gator', ['s07'], sp({ lean: 6, arm: 70, far: 70, leg: 32, farLeg: 30 })],  // feet ahead: hip 2.9 mm down (s07's −3 mm)
  ['lift_rod', 'gator', ['s07'], up({ lean: -2, arm: 85, far: 85, head: 15 })],
  ['tug', 'gator', ['s07'], up({ lean: 0, arm: 45, far: 35 })],
  ['pull_curtain', 'gator', ['s07'], up({ lean: -6, arm: 10, far: 0 })],
  // On the floor, on his belly over the phone
  ['prone', 'gator', ['s07', 's08'], lie({ lean: 80, arm: -5, far: -10, head: 70, tail: -78 })],
  ['prone_flick', 'gator', ['s07', 's08'], lie({ lean: 80, arm: -3, far: -10, head: 70, tail: -78 })],
  ['yawn', 'gator', ['s08'], lie({ lean: 80, arm: -5, far: -10, head: 74, jaw: 20, tail: -78 })],
  // Walks: <set>_a → <set>_pass → <set>_b → <set>_pass_b if the set has one, else <set>_pass (walk() below).
  // Side contact: trailing leg −45° on its toe, leading leg +27.7° on its heel, both on the floor (equal hipHeight),
  // 0.024 apart: s18's step length. The swing leg stays back (−36°) through the pass so its rigid foot clears the floor
  // while the stance foot carries him; that's why the side set has two passes. Arms swing against the legs.
  ['walk_side_a', 'gator', ['s09', 's18'], sp({ lean: 4, arm: -75, far: -105, tail: 6, leg: -45, farLeg: 27.7 })],
  ['walk_side_pass', 'gator', ['s09', 's18'], sp({ lean: 4, arm: -90, far: -90, tail: 0, leg: -36, farLeg: 0 })],
  ['walk_side_b', 'gator', ['s09', 's18'], sp({ lean: 4, arm: -105, far: -75, tail: -6, leg: 27.7, farLeg: -45 })],
  ['walk_side_pass_b', 'gator', ['s09', 's18'], sp({ lean: 4, arm: -90, far: -90, tail: 0, leg: 0, farLeg: -36 })],
  ['stand_front', 'front', ['s10'], deg({ body: 0, arm_l: 0, arm_r: 0 })],
  ['walk_front_a', 'front', ['s10'], deg({ body: 3, arm_l: 6, arm_r: 6 })],
  ['walk_front_pass', 'front', ['s10'], deg({ body: 0, arm_l: 0, arm_r: 0 })],
  ['walk_front_b', 'front', ['s10'], deg({ body: -3, arm_l: -6, arm_r: -6 })],
  ['stand_back', 'back', ['s09'], deg({ body: 0 })],
  ['walk_back_a', 'back', ['s09'], deg({ body: 3 })],
  ['walk_back_pass', 'back', ['s09'], deg({ body: 0 })],
  ['walk_back_b', 'back', ['s09'], deg({ body: -3 })],
  // The Freshman (side rig at 0.85×)
  ['freeze', 'freshman', ['s18'], seat({ lean: 10, arm: -20, head: -8 })],
  ['glance_up', 'freshman', ['s18'], seat({ lean: 10, arm: -20, head: -2 })],
  // Roommates (s05). Legs hang at 0; + swings the foot toward +x.
  ['round_mash_a', 'round', ['s05'], deg({ arm_r: -16, arm_l: -24 })],
  ['round_mash_b', 'round', ['s05'], deg({ arm_r: -24, arm_l: -16 })],
  ['round_cheer_antic', 'round', ['s05'], deg({ arm_r: -30, arm_l: -30 })],
  ['round_cheer', 'round', ['s05'], deg({ arm_r: 40, arm_l: 40 })],
  ['tall_mash_a', 'tall', ['s05'], { ...sp({ lean: 0, arm: -16, far: -24 }), ...deg({ leg_l: 80, leg_r: 80 }) }],
  ['tall_mash_b', 'tall', ['s05'], { ...sp({ lean: 0, arm: -24, far: -16 }), ...deg({ leg_l: 80, leg_r: 80 }) }],
  ['tall_lean', 'tall', ['s05'], { ...sp({ lean: 12, arm: -40 }), ...deg({ leg_l: 80, leg_r: 80 }) }],
  ['tall_stand', 'tall', ['s05'], sp({ lean: 0, arm: -90, far: -90 })],
  ['walk_tall_a', 'tall', ['s05'], { ...sp({ lean: 2, arm: -105, far: -75, tail: 4 }), ...deg({ leg_r: 22, leg_l: -22 }) }],
  ['walk_tall_pass', 'tall', ['s05'], sp({ lean: 2, arm: -90, far: -90, tail: 0 })],
  ['walk_tall_b', 'tall', ['s05'], { ...sp({ lean: 2, arm: -75, far: -105, tail: -4 }), ...deg({ leg_r: -22, leg_l: 22 }) }],
  // The Custodian (s14): stooped 12°, head −20° the whole walk, near hand on the cart handle. mop_a/b: pose() after blend.
  ['walk_stoop_a', 'custodian', ['s14'], sp({ lean: 12, arm: -10, far: -75, head: -20, tail: 6 })],
  ['walk_stoop_pass', 'custodian', ['s14'], sp({ lean: 12, arm: -10, far: -90, head: -20, tail: 0 })],
  ['walk_stoop_b', 'custodian', ['s14'], sp({ lean: 12, arm: -10, far: -105, head: -20, tail: -6 })],
  ['mop_a', 'custodian', ['s14'], deg({ mop: 12.4 })],   // ±0.015 m at the mop head (asin(0.015 / 0.07))
  ['mop_b', 'custodian', ['s14'], deg({ mop: -12.4 })],
  // Marston crowd, side view (one arm)
  ['crowd_hunch', 'neighbor', ['s16'], sp({ lean: 20, arm: -14, far: null, head: -10 })],
  ['crowd_look_up', 'neighbor', ['s16'], sp({ lean: 14, arm: -14, far: null, head: 8 })],
  ['crowd_knob', 'neighbor', ['s16'], sp({ lean: 14, arm: 20, far: null })],
  ['crowd_write', 'neighbor', ['s16', 's17'], sp({ lean: 14, arm: -26, far: null, head: -10 })],
  ['crowd_sleep', 'sleeper', ['s17'], sp({ lean: 40, arm: -30, far: null, head: -30 })],
  // Top view (s13): + is clockwise as seen from the camera, as the spec writes it
  ['top_head_down', 'heroTop', ['s13'], deg({ head: 70 })],
  ['top_head_up', 'heroTop', ['s13'], deg({ head: 0 })],
  ['top_look_l', 'heroTop', ['s13'], deg({ head: 42 })],
  ['top_look_r', 'heroTop', ['s13'], deg({ head: -42 })],
  ['top_look_back', 'heroTop', ['s13'], deg({ body: -40, head: -65 })],
];

export const POSES = Object.freeze(Object.fromEntries(TABLE.map(([n, , , p]) => [n, Object.freeze(p)])));
export const POSE_INFO = Object.freeze(Object.fromEntries(TABLE.map(([n, rig, shots]) => [n, { rig, shots }])));

// s15's K0–K7 drawings (identical in s06), as blend keys from t0. K7 (release) is `touch` again.
const K = ['rest', 'rest', 'reach_antic', 'reach_lift', 'reach', 'touch', 'press', 'touch'];
export const pressKeys = (t0 = 0) => K.map((n, i) => [t0 + i / 12, n]);

// One walk cycle is two steps: a (contact, near arm forward) → pass → b → pass (or pass_b) → a. blend() eases between keys on 2s,
// so with step = 1/3 (4 drawings) each step draws contact, down, pass, up, and the cycle loops every 8 drawings.
// lift: the root's rise for this drawing: 0 on contact, a dip after it, +rise on the pass.
// Legged sets (side) take lift from the legs instead: hip = hipHeight of this drawing's blended legs (the root's height
// above the floor that keeps the lower foot on it, × your scale), lift = hip − its contact value, and rise is unused.
const LIFT = [[0, 0], [0.25, -0.33], [0.5, 1], [0.75, 0.33], [1, 0]];
const LEGGED = new Set(['side']);
export function walk(t, { set = 'side', step = 1 / 3, t0 = 0, rise = 0.003 } = {}) {
  const n = `walk_${set}`;
  if (!POSES[`${n}_a`]) throw new Error(`walk: unknown set "${set}"`);
  const T = onTwos(t) - t0, c = Math.floor(T / (2 * step) + 1e-6), s = t0 + c * 2 * step;
  const pass2 = POSES[`${n}_pass_b`] ? `${n}_pass_b` : `${n}_pass`;
  const keys = [[s, `${n}_a`], [s + step / 2, `${n}_pass`], [s + step, `${n}_b`], [s + 1.5 * step, pass2], [s + 2 * step, `${n}_a`]];
  if (LEGGED.has(set)) {  // the same eased blend Puppet.blend draws, on the three joints that place the feet
    const J = ['body', 'leg_r', 'leg_l'], v = kf(onTwos(t), keys.map(([kt, k]) => [kt, J.map((j) => POSES[k][j] ?? 0)]));
    const hip = hipHeight(Object.fromEntries(J.map((j, i) => [j, v[i]])));
    return { keys, hip, lift: hip - hipHeight(POSES[`${n}_a`]) };
  }
  const f = T / step - Math.floor(T / step + 1e-6);
  return { keys, lift: rise * kf(Math.max(0, f), LIFT, (x) => x) };
}

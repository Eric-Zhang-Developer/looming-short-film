// node evidence/sb-reconcile/geometry.mjs > evidence/sb-reconcile/geometry.txt
// Every number sb-reconcile changed in a shot spec comes from this file: pinhole projections
// (fov 20, 1920x1080), shadow scales on z = 0 (wall) or y = 0 (desk), and off-axis angles.
// Coordinates are the shared desk unit from docs/shots/s15.md (desk top y 0, wall z 0, floor y -0.034).
import * as THREE from 'three';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const f3 = (v) => `(${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)})`;
const out = (...a) => console.log(...a);

function cam(pos, look, fov = 20) {
  const c = new THREE.PerspectiveCamera(fov, 16 / 9, 0.001, 10);
  c.position.copy(pos);
  c.lookAt(look);
  c.updateMatrixWorld();
  return c;
}
function px(c, p) {
  const n = p.clone().project(c);
  return { x: Math.round((n.x + 1) / 2 * 1920), y: Math.round((1 - n.y) / 2 * 1080), nx: n.x, ny: n.y };
}
function show(c, name, p) {
  const q = px(c, p);
  const inF = Math.abs(q.nx) <= 1 && Math.abs(q.ny) <= 1 ? '' : '  OUT OF FRAME';
  out(`  ${name.padEnd(28)} ${f3(p)} -> px (${q.x}, ${q.y})  ndc (${q.nx.toFixed(2)}, ${q.ny.toFixed(2)})${inF}`);
}
function unproject(c, x, y, planeZ) {
  const n = V(x / 1920 * 2 - 1, 1 - y / 1080 * 2, 0.5).unproject(c);
  const d = n.sub(c.position).normalize();
  const t = (planeZ - c.position.z) / d.z;
  return c.position.clone().addScaledVector(d, t);
}
// ray from light L through point P onto plane z = 0 (wall) or y = 0 (desk)
function hitWall(L, P) { const t = L.z / (L.z - P.z); return L.clone().lerp(P, t); }
function hitDesk(L, P, y0 = 0) { const t = (L.y - y0) / (L.y - P.y); return L.clone().lerp(P, t); }
const scaleWall = (L, B) => L.z / (L.z - B.z);
function offAxis(L, aimAt, P) { return THREE.MathUtils.radToDeg(aimAt.clone().sub(L).angleTo(P.clone().sub(L))); }
const halfAngle = (L, B, r) => THREE.MathUtils.radToDeg(Math.asin(r / L.distanceTo(B)));
function wallShadow(L, B, r) {
  const s = scaleWall(L, B), h = hitWall(L, B);
  return `scale ${s.toFixed(2)}x, center (${h.x.toFixed(3)}, ${h.y.toFixed(3)}), x ${(h.x - r * s).toFixed(3)}..${(h.x + r * s).toFixed(3)}, y ${(h.y - r * s).toFixed(3)}..${(h.y + r * s).toFixed(3)}, width ${(2 * r * s).toFixed(3)}`;
}
// lamp pool: shadow of a camera-facing disc (plane z = B.z) cast by point light L onto the desk y = 0
function pool(L, B, r) {
  const left = hitDesk(L, V(B.x - r, B.y, B.z)), right = hitDesk(L, V(B.x + r, B.y, B.z));
  const top = hitDesk(L, V(B.x, B.y + r * 0.999, B.z)), bot = V(B.x, 0, B.z);
  return `width ${(right.x - left.x).toFixed(4)} = ${((right.x - left.x) / (2 * r)).toFixed(2)}x, x ${left.x.toFixed(4)}..${right.x.toFixed(4)}, z ${bot.z.toFixed(4)}..${top.z.toFixed(4)}`;
}

// ---------- shared desk unit (s15) ----------
const LAMP = {
  baseL: V(-0.028, 0.004, 0.078), baseR: V(-0.012, 0.004, 0.078), stemTop: V(-0.020, 0.070, 0.078),
  stemMid: V(-0.020, 0.035, 0.078), knob: V(-0.0228, 0.0228, 0.078), shade: V(0.004, 0.056, 0.078),
};
const camA = cam(V(-0.010, 0.118, 0.392), V(-0.010, 0.030, 0.080));
const camB = cam(V(-0.022, 0.090, 0.292), V(-0.022, 0.020, 0.084));
const EYE = unproject(camA, 533, 525, 0.074); // s15 quotes the gator eye at (533, 525) in Camera A
out('== Gator eye, back-projected from s15 Camera A px (533, 525) onto the body plane z 0.074');
out(`  eye ≈ ${f3(EYE)}`);
const HEAD = EYE.clone(); // used for off-axis checks

// ---------- s15 / s06: unit at r 0.012 ----------
const r = 0.012;
const BLOB = V(0, r, 0.098);
const PHONE_UNIT = V(-0.010, 0.004, 0.114);
const LAMP_L = LAMP.shade;
out('\n== s15 / s06 (Camera A), hero blob r 0.012 at (0, 0.012, 0.098)');
out('  phone shadow: ' + wallShadow(PHONE_UNIT, BLOB, r));
out(`  phone -> blob half-angle ${halfAngle(PHONE_UNIT, BLOB, r).toFixed(1)}°`);
const hitU = hitWall(PHONE_UNIT, BLOB);
for (const [k, p] of Object.entries({ ...LAMP, eye: HEAD }))
  out(`  off-axis phone->${k.padEnd(8)} ${offAxis(PHONE_UNIT, hitU, p).toFixed(1)}°  wall hit ${f3(hitWall(PHONE_UNIT, p))} (scale ${scaleWall(PHONE_UNIT, p).toFixed(2)})`);
out('  lamp pool: ' + pool(LAMP_L, BLOB, r));
for (const rr of [0.012, 0.0105, 0.009, 0.008, 0.007, 0.006, 0.005, 0.013, 0.010])
  out(`  pool ratio 0.056/(0.056-r) at r ${rr}: ${(0.056 / (0.056 - rr)).toFixed(2)}x`);
show(camA, 'A blob', BLOB);
show(camA, 'A knob', LAMP.knob);
show(camA, 'A wall-shadow center', hitU);
show(camA, 'A phone', V(-0.010, 0.0015, 0.114));
show(camA, 'A page center', V(-0.0205, 0.0003, 0.095));
show(camA, 'A calendar bottom-left', V(0.100, 0.040, 0.006));
show(camA, 'A calendar center', V(0.150, 0.100, 0.006));
show(camB, 'B blob', BLOB);
show(camB, 'B name', V(-0.025, 0, 0.086));
// lamp aim for angle 0.35: pool radius at the aim point
const AIM = V(-0.008, 0, 0.102);
out(`  lamp aim ${f3(AIM)}: distance ${LAMP_L.distanceTo(AIM).toFixed(4)}, pool radius at angle 0.35 ≈ ${(LAMP_L.distanceTo(AIM) * Math.tan(0.35)).toFixed(4)}`);
out(`  aim -> blob-shadow center offset ${AIM.distanceTo(V(hitDesk(LAMP_L, BLOB).x, 0, hitDesk(LAMP_L, BLOB).z)).toFixed(4)}; aim -> phone ${AIM.distanceTo(V(-0.010, 0, 0.114)).toFixed(4)}; aim -> page center ${AIM.distanceTo(V(-0.0205, 0, 0.095)).toFixed(4)}`);
out(`  s17: blob on his hand (-0.046, 0.000, 0.088) is ${THREE.MathUtils.degToRad(offAxis(LAMP_L, AIM, V(-0.046, 0.0, 0.088))).toFixed(2)} rad off the lamp axis (cone 0.35)`);

// ---------- home desk, s02 / s03 ----------
out('\n== Home desk (s02, s03), same unit; apt_desk flush to the wall (z 0..0.120)');
const CAL = { c: V(0.150, 0.100, 0.006), tl: V(0.100, 0.160, 0.006), br: V(0.200, 0.040, 0.014), circle: V(0.170, 0.095, 0.008) };
const B = V(0.040, 0.012, 0.060);
const hops = [V(0.170, 0.002, 0.020), V(0.127, 0.012, 0.033), V(0.083, 0.012, 0.047), B];
const cam2 = cam(V(0.060, 0.130, 0.640), V(0.060, 0.072, 0.060));
out('s02 camera (0.060, 0.130, 0.640) -> (0.060, 0.072, 0.060)');
show(cam2, 'calendar top-left', CAL.tl);
show(cam2, 'calendar bottom-right', CAL.br);
show(cam2, 'red circle', CAL.circle);
show(cam2, 'landing', hops[0]);
show(cam2, 'B', B);
show(cam2, 'eye', HEAD);
show(cam2, 'hip', V(-0.075, -0.012, 0.074));
show(cam2, 'lamp shade', LAMP.shade);
show(cam2, 'phone rest', V(-0.010, 0.0015, 0.114));
show(cam2, 'desk front-left', V(-0.033, 0, 0.120));
out(`  distance cam->calendar ${cam2.position.distanceTo(CAL.c).toFixed(3)}, cam->B ${cam2.position.distanceTo(B).toFixed(3)}`);
// morning sun as a directional light from (0.8, 0.6, 0.6) toward (0.06, 0.05, 0.06): blob shadow lands where?
const sunDir = V(0.06, 0.05, 0.06).sub(V(0.8, 0.6, 0.6)).normalize();
const tDesk = -B.y / sunDir.y; const sh = B.clone().addScaledVector(sunDir, tDesk);
out(`  s02 sun dir ${f3(sunDir)}; blob-center shadow on desk plane ${f3(sh)} (z<0 means it reaches the wall first)`);
const tWall = -B.z / sunDir.z; const shW = B.clone().addScaledVector(sunDir, tWall);
out(`  ... on the wall plane ${f3(shW)}`);

out('\ns03 phone positions and scales (wall z 0)');
const P05 = V(-0.015, 0.010, 0.105), L = V(-0.012, 0.004, 0.090), B2 = V(0.034, 0.012, 0.063);
for (const [name, P, Bx] of [['0.50 lift', P05, B], ['1.50 grip L', L, B], ['3.67 scoot', L, B2]])
  out(`  ${name.padEnd(12)} phone ${f3(P)} blob ${f3(Bx)}: ${wallShadow(P, Bx, r)}; half-angle ${halfAngle(P, Bx, r).toFixed(1)}°`);
const hitL = hitWall(L, B);
for (const [k, p] of Object.entries({ ...LAMP, eye: HEAD, calendarBR: CAL.br }))
  out(`  off-axis L->${k.padEnd(10)} ${offAxis(L, hitL, p).toFixed(1)}°`);
// where does the L->B ray cross the lamp plane z 0.078?
{ const t = (L.z - 0.078) / (L.z - B.z); const q = L.clone().lerp(B, t); out(`  L->B crosses lamp plane z 0.078 at ${f3(q)}; silhouette half-width there ${(r * t).toFixed(4)}`); }
// reach: near hand tip at the phone's left end, shoulder = hip + R(-lean)(0.013, 0.030), arm 0.032
function solveReach(tip) {
  let best = null;
  for (let lean = -10; lean <= 40; lean += 0.5) {
    const a = THREE.MathUtils.degToRad(lean);
    const sh = V(-0.075 + 0.013 * Math.cos(a) + 0.030 * Math.sin(a), -0.012 - 0.013 * Math.sin(a) + 0.030 * Math.cos(a), 0);
    const d = Math.hypot(tip.x - sh.x, tip.y - sh.y);
    if (!best || Math.abs(d - 0.032) < Math.abs(best.d - 0.032)) best = { lean, d, arm: THREE.MathUtils.radToDeg(Math.atan2(tip.y - sh.y, tip.x - sh.x)) };
  }
  return `lean ${best.lean}, arm ${best.arm.toFixed(0)}, |shoulder->tip| ${best.d.toFixed(4)}`;
}
out(`  reach to phone left end (-0.0195, 0.004): ${solveReach(V(-0.0195, 0.004, 0))}`);
out(`  reach to lifted phone left end (-0.0225, 0.010): ${solveReach(V(-0.0225, 0.010, 0))}`);
const cam3 = cam(V(0.060, 0.090, 0.530), V(0.060, 0.038, 0.060));
out('s03 camera (0.060, 0.090, 0.530) -> (0.060, 0.038, 0.060)');
show(cam3, 'B', B);
show(cam3, 'phone L', L);
show(cam3, 'phone rest', V(-0.010, 0.0015, 0.114));
show(cam3, 'eye', HEAD);
show(cam3, 'lamp shade', LAMP.shade);
show(cam3, 'wall shadow center (L)', hitL);
show(cam3, 'wall shadow top (L)', V(hitL.x, hitL.y + 3 * r, 0));
show(cam3, 'wall shadow right (scoot)', V(hitWall(L, B2).x + scaleWall(L, B2) * r, hitWall(L, B2).y, 0));
show(cam3, 'calendar bottom-right', CAL.br);
out(`  distance cam->B ${cam3.position.distanceTo(B).toFixed(3)}, cam->wall-shadow ${cam3.position.distanceTo(hitL).toFixed(3)}`);
{ const top = px(cam3, V(hitL.x, hitL.y + 3 * r, 0)), bot = px(cam3, V(hitL.x, hitL.y - 3 * r, 0)); out(`  3.0x shadow on screen: ${((bot.y - top.y) / 1080 * 100).toFixed(0)}% of frame height`); }

// ---------- s06 on Camera A ----------
out('\n== s06 (Camera A, home paper)');
{ const top = px(camA, V(hitU.x, Math.min(hitU.y + 7.125 * r, 1), 0)), bot = px(camA, V(hitU.x, hitU.y - 7.125 * r, 0)); out(`  7.1x shadow spans px y ${top.y}..${bot.y} (frame is 0..1080)`); }
const hop = V(-0.003, r, 0.098);
out('  after the 2.00 hop, blob at ' + f3(hop) + ': pool ' + pool(LAMP_L, hop, r));
out('  after the hop, phone shadow: ' + wallShadow(PHONE_UNIT, hop, r));

// ---------- Marston table, s11 / s12 / s14 in unit coords ----------
out('\n== Marston table (s11, s12, s14) in unit coords; window wall z 0');
const S11 = { lift: V(-0.012, 0.008, 0.124), settle: V(-0.014, 0.008, 0.118) };
for (const [k, P] of Object.entries(S11)) out(`  s11 phone ${k.padEnd(6)} ${f3(P)}: ${wallShadow(P, BLOB, r)}; off-axis eye ${offAxis(P, hitWall(P, BLOB), HEAD).toFixed(0)}°, shade ${offAxis(P, hitWall(P, BLOB), LAMP.shade).toFixed(0)}°`);
out(`  reach to held phone left end (-0.0195, 0.008): ${solveReach(V(-0.0195, 0.008, 0))}`);
out(`  reach to closed laptop lid edge (-0.020, 0.004): ${solveReach(V(-0.020, 0.004, 0))}`);
{ const e = (deg) => V(0.015 - 0.035 * Math.cos(THREE.MathUtils.degToRad(deg)), 0.002 + 0.035 * Math.sin(THREE.MathUtils.degToRad(deg)), 0);
  for (const d of [20, 25, 100]) out(`  lid edge at ${d}°: ${f3(e(d))}; reach: ${solveReach(e(d))}`); }
const cam11a = cam(V(0.020, 0.033, 0.668), V(0.020, 0.033, 0.0)), cam11b = cam(V(0.020, 0.033, 0.628), V(0.020, 0.033, 0.0));
out('s11 camera (0.020, 0.033, 0.668) -> push to z 0.628, looking straight down -z');
for (const [k, p] of Object.entries({ hip: V(-0.075, -0.012, 0.074), eye: HEAD, blob: BLOB, lampShade: LAMP.shade, laptopHinge: V(0.015, 0.002, 0.060), wallShadow: hitWall(S11.settle, BLOB) })) { show(cam11a, 'start ' + k, p); }
show(cam11b, 'end wallShadow', hitWall(S11.settle, BLOB));
const halfH = (d) => d * Math.tan(THREE.MathUtils.degToRad(10));
out(`  s11 frame at body plane z 0.074 (start): x ${(0.020 - halfH(0.594) * 16 / 9).toFixed(3)}..${(0.020 + halfH(0.594) * 16 / 9).toFixed(3)}, y ${(0.033 - halfH(0.594)).toFixed(3)}..${(0.033 + halfH(0.594)).toFixed(3)}`);
const cam12 = cam(V(0.040, 0.038, 0.440), V(0.040, 0.038, 0.0));
out('s12 camera (0.040, 0.038, 0.440) straight down -z, locked');
for (const [k, p] of Object.entries({ head: V(-0.040, 0.008, 0.074), phone: V(-0.010, 0.0015, 0.114), blob: BLOB, wallShadowCenter: hitU, wallShadowLeft: V(hitU.x - 7.125 * r, hitU.y, 0), wallShadowRight: V(hitU.x + 7.125 * r, hitU.y, 0) })) show(cam12, k, p);
out(`  s12 frame at wall: x ${(0.040 - halfH(0.44) * 16 / 9).toFixed(3)}..${(0.040 + halfH(0.44) * 16 / 9).toFixed(3)}, y ${(0.038 - halfH(0.44)).toFixed(3)}..${(0.038 + halfH(0.44)).toFixed(3)}`);
out(`  s12 off-axis phone->head (-0.040, 0.008, 0.074): ${offAxis(PHONE_UNIT, hitU, V(-0.040, 0.008, 0.074)).toFixed(0)}°`);
for (const s of [1 - 0.06, 1 + 0.06]) out(`  s12 breath scale ${s.toFixed(2)}: shadow width ${(2 * r * s * 7.125).toFixed(4)}`);
const cam14 = cam(V(0.000, 0.033, 0.708), V(0.000, 0.033, 0.0));
out('s14 camera (0.000, 0.033, 0.708) straight down -z, locked');
for (const [k, p] of Object.entries({ hip: V(-0.075, -0.012, 0.074), eye: HEAD, blob: BLOB, wallShadow: hitU, tinyBlobAt2_3: V(0.0, 0.018, 0.230), cartFrontEnter: V(0.23, 0.0, 0.228) })) show(cam14, k, p);
for (const t of [0.68, 1.36, 2.3, 3.05, 3.68, 3.95, 4.68]) { const xk = 0.27 - 0.11 * (t - 0.5); out(`  s14 t ${t}: x_k ${xk.toFixed(3)}, cart center ${(xk - 0.07).toFixed(3)}`); }

// ---------- s16 neighbor (r 0.013) and s18 ----------
out('\n== s16 neighbor (mirrored unit x\' = 0.350 - x), blob r 0.013');
const NB = V(0.350, 0.013, 0.098), NP = V(0.360, 0.004, 0.114);
out('  neighbor phone shadow: ' + wallShadow(NP, NB, 0.013));
out('  neighbor lamp pool: ' + pool(V(0.346, 0.056, 0.078), NB, 0.013));
const camD = cam(V(0.168, 0.230, 1.010), V(0.168, 0.040, 0.080));
show(camD, 'D neighbor wall-shadow', hitWall(NP, NB));
show(camD, 'D hero blob (r 0.0105)', V(0, 0.0105, 0.098));
show(camB, 'B hero blob (r 0.0105)', V(0, 0.0105, 0.098));
out('\n== s18 G Freshman (r 0.012, local coords): phone (0.120, 0.004, 0.114), blob (0.110, 0.012, 0.098)');
out('  ' + wallShadow(V(0.120, 0.004, 0.114), V(0.110, 0.012, 0.098), 0.012));
out(`  E camera distance for a 0.12 m sheet at 70% frame height: ${(0.12 / 0.7 / 2 / Math.tan(THREE.MathUtils.degToRad(10))).toFixed(3)}`);

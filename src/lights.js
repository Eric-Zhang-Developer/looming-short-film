// The film's light rigs and the light rule in numbers (doc 02 · The visual rule, doc 04 · Lights).
// Every update takes time as an argument. Randomness comes only from src/core/rng.js.
// Intensities are physical (candela for spots, lux for directionals) with decay 2, tuned for
// the stage's NoToneMapping so a lit cream wall lands below white.
import * as THREE from 'three';
import { PALETTE } from './core/palette.js';
import { clamp } from './core/ease.js';
import { hash2, mulberry32, seedOf } from './core/rng.js';

const color = (k) => new THREE.Color(PALETTE[k]);
const mix = (a, b, x) => color(a).lerp(color(b), x);

function shadowed(light, { mapSize = 2048, radius = 3, bias = -0.0004, normalBias = 0 } = {}) {
  light.castShadow = true;
  light.shadow.mapSize.set(mapSize, mapSize);
  light.shadow.radius = radius;          // r186 PCFShadowMap is a soft Vogel-disk PCF; radius sets the softness
  light.shadow.bias = bias;
  light.shadow.normalBias = normalBias;
  return light;
}

// ---------- the rule ----------

// d(light→wall) / d(light→subject), measured along the light→subject line to the plane z = wallZ.
// Every point of a cutout parallel to the wall lands at this scale, so it is exact, not approximate.
// > 1 when the subject is between the light and the wall; Infinity when the line never reaches the wall.
export function shadowScale(lightPos, subjectPos, wallZ) {
  const dir = subjectPos.clone().sub(lightPos);
  const k = (wallZ - lightPos.z) / dir.z;          // the line's parameter at the wall (subject is k = 1)
  if (!(k > 0) || !Number.isFinite(k)) return Infinity;
  const hit = lightPos.clone().addScaledVector(dir, k);
  return lightPos.distanceTo(hit) / lightPos.distanceTo(subjectPos);
}

// The light position that gives `scale`. The ratio along any line equals the ratio of its z spans,
// so z is solved in closed form: scale·(Lz − Sz) = Lz − wallZ. `height` and `side` are the light's
// y and x offsets from the subject (m); they move where the shadow lands, never its scale.
export function placeForScale({ subjectPos, wallZ, scale, height = 0, side = 0 }) {
  if (!(scale > 1)) throw new RangeError(`placeForScale: scale must be > 1, got ${scale}`);
  if (!(subjectPos.z > wallZ)) throw new RangeError('placeForScale: subject must be in front of the wall');
  const z = (scale * subjectPos.z - wallZ) / (scale - 1);
  return new THREE.Vector3(subjectPos.x + side, subjectPos.y + height, z);
}

// Points `spot` at `target` (Vector3 or Object3D) and fits its shadow camera to the target's
// bounding sphere: near just short of it, fov just around it. A caster's shadow subtends the same
// angle from the light as the caster, so this frustum holds the whole shadow on any receiver.
// Call it again whenever the light or the target moves.
// near is tabletop-scale (min(4 mm, d/20)) so a caster just in front of the light is inside the frustum; pass
// { nearest } (m, the closest caster to the light) to set it explicitly.
const _box = new THREE.Box3(), _sphere = new THREE.Sphere(), _lp = new THREE.Vector3();
export function aim(spot, target, { nearest } = {}) {
  if (target.isObject3D) _box.setFromObject(target).getBoundingSphere(_sphere);
  else _sphere.set(_lp.copy(target), 0);
  const c = _sphere.center.clone(), r = _sphere.radius;
  const t = spot.target;
  t.position.copy(c);
  if (t.parent) { t.parent.updateWorldMatrix(true, false); t.parent.worldToLocal(t.position); }
  t.updateMatrixWorld();

  const d = spot.getWorldPosition(_lp).distanceTo(c);
  const cam = spot.shadow.camera;
  cam.near = nearest ?? Math.min(0.004, d / 20);   // a caster 5 cm from a phone is only 1 cm past this
  cam.far = spot.distance || 10 * (d + r);         // receivers up to ~10× farther (three uses distance when set)
  spot.shadow.focus = r > 0 ? clamp(1.15 * Math.asin(Math.min(1, r / d)) / spot.angle, 0.05, 1) : 1;
  cam.updateProjectionMatrix();                    // SpotLightShadow only does this when fov/far change
}

// ---------- rigs ----------

// Low, close, wide cyan wedge. Shadow on. Place it with placeForScale, then aim it at the subject.
// penumbra near 1 turns the hard fan on the desk into a soft fall-off.
export function phoneLight({ color: c = PALETTE.phone, intensity = 0.06, angle = 1.2, distance = 0.6, penumbra = 0.45 } = {}) {
  return shadowed(new THREE.SpotLight(c, intensity, distance, angle, penumbra, 2), { bias: -0.0004 });
}

// Overhead amber spot with a vellum cone and drifting dust. update(t) re-fits the cone and dust
// to the light's current position and target, so move/aim the light first, then update.
// The cone runs `reach` × the light→target distance, well past the target, so whatever the light lands on
// (desk, floor) cuts it off by depth where the pool is: the vellum meets its own pool, even when the cone
// is slanted. With no receiver it softens out over its last 30% instead of ending in a hard disc.
// look-pass-2: only the cone's far wall is drawn (BackSide, at twice the strength), so anything standing in the
// light, like the blob in its pool, hides the vellum behind it instead of wearing an amber film. Its sides fade to
// nothing by view angle, over a width that wanders with the vellum's frost, so they read as light, not mesh lines.
// Add light, light.target, cone and dust to the scene root (dust is in world space).
export function lampLight({ color: c = PALETTE.lamp, intensity = 0.5, angle = 0.6, penumbra = 0.5, seed = 1, reach = 2.5 } = {}) {
  const light = shadowed(new THREE.SpotLight(c, intensity, 0, angle, penumbra, 2), { radius: 2, bias: -0.0003 });

  // Unit cone: apex at the origin, opening down −Y, length 1. Scaled to the light→target distance.
  const geo = new THREE.ConeGeometry(1, 1, 64, 1, true).translate(0, -0.5, 0);
  const cone = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color() }, uStrength: { value: 0.2 }, uReach: { value: reach } },
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uStrength, uReach;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
      void main() {
        float along = 1.0 - vUv.y;                                   // 0 at the apex, 1 at the open end
        float ndv = abs(dot(normalize(vN), normalize(vV)));
        float rim = 1.0 - ndv;                                       // frosted vellum catches light at its edges
        float a = along * uReach;                                    // 0 at the apex, 1 at the target
        float fade = smoothstep(0.0, 0.15, a) * (1.0 - smoothstep(0.7 * uReach, uReach, a));  // full strength to the target and well past it
        float folds = 0.88 + 0.12 * sin(vUv.x * 6.2831853 * 7.0 + 0.6 * sin(vUv.y * 9.0));  // soft, slightly bent folds
        float frost = 0.7 + 0.3 * vn(vec2(vUv.x * 60.0, vUv.y * 24.0)) + 0.15 * vn(vec2(vUv.x * 220.0, vUv.y * 90.0)) - 0.075;  // vellum fibre
        float feather = 0.5 + 0.35 * vn(vec2(vUv.x * 30.0, vUv.y * 14.0)) + 0.2 * vn(vec2(vUv.x * 90.0, vUv.y * 40.0));  // uneven, so no side is a ruled line
        float edge = (0.45 + 0.55 * rim * rim) * smoothstep(0.0, feather, ndv);   // bright toward the sides, then gone at the silhouette
        gl_FragColor = vec4(uColor * uStrength * fade * folds * frost * edge, 1.0);
        #include <colorspace_fragment>
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
  }));
  cone.castShadow = cone.receiveShadow = false;

  // 20–40 specks, each with a seeded home in the cone and a slow drift that is a pure function of t.
  const rng = mulberry32(seedOf('lamp-dust', seed));
  const n = 20 + Math.floor(rng() * 21);
  const specks = Array.from({ length: n }, () => ({
    h: 0.3 + 0.6 * rng(), th: rng() * Math.PI * 2, rho: 0.8 * Math.sqrt(rng()),
    ph: rng() * Math.PI * 2, w: 0.15 + 0.25 * rng(), spin: (rng() < 0.5 ? -1 : 1) * (0.03 + 0.05 * rng()),
  }));
  const dotTex = (() => {
    const cv = Object.assign(document.createElement('canvas'), { width: 32, height: 32 }), g = cv.getContext('2d');
    const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.4, 'rgba(255,255,255,0.5)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(cv);
  })();
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
  dustGeo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.005, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  dust.frustumCulled = false;

  const apex = new THREE.Vector3(), tip = new THREE.Vector3(), axis = new THREE.Vector3();
  const b1 = new THREE.Vector3(), b2 = new THREE.Vector3(), p = new THREE.Vector3(), down = new THREE.Vector3(0, -1, 0);
  function update(t) {
    cone.visible = dust.visible = light.visible;
    light.getWorldPosition(apex); light.target.getWorldPosition(tip);
    const len = apex.distanceTo(tip) * reach;
    const rad = Math.tan(light.angle * (1 - 0.5 * light.penumbra));
    axis.subVectors(tip, apex).normalize();
    cone.position.copy(apex);
    cone.quaternion.setFromUnitVectors(down, axis);
    cone.scale.set(len * rad, len, len * rad);
    cone.material.uniforms.uColor.value.copy(light.color);

    b1.set(1, 0, 0).applyQuaternion(cone.quaternion); b2.set(0, 0, 1).applyQuaternion(cone.quaternion);
    const pos = dustGeo.attributes.position, col = dustGeo.attributes.color;
    specks.forEach((s, i) => {
      const h = (s.h + 0.04 * Math.sin(s.w * t + s.ph)) * len / reach;   // along the axis, above the target
      const th = s.th + s.spin * t;
      const r = s.rho * h * rad * (1 + 0.08 * Math.sin(0.7 * s.w * t + 2 * s.ph));
      p.copy(apex).addScaledVector(axis, h).addScaledVector(b1, Math.cos(th) * r).addScaledVector(b2, Math.sin(th) * r);
      pos.setXYZ(i, p.x, p.y, p.z);
      const glint = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(1.1 * s.w * t * 3 + s.ph * 3), 3);  // catches light as it turns
      col.setXYZ(i, light.color.r * glint, light.color.g * glint, light.color.b * glint);
    });
    pos.needsUpdate = col.needsUpdate = true;
  }
  return { light, cone, dust, update };
}

// Window light, cold night (k = 0) to gold (k = 1): low and blue, then warmer, brighter and a little higher.
// One large soft shadow. Add light and light.target; move light.target to recentre the set.
// t is unused for now: the ramp is driven by k so shots can key it to beats.
export function dawnLight() {
  const light = shadowed(new THREE.DirectionalLight(), { radius: 5, bias: -0.0005, normalBias: 0.002 });
  Object.assign(light.shadow.camera, { left: -0.6, right: 0.6, top: 0.6, bottom: -0.6, near: 0.1, far: 4 });
  const navy = color('navy'), cold = navy.multiplyScalar(1 / Math.max(navy.r, navy.g, navy.b));  // navy's hue as a light
  const gold = mix('lamp', 'cream', 0.35), dir = new THREE.Vector3();
  function update(t, k) {
    k = clamp(k);
    light.color.copy(cold).lerp(gold, k);
    light.intensity = 0.6 + 2.2 * k * k;
    const el = THREE.MathUtils.lerp(0.12, 0.35, k), az = -0.75;        // from the left, a little in front
    dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    light.target.updateMatrixWorld();
    light.position.copy(light.target.position).addScaledVector(dir, 1.5);
  }
  update(0, 0);
  return { light, update };
}

// Overhead fluorescent tubes: green-white, mostly steady, with rare seeded stutters.
// doc 04 pairs a RectAreaLight with a DirectionalLight, but r186's RectAreaLight only lights
// Standard/Physical materials and paper is Lambert, so the DirectionalLight carries both color and shadow.
export function fluorescent({ flickerSeed = 1, intensity = 2.2 } = {}) {
  const light = shadowed(new THREE.DirectionalLight(mix('cream', 'gator', 0.3), intensity), { radius: 5, bias: -0.0005, normalBias: 0.002 });
  Object.assign(light.shadow.camera, { left: -0.6, right: 0.6, top: 0.6, bottom: -0.6, near: 0.1, far: 4 });
  light.position.set(0.1, 1.5, 0.8);
  const seed = seedOf('fluorescent', flickerSeed);
  function update(t) { light.intensity = intensity * flicker(seed, t); }
  return { light, update };
}

// Flicker multiplier in (0, 1]. Time is cut into 0.7 s windows; about 1 in 8 holds one stutter of
// 0.08–0.38 s where the tube drops 40–90% and chatters frame to frame. Outside a stutter: a ±1.5% hum.
const WIN = 0.7;
export function flicker(seed, t) {
  const w = Math.floor(t / WIN), r = mulberry32((seed + Math.imul(w, 0x9e3779b9)) >>> 0);
  const hum = 1 - 0.015 * (0.5 + 0.5 * Math.sin(t * 2.1 + seed % 7));
  if (r() >= 0.125) return hum;
  const dur = 0.08 + 0.3 * r(), start = w * WIN + r() * (WIN - dur), depth = 0.4 + 0.5 * r();
  if (t < start || t >= start + dur) return hum;
  const chatter = hash2(seed % 65536, Math.floor(t * 24)) > 0.35 ? 1 : 0.3;
  return hum * (1 - depth * chatter);
}

// Very low fill: night navy from above, a kraft bounce from below. Keeps unlit stock just off black.
export function ambient() {
  return new THREE.HemisphereLight(PALETTE.navy, PALETTE.kraft, 0.8);
}

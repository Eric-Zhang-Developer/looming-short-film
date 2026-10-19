// The Exam: the one thing in the film that isn't paper. A vertical plane carrying a 2D metaball field, drawn as a flat
// drop of matte ink (Q7 b): no 3D shading, pigment pooled darker at its edge, a faint grain, one painted cream
// highlight up and left of the eyes, and two cream eyes near its top.
// The shadow pass runs the same field (eyes cut out as holes), so the shadow is exactly this shape.
// All motion comes from update(tLocal, ...); nothing reads a clock.
import * as THREE from 'three';
import { mulberry32, seedOf } from './core/rng.js';
import { onTwos, ease } from './core/ease.js';
import { PALETTE } from './core/palette.js';

const N = 5;          // ball slots in the shader; unused slots get weight 0
const T = 0.5625;     // threshold: the body ball (support 2) crosses it at distance 1, so the blob is ~1 radius wide
const EYE_X = 0.42, EYE_DROP = 0.92, EYE_R = 0.2;   // in radius units, measured from the top of the outline
// Eye states (the gator's names): [shape, size × EYE_R, lift]. Shapes: 0 disc, 1 closed arc, −1 half-lid drooping
// outward (tired), −2 disc under a level lid, slid toward `look` (side-glance). The lidded shapes are negative so the
// catchlight test (shape < 0.5) keeps them, and their GLSL compiles only while one is showing (EYE_LIDS): any extra
// live code in the field shader moves a few pixels by 1/255 on this GPU, and s13's frames must stay bit-identical.
const EYES = { open: [0, 1, 0], closed: [1, 1, 0], worried: [0, 0.68, 0.15], tired: [-1, 1, -0.04], gasp: [0, 1.35, 0.08], side: [-2, 1, 0] };
const SIDE_SHIFT = 0.2;    // how far `side` slides both eyes toward `look`, radius units
// Painted highlight: one tapered brush stroke along the upper-left shoulder, an arc about the body ball's centre
// HI_IN inside the outline (radius units), centred on the ray at HI_A and HI_SPAN radians either side, HI_W at its
// thickest. Tied to the outline, not the eyes, so it sits up and left of them in every eye state and can't land
// where a mouth or tear would; hugging the edge keeps it from reading as an eyebrow.
const HI_A = 2.3, HI_SPAN = 0.26, HI_IN = 0.2, HI_W = 0.05;
const STAIN = 0.6, STAIN_FADE = 10;   // stain opacity, and seconds it takes to fade once the blob has left (update's `left`)

// Field in radius units. p is plane-local / radius, with y = 0 on the surface below.
// Each ball is [x, y, support, weight]; squash scales space so the bottom stays planted.
const GLSL_FIELD = /* glsl */`
uniform vec4 uBalls[${N}];
uniform vec2 uScale;
uniform vec4 uEye[2];      // x, y, radius, shape (see EYES)
uniform float uRadius;
uniform float uFloor;      // surface height in radius units, plane-local (0 when resting)
float field(vec2 p) {
  p /= uScale;
  float f = 0.0;
  for (int i = 0; i < ${N}; i++) {
    vec2 d = p - uBalls[i].xy;
    float k = max(0.0, 1.0 - dot(d, d) / (uBalls[i].z * uBalls[i].z));
    f += uBalls[i].w * k * k;
  }
  return f;
}
// Signed distance to the eye shape, negative inside.
float eyeDist(vec2 p, vec4 e) {
  vec2 q = p - e.xy;
#ifdef EYE_LIDS
  if (e.w < -0.5) {
    // tired: the lid is down to just above the middle and droops toward the outer corner; side: a level lid a third down
    float lid = e.w > -1.5 ? dot(q, normalize(vec2(0.35 * sign(e.x), 1.0))) - 0.15 * e.z : q.y - 0.4 * e.z;
    return max(length(q) - e.z, lid);
  }
#endif
  if (e.w < 0.5) return length(q) - e.z;
  // closed: a soft lower arc, like a content smile turned into an eyelid
  float ring = abs(length(q - vec2(0.0, 0.35 * e.z)) - 0.8 * e.z) - 0.045;
  return max(ring, q.y - 0.05 * e.z);
}
float height(vec2 p) { return 0.85 * sqrt(max(0.0, 4.0 * sqrt(field(p)) - 3.0)); }
float eyesDist(vec2 p) { return min(eyeDist(p, uEye[0]), eyeDist(p, uEye[1])); }
`;

function fieldJS(balls, sx, sy, x, y) {
  x /= sx; y /= sy;
  let f = 0;
  for (const [bx, by, R, w] of balls) {
    const k = Math.max(0, 1 - ((x - bx) ** 2 + (y - by) ** 2) / (R * R));
    f += w * k * k;
  }
  return f;
}

// Highest point of the outline on the column x (radius units): march down, then bisect.
function topAt(balls, sx, sy, x) {
  let hi = 4, lo = 4;
  while (lo > 0 && fieldJS(balls, sx, sy, x, lo) < T) { hi = lo; lo -= 0.05; }
  for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; if (fieldJS(balls, sx, sy, x, m) < T) hi = m; else lo = m; }
  return lo;
}

export function createBlob({ radius = 0.025, seed = 1 } = {}) {
  const rng = mulberry32(seedOf('blob', seed));
  const r = (a, b) => a + (b - a) * rng();
  // Body plus three lobes: two low ones widen the base into a drop, one on top makes a soft crown.
  const lobes = [-2.6, -0.55, Math.PI / 2].map((a) => ({
    a: a + r(-0.15, 0.15), dist: r(0.48, 0.56), R: r(1.0, 1.15), w: r(0.3, 0.38),
    fa: r(0.35, 0.6), fd: r(0.5, 0.9), pa: r(0, 6.283), pd: r(0, 6.283),
  }));
  const breath = { f: r(0.45, 0.6), p: r(0, 6.283) };
  const tremble = { f: r(2.6, 3.4), p: r(0, 6.283) };

  // Origin at the contact point; the plane reaches a little below it so a lifted drop can round out.
  const geo = new THREE.PlaneGeometry(5 * radius, 4.5 * radius).translate(0, 1.75 * radius, 0);

  const uniforms = {
    uBalls: { value: Array.from({ length: N }, () => new THREE.Vector4(0, 0, 1, 0)) },
    uScale: { value: new THREE.Vector2(1, 1) },
    uEye: { value: [new THREE.Vector4(), new THREE.Vector4()] },
    uRadius: { value: radius },
    uFloor: { value: 0 },
    uInk: { value: new THREE.Color(PALETTE.ink) },
    uCream: { value: new THREE.Color(PALETTE.cream) },
    uAmb: { value: new THREE.Color(0, 0, 0) },
    uLightPos: { value: new THREE.Vector3(0, 1, 1) },
    uLightDir: { value: new THREE.Vector3(0, -1, 0) },   // spot axis; for a directional light, the direction light travels
    uLightColor: { value: new THREE.Color(0, 0, 0) },     // color * intensity, linear
    uLightKind: { value: 0 },                              // 0 none, 1 spot, 2 point, 3 directional
    uCone: { value: new THREE.Vector2(-1, -1) },           // cos(angle), cos(angle * (1 - penumbra))
    uFalloff: { value: new THREE.Vector2(0, 2) },           // cutoff distance, decay
    uHiR: { value: 0.8 },                                   // painted highlight: the stroke's arc radius (radius units)
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    defines: { EYE_LIDS: false },
    side: THREE.DoubleSide,     // the shadow pass renders the flipped side; double keeps the plane in the light's view
    alphaToCoverage: true,      // soft edge without transparency sorting (the stage renders with MSAA)
    vertexShader: /* glsl */`
      varying vec2 vLocal;
      varying vec3 vWorld;
      void main() {
        vLocal = position.xy;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      ${GLSL_FIELD}
      uniform vec3 uInk, uCream, uAmb, uLightPos, uLightDir, uLightColor;
      uniform float uHiR;
      uniform mat4 modelMatrix;   // three sets it on any program that declares it
      uniform int uLightKind;
      uniform vec2 uCone, uFalloff;
      varying vec2 vLocal;
      varying vec3 vWorld;
      const float PI = 3.141592653589793;
      float hash(vec2 c) { return fract(sin(dot(c, vec2(127.1, 311.7))) * 43758.5453); }
      float vnoise(vec2 x) {
        vec2 i = floor(x), u = fract(x); u = u * u * (3.0 - 2.0 * u);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      void main() {
        vec2 p = vLocal / uRadius;
        float f = field(p);
        if (f < 0.8 * ${T} || p.y < uFloor - 0.05) discard;
        const float e = 0.01;
        vec2 g = vec2(field(p + vec2(e, 0.0)) - field(p - vec2(e, 0.0)), field(p + vec2(0.0, e)) - field(p - vec2(0.0, e))) / (2.0 * e);
        float inside = (f - ${T}) / max(length(g), 1e-4);   // ~distance to the outline, positive inside
        float alpha = clamp(inside / fwidth(inside) + 0.5, 0.0, 1.0) * clamp((p.y - uFloor) / fwidth(p.y) + 0.5, 0.0, 1.0);
        if (alpha <= 0.0) discard;

        // Key light, attenuated the way three's punctual lights are. It lights only the eyes and the painted highlight.
        vec3 L = vec3(0.0, 0.0, 1.0); vec3 E = vec3(0.0);
        if (uLightKind == 3) { L = -uLightDir; E = uLightColor; }
        else if (uLightKind > 0) {
          vec3 d = uLightPos - vWorld; float dist = length(d); L = d / dist;
          float att = 1.0 / max(pow(dist, uFalloff.y), 0.01);
          if (uFalloff.x > 0.0) att *= pow(clamp(1.0 - pow(dist / uFalloff.x, 4.0), 0.0, 1.0), 2.0);
          if (uLightKind == 1) att *= smoothstep(uCone.x, uCone.y, dot(-L, uLightDir));
          E = uLightColor * att;
        }
        vec3 lit = min(E / PI, vec3(1.5));
        vec3 paint = uCream * (uAmb + lit);   // cream paper and paint: lit by the room like everything else, unshaded by angle
        vec2 lp = normalize((transpose(mat3(modelMatrix)) * L).xy + 1e-4);   // the key's side, in the plane

        // Matte ink, flat: no light reaches the body (look-pass-2) and nothing models it as a dome. Pigment pools in a
        // dark band at the edge like a dried drop, the middle is a touch thinner and mottled, and a fine grain sits on
        // top so it holds up next to paper. Texture rides the body: it squashes with it.
        vec2 tp = p / uScale;
        float rim = 1.0 - smoothstep(0.03, 0.18, inside);
        float dens = mix(0.85 + 0.4 * vnoise(tp * 2.5 + 7.0), 0.45, rim) * (0.85 + 0.3 * vnoise(tp * 40.0));
        vec3 ink = uInk * dens;

        // One painted highlight: a tapered cream stroke on the upper-left shoulder (its radius set by update()), slid a
        // little along the edge toward the key's side. Drawn, not reflected: it doesn't move with the view, and it is
        // clipped clear of the outline.
        vec2 q = p - vec2(0.0, 0.88 * uScale.y);
        float a0 = ${HI_A} - 0.12 * lp.x, k = clamp((atan(q.y, q.x) - a0) / ${HI_SPAN}, -1.0, 1.0);
        float sd = length(q - uHiR * vec2(cos(a0 + k * ${HI_SPAN}), sin(a0 + k * ${HI_SPAN}))) - ${HI_W} * (1.0 - 0.85 * k * k);
        float hi = clamp(-sd / fwidth(sd) + 0.5, 0.0, 1.0) * smoothstep(0.02, 0.06, inside);
        ink = mix(ink, 0.9 * paint, hi);

        float ed = eyesDist(p);
        float eye = clamp(-ed / fwidth(ed) + 0.5, 0.0, 1.0);
        vec3 eyeCol = paint;
        // A catchlight on the light's side of each open eye, so it reads as an eye and not a hole.
        vec4 ce = p.x < 0.5 * (uEye[0].x + uEye[1].x) ? uEye[0] : uEye[1];
        float cd = length(p - ce.xy - lp * 0.45 * ce.z) - 0.22 * ce.z;
        eyeCol += (1.0 - step(0.5, ce.w)) * clamp(-cd / fwidth(cd) + 0.5, 0.0, 1.0) * (vec3(0.6) + lit);
        gl_FragColor = vec4(mix(ink, eyeCol, eye), alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'blob';
  mesh.castShadow = true;

  // Puts this blob's field into a stock material's shader (sharing its uniforms, so it wobbles with the blob) and
  // runs `cut` at the top of main(), with bp = the fragment in radius units.
  const withField = (shader, cut) => {
    Object.assign(shader.uniforms, { uBalls: uniforms.uBalls, uScale: uniforms.uScale, uEye: uniforms.uEye, uRadius: uniforms.uRadius, uFloor: uniforms.uFloor });
    shader.vertexShader = 'varying vec2 vLocal;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocal = position.xy;');
    shader.fragmentShader = 'varying vec2 vLocal;\n' + GLSL_FIELD + shader.fragmentShader.replace('void main() {',
      `void main() {\n vec2 bp = vLocal / uRadius;\n${cut}`);
  };

  // Shadow: the stock depth material with the same field discarding outside the outline and inside the eyes.
  const depth = new THREE.MeshDepthMaterial();
  depth.defines = { EYE_LIDS: false };
  depth.onBeforeCompile = (shader) => withField(shader, ` if (bp.y < uFloor || field(bp) < ${T} || eyesDist(bp) < 0.0) discard;`);
  depth.customProgramCacheKey = () => 'looming-blob';
  mesh.customDepthMaterial = depth;

  // The same outline as a flat ink material for a decal (crowd shadows drawn without a light, s13): eyes are holes and
  // the edge fades over ±soft, in radius units of the mesh it's on (set material.userData.soft.value per frame when
  // the decal is scaled). Put it on a mesh built from blob.mesh.geometry; the caller places and scales that mesh.
  function silhouette({ color = PALETTE.ink, soft = 0.1 } = {}) {
    const m = new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    m.userData.soft = { value: soft };
    m.defines = { EYE_LIDS: lidded };
    shaders.push(m);
    m.onBeforeCompile = (sh) => {
      withField(sh, `const float hh = 0.01;
        vec2 gg = vec2(field(bp + vec2(hh, 0.0)) - field(bp - vec2(hh, 0.0)), field(bp + vec2(0.0, hh)) - field(bp - vec2(0.0, hh))) / (2.0 * hh);
        float inside = (field(bp) - ${T}) / max(length(gg), 1e-4);
        float sA = smoothstep(-uSoft, uSoft, inside) * smoothstep(-uSoft, uSoft, eyesDist(bp)) * step(uFloor, bp.y);
        if (sA <= 0.0) discard;`);
      sh.uniforms.uSoft = m.userData.soft;
      sh.fragmentShader = 'uniform float uSoft;\n' + sh.fragmentShader
        .replace('#include <alphamap_fragment>', 'diffuseColor.a *= sA;\n#include <alphamap_fragment>');
    };
    m.customProgramCacheKey = () => 'looming-blob-silhouette';
    return m;
  }

  // The ink flattens only where it touches. The stain marks the surface, so once both are placed the bottom is
  // clipped at the stain's height: lift the mesh and the drop rounds out. Runs before both the shadow and main pass.
  // ponytail: assumes an unrotated, unscaled blob over a level surface; fine for a desk, revisit for a tilted one.
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  const syncFloor = () => { uniforms.uFloor.value = stain.parent ? Math.min(0, (stain.getWorldPosition(a).y - mesh.getWorldPosition(b).y) / radius) : 0; };
  mesh.onBeforeShadow = syncFloor;

  // Read the key light from the scene each frame: the light that contributes most at the blob (intensity × distance
  // falloff × cone), or the Light passed to update(..., { key }).
  // ponytail: one key light only; a second light (phone vs lamp) adds no highlight. Add a second slot when a shot needs it.
  const tmp = new THREE.Vector3(), tmpColor = new THREE.Color(), at = new THREE.Vector3(), lp = new THREE.Vector3(), axis = new THREE.Vector3();
  let keyOverride = null;
  // Strength of light `o` at the blob, the way three's punctual lights attenuate (distance cutoff, decay, spot cone).
  function contribution(o) {
    let k = o.intensity * (o.color.r * 0.2126 + o.color.g * 0.7152 + o.color.b * 0.0722);
    if (o.isDirectionalLight) return k;
    o.getWorldPosition(lp);
    const d = lp.distanceTo(at), cut = o.distance || 0, decay = o.decay ?? 2;
    k /= Math.max(Math.pow(d, decay), 0.01);
    if (cut > 0 && decay > 0) k *= Math.pow(Math.min(1, Math.max(0, 1 - Math.pow(d / cut, 4))), 2);
    if (o.isSpotLight) {
      axis.copy(o.target.getWorldPosition(tmp)).sub(lp).normalize();
      const cos = tmp.copy(at).sub(lp).normalize().dot(axis);
      const c0 = Math.cos(o.angle), c1 = Math.cos(o.angle * (1 - o.penumbra));
      const x = Math.min(1, Math.max(0, (cos - c0) / (c1 - c0 || 1e-6)));
      k *= x * x * (3 - 2 * x);
    }
    return k;
  }
  mesh.onBeforeRender = (renderer, scene) => {
    syncFloor();
    let key = null, best = -1;
    mesh.getWorldPosition(at);
    uniforms.uAmb.value.setRGB(0, 0, 0);
    scene.traverseVisible((/** @type {any} */ o) => {  // any light kind
      if (!o.isLight || o.intensity <= 0) return;
      if (o.isAmbientLight) uniforms.uAmb.value.add(tmpColor.copy(o.color).multiplyScalar(o.intensity));
      else if (o.isHemisphereLight) uniforms.uAmb.value.add(tmpColor.copy(o.color).lerp(o.groundColor, 0.5).multiplyScalar(o.intensity));
      else if (o.isSpotLight || o.isPointLight || o.isDirectionalLight) {
        const k = contribution(o);
        if (k > best) { best = k; key = o; }
      }
    });
    if (keyOverride && keyOverride.intensity > 0) key = keyOverride;
    uniforms.uLightKind.value = !key ? 0 : key.isSpotLight ? 1 : key.isPointLight ? 2 : 3;
    if (!key) return;
    uniforms.uLightColor.value.copy(key.color).multiplyScalar(key.intensity);
    key.getWorldPosition(uniforms.uLightPos.value);
    if (key.target) uniforms.uLightDir.value.copy(key.target.getWorldPosition(tmp)).sub(uniforms.uLightPos.value).normalize();
    if (key.isSpotLight) uniforms.uCone.value.set(Math.cos(key.angle), Math.cos(key.angle * (1 - key.penumbra)));
    uniforms.uFalloff.value.set(key.distance || 0, key.decay ?? 2);
  };

  // Every material running the field; update() flips EYE_LIDS on all of them when a lidded eye comes or goes.
  /** @type {THREE.Material[]} */
  const shaders = [mat, depth];
  let lidded = false;

  /**
   * @param {number} tLocal
   * @param {{ squash?: number, wobble?: number, eyes?: string, look?: number, key?: THREE.Light | null, left?: number }} [opts]
   */
  function update(tLocal, { squash = 0, wobble = 1, eyes = 'open', look = 1, key = null, left } = {}) {
    keyOverride = key;
    const t = onTwos(tLocal);   // a character: it moves on 2s like the puppets (doc 03 · Motion)
    /** @type {[number, number, number, number][]} */
    const balls = [[0, 0.88 + 0.015 * wobble * Math.sin(6.283 * breath.f * t + breath.p), 2, 1]];
    for (const l of lobes) {
      const a = l.a + 0.22 * wobble * Math.sin(6.283 * l.fa * t + l.pa);
      const d = l.dist + 0.06 * wobble * Math.sin(6.283 * l.fd * t + l.pd);
      balls.push([d * Math.cos(a), 0.88 + d * Math.sin(a), l.R, l.w]);
    }
    // Nervous: a small fast shiver in width, only noticeable when wobble is turned up.
    const shiver = 0.012 * Math.max(0, wobble - 1) * Math.sin(6.283 * tremble.f * t + tremble.p);
    const s = 0.32 * Math.max(-1, Math.min(1, squash));
    const sx = 1 + s + shiver, sy = 1 / (1 + s);              // area-preserving squash and stretch
    balls.forEach((b, i) => uniforms.uBalls.value[i].set(...b));
    for (let i = balls.length; i < N; i++) uniforms.uBalls.value[i].set(0, 0, 1, 0);
    uniforms.uScale.value.set(sx, sy);

    if (!Object.hasOwn(EYES, eyes)) throw new Error(`blob: unknown eyes '${eyes}' (${Object.keys(EYES).join(', ')})`);
    const [shape, size, lift] = EYES[eyes], er = EYE_R * size, dx = shape === -2 ? SIDE_SHIFT * look : 0;
    if (lidded !== shape < 0) {
      lidded = shape < 0;
      for (const m of shaders) { m.defines.EYE_LIDS = lidded; m.needsUpdate = true; }
    }
    [-1, 1].forEach((side, i) => {
      const x = side * EYE_X * sx;   // height from the unshifted spot, so a side glance keeps the eyes level
      uniforms.uEye.value[i].set(x + dx, topAt(balls, sx, sy, x) - EYE_DROP * Math.min(1, sy) + lift, er, shape);
    });
    let d = 0.5;   // march out along the shoulder ray to the outline, then step back in
    const cx = Math.cos(HI_A), cy = Math.sin(HI_A), y0 = 0.88 * sy;
    while (d < 3 && fieldJS(balls, sx, sy, d * cx, y0 + d * cy) >= T) d += 0.02;
    uniforms.uHiR.value = d - HI_IN;
    if (left !== undefined) stain.material.opacity = STAIN * (1 - ease((tLocal - left) / STAIN_FADE));
  }

  // Stain: a blotted ink ring lying flat (XZ) at the origin, a little wider than the drop so it shows around its foot.
  // Pigment dried at the rim (the ring), a thin uneven wash inside. Fade it with stain.material.opacity, or let
  // update(t, { left }) fade it over STAIN_FADE s once the blob has gone.
  // The blot's outline is the alphaMap (solid inside, as before: s02 stretches it into its calendar trail); the ring
  // and wash are the map's alpha, which multiplies it.
  const S = 64, cover = new Uint8Array(S * S * 4), tone = new Uint8Array(S * S * 4).fill(255);
  const harm = [2, 3, 5].map((k) => [k, r(0.03, 0.08), r(0, 6.283)]);
  const blot = [1, 2, 3].map(() => [r(2, 5), r(2, 5), r(0, 6.283), r(0, 6.283)]);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const x = (i + 0.5) / S * 2 - 1, y = (j + 0.5) / S * 2 - 1, a = Math.atan2(y, x), d = Math.hypot(x, y), o = (j * S + i) * 4;
    const edge = 0.8 + harm.reduce((acc, [k, amp, ph]) => acc + amp * Math.sin(k * a + ph), 0);
    const wash = 0.3 + 0.1 * blot.reduce((acc, [fx, fy, px, py]) => acc + Math.sin(fx * x + px) * Math.sin(fy * y + py), 0);
    const ring = Math.exp(-(((edge - 0.09 - d) / 0.07) ** 2));
    cover.fill(Math.round(255 * Math.max(0, Math.min(1, (edge - d) / 0.04))), o, o + 4);
    tone[o + 3] = Math.round(255 * Math.min(1, wash + ring));
  }
  const tex = (data) => Object.assign(new THREE.DataTexture(data, S, S), { magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter, needsUpdate: true });
  const alphaMap = tex(cover), map = tex(tone);
  const stain = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2 * radius, 2.2 * radius).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: PALETTE.ink, map, alphaMap, transparent: true, opacity: STAIN, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }),
  );
  stain.name = 'blob-stain';
  stain.position.y = 0.0003;

  update(0);
  return { mesh, update, stain, silhouette };
}

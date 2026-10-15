// The Exam: the one thing in the film that isn't paper. A vertical plane carrying a 2D metaball field,
// shaded as glossy ink lit by the scene's key light, with two cream eyes near its top.
// The shadow pass runs the same field (eyes cut out as holes), so the shadow is exactly this shape.
// All motion comes from update(tLocal, ...); nothing reads a clock.
import * as THREE from 'three';
import { mulberry32, seedOf } from './core/rng.js';
import { onTwos } from './core/ease.js';
import { PALETTE } from './core/palette.js';

const N = 5;          // ball slots in the shader; unused slots get weight 0
const T = 0.5625;     // threshold: the body ball (support 2) crosses it at distance 1, so the blob is ~1 radius wide
const EYE_X = 0.42, EYE_DROP = 0.92, EYE_R = 0.2;   // in radius units, measured from the top of the outline
const EYES = { open: 0, closed: 1, worried: 2 };

// Field in radius units. p is plane-local / radius, with y = 0 on the surface below.
// Each ball is [x, y, support, weight]; squash scales space so the bottom stays planted.
const GLSL_FIELD = /* glsl */`
uniform vec4 uBalls[${N}];
uniform vec2 uScale;
uniform vec4 uEye[2];      // x, y, radius, mode (0 open disc, 1 closed arc)
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
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
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
      uniform mat4 modelMatrix;   // three sets it on any program that declares it
      uniform int uLightKind;
      uniform vec2 uCone, uFalloff;
      varying vec2 vLocal;
      varying vec3 vWorld;
      const float PI = 3.141592653589793;

      void main() {
        vec2 p = vLocal / uRadius;
        float f = field(p);
        if (f < 0.8 * ${T} || p.y < uFloor - 0.05) discard;
        const float e = 0.01;
        vec2 g = vec2(field(p + vec2(e, 0.0)) - field(p - vec2(e, 0.0)), field(p + vec2(0.0, e)) - field(p - vec2(0.0, e))) / (2.0 * e);
        float inside = (f - ${T}) / max(length(g), 1e-4);   // ~distance to the outline, positive inside
        float alpha = clamp(inside / fwidth(inside) + 0.5, 0.0, 1.0) * clamp((p.y - uFloor) / fwidth(p.y) + 0.5, 0.0, 1.0);
        if (alpha <= 0.0) discard;

        // Height: for the body ball alone this is exactly a hemisphere; lobes blend in smoothly.
        // Its gradient gives the normal, steep at the rim and round on top.
        vec2 hg = vec2(height(p + vec2(e, 0.0)) - height(p - vec2(e, 0.0)), height(p + vec2(0.0, e)) - height(p - vec2(0.0, e))) / (2.0 * e);
        vec3 nLocal = normalize(vec3(-hg, 1.0));
        vec3 N = normalize(mat3(modelMatrix) * nLocal);
        vec3 V = normalize(cameraPosition - vWorld);
        if (dot(N, V) < 0.0 && gl_FrontFacing == false) N = -N;   // seen from behind: mirror the dome

        // Key light, attenuated the way three's punctual lights are.
        vec3 L = vec3(0.0, 0.0, 1.0); vec3 E = vec3(0.0);
        if (uLightKind == 3) { L = -uLightDir; E = uLightColor; }
        else if (uLightKind > 0) {
          vec3 d = uLightPos - vWorld; float dist = length(d); L = d / dist;
          float att = 1.0 / max(pow(dist, uFalloff.y), 0.01);
          if (uFalloff.x > 0.0) att *= pow(clamp(1.0 - pow(dist / uFalloff.x, 4.0), 0.0, 1.0), 2.0);
          if (uLightKind == 1) att *= smoothstep(uCone.x, uCone.y, dot(-L, uLightDir));
          E = uLightColor * att;
        }
        float nl = max(dot(N, L), 0.0);
        vec3 H = normalize(L + V);
        float nh = max(dot(N, H), 0.0);
        vec3 lit = min(E / PI, vec3(1.5));                   // a highlight is a reflection of the bulb: it saturates
        // Wet = a crisp-edged reflection of the source (a rounded screen-like rectangle) with a hot core.
        vec3 hx = normalize(cross(vec3(0.0, 1.0, 0.0), H)), hy = cross(H, hx);
        vec2 q = abs(vec2(dot(N - H, hx), dot(N - H, hy))) - vec2(0.08, 0.15) + 0.05;
        float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.05;
        vec3 spec = lit * (0.9 * smoothstep(0.006, -0.006, sd) + 1.5 * pow(nh, 400.0));
        // Ink stays ink: the room's fill never reaches the body or its rim (a lifted night fill turned it to grey
        // glass, look-pass-1), and the key's strength doesn't either. The body is PALETTE.ink where it faces the key,
        // a little darker where it turns away; the only gloss is the key light: its reflection and a faint wet edge
        // on the side it lights.
        float fres = pow(1.0 - max(dot(N, V), 0.0), 5.0);
        vec3 env = 0.12 * lit * fres * nl;

        vec3 ink = uInk * mix(0.55, 1.0, smoothstep(0.0, 0.5, nl)) + spec + env;
        float ed = eyesDist(p);
        float eye = clamp(-ed / fwidth(ed) + 0.5, 0.0, 1.0);
        vec3 eyeCol = uCream * (uAmb + lit) + 0.5 * spec;   // unshaded by angle: the eyes stay the lightest part of it
        // A catchlight on the light's side of each open eye, so it reads as an eye and not a hole.
        vec2 lp = normalize((transpose(mat3(modelMatrix)) * L).xy + 1e-4);
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

  // Shadow: the stock depth material with the same field discarding outside the outline and inside the eyes.
  const depth = new THREE.MeshDepthMaterial();
  depth.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, { uBalls: uniforms.uBalls, uScale: uniforms.uScale, uEye: uniforms.uEye, uRadius: uniforms.uRadius, uFloor: uniforms.uFloor });
    shader.vertexShader = 'varying vec2 vLocal;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocal = position.xy;');
    shader.fragmentShader = 'varying vec2 vLocal;\n' + GLSL_FIELD + shader.fragmentShader.replace('void main() {',
      `void main() {\n vec2 bp = vLocal / uRadius;\n if (bp.y < uFloor || field(bp) < ${T} || eyesDist(bp) < 0.0) discard;`);
  };
  depth.customProgramCacheKey = () => 'looming-blob';
  mesh.customDepthMaterial = depth;

  // The ink flattens only where it touches. The stain marks the surface, so once both are placed the bottom is
  // clipped at the stain's height: lift the mesh and the drop rounds out. Runs before both the shadow and main pass.
  // ponytail: assumes an unrotated, unscaled blob over a level surface; fine for a desk, revisit for a tilted one.
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  const syncFloor = () => { uniforms.uFloor.value = stain.parent ? Math.min(0, (stain.getWorldPosition(a).y - mesh.getWorldPosition(b).y) / radius) : 0; };
  mesh.onBeforeShadow = syncFloor;

  // Read the key light from the scene each frame: the brightest shadow-casting light, else the brightest light.
  // ponytail: one key light only; a second light (phone vs lamp) adds no highlight. Add a second slot when a shot needs it.
  const tmp = new THREE.Vector3(), tmpColor = new THREE.Color();
  mesh.onBeforeRender = (renderer, scene) => {
    syncFloor();
    let key = null;
    uniforms.uAmb.value.setRGB(0, 0, 0);
    scene.traverseVisible((o) => {
      if (!o.isLight || o.intensity <= 0) return;
      if (o.isAmbientLight) uniforms.uAmb.value.add(tmpColor.copy(o.color).multiplyScalar(o.intensity));
      else if (o.isHemisphereLight) uniforms.uAmb.value.add(tmpColor.copy(o.color).lerp(o.groundColor, 0.5).multiplyScalar(o.intensity));
      else if (o.isSpotLight || o.isPointLight || o.isDirectionalLight) {
        if (!key || (o.castShadow && !key.castShadow) || (o.castShadow === key.castShadow && o.intensity > key.intensity)) key = o;
      }
    });
    uniforms.uLightKind.value = !key ? 0 : key.isSpotLight ? 1 : key.isPointLight ? 2 : 3;
    if (!key) return;
    uniforms.uLightColor.value.copy(key.color).multiplyScalar(key.intensity);
    key.getWorldPosition(uniforms.uLightPos.value);
    if (key.target) uniforms.uLightDir.value.copy(key.target.getWorldPosition(tmp)).sub(uniforms.uLightPos.value).normalize();
    if (key.isSpotLight) uniforms.uCone.value.set(Math.cos(key.angle), Math.cos(key.angle * (1 - key.penumbra)));
    uniforms.uFalloff.value.set(key.distance || 0, key.decay ?? 2);
  };

  function update(tLocal, { squash = 0, wobble = 1, eyes = 'open' } = {}) {
    const t = onTwos(tLocal);   // a character: it moves on 2s like the puppets (doc 03 · Motion)
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

    const mode = EYES[eyes] ?? 0;
    const er = mode === 2 ? EYE_R * 0.68 : EYE_R;
    const lift = mode === 2 ? 0.15 : 0;
    [-1, 1].forEach((side, i) => {
      const x = side * EYE_X * sx;
      uniforms.uEye.value[i].set(x, topAt(balls, sx, sy, x) - EYE_DROP * Math.min(1, sy) + lift, er, mode === 1 ? 1 : 0);
    });
  }

  // Stain: a soft, slightly irregular ink blot lying flat (XZ) at the origin. Fade it with stain.material.opacity.
  const S = 64, data = new Uint8Array(S * S * 4);
  const harm = [2, 3, 5].map((k) => [k, r(0.03, 0.08), r(0, 6.283)]);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const x = (i + 0.5) / S * 2 - 1, y = (j + 0.5) / S * 2 - 1, a = Math.atan2(y, x);
    const edge = 0.8 + harm.reduce((acc, [k, amp, ph]) => acc + amp * Math.sin(k * a + ph), 0);
    const v = Math.max(0, Math.min(1, (edge - Math.hypot(x, y)) / 0.25));
    data.fill(Math.round(255 * v * v), (j * S + i) * 4, (j * S + i) * 4 + 4);
  }
  const alphaMap = new THREE.DataTexture(data, S, S);
  alphaMap.magFilter = alphaMap.minFilter = THREE.LinearFilter;
  alphaMap.needsUpdate = true;
  const stain = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8 * radius, 1.8 * radius).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: PALETTE.ink, alphaMap, transparent: true, opacity: 0.45, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }),
  );
  stain.name = 'blob-stain';
  stain.position.y = 0.0003;

  update(0);
  return { mesh, update, stain };
}

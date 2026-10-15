// Post chain (doc 04 §Camera and post): Render -> Bokeh (miniature DOF) -> sRGB output -> per-act LUT -> grain + vignette.
// No bloom. Everything is a pure function of the frame: grain is hashed from (pixel, frame), never a clock.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Doc 03 color script as grades on display-referred (sRGB) color. gain tints the highlights, lift tints the shadows.
const GRADES = {
  night:   { gain: [0.74, 0.86, 1.06], lift: [0.02, 0.035, 0.09], sat: 0.92, contrast: 1.08, gamma: 1.12 }, // navy night, first cyan
  marston: { gain: [0.86, 1.02, 0.90], lift: [0.00, 0.035, 0.018], sat: 0.55, contrast: 1.14, gamma: 1.18 }, // fluorescent green-white, drained and heavy
  amber:   { gain: [1.14, 0.98, 0.72], lift: [0.045, 0.015, 0.00], sat: 1.08, contrast: 1.05, gamma: 0.95 }, // act 3: lamp amber takes the frame
  dawn:    { gain: [1.08, 1.00, 0.84], lift: [0.015, 0.03, 0.06], sat: 0.95, contrast: 0.90, gamma: 0.92 },  // gold highlights, cold shadows, soft
};
const SIZE = 32;
const cache = {};

function grade(rgb, g) {
  const l = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  return rgb.map((v, i) => {
    v = l + (v - l) * g.sat;
    v = (v - 0.5) * g.contrast + 0.5;
    v = Math.min(1, Math.max(0, v));
    v = Math.pow(v, g.gamma);
    v = v * g.gain[i] + g.lift[i] * (1 - v);
    return Math.min(1, Math.max(0, v));
  });
}

// Procedural 3D LUT (no files, no downloads). Returns null for an unknown/empty name.
export function loadLUT(name) {
  if (!name || !GRADES[name]) return null;
  if (cache[name]) return cache[name];
  const data = new Uint8Array(SIZE ** 3 * 4);
  for (let b = 0; b < SIZE; b++) for (let g = 0; g < SIZE; g++) for (let r = 0; r < SIZE; r++) {
    const o = (r + g * SIZE + b * SIZE * SIZE) * 4;
    const c = grade([r, g, b].map((v) => v / (SIZE - 1)), GRADES[name]);
    data[o] = Math.round(c[0] * 255); data[o + 1] = Math.round(c[1] * 255); data[o + 2] = Math.round(c[2] * 255); data[o + 3] = 255;
  }
  const tex = new THREE.Data3DTexture(data, SIZE, SIZE, SIZE);
  tex.format = THREE.RGBAFormat; tex.type = THREE.UnsignedByteType;
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.ClampToEdgeWrapping;
  tex.unpackAlignment = 1; tex.needsUpdate = true;
  return (cache[name] = tex);
}

const GrainVignette = {
  uniforms: { tDiffuse: { value: null }, frame: { value: 0 }, grain: { value: 0 }, vignette: { value: 0 }, aspect: { value: 16 / 9 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float frame, grain, vignette, aspect; varying vec2 vUv;
    uint pcg(uint v){ uint s = v * 747796405u + 2891336287u; uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
    float rnd(uvec2 p, uint f){ return float(pcg(pcg(pcg(p.x) + p.y) + f)) / 4294967295.0; }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
      uvec2 p = uvec2(gl_FragCoord.xy); uint f = uint(frame);
      float n = rnd(p, f) + rnd(p, f + 7919u) - 1.0;                 // triangular, mean 0
      c.rgb += n * grain * (0.4 + 0.6 * (1.0 - abs(2.0 * l - 1.0)));  // strongest in the mids
      vec2 d = (vUv - 0.5) * vec2(aspect, 1.0) / aspect * 2.0;
      c.rgb *= 1.0 - vignette * smoothstep(0.45, 1.35, length(d));
      gl_FragColor = vec4(c.rgb, 1.0);
    }`,
};

// focus: distance (m) from the camera along its look direction. Animate it per shot with post.set({ focus }) in onFrame.
export function createPost(stage, { focus = 2, aperture = 0.02, maxblur = 0.01, lut = null, grain = 0.04, vignette = 0.25 } = {}) {
  const { renderer, scene, camera } = stage;
  const size = renderer.getSize(new THREE.Vector2());
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 }); // MSAA keeps torn edges clean
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(1); composer.setSize(size.x, size.y);

  const bokeh = new BokehPass(scene, camera, { focus, aperture, maxblur });
  // Bokeh's depth pass clears to scene.background's color, which would be read as depth. Hide it for that pass only.
  const bokehRender = bokeh.render.bind(bokeh);
  bokeh.render = (...a) => { const bg = scene.background; scene.background = null; bokehRender(...a); scene.background = bg; };
  const lutPass = new LUTPass({ lut: null });
  const gv = new ShaderPass(GrainVignette);
  gv.uniforms.aspect.value = size.x / size.y;
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(bokeh);
  composer.addPass(new OutputPass());
  composer.addPass(lutPass);
  composer.addPass(gv);

  const set = (o = {}) => {
    if ('focus' in o) bokeh.uniforms.focus.value = o.focus;
    if ('aperture' in o) bokeh.uniforms.aperture.value = o.aperture;
    if ('maxblur' in o) bokeh.uniforms.maxblur.value = o.maxblur;
    if ('grain' in o) gv.uniforms.grain.value = o.grain;
    if ('vignette' in o) gv.uniforms.vignette.value = o.vignette;
    if ('lut' in o) {
      const tex = typeof o.lut === 'string' ? loadLUT(o.lut) : o.lut;
      lutPass.lut = tex; lutPass.enabled = !!tex;
    }
  };
  set({ lut, grain, vignette });

  stage.onFrame((t) => { gv.uniforms.frame.value = Math.round(t * 24); }); // grain re-rolls per 24 fps frame, same t -> same noise
  const render = () => composer.render();
  stage.setRender(render);
  return { render, set, composer };
}

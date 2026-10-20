// Paper material: Lambert from the front, light through the sheet from behind, a glowing torn rim when backlit
// (doc 04 · paperMaterial, contract in docs/contracts.md).
//
// Back term, per direct light:  lightColor · paperColor · translucency · (1 − thickness) · max(0, −N·L) / π
//   (the /π matches Lambert's BRDF, so translucency 1 at thickness 0 glows as bright as the lit front).
// Edge catch: alpha is averaged over a ring of 8 taps; where part of the ring falls outside the cut, the pixel is
//   near a torn edge. Those pixels add lightColor · edgeCatch · back-lighting, tinted toward white (torn fibers are
//   thin even on cardstock, so the catch is not scaled by thickness). The ring radius is the larger of EDGE_TEXELS
//   and EDGE_SCREEN_PX, times a width that wanders along the edge (look-pass-2: a fixed radius drew the backlit
//   tissue as an even glowing outline). Two value noises in texture space set the width (0.2–0.9 of the full ring)
//   and long breaks; the catch is brighter where the band is thinnest, as thin fibre passes more light.
//   The noise is placed by the sheet's key and nudged by its boil seed, so the rim boils without reshuffling.
// N is the side facing the camera (three flips it on back faces), so "behind" always means behind as seen.
// The light's shadow is already in directLight.color, so anything between the light and the sheet shadows the glow.
import * as THREE from 'three';
import { mulberry32, seedOf } from './core/rng.ts';
import type { PaperSheet } from './paper.ts';

const EDGE_TEXELS = 12;    // rim catch width in texels at 1024 px (scaled by the alphaMap's size)
const EDGE_SCREEN_PX = 6;  // ...but never thinner than this on screen (before the wandering width scales it down)
const RIM_CELL = 40;       // texels (at 1024 px) per width-noise cell; breaks use cells twice that
const RIM_BOIL = 0.35;     // how far, in cells, each boil step nudges the noise

const PARS = /* glsl */`
uniform float uTranslucency, uThickness, uEdgeCatch;
uniform vec2 uTexel, uRimSeed;
float paperEdge;
float paperHash( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
float paperNoise( vec2 p ) {
  vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( paperHash( i ), paperHash( i + vec2( 1, 0 ) ), f.x ), mix( paperHash( i + vec2( 0, 1 ) ), paperHash( i + vec2( 1, 1 ) ), f.x ), f.y );
}  // 0 deep inside the sheet, toward 1 at a torn edge; set in main() before the lights run
void RE_Direct_Paper( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
  RE_Direct_Lambert( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  float back = saturate( -dot( geometryNormal, directLight.direction ) );
  reflectedLight.directDiffuse += directLight.color * BRDF_Lambert( material.diffuseColor ) * uTranslucency * ( 1.0 - uThickness ) * back;
  vec3 fiber = mix( material.diffuseColor, vec3( 1.0 ), 0.6 );
  reflectedLight.directDiffuse += directLight.color * fiber * uEdgeCatch * paperEdge * sqrt( back );  // no 1/π: fibers pass light on toward the eye
}
#undef RE_Direct
#define RE_Direct RE_Direct_Paper
`;

const EDGE = /* glsl */`
#include <alphamap_fragment>
paperEdge = 0.0;
#ifdef USE_ALPHAMAP
{
  vec2 cell = vAlphaMapUv / ( uTexel * ${RIM_CELL.toFixed(1)} ) + uRimSeed;
  float w = 0.65 * paperNoise( cell ) + 0.35 * paperNoise( 2.7 * cell + 13.0 );
  float gap = smoothstep( 0.42, 0.52, paperNoise( 0.5 * cell + 41.0 ) );   // ~2/5 of the edge goes dark in long breaks
  w = smoothstep( 0.2, 0.8, w );
  vec2 r = max( uTexel * ${EDGE_TEXELS.toFixed(1)}, fwidth( vAlphaMapUv ) * ${EDGE_SCREEN_PX.toFixed(1)} ) * mix( 0.2, 0.9, w );
  float a = 0.0;
  for ( int i = 0; i < 8; i++ ) {
    float th = float( i ) * 0.7853982;
    a += texture2D( alphaMap, vAlphaMapUv + r * vec2( cos( th ), sin( th ) ) ).g;
  }
  paperEdge = smoothstep( 0.0, 0.4, 1.0 - a / 8.0 ) * gap * mix( 1.7, 0.8, w );  // thinnest is brightest
}
#endif
`;

function onBeforeCompile(this: THREE.Material, shader: THREE.WebGLProgramParametersWithUniforms) {
  Object.assign(shader.uniforms, this.userData.paper);
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <lights_lambert_pars_fragment>', '#include <lights_lambert_pars_fragment>\n' + PARS)
    .replace('#include <alphamap_fragment>', EDGE);
}

export type PaperMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshLambertMaterial>;

function setMaps(mesh: PaperMesh, sheet: PaperSheet) {
  const m = mesh.material, u = m.userData.paper, img = sheet.alphaMap.image;
  m.map = sheet.map; m.alphaMap = sheet.alphaMap;
  u.uThickness.value = sheet.thickness;
  const k = Math.max(img.width, img.height) / 1024;  // texels per "1024-px texel", as paper.js counts them
  u.uTexel.value.set(k / img.width, k / img.height);
  // Rim noise: placed by the key (holds still), nudged by the boil seed (boils).
  const home = mulberry32(seedOf(sheet.key, 'edge-catch')), step = mulberry32(seedOf(sheet.key, 'edge-catch', sheet.seed));
  u.uRimSeed.value.set(1000 * home() + RIM_BOIL * (2 * step() - 1), 1000 * home() + RIM_BOIL * (2 * step() - 1));
  mesh.userData.sheet = sheet;
}

export function paperMesh(sheet: PaperSheet, { translucency = sheet.thickness < 0.5 ? 0.8 : 0.05, edgeCatch = 0.6 } = {}): PaperMesh {
  const material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, alphaTest: 0.5 });
  material.userData.paper = {
    uTranslucency: { value: translucency }, uThickness: { value: 0 }, uEdgeCatch: { value: edgeCatch }, uTexel: { value: new THREE.Vector2() }, uRimSeed: { value: new THREE.Vector2() },
  };
  material.onBeforeCompile = onBeforeCompile;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...sheet.size), material);
  mesh.castShadow = mesh.receiveShadow = true;
  // r186 already alpha-tests shadows from the mesh material's alphaMap (evidence/mod-material/alpha_shadow_test.txt);
  // kept per doc 04 so cut-out shadows don't depend on that internal behavior.
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ alphaMap: sheet.alphaMap, alphaTest: 0.5, side: THREE.DoubleSide });
  mesh.customDistanceMaterial = new THREE.MeshDistanceMaterial({ alphaMap: sheet.alphaMap, alphaTest: 0.5, side: THREE.DoubleSide });
  // Each shadow pass, r186 copies map, alphaMap and alphaTest from mesh.material onto these, so a boil swap reaches
  // the shadow with no extra work here.
  setMaps(mesh, sheet);
  return mesh;
}

// Swap textures for a new boil seed. Same geometry, same material and program: only texture uniforms change.
export function updatePaperMesh(mesh: PaperMesh, sheet: PaperSheet) {
  if (mesh.userData.sheet !== sheet) setMaps(mesh, sheet);
}

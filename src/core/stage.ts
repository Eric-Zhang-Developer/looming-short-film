// One renderer, scene and camera per page. renderFrame(t) is the only entry point.
import * as THREE from 'three';

export type Stage = ReturnType<typeof createStage>;

export function createStage({ width = 1920, height = 1080, fov = 20 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // r186 has no PCFSoftShadowMap; softness comes from shadow.radius
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;   // doc 03 grades in post
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.05, 20);
  const fns: ((t: number) => void)[] = [];
  let draw = () => renderer.render(scene, camera);
  const renderFrame = (t: number) => {
    for (const fn of fns) fn(t);
    draw();
  };
  const setRender = (fn: () => void) => { draw = fn; };  // post.ts swaps in its composer here
  return { renderer, scene, camera, onFrame: (fn: (t: number) => void) => { fns.push(fn); }, renderFrame, setRender, ready: Promise.resolve() };
}

export function exposeForRender(stage: Pick<Stage, 'renderFrame' | 'ready'>, { duration, fps = 24 }: { duration: number, fps?: number }) {
  window.renderFrame = stage.renderFrame;
  window.LOOMING = { duration, fps, ready: stage.ready };
}

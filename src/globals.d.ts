// What a Looming page exposes to render.ts and tools/lib/page.ts (src/core/stage.js exposeForRender).
interface Window {
  renderFrame(t: number): void | Promise<void>;
  LOOMING?: { duration: number; fps: number; ready: Promise<unknown> };
}

// [x, y, z]: what Vector3.set(...v) and Euler.set(...v) take.
type Vec3 = [number, number, number];
// A locked camera: where it sits, what it looks at, and (optionally) the focus point.
type CamKey = { pos: Vec3; look: Vec3; focus?: Vec3 };

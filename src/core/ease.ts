// Easing and keyframes, ported from the KnightHacks src/core.js with the beat/BPM coupling dropped.
export const clamp = (x: number, a = 0, b = 1): number => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, x: number): number => a + (b - a) * x;
export const ease = (x: number): number => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeIn = (x: number): number => Math.pow(clamp(x), 3);
export const easeOut = (x: number): number => 1 - Math.pow(1 - clamp(x), 3);

// kf(t, [[t0, v0], [t1, v1], ...], easeFn). Values may be numbers or arrays of numbers. Holds outside the keys.
export type Key<V> = readonly [number, V];
export function kf(t: number, keys: readonly Key<number>[], e?: (x: number) => number): number;
export function kf(t: number, keys: readonly Key<readonly number[]>[], e?: (x: number) => number): number[];
export function kf(t: number, keys: readonly Key<number | readonly number[]>[], e?: (x: number) => number): number | readonly number[];
// Legacy JSDoc callers pass number[][] (JS infers arrays, not tuples). ponytail: delete this overload once no .js file calls kf.
export function kf(t: number, keys: readonly (readonly any[])[], e?: (x: number) => number): any;
export function kf(t: number, keys: readonly (readonly any[])[], e: (x: number) => number = ease): any {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a));
      return Array.isArray(va) ? (va as readonly number[]).map((v, j) => lerp(v, (vb as readonly number[])[j], k)) : lerp(va as number, vb as number, k);
    }
  }
  return keys[keys.length - 1][1];
}

// Damped spring kicked at t0: 0 before, then a wobble that dies away (secondary motion, settles).
export const spring = (t: number, t0: number, k = 6, w = 18): number => t < t0 ? 0 : Math.exp(-k * (t - t0)) * Math.sin(w * (t - t0));

// Characters animate "on 2s": t snapped down to 12 fps steps. Lights and camera use the real t.
// The 1e-4 nudge absorbs the float error of the film's global-to-local subtraction (t − shot.start can land a hair
// under a drawing boundary, e.g. 100.0833 − 100 = 0.08333333333332860). It is far below one frame (1/24 s × 12 = 0.5).
export const onTwos = (t: number, fps = 12): number => Math.floor(t * fps + 1e-4) / fps;

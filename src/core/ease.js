// @ts-check
// Easing and keyframes, ported from the KnightHacks src/core.js with the beat/BPM coupling dropped.
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, x) => a + (b - a) * x;
export const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeIn = (x) => Math.pow(clamp(x), 3);
export const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);

// kf(t, [[t0, v0], [t1, v1], ...], easeFn). Values may be numbers or arrays of numbers. Holds outside the keys.
export function kf(t, keys, e = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a));
      return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
    }
  }
  return keys[keys.length - 1][1];
}

// Damped spring kicked at t0: 0 before, then a wobble that dies away (secondary motion, settles).
export const spring = (t, t0, k = 6, w = 18) => t < t0 ? 0 : Math.exp(-k * (t - t0)) * Math.sin(w * (t - t0));

// Characters animate "on 2s": t snapped down to 12 fps steps. Lights and camera use the real t.
// The 1e-4 nudge absorbs the float error of the film's global-to-local subtraction (t − shot.start can land a hair
// under a drawing boundary, e.g. 100.0833 − 100 = 0.08333333333332860). It is far below one frame (1/24 s × 12 = 0.5).
export const onTwos = (t, fps = 12) => Math.floor(t * fps + 1e-4) / fps;

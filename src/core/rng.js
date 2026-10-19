// @ts-check
// Seeded randomness, ported bit-identically from 1776's src/rng.ts. The only source of randomness in the film.
// hash(n): stateless, for per-frame/per-object lookups (the common case in a pure renderFrame(t)).
export function hash(n) {
  n = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13; n = Math.imul(n, 0xc2b2ae35); n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
export const hash2 = (a, b) => hash(a * 73856093 ^ b * 19349663);

// mulberry32: sequential stream, for code that wants rng() calls in order.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// seedOf('gator', 'arm_l', 7) → uint32. FNV-1a over the parts' string forms (UTF-16 code units),
// with a 0 separator so seedOf('ab') !== seedOf('a', 'b').
export function seedOf(...parts) {
  let h = 0x811c9dc5;
  for (const s of parts.map(String).join('\0')) for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

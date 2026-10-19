// @ts-check
// The Exam: a thin wrapper over createBlob that fixes the film-wide size (docs/shots/README.md §1).
// Q5 is answered (a) until the director says otherwise: the body stays EXAM_R through Act 2 and shrinks only in s16,
// one step per solved problem. If the answer changes, change examRadius() and nothing else.
import { createBlob } from '../blob.js';

export const EXAM_R = 0.012;
export const SHRINK = [0.012, 0.0105, 0.009, 0.008, 0.007, 0.006, 0.005];  // r after n problems solved (s16)
export const BLOB_R = { freshman: 0.012, neighbor: 0.013, custodian: 0.004, sleeper17: 0.006 };  // other people's blobs

export function examRadius(shot, solved = 0) {
  if (shot === 's16') return SHRINK[solved];
  if (shot === 's17' || shot === 's18') return SHRINK[SHRINK.length - 1];
  return EXAM_R;
}

// The blob is built at the shot's starting radius; s16's steps are a mesh scale on top of it.
/** @param {{ shot?: string, seed?: number }} [opts] */
export function makeExam({ shot, seed = 1 } = {}) {
  const radius = examRadius(shot);
  return { ...createBlob({ radius, seed }), radius, scaleAt: (solved) => examRadius(shot, solved) / radius };
}

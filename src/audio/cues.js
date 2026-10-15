// Cue sheet: sounds placed by beat name (src/timeline.js), never by raw time. Moving a beat moves its sound.
// stem: 'foley' (default) | 'ambience' | 'music'. seed: defaults to seedOf(sound) in tools/mix.mjs,
// so the three lamp clicks share one seed and are sample-identical (doc 05).
export const CUES = [
  { beat: 'inkDropForms', sound: 'inkDrip', gain: 0.7 },
  { beat: 'lampClickHome', sound: 'lampClick', gain: 0.8 },
  { beat: 'lampClickMarston', sound: 'lampClick', gain: 0.8 },
  { beat: 'penUncap', sound: 'penUncap', gain: 0.7 },
  { beat: 'lampClickFreshman', sound: 'lampClick', gain: 0.8 },
];

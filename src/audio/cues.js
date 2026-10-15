// Cue sheet: sounds placed by beat name (src/timeline.js), never by raw time. Moving a beat moves its sound.
// stem: 'foley' (default) | 'ambience' | 'music'. seed: defaults to seedOf(sound) in tools/mix.mjs,
// so the three lamp clicks share one seed and are sample-identical (doc 05).
// offset: seconds after the beat (may be negative, default 0); the cue starts at beat(beat) + offset.
// Length (beds): dur in seconds, or until: '<beatName>' (runs from the cue's start to that beat). tools/mix.mjs passes it
// as FOLEY[sound](seed, dur); with neither, the sound plays at its default length.
export const CUES = [
  { beat: 'inkDropForms', sound: 'inkDrip', gain: 0.7 },
  { beat: 'lampClickHome', sound: 'lampClick', gain: 0.8 },
  { beat: 'lampClickMarston', sound: 'lampClick', gain: 0.8 },
  { beat: 'penUncap', sound: 'penUncap', gain: 0.7 },
  { beat: 'quiet2Start', until: 'nextSemester', sound: 'roomTone', stem: 'ambience', gain: 1 }, // doc 05: Quiet 2 is room tone
  { beat: 'lampClickFreshman', sound: 'lampClick', gain: 0.8 },
];

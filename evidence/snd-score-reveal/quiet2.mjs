// peak of the music stem (float32 stereo? read as mix.mjs writes it) in the windows around the reveal and into Quiet 2
import { readFileSync } from 'node:fs';
const b = readFileSync(process.argv[2]); const ch = b.readUInt16LE(22), fmt = b.readUInt16LE(20), bps = b.readUInt16LE(34) / 8, step = ch * bps;
const peak = (a, z) => { let m = 0; for (let i = Math.floor(a * 48000); i < Math.floor(z * 48000); i++) m = Math.max(m, Math.abs(fmt === 3 ? b.readFloatLE(44 + i * step) : b.readInt16LE(44 + i * step) / 32768)); return 20 * Math.log10(m + 1e-9); };
for (const [a, z] of [[88, 89.4], [94.4, 95], [95, 100], [130.5, 133], [133, 134.5], [134.5, 135], [135, 136], [136, 160]]) console.log(`music peak ${a}-${z} s: ${peak(a, z).toFixed(1)} dBFS`);

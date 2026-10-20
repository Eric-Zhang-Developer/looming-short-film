// WAV writer: 32-bit float PCM (format 3), 48 kHz. Channels are mono Float32Arrays of equal length.
import { writeFileSync } from 'node:fs';
import { SR } from './synth.ts';

export function writeWav(path: string, channels: Float32Array[]) {
  const nc = channels.length, n = channels[0].length, bytes = n * nc * 4;
  const b = Buffer.alloc(44 + bytes);
  b.write('RIFF', 0); b.writeUInt32LE(36 + bytes, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(3, 20); b.writeUInt16LE(nc, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * nc * 4, 28); b.writeUInt16LE(nc * 4, 32); b.writeUInt16LE(32, 34);
  b.write('data', 36); b.writeUInt32LE(bytes, 40);
  for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < nc; c++, o += 4) b.writeFloatLE(channels[c][i], o);
  writeFileSync(path, b);
}

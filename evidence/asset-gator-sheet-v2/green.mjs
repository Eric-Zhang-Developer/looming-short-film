// mean RGB of opaque green-dominant pixels (g > r+15, g > b+15): a rough check of the body green against #6F8F5E
import { execFileSync } from 'node:child_process';
for (const f of process.argv.slice(2)) {
  const px = execFileSync('ffmpeg', ['-v','error','-i', f,'-f','rawvideo','-pix_fmt','rgba','-'], { maxBuffer: 1 << 28 });
  let n = 0, r = 0, g = 0, b = 0;
  for (let i = 0; i < px.length; i += 4) if (px[i+3] > 250 && px[i+1] > px[i] + 15 && px[i+1] > px[i+2] + 15) { n++; r += px[i]; g += px[i+1]; b += px[i+2]; }
  const h = v => Math.round(v / n).toString(16).padStart(2, '0');
  console.log(`${f.replace(/.*\//, '')}: mean green #${h(r)}${h(g)}${h(b)} over ${n} px`);
}

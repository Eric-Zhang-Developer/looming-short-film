// leg share of standing height: the hoodie hem is the lowest cream row in the legs' column band (0.45-0.75 of the box width)
import { execFileSync } from 'node:child_process';
for (const [f, x0, y0, w, h] of JSON.parse(process.argv[2])) {
  const [{ width: W }] = JSON.parse(execFileSync('ffprobe', ['-v','error','-show_entries','stream=width','-of','json', f], { encoding: 'utf8' })).streams;
  const px = execFileSync('ffmpeg', ['-v','error','-i', f,'-f','rawvideo','-pix_fmt','rgba','-'], { maxBuffer: 1 << 28 });
  let hem = -1, sole = -1;
  for (let y = y0; y < y0 + h; y++) { let cream = 0, any = 0;
    for (let x = x0 + Math.round(0.45 * w); x < x0 + Math.round(0.75 * w); x++) { const i = (y * W + x) * 4;
      if (px[i + 3] < 128) continue; any++; if (px[i] > 200 && px[i + 1] > 185 && px[i + 2] > 150) cream++; }
    if (cream > 5) hem = y; if (any) sole = y; }
  console.log(`${f}: hem y ${hem}, sole y ${sole}, top y ${y0}: legs ${(sole - hem)} px of ${sole - y0 + 1} = ${((sole - hem) / (sole - y0 + 1) * 100).toFixed(1)}%`);
}

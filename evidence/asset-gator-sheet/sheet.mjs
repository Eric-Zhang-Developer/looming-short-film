#!/usr/bin/env node
// Lays PNG tiles out in rows with captions under them (drawn here on the evidence image, never in the painting)
// and saves a JPEG through headless Chrome (ffmpeg here has no drawtext).
//   node sheet.mjs <layout.json> <out.jpg>
// layout: { bg: ['#808080', ...] one band per colour, height: px per tile, rows: [[{ src, crop?: [x,y,w,h], label }]] }
import { readFileSync, writeFileSync } from 'node:fs';
import { launch } from '../../tools/lib/page.mjs';

const [layoutFile, out] = process.argv.slice(2);
const L = JSON.parse(readFileSync(layoutFile, 'utf8'));
const data = f => `data:image/png;base64,${readFileSync(f).toString('base64')}`;
const rows = L.rows.map(r => r.map(t => ({ ...t, src: data(t.src) })));

const browser = await launch();
const page = await browser.newPage();
await page.setContent('<body style="margin:0"><canvas id=c></canvas></body>');
const jpeg = await page.evaluate(async ({ rows, bg, height, quality }) => {
  const img = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
  const G = 30, CAP = 34, tiles = [];
  for (const r of rows) for (const t of r) tiles.push(t);
  for (const t of tiles) {
    t.img = await img(t.src);
    t.crop ??= [0, 0, t.img.width, t.img.height];
    t.h = t.height ?? height; t.w = Math.round(t.crop[2] * t.h / t.crop[3]);
  }
  const rowW = rows.map(r => r.reduce((a, t) => a + t.w + G, G)), rowH = rows.map(r => Math.max(...r.map(t => t.h)) + CAP + G);
  const bandH = rowH.reduce((a, b) => a + b, G), W = Math.max(...rowW);
  const c = document.getElementById('c'); c.width = W; c.height = bandH * bg.length;
  const g = c.getContext('2d');
  bg.forEach((col, b) => {
    g.fillStyle = col; g.fillRect(0, b * bandH, W, bandH);
    let y = b * bandH + G;
    rows.forEach((r, ri) => {
      let x = G;
      for (const t of r) {
        g.drawImage(t.img, ...t.crop, x, y + rowH[ri] - CAP - G - t.h, t.w, t.h);
        g.fillStyle = '#ffffff'; g.font = '22px Helvetica, Arial, sans-serif'; g.textAlign = 'center';
        g.fillText(t.label ?? '', x + t.w / 2, y + rowH[ri] - G - 6);
        x += t.w + G;
      }
      y += rowH[ri];
    });
  });
  return c.toDataURL('image/jpeg', quality);
}, { rows, bg: L.bg, height: L.height, quality: L.quality ?? 0.85 });
await browser.close();
writeFileSync(out, Buffer.from(jpeg.split(',')[1], 'base64'));
console.log(`${out}: ${(readFileSync(out).length / 1e6).toFixed(2)} MB`);

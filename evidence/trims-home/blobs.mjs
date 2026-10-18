// node evidence/trims-home/blobs.mjs → evidence/trims-home/blob_sizes.txt (one headless Chrome, closed at the end)
import fs from 'node:fs';
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const BEATS = {
  s02: [['before the bead', 4.0], ['bead 4.5', 4.5], ['inkDropForms 5.0', 5.0], ['perched 6.5', 6.5], ['landed, swelling 8.0', 8.0], ['1x 8.5', 8.5], ['at B 9.9', 9.9]],
  s03: [['start', 0.5], ['laptopUp 1.0', 1.0], ['before the swallow 4.33', 4.33], ['gulp1 4.5', 4.5], ['settled 5.5', 5.5], ['hold 6.9', 6.9]],
  s04: [['fridge 0.5', 0.5], ['scoot 1 (2.5)', 2.5], ['scoot 2 (5.5)', 5.5], ['end 6.9', 6.9]],
  s05: [['gameNight 1.0', 1.0], ['walk-through 4.5', 4.5], ['end 6.9', 6.9]],
  s06: [['start 0.25', 0.25], ['lamp on 1.5', 1.5], ['lamp off 3.0', 3.0], ['pre-gulp 3.8', 3.8], ['gulp2 4.0', 4.0], ['settled 5.0', 5.0], ['end 7.9', 7.9]],
  s18: [['start 1.0', 1.0], ['examCrossedOff 2.0', 2.0], ['dot 2.5', 2.5], ['absorbed 5.6', 5.6]],
};
const { server, base } = await serve(), browser = await launch();
const page = await openPage(browser, base, 'evidence/trims-home/blobs.html');
page.on('response', (r) => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); });
const lines = ['trims-home blob sizes, read from the live shot objects (r = created radius × mesh scale; units = S · r / 0.012).',
  'README §1 ladder (v4 per the brief): s02 1x (0.012) · s03 1 → 1.5x (0.018) · s04/s05 1.5x · s06 1.5x → 2x (0.024) · s18 0.004 → dot 0.0015', ''];
for (const [id, rows] of Object.entries(BEATS)) {
  try { lines.push(...await page.evaluate((id, rows) => window.measure(id, rows), id, rows), ''); }
  catch (e) { lines.push(`${id}  FAILED: ${e.message}`, ''); }
}
fs.writeFileSync('evidence/trims-home/blob_sizes.txt', lines.join('\n'));
console.log(lines.join('\n'));
await browser.close(); server.close();

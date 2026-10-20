// node evidence/v7-laptop/shadows.mjs <out.txt>: one headless Chrome, closed at the end. Film times 21, 24, 35, 45
// (s03 2.0 and 5.0, s05 2.0, s06 5.0); 12 is s02's calendar insert, lit by the window, with no screen key to measure.
import fs from 'node:fs';
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const ROWS = { s03: [['film 21 (s03 2.0)', 2.0], ['film 24 (s03 5.0)', 5.0]], s05: [['film 35 (s05 2.0)', 2.0]], s06: [['film 45 (s06 5.0)', 5.0]] };
const { server, base } = await serve(), browser = await launch();
const page = await openPage(browser, base, 'evidence/v7-laptop/shadows.html');
page.on('response', (r) => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); });
const lines = [];
for (const [id, rows] of Object.entries(ROWS)) {
  try { lines.push(...await page.evaluate((id, rows) => window.measure(id, rows), id, rows)); }
  catch (e) { lines.push(`${id}  FAILED: ${e.message}`); }
}
fs.writeFileSync(process.argv[2], lines.join('\n') + '\n');
console.log(lines.join('\n'));
await browser.close(); server.close();

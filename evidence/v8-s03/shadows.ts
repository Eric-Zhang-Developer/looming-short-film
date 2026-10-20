// node evidence/v8-s03/shadows.ts <out.txt> <t,t,...>: s03's blob wall shadow at shot-local times, one headless Chrome,
// closed at the end. v7-laptop's measure (evidence/v7-laptop/shadows.mjs), run on the compiled build/ of whatever s03.ts
// is checked out: v7's at 2.0 and 5.0 (its pre- and post-gulp times), v8's at 3.0 and 8.0.
import fs from 'node:fs';
import { serve, launch, openPage } from '../../tools/lib/page.ts';

declare global { interface Window { measure: (id: string, rows: [string, number][]) => Promise<string[]> } }
const ts = process.argv[3].split(',').map(Number);
const { server, base } = await serve(), browser = await launch();
const page = await openPage(browser, base, 'evidence/v8-s03/shadows.html');
const lines = await page.evaluate((rows: [string, number][]) => window.measure('s03', rows), ts.map((t): [string, number] => [`local ${t.toFixed(2)}`, t]));
fs.writeFileSync(process.argv[2], lines.join('\n') + '\n');
console.log(lines.join('\n'));
await browser.close(); server.close();

// node evidence/climax-a1/measure.mjs 5,9   → runs measure(t) on measure.html (one headless Chrome, closed after), prints JSON
import { args, serve, launch, openPage } from '../../tools/lib/page.mjs';
const ts = String(process.argv[2] || '9').split(',').map(Number);
const { server, base } = await serve(), browser = await launch();
try {
  const page = await openPage(browser, base, 'evidence/climax-a1/measure.html');
  for (const t of ts) for (const fov of [undefined, 50]) console.log(JSON.stringify(await page.evaluate((t, fov) => window.measure(t, { fov }), t, fov)));
} finally { await browser.close(); server.close(); }

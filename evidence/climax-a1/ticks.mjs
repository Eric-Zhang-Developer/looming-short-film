// node evidence/climax-a1/ticks.mjs → the second hand's angle on every 24 fps frame of s08 0.0–2.125 (clock 3:00:00 + t)
import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve(), browser = await launch();
try {
  const page = await openPage(browser, base, 'evidence/climax-a1/clock.html');
  for (let f = 0; f <= 51; f++) console.log(`frame ${String(f).padStart(2)}  t ${(f / 24).toFixed(3)}  second hand ${await page.evaluate((s) => window.secDeg(s), f / 24)} deg`);
} finally { await browser.close(); server.close(); }

import { serve, launch, openPage } from '../../tools/lib/page.mjs';
const { server, base } = await serve(), browser = await launch();
const page = await openPage(browser, base, 'evidence/v7-laptop/hands.html');
for (const [id, ts] of [['s03', [1.0, 2.0, 2.33]], ['s06', [4.0, 5.0]]]) console.log((await page.evaluate((id, ts) => window.measure(id, ts, -30), id, ts)).join('\n'));
await browser.close(); server.close();

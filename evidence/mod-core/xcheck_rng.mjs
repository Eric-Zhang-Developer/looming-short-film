// Cross-check: original 1776 rng.ts vs this port on the same inputs. node evidence/mod-core/xcheck_rng.mjs <orig.ts> <port.js>
const O = await import(process.argv[2]), P = await import(process.argv[3]);
const ns = [0, 1, 7, 42, -1, 123456789, 0.5, 2 ** 31];
for (const [name, m] of [['orig', O], ['port', P]]) {
  const r = m.mulberry32(42), s = m.mulberry32(0);
  console.log(name, JSON.stringify({ hash: ns.map(m.hash), hash2: [m.hash2(1, 2), m.hash2(3, 7), m.hash2(-5, 0.25)], m42: [r(), r(), r()], m0: [s(), s()] }));
}

import { readFileSync } from 'node:fs';
const rd = (p) => { const b = readFileSync(p); return new Float32Array((b.length - 44) / 8).map((_, i) => b.readFloatLE(44 + i * 8)); };
const dir = process.argv[2];
const m = rd(`${dir}/stems/music.wav`), f = rd(`${dir}/stems/foley.wav`);
const SR = 48000, db = (x) => (20 * Math.log10(x)).toFixed(1);
const secs = [[0,20,'birth'],[20,60,'avoid'],[60,78,'marston'],[78,88,'quiet1'],[88,100,'reveal'],[100,135,'first'],[135,160,'quiet2'],[160,180,'button']];
for (const [a,b,n] of secs) { let pk=0, ss=0; for (let i=a*SR;i<b*SR;i++){pk=Math.max(pk,Math.abs(m[i]));ss+=m[i]*m[i];} console.log(n.padEnd(8), 'music peak', db(pk), 'rms', db(Math.sqrt(ss/((b-a)*SR)))); }
let fp=0; for (const v of f) fp=Math.max(fp,Math.abs(v)); console.log('foley peak', db(fp));
for (const t of [36.5,39,100.5,108,110,164]) { let pk=0; for (let i=(t-0.3)*SR;i<(t+0.3)*SR;i++) pk=Math.max(pk,Math.abs(m[Math.round(i)])); console.log('music peak ±0.3s around', t, db(pk)); }

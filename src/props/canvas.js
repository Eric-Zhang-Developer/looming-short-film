// @ts-check
// The Canvas Student screens (brief v6-canvas-a), drawn in code on a 2D canvas → a self-lit screen texture. Light mode,
// after the director's reference layout: status bar, a plain header (hamburger, title, filter; no school logo, no Canvas
// wordmark), the To-do list grouped by day, the floating tab bar. Crisp screen type; the paper boil stays on the phone.
// Red marks the exam (doc 03): the exam row's marker and the To-do badge are calendarRed.
//
//   const scr = todoScreen({ aspect })          aspect = the screen's height / width (default an iPhone's 844/390)
//   scr.set(t, { banner, swipe, open, marker, clock })  redraws when anything changed; scr.texture, scr.canvas, scr.H
//   const b = banner({ body: COUNTDOWN.s03 })   → { texture, canvas, w, h }  (a flat card, also usable on its own)
//   set's banner: b drawn at the top of the screen; swipe 0..1 slides it off to the right, open 0..1 expands it into
//   the exam's detail view. marker 0..1 brings up the exam row's red marker (1 = fully up). clock: status-bar time
//   ('1:45'); omitted → no time drawn.
//   uiPoint(scr, x, y) → [u, v] in 0..1 of the texture (v from the bottom), for aiming a camera at a row.
import * as THREE from 'three';
import { PALETTE } from '../core/palette.js';

// Countdown bodies: hours to the exam at 9:00 the next morning, from each shot's clock (docs/02-story.md, "The clock"),
// to the nearest hour. s03 follows s02 (9:00) in one continuous morning → 24; s07 1:45 → 7 h 15 → 7; s09a 3:00:10 →
// 5 h 59 → 6. s06 has no clock (night, between game night and 1:45): 11 p.m. is an assumption → 10, flagged in
// done/v6-canvas-a.md. s00 (pre-dawn, no clock) names the time instead of counting.
export const COUNTDOWN = {
  s00: 'Tomorrow 9:00 AM',
  s03: 'Starts in 24 hours',
  s06: 'Starts in 10 hours',
  s07: 'Starts in 7 hours',
  s09a: 'Starts in 6 hours',
};

const W = 390, S = 2;                              // layout in iPhone points; canvas px per point
const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const C = { bg: '#FFFFFF', head: '#F5F5F6', ink: '#2D3B45', grey: '#6B7780', line: '#E2E5E8', orange: '#E8670C', red: PALETTE.calendarRed };
const font = (pt, weight = 400) => `${weight} ${pt}px ${SANS}`;

export const ROWS = [
  { day: 'Thu', icon: 'quiz', course: 'MAC2312', title: 'Quiz 8', due: '11:59 PM' },
  { icon: 'page', course: 'MAC2312', title: 'WebAssign 9.3', due: '11:59 PM' },
  { icon: 'page', course: 'CHM2045', title: 'Lab Report 6', due: '11:59 PM' },
  { day: 'Fri', icon: 'exam', course: 'MAC2312', title: 'Calc 2 Exam', due: 'Tomorrow 9:00 AM', exam: true },
];
const TOP = 112, ROW = 92;                        // first row's top, row height (points)
export const EXAM_Y = TOP + ROW * ROWS.findIndex((r) => r.exam) + ROW / 2;   // the exam row's centre (points)

const canvasOf = (w, h) => Object.assign(document.createElement('canvas'), { width: Math.round(w * S), height: Math.round(h * S) });
const textureOf = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
/** @param {CanvasRenderingContext2D} g */
const rrect = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
/** @param {CanvasRenderingContext2D} g */
function text(g, s, x, y, pt, color, weight = 400, align = /** @type {CanvasTextAlign} */ ('left')) {
  g.font = font(pt, weight); g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y);
}
/** @param {CanvasRenderingContext2D} g @param {string} kind */
function icon(g, kind, x, y, color) {            // a 22 pt line icon centred on (x, y)
  g.save(); g.translate(x, y); g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 1.8; g.lineJoin = g.lineCap = 'round';
  if (kind === 'quiz') {                          // a rocket
    g.beginPath(); g.moveTo(0, -10); g.quadraticCurveTo(6, -4, 4, 6); g.lineTo(-4, 6); g.quadraticCurveTo(-6, -4, 0, -10); g.stroke();
    g.beginPath(); g.moveTo(-4, 2); g.lineTo(-8, 8); g.lineTo(-4, 6); g.moveTo(4, 2); g.lineTo(8, 8); g.lineTo(4, 6); g.stroke();
    g.beginPath(); g.arc(0, -2, 1.8, 0, 7); g.stroke();
  } else if (kind === 'page') {                   // a pencil on a page
    rrect(g, -8, -10, 14, 19, 2); g.stroke();
    g.beginPath(); g.moveTo(-4, -4); g.lineTo(2, -4); g.moveTo(-4, 0); g.lineTo(0, 0); g.stroke();
    g.beginPath(); g.moveTo(9, -7); g.lineTo(1, 6); g.lineTo(0, 10); g.lineTo(3, 7); g.lineTo(11, -6); g.closePath(); g.stroke();
  } else {                                        // the exam: a calendar page with a filled dot
    rrect(g, -9, -8, 18, 17, 3); g.stroke();
    g.beginPath(); g.moveTo(-9, -3); g.lineTo(9, -3); g.moveTo(-4, -11); g.lineTo(-4, -6); g.moveTo(4, -11); g.lineTo(4, -6); g.stroke();
    g.beginPath(); g.arc(0, 3, 3, 0, 7); g.fill();
  }
  g.restore();
}
/** @param {CanvasRenderingContext2D} g */
function checkbox(g, x, y, color) { g.strokeStyle = color; g.lineWidth = 2; rrect(g, x - 12, y - 12, 24, 24, 6); g.stroke(); }

/** The app glyph: an orange square with a cream page on it (not Canvas's logo). @param {CanvasRenderingContext2D} g */
function glyph(g, x, y, s) {
  g.fillStyle = C.orange; rrect(g, x, y, s, s, s * 0.24); g.fill();
  g.fillStyle = PALETTE.cream; rrect(g, x + s * 0.26, y + s * 0.2, s * 0.48, s * 0.6, s * 0.06); g.fill();
  g.fillStyle = C.orange; for (const k of [0.38, 0.52, 0.66]) g.fillRect(x + s * 0.34, y + s * k, s * (k > 0.6 ? 0.2 : 0.32), s * 0.05);
}

const BW = 362, BH = 82;                          // the banner card (points)
/** An iOS-style notification card, light. @param {{ body: string, title?: string }} o */
export function banner({ body, title = 'Calc 2 Exam' }) {
  const canvas = canvasOf(BW, BH), g = canvas.getContext('2d');
  g.scale(S, S);
  drawBanner(g, 0, 0, title, body);
  return { texture: textureOf(canvas), canvas, w: BW, h: BH, title, body };
}
/** @param {CanvasRenderingContext2D} g */
function drawBanner(g, x, y, title, body, shadow = false) {
  g.save();
  if (shadow) { g.shadowColor = 'rgba(0,0,0,0.18)'; g.shadowBlur = 14; g.shadowOffsetY = 4; }
  g.fillStyle = '#F4F4F6'; rrect(g, x, y, BW, BH, 22); g.fill();
  g.restore();
  glyph(g, x + 14, y + 20, 40);
  text(g, 'Canvas', x + 66, y + 24, 13, C.grey, 500);
  text(g, 'now', x + BW - 16, y + 24, 13, C.grey, 400, 'right');
  text(g, title, x + 66, y + 47, 17, '#1C1C1E', 600);
  text(g, body, x + 66, y + 69, 16, '#1C1C1E');
}

/** The exam's detail view (what the banner opens into), in a w × h box at the origin. @param {CanvasRenderingContext2D} g */
function drawDetail(g, w, h) {
  g.fillStyle = C.bg; g.fillRect(0, 0, w, h);
  g.fillStyle = C.head; g.fillRect(0, 0, w, 104);
  g.strokeStyle = C.ink; g.lineWidth = 2.4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(30, 66); g.lineTo(22, 76); g.lineTo(30, 86); g.stroke();   // back chevron
  text(g, 'Details', w / 2, 82, 17, C.ink, 600, 'center');
  g.fillStyle = C.red; g.fillRect(20, 132, 4, 22);
  text(g, 'MAC2312', 32, 149, 15, C.grey, 500);
  text(g, 'Calc 2 Exam', 20, 196, 32, C.ink, 700);
  g.fillStyle = C.red; rrect(g, 20, 216, 64, 26, 13); g.fill();
  text(g, 'EXAM', 52, 234, 13, '#FFFFFF', 700, 'center');
  text(g, 'Tomorrow 9:00 AM', 96, 235, 17, C.red, 600);
  g.fillStyle = C.line; g.fillRect(20, 266, w - 40, 1);
  g.fillStyle = '#EDEFF1'; for (let i = 0; i < 6; i++) { rrect(g, 20, 292 + i * 26, (w - 40) * [1, 0.92, 0.97, 0.6, 0.88, 0.4][i], 10, 5); g.fill(); }
}

/** The To-do screen. @param {{ aspect?: number }} [o] */
export function todoScreen({ aspect = 844 / 390 } = {}) {
  const H = Math.round(W * aspect), canvas = canvasOf(W, H), g = canvas.getContext('2d'), texture = textureOf(canvas);
  let last = '';
  /** @param {number} t @param {{ banner?: { title: string, body: string } | null, swipe?: number, open?: number, marker?: number, clock?: string }} [o] */
  const set = (t, { banner: b = null, swipe = 0, open = 0, marker = 1, clock = '' } = {}) => {
    const key = JSON.stringify([b && [b.title, b.body], swipe, open, marker, clock]);   // t alone never changes the screen
    if (key === last) return;
    last = key;
    g.setTransform(S, 0, 0, S, 0, 0);
    g.clearRect(0, 0, W, H);
    g.save(); rrect(g, 0, 0, W, H, 44); g.clip();
    list(g, H, marker, clock);
    if (b && open < 1) {                          // the banner, sliding off right as it's swiped
      const k = swipe * swipe * (3 - 2 * swipe);
      g.save(); g.globalAlpha = 1 - open; drawBanner(g, 14 + k * (W + 20), 52, b.title, b.body, true); g.restore();
    }
    if (b && open > 0) {                          // it expands from the banner's rect to the whole screen
      const k = open * open * (3 - 2 * open), x = 14 * (1 - k), y = 52 * (1 - k), w = BW + (W - BW) * k, h = BH + (H - BH) * k;
      g.save(); rrect(g, x, y, w, h, 22 * (1 - k)); g.clip(); g.translate(x, y);
      g.globalAlpha = Math.min(1, open * 3); drawDetail(g, W, H); g.restore();
    }
    g.restore();
    texture.needsUpdate = true;
  };
  set(0);
  return { texture, canvas, H, set };
}

/** @param {CanvasRenderingContext2D} g */
function list(g, H, marker, clock) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  // Status bar and header.
  g.fillStyle = C.head; g.fillRect(0, 0, W, 104);
  if (clock) text(g, clock, 46, 33, 17, '#000', 600, 'center');
  g.fillStyle = '#000'; for (let i = 0; i < 4; i++) g.fillRect(292 + i * 6, 31 - 4 - i * 2.5, 4, 4 + i * 2.5);   // signal
  g.strokeStyle = '#000'; g.lineWidth = 1.2; rrect(g, 322, 21, 25, 12, 3.5); g.stroke(); g.fillRect(324, 23, 17, 8); g.fillRect(348, 25, 1.6, 4);
  for (const x of [38, W - 38]) { g.fillStyle = '#E9EAEC'; g.beginPath(); g.arc(x, 76, 19, 0, 7); g.fill(); }
  g.strokeStyle = C.ink; g.lineWidth = 2; g.lineCap = 'round';
  g.beginPath(); for (const dy of [-6, 0, 6]) { g.moveTo(29, 76 + dy); g.lineTo(47, 76 + dy); } g.stroke();          // hamburger
  g.beginPath(); g.moveTo(W - 48, 69); g.lineTo(W - 28, 69); g.lineTo(W - 36, 78); g.lineTo(W - 36, 85); g.lineTo(W - 40, 83); g.lineTo(W - 40, 78); g.closePath(); g.stroke();   // filter
  text(g, 'To Do', W / 2, 83, 18, C.ink, 600, 'center');
  g.fillStyle = C.line; g.fillRect(0, 104, W, 1);
  // Rows: day column, icon, | COURSE, title, due, checkbox.
  ROWS.forEach((r, i) => {
    const y = TOP + i * ROW, red = r.exam && marker > 0;
    if (r.day) text(g, r.day, 32, y + 34, 15, C.ink, 600, 'center');
    if (red) {                                    // the exam marker: a red band down the row's left and a red due line
      g.save(); g.globalAlpha = marker; g.fillStyle = C.red;
      g.fillRect(60, y + 8, 5 * marker, ROW - 16); g.globalAlpha = marker * 0.08; g.fillRect(60, y + 4, W - 60, ROW - 8); g.restore();
    }
    icon(g, r.icon, 88, y + 28, red ? C.red : r.course === 'MAC2312' ? C.orange : '#3D8E5A');
    g.fillStyle = red ? C.red : C.grey; g.fillRect(110, y + 18, 2, 15);
    text(g, r.course, 118, y + 31, 14, C.grey, 500);
    text(g, r.title, 110, y + 58, 21, C.ink, 600);
    text(g, r.due, 110, y + 80, 15, red ? C.red : C.grey, red ? 600 : 400);
    checkbox(g, W - 34, y + ROW / 2, C.orange);
    g.fillStyle = C.line; g.fillRect(r.day && i ? 0 : 60, y, W - (r.day && i ? 0 : 60), 1);
  });
  // The floating tab bar.
  const ty = H - 92;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.14)'; g.shadowBlur = 16; g.shadowOffsetY = 3;
  g.fillStyle = '#FFFFFF'; rrect(g, 12, ty, W - 24, 64, 32); g.fill(); g.restore();
  const tabs = ['Dashboard', 'Calendar', 'To Do', 'Notifications', 'Inbox'];
  tabs.forEach((s, i) => {
    const x = 12 + (W - 24) * (i + 0.5) / tabs.length, on = i === 2, col = on ? C.orange : C.grey;
    g.strokeStyle = col; g.lineWidth = 1.8;
    if (i === 0) { rrect(g, x - 9, ty + 14, 8, 8, 1.5); g.stroke(); rrect(g, x + 1, ty + 14, 8, 8, 1.5); g.stroke(); rrect(g, x - 9, ty + 24, 18, 6, 1.5); g.stroke(); }
    else if (i === 1) { rrect(g, x - 9, ty + 14, 18, 17, 3); g.stroke(); g.beginPath(); g.moveTo(x - 9, ty + 19); g.lineTo(x + 9, ty + 19); g.stroke(); }
    else if (i === 2) { g.beginPath(); for (const dy of [16, 22, 28]) { g.moveTo(x - 4, ty + dy); g.lineTo(x + 9, ty + dy); } g.stroke(); g.fillStyle = col; for (const dy of [16, 22, 28]) g.fillRect(x - 9, ty + dy - 1.3, 2.6, 2.6); }
    else if (i === 3) { g.beginPath(); g.moveTo(x - 7, ty + 28); g.quadraticCurveTo(x - 7, ty + 12, x, ty + 12); g.quadraticCurveTo(x + 7, ty + 12, x + 7, ty + 28); g.closePath(); g.stroke(); }
    else { rrect(g, x - 10, ty + 15, 20, 15, 2); g.stroke(); g.beginPath(); g.moveTo(x - 10, ty + 16); g.lineTo(x, ty + 23); g.lineTo(x + 10, ty + 16); g.stroke(); }
    text(g, s, x, ty + 48, 10, col, on ? 600 : 400, 'center');
    if (on) { g.fillStyle = C.red; g.beginPath(); g.arc(x + 12, ty + 12, 8, 0, 7); g.fill(); text(g, String(ROWS.length), x + 12, ty + 16, 11, '#FFFFFF', 700, 'center'); }
  });
}

/** A point on the screen in UI points → [u, v] in 0..1 of the texture (v from the bottom, as three's uv). */
export const uiPoint = (scr, x, y) => [x / W, 1 - y / scr.H];

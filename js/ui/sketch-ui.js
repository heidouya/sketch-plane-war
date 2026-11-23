/**
 * 把 DOM 里的按钮 / 卡片 / 面板用 rough.js 画一层手绘边框，
 * 生成 PNG 作为 background-image。尺寸变化时自动重画。
 */
import { draw, paint, INK } from '../art/sketch.js';

const cache = new Map();
const MAX_CACHE = 48;
const observed = new WeakSet();

function roundedPath(w, h, r) {
  const rr = Math.max(2, Math.min(r, h / 2, w / 2));
  return [
    `M ${rr} 0`,
    `L ${w - rr} 0`,
    `Q ${w} 0 ${w} ${rr}`,
    `L ${w} ${h - rr}`,
    `Q ${w} ${h} ${w - rr} ${h}`,
    `L ${rr} ${h}`,
    `Q 0 ${h} 0 ${h - rr}`,
    `L 0 ${rr}`,
    `Q 0 0 ${rr} 0`,
    'Z',
  ].join(' ');
}

function makeImage(kind, w, h) {
  const scale = Math.min(2, 1600 / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const inset = 4;
  const pw = w - inset * 2;
  const ph = h - inset * 2;
  if (pw <= 4 || ph <= 4) return canvas.toDataURL('image/png');

  const radius = kind === 'panel' ? Math.min(20, ph / 2.4) : ph / 2;
  const path = roundedPath(pw, ph, radius);
  const seed = 700 + ((w * 7 + h * 13) % 211);

  ctx.save();
  ctx.translate(inset, inset);

  // 底色：让文字压在纸上而不是压在云上
  paint(ctx, draw.path(path, {
    seed,
    roughness: 1.35,
    strokeWidth: 0,
    fill: kind === 'panel' ? 'rgba(247,243,233,0.98)' : 'rgba(247,243,233,0.96)',
    fillStyle: 'solid',
  }));

  // 主轮廓
  paint(ctx, draw.path(path, {
    seed: seed + 1,
    roughness: 1.55,
    strokeWidth: kind === 'panel' ? 1.5 : 1.45,
    stroke: INK,
  }));

  // 内侧第二道浅线，模仿描两遍的手感
  paint(ctx, draw.path(roundedPath(pw - 6, ph - 6, Math.max(4, radius - 3)), {
    seed: seed + 7,
    roughness: 1.7,
    strokeWidth: 0.7,
    stroke: 'rgba(58,56,51,0.28)',
  }));

  ctx.restore();
  return canvas.toDataURL('image/png');
}

function imageFor(kind, w, h) {
  const key = `${kind}:${w}x${h}`;
  let url = cache.get(key);
  if (!url) {
    url = makeImage(kind, w, h);
    if (cache.size > MAX_CACHE) cache.clear();
    cache.set(key, url);
  }
  return url;
}

function refresh(el) {
  const rect = el.getBoundingClientRect();
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);
  if (w < 16 || h < 14) return;
  if (w * h > 2_600_000) return;

  const kind = el.classList.contains('panel') ? 'panel' : 'capsule';
  const url = imageFor(kind, w, h);
  if (el.dataset.sketchUrl === url) return;

  el.dataset.sketchUrl = url;
  el.style.backgroundImage = `url("${url}")`;
  el.style.backgroundSize = '100% 100%';
  el.style.backgroundRepeat = 'no-repeat';
  el.classList.add('is-sketched');
}

function attach(el) {
  const kind = el.classList.contains('panel') ? 'panel' : 'capsule';
  el.dataset.sketchKind = kind;
  if (observed.has(el)) {
    refresh(el);
    return;
  }
  observed.add(el);
  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(() => refresh(el));
    ro.observe(el);
  }
  refresh(el);
}

export function sketchify(root = document) {
  if (!root || typeof root.querySelectorAll !== 'function') return;
  const list = root.querySelectorAll('.btn, .hud-btn, .level-card, .panel');
  list.forEach(attach);
}

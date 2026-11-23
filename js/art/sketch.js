/**
 * 手绘渲染基座
 * ---------------------------------------------------------------
 * 用 rough.js 的 generator 生成"抖动路径"，再到 Path2D 上描边，
 * 这样同一条路径既能一次性预渲染成精灵，也能随时按任意尺寸重绘。
 * 所有精灵都在这里缓存，运行时只做 drawImage。
 */
import rough from '../vendor/rough.esm.js';

export const INK = '#3a3833';
export const INK_SOFT = '#8a8478';
export const INK_FAINT = '#b9b2a2';
export const PAPER = '#f5f1e6';
export const PAPER_WARM = '#efe9d9';
export const PAPER_SHADE = '#cfc6b2';

const BASE = {
  roughness: 1.5,
  bowing: 1.05,
  stroke: INK,
  strokeWidth: 1.1,
  disableMultiStroke: false,
};

export const gen = rough.generator();

const withBase = (o) => ({ ...BASE, ...o });

/** 常用手绘图形，参数为逻辑坐标 */
export const draw = {
  line: (x1, y1, x2, y2, o) => gen.line(x1, y1, x2, y2, withBase(o)),
  poly: (points, o) => gen.polygon(points, withBase(o)),
  rect: (x, y, w, h, o) => gen.rectangle(x, y, w, h, withBase(o)),
  ellipse: (cx, cy, w, h, o) => gen.ellipse(cx, cy, w, h, withBase(o)),
  circle: (cx, cy, d, o) => gen.circle(cx, cy, d, withBase(o)),
  path: (d, o) => gen.path(d, withBase(o)),
  curve: (points, o) => gen.curve(points, withBase(o)),
  arc: (cx, cy, w, h, a0, a1, closed, o) =>
    gen.arc(cx, cy, w, h, a0, a1, closed, withBase(o)),
};

/** 铅笔排线填充参数：浅灰细斜线，用来交代体积 */
export function hatch(extra = {}) {
  return {
    fill: PAPER_SHADE,
    fillStyle: 'hachure',
    hachureGap: 6,
    hachureAngle: -52,
    fillWeight: 0.55,
    ...extra,
  };
}

/**
 * 把一个 rough drawable 画到 2D 上下文。
 * rough 的 toPaths 会输出 {d, stroke, strokeWidth, fill}，
 * 其中 fillSketch（排线）的 fill 字段为空、stroke 才是排线颜色。
 */
export function paint(ctx, drawable, { alpha = 1 } = {}) {
  if (!drawable) return;
  const paths = gen.toPaths(drawable);
  ctx.save();
  if (alpha !== 1) ctx.globalAlpha *= alpha;
  for (const p of paths) {
    if (!p.d) continue;
    const path = new Path2D(p.d);
    if (p.fill && p.fill !== 'none') {
      ctx.fillStyle = p.fill;
      ctx.fill(path);
    }
    if (p.stroke && p.stroke !== 'none' && p.strokeWidth > 0) {
      ctx.strokeStyle = p.stroke;
      ctx.lineWidth = p.strokeWidth;
      ctx.stroke(path);
    }
  }
  ctx.restore();
}

/** 短横线阴影 / 手绘排线，直接按路径裁剪后画斜线 */
export function scribble(ctx, x, y, w, h, { gap = 7, angle = -0.9, color = INK_SOFT, alpha = 0.35 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const diag = Math.abs(w) + Math.abs(h);
  for (let i = -diag; i < diag; i += gap) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + Math.tan(angle) * h, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* 精灵工厂                                                           */
/* ------------------------------------------------------------------ */

const spriteCache = new Map();

/**
 * 生成并缓存一个精灵。
 * painter(ctx, w, h) 使用以中心为原点的坐标绘制。
 */
export function sprite(key, w, h, painter, { pad = 8, scale = 2 } = {}) {
  if (spriteCache.has(key)) return spriteCache.get(key);
  const cw = Math.ceil((w + pad * 2) * scale);
  const ch = Math.ceil((h + pad * 2) * scale);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, cw);
  canvas.height = Math.max(1, ch);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.translate(pad + w / 2, pad + h / 2);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  painter(ctx, w, h);
  const entry = Object.freeze({
    canvas,
    w: w + pad * 2,
    h: h + pad * 2,
    pad,
    scale,
  });
  spriteCache.set(key, entry);
  return entry;
}

/** 以 (x, y) 为中心绘制精灵 */
export function drawSprite(ctx, s, x, y, { scale = 1, rot = 0, alpha = 1 } = {}) {
  if (!s) return;
  const w = s.w * scale;
  const h = s.h * scale;
  ctx.save();
  if (alpha !== 1) ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.drawImage(s.canvas, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* 纸张质感                                                           */
/* ------------------------------------------------------------------ */

let grainPattern = null;

function buildGrain(ctx) {
  const size = 180;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d');
  const img = c.createImageData(size, size);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = Math.random();
    if (r < 0.16) {
      // 纸纤维：淡褐色斑点
      const a = 6 + Math.random() * 26;
      data[i] = 120;
      data[i + 1] = 105;
      data[i + 2] = 78;
      data[i + 3] = a;
    } else if (r < 0.24) {
      // 高光颗粒
      data[i] = 255;
      data[i + 1] = 252;
      data[i + 2] = 240;
      data[i + 3] = 10 + Math.random() * 22;
    }
  }
  c.putImageData(img, 0, 0);
  // 少量折痕
  c.strokeStyle = 'rgba(120,108,86,0.05)';
  c.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.moveTo(Math.random() * size, 0);
    c.lineTo(Math.random() * size, size);
    c.stroke();
  }
  return ctx.createPattern(cv, 'repeat');
}

/** 铺满整张纸底（背景层调用） */
export function paintPaper(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  if (!grainPattern) grainPattern = buildGrain(ctx);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = grainPattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** 生成仅供 DOM 使用的 dataURL（按钮描边、面板边框） */
export function drawableDataURL(w, h, painter, scale = 2) {
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(w * scale);
  cv.height = Math.ceil(h * scale);
  const ctx = cv.getContext('2d');
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  painter(ctx, w, h);
  return cv.toDataURL('image/png');
}

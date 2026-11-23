/**
 * 手绘特效：爆炸（墨点飞散 + 铅笔烟圈 + 扩散圆）、受击火花、炮口闪光。
 * 全部是轻量粒子，用池子式的数组管理，超过上限就丢弃最老的。
 */
import { drawSprite, INK, INK_SOFT } from './sketch.js';
import { FX_RING } from './sprites.js';
import { TAU, rand, clamp } from '../core/util.js';

const MAX_PARTS = 460;

export class Effects {
  constructor() {
    this.parts = [];
    this.rings = [];
    this.t = 0;
  }

  clear() {
    this.parts.length = 0;
    this.rings.length = 0;
  }

  push(p) {
    if (this.parts.length >= MAX_PARTS) this.parts.shift();
    this.parts.push(p);
  }

  /** 爆炸：scale 1 ≈ 小型敌机 */
  explosion(x, y, scale = 1) {
    this.rings.push({ x, y, life: 0, max: 0.55 + 0.1 * scale, scale, maxScale: 1.15 * scale });

    const dashes = 6 + Math.round(6 * scale);
    for (let i = 0; i < dashes; i++) {
      const a = rand(0, TAU);
      const sp = rand(90, 260) * scale;
      this.push({
        kind: 'dash',
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        len: rand(6, 14) * scale,
        rot: a,
        spin: rand(-6, 6),
        life: 0,
        max: rand(0.35, 0.7),
        w: rand(0.9, 1.8),
      });
    }

    const smoke = 3 + Math.round(3 * scale);
    for (let i = 0; i < smoke; i++) {
      this.push({
        kind: 'smoke',
        x: x + rand(-14, 14) * scale,
        y: y + rand(-14, 14) * scale,
        vx: rand(-14, 14),
        vy: rand(-26, 6) * scale,
        r: rand(10, 20) * scale,
        grow: rand(10, 26) * scale,
        life: 0,
        max: rand(0.6, 1.1),
        alpha: rand(0.28, 0.5),
      });
    }
  }

  /** 击中：小火花，反馈要短促 */
  hit(x, y) {
    for (let i = 0; i < 4; i++) {
      const a = rand(-0.9, 0.9) + Math.PI * 1.5;
      this.push({
        kind: 'dash',
        x, y,
        vx: Math.cos(a) * rand(60, 160),
        vy: Math.sin(a) * rand(60, 160),
        len: rand(4, 9),
        rot: a,
        spin: rand(-4, 4),
        life: 0,
        max: rand(0.18, 0.3),
        w: rand(0.8, 1.4),
      });
    }
  }

  /** 炮口：朝着飞行方向的小短线 */
  muzzle(x, y, dir = -1) {
    for (let i = 0; i < 2; i++) {
      this.push({
        kind: 'dash',
        x: x + rand(-2, 2),
        y,
        vx: rand(-12, 12),
        vy: dir * rand(40, 80),
        len: rand(4, 7),
        rot: dir < 0 ? -Math.PI / 2 : Math.PI / 2,
        spin: 0,
        life: 0,
        max: 0.12,
        w: 1,
      });
    }
  }

  /** 护盾碎掉的波纹 */
  ripple(x, y, scale = 1) {
    this.rings.push({ x, y, life: 0, max: 0.45, scale: 0.55 * scale, maxScale: 1.0 * scale });
  }

  update(dt) {
    this.t += dt;
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.life += dt;
      if (p.life >= p.max) {
        this.parts.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'dash') {
        p.vx *= 1 - dt * 3.6;
        p.vy *= 1 - dt * 3.6;
        p.rot += p.spin * dt;
      } else {
        p.vy += 16 * dt;
        p.r += p.grow * dt;
      }
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life += dt;
      if (r.life >= r.max) this.rings.splice(i, 1);
    }
  }

  draw(ctx) {
    // 先画烟，避免压住墨点
    for (const p of this.parts) {
      if (p.kind !== 'smoke') continue;
      const k = p.life / p.max;
      const a = (1 - k) * p.alpha;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.fillStyle = 'rgba(120,112,94,0.55)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.82, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK_SOFT;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha *= 0.6;
      ctx.stroke();
      ctx.restore();
    }

    // 墨点 / 短线
    for (const p of this.parts) {
      if (p.kind !== 'dash') continue;
      const k = p.life / p.max;
      const a = (1 - k) * 0.9;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.strokeStyle = INK;
      ctx.lineWidth = p.w;
      ctx.lineCap = 'round';
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.moveTo(-p.len / 2, 0);
      ctx.lineTo(p.len / 2, 0);
      ctx.stroke();
      ctx.restore();
    }

    // 扩散圆
    for (const r of this.rings) {
      const k = r.life / r.max;
      const s = (r.scale + (r.maxScale - r.scale) * Math.sqrt(k)) * 1.0;
      drawSprite(ctx, FX_RING, r.x, r.y, { scale: s, alpha: (1 - k) * 0.85, rot: r.x * 0.01 });
    }
  }
}

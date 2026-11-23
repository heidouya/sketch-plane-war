/**
 * 背景：纸底 + 手绘月亮 + 三层视差云。
 * 云会循环下落，主菜单和游戏中用不同速度。
 */
import { W, H } from '../core/config.js';
import { rand } from '../core/util.js';
import { drawSprite, draw, paint, paintPaper, INK_SOFT } from './sketch.js';
import { CLOUDS, MOON } from './sprites.js';

const LAYERS = [
  { speed: 11, alpha: 0.6, count: 4, idx: [2, 0], scale: [0.85, 1.2] },
  { speed: 23, alpha: 0.4, count: 5, idx: [0, 3], scale: [0.65, 1.05] },
  { speed: 42, alpha: 0.24, count: 5, idx: [2, 1], scale: [0.5, 0.8] },
];

export class Background {
  constructor() {
    this.t = 0;
    this.layers = LAYERS.map((cfg) => {
      const items = [];
      for (let i = 0; i < cfg.count; i++) {
        items.push({
          sprite: CLOUDS[cfg.idx[i % cfg.idx.length]],
          x: rand(-60, W + 60),
          y: rand(-H, H),
          scale: rand(cfg.scale[0], cfg.scale[1]),
          flip: Math.random() > 0.5,
        });
      }
      return { ...cfg, items };
    });
  }

  update(dt, speedScale = 1) {
    this.t += dt;
    for (const layer of this.layers) {
      for (const c of layer.items) {
        c.y += layer.speed * speedScale * dt;
        const margin = c.sprite.h * c.scale * 0.6;
        if (c.y > H + margin) {
          c.y = -margin - rand(30, 240);
          c.x = rand(-60, W + 60);
          c.scale = rand(layer.scale[0], layer.scale[1]);
        }
      }
    }
  }

  draw(ctx) {
    paintPaper(ctx, W, H);

    // 月亮：缓慢漂移，像手稿里那种带涂鸦的圆
    const moonX = W * 0.76 + Math.sin(this.t * 0.11) * 9;
    const moonY = 168 + Math.cos(this.t * 0.09) * 7;
    drawSprite(ctx, MOON, moonX, moonY, { scale: 0.92, alpha: 0.5, rot: Math.sin(this.t * 0.05) * 0.03 });

    for (const layer of this.layers) {
      for (const c of layer.items) {
        ctx.save();
        ctx.translate(c.x, c.y);
        if (c.flip) ctx.scale(-1, 1);
        drawSprite(ctx, c.sprite, 0, 0, { scale: c.scale, alpha: layer.alpha });
        ctx.restore();
      }
    }

    // 顶部与底部的淡淡压边，让画面透气
    const topFade = ctx.createLinearGradient(0, 0, 0, 90);
    topFade.addColorStop(0, 'rgba(90,82,64,0.10)');
    topFade.addColorStop(1, 'rgba(90,82,64,0)');
    ctx.fillStyle = topFade;
    ctx.fillRect(0, 0, W, 90);
  }

  /** 主菜单里再压一层手绘边框，模拟草稿本的装订线 */
  drawFrame(ctx) {
    ctx.save();
    paint(ctx, draw.line(18, 10, W - 18, 10, { seed: 601, strokeWidth: 0.9, stroke: INK_SOFT }), { alpha: 0.5 });
    paint(ctx, draw.line(18, H - 12, W - 18, H - 12, { seed: 603, strokeWidth: 0.9, stroke: INK_SOFT }), { alpha: 0.5 });
    ctx.restore();
  }
}

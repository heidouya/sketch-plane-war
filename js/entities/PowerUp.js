/**
 * 道具：火力升级、护盾、炸弹补给、加命。
 * 掉落时按权重随机，随分数略向"火力/护盾"倾斜。
 */
import { H } from '../core/config.js';
import { rand } from '../core/util.js';
import { drawSprite } from '../art/sketch.js';
import { POWERUPS } from '../art/sprites.js';

const POOL = [
  { type: 'power', weight: 30 },
  { type: 'shield', weight: 24 },
  { type: 'bomb', weight: 22 },
  { type: 'life', weight: 10 },
];

export function randomPowerType() {
  const total = POOL.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of POOL) {
    r -= p.weight;
    if (r <= 0) return p.type;
  }
  return 'power';
}

export class PowerUp {
  constructor(game) {
    this.game = game;
    this.dead = true;
  }

  init(type, x, y) {
    this.type = type;
    this.sprite = POWERUPS[type] || POWERUPS.power;
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.age = 0;
    this.life = 13;
    this.r = 18;
    this.dead = false;
    this.vy = rand(44, 62);
  }

  update(dt) {
    this.age += dt;
    this.life -= dt;
    this.y += this.vy * dt;
    this.x = this.baseX + Math.sin(this.age * 2.6) * 16;
    if (this.y > H + 30 || this.life <= 0) this.dead = true;
  }

  draw(ctx) {
    const bob = 1 + Math.sin(this.age * 5) * 0.04;
    // 接近消失时闪烁提醒
    const alpha = this.life < 2.5 ? 0.45 + Math.abs(Math.sin(this.age * 12)) * 0.55 : 1;
    drawSprite(ctx, this.sprite, this.x, this.y, { scale: bob, alpha, rot: Math.sin(this.age * 1.6) * 0.12 });
  }
}

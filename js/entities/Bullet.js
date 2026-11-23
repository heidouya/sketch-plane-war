import { W, H } from '../core/config.js';
import { drawSprite } from '../art/sketch.js';

export class Bullet {
  constructor(game) {
    this.game = game;
    this.dead = true;
  }

  init({ x, y, vx = 0, vy, sprite, r = 4, damage = 1, life = 4, boss = false }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.sprite = sprite;
    this.r = r;
    this.damage = damage;
    this.life = life;
    this.boss = boss;
    this.rot = Math.atan2(vx, -vy);
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (
      this.life <= 0
      || this.y < -40
      || this.y > H + 40
      || this.x < -40
      || this.x > W + 40
    ) {
      this.dead = true;
    }
  }

  draw(ctx) {
    drawSprite(ctx, this.sprite, this.x, this.y, { rot: this.rot });
  }
}

/**
 * 玩家：跟随鼠标 / 手指，键盘可微调；自动开火，火力分 4 级。
 * 碰撞判定用一个比机身小的圆（r = 14），保持手感宽容。
 */
import { W, H, FIELD } from '../core/config.js';
import { clamp, damp, lerp, rand } from '../core/util.js';
import { drawSprite, INK, INK_SOFT } from '../art/sketch.js';
import { PLAYER, FX_SHIELD } from '../art/sprites.js';
import { sfx } from '../core/Audio.js';

const WEAPONS = {
  1: { interval: 0.105, shots: [{ dx: 0, angle: 0 }] },
  2: { interval: 0.11, shots: [{ dx: -7, angle: 0 }, { dx: 7, angle: 0 }] },
  3: {
    interval: 0.115,
    shots: [{ dx: 0, angle: 0 }, { dx: -13, angle: -0.15 }, { dx: 13, angle: 0.15 }],
  },
  4: {
    interval: 0.12,
    shots: [
      { dx: -6, angle: 0 },
      { dx: 6, angle: 0 },
      { dx: -17, angle: -0.24 },
      { dx: 17, angle: 0.24 },
    ],
  },
};

const BULLET_SPEED = 760;

export class Player {
  constructor(game) {
    this.game = game;
    this.reset();
  }

  reset() {
    this.x = W / 2;
    this.y = H - 170;
    this.r = 14;
    this.lives = 3;
    this.weapon = 1;
    this.cool = 0;
    this.invul = 1.2;
    this.shield = 0;
    this.tilt = 0;
    this.dead = false;
    this.age = 0;
    this.trail = 0;
  }

  update(dt) {
    this.age += dt;
    if (this.dead) return;

    const g = this.game;
    const input = g.input;
    const prevX = this.x;

    if (input.pointer.active) {
      // 手指 / 鼠标：机身停在指针上方一点，避免被指尖挡住
      const lift = input.pointer.touch ? 58 : 42;
      const tx = clamp(input.pointer.x, FIELD.left, FIELD.right);
      const ty = clamp(input.pointer.y - lift, FIELD.top, FIELD.bottom);
      const k = damp(dt, 14);
      this.x = lerp(this.x, tx, k);
      this.y = lerp(this.y, ty, k);
    }

    const ax = input.axisX;
    const ay = input.axisY;
    if (ax || ay) {
      const speed = 380;
      const norm = ax && ay ? 0.7071 : 1;
      this.x += ax * speed * norm * dt;
      this.y += ay * speed * norm * dt;
    }

    this.x = clamp(this.x, FIELD.left, FIELD.right);
    this.y = clamp(this.y, FIELD.top, FIELD.bottom);

    const vx = (this.x - prevX) / Math.max(dt, 0.0001);
    this.tilt = lerp(this.tilt, clamp(vx / 900, -0.5, 0.5), damp(dt, 8));

    this.invul = Math.max(0, this.invul - dt);
    this.shield = Math.max(0, this.shield - dt);

    this.cool -= dt;
    if (this.cool <= 0) {
      this.fire();
      const cfg = WEAPONS[this.weapon] || WEAPONS[1];
      this.cool = cfg.interval;
    }
  }

  fire() {
    const cfg = WEAPONS[this.weapon] || WEAPONS[1];
    for (const s of cfg.shots) {
      const vx = Math.sin(s.angle) * BULLET_SPEED;
      const vy = -Math.cos(s.angle) * BULLET_SPEED;
      this.game.spawnPlayerBullet(this.x + s.dx, this.y - 34, vx, vy);
    }
    this.game.effects.muzzle(this.x, this.y - 40, -1);
    sfx.play('shoot');
  }

  upgrade() {
    this.weapon = Math.min(4, this.weapon + 1);
  }

  grantShield(seconds = 8) {
    this.shield = Math.max(this.shield, seconds);
  }

  /** 被击中：护盾先挡，其次消耗一条命并掉一级火力 */
  hit() {
    if (this.dead) return false;
    if (this.invul > 0) return false;

    if (this.shield > 0) {
      this.shield = 0;
      this.invul = 0.9;
      this.game.effects.ripple(this.x, this.y, 1.1);
      this.game.shake(0.35);
      sfx.play('shield');
      this.game.emitHud();
      return false;
    }

    this.lives -= 1;
    this.invul = 2.1;
    this.weapon = Math.max(1, this.weapon - 1);
    this.game.effects.explosion(this.x, this.y, 0.75);
    this.game.shake(0.6);
    sfx.play('explode');
    this.game.emitHud();

    if (this.lives <= 0) {
      this.dead = true;
      this.game.effects.explosion(this.x, this.y, 1.8);
      this.game.effects.explosion(this.x + rand(-16, 16), this.y + rand(-16, 16), 1.2);
      this.game.shake(1);
      this.game.onPlayerDown();
    }
    return true;
  }

  draw(ctx) {
    if (this.dead) return;
    const blink = this.invul > 0 ? (Math.sin(this.age * 24) > 0 ? 0.45 : 1) : 1;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.tilt * 0.35);

    // 尾焰：两束抖动的短线
    const flame = 6 + Math.sin(this.age * 30) * 3 + Math.random() * 3;
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha *= 0.75 * blink;
    for (const dx of [-4.6, 4.6]) {
      ctx.beginPath();
      ctx.moveTo(dx, 30);
      ctx.lineTo(dx + rand(-1.5, 1.5), 30 + flame);
      ctx.stroke();
      ctx.strokeStyle = INK_SOFT;
      ctx.beginPath();
      ctx.moveTo(dx, 30);
      ctx.lineTo(dx + rand(-2.5, 2.5), 30 + flame * 0.6);
      ctx.stroke();
      ctx.strokeStyle = INK;
    }
    ctx.restore();

    drawSprite(ctx, PLAYER, 0, 0, { alpha: blink });

    if (this.shield > 0) {
      const pulse = 1 + Math.sin(this.age * 6) * 0.04;
      drawSprite(ctx, FX_SHIELD, 0, 0, {
        scale: pulse,
        alpha: this.shield > 2 ? 0.85 : 0.4 + Math.abs(Math.sin(this.age * 14)) * 0.5,
        rot: this.age * 0.4,
      });
    }

    ctx.restore();
  }
}

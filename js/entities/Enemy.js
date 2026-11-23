/**
 * 敌机：侦察机 / 战斗机 / 轰炸机 / 精英机
 * 移动模式有直线(sine)、正弦、漂移(drift)、悬停开火(hold)、俯冲(dive)。
 */
import { W, H } from '../core/config.js';
import { rand, chance, clamp } from '../core/util.js';
import { drawSprite } from '../art/sketch.js';
import { SCOUT, FIGHTER, BOMBER, ELITE, BULLET_ENEMY } from '../art/sprites.js';
import { sfx } from '../core/Audio.js';

export const ENEMY_TYPES = {
  scout: {
    sprite: SCOUT, hp: 2, r: 12, score: 40, speed: 130, drop: 0.04, fire: null,
  },
  fighter: {
    sprite: FIGHTER, hp: 6, r: 16, score: 100, speed: 96, drop: 0.1,
    fire: { kind: 'single', every: 1.9 },
  },
  bomber: {
    sprite: BOMBER, hp: 15, r: 24, score: 190, speed: 70, drop: 0.2,
    fire: { kind: 'spread', every: 2.5 },
  },
  elite: {
    sprite: ELITE, hp: 11, r: 17, score: 240, speed: 118, drop: 0.16,
    fire: { kind: 'aimed', every: 1.55 },
  },
};

export class Enemy {
  constructor(game) {
    this.game = game;
    this.dead = true;
  }

  init(type, opts = {}) {
    const cfg = ENEMY_TYPES[type] || ENEMY_TYPES.scout;
    this.type = type;
    this.cfg = cfg;
    this.hp = cfg.hp * (opts.hpScale || 1);
    this.r = cfg.r;
    this.score = Math.round(cfg.score * (opts.scoreScale || 1));
    this.sprite = cfg.sprite;

    this.x = opts.x ?? W / 2;
    this.y = opts.y ?? -56;
    this.baseX = this.x;
    this.speed = cfg.speed * (opts.speedScale || 1);
    this.pattern = opts.pattern || 'straight';
    this.phase = rand(0, Math.PI * 2);
    this.drift = Math.random() < 0.5 ? -1 : 1;
    this.holdY = rand(150, 260);
    this.dropBoost = opts.dropBoost || 0;

    this.age = 0;
    this.cd = rand(0.8, 1.6);
    this.flash = 0;
    this.dead = false;
  }

  update(dt) {
    this.age += dt;
    this.flash = Math.max(0, this.flash - dt);

    switch (this.pattern) {
      case 'sine':
        this.y += this.speed * 0.92 * dt;
        this.x = this.baseX + Math.sin(this.age * 2.4 + this.phase) * 46;
        break;
      case 'drift':
        this.y += this.speed * 0.8 * dt;
        this.x += this.drift * 78 * dt;
        if (this.x < 40 || this.x > W - 40) this.drift *= -1;
        break;
      case 'hold':
        if (this.y < this.holdY) this.y += this.speed * dt;
        else if (this.age < 9) this.x += Math.sin(this.age * 1.4) * 40 * dt;
        else this.y += this.speed * 1.5 * dt;
        break;
      case 'dive':
        this.y += this.speed * (1 + this.age * 0.55) * dt;
        if (this.game.player && !this.game.player.dead) {
          this.x += clamp(this.game.player.x - this.x, -1, 1) * 90 * dt;
        }
        break;
      default:
        this.y += this.speed * dt;
        break;
    }

    this.x = clamp(this.x, -50, W + 50);

    if (this.cfg.fire && this.y > 8 && this.y < H - 60) {
      this.cd -= dt;
      if (this.cd <= 0) {
        this.shoot();
        this.cd = this.cfg.fire.every * rand(0.85, 1.25);
      }
    }

    if (this.y > H + 70) this.dead = true;
    if (this.age > 45) this.dead = true;
  }

  shoot() {
    const g = this.game;
    const fire = this.cfg.fire;
    if (!fire) return;

    if (fire.kind === 'single') {
      g.spawnEnemyBullet(this.x, this.y + 20, 0, 205, { r: 4 });
    } else if (fire.kind === 'spread') {
      for (const a of [-0.26, 0, 0.26]) {
        g.spawnEnemyBullet(this.x, this.y + 22, Math.sin(a) * 190, Math.cos(a) * 190, { r: 4 });
      }
    } else if (fire.kind === 'aimed' && g.player && !g.player.dead) {
      const dx = g.player.x - this.x;
      const dy = g.player.y - this.y;
      const base = Math.atan2(dy, dx);
      for (const off of [-0.12, 0.12]) {
        g.spawnEnemyBullet(this.x, this.y + 16, Math.cos(base + off) * 225, Math.sin(base + off) * 225, { r: 4 });
      }
    }
    sfx.play('enemyShoot');
  }

  hit(dmg) {
    if (this.dead) return;
    this.hp -= dmg;
    this.flash = 0.13;
    this.game.effects.hit(this.x, this.y - 4);
    if (this.hp <= 0) this.die();
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    const big = this.type === 'bomber';
    this.game.addScore(this.score);
    this.game.effects.explosion(this.x, this.y, big ? 1.25 : 0.68);
    this.game.shake(big ? 0.42 : 0.16);
    sfx.play('explode');
    this.game.dropPowerup(this.x, this.y, this.cfg.drop + this.dropBoost);
  }

  draw(ctx) {
    if (this.flash > 0) {
      drawSprite(ctx, this.sprite, this.x + rand(-2, 2), this.y + rand(-2, 2), { alpha: 0.5 });
    }
    drawSprite(ctx, this.sprite, this.x, this.y);
  }
}

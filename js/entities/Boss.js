/**
 * Boss：三个型号（炮艇 / 双体 / 要塞），血量分三段，
 * 每段换一套弹幕：扇形、瞄准、环形、扫射、召唤僚机。
 */
import { W, H } from '../core/config.js';
import { rand } from '../core/util.js';
import { drawSprite } from '../art/sketch.js';
import { BOSSES } from '../art/sprites.js';
import { sfx } from '../core/Audio.js';

const ATTACKS = {
  gunship: [
    ['fan5', 'aimed3', 'fan5'],
    ['aimed5', 'ring10', 'fan7', 'summon'],
    ['ring14', 'aimed3', 'sweep', 'fan9'],
  ],
  twin: [
    ['aimed4', 'fan6'],
    ['ring12', 'aimed4', 'summon', 'fan8'],
    ['sweep', 'ring16', 'aimed5', 'summon2'],
  ],
  fortress: [
    ['fan7', 'aimed3', 'ring8'],
    ['ring14', 'aimed5', 'summon2', 'fan9'],
    ['ring18', 'sweep', 'aimed7', 'summon2'],
  ],
};

const HOME_Y = 148;

export class Boss {
  constructor(game, kind, hp, name) {
    this.game = game;
    this.kind = ATTACKS[kind] ? kind : 'gunship';
    this.name = name;
    this.maxHp = hp;
    this.hp = hp;
    this.sprite = BOSSES[this.kind];
    this.x = W / 2;
    this.y = -150;
    this.r = 58;

    this.age = 0;
    this.phase = 0;
    this.cd = 2.2;
    this.index = 0;
    this.flash = 0;
    this.invul = 1;
    this.dead = false;
    this.sweepAngle = Math.PI / 2;
  }

  get entering() {
    return this.y < HOME_Y - 1;
  }

  update(dt) {
    if (this.dead) return;
    this.age += dt;
    this.flash = Math.max(0, this.flash - dt);
    this.invul = Math.max(0, this.invul - dt);

    if (this.entering) {
      this.y = Math.min(HOME_Y, this.y + 92 * dt);
      if (this.y >= HOME_Y - 2) {
        this.y = HOME_Y;
        sfx.play('boss');
      }
      return;
    }

    this.x = W / 2 + Math.sin(this.age * 0.5) * 142;
    this.y = HOME_Y + Math.sin(this.age * 0.95) * 12;

    this.cd -= dt;
    if (this.cd <= 0) {
      this.attack();
      const base = Math.max(0.72, 1.7 - this.phase * 0.3);
      this.cd = base * rand(0.9, 1.2);
    }
  }

  attack() {
    const list = ATTACKS[this.kind][this.phase];
    const name = list[this.index % list.length];
    this.index += 1;
    const g = this.game;

    switch (name) {
      case 'fan5': this.fan(5, 1.15, 190); break;
      case 'fan6': this.fan(6, 1.3, 185); break;
      case 'fan7': this.fan(7, 1.5, 180); break;
      case 'fan9': this.fan(9, 1.7, 175); break;
      case 'aimed3': this.aimed(3, 0.16, 240); break;
      case 'aimed4': this.aimed(4, 0.2, 245); break;
      case 'aimed5': this.aimed(5, 0.24, 250); break;
      case 'aimed7': this.aimed(7, 0.3, 255); break;
      case 'ring8': this.ring(8, 150); break;
      case 'ring10': this.ring(10, 155); break;
      case 'ring12': this.ring(12, 160); break;
      case 'ring14': this.ring(14, 165); break;
      case 'ring16': this.ring(16, 170); break;
      case 'ring18': this.ring(18, 172); break;
      case 'sweep': this.sweep(); break;
      case 'summon': g.spawnEnemy('scout', { x: this.x - 70, y: this.y + 24, pattern: 'drift' }); break;
      case 'summon2':
        g.spawnEnemy('scout', { x: this.x - 96, y: this.y + 20, pattern: 'drift' });
        g.spawnEnemy('scout', { x: this.x + 96, y: this.y + 20, pattern: 'drift', speedScale: 1.15 });
        break;
      default: break;
    }
  }

  fan(n, spread, speed) {
    const base = Math.PI / 2;
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const a = base - spread / 2 + spread * t;
      this.game.spawnEnemyBullet(this.x, this.y + 34, Math.cos(a) * speed, Math.sin(a) * speed, { r: 7, boss: true });
    }
    sfx.play('enemyShoot');
  }

  aimed(n, spread, speed) {
    const p = this.game.player;
    if (!p || p.dead) return this.fan(n, spread, speed * 0.9);
    const base = Math.atan2(p.y - this.y, p.x - this.x);
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const a = base - spread / 2 + spread * t;
      this.game.spawnEnemyBullet(this.x, this.y + 32, Math.cos(a) * speed, Math.sin(a) * speed, { r: 7, boss: true });
    }
    sfx.play('enemyShoot');
  }

  ring(n, speed) {
    const offset = this.age * 1.4;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + offset;
      this.game.spawnEnemyBullet(this.x, this.y + 8, Math.cos(a) * speed, Math.sin(a) * speed, { r: 7, boss: true });
    }
    sfx.play('enemyShoot');
  }

  /** 扫射：每轮把喷口角度推一点，形成螺旋 */
  sweep() {
    this.sweepAngle += 0.26;
    for (let i = -2; i <= 2; i++) {
      const a = this.sweepAngle + i * 0.1;
      this.game.spawnEnemyBullet(this.x, this.y + 20, Math.cos(a) * 190, Math.sin(a) * 190, { r: 6, boss: true });
    }
    sfx.play('enemyShoot');
  }

  hit(dmg) {
    if (this.dead || this.invul > 0 || this.entering) return;
    this.hp -= dmg;
    this.flash = 0.1;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
      return;
    }
    const ratio = this.hp / this.maxHp;
    const next = ratio > 0.66 ? 0 : ratio > 0.33 ? 1 : 2;
    if (next !== this.phase) {
      this.phase = next;
      this.invul = 0.85;
      this.cd = 0.9;
      this.index = 0;
      this.game.effects.ripple(this.x, this.y, 2.1);
      this.game.effects.explosion(this.x + rand(-40, 40), this.y + rand(-20, 20), 1);
      this.game.shake(0.8);
      sfx.play('boss');
      this.game.emitHud();
    }
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.game.effects.explosion(this.x, this.y, 2.6);
    this.game.shake(1.2);
    sfx.play('bigExplode');
    this.game.onBossKilled(this);
  }

  draw(ctx) {
    const jitter = this.flash > 0 ? 2.5 : 0;
    if (jitter) {
      drawSprite(ctx, this.sprite, this.x + rand(-jitter, jitter), this.y + rand(-jitter, jitter), { alpha: 0.55 });
    }
    drawSprite(ctx, this.sprite, this.x, this.y + Math.sin(this.age * 3) * 1.5);

    // 受伤时的铅笔划痕
    if (this.flash > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(58,56,51,0.55)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        const a = rand(0, Math.PI * 2);
        const x = this.x + Math.cos(a) * rand(10, 56);
        const y = this.y + Math.sin(a) * rand(8, 40);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + rand(-10, 10), y + rand(-8, 8));
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

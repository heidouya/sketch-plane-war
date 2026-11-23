/**
 * 游戏总控：状态机 + 实体管理 + 碰撞 + 渲染。
 *
 * 状态：menu → playing ⇄ paused → (dying → result | clear → result) → menu
 * 事件：run:start / hud / pause:show / pause:hide / game:over / level:clear / menu:show
 */
import { W, H } from './config.js';
import { Loop } from './Loop.js';
import { Input } from './Input.js';
import { Pool } from './Pool.js';
import { store } from './Storage.js';
import { sfx } from './Audio.js';
import { rand, chance, clamp } from './util.js';
import { circleHit } from './Collision.js';

import { Background } from '../art/background.js';
import { Effects } from '../art/effects.js';
import { BULLET_PLAYER, BULLET_ENEMY, BULLET_BOSS } from '../art/sprites.js';

import { Bullet } from '../entities/Bullet.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { PowerUp, randomPowerType } from '../entities/PowerUp.js';

import { LEVELS, getLevel } from '../systems/Levels.js';
import { WaveSpawner, ClassicSpawner } from '../systems/Spawner.js';

export class Game {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.input = new Input(canvas);
    this.background = new Background();
    this.effects = new Effects();
    this.player = new Player(this);

    this.bullets = new Pool(() => new Bullet(this), 48);
    this.enemyBullets = new Pool(() => new Bullet(this), 64);
    this.enemies = new Pool(() => new Enemy(this), 24);
    this.powerups = new Pool(() => new PowerUp(this), 8);

    this.boss = null;
    this.spawner = null;

    this.state = 'menu';
    this.mode = 'classic';
    this.levelId = 0;
    this.level = null;

    this.score = 0;
    this.time = 0;
    this.bombs = 2;

    this.shakeTime = 0;
    this.shakePower = 0;
    this.flashAlpha = 0;
    this.downLeft = 0;
    this.clearLeft = 0;

    this.scale = 1;
    this.handlers = new Map();
    this.hudSig = '';

    this.loop = new Loop((dt) => this.update(dt), () => this.render());

    this.input.onPause = () => this.togglePause();
    this.input.onFirstGesture = () => sfx.unlock();

    store.load();
    sfx.setMuted(store.muted);
  }

  /* ----------------------------- 事件 ----------------------------- */

  on(type, fn) {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type).push(fn);
    return this;
  }

  emit(type, payload) {
    const list = this.handlers.get(type);
    if (list) for (const fn of list) fn(payload);
  }

  /* ----------------------------- 尺寸 ----------------------------- */

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.scale = w / W;
    document.documentElement.style.setProperty('--u', `${rect.width / W}px`);
  }

  /* ----------------------------- 流程 ----------------------------- */

  startClassic() {
    this.mode = 'classic';
    this.level = null;
    this.levelId = 0;
    this.beginRun();
    this.spawner = new ClassicSpawner(this);
    this.emit('run:start', { mode: 'classic', level: null });
  }

  startLevel(id) {
    const level = getLevel(id);
    this.mode = 'level';
    this.level = level;
    this.levelId = level.id;
    this.beginRun();
    this.spawner = new WaveSpawner(this, level);
    this.emit('run:start', { mode: 'level', level });
  }

  beginRun() {
    this.state = 'playing';
    this.score = 0;
    this.time = 0;
    this.bombs = 2;
    this.boss = null;
    this.downLeft = 0;
    this.clearLeft = 0;
    this.shakeTime = 0;
    this.shakePower = 0;
    this.flashAlpha = 0;

    this.bullets.clear();
    this.enemyBullets.clear();
    this.enemies.clear();
    this.powerups.clear();
    this.effects.clear();

    this.player.reset();
    this.input.anchor(this.player.x, this.player.y + 58);
    this.input.setEnabled(true);
    this.emitHud(true);
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.setEnabled(false);
    this.emit('pause:show');
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.input.setEnabled(true);
    this.input.anchor(this.player.x, this.player.y + 58);
    this.emit('pause:hide');
    this.emitHud(true);
  }

  togglePause() {
    if (this.state === 'playing') this.pause();
    else if (this.state === 'paused') this.resume();
  }

  restart() {
    if (this.mode === 'level') this.startLevel(this.levelId);
    else this.startClassic();
  }

  nextLevel() {
    const next = Math.min(LEVELS.length, this.levelId + 1);
    if (next === this.levelId) {
      this.quitToMenu();
      return;
    }
    this.startLevel(next);
  }

  quitToMenu() {
    this.state = 'menu';
    this.spawner = null;
    this.boss = null;
    this.player.dead = true;
    this.bullets.clear();
    this.enemyBullets.clear();
    this.enemies.clear();
    this.powerups.clear();
    this.effects.clear();
    this.input.setEnabled(false);
    this.emit('menu:show');
  }

  onPlayerDown() {
    this.state = 'dying';
    this.downLeft = 1.5;
    this.input.setEnabled(false);
    this.enemyBullets.clear();
    this.emitHud(true);
  }

  gameOver() {
    this.state = 'result';
    this.boss = null;
    const best = this.mode === 'classic'
      ? store.addClassic(this.score)
      : store.addLevel(this.levelId, this.score, false).best;
    sfx.play('over');
    this.emit('game:over', {
      mode: this.mode,
      levelId: this.levelId,
      level: this.level,
      score: this.score,
      best,
    });
    this.emitHud(true);
  }

  onBossKilled() {
    const boss = this.boss;
    if (!boss) return;
    this.addScore(1200 + this.levelId * 100);
    this.enemyBullets.clear();

    for (let i = 0; i < 4; i++) {
      this.effects.explosion(boss.x + rand(-70, 70), boss.y + rand(-30, 30), rand(1.2, 2.2));
    }
    for (let i = 0; i < 3; i++) {
      this.powerups.spawn(randomPowerType(), boss.x + rand(-80, 80), boss.y + rand(10, 40));
    }

    this.flashAlpha = 0.8;
    this.shakeTime = 0.75;
    this.shakePower = 1.2;
    this.clearLeft = 2.3;
    this.state = 'clear';
    this.input.setEnabled(false);
    this.emitHud(true);
  }

  completeLevel() {
    const bonus = 800 + this.levelId * 120;
    this.addScore(bonus);
    this.boss = null;
    const best = store.addLevel(this.levelId, this.score, true);
    this.state = 'result';
    sfx.play('clear');
    this.emit('level:clear', {
      mode: 'level',
      levelId: this.levelId,
      level: this.level,
      score: this.score,
      best: best.best,
      bonus,
      nextId: Math.min(LEVELS.length, this.levelId + 1),
    });
    this.emitHud(true);
  }

  /* ----------------------------- 更新 ----------------------------- */

  update(dt) {
    const menuLike = this.state === 'menu' || this.state === 'result';
    this.background.update(dt, menuLike ? 0.55 : this.state === 'paused' ? 0.25 : 1);
    this.effects.update(dt);

    if (this.shakeTime > 0) this.shakeTime = Math.max(0, this.shakeTime - dt);
    this.flashAlpha = Math.max(0, this.flashAlpha - dt * 2.4);

    if (this.state === 'playing') this.updatePlaying(dt);
    else if (this.state === 'dying') this.updateDying(dt);
    else if (this.state === 'clear') this.updateClear(dt);
  }

  updatePlaying(dt) {
    this.time += dt;

    if (this.input.consumeBomb()) this.useBomb();

    this.player.update(dt);
    if (this.spawner) this.spawner.update(dt);

    this.bullets.update(dt);
    this.enemies.update(dt);
    this.enemyBullets.update(dt);
    this.powerups.update(dt);
    if (this.boss && !this.boss.dead) this.boss.update(dt);

    this.collide();
    this.emitHud();
  }

  updateDying(dt) {
    this.downLeft -= dt;
    this.bullets.update(dt);
    this.enemies.update(dt);
    this.enemyBullets.update(dt);
    this.powerups.update(dt);
    if (this.boss && !this.boss.dead) this.boss.update(dt);
    if (this.downLeft <= 0) this.gameOver();
  }

  updateClear(dt) {
    this.clearLeft -= dt;
    this.bullets.update(dt);
    this.enemies.update(dt);
    this.powerups.update(dt);
    if (this.clearLeft <= 0) this.completeLevel();
  }

  /* ----------------------------- 实体 ----------------------------- */

  spawnPlayerBullet(x, y, vx, vy) {
    this.bullets.spawn({ x, y, vx, vy, sprite: BULLET_PLAYER, r: 4, damage: 1 });
  }

  spawnEnemyBullet(x, y, vx, vy, opts = {}) {
    this.enemyBullets.spawn({
      x, y, vx, vy,
      sprite: opts.boss ? BULLET_BOSS : BULLET_ENEMY,
      r: opts.r ?? 4,
      damage: 1,
      boss: Boolean(opts.boss),
    });
  }

  spawnEnemy(type, opts) {
    if (this.enemies.count >= 64) return;
    this.enemies.spawn(type, opts);
  }

  spawnBoss(cfg) {
    this.boss = new Boss(this, cfg.kind, cfg.hp, cfg.name);
    this.emit('boss:spawn', { name: cfg.name, hp: cfg.hp });
    this.emitHud(true);
  }

  dropPowerup(x, y, p = 0.1) {
    if (this.powerups.count >= 6) return;
    if (chance(p)) this.powerups.spawn(randomPowerType(), x, y);
  }

  /** 屏幕震动：power 0~1.5，取当前更大值叠加，避免连续命中把画面抖碎 */
  shake(power = 1) {
    const p = clamp(power, 0, 1.5);
    this.shakePower = Math.max(this.shakePower, p);
    this.shakeTime = Math.max(this.shakeTime, 0.16 + p * 0.26);
  }

  addScore(n) {
    this.score += Math.round(n);
  }

  collect(type) {
    const p = this.player;
    switch (type) {
      case 'power': p.upgrade(); break;
      case 'shield': p.grantShield(9); break;
      case 'bomb': this.bombs = Math.min(3, this.bombs + 1); break;
      case 'life': p.lives = Math.min(5, p.lives + 1); break;
      default: break;
    }
    this.addScore(30);
    this.effects.ripple(p.x, p.y, 0.9);
    sfx.play('powerup');
    this.emitHud(true);
  }

  useBomb() {
    if (this.state !== 'playing' || this.bombs <= 0) return;
    this.bombs -= 1;
    this.enemyBullets.clear();
    this.enemies.forEach((e) => {
      if (!e.dead) e.hit(26);
    });
    if (this.boss && !this.boss.dead) this.boss.hit(70);
    this.flashAlpha = 0.62;
    this.shakeTime = 0.5;
    this.shakePower = 1.1;
    this.effects.ripple(this.player.x, this.player.y, 3);
    sfx.play('bomb');
    this.emitHud(true);
  }

  /* ----------------------------- 碰撞 ----------------------------- */

  collide() {
    const bullets = this.bullets.live;
    const enemies = this.enemies.live;
    const player = this.player;

    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];
      if (b.dead) continue;

      if (this.boss && !this.boss.dead && !this.boss.entering && circleHit(b, this.boss)) {
        this.boss.hit(b.damage);
        b.dead = true;
        continue;
      }

      for (let j = 0; j < enemies.length; j++) {
        const e = enemies[j];
        if (e.dead) continue;
        if (circleHit(b, e)) {
          e.hit(b.damage);
          b.dead = true;
          break;
        }
      }
    }

    if (player.dead) return;

    for (const b of this.enemyBullets.live) {
      if (b.dead) continue;
      if (circleHit(b, player)) {
        b.dead = true;
        player.hit();
        if (player.dead) return;
      }
    }

    for (const e of enemies) {
      if (e.dead) continue;
      if (circleHit(e, player)) {
        e.hit(999);
        player.hit();
        if (player.dead) return;
      }
    }

    for (const p of this.powerups.live) {
      if (p.dead) continue;
      if (circleHit(p, player)) {
        p.dead = true;
        this.collect(p.type);
      }
    }

    if (this.boss && !this.boss.dead && !this.boss.entering && circleHit(player, this.boss)) {
      player.hit();
    }
  }

  /* ----------------------------- HUD ----------------------------- */

  emitHud(force = false) {
    const hud = {
      score: this.score,
      lives: this.player.lives,
      bombs: this.bombs,
      weapon: this.player.weapon,
      mode: this.mode,
      levelId: this.levelId,
      levelName: this.level ? this.level.name : '经典模式',
      wave: this.spawner ? this.spawner.waveIndex + 1 : 0,
      waveTotal: this.spawner ? this.spawner.waveTotal : 0,
      time: Math.floor(this.time),
      boss: this.boss && !this.boss.dead
        ? { name: this.boss.name, hp: this.boss.hp, max: this.boss.maxHp, phase: this.boss.phase }
        : null,
    };
    const sig = JSON.stringify(hud);
    if (!force && sig === this.hudSig) return;
    this.hudSig = sig;
    this.emit('hud', hud);
  }

  /* ----------------------------- 渲染 ----------------------------- */

  render() {
    const ctx = this.ctx;
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    ctx.clearRect(0, 0, W, H);

    if (this.shakeTime > 0) {
      const k = this.shakePower * Math.min(1, this.shakeTime * 2.2);
      ctx.translate(rand(-1, 1) * 9 * k, rand(-1, 1) * 7 * k);
    }

    this.background.draw(ctx);

    if (this.state === 'menu') {
      this.background.drawFrame(ctx);
      return;
    }

    this.powerups.draw(ctx);
    this.enemies.draw(ctx);
    if (this.boss && !this.boss.dead) this.boss.draw(ctx);
    this.bullets.draw(ctx);
    this.player.draw(ctx);
    this.enemyBullets.draw(ctx);
    this.effects.draw(ctx);

    if (this.flashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.flashAlpha * 0.9;
      ctx.fillStyle = '#fbf8ec';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }
}

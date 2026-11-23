/**
 * 波次调度：
 *  - WaveSpawner  关卡模式，按时间轴铺开整张波次表，清完后叫 Boss
 *  - ClassicSpawner 经典模式，按时间递增难度，无限刷
 */
import { W } from '../core/config.js';
import { rand, randInt, clamp, pick } from '../core/util.js';

export class WaveSpawner {
  constructor(game, level) {
    this.game = game;
    this.level = level;
    this.time = 0;
    this.queue = [];

    level.waves.forEach((w, wi) => {
      for (let i = 0; i < w.count; i++) {
        this.queue.push({ t: w.at + i * w.gap, w, wi, i });
      }
    });
    this.queue.sort((a, b) => a.t - b.t);

    this.cursor = 0;
    this.bossSpawned = false;
    this.waitFrom = -1;
    this.bossTime = 0;
    this.done = false;
  }

  get waveIndex() {
    if (this.cursor <= 0) return 0;
    const entry = this.queue[Math.min(this.cursor - 1, this.queue.length - 1)];
    return entry ? entry.wi : 0;
  }

  get waveTotal() {
    return this.level.waves.length;
  }

  update(dt) {
    this.time += dt;

    while (this.cursor < this.queue.length && this.queue[this.cursor].t <= this.time) {
      this.spawn(this.queue[this.cursor]);
      this.cursor += 1;
    }

    if (!this.bossSpawned && this.cursor >= this.queue.length) {
      if (this.waitFrom < 0) this.waitFrom = this.time;
      const waited = this.time - this.waitFrom;
      // 给玩家一点清场时间，但最多等 6.5 秒
      if (waited > 1.6 && (this.game.enemies.count <= 4 || waited > 6.5)) {
        this.bossSpawned = true;
        this.bossTime = this.time;
        this.game.spawnBoss(this.level.boss);
      }
    }
  }

  spawn(entry) {
    const w = entry.w;
    this.game.spawnEnemy(w.type, {
      x: this.positionFor(w, entry.i),
      y: -46 - rand(0, 50),
      pattern: w.pattern || 'straight',
      speedScale: w.speedScale,
      hpScale: w.hpScale,
      dropBoost: w.dropBoost,
    });
  }

  positionFor(w, i) {
    if (typeof w.x === 'number') return w.x;
    const spread = w.spread ?? 300;
    switch (w.formation) {
      case 'line': {
        if (w.count <= 1) return W / 2 + (w.offset ?? 0);
        const step = spread / (w.count - 1);
        return W / 2 + (i - (w.count - 1) / 2) * step;
      }
      case 'sides':
        return i % 2 === 0 ? 92 : W - 92;
      case 'column':
        return W / 2 + (w.offset ?? 0);
      default:
        return rand(70, W - 70);
    }
  }
}

const CLASSIC_GROUPS = [
  { formation: 'line', spread: 320, count: [3, 5] },
  { formation: 'sides', count: [2, 4] },
  { formation: 'random', count: [3, 4] },
];

export class ClassicSpawner {
  constructor(game) {
    this.game = game;
    this.time = 0;
    this.next = 1.3;
  }

  update(dt) {
    this.time += dt;
    this.next -= dt;
    if (this.next > 0) return;

    this.spawnGroup();

    const diff = clamp(this.time / 110, 0, 1);
    this.next = (1.2 - 0.78 * diff) * rand(0.85, 1.18);
  }

  spawnGroup() {
    const group = pick(CLASSIC_GROUPS);
    const formation = group.formation;
    const count = randInt(group.count[0], group.count[1]);
    const type = this.pickType();
    const spread = group.spread ?? 300;

    for (let i = 0; i < count; i++) {
      let x;
      if (formation === 'line') {
        x = W / 2 + (i - (count - 1) / 2) * (spread / Math.max(1, count - 1));
      } else if (formation === 'sides') {
        x = i % 2 === 0 ? 92 : W - 92;
      } else {
        x = rand(70, W - 70);
      }
      this.game.spawnEnemy(type, {
        x,
        y: -46 - rand(0, 30),
        pattern: this.pickPattern(type),
        speedScale: 1 + clamp(this.time / 300, 0, 0.35),
        hpScale: 1 + clamp(this.time / 240, 0, 0.5),
      });
    }
  }

  pickType() {
    const t = this.time;
    const weights = [
      ['scout', Math.max(8, 44 - t * 0.28)],
      ['fighter', t > 12 ? 30 : 8],
      ['bomber', t > 35 ? 18 : 0],
      ['elite', t > 55 ? 17 : 0],
    ];
    const total = weights.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [type, w] of weights) {
      r -= w;
      if (r <= 0) return type;
    }
    return 'scout';
  }

  pickPattern(type) {
    if (type === 'scout') return pick(['straight', 'straight', 'sine', 'sine', 'drift']);
    if (type === 'fighter') return pick(['straight', 'hold', 'drift']);
    if (type === 'bomber') return pick(['straight', 'hold']);
    return pick(['straight', 'drift', 'hold', 'dive']);
  }

  get waveIndex() {
    return 0;
  }

  get waveTotal() {
    return 0;
  }
}

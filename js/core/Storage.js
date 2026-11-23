/**
 * 本地存档：最高分、经典模式前五、每关最佳与通关进度、音效开关。
 * 所有读写都包一层容错，存档损坏时自动回到默认值。
 */
const KEY = 'sketch-plane-war:save:v1';

function defaults() {
  return {
    version: 1,
    unlocked: 1,
    classic: { best: 0, top: [] },
    levels: {},
    settings: { muted: false },
  };
}

function normalize(raw) {
  const d = defaults();
  if (!raw || typeof raw !== 'object') return d;
  const unlocked = Math.floor(Number(raw.unlocked));
  return {
    version: 1,
    unlocked: Number.isFinite(unlocked) ? Math.min(12, Math.max(1, unlocked)) : 1,
    classic: {
      best: Math.max(0, Number(raw.classic?.best) || 0),
      top: Array.isArray(raw.classic?.top)
        ? raw.classic.top
            .map((x) => typeof x === 'object' ? Number(x.score) || 0 : Number(x) || 0)
            .filter((n) => n > 0)
            .sort((a, b) => b - a)
            .slice(0, 5)
        : [],
    },
    levels: raw.levels && typeof raw.levels === 'object' ? { ...raw.levels } : {},
    settings: { muted: Boolean(raw.settings?.muted) },
  };
}

export const store = {
  data: defaults(),

  load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      this.data = normalize(raw);
    } catch (err) {
      this.data = defaults();
    }
    return this.data;
  },

  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch (err) {
      /* 隐私模式或存储已满时静默失败，不影响游戏 */
    }
  },

  isUnlocked(levelId) {
    return levelId <= this.data.unlocked;
  },

  levelRecord(levelId) {
    const r = this.data.levels[levelId];
    return {
      best: Math.max(0, Number(r?.best) || 0),
      cleared: Boolean(r?.cleared),
    };
  },

  addClassic(score) {
    const s = Math.max(0, Math.round(score));
    const c = this.data.classic;
    if (s > c.best) c.best = s;
    if (s > 0) {
      c.top.push(s);
      c.top.sort((a, b) => b - a);
      c.top = c.top.slice(0, 5);
    }
    this.save();
    return c.best;
  },

  addLevel(levelId, score, cleared) {
    const id = String(levelId);
    const prev = this.data.levels[id] || { best: 0, cleared: false };
    const rec = {
      best: Math.max(prev.best || 0, Math.round(score)),
      cleared: Boolean(prev.cleared || cleared),
    };
    this.data.levels[id] = rec;
    if (cleared && levelId >= this.data.unlocked && levelId < 12) {
      this.data.unlocked = levelId + 1;
    }
    this.save();
    return rec;
  },

  setMuted(v) {
    this.data.settings.muted = Boolean(v);
    this.save();
  },

  get muted() {
    return Boolean(this.data.settings.muted);
  },

  reset() {
    this.data = defaults();
    this.save();
  },
};

import { formatScore, formatTime } from '../core/util.js';
import { sfx } from '../core/Audio.js';

export function initHud(game) {
  const scoreEl = document.getElementById('hud-score');
  const livesEl = document.getElementById('hud-lives');
  const levelEl = document.getElementById('hud-level');
  const waveEl = document.getElementById('hud-wave');
  const bossBar = document.getElementById('boss-bar');
  const bossName = document.getElementById('boss-name');
  const bossHpText = document.getElementById('boss-hp-text');
  const bossFill = document.getElementById('boss-fill');
  const weaponEl = document.getElementById('hud-weapon');
  const bombCount = document.getElementById('bomb-count');
  const bombBtn = document.getElementById('btn-bomb');
  const pauseBtn = document.getElementById('btn-pause');

  game.on('hud', (h) => {
    scoreEl.textContent = formatScore(h.score);
    livesEl.textContent = h.lives > 0 ? '✈'.repeat(h.lives) : '—';

    if (h.mode === 'level') {
      levelEl.textContent = `第 ${h.levelId} 关 · ${h.levelName}`;
      waveEl.textContent = `波次 ${Math.min(h.wave, h.waveTotal)} / ${h.waveTotal}`;
    } else {
      levelEl.textContent = '经典模式';
      waveEl.textContent = `生存 ${formatTime(h.time)}`;
    }

    weaponEl.textContent = `火力 Lv.${h.weapon}`;
    bombCount.textContent = String(h.bombs);
    bombBtn.disabled = h.bombs <= 0;

    if (h.boss) {
      bossBar.hidden = false;
      bossName.textContent = h.boss.name;
      bossHpText.textContent = `${Math.max(0, Math.ceil(h.boss.hp))} / ${h.boss.max}`;
      const pct = Math.max(0, Math.min(100, (h.boss.hp / h.boss.max) * 100));
      bossFill.style.width = `${pct}%`;
    } else {
      bossBar.hidden = true;
    }
  });

  bombBtn.addEventListener('click', () => {
    sfx.play('ui');
    game.useBomb();
  });

  pauseBtn.addEventListener('click', () => {
    sfx.play('ui');
    game.pause();
  });
}

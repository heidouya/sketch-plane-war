import { sfx } from '../core/Audio.js';
import { formatScore } from '../core/util.js';
import { show } from './router.js';

export function initResult(game) {
  const screen = document.getElementById('screen-result');
  const kicker = document.getElementById('result-kicker');
  const title = document.getElementById('result-title');
  const scoreEl = document.getElementById('result-score');
  const meta = document.getElementById('result-meta');
  const retry = screen.querySelector('[data-action="retry"]');
  const next = screen.querySelector('[data-action="next"]');
  const back = screen.querySelector('[data-action="menu"]');

  game.on('game:over', (d) => {
    kicker.textContent = d.mode === 'level'
      ? `第 ${d.levelId} 关 · ${d.level?.name ?? ''}`
      : '经典模式';
    title.textContent = '坠机了';
    scoreEl.textContent = formatScore(d.score);
    meta.textContent = `最高分 ${formatScore(d.best)}`;
    retry.textContent = '再来一局';
    next.hidden = true;
    show('result');
  });

  game.on('level:clear', (d) => {
    kicker.textContent = `第 ${d.levelId} 关 · ${d.level?.name ?? ''}`;
    title.textContent = '航线清空';
    scoreEl.textContent = formatScore(d.score);
    meta.textContent = `通关奖励 +${formatScore(d.bonus)} · 最佳 ${formatScore(d.best)}`;
    retry.textContent = '再飞一次';
    next.hidden = d.nextId <= d.levelId;
    next.textContent = '下一关';
    show('result');
  });

  retry.addEventListener('click', () => {
    sfx.play('ui');
    game.restart();
  });

  next.addEventListener('click', () => {
    sfx.play('ui');
    game.nextLevel();
  });

  back.addEventListener('click', () => {
    sfx.play('ui');
    game.quitToMenu();
  });
}

import { LEVELS } from '../systems/Levels.js';
import { store } from '../core/Storage.js';
import { sfx } from '../core/Audio.js';
import { formatScore } from '../core/util.js';
import { show, onShow } from './router.js';
import { sketchify } from './sketch-ui.js';

export function initRecords(game) {
  const screen = document.getElementById('screen-records');
  const classicBest = document.getElementById('classic-best');
  const classicTop = document.getElementById('classic-top');
  const levelBest = document.getElementById('level-best');

  screen.querySelector('[data-action="back"]').addEventListener('click', () => {
    sfx.play('ui');
    show('menu');
  });

  const render = () => {
    const data = store.data;
    classicBest.textContent = `最高分 ${formatScore(data.classic.best)}`;

    classicTop.innerHTML = '';
    if (!data.classic.top.length) {
      classicTop.innerHTML = '<li class="empty">还没有成绩，去飞一次吧</li>';
    } else {
      data.classic.top.forEach((score, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="rank-no">${String(i + 1).padStart(2, '0')}</span><span class="rank-score">${formatScore(score)}</span>`;
        classicTop.appendChild(li);
      });
    }

    levelBest.innerHTML = '';
    for (const level of LEVELS) {
      const rec = store.levelRecord(level.id);
      const li = document.createElement('li');
      if (rec.cleared) li.classList.add('is-cleared');
      const locked = !store.isUnlocked(level.id);
      li.innerHTML = `
        <span class="lb-no">${String(level.id).padStart(2, '0')}</span>
        <span class="lb-name">${locked ? '未解锁' : level.name}</span>
        <span class="lb-score">${rec.best > 0 ? formatScore(rec.best) : '—'}</span>
        <span class="lb-mark">${rec.cleared ? '✓' : ''}</span>
      `;
      levelBest.appendChild(li);
    }

    requestAnimationFrame(() => sketchify(screen));
  };

  onShow('records', render);
  render();
}

import { LEVELS, LEVEL_COUNT } from '../systems/Levels.js';
import { store } from '../core/Storage.js';
import { sfx } from '../core/Audio.js';
import { formatScore } from '../core/util.js';
import { show, onShow, toast } from './router.js';
import { sketchify } from './sketch-ui.js';

export function initLevels(game) {
  const screen = document.getElementById('screen-levels');
  const grid = document.getElementById('level-grid');
  const progress = document.getElementById('levels-progress');

  screen.querySelector('[data-action="back"]').addEventListener('click', () => {
    sfx.play('ui');
    show('menu');
  });

  grid.addEventListener('click', (ev) => {
    const card = ev.target.closest('.level-card');
    if (!card) return;
    const id = Number(card.dataset.id);
    if (!store.isUnlocked(id)) {
      sfx.play('ui');
      toast('先通关上一关，这里才会解锁');
      return;
    }
    sfx.play('ui');
    game.startLevel(id);
  });

  const render = () => {
    grid.innerHTML = '';
    for (const level of LEVELS) {
      const locked = !store.isUnlocked(level.id);
      const rec = store.levelRecord(level.id);

      const card = document.createElement('button');
      card.className = 'level-card';
      card.type = 'button';
      card.dataset.id = String(level.id);
      if (locked) card.classList.add('is-locked');
      if (rec.cleared) card.classList.add('is-cleared');
      card.setAttribute('aria-disabled', String(locked));
      card.setAttribute('role', 'listitem');

      const best = rec.best > 0 ? `最佳 ${formatScore(rec.best)}` : '尚无记录';
      card.innerHTML = `
        <span class="level-no">LEVEL ${String(level.id).padStart(2, '0')}</span>
        <span class="level-name">${level.name}</span>
        <span class="level-tag">${locked ? '未解锁' : level.tag}</span>
        <span class="level-best">${locked ? '通关上一关后开放' : best}</span>
      `;
      grid.appendChild(card);
    }

    progress.textContent = `${store.data.unlocked} / ${LEVEL_COUNT}`;
    requestAnimationFrame(() => sketchify(screen));
  };

  onShow('levels', render);
  render();
}

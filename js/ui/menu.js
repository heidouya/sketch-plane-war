import { store } from '../core/Storage.js';
import { sfx } from '../core/Audio.js';
import { MENU_PLANE } from '../art/sprites.js';
import { show, onShow } from './router.js';

export function initMenu(game) {
  const screen = document.getElementById('screen-menu');
  const plane = document.getElementById('menu-plane');
  const soundBtn = screen.querySelector('[data-action="sound"]');

  plane.src = MENU_PLANE.canvas.toDataURL('image/png');

  const paintSound = () => {
    soundBtn.textContent = `音效：${store.muted ? '关' : '开'}`;
    soundBtn.setAttribute('aria-pressed', String(!store.muted));
  };
  paintSound();
  onShow('menu', paintSound);

  screen.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-action]');
    if (!btn) return;
    sfx.play('ui');

    switch (btn.dataset.action) {
      case 'classic':
        game.startClassic();
        break;
      case 'levels':
        show('levels');
        break;
      case 'records':
        show('records');
        break;
      case 'sound': {
        const muted = !store.muted;
        store.setMuted(muted);
        sfx.setMuted(muted);
        paintSound();
        if (!muted) sfx.play('ui');
        break;
      }
      default:
        break;
    }
  });
}

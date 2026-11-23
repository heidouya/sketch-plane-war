import { sfx } from '../core/Audio.js';
import { show, hideScreens } from './router.js';

export function initPause(game) {
  const screen = document.getElementById('screen-pause');

  screen.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-action]');
    if (!btn) return;
    sfx.play('ui');
    switch (btn.dataset.action) {
      case 'resume':
        game.resume();
        break;
      case 'restart':
        game.restart();
        break;
      case 'menu':
        game.quitToMenu();
        break;
      default:
        break;
    }
  });

  game.on('pause:show', () => show('pause'));
  game.on('pause:hide', () => hideScreens());
}

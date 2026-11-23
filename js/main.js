import { Game } from './core/Game.js';
import { mountUI } from './ui/app.js';
import { sfx } from './core/Audio.js';

const canvas = document.getElementById('game');

const game = new Game({ canvas });
mountUI(game);
game.resize();

window.addEventListener('resize', () => game.resize());
window.addEventListener('orientationchange', () => {
  setTimeout(() => game.resize(), 260);
});

// 浏览器要求用户手势后才能播放声音
const unlockAudio = () => sfx.unlock();
window.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });
window.addEventListener('keydown', unlockAudio, { once: true, capture: true });

game.loop.start();

const bootHint = document.getElementById('boot-hint');
if (bootHint) bootHint.hidden = true;

// 方便在控制台调参
window.game = game;

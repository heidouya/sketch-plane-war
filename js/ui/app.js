/**
 * 把界面模块和游戏事件接在一起：
 * 开局收起所有面板、显示 HUD；回到菜单收起 HUD、显示主菜单。
 */
import { initHud } from './hud.js';
import { initMenu } from './menu.js';
import { initLevels } from './levels.js';
import { initRecords } from './records.js';
import { initResult } from './result.js';
import { initPause } from './pause.js';
import { hideScreens, setHudVisible, show } from './router.js';
import { sketchify } from './sketch-ui.js';

export function mountUI(game) {
  initHud(game);
  initMenu(game);
  initLevels(game);
  initRecords(game);
  initResult(game);
  initPause(game);

  sketchify();
  requestAnimationFrame(() => sketchify());

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      game.resize();
      sketchify();
    }, 130);
  });

  game.on('run:start', () => {
    hideScreens();
    setHudVisible(true);
  });

  game.on('menu:show', () => {
    setHudVisible(false);
    show('menu');
  });

  game.on('game:over', () => setHudVisible(false));
  game.on('level:clear', () => setHudVisible(false));
}

/**
 * 界面路由：同一时刻只显示一个全屏界面；HUD 单独控制显隐。
 * 每次 show 之后重画一次手绘边框（隐藏元素尺寸为 0，必须等展示后再画）。
 */
import { sketchify } from './sketch-ui.js';

const SCREENS = {
  menu: 'screen-menu',
  levels: 'screen-levels',
  records: 'screen-records',
  result: 'screen-result',
  pause: 'screen-pause',
};

const showHandlers = new Map();

export function onShow(name, fn) {
  if (!showHandlers.has(name)) showHandlers.set(name, []);
  showHandlers.get(name).push(fn);
}

export function show(name) {
  const target = SCREENS[name];
  if (!target) return;

  for (const key of Object.keys(SCREENS)) {
    const el = document.getElementById(SCREENS[key]);
    if (el) el.hidden = key !== name;
  }

  const handlers = showHandlers.get(name);
  if (handlers) for (const fn of handlers) fn();

  const el = document.getElementById(target);
  if (el) requestAnimationFrame(() => sketchify(el));
}

export function hideScreens() {
  for (const key of Object.keys(SCREENS)) {
    const el = document.getElementById(SCREENS[key]);
    if (el) el.hidden = true;
  }
}

export function setHudVisible(visible) {
  const hud = document.getElementById('hud');
  if (hud) hud.hidden = !visible;
}

let toastTimer = 0;

export function toast(text, ms = 1700) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, ms);
}

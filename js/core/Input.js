/**
 * 输入：桌面鼠标移动 / 按住拖动、键盘 WASD 与方向键、移动端手指拖动。
 * 指针坐标统一换算到 540 x 960 的逻辑坐标系。
 */
import { W, H } from './config.js';

const MOVE_KEYS = {
  arrowleft: 'left', a: 'left',
  arrowright: 'right', d: 'right',
  arrowup: 'up', w: 'up',
  arrowdown: 'down', s: 'down',
};

export class Input {
  constructor(surface) {
    this.surface = surface;
    this.keys = new Set();
    this.pointer = { x: W / 2, y: H - 160, active: false, down: false, touch: false };
    this.enabled = false;
    this.bombRequested = false;
    this.onPause = null;
    this.onFirstGesture = null;

    this.bindPointer();
    this.bindKeys();
  }

  bindPointer() {
    const el = this.surface;

    const toWorld = (ev) => {
      const rect = el.getBoundingClientRect();
      return {
        x: ((ev.clientX - rect.left) / Math.max(1, rect.width)) * W,
        y: ((ev.clientY - rect.top) / Math.max(1, rect.height)) * H,
      };
    };

    el.addEventListener('pointerdown', (ev) => {
      if (this.onFirstGesture) this.onFirstGesture();
      if (!this.enabled) return;
      const p = toWorld(ev);
      this.pointer.x = p.x;
      this.pointer.y = p.y;
      this.pointer.down = true;
      this.pointer.touch = ev.pointerType !== 'mouse';
      this.pointer.active = true;
      if (el.setPointerCapture) {
        try { el.setPointerCapture(ev.pointerId); } catch (err) { /* 忽略无效 pointerId */ }
      }
      ev.preventDefault();
    }, { passive: false });

    el.addEventListener('pointermove', (ev) => {
      if (!this.enabled) return;
      this.pointer.touch = ev.pointerType !== 'mouse';
      if (this.pointer.touch && !this.pointer.down) return;
      const p = toWorld(ev);
      this.pointer.x = p.x;
      this.pointer.y = p.y;
      this.pointer.active = true;
      if (ev.pointerType === 'mouse') ev.preventDefault();
    }, { passive: false });

    const release = (ev) => {
      this.pointer.down = false;
      if (ev.pointerType !== 'mouse') this.pointer.active = false;
    };
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('pointerleave', (ev) => {
      if (ev.pointerType === 'mouse') this.pointer.active = false;
    });

    // 移动端拖动时不要触发页面滚动 / 长按菜单
    el.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }

  bindKeys() {
    window.addEventListener('keydown', (ev) => {
      const k = ev.key.toLowerCase();

      // 暂停键在暂停态也要能用（此时 input 整体是禁用的）
      if (k === 'p' || k === 'escape') {
        if (this.onPause) this.onPause();
        return;
      }

      if (!this.enabled) return;
      if (MOVE_KEYS[k] || k === ' ' || k === 'b') ev.preventDefault();
      this.keys.add(k);
      if (k === 'b' || k === ' ') this.bombRequested = true;
    }, { passive: false });

    window.addEventListener('keyup', (ev) => {
      this.keys.delete(ev.key.toLowerCase());
    });

    window.addEventListener('blur', () => this.keys.clear());
  }

  setEnabled(v) {
    this.enabled = v;
    if (!v) {
      this.keys.clear();
      this.pointer.down = false;
      this.pointer.active = false;
      this.bombRequested = false;
    }
  }

  /** 开局把指针锚定在飞机附近，避免第一帧瞬移 */
  anchor(x, y) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.active = false;
    this.pointer.down = false;
  }

  get axisX() {
    return (this.keys.has('arrowright') || this.keys.has('d') ? 1 : 0)
      - (this.keys.has('arrowleft') || this.keys.has('a') ? 1 : 0);
  }

  get axisY() {
    return (this.keys.has('arrowdown') || this.keys.has('s') ? 1 : 0)
      - (this.keys.has('arrowup') || this.keys.has('w') ? 1 : 0);
  }

  consumeBomb() {
    const v = this.bombRequested;
    this.bombRequested = false;
    return v;
  }
}

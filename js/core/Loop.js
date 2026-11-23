/**
 * 固定步长主循环。
 * 逻辑固定 60Hz（累加器），渲染跟随 rAF；页面切后台自动暂停计时，
 * 避免回来时一次追很多帧。
 */
import { FPS_STEP } from './config.js';

export class Loop {
  constructor(update, render) {
    this.update = update;
    this.render = render;
    this.step = FPS_STEP;
    this.acc = 0;
    this.last = 0;
    this.raf = 0;
    this.running = false;
    this.frame = this.frame.bind(this);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.last = performance.now();
    });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.acc = 0;
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  frame(now) {
    if (!this.running) return;
    let dt = (now - this.last) / 1000;
    this.last = now;
    // 切标签页回来后不要补帧
    if (dt > 0.25) dt = 0.25;
    this.acc += dt;

    let steps = 0;
    try {
      while (this.acc >= this.step && steps < 5) {
        this.update(this.step);
        this.acc -= this.step;
        steps++;
      }
      if (steps === 5) this.acc = 0;

      this.render(this.acc / this.step);
    } catch (err) {
      // 单帧异常不应让整个循环停下来：记录后继续排下一帧
      if (!this.errored) {
        this.errored = true;
        console.error('[loop] frame error', err);
      }
      this.acc = 0;
    }
    this.raf = requestAnimationFrame(this.frame);
  }
}

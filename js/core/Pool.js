/**
 * 极简对象池。子弹、敌机、道具都走这里，避免每帧 new 出垃圾。
 * 约定：对象实现 init(...args) / update(dt) / draw(ctx)，并用 o.dead 标记回收。
 */
export class Pool {
  constructor(factory, initial = 0) {
    this.factory = factory;
    this.free = [];
    this.live = [];
    for (let i = 0; i < initial; i++) this.free.push(factory());
  }

  spawn(...args) {
    const o = this.free.pop() || this.factory();
    o.dead = false;
    if (typeof o.init === 'function') o.init(...args);
    this.live.push(o);
    return o;
  }

  update(dt) {
    const live = this.live;
    for (let i = live.length - 1; i >= 0; i--) {
      const o = live[i];
      o.update(dt);
      if (o.dead) {
        live.splice(i, 1);
        this.free.push(o);
      }
    }
  }

  draw(ctx) {
    for (const o of this.live) o.draw(ctx);
  }

  forEach(fn) {
    for (const o of this.live) fn(o);
  }

  clear() {
    while (this.live.length) {
      const o = this.live.pop();
      o.dead = true;
      this.free.push(o);
    }
  }

  get count() {
    return this.live.length;
  }
}

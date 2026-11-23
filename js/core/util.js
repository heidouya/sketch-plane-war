export const TAU = Math.PI * 2;

export function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** 与帧率无关的指数平滑系数 */
export function damp(dt, rate) {
  return 1 - Math.exp(-dt * rate);
}

export function rand(a = 0, b = 1) {
  return a + Math.random() * (b - a);
}

export function randInt(a, b) {
  return Math.floor(rand(a, b + 1));
}

export function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function chance(p) {
  return Math.random() < p;
}

export function formatScore(n) {
  return String(Math.max(0, Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 把秒数格式化成 1'05" */
export function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}'${String(s % 60).padStart(2, '0')}`;
}

export function circleHit(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const rr = (a.r || 0) + (b.r || 0);
  return dx * dx + dy * dy <= rr * rr;
}

export function pointInCircle(px, py, c) {
  const dx = px - c.x;
  const dy = py - c.y;
  return dx * dx + dy * dy <= (c.r || 0) * (c.r || 0);
}

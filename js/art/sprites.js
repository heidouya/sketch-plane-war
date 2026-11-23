/**
 * 全部手绘精灵：玩家机、四类敌机、三种 Boss、子弹、道具、云与月亮。
 * 统一朝下 / 朝上的符号约定：
 *   - 玩家与玩家子弹朝上（-y）
 *   - 敌机、Boss、敌弹朝下（+y）
 */
import { INK, INK_SOFT, PAPER_SHADE, draw, hatch, paint, sprite, scribble } from './sketch.js';

const mirror = (pts) => pts.map(([x, y]) => [-x, y]);

/* ------------------------------- 玩家 ------------------------------ */

function playerPlane(ctx) {
  // 机翼（左右）
  paint(ctx, draw.poly([[-4, -8], [-29, 12], [-27, 19], [-11, 11], [-9, 1]], hatch({ seed: 3, hachureGap: 7 })));
  paint(ctx, draw.poly([[4, -8], [29, 12], [27, 19], [11, 11], [9, 1]], hatch({ seed: 7, hachureGap: 7 })));

  // 尾翼
  paint(ctx, draw.poly([[-2, 21], [-14, 29], [-12, 32], [-2, 28]], { seed: 9 }));
  paint(ctx, draw.poly([[2, 21], [14, 29], [12, 32], [2, 28]], { seed: 11 }));

  // 机身
  paint(
    ctx,
    draw.poly(
      [[0, -33], [5, -22], [8, -6], [8.5, 6], [6, 20], [3, 30], [0, 33], [-3, 30], [-6, 20], [-8.5, 6], [-8, -6], [-5, -22]],
      { seed: 13 }
    )
  );

  // 座舱
  paint(ctx, draw.ellipse(0, -11, 11, 19, hatch({ seed: 17, hachureGap: 5, hachureAngle: -70 })));
  paint(ctx, draw.ellipse(0, -11, 6, 13, { seed: 19, strokeWidth: 0.7, stroke: INK_SOFT }));

  // 机身细节：进气口与检修线
  paint(ctx, draw.line(-5, 2, 5, 2, { seed: 21, strokeWidth: 0.7, stroke: INK_SOFT }));
  paint(ctx, draw.line(0, 3, 0, 15, { seed: 23, strokeWidth: 0.7, stroke: INK_SOFT }));

  // 双发动机
  paint(ctx, draw.circle(-4.6, 21, 6, { seed: 25, strokeWidth: 0.9 }));
  paint(ctx, draw.circle(4.6, 21, 6, { seed: 27, strokeWidth: 0.9 }));
  scribble(ctx, -8, 22, 16, 4, { gap: 4, alpha: 0.25 });
}

export const PLAYER = sprite('plane-player', 58, 70, playerPlane, { pad: 10 });

/** 主菜单用的正面视角飞机（对应手稿里的那架） */
export const MENU_PLANE = sprite(
  'plane-menu',
  160,
  150,
  (ctx) => {
    // 机翼
    paint(ctx, draw.poly([[-12, -12], [-78, 22], [-70, 36], [-16, 16]], hatch({ seed: 31, hachureGap: 9 })));
    paint(ctx, draw.poly([[12, -12], [78, 22], [70, 36], [16, 16]], hatch({ seed: 33, hachureGap: 9 })));
    // 翼尖小翼
    paint(ctx, draw.path('M -78 22 Q -88 26 -82 34', { seed: 35, strokeWidth: 0.9 }));
    paint(ctx, draw.path('M 78 22 Q 88 26 82 34', { seed: 37, strokeWidth: 0.9 }));
    // 机身
    paint(
      ctx,
      draw.poly(
        [[0, -52], [10, -40], [14, -14], [13, 16], [8, 40], [0, 44], [-8, 40], [-13, 16], [-14, -14], [-10, -40]],
        { seed: 39 }
      )
    );
    // 座舱罩
    paint(ctx, draw.ellipse(0, -22, 22, 30, hatch({ seed: 41, hachureGap: 6 })));
    paint(ctx, draw.ellipse(0, -22, 13, 20, { seed: 43, strokeWidth: 0.8, stroke: INK_SOFT }));
    // 进气口
    paint(ctx, draw.rect(-11, -4, 5, 16, { seed: 45, strokeWidth: 0.8 }));
    paint(ctx, draw.rect(6, -4, 5, 16, { seed: 47, strokeWidth: 0.8 }));
    // 发动机短舱
    paint(ctx, draw.ellipse(-17, 20, 16, 24, { seed: 49 }));
    paint(ctx, draw.ellipse(17, 20, 16, 24, { seed: 51 }));
    scribble(ctx, -24, 28, 14, 8, { gap: 4, alpha: 0.25 });
    scribble(ctx, 10, 28, 14, 8, { gap: 4, alpha: 0.25 });
    // 起落架
    paint(ctx, draw.line(-10, 44, -16, 60, { seed: 53, strokeWidth: 1 }));
    paint(ctx, draw.line(10, 44, 16, 60, { seed: 55, strokeWidth: 1 }));
    paint(ctx, draw.circle(-17, 64, 10, hatch({ seed: 57, hachureGap: 4 })));
    paint(ctx, draw.circle(17, 64, 10, hatch({ seed: 59, hachureGap: 4 })));
  },
  { pad: 14 }
);

/* ------------------------------- 敌机 ------------------------------ */

export const SCOUT = sprite(
  'enemy-scout',
  32,
  36,
  (ctx) => {
    paint(ctx, draw.poly([[0, 18], [-12, -7], [-4, -11], [0, -17], [4, -11], [12, -7]], hatch({ seed: 61, hachureGap: 5 })));
    paint(ctx, draw.circle(0, -2, 7, { seed: 63, strokeWidth: 0.8 }));
    paint(ctx, draw.line(-9, -3, 9, -3, { seed: 65, strokeWidth: 0.6, stroke: INK_SOFT }));
  },
  { pad: 6 }
);

export const FIGHTER = sprite(
  'enemy-fighter',
  44,
  48,
  (ctx) => {
    paint(ctx, draw.poly([[-7, 1], [-22, -8], [-20, -14], [-8, -6]], { seed: 67 }));
    paint(ctx, draw.poly([[7, 1], [22, -8], [20, -14], [8, -6]], { seed: 69 }));
    paint(
      ctx,
      draw.poly(
        [[0, 23], [6, 12], [8, 1], [6, -12], [3, -19], [0, -21], [-3, -19], [-6, -12], [-8, 1], [-6, 12]],
        { seed: 71 }
      )
    );
    paint(ctx, draw.poly([[-1, 14], [-12, 21], [-9, 25], [-1, 22]], { seed: 73 }));
    paint(ctx, draw.poly([[1, 14], [12, 21], [9, 25], [1, 22]], { seed: 75 }));
    paint(ctx, draw.ellipse(0, 3, 9, 13, hatch({ seed: 77, hachureGap: 5 })));
  },
  { pad: 6 }
);

export const BOMBER = sprite(
  'enemy-bomber',
  70,
  62,
  (ctx) => {
    paint(ctx, draw.poly([[-10, -6], [-34, -16], [-32, -4], [-10, 10]], hatch({ seed: 79, hachureGap: 8 })));
    paint(ctx, draw.poly([[10, -6], [34, -16], [32, -4], [10, 10]], hatch({ seed: 81, hachureGap: 8 })));
    paint(ctx, draw.ellipse(0, 0, 30, 52, { seed: 83 }));
    paint(ctx, draw.circle(-17, 6, 13, hatch({ seed: 85, hachureGap: 5 })));
    paint(ctx, draw.circle(17, 6, 13, hatch({ seed: 87, hachureGap: 5 })));
    paint(ctx, draw.ellipse(0, -16, 14, 12, { seed: 89 }));
    // 弹舱
    paint(ctx, draw.line(-9, 16, -3, 16, { seed: 91, strokeWidth: 0.7 }));
    paint(ctx, draw.line(3, 16, 9, 16, { seed: 93, strokeWidth: 0.7 }));
    paint(ctx, draw.line(-9, 21, -3, 21, { seed: 95, strokeWidth: 0.7 }));
    paint(ctx, draw.line(3, 21, 9, 21, { seed: 97, strokeWidth: 0.7 }));
  },
  { pad: 8 }
);

export const ELITE = sprite(
  'enemy-elite',
  46,
  50,
  (ctx) => {
    // 前掠翼 + 尖刺
    paint(ctx, draw.poly([[-5, -2], [-23, 15], [-14, 19], [-4, 8]], hatch({ seed: 99, hachureGap: 4, hachureAngle: -30 })));
    paint(ctx, draw.poly([[5, -2], [23, 15], [14, 19], [4, 8]], hatch({ seed: 101, hachureGap: 4, hachureAngle: -30 })));
    paint(ctx, draw.line(-23, 15, -29, 20, { seed: 103, strokeWidth: 1 }));
    paint(ctx, draw.line(23, 15, 29, 20, { seed: 105, strokeWidth: 1 }));
    paint(
      ctx,
      draw.poly(
        [[0, 24], [5, 14], [7, 2], [5, -10], [2, -18], [0, -20], [-2, -18], [-5, -10], [-7, 2], [-5, 14]],
        { seed: 107 }
      )
    );
    paint(ctx, draw.ellipse(0, 4, 8, 12, hatch({ seed: 109, hachureGap: 4 })));
    // 尾焰口
    paint(ctx, draw.circle(0, -18, 6, { seed: 111, strokeWidth: 0.9 }));
  },
  { pad: 8 }
);

/* ------------------------------- Boss ------------------------------ */

function bossGunship(ctx) {
  // 主翼
  paint(ctx, draw.poly([[-6, -6], [-98, 0], [-92, 20], [-8, 14]], hatch({ seed: 113, hachureGap: 9 })));
  paint(ctx, draw.poly([[6, -6], [98, 0], [92, 20], [8, 14]], hatch({ seed: 115, hachureGap: 9 })));
  // 翼尖炮塔
  paint(ctx, draw.circle(-88, 8, 16, hatch({ seed: 117, hachureGap: 4 })));
  paint(ctx, draw.circle(88, 8, 16, hatch({ seed: 119, hachureGap: 4 })));
  // 机身
  paint(
    ctx,
    draw.poly(
      [[0, -52], [34, -36], [52, -10], [46, 18], [18, 34], [0, 42], [-18, 34], [-46, 18], [-52, -10], [-34, -36]],
      { seed: 121 }
    )
  );
  // 装甲排线
  paint(ctx, draw.arc(0, -12, 76, 42, 0.15, Math.PI - 0.15, false, { seed: 123, strokeWidth: 0.8, stroke: INK_SOFT }));
  paint(ctx, draw.line(-36, -18, 36, -18, { seed: 125, strokeWidth: 0.7, stroke: INK_SOFT }));
  paint(ctx, draw.line(-30, 0, 30, 0, { seed: 127, strokeWidth: 0.7, stroke: INK_SOFT }));
  // 中央炮塔
  paint(ctx, draw.circle(0, 18, 20, hatch({ seed: 129, hachureGap: 4 })));
  paint(ctx, draw.line(0, 26, 0, 46, { seed: 131, strokeWidth: 2 }));
  paint(ctx, draw.line(-30, 10, -30, 32, { seed: 133, strokeWidth: 1.6 }));
  paint(ctx, draw.line(30, 10, 30, 32, { seed: 135, strokeWidth: 1.6 }));
}

function bossTwin(ctx) {
  for (const sx of [-1, 1]) {
    // 双体机身
    paint(ctx, draw.poly([[sx * 50, -50], [sx * 26, -40], [sx * 20, -6], [sx * 28, 26], [sx * 50, 34], [sx * 74, 26], [sx * 82, -6], [sx * 74, -40]], { seed: sx > 0 ? 143 : 141 }));
    paint(ctx, draw.circle(sx * 50, 6, 26, hatch({ seed: sx > 0 ? 147 : 145, hachureGap: 5 })));
    paint(ctx, draw.line(sx * 50, 19, sx * 50, 40, { seed: sx > 0 ? 151 : 149, strokeWidth: 2 }));
    // 尾翼
    paint(ctx, draw.poly([[sx * 50, -44], [sx * 22, -58], [sx * 24, -48], [sx * 44, -38]], { seed: sx > 0 ? 155 : 153 }));
  }
  // 连接桥
  paint(ctx, draw.rect(-34, -12, 68, 26, hatch({ seed: 157, hachureGap: 6 })));
  paint(ctx, draw.line(-20, 6, 20, 6, { seed: 159, strokeWidth: 0.8, stroke: INK_SOFT }));
  // 四联炮口
  for (const x of [-62, -38, 38, 62]) {
    paint(ctx, draw.line(x, 28, x, 44, { seed: 160 + x, strokeWidth: 1.6 }));
  }
}

function bossFortress(ctx) {
  paint(
    ctx,
    draw.poly(
      [[0, -60], [58, -46], [104, -16], [112, 14], [86, 38], [30, 52], [0, 58], [-30, 52], [-86, 38], [-112, 14], [-104, -16], [-58, -46]],
      { seed: 161 }
    )
  );
  // 分层装甲
  paint(ctx, draw.arc(0, 8, 150, 96, Math.PI * 1.08, Math.PI * 1.92, false, { seed: 163, strokeWidth: 1 }));
  paint(ctx, draw.arc(0, 12, 112, 70, Math.PI * 1.15, Math.PI * 1.85, false, { seed: 165, strokeWidth: 0.9 }));
  paint(ctx, draw.line(-70, -8, 70, -8, { seed: 167, strokeWidth: 0.8, stroke: INK_SOFT }));
  paint(ctx, draw.line(-52, 20, 52, 20, { seed: 169, strokeWidth: 0.7, stroke: INK_SOFT }));
  // 核心
  paint(ctx, draw.circle(0, 4, 34, hatch({ seed: 171, hachureGap: 4, hachureAngle: -40 })));
  paint(ctx, draw.circle(0, 4, 16, { seed: 173, strokeWidth: 1.4 }));
  // 四角炮塔
  for (const [x, y, s] of [[-62, -4, 175], [62, -4, 177], [-26, 30, 179], [26, 30, 181]]) {
    paint(ctx, draw.circle(x, y, 18, hatch({ seed: s, hachureGap: 4 })));
    paint(ctx, draw.line(x, y + 9, x, y + (y === 30 ? 36 : 26), { seed: s + 1, strokeWidth: 1.8 }));
  }
  // 边缘尖刺
  for (const sx of [-1, 1]) {
    paint(ctx, draw.line(sx * 104, -16, sx * 122, -24, { seed: 190 + sx, strokeWidth: 1.2 }));
    paint(ctx, draw.line(sx * 108, 8, sx * 124, 14, { seed: 192 + sx, strokeWidth: 1.2 }));
  }
}

export const BOSSES = {
  gunship: sprite('boss-gunship', 200, 124, bossGunship, { pad: 16 }),
  twin: sprite('boss-twin', 190, 130, bossTwin, { pad: 16 }),
  fortress: sprite('boss-fortress', 250, 140, bossFortress, { pad: 18 }),
};

/* ------------------------------- 子弹 ------------------------------ */

export const BULLET_PLAYER = sprite(
  'bullet-player',
  12,
  24,
  (ctx) => {
    paint(ctx, draw.poly([[0, -11], [-4, 2], [0, 9], [4, 2]], { seed: 201, strokeWidth: 1.1 }));
    paint(ctx, draw.line(0, 6, 0, 12, { seed: 203, strokeWidth: 0.7, stroke: INK_SOFT }));
  },
  { pad: 4, scale: 3 }
);

export const BULLET_ENEMY = sprite(
  'bullet-enemy',
  14,
  14,
  (ctx) => {
    paint(ctx, draw.circle(0, 0, 9, hatch({ seed: 205, hachureGap: 3, fillWeight: 0.9 })));
    paint(ctx, draw.circle(0, 0, 3, { seed: 207, strokeWidth: 1 }));
  },
  { pad: 3, scale: 3 }
);

export const BULLET_BOSS = sprite(
  'bullet-boss',
  22,
  22,
  (ctx) => {
    paint(ctx, draw.circle(0, 0, 16, hatch({ seed: 209, hachureGap: 3.5 })));
    paint(ctx, draw.circle(0, 0, 7, { seed: 211, strokeWidth: 1.2 }));
    paint(ctx, draw.line(-4, 0, 4, 0, { seed: 213, strokeWidth: 0.9 }));
  },
  { pad: 4, scale: 3 }
);

/* ------------------------------- 道具 ------------------------------ */

const POWER_STYLE = {
  power: { letter: 'P', tone: INK },
  shield: { letter: 'S', tone: INK },
  bomb: { letter: 'B', tone: INK },
  life: { letter: '+', tone: INK },
};

function powerPainter(type) {
  return (ctx) => {
    const { letter } = POWER_STYLE[type];
    paint(ctx, draw.circle(0, 0, 28, hatch({ seed: 300 + type.length, hachureGap: 9, fillWeight: 0.4 })));
    paint(ctx, draw.circle(0, 0, 20, { seed: 302, strokeWidth: 0.8, stroke: INK_SOFT }));
    // 四角小刻线
    for (const [x, y] of [[0, -17], [0, 17], [-17, 0], [17, 0]]) {
      paint(ctx, draw.line(x * 0.72, y * 0.72, x, y, { seed: 310 + x + y, strokeWidth: 0.7 }));
    }
    ctx.save();
    ctx.fillStyle = INK;
    ctx.font = '700 17px "KaiTi","STKaiti","KaiTi SC",serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 0, 1);
    ctx.restore();
  };
}

export const POWERUPS = {
  power: sprite('power-power', 36, 36, powerPainter('power'), { pad: 4 }),
  shield: sprite('power-shield', 36, 36, powerPainter('shield'), { pad: 4 }),
  bomb: sprite('power-bomb', 36, 36, powerPainter('bomb'), { pad: 4 }),
  life: sprite('power-life', 36, 36, powerPainter('life'), { pad: 4 }),
};

/* ------------------------------- 特效 ------------------------------ */

export const FX_RING = sprite(
  'fx-ring',
  96,
  96,
  (ctx) => {
    paint(ctx, draw.circle(0, 0, 88, { seed: 401, roughness: 2.2, strokeWidth: 2.2 }));
    paint(ctx, draw.circle(0, 0, 76, { seed: 403, roughness: 2.4, strokeWidth: 1, stroke: INK_SOFT }));
  },
  { pad: 6 }
);

export const FX_SHIELD = sprite(
  'fx-shield',
  104,
  104,
  (ctx) => {
    paint(ctx, draw.circle(0, 0, 94, { seed: 405, roughness: 1.6, strokeWidth: 1.4, stroke: INK_SOFT }));
    paint(ctx, draw.circle(0, 0, 84, { seed: 407, roughness: 3, strokeWidth: 0.8, stroke: INK }));
  },
  { pad: 6 }
);

/* ------------------------------- 背景 ------------------------------ */

function cloudPainter(seed, lobes) {
  return (ctx) => {
    const raw = [
      [0, 6, 96, 38],
      [-32, -2, 62, 30],
      [30, -6, 58, 26],
      [-10, -14, 40, 24],
      [12, 16, 70, 26],
      [-46, 12, 46, 20],
      [46, 12, 42, 18],
      [-22, -20, 30, 18],
    ];
    for (let i = 0; i < lobes; i++) {
      const [x, y, w, h] = raw[i % raw.length];
      paint(
        ctx,
        draw.ellipse(x, y, w, h, {
          seed: seed + i * 7,
          roughness: 1.7,
          strokeWidth: 1,
          stroke: INK_SOFT,
          fill: 'rgba(120,112,96,0.07)',
          fillStyle: 'solid',
        })
      );
    }
    // 云底排线
    scribble(ctx, -40, 6, 80, 16, { gap: 6, alpha: 0.18 });
  };
}

export const CLOUDS = [
  sprite('cloud-a', 150, 70, cloudPainter(501, 6), { pad: 14 }),
  sprite('cloud-b', 210, 90, cloudPainter(511, 8), { pad: 16 }),
  sprite('cloud-c', 96, 50, cloudPainter(521, 5), { pad: 10 }),
  sprite('cloud-d', 250, 100, cloudPainter(531, 8), { pad: 18 }),
];

export const MOON = sprite(
  'moon',
  170,
  170,
  (ctx) => {
    paint(ctx, draw.circle(0, 0, 150, { seed: 541, strokeWidth: 1.6, roughness: 1.9 }));
    paint(ctx, draw.circle(-34, 26, 56, hatch({ seed: 543, hachureGap: 9, fillWeight: 0.9 })));
    paint(ctx, draw.circle(40, -20, 34, hatch({ seed: 545, hachureGap: 9, fillWeight: 0.9 })));
    paint(ctx, draw.circle(-20, -30, 18, { seed: 547, strokeWidth: 0.8 }));
    paint(ctx, draw.circle(48, 34, 12, { seed: 549, strokeWidth: 0.8 }));
    scribble(ctx, -70, -50, 60, 30, { gap: 8, alpha: 0.12 });
  },
  { pad: 10 }
);

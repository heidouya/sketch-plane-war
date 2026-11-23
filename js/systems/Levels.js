/**
 * 12 个关卡：波次表 + Boss 型号。
 * 波次字段：
 *   at      开始时间（秒）
 *   type    scout | fighter | bomber | elite
 *   count   数量
 *   gap     每架之间的间隔
 *   formation  'line'（横排）| 'column'（同列）| 'sides'（左右交替）| 'random'
 *   pattern    'straight' | 'sine' | 'drift' | 'hold' | 'dive'
 *   hpScale / speedScale / dropBoost  难度微调
 */
const wave = (at, type, count, gap, opts = {}) => ({ at, type, count, gap, ...opts });

export const LEVELS = [
  {
    id: 1,
    name: '晨雾起飞',
    tag: '热身',
    intro: '云层很浅，先把手指放上去。',
    waves: [
      wave(3, 'scout', 5, 0.5, { formation: 'line', spread: 250 }),
      wave(11, 'scout', 6, 0.45, { formation: 'line', spread: 320, pattern: 'sine' }),
      wave(19, 'fighter', 2, 1.1, { formation: 'sides' }),
      wave(27, 'scout', 8, 0.35, { formation: 'line', spread: 300 }),
      wave(35, 'fighter', 3, 1, { formation: 'random' }),
      wave(43, 'scout', 10, 0.3, { formation: 'line', spread: 340, pattern: 'sine' }),
      wave(52, 'fighter', 4, 0.9, { formation: 'line', spread: 220 }),
    ],
    boss: { kind: 'gunship', hp: 300, name: '晨雾巡逻舰' },
  },
  {
    id: 2,
    name: '云上哨所',
    tag: '第一道防线',
    intro: '哨所的探照灯扫过来了。',
    waves: [
      wave(3, 'scout', 6, 0.45, { formation: 'line', spread: 300 }),
      wave(10, 'fighter', 2, 1, { formation: 'sides', pattern: 'drift' }),
      wave(17, 'scout', 8, 0.35, { formation: 'line', spread: 340, pattern: 'sine' }),
      wave(24, 'fighter', 4, 0.9, { formation: 'random', pattern: 'hold' }),
      wave(33, 'scout', 10, 0.3, { formation: 'line', spread: 360, speedScale: 1.1 }),
      wave(41, 'fighter', 3, 1, { formation: 'line', spread: 260 }),
      wave(49, 'scout', 8, 0.35, { formation: 'sides', pattern: 'drift' }),
      wave(56, 'fighter', 4, 0.85, { formation: 'random' }),
    ],
    boss: { kind: 'gunship', hp: 340, name: '云上哨戒机' },
  },
  {
    id: 3,
    name: '铁皮峡谷',
    tag: '轰炸机入列',
    intro: '峡谷里塞满了会吐铁片的大家伙。',
    waves: [
      wave(3, 'scout', 6, 0.4, { formation: 'line', spread: 300 }),
      wave(10, 'bomber', 1, 1, { formation: 'column' }),
      wave(17, 'fighter', 4, 0.8, { formation: 'line', spread: 240, pattern: 'hold' }),
      wave(26, 'bomber', 2, 1.3, { formation: 'sides' }),
      wave(34, 'scout', 10, 0.3, { formation: 'line', spread: 360, pattern: 'sine' }),
      wave(42, 'fighter', 5, 0.75, { formation: 'line', spread: 300 }),
      wave(50, 'bomber', 2, 1.2, { formation: 'line', spread: 200 }),
      wave(58, 'fighter', 4, 0.9, { formation: 'sides', pattern: 'dive' }),
    ],
    boss: { kind: 'gunship', hp: 390, name: '峡谷装甲艇' },
  },
  {
    id: 4,
    name: '逆风航线',
    tag: '精英登场',
    intro: '风是逆的，子弹也是。',
    waves: [
      wave(3, 'scout', 8, 0.35, { formation: 'line', spread: 340, pattern: 'sine' }),
      wave(11, 'elite', 2, 1.4, { formation: 'sides' }),
      wave(19, 'fighter', 4, 0.8, { formation: 'random', pattern: 'drift' }),
      wave(27, 'bomber', 2, 1.3, { formation: 'line', spread: 220 }),
      wave(35, 'elite', 3, 1.2, { formation: 'line', spread: 260 }),
      wave(44, 'scout', 12, 0.28, { formation: 'line', spread: 380, speedScale: 1.15 }),
      wave(52, 'elite', 2, 1.3, { formation: 'sides', pattern: 'dive' }),
      wave(60, 'fighter', 5, 0.7, { formation: 'line', spread: 300 }),
    ],
    boss: { kind: 'twin', hp: 430, name: '双联逆风机' },
  },
  {
    id: 5,
    name: '双塔空域',
    tag: '对称压制',
    intro: '两边一起来，别只看一边。',
    waves: [
      wave(3, 'fighter', 4, 0.8, { formation: 'sides' }),
      wave(10, 'scout', 8, 0.35, { formation: 'sides', pattern: 'drift' }),
      wave(18, 'bomber', 2, 1.2, { formation: 'sides' }),
      wave(26, 'elite', 3, 1.2, { formation: 'sides', pattern: 'hold' }),
      wave(34, 'fighter', 6, 0.7, { formation: 'sides' }),
      wave(43, 'bomber', 3, 1.1, { formation: 'line', spread: 280 }),
      wave(51, 'scout', 12, 0.3, { formation: 'line', spread: 360, pattern: 'sine' }),
      wave(59, 'elite', 3, 1.1, { formation: 'random' }),
      wave(66, 'fighter', 5, 0.75, { formation: 'sides' }),
    ],
    boss: { kind: 'twin', hp: 470, name: '双塔守门人' },
  },
  {
    id: 6,
    name: '墨色雷区',
    tag: '弹幕密集',
    intro: '这里的雨点都是横着飞的。',
    waves: [
      wave(3, 'fighter', 6, 0.7, { formation: 'line', spread: 320, pattern: 'hold' }),
      wave(11, 'scout', 10, 0.3, { formation: 'line', spread: 380 }),
      wave(19, 'bomber', 2, 1.2, { formation: 'sides', pattern: 'drift' }),
      wave(27, 'fighter', 6, 0.65, { formation: 'random', pattern: 'hold' }),
      wave(36, 'elite', 4, 1, { formation: 'line', spread: 300 }),
      wave(44, 'bomber', 3, 1.1, { formation: 'line', spread: 260 }),
      wave(52, 'fighter', 8, 0.6, { formation: 'line', spread: 360, pattern: 'sine' }),
      wave(61, 'scout', 14, 0.26, { formation: 'line', spread: 400, speedScale: 1.2 }),
    ],
    boss: { kind: 'gunship', hp: 520, name: '雷区清扫舰' },
  },
  {
    id: 7,
    name: '断线高空',
    tag: '高速缠斗',
    intro: '云断了，脚下是空白的。',
    waves: [
      wave(3, 'scout', 12, 0.28, { formation: 'line', spread: 400, pattern: 'sine', speedScale: 1.15 }),
      wave(11, 'elite', 3, 1.1, { formation: 'random', pattern: 'drift' }),
      wave(19, 'fighter', 6, 0.65, { formation: 'line', spread: 320 }),
      wave(27, 'elite', 4, 1, { formation: 'sides', pattern: 'hold' }),
      wave(35, 'bomber', 3, 1.1, { formation: 'line', spread: 240 }),
      wave(44, 'scout', 14, 0.25, { formation: 'line', spread: 420, speedScale: 1.25 }),
      wave(52, 'elite', 4, 0.95, { formation: 'line', spread: 300, pattern: 'dive' }),
      wave(60, 'fighter', 7, 0.6, { formation: 'random' }),
    ],
    boss: { kind: 'twin', hp: 560, name: '断线截击机' },
  },
  {
    id: 8,
    name: '折翼之地',
    tag: '精英集群',
    intro: '折翼的都在这里等着。',
    waves: [
      wave(3, 'elite', 3, 1.1, { formation: 'sides' }),
      wave(11, 'bomber', 3, 1, { formation: 'line', spread: 260 }),
      wave(19, 'elite', 4, 1, { formation: 'line', spread: 320, pattern: 'sine' }),
      wave(27, 'fighter', 8, 0.6, { formation: 'line', spread: 360 }),
      wave(36, 'bomber', 4, 0.9, { formation: 'sides', pattern: 'hold' }),
      wave(44, 'elite', 5, 0.9, { formation: 'random' }),
      wave(53, 'scout', 16, 0.22, { formation: 'line', spread: 420, speedScale: 1.3 }),
      wave(61, 'elite', 4, 0.9, { formation: 'line', spread: 280, pattern: 'dive' }),
    ],
    boss: { kind: 'fortress', hp: 600, name: '折翼要塞' },
  },
  {
    id: 9,
    name: '风暴眼',
    tag: '全兵种混编',
    intro: '风暴眼里没有单一的颜色。',
    waves: [
      wave(3, 'fighter', 6, 0.7, { formation: 'sides' }),
      wave(10, 'elite', 4, 1, { formation: 'line', spread: 300, pattern: 'drift' }),
      wave(18, 'bomber', 3, 1.1, { formation: 'line', spread: 280 }),
      wave(26, 'scout', 16, 0.24, { formation: 'line', spread: 420, speedScale: 1.2 }),
      wave(35, 'elite', 5, 0.9, { formation: 'random', pattern: 'hold' }),
      wave(43, 'bomber', 4, 1, { formation: 'sides' }),
      wave(51, 'fighter', 8, 0.55, { formation: 'line', spread: 380 }),
      wave(60, 'elite', 5, 0.85, { formation: 'line', spread: 300, pattern: 'dive' }),
      wave(68, 'bomber', 3, 1, { formation: 'random' }),
    ],
    boss: { kind: 'fortress', hp: 650, name: '风暴之眼' },
  },
  {
    id: 10,
    name: '纸鸢废墟',
    tag: '弹幕海',
    intro: '纸做的飞机，铁做的弹幕。',
    waves: [
      wave(3, 'bomber', 3, 1.1, { formation: 'sides' }),
      wave(11, 'fighter', 8, 0.6, { formation: 'line', spread: 360, pattern: 'hold' }),
      wave(19, 'elite', 5, 0.9, { formation: 'line', spread: 320 }),
      wave(27, 'bomber', 4, 1, { formation: 'line', spread: 280, pattern: 'drift' }),
      wave(36, 'scout', 18, 0.2, { formation: 'line', spread: 440, speedScale: 1.3 }),
      wave(44, 'fighter', 9, 0.5, { formation: 'line', spread: 400 }),
      wave(53, 'bomber', 4, 0.95, { formation: 'sides', pattern: 'hold' }),
      wave(61, 'elite', 6, 0.8, { formation: 'random' }),
    ],
    boss: { kind: 'gunship', hp: 700, name: '纸鸢母舰' },
  },
  {
    id: 11,
    name: '无声之境',
    tag: '极速精英',
    intro: '安静得能听见机身擦过弹壳。',
    waves: [
      wave(3, 'elite', 5, 0.9, { formation: 'sides', speedScale: 1.1 }),
      wave(11, 'scout', 18, 0.2, { formation: 'line', spread: 440, pattern: 'sine', speedScale: 1.3 }),
      wave(19, 'elite', 6, 0.8, { formation: 'line', spread: 340, pattern: 'drift' }),
      wave(27, 'bomber', 4, 1, { formation: 'sides' }),
      wave(35, 'fighter', 10, 0.5, { formation: 'line', spread: 400 }),
      wave(44, 'elite', 7, 0.75, { formation: 'random', pattern: 'hold' }),
      wave(52, 'bomber', 4, 0.9, { formation: 'line', spread: 300 }),
      wave(60, 'elite', 6, 0.8, { formation: 'sides', pattern: 'dive' }),
    ],
    boss: { kind: 'twin', hp: 740, name: '无声双影' },
  },
  {
    id: 12,
    name: '终章·墨之要塞',
    tag: '最终决战',
    intro: '把最后一页纸画满。',
    waves: [
      wave(3, 'fighter', 10, 0.5, { formation: 'line', spread: 400 }),
      wave(11, 'elite', 6, 0.8, { formation: 'sides' }),
      wave(19, 'bomber', 4, 1, { formation: 'line', spread: 300, pattern: 'hold' }),
      wave(27, 'scout', 20, 0.18, { formation: 'line', spread: 460, speedScale: 1.35 }),
      wave(36, 'elite', 7, 0.75, { formation: 'line', spread: 360, pattern: 'sine' }),
      wave(44, 'bomber', 4, 0.95, { formation: 'sides', pattern: 'drift' }),
      wave(52, 'fighter', 10, 0.55, { formation: 'random' }),
      wave(60, 'elite', 7, 0.8, { formation: 'sides', pattern: 'dive' }),
      wave(68, 'bomber', 5, 0.9, { formation: 'line', spread: 340 }),
    ],
    boss: { kind: 'fortress', hp: 860, name: '墨之要塞' },
  },
];

export const LEVEL_COUNT = LEVELS.length;

export function getLevel(id) {
  return LEVELS[Math.max(0, Math.min(LEVEL_COUNT - 1, id - 1))];
}

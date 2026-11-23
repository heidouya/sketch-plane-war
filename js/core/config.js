/**
 * 全局常量：逻辑分辨率固定为 540 x 960（9:16），
 * 实际画布按容器尺寸与 DPR 缩放，所有游戏逻辑都用这套坐标系。
 */
export const W = 540;
export const H = 960;

/** 玩家可活动区域（留出 HUD 与机身半径） */
export const FIELD = {
  left: 28,
  right: W - 28,
  top: 74,
  bottom: H - 34,
};

export const FPS_STEP = 1 / 60;

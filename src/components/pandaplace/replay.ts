/// <reference types="vite/client" />
/* Shared types + wireframe renderer for the PandaPlaceRL exhibits.
   The JSON under public/pandaplace/ holds *real* rollouts exported from
   MuJoCo, world positions of the arm's bodies each step, so drawing is
   pure playback: no physics, no kinematics, just line art. */

export interface Frame {
  /** World xyz of link0..link7, hand, left/right finger, left/right fingertip. */
  arm: number[][];
  /** Object world xyz. */
  obj: number[];
  /** Policy action this frame: [dx, dy, dz, gripper], each in [-1, 1]. */
  act?: number[];
}

export interface Episode {
  goal: number[];
  success: number;
  /** Step index of first success; null if never solved. */
  solved_at: number | null;
  frames: Frame[];
}

export interface ReplayMeta {
  skeleton: string[];
  table_z: number;
  threshold: number;
}

export interface TrajectoriesFile extends ReplayMeta {
  suites: Record<string, Episode[]>;
}

export interface TimelineFile extends ReplayMeta {
  checkpoints: { steps: number; episodes: Episode[] }[];
  curves: {
    success: { steps: number[]; values: number[] };
    lift: { steps: number[]; values: number[] };
    distance: { steps: number[]; values: number[] };
    stage_transitions: { step: number; stage: number }[];
    stage_names: string[];
  };
}

export interface CurriculumStage {
  index: number;
  name: string;
  randomize_object: boolean;
  object_xy_range: number;
  goal_mix: { near: number; table: number; lifted: number };
  goal_lift_range: number[];
  start_grasped: number;
  gate: { success: number; min_steps: number; max_steps: number };
  episodes: Episode[];
}

export interface CurriculumFile extends ReplayMeta {
  stages: CurriculumStage[];
}

export interface PlaygroundFile extends ReplayMeta {
  heights: number[];
  /** Grid episodes ordered height-major then x, then y (5×5 per height). */
  episodes: Episode[];
}

const cache = new Map<string, Promise<unknown>>();

/** Bump when the exported JSON is regenerated, so browsers drop cached data. */
const DATA_VERSION = "run3-stages2";

export function fetchJson<T>(name: string): Promise<T> {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(`${import.meta.env.BASE_URL}pandaplace/${name}.json?v=${DATA_VERSION}`).then((r) => {
        if (!r.ok) throw new Error(`${name}.json: HTTP ${r.status}`);
        return r.json();
      }),
    );
  }
  return cache.get(name) as Promise<T>;
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

/** Scene centre in MuJoCo world coordinates (x forward, z up). */
const CX = 0.52;
const CY = 0.0;
const TABLE = { x0: 0.3, x1: 0.75, y0: -0.35, y1: 0.35 };

interface Proj {
  (p: number[]): { x: number; y: number };
}

/** Turntable + tilt projection, matching the site's other 3D marks. */
export function makeProjection(
  w: number,
  h: number,
  tableZ: number,
  psi: number,
): Proj {
  const S = w * 0.95;
  const cx = w / 2;
  const cy = h * 0.58;
  const tilt = 0.5;
  const cosP = Math.cos(psi);
  const sinP = Math.sin(psi);
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  return ([wx, wy, wz]) => {
    // recentre; MuJoCo z-up -> screen-space y-up
    const x = wx - CX;
    const z = wy - CY;
    const y = wz - tableZ;
    const X = x * cosP + z * sinP;
    const Z = -x * sinP + z * cosP;
    return { x: cx + X * S, y: cy - (y * cosT - Z * sinT) * S };
  };
}

function polyline(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();
}

/** Draw one replay frame: table, arm skeleton, object cube, goal marker. */
export function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  meta: ReplayMeta,
  episode: Episode,
  frameIdx: number,
  psi: number,
) {
  const proj = makeProjection(w, h, meta.table_z, psi);
  const frame = episode.frames[Math.min(frameIdx, episode.frames.length - 1)];
  const atEnd = frameIdx >= episode.frames.length - 1;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  // table: outline + a sparse grid
  ctx.lineWidth = 0.6;
  ctx.globalAlpha = 0.25;
  polyline(ctx, [
    proj([TABLE.x0, TABLE.y0, meta.table_z]),
    proj([TABLE.x1, TABLE.y0, meta.table_z]),
    proj([TABLE.x1, TABLE.y1, meta.table_z]),
    proj([TABLE.x0, TABLE.y1, meta.table_z]),
    proj([TABLE.x0, TABLE.y0, meta.table_z]),
  ]);
  ctx.globalAlpha = 0.08;
  for (let i = 1; i < 5; i++) {
    const x = TABLE.x0 + ((TABLE.x1 - TABLE.x0) * i) / 5;
    polyline(ctx, [proj([x, TABLE.y0, meta.table_z]), proj([x, TABLE.y1, meta.table_z])]);
    const y = TABLE.y0 + ((TABLE.y1 - TABLE.y0) * i) / 5;
    polyline(ctx, [proj([TABLE.x0, y, meta.table_z]), proj([TABLE.x1, y, meta.table_z])]);
  }

  // goal marker: crosshair + dashed circle of radius = success threshold
  const g = proj(episode.goal);
  ctx.globalAlpha = atEnd && episode.success ? 0.9 : 0.55;
  ctx.lineWidth = 0.8;
  ctx.setLineDash([3, 3]);
  const rPix =
    Math.hypot(
      proj([episode.goal[0] + meta.threshold, episode.goal[1], episode.goal[2]]).x - g.x,
      proj([episode.goal[0] + meta.threshold, episode.goal[1], episode.goal[2]]).y - g.y,
    ) || 6;
  ctx.beginPath();
  ctx.arc(g.x, g.y, rPix, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  polyline(ctx, [{ x: g.x - 4, y: g.y }, { x: g.x + 4, y: g.y }]);
  polyline(ctx, [{ x: g.x, y: g.y - 4 }, { x: g.x, y: g.y + 4 }]);
  // drop line from lifted goals down to the table
  if (episode.goal[2] > meta.table_z + 0.01) {
    ctx.globalAlpha = 0.15;
    polyline(ctx, [g, proj([episode.goal[0], episode.goal[1], meta.table_z])]);
  }

  // object: wireframe cube (4 cm)
  const s = 0.02;
  const [ox, oy, oz] = frame.obj;
  const corners: number[][] = [];
  for (let i = 0; i < 8; i++) {
    corners.push([
      ox + (i & 1 ? s : -s),
      oy + (i & 2 ? s : -s),
      oz + (i & 4 ? s : -s),
    ]);
  }
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 0.9;
  for (let i = 0; i < 8; i++) {
    for (const bit of [1, 2, 4]) {
      if (!(i & bit)) polyline(ctx, [proj(corners[i]), proj(corners[i | bit])]);
    }
  }

  // arm: chain link0..hand, then two gripper prongs hand -> finger -> fingertip
  const chain = frame.arm.slice(0, 9).map(proj);
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = w * 0.012;
  polyline(ctx, chain);
  ctx.lineWidth = w * 0.007;
  const hand = chain[8];
  const hasTips = frame.arm.length >= 13;
  for (const [finger, tip] of [[9, 11], [10, 12]]) {
    const prong = [hand, proj(frame.arm[finger])];
    if (hasTips) prong.push(proj(frame.arm[tip]));
    polyline(ctx, prong);
  }

  // joints
  ctx.globalAlpha = 0.95;
  for (const j of chain) {
    ctx.beginPath();
    ctx.arc(j.x, j.y, w * 0.009, 0, Math.PI * 2);
    ctx.fill();
  }

  // action gauges: the policy's four command channels, live
  if (frame.act) {
    const labels = ["dx", "dy", "dz", "gr"];
    const gx = 8;
    const gw = 44;
    ctx.font = `7px ui-monospace, monospace`;
    ctx.textBaseline = "middle";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const gy = h - 46 + i * 11;
      ctx.globalAlpha = 0.45;
      ctx.fillText(labels[i], gx, gy);
      ctx.globalAlpha = 0.2;
      polyline(ctx, [{ x: gx + 14, y: gy }, { x: gx + 14 + gw, y: gy }]);
      polyline(ctx, [{ x: gx + 14 + gw / 2, y: gy - 3 }, { x: gx + 14 + gw / 2, y: gy + 3 }]);
      const v = Math.max(-1, Math.min(1, frame.act[i]));
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 2.5;
      polyline(ctx, [
        { x: gx + 14 + gw / 2, y: gy },
        { x: gx + 14 + gw / 2 + (v * gw) / 2, y: gy },
      ]);
      ctx.lineWidth = 1;
    }
  }

  // success flourish: double ring on the goal, as a terminal state deserves
  if (atEnd && episode.success) {
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(g.x, g.y, rPix + 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

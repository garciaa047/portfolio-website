import { MarkCanvas } from "./MarkCanvas";

type Pt = { x: number; y: number };

function smooth(x: number) {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
}
function lerp(a: Pt, b: Pt, f: number): Pt {
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

/**
 * RobotArmMark: a two-link wireframe arm (à la a Franka Panda) cycling a
 * pick-and-place: reach down to an object, grip, lift, carry, release.
 * Solved with 2-link inverse kinematics. A literal nod to MARWS.
 */
export function RobotArmMark({ size = 220 }: { size?: number }) {
  return (
    <MarkCanvas
      size={size}
      draw={({ ctx, w, h, color, t }) => {
        const base: Pt = { x: w * 0.5, y: h * 0.84 };
        const L1 = w * 0.27;
        const L2 = w * 0.23;
        const tableY = h * 0.78;

        const home: Pt = { x: w * 0.5, y: h * 0.32 };
        const pick: Pt = { x: w * 0.74, y: tableY - h * 0.06 };
        const lift: Pt = { x: w * 0.6, y: h * 0.34 };
        const drop: Pt = { x: w * 0.26, y: h * 0.5 };

        // pick-and-place timeline
        const p = ((t * 0.0045) % 1 + 1) % 1;
        const segs = [
          { a: home, b: pick, lo: 0.0, hi: 0.26 },
          { a: pick, b: pick, lo: 0.26, hi: 0.34 },
          { a: pick, b: lift, lo: 0.34, hi: 0.58 },
          { a: lift, b: drop, lo: 0.58, hi: 0.76 },
          { a: drop, b: drop, lo: 0.76, hi: 0.84 },
          { a: drop, b: home, lo: 0.84, hi: 1.0 },
        ];
        let target: Pt = home;
        for (const s of segs) {
          if (p >= s.lo && p < s.hi) {
            target = lerp(s.a, s.b, smooth((p - s.lo) / (s.hi - s.lo)));
            break;
          }
        }
        const gripped = p >= 0.3 && p < 0.8;
        const object: Pt = p < 0.3 ? pick : gripped ? target : drop;

        // 2-link inverse kinematics toward the target
        let dx = target.x - base.x;
        let dy = target.y - base.y;
        let d = Math.hypot(dx, dy);
        d = Math.max(Math.abs(L1 - L2) + 1, Math.min(L1 + L2 - 1, d));
        const ang = Math.atan2(dy, dx);
        const a2 = Math.acos(
          Math.max(-1, Math.min(1, (d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2))),
        );
        const a1 = ang - Math.atan2(L2 * Math.sin(a2), L1 + L2 * Math.cos(a2));
        const joint: Pt = {
          x: base.x + L1 * Math.cos(a1),
          y: base.y + L1 * Math.sin(a1),
        };
        const endAng = a1 + a2;
        const end: Pt = {
          x: joint.x + L2 * Math.cos(endAng),
          y: joint.y + L2 * Math.sin(endAng),
        };

        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // table line
        ctx.globalAlpha = 0.25;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w * 0.12, tableY);
        ctx.lineTo(w * 0.88, tableY);
        ctx.stroke();

        // base plinth
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(base.x - w * 0.05, base.y + h * 0.02);
        ctx.lineTo(base.x + w * 0.05, base.y + h * 0.02);
        ctx.stroke();

        // object being moved
        const os = w * 0.045;
        ctx.globalAlpha = gripped ? 0.9 : 0.6;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(object.x - os / 2, object.y - os / 2, os, os);

        // links
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = w * 0.013;
        ctx.beginPath();
        ctx.moveTo(base.x, base.y);
        ctx.lineTo(joint.x, joint.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // joints
        for (const j of [base, joint]) {
          ctx.globalAlpha = 0.95;
          ctx.beginPath();
          ctx.arc(j.x, j.y, w * 0.018, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(j.x, j.y, w * 0.028, 0, Math.PI * 2);
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // gripper: two prongs that open and close at the end effector
        const open = gripped ? 0.35 : 1;
        const perp = endAng + Math.PI / 2;
        const spread = w * 0.03 * open;
        const plen = w * 0.05;
        for (const sgn of [-1, 1]) {
          const rootx = end.x + Math.cos(perp) * spread * sgn;
          const rooty = end.y + Math.sin(perp) * spread * sgn;
          ctx.globalAlpha = 0.9;
          ctx.lineWidth = w * 0.01;
          ctx.beginPath();
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(rootx, rooty);
          ctx.lineTo(
            rootx + Math.cos(endAng) * plen,
            rooty + Math.sin(endAng) * plen,
          );
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }}
    />
  );
}

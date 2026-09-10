import { MarkCanvas } from "./MarkCanvas";
import { drawScrollback } from "./scrollback";

/**
 * LaptopMark: the terminal at its desk, an open laptop facing the
 * viewer, the same self-typing console running on its screen, a faint
 * key grid and trackpad on the deck, a power LED breathing on the hinge
 * line, and a desk rule beneath it.
 */
export function LaptopMark({ size = 220 }: { size?: number }) {
  return (
    <MarkCanvas
      size={size}
      draw={({ ctx, w, h, color, t }) => {
        const cx = w / 2;
        // lid (screen) geometry
        const lidW = w * 0.62;
        const lidH = h * 0.5;
        const lidX = cx - lidW / 2;
        const lidY = h * 0.13;
        const hingeY = lidY + lidH;

        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // lid frame
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(lidX, lidY, lidW, lidH);
        // camera dot
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(cx, lidY + 5, 1.4, 0, Math.PI * 2);
        ctx.stroke();
        // screen inset
        const bez = 8;
        const scr = {
          x: lidX + bez,
          y: lidY + bez + 3,
          w: lidW - bez * 2,
          h: lidH - bez * 2 - 3,
        };
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 0.7;
        ctx.strokeRect(scr.x, scr.y, scr.w, scr.h);

        drawScrollback(ctx, {
          x: scr.x + 1,
          y: scr.y + 1,
          w: scr.w - 2,
          h: scr.h - 2,
          t,
          lineH: scr.h * 0.115,
          scale: 0.8,
          salt: 1,
        });

        // hinge
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(lidX - 2, hingeY);
        ctx.lineTo(lidX + lidW + 2, hingeY);
        ctx.stroke();

        // power LED breathing on the hinge
        const breath = 0.5 + 0.5 * Math.sin(t * 0.04);
        ctx.globalAlpha = 0.25 + 0.6 * breath;
        ctx.beginPath();
        ctx.arc(lidX + lidW - 6, hingeY + 4.5, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // deck: keyboard base as a trapezoid opening toward the viewer
        const spread = w * 0.115; // perspective widening
        const deckH = h * 0.2;
        const dTop = { l: lidX, r: lidX + lidW };
        const dBot = { l: lidX - spread, r: lidX + lidW + spread };
        const deckY = hingeY;
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(dTop.l, deckY);
        ctx.lineTo(dBot.l, deckY + deckH);
        ctx.lineTo(dBot.r, deckY + deckH);
        ctx.lineTo(dTop.r, deckY);
        ctx.stroke();
        // front lip
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(dBot.l, deckY + deckH);
        ctx.lineTo(dBot.l + 2, deckY + deckH + 4);
        ctx.lineTo(dBot.r - 2, deckY + deckH + 4);
        ctx.lineTo(dBot.r, deckY + deckH);
        ctx.stroke();

        // key grid: rows of faint ticks following the perspective
        const rows = 4;
        const cols = 12;
        for (let r = 0; r < rows; r++) {
          const v = (r + 0.5) / (rows + 1.6); // leave room for trackpad
          const yk = deckY + deckH * v;
          const lk = dTop.l + (dBot.l - dTop.l) * v;
          const rk = dTop.r + (dBot.r - dTop.r) * v;
          for (let c = 0; c < cols; c++) {
            const u = (c + 0.5) / cols;
            const xk = lk + (rk - lk) * u;
            const kw = ((rk - lk) / cols) * 0.55;
            ctx.globalAlpha = 0.28;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(xk - kw / 2, yk);
            ctx.lineTo(xk + kw / 2, yk);
            ctx.stroke();
          }
        }
        // trackpad
        const tv = 0.78;
        const ty = deckY + deckH * tv;
        const tl = dTop.l + (dBot.l - dTop.l) * tv;
        const tr = dTop.r + (dBot.r - dTop.r) * tv;
        const tw = (tr - tl) * 0.28;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 0.7;
        ctx.strokeRect(cx - tw / 2, ty - 3, tw, deckH * 0.16);

        // desk line
        const deskY = deckY + deckH + 4;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(w * 0.06, deskY);
        ctx.lineTo(w * 0.94, deskY);
        ctx.stroke();

        ctx.globalAlpha = 1;
      }}
    />
  );
}

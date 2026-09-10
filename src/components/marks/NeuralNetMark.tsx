import { MarkCanvas } from "./MarkCanvas";

const LAYERS = [4, 6, 6, 3];

/**
 * NeuralNetMark: a feedforward network. Open-circle nodes in layers,
 * hairline all-to-all edges, and a pulse of activation sweeping left to
 * right. A nod to the from-scratch NumPy classifier.
 */
export function NeuralNetMark({ size = 220 }: { size?: number }) {
  return (
    <MarkCanvas
      size={size}
      draw={({ ctx, w, h, color, t }) => {
        const padX = w * 0.17;
        const padY = h * 0.13;
        const cols = LAYERS.length;
        const xs = LAYERS.map((_, l) =>
          cols === 1 ? w / 2 : padX + (w - 2 * padX) * (l / (cols - 1)),
        );
        const pos = LAYERS.map((n, l) =>
          Array.from({ length: n }, (_, i) => ({
            x: xs[l],
            y: n === 1 ? h / 2 : padY + (h - 2 * padY) * (i / (n - 1)),
          })),
        );

        // faint edges
        ctx.strokeStyle = color;
        for (let l = 0; l < cols - 1; l++) {
          for (const a of pos[l]) {
            for (const b of pos[l + 1]) {
              ctx.globalAlpha = 0.1;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        // activation wave traveling along the active layer's edges
        const wave = (t * 0.015) % (cols - 1);
        const seg = Math.floor(wave);
        const frac = wave - seg;
        ctx.fillStyle = color;
        for (const a of pos[seg]) {
          for (const b of pos[seg + 1]) {
            const x = a.x + (b.x - a.x) * frac;
            const y = a.y + (b.y - a.y) * frac;
            ctx.globalAlpha = 0.4 * (1 - Math.abs(frac - 0.5) * 1.4);
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.arc(x, y, 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // nodes
        for (let l = 0; l < cols; l++) {
          const active = l === seg || (l === seg + 1 && frac > 0.6);
          for (const nd of pos[l]) {
            const r = w * 0.019;
            ctx.beginPath();
            ctx.arc(nd.x, nd.y, r, 0, Math.PI * 2);
            ctx.globalAlpha = 0.06;
            ctx.fillStyle = color;
            ctx.fill();
            ctx.globalAlpha = active ? 0.95 : 0.5;
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = color;
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }}
    />
  );
}

import React from "react";

const MONO = '"Space Mono", ui-monospace, monospace';
const HEIGHT = 150;
export const MAX_SAMPLES = 220;

export interface RecorderSample {
  probs: Float32Array;
  top: number;
}

/**
 * ChartRecorder: a strip-chart of the network's beliefs over the course
 * of the drawing: one trace per class, sampled at every live inference.
 * The trace currently winning is drawn in red ink. Watching an "apple"
 * become a "clock" the moment you add hands is the whole point.
 */
export function ChartRecorder({
  classNames,
  history,
}: {
  classNames: string[];
  history: React.MutableRefObject<RecorderSample[]>;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let cancelled = false;

    function draw() {
      if (cancelled || !ctx) return;
      const w = wrap!.clientWidth;
      const h = HEIGHT;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const styles = getComputedStyle(wrap!);
      const ink = styles.color || "#1b1a16";
      const red = styles.getPropertyValue("--annotation").trim() || "#8a2e1f";

      const padY = 10;
      const labelW = 84;
      const plotW = w - labelW;
      const yFor = (p: number) => padY + (1 - p) * (h - 2 * padY);

      // ruled paper: 0 / 50 / 100 %
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.font = `8px ${MONO}`;
      ctx.textBaseline = "middle";
      for (const p of [0, 0.5, 1]) {
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, yFor(p));
        ctx.lineTo(plotW, yFor(p));
        ctx.stroke();
        ctx.globalAlpha = 0.4;
        ctx.fillText(`${p * 100}`, plotW + 4, yFor(p));
      }

      const samples = history.current;
      if (samples.length >= 2) {
        const latest = samples[samples.length - 1];
        const n = samples.length;
        const xFor = (i: number) => (i / (MAX_SAMPLES - 1)) * plotW;
        const x0 = Math.max(0, n - MAX_SAMPLES);

        for (let c = 0; c < classNames.length; c++) {
          const isTop = c === latest.top;
          ctx.strokeStyle = isTop ? red : ink;
          ctx.globalAlpha = isTop ? 0.9 : 0.35;
          ctx.lineWidth = isTop ? 1.5 : 1;
          ctx.beginPath();
          for (let i = x0; i < n; i++) {
            const x = xFor(i - x0);
            const y = yFor(samples[i].probs[c]);
            if (i === x0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Trace labels at the pen's position, nudged apart so classes
        // sitting together at 0% don't overprint.
        const GAP = 10;
        const labels = classNames
          .map((name, c) => ({ name, c, y: yFor(latest.probs[c]) }))
          .sort((a, b) => a.y - b.y);
        for (let i = 1; i < labels.length; i++)
          labels[i].y = Math.max(labels[i].y, labels[i - 1].y + GAP);
        // clamp back inside the strip from the bottom up
        labels[labels.length - 1].y = Math.min(labels[labels.length - 1].y, h - padY);
        for (let i = labels.length - 2; i >= 0; i--)
          labels[i].y = Math.min(labels[i].y, labels[i + 1].y - GAP);
        const lx = Math.min(xFor(n - 1 - x0) + 5, plotW + 2);
        ctx.font = `9px ${MONO}`;
        for (const l of labels) {
          const isTop = l.c === latest.top;
          ctx.fillStyle = isTop ? red : ink;
          ctx.globalAlpha = isTop ? 0.95 : 0.5;
          ctx.fillText(l.name, lx, l.y);
        }
      } else {
        ctx.globalAlpha = 0.4;
        ctx.font = `italic 12px Georgia, serif`;
        ctx.fillText(
          "chart recorder idle, traces appear as you draw",
          12,
          h / 2,
        );
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [classNames, history]);

  return (
    <div
      ref={wrapRef}
      style={{ width: "100%", color: "var(--text-strong)", lineHeight: 0 }}
    >
      <canvas
        ref={canvasRef}
        aria-label="Strip chart of class probabilities over time"
      />
    </div>
  );
}

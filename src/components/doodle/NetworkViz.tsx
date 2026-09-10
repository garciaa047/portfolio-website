import React from "react";
import type { DoodleModel, ForwardResult } from "../../lib/doodleNet";
import { IMAGE_SIZE } from "../../lib/doodleNet";

const MONO = '"Space Mono", ui-monospace, monospace';
const PULSE_MS = 620;

/** Everything the viz needs about the latest inference, kept in a ref so
    pointer-rate updates never re-render the React tree. */
export interface VizFrame {
  result: ForwardResult | null;
  attribution: Float32Array | null;
  /** performance.now() when this result landed. Drives the pulse. */
  stamp: number;
}

interface Edge {
  from: number;
  to: number;
  w: number;
}

/** Top-k strongest incoming weights per target node. The connections
    worth drawing out of the 123,909 real ones. */
function topEdges(
  weights: Float32Array,
  nIn: number,
  nOut: number,
  k: number,
): Edge[] {
  const edges: Edge[] = [];
  for (let j = 0; j < nOut; j++) {
    const row = j * nIn;
    const best: Edge[] = [];
    for (let i = 0; i < nIn; i++) {
      const w = weights[row + i];
      const aw = Math.abs(w);
      if (best.length < k) {
        best.push({ from: i, to: j, w });
        best.sort((a, b) => Math.abs(a.w) - Math.abs(b.w));
      } else if (aw > Math.abs(best[0].w)) {
        best[0] = { from: i, to: j, w };
        best.sort((a, b) => Math.abs(a.w) - Math.abs(b.w));
      }
    }
    edges.push(...best);
  }
  return edges;
}

/**
 * NetworkViz: the trained network drawn as a living instrument. The
 * 30×30 input plane on the left is the preprocessed drawing the model
 * actually sees (with its attribution in red ink); the two hidden
 * columns and the softmax row light up with the real activations, and
 * each new inference sends a pulse down the strongest weights.
 */
export function NetworkViz({
  model,
  frame,
}: {
  model: DoodleModel;
  frame: React.MutableRefObject<VizFrame>;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const wiring = React.useMemo(() => {
    const [nIn, nH1, nH2, nOut] = model.layerSizes;
    return {
      e01: topEdges(model.weights[0], nIn, nH1, 2),
      e12: topEdges(model.weights[1], nH1, nH2, 3),
      e23: topEdges(model.weights[2], nH2, nOut, 12),
    };
  }, [model]);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;
    let cancelled = false;

    const [, nH1, nH2, nOut] = model.layerSizes;

    function draw() {
      if (cancelled || !ctx) return;
      const w = wrap!.clientWidth;
      const h = Math.max(320, Math.min(470, Math.round(w * 0.62)));
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";

      const styles = getComputedStyle(wrap!);
      const ink = styles.color || "#1b1a16";
      const red =
        styles.getPropertyValue("--annotation").trim() || "#8a2e1f";

      const { result, attribution, stamp } = frame.current;

      // ---- geometry -------------------------------------------------
      const gridSize = Math.min(h * 0.66, w * 0.24);
      const cell = gridSize / IMAGE_SIZE;
      const gridX = w * 0.055;
      const gridY = (h - gridSize) / 2 - h * 0.03;
      const pxPos = (i: number) => ({
        x: gridX + ((i % IMAGE_SIZE) + 0.5) * cell,
        y: gridY + (Math.floor(i / IMAGE_SIZE) + 0.5) * cell,
      });

      const colTop = h * 0.07;
      const colBot = h * 0.87;
      const x1 = w * 0.47;
      const x2 = w * 0.65;
      const xo = w * 0.82;
      const nodePos = (x: number, i: number, n: number, span = 1) => {
        const pad = ((1 - span) / 2) * (colBot - colTop);
        return {
          x,
          y:
            colTop +
            pad +
            (colBot - colTop - 2 * pad) * (n === 1 ? 0.5 : i / (n - 1)),
        };
      };
      const p1 = (i: number) => nodePos(x1, i, nH1);
      const p2 = (i: number) => nodePos(x2, i, nH2);
      const po = (i: number) => nodePos(xo, i, nOut, 0.62);

      // ---- normalized activations ------------------------------------
      const norm = (a: Float32Array | undefined) => {
        if (!a) return null;
        let max = 0;
        for (let i = 0; i < a.length; i++)
          if (Math.abs(a[i]) > max) max = Math.abs(a[i]);
        if (max === 0) return null;
        const out = new Float32Array(a.length);
        for (let i = 0; i < a.length; i++) out[i] = Math.abs(a[i]) / max;
        return out;
      };
      const aIn = result ? result.activations[0] : null;
      const a1 = norm(result?.activations[1]);
      const a2 = norm(result?.activations[2]);
      const probs = result ? result.probs : null;

      const pulseAge = performance.now() - stamp;
      const pulse = !reduce && result && pulseAge < PULSE_MS;
      const front = pulse
        ? gridX + gridSize + (xo - gridX - gridSize) * (pulseAge / PULSE_MS)
        : -1;

      // ---- the input plane -------------------------------------------
      ctx.strokeStyle = ink;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      ctx.strokeRect(gridX, gridY, gridSize, gridSize);
      ctx.globalAlpha = 0.08;
      for (let g = 5; g < IMAGE_SIZE; g += 5) {
        ctx.beginPath();
        ctx.moveTo(gridX + g * cell, gridY);
        ctx.lineTo(gridX + g * cell, gridY + gridSize);
        ctx.moveTo(gridX, gridY + g * cell);
        ctx.lineTo(gridX + gridSize, gridY + g * cell);
        ctx.stroke();
      }

      let attrMax = 0;
      if (attribution)
        for (let i = 0; i < attribution.length; i++)
          if (attribution[i] > attrMax) attrMax = attribution[i];

      if (aIn) {
        for (let i = 0; i < aIn.length; i++) {
          const v = aIn[i];
          const av = attribution && attrMax > 0 ? attribution[i] / attrMax : 0;
          if (v <= 0.02 && av <= 0.04) continue;
          const cx = gridX + (i % IMAGE_SIZE) * cell;
          const cy = gridY + Math.floor(i / IMAGE_SIZE) * cell;
          if (av > 0.04) {
            // red ink where the pixel argued for the verdict
            ctx.globalAlpha = Math.min(0.9, 0.15 + 0.75 * av);
            ctx.fillStyle = red;
          } else {
            ctx.globalAlpha = 0.12 + 0.8 * v;
            ctx.fillStyle = ink;
          }
          ctx.fillRect(cx, cy, cell + 0.5, cell + 0.5);
        }
      } else {
        // idle: a faint scanning band so the plane reads as alive
        if (!reduce) {
          const band = gridY + ((t * 0.6) % gridSize);
          ctx.globalAlpha = 0.06;
          ctx.fillStyle = ink;
          ctx.fillRect(gridX, band, gridSize, cell * 2);
        }
      }

      // ---- edges -------------------------------------------------------
      const idleWave = (t * 0.012) % 3; // idle activation sweep, 3 segments

      const drawEdges = (
        edges: Edge[],
        srcPos: (i: number) => { x: number; y: number },
        dstPos: (i: number) => { x: number; y: number },
        srcAct: Float32Array | null,
        seg: number,
      ) => {
        // brightness ∝ |w · a_src|, normalized within the layer
        let smax = 0;
        const s = new Float32Array(edges.length);
        if (srcAct) {
          for (let k = 0; k < edges.length; k++) {
            s[k] = Math.abs(edges[k].w) * srcAct[edges[k].from];
            if (s[k] > smax) smax = s[k];
          }
        }
        for (let k = 0; k < edges.length; k++) {
          const e = edges[k];
          const a = srcPos(e.from);
          const b = dstPos(e.to);
          let alpha = 0.045;
          if (srcAct && smax > 0)
            alpha = 0.04 + 0.5 * Math.pow(s[k] / smax, 0.85);
          else if (!reduce && !result) {
            // idle sweep, borrowed from the site's NeuralNetMark
            const d = Math.abs(idleWave - seg - 0.5);
            alpha = 0.03 + Math.max(0, 0.1 - d * 0.16);
          }
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = ink;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          // the inference pulse riding the wire
          if (pulse && front > Math.min(a.x, b.x) && front < Math.max(a.x, b.x)) {
            const f = (front - a.x) / (b.x - a.x);
            const px = a.x + (b.x - a.x) * f;
            const py = a.y + (b.y - a.y) * f;
            ctx.globalAlpha = Math.min(0.9, alpha * 3 + 0.15);
            ctx.fillStyle = ink;
            ctx.beginPath();
            ctx.arc(px, py, 1.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      };

      // input→h1 edges start from the actual pixel each weight reads
      const srcPx = (i: number) => {
        const p = pxPos(i);
        return { x: Math.min(p.x, gridX + gridSize), y: p.y };
      };
      drawEdges(wiring.e01, srcPx, p1, aIn, 0);
      drawEdges(wiring.e12, p1, p2, a1, 1);
      drawEdges(wiring.e23, p2, po, a2, 2);

      // ---- hidden nodes ------------------------------------------------
      const drawColumn = (
        pos: (i: number) => { x: number; y: number },
        n: number,
        act: Float32Array | null,
        r: number,
        seg: number,
      ) => {
        for (let i = 0; i < n; i++) {
          const p = pos(i);
          let level = 0.12;
          if (act) level = 0.1 + 0.85 * act[i];
          else if (!reduce && !result) {
            const d = Math.abs(idleWave - seg);
            level = 0.1 + Math.max(0, 0.35 - d * 0.5);
          }
          ctx.globalAlpha = level;
          ctx.fillStyle = ink;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      drawColumn(p1, nH1, a1, 1.6, 0.5);
      drawColumn(p2, nH2, a2, 2.3, 1.5);

      // ---- output row --------------------------------------------------
      const verdict = probs && probs[result!.top] >= 0.3;
      for (let i = 0; i < nOut; i++) {
        const p = po(i);
        const prob = probs ? probs[i] : 0;
        const isTop = !!result && result.top === i && !!verdict;
        const r = 6.5;

        ctx.globalAlpha = 0.06 + prob * 0.85;
        ctx.fillStyle = isTop ? red : ink;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = isTop ? 0.95 : 0.5;
        ctx.strokeStyle = isTop ? red : ink;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = isTop ? 0.95 : 0.62;
        ctx.fillStyle = isTop ? red : ink;
        ctx.font = `10px ${MONO}`;
        ctx.textBaseline = "middle";
        ctx.fillText(
          `${model.classNames[i]}${
            probs ? ` ${(prob * 100).toFixed(0).padStart(3)}%` : ""
          }`,
          p.x + r + 7,
          p.y,
        );
      }

      // ---- captions ----------------------------------------------------
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = ink;
      ctx.font = `9px ${MONO}`;
      ctx.textBaseline = "alphabetic";
      const caption = (label: string, x: number, center = true) => {
        const tw = ctx.measureText(label).width;
        ctx.fillText(label, center ? x - tw / 2 : x, h - 6);
      };
      caption("input 30×30", gridX + gridSize / 2);
      caption(`dense ${nH1}`, x1);
      caption(`dense ${nH2}`, x2);
      caption(`softmax ${nOut}`, xo, false);

      ctx.globalAlpha = 1;
      t += 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(() => {
      if (reduce) draw();
    });
    ro.observe(wrap);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [model, wiring, frame]);

  return (
    <div
      ref={wrapRef}
      style={{
        width: "100%",
        color: "var(--text-strong)",
        lineHeight: 0,
      }}
    >
      <canvas ref={canvasRef} aria-label="Live visualization of the neural network's activations" />
    </div>
  );
}

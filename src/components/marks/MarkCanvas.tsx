import React from "react";

export interface MarkFrame {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  color: string;
  t: number;
  reduce: boolean;
}

/**
 * MarkCanvas: a shared monochrome animated canvas, modelled on the Globe.
 * It sizes for devicePixelRatio, reads its line color from CSS `color`
 * (so it flips with the theme), runs a requestAnimationFrame loop, and
 * draws a single static frame when prefers-reduced-motion is set. Pass a
 * `draw` callback that paints one frame from the supplied MarkFrame.
 */
export function MarkCanvas({
  size = 220,
  draw,
  className = "",
  style = {},
}: {
  size?: number;
  draw: (f: MarkFrame) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawRef = React.useRef(draw);
  drawRef.current = draw;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let raf = 0;
    let t = 0;
    let cancelled = false;

    function frame() {
      if (cancelled || !ctx) return;
      const w = size;
      const h = size;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      const color = getComputedStyle(wrap!).color || "#1b1a16";
      drawRef.current({ ctx, w, h, color, t, reduce });
      t += 1;
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [size]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        width: size,
        height: size,
        color: "var(--text-strong, #1b1a16)",
        display: "inline-block",
        lineHeight: 0,
        ...style,
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}

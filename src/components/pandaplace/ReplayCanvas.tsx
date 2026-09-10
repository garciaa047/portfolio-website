import React from "react";
import { drawScene, Episode, ReplayMeta } from "./replay";

/**
 * ReplayCanvas: plays back one recorded MuJoCo episode as monochrome
 * line art. Same conventions as MarkCanvas (theme-aware color from CSS,
 * devicePixelRatio-aware, reduced-motion shows the final frame), plus a
 * playhead: ~3 sim steps per screen frame, a beat of hold at the end,
 * then loop. `onDone` fires each time an episode finishes a pass.
 */
export function ReplayCanvas({
  meta,
  episode,
  size = 220,
  turntable = true,
  onDone,
}: {
  meta: ReplayMeta;
  episode: Episode;
  size?: number;
  turntable?: boolean;
  onDone?: () => void;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const onDoneRef = React.useRef(onDone);
  onDoneRef.current = onDone;
  // drag-to-rotate: an offset added to the (optionally auto-spinning) turntable
  const dragRef = React.useRef({ down: false, lastX: 0, offset: 0, held: false, spin: 0 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let t = 0;
    let cancelled = false;
    const HOLD = 40; // frames to hold on the terminal state before looping

    function frame() {
      if (cancelled || !ctx) return;
      canvas!.width = size * dpr;
      canvas!.height = size * dpr;
      canvas!.style.width = size + "px";
      canvas!.style.height = size + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      const color = getComputedStyle(wrap!).color || "#1b1a16";

      const playhead = Math.floor(t / 2); // 2 screen frames per sim step
      const idx = reduce ? episode.frames.length - 1 : playhead;
      const drag = dragRef.current;
      const spin = turntable && !drag.held ? t * 0.002 : 0;
      if (!drag.held) drag.spin = spin;
      const psi = 0.55 + spin + drag.offset;
      drawScene(ctx, size, size, color, meta, episode, idx, psi);

      t += 1;
      if (!reduce && playhead > episode.frames.length - 1 + HOLD) {
        t = 0;
        onDoneRef.current?.();
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [episode, meta, size, turntable]);

  return (
    <div
      ref={wrapRef}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current.down = true;
        dragRef.current.lastX = e.clientX;
      }}
      onPointerMove={(e) => {
        const d = dragRef.current;
        if (!d.down) return;
        if (!d.held) {
          d.offset += d.spin; // absorb the motor's angle so nothing snaps
          d.held = true; // hand on the turntable stops the motor
        }
        d.offset += (e.clientX - d.lastX) * 0.008;
        d.lastX = e.clientX;
      }}
      onPointerUp={() => (dragRef.current.down = false)}
      onPointerCancel={() => (dragRef.current.down = false)}
      style={{
        width: size,
        height: size,
        color: "var(--text-strong, #1b1a16)",
        display: "inline-block",
        lineHeight: 0,
        cursor: "grab",
        touchAction: "pan-y",
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}

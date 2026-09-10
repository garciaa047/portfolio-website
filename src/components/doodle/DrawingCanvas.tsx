import React from "react";
import { Button } from "../Button";
import { CornerMarks } from "../Decor";

export const CANVAS_SIZE = 300;

/** Display stroke width vs. the width burned into the model image.
    the same 6 / 16 ratio the original tkinter + PIL app used. */
const DISPLAY_WIDTH = 5;
const MODEL_WIDTH = 16;

type Stroke = { x: number; y: number }[];

export interface DrawingCanvasHandle {
  /** Animate strokes into the tray as if drawn by hand; cancelled by user input. */
  playGhost: (strokes: Stroke[]) => void;
}

/**
 * DrawingCanvas: the specimen tray. Strokes are drawn in the page's ink
 * color on the visible canvas and simultaneously in black-on-white on a
 * hidden canvas, which is what the network is fed (matching the PIL
 * image the original desktop app kept alongside its tkinter canvas).
 *
 * A "ghost" mode replays a canned specimen through the same stroke
 * pipeline so the apparatus performs before anyone draws; the first
 * pointer-down clears the specimen and hands the tray to the visitor.
 */
export const DrawingCanvas = React.forwardRef(function DrawingCanvas(
  {
    theme,
    onDraw,
    onClear,
  }: {
    theme: "light" | "dark";
    /** Called (throttled upstream) with the model-facing canvas. */
    onDraw: (model: HTMLCanvasElement, drawing: boolean) => void;
    onClear: () => void;
  },
  ref: React.ForwardedRef<DrawingCanvasHandle>,
) {
  const displayRef = React.useRef<HTMLCanvasElement>(null);
  const modelRef = React.useRef<HTMLCanvasElement | null>(null);
  const strokesRef = React.useRef<Stroke[]>([]);
  const currentRef = React.useRef<Stroke | null>(null);
  const [hasInk, setHasInk] = React.useState(false);
  /** "playing" while the ghost animates, "held" once it finishes untouched. */
  const ghostRef = React.useRef<"off" | "playing" | "held">("off");
  const ghostTimerRef = React.useRef<number | null>(null);
  const [ghostState, setGhostState] = React.useState<"off" | "playing" | "held">("off");

  if (!modelRef.current && typeof document !== "undefined") {
    const c = document.createElement("canvas");
    c.width = CANVAS_SIZE;
    c.height = CANVAS_SIZE;
    modelRef.current = c;
  }

  const redraw = React.useCallback(() => {
    const display = displayRef.current;
    const model = modelRef.current;
    if (!display || !model) return;
    const dctx = display.getContext("2d")!;
    const mctx = model.getContext("2d")!;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    display.width = CANVAS_SIZE * dpr;
    display.height = CANVAS_SIZE * dpr;
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.fillStyle = "#fff";
    mctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const ink =
      getComputedStyle(display).getPropertyValue("--text-strong").trim() ||
      "#1b1a16";
    const strokes = currentRef.current
      ? [...strokesRef.current, currentRef.current]
      : strokesRef.current;

    for (const [ctx, color, width] of [
      [dctx, ink, DISPLAY_WIDTH],
      [mctx, "#000", MODEL_WIDTH],
    ] as const) {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const s of strokes) {
        if (s.length === 1) {
          ctx.beginPath();
          ctx.arc(s[0].x, s[0].y, width / 2, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(s[0].x, s[0].y);
        for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
        ctx.stroke();
      }
    }
  }, []);

  // Re-ink the visible canvas when the theme flips.
  React.useEffect(() => {
    redraw();
  }, [theme, redraw]);

  const toLocal = (e: React.PointerEvent) => {
    const rect = displayRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE,
    };
  };

  const stopGhost = React.useCallback(
    (clearInk: boolean) => {
      if (ghostRef.current === "off") return;
      ghostRef.current = "off";
      setGhostState("off");
      if (ghostTimerRef.current !== null) {
        window.clearTimeout(ghostTimerRef.current);
        ghostTimerRef.current = null;
      }
      if (clearInk) {
        strokesRef.current = [];
        currentRef.current = null;
        setHasInk(false);
        redraw();
        onClear();
      }
    },
    [redraw, onClear],
  );

  React.useImperativeHandle(
    ref,
    () => ({
      playGhost: (strokes: Stroke[]) => {
        // Restartable: a new specimen takes the tray over from whatever
        // is there: a running sample, a held one, or the visitor's ink.
        if (ghostTimerRef.current !== null) {
          window.clearTimeout(ghostTimerRef.current);
          ghostTimerRef.current = null;
        }
        strokesRef.current = [];
        currentRef.current = null;
        onClear();
        ghostRef.current = "playing";
        setGhostState("playing");
        setHasInk(true);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
          strokesRef.current = strokes.map((s) => [...s]);
          redraw();
          onDraw(modelRef.current!, false);
          ghostRef.current = "held";
          setGhostState("held");
          return;
        }
        let si = 0;
        let pi = 0;
        const step = () => {
          if (ghostRef.current !== "playing") return;
          if (si >= strokes.length) {
            currentRef.current = null;
            redraw();
            onDraw(modelRef.current!, false);
            ghostRef.current = "held";
            setGhostState("held");
            return;
          }
          const stroke = strokes[si];
          currentRef.current = stroke.slice(0, pi + 1);
          redraw();
          onDraw(modelRef.current!, true);
          pi += 1;
          let delay = 26;
          if (pi >= stroke.length) {
            strokesRef.current.push([...stroke]);
            currentRef.current = null;
            onDraw(modelRef.current!, false);
            si += 1;
            pi = 0;
            delay = 340; // pen-up pause between strokes
          }
          ghostTimerRef.current = window.setTimeout(step, delay);
        };
        step();
      },
    }),
    [redraw, onDraw, onClear],
  );

  React.useEffect(() => () => stopGhost(false), [stopGhost]);

  const handleDown = (e: React.PointerEvent) => {
    e.preventDefault();
    // Taking the pen back from the ghost clears its specimen first.
    if (ghostRef.current !== "off") stopGhost(true);
    displayRef.current!.setPointerCapture(e.pointerId);
    currentRef.current = [toLocal(e)];
    setHasInk(true);
    redraw();
    onDraw(modelRef.current!, true);
  };

  const handleMove = (e: React.PointerEvent) => {
    if (!currentRef.current) return;
    currentRef.current.push(toLocal(e));
    redraw();
    onDraw(modelRef.current!, true);
  };

  const handleUp = () => {
    if (!currentRef.current) return;
    strokesRef.current.push(currentRef.current);
    currentRef.current = null;
    redraw();
    onDraw(modelRef.current!, false);
  };

  const clear = () => {
    stopGhost(false);
    strokesRef.current = [];
    currentRef.current = null;
    setHasInk(false);
    redraw();
    onClear();
  };

  const undo = () => {
    if (ghostRef.current !== "off") {
      stopGhost(true);
      return;
    }
    strokesRef.current.pop();
    redraw();
    if (strokesRef.current.length === 0) {
      setHasInk(false);
      onClear();
    } else {
      onDraw(modelRef.current!, false);
    }
  };

  // Keyboard: C or Escape clears, Ctrl+Z undoes, same as the desktop app.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C" || e.key === "Escape") clear();
      else if ((e.key === "z" || e.key === "Z") && e.ctrlKey) undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          background: "var(--surface-raised)",
          border: "var(--border-hair)",
          borderRadius: "var(--radius-sm)",
          padding: "var(--space-3)",
        }}
      >
        <CornerMarks opacity={0.4} />
        <canvas
          ref={displayRef}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          style={{
            display: "block",
            width: "min(300px, 72vw)",
            aspectRatio: "1",
            touchAction: "none",
            cursor: "crosshair",
          }}
        />
        {!hasInk && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              color: "var(--text-faint)",
              fontSize: "var(--text-lg)",
            }}
          >
            draw here
          </span>
        )}
        {ghostState !== "off" && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: "var(--space-2)",
              textAlign: "center",
              pointerEvents: "none",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              color: "var(--text-muted)",
              fontSize: "var(--text-sm)",
            }}
          >
            {ghostState === "playing"
              ? "the ghost is drawing…"
              : "sample drawing, draw to take over"}
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <Button variant="secondary" size="sm" onClick={clear}>
          Clear
        </Button>
        <Button variant="ghost" size="sm" onClick={undo}>
          Undo ⌃Z
        </Button>
      </div>
    </div>
  );
});

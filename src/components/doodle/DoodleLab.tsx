import React from "react";
import {
  attribution,
  forward,
  loadDoodleModel,
  preprocessDrawing,
  type DoodleModel,
} from "../../lib/doodleNet";
import { CornerMarks } from "../Decor";
import { Tag } from "../Tag";
import { DrawingCanvas, type DrawingCanvasHandle } from "./DrawingCanvas";
import { SPECIMENS } from "./specimens";
import { NetworkViz, type VizFrame } from "./NetworkViz";
import { PredictionPanel } from "./PredictionPanel";
import { ChartRecorder, MAX_SAMPLES, type RecorderSample } from "./ChartRecorder";

const PREDICT_INTERVAL = 70; // ms, same cadence as the desktop app

/**
 * DoodleLab: the classifier, live. The actual weights trained by the
 * NumPy project run in the browser: draw in the specimen tray and watch
 * the real activations light the network, the verdict form, and the
 * chart recorder trace the network changing its mind.
 */
export function DoodleLab({ theme }: { theme: "light" | "dark" }) {
  const [model, setModel] = React.useState<DoodleModel | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [probs, setProbs] = React.useState<Float32Array | null>(null);

  const frameRef = React.useRef<VizFrame>({
    result: null,
    attribution: null,
    stamp: 0,
  });
  const historyRef = React.useRef<RecorderSample[]>([]);
  const lastRunRef = React.useRef(0);
  const pendingRef = React.useRef<number | null>(null);
  const trayRef = React.useRef<DrawingCanvasHandle>(null);

  // Once the weights are in, the ghost draws the clock so the whole
  // apparatus performs before anyone touches the tray, unless the
  // visitor has already started drawing.
  const touchedRef = React.useRef(false);
  React.useEffect(() => {
    if (!model) return;
    const t = window.setTimeout(() => {
      if (!touchedRef.current) trayRef.current?.playGhost(SPECIMENS.clock);
    }, 600);
    return () => window.clearTimeout(t);
  }, [model]);

  React.useEffect(() => {
    let alive = true;
    loadDoodleModel()
      .then((m) => alive && setModel(m))
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
      if (pendingRef.current) window.clearTimeout(pendingRef.current);
    };
  }, []);

  const runInference = React.useCallback(
    (canvas: HTMLCanvasElement) => {
      if (!model) return;
      const x = preprocessDrawing(canvas);
      if (!x) return;
      const result = forward(model, x);
      frameRef.current = {
        result,
        attribution: attribution(model, result),
        stamp: performance.now(),
      };
      historyRef.current.push({ probs: result.probs, top: result.top });
      if (historyRef.current.length > MAX_SAMPLES * 2)
        historyRef.current.splice(0, MAX_SAMPLES);
      setProbs(result.probs);
    },
    [model],
  );

  const handleDraw = React.useCallback(
    (canvas: HTMLCanvasElement, drawing: boolean) => {
      touchedRef.current = true;
      const now = performance.now();
      const elapsed = now - lastRunRef.current;
      if (!drawing || elapsed >= PREDICT_INTERVAL) {
        lastRunRef.current = now;
        runInference(canvas);
      } else if (pendingRef.current === null) {
        pendingRef.current = window.setTimeout(() => {
          pendingRef.current = null;
          lastRunRef.current = performance.now();
          runInference(canvas);
        }, PREDICT_INTERVAL - elapsed);
      }
    },
    [runInference],
  );

  const handleClear = React.useCallback(() => {
    frameRef.current = { result: null, attribution: null, stamp: 0 };
    historyRef.current = [];
    setProbs(null);
  }, []);

  if (error) {
    return (
      <Plate caption="Fig. L. The live classifier failed to load">
        <p style={{ color: "var(--text-soft)", padding: "var(--space-5)" }}>
          The trained weights couldn't be fetched ({error}). The write-up
          below still applies; the network just can't perform today.
        </p>
      </Plate>
    );
  }

  if (!model) {
    return (
      <Plate caption="Fig. L. Loading">
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--text-muted)",
            padding: "var(--space-6)",
          }}
        >
          fetching the trained weights, 484 KB
        </p>
      </Plate>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      <div
        className="lab-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 360px) minmax(0, 1fr)",
          gap: "var(--space-5)",
          alignItems: "stretch",
        }}
      >
        <Plate caption="Fig. 3a. Draw one of the five, or click a label to have it drawn for you.">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-2)",
                justifyContent: "center",
              }}
            >
              {model.classNames.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={`let the ghost draw ${c === "airplane" || c === "apple" ? "an" : "a"} ${c}`}
                  onClick={() => SPECIMENS[c] && trayRef.current?.playGhost(SPECIMENS[c])}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    display: "inline-flex",
                  }}
                >
                  <Tag>{c} ✎</Tag>
                </button>
              ))}
            </div>
            <DrawingCanvas
              ref={trayRef}
              theme={theme}
              onDraw={handleDraw}
              onClear={handleClear}
            />
          </div>
        </Plate>

        <Plate caption="Fig. 3b. Real weights, live activations. Red marks the pixels that decided it.">
          <NetworkViz model={model} frame={frameRef} />
        </Plate>
      </div>

      <div
        className="lab-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)",
          gap: "var(--space-5)",
          alignItems: "stretch",
        }}
      >
        <Plate caption="Fig. 3c. Belief in each class as you draw.">
          <ChartRecorder classNames={model.classNames} history={historyRef} />
        </Plate>

        <Plate caption="Fig. 3d. The call.">
          <PredictionPanel classNames={model.classNames} probs={probs} />
        </Plate>
      </div>
    </div>
  );
}

/** A framed laboratory plate: figure box, corner registration, caption. */
function Plate({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "var(--space-3)",
        margin: 0,
        padding: "var(--space-5)",
        background: "var(--surface-raised)",
        border: "var(--border-hair)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <CornerMarks opacity={0.35} />
      {children}
      <figcaption
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--label-sm)",
          letterSpacing: "var(--tracking-mono)",
          color: "var(--text-muted)",
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
}

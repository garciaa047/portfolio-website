import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eraser, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// ─── Neural Network Forward Pass ──────────────────────────────────────────────

interface ModelWeights {
  w0: number[][];
  b0: number[][];
  w1: number[][];
  b1: number[][];
  w2: number[][];
  b2: number[][];
}

const CLASSES = ["Airplane", "Apple", "Clock", "Pants", "Tree"];
const INPUT_SIZE = 30;

function leakyReLU(x: number): number {
  return x > 0 ? x : 0.1 * x;
}

function softmax(values: number[]): number[] {
  const max = Math.max(...values);
  const exps = values.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function matMul(
  weights: number[][],
  input: number[],
  bias: number[][]
): number[] {
  return weights.map((row, i) =>
    row.reduce((sum, w, j) => sum + w * input[j], 0) + bias[i][0]
  );
}

function predict(model: ModelWeights, input: number[]): number[] {
  const z0 = matMul(model.w0, input, model.b0);
  const a0 = z0.map(leakyReLU);

  const z1 = matMul(model.w1, a0, model.b1);
  const a1 = z1.map(leakyReLU);

  const z2 = matMul(model.w2, a1, model.b2);
  return softmax(z2);
}

// ─── Canvas Preprocessing ─────────────────────────────────────────────────────

function preprocessCanvas(canvas: HTMLCanvasElement): number[] {
  // Create offscreen canvas at model input size
  const offscreen = document.createElement("canvas");
  offscreen.width = INPUT_SIZE;
  offscreen.height = INPUT_SIZE;
  const ctx = offscreen.getContext("2d")!;

  // Find bounding box of drawn content to center it
  const sourceCtx = canvas.getContext("2d")!;
  const imageData = sourceCtx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  let minX = canvas.width,
    minY = canvas.height,
    maxX = 0,
    maxY = 0;
  let hasContent = false;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha > 0) {
        hasContent = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!hasContent) return new Array(INPUT_SIZE * INPUT_SIZE).fill(0);

  // Add padding and maintain aspect ratio
  const padding = 20;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(canvas.width, maxX + padding);
  maxY = Math.min(canvas.height, maxY + padding);

  const drawW = maxX - minX;
  const drawH = maxY - minY;
  const scale = Math.min(
    (INPUT_SIZE - 4) / drawW,
    (INPUT_SIZE - 4) / drawH
  );
  const scaledW = drawW * scale;
  const scaledH = drawH * scale;
  const offsetX = (INPUT_SIZE - scaledW) / 2;
  const offsetY = (INPUT_SIZE - scaledH) / 2;

  // Draw white content on black background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
  ctx.drawImage(canvas, minX, minY, drawW, drawH, offsetX, offsetY, scaledW, scaledH);

  // Extract grayscale values normalized to 0-1
  const resized = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
  const pixels: number[] = [];
  for (let i = 0; i < resized.data.length; i += 4) {
    // Use the white channel intensity (drawn content is white on black)
    pixels.push(resized.data[i] / 255);
  }
  return pixels;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DoodleClassifier() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [model, setModel] = useState<ModelWeights | null>(null);
  const [predictions, setPredictions] = useState<number[]>(
    new Array(CLASSES.length).fill(0)
  );
  const [hasDrawn, setHasDrawn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load model weights
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}models/doodle-classifier.json`)
      .then((r) => r.json())
      .then((data: ModelWeights) => {
        setModel(data);
        setLoading(false);
      });
  }, []);

  // Initialize canvas — depends on loading so it runs after canvas is in the DOM
  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 6;
  }, [loading]);

  const runPrediction = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !model) return;
    const input = preprocessCanvas(canvas);
    const result = predict(model, input);
    setPredictions(result);
  }, [model]);

  const getPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    runPrediction();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 6;
    setPredictions(new Array(CLASSES.length).fill(0));
    setHasDrawn(false);
  };

  const topPrediction = predictions.indexOf(Math.max(...predictions));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to portfolio</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-mono text-primary text-sm tracking-wider">
            // interactive demo
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Neural Network Doodle Classifier
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Draw a doodle below and the neural network will classify it in
            real-time. The model runs entirely in your browser — a 3-layer
            feedforward network (900&rarr;128&rarr;64&rarr;5) trained on
            airplane, apple, clock, pants, and tree doodles.
          </p>
        </motion.div>

        {loading ? (
          <motion.div
            className="flex items-center justify-center gap-3 py-24 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 size={20} className="animate-spin" />
            <span>Loading model weights...</span>
          </motion.div>
        ) : (
          <motion.div
            className="mt-10 grid md:grid-cols-2 gap-8 items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Drawing area */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm text-muted-foreground">
                  Draw here
                </span>
                <button
                  onClick={clearCanvas}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-secondary rounded-lg transition-colors"
                >
                  <Eraser size={14} />
                  Clear
                </button>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={280}
                  className="w-full aspect-square cursor-crosshair rounded-lg touch-none"
                  style={{ imageRendering: "pixelated" }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                Model: 900 &rarr; 128 (LeakyReLU) &rarr; 64 (LeakyReLU) &rarr;
                5 (Softmax)
              </p>
            </div>

            {/* Predictions */}
            <div>
              <span className="font-mono text-sm text-muted-foreground mb-3 block">
                Predictions
              </span>
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                {!hasDrawn ? (
                  <p className="text-muted-foreground text-sm py-8 text-center">
                    Draw something to see predictions
                  </p>
                ) : (
                  CLASSES.map((cls, i) => {
                    const confidence = predictions[i];
                    const isTop = i === topPrediction && hasDrawn;
                    return (
                      <div key={cls}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-sm font-medium ${
                              isTop ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {cls}
                            {isTop && (
                              <span className="ml-2 text-xs font-mono opacity-70">
                                &larr; best match
                              </span>
                            )}
                          </span>
                          <span
                            className={`font-mono text-sm ${
                              isTop ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {(confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              isTop ? "bg-primary glow" : "bg-muted-foreground/40"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${confidence * 100}%` }}
                            transition={{
                              duration: 0.3,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* How it works */}
              <div className="mt-6 bg-card border border-border rounded-xl p-6">
                <h3 className="font-mono text-primary text-sm mb-3">
                  // how it works
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Your drawing is captured from the canvas</li>
                  <li>Resized and centered to 30&times;30 grayscale pixels</li>
                  <li>Flattened to a 900-element input vector</li>
                  <li>Passed through 3 layers of matrix multiplications</li>
                  <li>Softmax output gives confidence per class</li>
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

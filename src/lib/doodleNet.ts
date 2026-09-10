/**
 * doodleNet: the NumPy doodle classifier, ported to run in
 * the browser against the actual trained weights (exported from
 * doodle_model.npz to /nn/doodle-weights.bin + manifest).
 *
 * Mirrors neural_network.py exactly: leaky-ReLU hidden layers, softmax
 * output. Also mirrors preprocess.normalize_image(): invert to bright
 * strokes on black, crop to the bounding box, aspect-fit into a 30×30
 * canvas with a 3px margin, scale to [0, 1].
 */

export const IMAGE_SIZE = 30;
export const CONTENT_MARGIN = 3;
export const NUM_PIXELS = IMAGE_SIZE * IMAGE_SIZE;

export interface DoodleModel {
  layerSizes: number[]; // [900, 128, 64, 5]
  classNames: string[];
  leakyAlpha: number;
  params: number;
  /** weights[l] has shape (out, in), row-major. */
  weights: Float32Array[];
  biases: Float32Array[];
}

export interface ForwardResult {
  /** Post-activation per layer, input included: [900, 128, 64, 5]. */
  activations: Float32Array[];
  /** Pre-activations (z) per weighted layer: [128, 64, 5]. */
  preActivations: Float32Array[];
  /** Softmax output, same array as activations at the last index. */
  probs: Float32Array;
  /** argmax of probs. */
  top: number;
}

export async function loadDoodleModel(): Promise<DoodleModel> {
  const [manifest, blob] = await Promise.all([
    fetch(`${import.meta.env.BASE_URL}nn/doodle-model.json`).then((r) => {
      if (!r.ok) throw new Error(`manifest: HTTP ${r.status}`);
      return r.json();
    }),
    fetch(`${import.meta.env.BASE_URL}nn/doodle-weights.bin`).then((r) => {
      if (!r.ok) throw new Error(`weights: HTTP ${r.status}`);
      return r.arrayBuffer();
    }),
  ]);

  const sizes: number[] = manifest.layerSizes;
  const weights: Float32Array[] = [];
  const biases: Float32Array[] = [];
  let offset = 0;
  for (let l = 0; l < sizes.length - 1; l++) {
    const nIn = sizes[l];
    const nOut = sizes[l + 1];
    weights.push(new Float32Array(blob, offset, nOut * nIn));
    offset += nOut * nIn * 4;
    biases.push(new Float32Array(blob, offset, nOut));
    offset += nOut * 4;
  }

  return {
    layerSizes: sizes,
    classNames: manifest.classNames,
    leakyAlpha: manifest.leakyAlpha,
    params: manifest.params,
    weights,
    biases,
  };
}

/** Forward pass for a single sample. */
export function forward(model: DoodleModel, x: Float32Array): ForwardResult {
  const { weights, biases, leakyAlpha } = model;
  const activations: Float32Array[] = [x];
  const preActivations: Float32Array[] = [];
  let a = x;

  for (let l = 0; l < weights.length; l++) {
    const w = weights[l];
    const b = biases[l];
    const nIn = a.length;
    const nOut = b.length;
    const z = new Float32Array(nOut);
    for (let j = 0; j < nOut; j++) {
      let sum = b[j];
      const row = j * nIn;
      for (let i = 0; i < nIn; i++) sum += w[row + i] * a[i];
      z[j] = sum;
    }
    preActivations.push(z);

    const out = new Float32Array(nOut);
    if (l < weights.length - 1) {
      for (let j = 0; j < nOut; j++)
        out[j] = z[j] > 0 ? z[j] : leakyAlpha * z[j];
    } else {
      // softmax, shifted for stability
      let max = -Infinity;
      for (let j = 0; j < nOut; j++) if (z[j] > max) max = z[j];
      let total = 0;
      for (let j = 0; j < nOut; j++) {
        out[j] = Math.exp(z[j] - max);
        total += out[j];
      }
      for (let j = 0; j < nOut; j++) out[j] /= total;
    }
    activations.push(out);
    a = out;
  }

  const probs = activations[activations.length - 1];
  let top = 0;
  for (let j = 1; j < probs.length; j++) if (probs[j] > probs[top]) top = j;
  return { activations, preActivations, probs, top };
}

/**
 * Input attribution for the winning class: gradient of the top logit
 * with respect to each input pixel, times the pixel value. Positive
 * values mark ink that argued FOR the verdict.
 */
export function attribution(
  model: DoodleModel,
  result: ForwardResult,
): Float32Array {
  const { weights, leakyAlpha } = model;
  const { activations, preActivations, top } = result;

  // d(logit_top)/d(a_last_hidden) = W_last[top, :]
  const wLast = weights[weights.length - 1];
  const nLastHidden = activations[activations.length - 2].length;
  let grad = new Float32Array(nLastHidden);
  for (let i = 0; i < nLastHidden; i++)
    grad[i] = wLast[top * nLastHidden + i];

  // back through the hidden layers
  for (let l = weights.length - 2; l >= 0; l--) {
    const z = preActivations[l];
    const dz = new Float32Array(z.length);
    for (let j = 0; j < z.length; j++)
      dz[j] = grad[j] * (z[j] > 0 ? 1 : leakyAlpha);

    const w = weights[l];
    const nIn = activations[l].length;
    const next = new Float32Array(nIn);
    for (let j = 0; j < dz.length; j++) {
      const row = j * nIn;
      const g = dz[j];
      if (g === 0) continue;
      for (let i = 0; i < nIn; i++) next[i] += w[row + i] * g;
    }
    grad = next;
  }

  const x = activations[0];
  const attr = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) attr[i] = grad[i] * x[i];
  return attr;
}

/**
 * Replicates preprocess.normalize_image() + to_model_input() on a canvas
 * holding the drawing as dark strokes on a white background.
 *
 * Returns the 900-float input vector, or null if the canvas is blank.
 */
export function preprocessDrawing(
  source: HTMLCanvasElement,
): Float32Array | null {
  const sw = source.width;
  const sh = source.height;
  const sctx = source.getContext("2d");
  if (!sctx) return null;
  const img = sctx.getImageData(0, 0, sw, sh).data;

  // Invert to "strokes bright on black" and find the bounding box.
  let minX = sw;
  let minY = sh;
  let maxX = -1;
  let maxY = -1;
  const inv = new Uint8ClampedArray(sw * sh * 4);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      const v = 255 - img[i]; // grayscale strokes: r == g == b
      inv[i] = inv[i + 1] = inv[i + 2] = v;
      inv[i + 3] = 255;
      if (v > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null; // blank

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;

  const invCanvas = document.createElement("canvas");
  invCanvas.width = sw;
  invCanvas.height = sh;
  invCanvas.getContext("2d")!.putImageData(new ImageData(inv, sw, sh), 0, 0);

  // Aspect-fit the crop into the content box (LANCZOS stand-in: stepped
  // halving before the final resize keeps thin strokes from vanishing).
  const contentSize = IMAGE_SIZE - 2 * CONTENT_MARGIN;
  const scale = contentSize / Math.max(bw, bh);
  const nw = Math.max(1, Math.round(bw * scale));
  const nh = Math.max(1, Math.round(bh * scale));

  let stage: HTMLCanvasElement = invCanvas;
  let stageX = minX;
  let stageY = minY;
  let stageW = bw;
  let stageH = bh;
  while (stageW > nw * 2 && stageH > nh * 2) {
    const half = document.createElement("canvas");
    half.width = Math.ceil(stageW / 2);
    half.height = Math.ceil(stageH / 2);
    const hctx = half.getContext("2d")!;
    hctx.imageSmoothingEnabled = true;
    hctx.imageSmoothingQuality = "high";
    hctx.drawImage(
      stage,
      stageX,
      stageY,
      stageW,
      stageH,
      0,
      0,
      half.width,
      half.height,
    );
    stage = half;
    stageX = 0;
    stageY = 0;
    stageW = half.width;
    stageH = half.height;
  }

  const out = document.createElement("canvas");
  out.width = IMAGE_SIZE;
  out.height = IMAGE_SIZE;
  const octx = out.getContext("2d")!;
  octx.fillStyle = "#000";
  octx.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(
    stage,
    stageX,
    stageY,
    stageW,
    stageH,
    Math.floor((IMAGE_SIZE - nw) / 2),
    Math.floor((IMAGE_SIZE - nh) / 2),
    nw,
    nh,
  );

  const pixels = octx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE).data;
  const x = new Float32Array(NUM_PIXELS);
  for (let i = 0; i < NUM_PIXELS; i++) x[i] = pixels[i * 4] / 255;
  return x;
}

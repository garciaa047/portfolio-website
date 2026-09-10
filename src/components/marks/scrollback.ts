/* Shared self-typing terminal scrollback, extracted from TerminalMark so
 * the terminal-family marks (laptop, CRT, multiplexer, desktop) all run
 * the same console. Deterministic per absolute line index, so it never
 * repeats yet never differs between mounts. */

export function hash(i: number) {
  let x = (i * 2654435761) | 0;
  x ^= x >>> 13;
  x = Math.imul(x, 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

interface Line {
  kind: "cmd" | "out" | "spark";
  words: number[]; // word-bar widths
  seed: number;
}

function lineAt(i: number, salt: number): Line {
  const j = i + salt * 7919;
  const r0 = hash(j * 3 + 1);
  const r1 = hash(j * 3 + 2);
  const pos = i % 4;
  if (pos === 0) {
    const n = 2 + Math.floor(r0 * 3);
    return {
      kind: "cmd",
      words: Array.from({ length: n }, (_, k) => 10 + hash(j * 7 + k) * 22),
      seed: r1,
    };
  }
  if (pos === 2 && r0 > 0.55) {
    return { kind: "spark", words: [], seed: r1 };
  }
  const n = 3 + Math.floor(r0 * 4);
  return {
    kind: "out",
    words: Array.from({ length: n }, (_, k) => 8 + hash(j * 7 + k) * 26),
    seed: r1,
  };
}

export interface ScrollbackOpts {
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
  lineH: number;
  /** Varies the stream between panes/marks. */
  salt?: number;
  /** Frames per line typed (speed). */
  typeFrames?: number;
  /** Overall alpha multiplier. */
  alpha?: number;
  /** Scale for word-bar widths/heights (1 = TerminalMark's). */
  scale?: number;
}

/** Draws the typing scrollback clipped to the given rect. Assumes
 * strokeStyle/fillStyle are already set to the mark color. */
export function drawScrollback(
  ctx: CanvasRenderingContext2D,
  o: ScrollbackOpts,
) {
  const { x, y, w, h, t, lineH } = o;
  const salt = o.salt ?? 0;
  const TYPE = o.typeFrames ?? 55;
  const A = o.alpha ?? 1;
  const sc = o.scale ?? 1;
  const right = x + w;

  const cursor = t / TYPE; // lines completed (fractional)
  const visible = Math.floor((h - lineH) / lineH);
  const scroll = Math.max(0, cursor - visible);
  const yOf = (li: number) => y + lineH * 0.9 + (li - scroll) * lineH;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const first = Math.max(0, Math.floor(scroll));
  const last = Math.floor(cursor);
  for (let li = first; li <= last; li++) {
    const ly = yOf(li);
    if (ly < y || ly > y + h + lineH) continue;
    const ln = lineAt(li, salt);
    const done = Math.min(1, Math.max(0, cursor - li));
    const indent = ln.kind === "cmd" ? 0 : 10 * sc;
    let px = x + 8 * sc + indent;

    // fade the oldest visible lines
    const age = (ly - y) / h;
    const fade = (0.35 + 0.5 * age) * A;

    if (ln.kind === "cmd") {
      ctx.globalAlpha = 0.8 * fade;
      ctx.lineWidth = 1.2 * sc;
      ctx.beginPath();
      ctx.moveTo(px, ly - 3.5 * sc);
      ctx.lineTo(px + 4 * sc, ly);
      ctx.lineTo(px, ly + 3.5 * sc);
      ctx.stroke();
      px += 9 * sc;
    }

    if (ln.kind === "spark") {
      const sw = (right - px - 12 * sc) * 0.75;
      const n = 24;
      const upto = Math.floor(done * n);
      ctx.globalAlpha = 0.6 * fade;
      ctx.lineWidth = 1 * sc;
      ctx.beginPath();
      for (let p = 0; p <= upto; p++) {
        const sx = px + (sw / n) * p;
        const sy =
          ly +
          2 * sc -
          6 *
            sc *
            Math.abs(Math.sin(p * 0.55 + ln.seed * 6)) *
            (0.4 + 0.6 * hash((li + salt * 7919) * 31 + p));
        if (p === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    } else {
      const total = ln.words.reduce((a, b) => a + b + 6, 0) * sc;
      let typed = done * total;
      for (const wd0 of ln.words) {
        const wd = wd0 * sc;
        const show = Math.min(wd, typed);
        if (show <= 0) break;
        ctx.globalAlpha = (ln.kind === "cmd" ? 0.7 : 0.35) * fade;
        ctx.fillRect(px, ly - 2.5 * sc, show, 5 * sc);
        px += wd + 6 * sc;
        typed -= wd + 6 * sc;
      }
    }
  }

  // blinking block cursor at the live line
  const liveY = yOf(last);
  if (Math.floor(t / 30) % 2 === 0 && liveY < y + h - 4) {
    const ln = lineAt(last, salt);
    const done = Math.min(1, cursor - last);
    let cxr = x + 8 * sc + (ln.kind === "cmd" ? 9 * sc : 10 * sc);
    if (ln.kind !== "spark") {
      const total = ln.words.reduce((a, b) => a + b + 6, 0) * sc;
      cxr = Math.min(cxr + done * total, right - 12 * sc);
    }
    ctx.globalAlpha = 0.85 * A;
    ctx.fillRect(cxr + 2, liveY - 4 * sc, 5 * sc, 8 * sc);
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}

/* Sample drawings, one per class, in tray coordinates
   (300×300). Every shape was validated offline against the actual
   trained weights via the same rasterize→normalize pipeline; each one
   classifies as its own label at 99 to 100% confidence. Keep coordinate
   changes in sync with a re-validation. */

type Pt = { x: number; y: number };
type Stroke = Pt[];

function circle(cx: number, cy: number, r: number, wob = 0, phase = 0, n = 30): Stroke {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i / (n - 1)) * Math.PI * 2;
    const rr = r * (1 + wob * Math.sin(i * 1.7 + phase) + wob * 0.6 * Math.sin(i * 0.6 + 2));
    return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr };
  });
}

function line(x0: number, y0: number, x1: number, y1: number, n = 8): Stroke {
  return Array.from({ length: n }, (_, i) => {
    const f = i / (n - 1);
    return { x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f };
  });
}

const poly = (pts: number[][]): Stroke => pts.map(([x, y]) => ({ x, y }));

export const SPECIMENS: Record<string, Stroke[]> = {
  clock: [circle(150, 150, 92, 0.03), line(150, 150, 150, 82), line(150, 150, 200, 172, 7)],
  apple: [circle(150, 165, 82, 0.05, 1.0), line(150, 84, 162, 42, 6)],
  tree: [
    circle(150, 100, 72, 0.09, 0.5),
    line(136, 168, 132, 262, 7),
    line(164, 168, 168, 262, 7),
  ],
  pants: [
    poly([[85, 70], [215, 70], [225, 240], [165, 240], [150, 141], [135, 240], [75, 240], [85, 70]]),
  ],
  airplane: [
    line(45, 160, 255, 160, 14),
    poly([[140, 158], [100, 90], [165, 158]]),
    poly([[150, 162], [185, 225], [115, 162]]),
    poly([[235, 158], [258, 110], [262, 158]]),
  ],
};

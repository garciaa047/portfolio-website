import React from "react";

/* Loads a UMD script once, resolving when its global is ready. */
const _loaded: Record<string, Promise<unknown>> = {};
function loadScript(src: string, globalName: string): Promise<unknown> {
  const w = window as unknown as Record<string, unknown>;
  if (w[globalName]) return Promise.resolve(w[globalName]);
  if (src in _loaded) return _loaded[src];
  _loaded[src] = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve(w[globalName]);
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
  return _loaded[src];
}

let _worldPromise: Promise<any> | null = null;
function loadWorld(): Promise<any> {
  if (_worldPromise) return _worldPromise;
  _worldPromise = fetch(
    "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json",
  ).then((r) => r.json());
  return _worldPromise;
}

export interface GlobeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /** Square px (default 200). */
  size?: number;
  /** Rotation multiplier. */
  speed?: number;
  /** "land" = filled pencil-tone continents; "outline" = strokes only. */
  detail?: "land" | "outline";
  /** Show the lat-long grid. */
  graticule?: boolean;
  /** Show the orbiting rings. */
  whirl?: boolean;
  /** Rotate the globe. Set false for a static mark. */
  spin?: boolean;
  style?: React.CSSProperties;
}

/**
 * Globe: the signature brand mark.
 * A slowly rotating wireframe globe with real country outlines, fully
 * monochrome, ringed by a faint orbiting "whirl". Inherits its line
 * color from CSS `color` (so it flips automatically in dark mode).
 */
export function Globe({
  size = 200,
  speed = 1,
  detail = "land",
  graticule = true,
  whirl = true,
  spin = true,
  className = "",
  style = {},
  ...rest
}: GlobeProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const stateRef = React.useRef({
    land: null as any,
    borders: null as any,
    raf: 0,
    rot: 0,
    t: 0,
  });

  React.useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const animate = (spin || whirl) && !reduce;

    Promise.all([
      loadScript("https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js", "d3"),
      loadScript(
        "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js",
        "topojson",
      ),
      loadWorld(),
    ])
      .then(([d3, topojson, world]: any[]) => {
        if (cancelled) return;
        const st = stateRef.current;
        st.land = topojson.feature(world, world.objects.countries);
        st.borders = topojson.mesh(
          world,
          world.objects.countries,
          (a: unknown, b: unknown) => a !== b,
        );

        const ctx = canvas.getContext("2d")!;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        function color() {
          return getComputedStyle(wrap!).color || "#1b1a16";
        }

        function frame() {
          if (cancelled) return;
          const w = size,
            h = size;
          canvas!.width = w * dpr;
          canvas!.height = h * dpr;
          canvas!.style.width = w + "px";
          canvas!.style.height = h + "px";
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, w, h);

          const c = color();
          const cx = w / 2,
            cy = h / 2;
          const r = w * 0.4;

          if (spin && !reduce) st.rot += 0.12 * speed;
          st.t += 0.016;

          const projection = d3
            .geoOrthographic()
            .scale(r)
            .translate([cx, cy])
            .rotate([st.rot, -12]);
          const path = d3.geoPath(projection, ctx);

          // sphere edge
          ctx.beginPath();
          path({ type: "Sphere" });
          ctx.lineWidth = 1.25;
          ctx.strokeStyle = c;
          ctx.globalAlpha = 0.9;
          ctx.stroke();

          // faint shaded disc (pencil tone)
          ctx.globalAlpha = 0.04;
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();

          // graticule
          if (graticule) {
            ctx.beginPath();
            path(d3.geoGraticule10());
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = 0.22;
            ctx.strokeStyle = c;
            ctx.stroke();
          }

          // land
          if (detail === "land") {
            ctx.beginPath();
            path(st.land);
            ctx.globalAlpha = 0.16;
            ctx.fillStyle = c;
            ctx.fill();
            ctx.beginPath();
            path(st.borders);
            ctx.lineWidth = 0.6;
            ctx.globalAlpha = 0.55;
            ctx.strokeStyle = c;
            ctx.stroke();
          } else {
            ctx.beginPath();
            path(st.land);
            ctx.lineWidth = 0.75;
            ctx.globalAlpha = 0.6;
            ctx.strokeStyle = c;
            ctx.stroke();
          }

          // whirl: orbiting arcs around the globe
          if (whirl) {
            ctx.globalAlpha = 1;
            const rings = [
              { rr: r * 1.12, w: 1.0, a: 0.35, sp: 0.9, arc: 1.5 },
              { rr: r * 1.2, w: 0.6, a: 0.2, sp: -1.4, arc: 2.4 },
              { rr: r * 1.28, w: 0.6, a: 0.12, sp: 0.6, arc: 0.9 },
            ];
            rings.forEach((ring) => {
              const a0 = st.t * ring.sp;
              ctx.beginPath();
              ctx.strokeStyle = c;
              ctx.globalAlpha = ring.a;
              ctx.lineWidth = ring.w;
              ctx.arc(cx, cy, ring.rr, a0, a0 + ring.arc);
              ctx.stroke();
              // leading tick
              const tx = cx + Math.cos(a0 + ring.arc) * ring.rr;
              const ty = cy + Math.sin(a0 + ring.arc) * ring.rr;
              ctx.beginPath();
              ctx.globalAlpha = ring.a + 0.2;
              ctx.fillStyle = c;
              ctx.arc(tx, ty, ring.w + 0.8, 0, Math.PI * 2);
              ctx.fill();
            });
          }

          ctx.globalAlpha = 1;
          if (animate) st.raf = requestAnimationFrame(frame);
        }

        st.raf = requestAnimationFrame(frame);
      })
      .catch((e) => console.error("Globe:", e));

    return () => {
      cancelled = true;
      cancelAnimationFrame(stateRef.current.raf);
    };
  }, [size, speed, detail, graticule, whirl, spin]);

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
      {...rest}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}

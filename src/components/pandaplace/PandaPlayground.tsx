import React from "react";
import { fetchJson, PlaygroundFile } from "./replay";
import { ReplayCanvas } from "./ReplayCanvas";
import { Note, TabButton } from "./ReplayTheater";

/* Table extents in world coordinates (x toward the viewer, y across). */
const TABLE = { x0: 0.3, x1: 0.75, y0: -0.35, y1: 0.35 };
const MAP_W = 230;
const MAP_H = 170;

/**
 * PandaPlayground: commission the arm yourself. The exporter pre-ran the
 * trained policy against a grid of commanded goals (all real MuJoCo
 * rollouts); click the table map to place the goal and the nearest
 * recorded errand plays. A toggle chooses table-height or airborne goals.
 */
export function PandaPlayground({ size = 280 }: { size?: number }) {
  const [data, setData] = React.useState<PlaygroundFile | null>(null);
  const [error, setError] = React.useState(false);
  const [height, setHeight] = React.useState(1); // start with the harder, airborne goals
  const [pick, setPick] = React.useState(12); // grid centre

  React.useEffect(() => {
    fetchJson<PlaygroundFile>("playground").then(setData, () => setError(true));
  }, []);

  if (error) return <Note text="Playground data not found. Run scripts/export_portfolio.py." />;
  if (!data) return <Note text="Loading the goal grid…" />;

  const perLayer = data.episodes.length / data.heights.length;
  const layer = data.episodes.slice(height * perLayer, (height + 1) * perLayer);
  const episode = layer[pick];

  const sx = (wy: number) => ((wy - TABLE.y0) / (TABLE.y1 - TABLE.y0)) * MAP_W;
  const sy = (wx: number) => ((TABLE.x1 - wx) / (TABLE.x1 - TABLE.x0)) * MAP_H;

  const choose = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * MAP_W;
    const my = ((e.clientY - rect.top) / rect.height) * MAP_H;
    let best = 0;
    let bestD = Infinity;
    layer.forEach((ep, i) => {
      const d = Math.hypot(sx(ep.goal[1]) - mx, sy(ep.goal[0]) - my);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setPick(best);
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-6)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {["on the table", "in the air"].map((label, i) => (
            <TabButton key={label} active={height === i} onClick={() => setHeight(i)}>
              {label}
            </TabButton>
          ))}
        </div>

        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          width={MAP_W}
          height={MAP_H}
          onClick={choose}
          style={{ color: "var(--text-strong)", cursor: "crosshair", border: "var(--border-hair)", borderRadius: "var(--radius-sm)" }}
          aria-label="Top-down table map: click to place the goal"
        >
          {/* table grid */}
          {[1, 2, 3, 4].map((i) => (
            <g key={i} opacity={0.1}>
              <line x1={(MAP_W * i) / 5} x2={(MAP_W * i) / 5} y1={0} y2={MAP_H} stroke="currentColor" strokeWidth={0.6} />
              <line y1={(MAP_H * i) / 5} y2={(MAP_H * i) / 5} x1={0} x2={MAP_W} stroke="currentColor" strokeWidth={0.6} />
            </g>
          ))}
          {/* the robot's pedestal edge */}
          <text x={MAP_W / 2} y={MAP_H - 5} textAnchor="middle" fontSize={7} fill="currentColor" opacity={0.45} fontFamily="var(--font-mono)">
            ◦ robot base this side
          </text>

          {layer.map((ep, i) => (
            <circle
              key={i}
              cx={sx(ep.goal[1])}
              cy={sy(ep.goal[0])}
              r={i === pick ? 6 : 2.6}
              fill={i === pick ? "none" : "currentColor"}
              stroke="currentColor"
              strokeWidth={i === pick ? 1.2 : 0}
              opacity={i === pick ? 0.95 : ep.success ? 0.4 : 0.15}
            />
          ))}
          {/* crosshair on the commissioned goal */}
          <g stroke="currentColor" strokeWidth={1} opacity={0.95}>
            <line x1={sx(episode.goal[1]) - 9} x2={sx(episode.goal[1]) + 9} y1={sy(episode.goal[0])} y2={sy(episode.goal[0])} />
            <line y1={sy(episode.goal[0]) - 9} y2={sy(episode.goal[0]) + 9} x1={sx(episode.goal[1])} x2={sx(episode.goal[1])} />
          </g>
        </svg>

        <span className="mono-label" style={{ color: "var(--text-soft)", maxWidth: MAP_W, textAlign: "center", lineHeight: 1.6 }}>
          goal ({episode.goal[0].toFixed(2)}, {episode.goal[1].toFixed(2)},{" "}
          {episode.goal[2].toFixed(2)}) ·{" "}
          {episode.success
            ? `delivered in ${episode.solved_at} steps`
            : "outside it, a miss"}
        </span>
      </div>

      <ReplayCanvas meta={data} episode={episode} size={size} />
    </div>
  );
}

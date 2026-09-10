import React from "react";
import { fetchJson, TimelineFile } from "./replay";
import { ClipPlayer, ClipsFile, fetchClips } from "./ClipPlayer";
import { ReplayCanvas } from "./ReplayCanvas";
import { Note } from "./ReplayTheater";

/**
 * TrainingChronicle: success and lift rate straight from the TensorBoard
 * logs, with curriculum stage boundaries ruled in. Pick a checkpoint to see
 * what the policy could do at that point in training.
 */
export function TrainingChronicle() {
  const [data, setData] = React.useState<TimelineFile | null>(null);
  const [clips, setClips] = React.useState<ClipsFile | null>(null);
  const [error, setError] = React.useState(false);
  const [pick, setPick] = React.useState(0);
  const [ep, setEp] = React.useState(0);
  const [hover, setHover] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetchJson<TimelineFile>("timeline").then(setData, () => setError(true));
    fetchClips().then(setClips, () => setClips(null)); // footage is optional
  }, []);

  if (error) return <Note text="Timeline data not found. Run scripts/export_portfolio.py." />;
  if (!data) return <Note text="Loading training history…" />;

  const { curves, checkpoints } = data;
  const ckpt = checkpoints[pick];
  const episode = ckpt.episodes[ep % ckpt.episodes.length];
  const solved = ckpt.episodes.filter((e) => e.success).length;

  // ---- chart geometry ----
  const W = 640;
  const H = 200;
  const PAD = { l: 34, r: 10, t: 12, b: 22 };
  const maxStep = Math.max(...curves.success.steps);
  const sx = (step: number) => PAD.l + (step / maxStep) * (W - PAD.l - PAD.r);
  const sy = (v: number) => PAD.t + (1 - v) * (H - PAD.t - PAD.b);
  const path = (steps: number[], values: number[]) =>
    steps.map((s, i) => `${i === 0 ? "M" : "L"}${sx(s).toFixed(1)},${sy(values[i]).toFixed(1)}`).join("");

  const hoverIdx =
    hover === null
      ? null
      : curves.success.steps.reduce(
          (best, s, i) =>
            Math.abs(s - hover) < Math.abs(curves.success.steps[best] - hover) ? i : best,
          0,
        );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", color: "var(--text-strong)" }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          setHover(Math.max(0, Math.min(maxStep, ((x - PAD.l) / (W - PAD.l - PAD.r)) * maxStep)));
        }}
        onMouseLeave={() => setHover(null)}
      >
        {/* axes + gridlines */}
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(v)} y2={sy(v)} stroke="currentColor" strokeWidth={0.5} opacity={0.15} />
            <text x={PAD.l - 6} y={sy(v) + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.55} fontFamily="var(--font-mono)">
              {Math.round(v * 100)}%
            </text>
          </g>
        ))}

        {/* curriculum stage boundaries */}
        {curves.stage_transitions.map((tr) =>
          tr.step === 0 ? null : (
            <g key={tr.step}>
              <line x1={sx(tr.step)} x2={sx(tr.step)} y1={PAD.t} y2={H - PAD.b} stroke="currentColor" strokeWidth={0.5} strokeDasharray="2 3" opacity={0.35} />
              {/* stagger labels on two rows so adjacent stages don't collide;
                  right-anchor labels near the chart edge so they don't clip */}
              <text
                x={sx(tr.step) + (sx(tr.step) > W - 80 ? -3 : 3)}
                y={PAD.t + 8 + (tr.stage % 2) * 10}
                textAnchor={sx(tr.step) > W - 80 ? "end" : "start"}
                fontSize={8}
                fill="currentColor"
                opacity={0.55}
                fontFamily="var(--font-mono)"
              >
                {curves.stage_names[tr.stage]}
              </text>
            </g>
          ),
        )}

        {/* curves: success firm, lift faint */}
        <path d={path(curves.success.steps, curves.success.values)} fill="none" stroke="currentColor" strokeWidth={1.4} />
        <path d={path(curves.lift.steps, curves.lift.values)} fill="none" stroke="currentColor" strokeWidth={0.9} opacity={0.45} strokeDasharray="4 3" />

        {/* checkpoint ticks */}
        {checkpoints.map((c, i) => (
          <g key={c.steps} onClick={() => { setPick(i); setEp(0); }} style={{ cursor: "pointer" }}>
            <circle cx={sx(c.steps)} cy={H - PAD.b} r={i === pick ? 5 : 3.5} fill={i === pick ? "currentColor" : "var(--surface-page)"} stroke="currentColor" strokeWidth={1} />
            <text x={sx(c.steps)} y={H - PAD.b + 14} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.6} fontFamily="var(--font-mono)">
              {c.steps / 1000}k
            </text>
          </g>
        ))}

        {/* hover readout */}
        {hoverIdx !== null && (
          <g pointerEvents="none">
            <line x1={sx(curves.success.steps[hoverIdx])} x2={sx(curves.success.steps[hoverIdx])} y1={PAD.t} y2={H - PAD.b} stroke="currentColor" strokeWidth={0.5} opacity={0.4} />
            <text x={Math.min(sx(curves.success.steps[hoverIdx]) + 5, W - 150)} y={PAD.t + 20} fontSize={9} fill="currentColor" fontFamily="var(--font-mono)">
              {Math.round(curves.success.steps[hoverIdx] / 1000)}k · success{" "}
              {Math.round(curves.success.values[hoverIdx] * 100)}% · lift{" "}
              {Math.round((curves.lift.values[hoverIdx] ?? 0) * 100)}%
            </text>
          </g>
        )}

        <text x={W - PAD.r} y={sy(1) - 4} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.5} fontFamily="var(--font-mono)">
          success rate · ‑ ‑ lift rate · env steps →
        </text>
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-5)", justifyContent: "center" }}>
        {(() => {
          const clip = clips?.chronicle.find((c) => c.steps === ckpt.steps);
          if (clip)
            return <ClipPlayer clip={clip} width={360} loop />;
          return (
            <ReplayCanvas
              meta={data}
              episode={episode}
              size={210}
              onDone={() => setEp((e) => (e + 1) % ckpt.episodes.length)}
            />
          );
        })()}
        <p className="mono-label" style={{ maxWidth: 280, lineHeight: 1.7, color: "var(--text-soft)" }}>
          policy @ {ckpt.steps.toLocaleString()} steps
          <br />
          {(() => {
            const c = clips?.chronicle.find((x) => x.steps === ckpt.steps);
            if (!c)
              return <>hardest suite · {solved}/{ckpt.episodes.length} episodes solved</>;
            return (
              <>
                training on “{c.stage.replace(/_/g, " ")}”,{" "}
                {c.success ? `solved in ${c.solved_at} steps` : "not yet solved"}
              </>
            );
          })()}
          <br />
          <span style={{ opacity: 0.7 }}>
            click a tick on the axis to time-travel
          </span>
        </p>
      </div>
    </div>
  );
}

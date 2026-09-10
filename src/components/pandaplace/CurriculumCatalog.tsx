import React from "react";
import { CurriculumFile, CurriculumStage, fetchJson } from "./replay";
import { ReplayCanvas } from "./ReplayCanvas";
import { Note } from "./ReplayTheater";

/**
 * CurriculumCatalog: the six training stages as library catalog cards,
 * each stating its goal distribution and advancement gate, illustrated by
 * the *final* policy performing that stage's task (real recorded rollouts).
 */
export function CurriculumCatalog() {
  const [data, setData] = React.useState<CurriculumFile | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    fetchJson<CurriculumFile>("curriculum").then(setData, () => setError(true));
  }, []);

  if (error) return <Note text="Curriculum data not found. Run scripts/export_portfolio.py." />;
  if (!data) return <Note text="Loading curriculum…" />;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "var(--space-4)",
        width: "100%",
      }}
    >
      {data.stages.map((stage) => (
        <CatalogCard key={stage.index} meta={data} stage={stage} />
      ))}
    </div>
  );
}

function CatalogCard({ meta, stage }: { meta: CurriculumFile; stage: CurriculumStage }) {
  const [ep, setEp] = React.useState(0);
  const episode = stage.episodes[ep % stage.episodes.length];
  const mix = stage.goal_mix;
  const total = mix.near + mix.table + mix.lifted || 1;
  const pct = (v: number) => `${Math.round((v / total) * 100)}%`;

  const row = (label: string, value: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)" }}>
      <span style={{ opacity: 0.6 }}>{label}</span>
      <span style={{ textAlign: "right" }}>{value}</span>
    </div>
  );

  return (
    <article
      style={{
        border: "var(--border-hair)",
        borderRadius: "var(--radius-sm)",
        background: "var(--surface-page)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* catalog header rule, as on the About card */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "var(--border-hair)", paddingBottom: "var(--space-2)" }}>
        <span className="mono-label">stage {stage.index}</span>
        <span
          style={{
            fontFamily: "var(--font-serif, inherit)",
            fontStyle: "italic",
            fontSize: "var(--text-lg)",
          }}
        >
          {stage.name.replace(/_/g, " ")}
        </span>
      </div>

      <div style={{ alignSelf: "center" }}>
        <ReplayCanvas
          meta={meta}
          episode={episode}
          size={180}
          turntable={false}
          onDone={() => setEp((e) => (e + 1) % stage.episodes.length)}
        />
      </div>

      <div
        className="mono-label"
        style={{ display: "flex", flexDirection: "column", gap: 4, lineHeight: 1.6, color: "var(--text-soft)" }}
      >
        {row("goals", `near ${pct(mix.near)} · table ${pct(mix.table)} · lifted ${pct(mix.lifted)}`)}
        {row(
          "object start",
          stage.randomize_object ? `random ±${(stage.object_xy_range * 100).toFixed(0)} cm` : "fixed home",
        )}
        {row(
          "grasped starts",
          stage.start_grasped > 0 ? `${Math.round(stage.start_grasped * 100)}% of episodes` : "none",
        )}
        {row(
          "advance gate",
          `≥${Math.round(stage.gate.success * 100)}% over ${stage.gate.min_steps / 1000}k+ steps`,
        )}
      </div>
    </article>
  );
}

import React from "react";
import { ClipPlayer, ClipsFile, fetchClips } from "./ClipPlayer";

const SUITE_LABELS: Record<string, string> = {
  fixed: "Fixed",
  random_goal: "Random goal",
  random_goal_object: "Random goal + object",
};

/**
 * ReplayTheater: real MuJoCo footage of the trained SAC+HER policy. Suite
 * tabs pick the evaluation distribution. Episodes advance when a clip ends,
 * or jump via the dots.
 */
export function ReplayTheater({ size = 480 }: { size?: number }) {
  const [data, setData] = React.useState<ClipsFile | null>(null);
  const [error, setError] = React.useState(false);
  const [suite, setSuite] = React.useState("fixed");
  const [ep, setEp] = React.useState(0);

  React.useEffect(() => {
    fetchClips().then(setData, () => setError(true));
  }, []);

  if (error) return <Note text="Footage not found. Run scripts/export_clips.py." />;
  if (!data) return <Note text="Loading footage…" />;

  const episodes = data.theater[suite] ?? [];
  const clip = episodes[ep % episodes.length];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", justifyContent: "center" }}>
        {Object.keys(data.theater).map((name) => (
          <TabButton
            key={name}
            active={name === suite}
            onClick={() => {
              setSuite(name);
              setEp(0);
            }}
          >
            {SUITE_LABELS[name] ?? name}
          </TabButton>
        ))}
      </div>

      <ClipPlayer
        clip={clip}
        width={size}
        onEnded={() => setEp((e) => (e + 1) % episodes.length)}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        {episodes.map((e, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setEp(i)}
            aria-label={`Episode ${i + 1}`}
            title={e.success ? "solved" : "unsolved"}
            style={{
              width: 10,
              height: 10,
              padding: 0,
              borderRadius: "50%",
              cursor: "pointer",
              border: "1px solid var(--text-muted)",
              background: i === ep % episodes.length ? "var(--text-strong)" : "transparent",
              opacity: e.success ? 1 : 0.4,
            }}
          />
        ))}
        <span className="mono-label" style={{ marginLeft: "var(--space-2)" }}>
          ep. {String((ep % episodes.length) + 1).padStart(2, "0")} ·{" "}
          {clip.success
            ? `solved in ${clip.solved_at ?? "?"} steps`
            : "unsolved"}
        </span>
      </div>
    </div>
  );
}

export function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--label-sm)",
        letterSpacing: "var(--tracking-label)",
        textTransform: "uppercase",
        padding: "4px 10px",
        cursor: "pointer",
        borderRadius: "var(--radius-sm)",
        border: "var(--border-hair)",
        background: active ? "var(--text-strong)" : "transparent",
        color: active ? "var(--surface-page)" : "var(--text-soft)",
      }}
    >
      {children}
    </button>
  );
}

export function Note({ text }: { text: string }) {
  return (
    <p className="mono-label" style={{ color: "var(--text-muted)", padding: "var(--space-5)" }}>
      {text}
    </p>
  );
}

import React from "react";

const MIN_CONFIDENCE = 0.3; // below this the drawing is treated as unfinished

/**
 * PredictionPanel: ranked class probabilities as inked
 * bars; the winner gets the red pen once the network is at least 30%
 * sure (the same threshold the desktop app used).
 */
export function PredictionPanel({
  classNames,
  probs,
}: {
  classNames: string[];
  probs: Float32Array | null;
}) {
  if (!probs) {
    return (
      <Idle>draw something in the tray.</Idle>
    );
  }

  const ranked = classNames
    .map((name, i) => ({ name, p: probs[i] }))
    .sort((a, b) => b.p - a.p);
  const confident = ranked[0].p >= MIN_CONFIDENCE;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        width: "100%",
      }}
    >
      {ranked.map(({ name, p }, rank) => {
        const isTop = rank === 0 && confident;
        return (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "9ch 1fr 5ch",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--label-sm)",
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase",
                color: isTop ? "var(--annotation)" : "var(--text-soft)",
              }}
            >
              {isTop ? "✳ " : ""}
              {name}
            </span>
            <span
              style={{
                position: "relative",
                height: 7,
                border: "var(--border-hair)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  right: `${(1 - p) * 100}%`,
                  background: isTop ? "var(--annotation)" : "var(--text-muted)",
                  opacity: isTop ? 0.85 : 0.55,
                  transition: "right 120ms linear",
                }}
              />
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--label-sm)",
                color: isTop ? "var(--annotation)" : "var(--text-muted)",
                textAlign: "right",
              }}
            >
              {(p * 100).toFixed(1)}%
            </span>
          </div>
        );
      })}
      {!confident && (
        <Idle>nothing above 30% confidence yet.</Idle>
      )}
    </div>
  );
}

function Idle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        color: "var(--text-muted)",
        fontSize: "var(--text-base)",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

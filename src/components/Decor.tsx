import React from "react";

/**
 * CornerMarks: four L-shaped registration brackets at the corners of a
 * positioned parent. A technical-drawing / blueprint motif that fits the
 * research-paper brand (brackets, not decoration). Parent must be
 * position: relative.
 */
export function CornerMarks({
  size = 9,
  inset = 7,
  color = "var(--line-strong)",
  opacity = 0.35,
}: {
  size?: number;
  inset?: number;
  color?: string;
  opacity?: number;
}) {
  const corners: React.CSSProperties[] = [
    { top: inset, left: inset, borderTop: "1px solid", borderLeft: "1px solid" },
    { top: inset, right: inset, borderTop: "1px solid", borderRight: "1px solid" },
    {
      bottom: inset,
      left: inset,
      borderBottom: "1px solid",
      borderLeft: "1px solid",
    },
    {
      bottom: inset,
      right: inset,
      borderBottom: "1px solid",
      borderRight: "1px solid",
    },
  ];
  return (
    <>
      {corners.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderColor: color,
            opacity,
            pointerEvents: "none",
            ...c,
          }}
        />
      ))}
    </>
  );
}

/**
 * SchematicFrame: a faint drafting-plate frame (dashed border, corner
 * brackets, edge ticks) used as a backdrop ornament behind the hero
 * mark. Pure monochrome, inherits the current text color.
 */
export function SchematicFrame({
  size = 460,
  style = {},
}: {
  /** A px number, or a CSS length (e.g. "100%") to fill a sized parent. */
  size?: number | string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{
        position: "absolute",
        color: "var(--text-strong)",
        pointerEvents: "none",
        ...style,
      }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="0.2" opacity="0.22">
        {/* outer dashed plate border */}
        <rect x="6" y="6" width="88" height="88" strokeDasharray="0.6 1.6" />
        {/* inner rule */}
        <rect x="14" y="14" width="72" height="72" />
        {/* corner brackets on the outer border */}
        <g strokeWidth="0.4">
          <path d="M 6 13 V 6 H 13" />
          <path d="M 87 6 H 94 V 13" />
          <path d="M 94 87 V 94 H 87" />
          <path d="M 13 94 H 6 V 87" />
        </g>
        {/* midpoint ticks on each edge */}
        <g strokeWidth="0.4">
          <line x1="50" y1="6" x2="50" y2="10" />
          <line x1="50" y1="90" x2="50" y2="94" />
          <line x1="6" y1="50" x2="10" y2="50" />
          <line x1="90" y1="50" x2="94" y2="50" />
        </g>
        {/* quarter ticks along the top and bottom edges */}
        <line x1="28" y1="6" x2="28" y2="8.5" />
        <line x1="72" y1="6" x2="72" y2="8.5" />
        <line x1="28" y1="91.5" x2="28" y2="94" />
        <line x1="72" y1="91.5" x2="72" y2="94" />
      </g>
    </svg>
  );
}

/**
 * Reticle: a faint surveyor's target (crosshair + concentric rings) used
 * as a backdrop ornament behind the globe. Pure monochrome, inherits the
 * current text color.
 */
export function Reticle({
  size = 460,
  style = {},
}: {
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{
        position: "absolute",
        color: "var(--text-strong)",
        pointerEvents: "none",
        ...style,
      }}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="0.2"
        opacity="0.22"
      >
        <circle cx="50" cy="50" r="48" strokeDasharray="0.6 1.6" />
        <circle cx="50" cy="50" r="38" />
        <circle cx="50" cy="50" r="26" strokeDasharray="0.6 1.6" />
        <line x1="2" y1="50" x2="98" y2="50" />
        <line x1="50" y1="2" x2="50" y2="98" />
        {/* tick marks at the cardinal points */}
        <line x1="50" y1="0.5" x2="50" y2="5" strokeWidth="0.4" />
        <line x1="50" y1="95" x2="50" y2="99.5" strokeWidth="0.4" />
        <line x1="0.5" y1="50" x2="5" y2="50" strokeWidth="0.4" />
        <line x1="95" y1="50" x2="99.5" y2="50" strokeWidth="0.4" />
      </g>
    </svg>
  );
}

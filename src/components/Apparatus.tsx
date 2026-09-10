import React from "react";

/**
 * Apparatus: the small furniture. Margin notes in red ink, footnote
 * references, and the asterism divider.
 */

/**
 * Annotation: a marginal note in the professor's hand. Inline by
 * default; add `float` to let it escape into the true page margin on
 * very wide viewports (parent must be position: relative).
 */
export function Annotation({
  children,
  float = false,
  top,
  style,
}: {
  children: React.ReactNode;
  float?: boolean;
  /** CSS top offset used when floated into the margin. */
  top?: string | number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`annotation${float ? " margin-float" : ""}`}
      style={{
        display: "block",
        ...(top !== undefined ? { ["--margin-top" as string]: top } : {}),
        ...style,
      }}
    >
      <span className="annotation-mark" aria-hidden="true">
        ✳
      </span>
      {children}
    </span>
  );
}

/** FootnoteRef: a red superscript numeral linking down to the notes. */
export function FootnoteRef({ n }: { n: number }) {
  return (
    <sup className="fn-ref">
      <a href={`#fn-${n}`} id={`fnref-${n}`} aria-label={`Footnote ${n}`}>
        {n}
      </a>
    </sup>
  );
}

/** Asterism (⁂), the typographer's rest between movements. */
export function Asterism({ style }: { style?: React.CSSProperties }) {
  return (
    <span className="asterism" aria-hidden="true" style={style}>
      ⁂
    </span>
  );
}

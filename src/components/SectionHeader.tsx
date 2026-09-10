import React from "react";
import { Reveal, fxDelay } from "./Reveal";

export interface SectionHeaderProps {
  /** Two-digit section number, rendered like a paper's section mark. */
  index?: string;
  /** Mono eyebrow label, e.g. a section number / kicker. */
  eyebrow?: string;
  /** Serif title. */
  title: string;
  /** Optional serif lede beneath the title. */
  lede?: string;
  id?: string;
  style?: React.CSSProperties;
}

/**
 * SectionHeader: a mono eyebrow with a hairline rule that draws itself
 * across the page on scroll, a serif title, and a large outlined numeral
 * behind it, like the plate numbers in an old atlas.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lede,
  id,
  style,
}: SectionHeaderProps) {
  return (
    <Reveal
      as="header"
      id={id}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        marginBottom: "var(--space-7)",
        ...style,
      }}
    >
      {index && (
        <span className="plate-num fx-fade" aria-hidden="true">
          {index}
        </span>
      )}

      {(eyebrow || index) && (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          {index && (
            <span
              className="fx-up"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--label-base)",
                letterSpacing: "var(--tracking-mono)",
                color: "var(--text-strong)",
              }}
            >
              §{index}
            </span>
          )}
          {eyebrow && (
            <span className="mono-label fx-up" style={fxDelay(80)}>
              {eyebrow}
            </span>
          )}
          <span
            className="fx-rule"
            style={{
              ...fxDelay(200),
              flex: 1,
              height: 1,
              background: "var(--line-hair)",
            }}
          />
        </div>
      )}
      <h2
        className="fx-up"
        style={{
          ...fxDelay(120),
          position: "relative",
          fontSize: "var(--text-3xl)",
          fontWeight: "var(--weight-medium)",
        }}
      >
        {title}
      </h2>
      {lede && (
        <p
          className="fx-up"
          style={{
            ...fxDelay(220),
            position: "relative",
            color: "var(--text-soft)",
            fontSize: "var(--text-lg)",
            maxWidth: "var(--measure)",
            lineHeight: "var(--leading-normal)",
          }}
        >
          {lede}
        </p>
      )}
    </Reveal>
  );
}

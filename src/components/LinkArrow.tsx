import React from "react";

export interface LinkArrowProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Arrow direction glyph. */
  direction?: "right" | "up-right" | "down";
}

const GLYPH: Record<string, string> = {
  right: "→", // →
  "up-right": "↗", // ↗
  down: "↓", // ↓
};

/**
 * LinkArrow: a mono, underlined-on-hover text link with a glyph arrow
 * that slides on hover. Glyphs, not icons.
 */
export function LinkArrow({
  direction = "right",
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: LinkArrowProps) {
  const [hover, setHover] = React.useState(false);
  const slide =
    direction === "down"
      ? `translateY(${hover ? "2px" : "0"})`
      : `translateX(${hover ? "3px" : "0"})`;

  return (
    <a
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "var(--space-2)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--label-base)",
        letterSpacing: "var(--tracking-label)",
        textTransform: "uppercase",
        color: hover ? "var(--text-strong)" : "var(--text-soft)",
        borderBottom: hover
          ? "1px solid var(--line-strong)"
          : "1px solid transparent",
        paddingBottom: "1px",
        transition: "var(--t-colors)",
        cursor: "pointer",
        ...style,
      }}
      onMouseEnter={(e) => {
        setHover(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHover(false);
        onMouseLeave?.(e);
      }}
      {...rest}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        style={{
          transform: slide,
          transition: "var(--t-transform)",
          display: "inline-block",
        }}
      >
        {GLYPH[direction]}
      </span>
    </a>
  );
}

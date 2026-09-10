import React from "react";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** solid = hairline capsule; bare = no border, just tracked mono. */
  variant?: "solid" | "bare";
}

/**
 * Tag: a small mono metadata chip (e.g. a tech label on a project).
 * Uppercase + tracked, near-square hairline capsule.
 */
export function Tag({
  variant = "solid",
  children,
  style,
  ...rest
}: TagProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--label-sm)",
    letterSpacing: "var(--tracking-label)",
    textTransform: "uppercase",
    color: "var(--text-soft)",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };
  const solid: React.CSSProperties =
    variant === "solid"
      ? {
          padding: "var(--space-1) var(--space-2)",
          border: "var(--border-hair)",
          borderRadius: "var(--radius-sm)",
          background: "var(--field-shade)",
        }
      : {};
  return (
    <span style={{ ...base, ...solid, ...style }} {...rest}>
      {children}
    </span>
  );
}

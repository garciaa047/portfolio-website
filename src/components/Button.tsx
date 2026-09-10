import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = solid ink; secondary = hairline outline; ghost = bare. */
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}

/**
 * Button: the brand's primary action. Mono uppercase label, near-square
 * corners, calm hover (shade) and a 0.5px press nudge. No bounce.
 */
export function Button({
  variant = "primary",
  size = "md",
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  disabled,
  ...rest
}: ButtonProps) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);

  const pad =
    size === "sm"
      ? "var(--space-2) var(--space-4)"
      : "var(--space-3) var(--space-5)";
  const fontSize = size === "sm" ? "var(--label-sm)" : "var(--label-base)";

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: pad,
    fontFamily: "var(--font-mono)",
    fontSize,
    letterSpacing: "var(--tracking-label)",
    textTransform: "uppercase",
    lineHeight: 1,
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: "var(--radius-sm)",
    border: "1px solid transparent",
    transition: "var(--t-colors), var(--t-transform)",
    transform: press ? "translateY(0.5px)" : "translateY(0)",
    opacity: disabled ? 0.45 : 1,
    userSelect: "none",
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: hover ? "var(--ink-700)" : "var(--accent)",
      color: "var(--accent-on)",
      borderColor: "var(--accent)",
    },
    secondary: {
      background: hover ? "var(--field-shade)" : "transparent",
      color: "var(--text-strong)",
      borderColor: "var(--line-strong)",
    },
    ghost: {
      background: hover ? "var(--field-shade)" : "transparent",
      color: hover ? "var(--text-strong)" : "var(--text-soft)",
      borderColor: "transparent",
    },
  };

  return (
    <button
      type="button"
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        setHover(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHover(false);
        setPress(false);
        onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        setPress(true);
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        setPress(false);
        onMouseUp?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

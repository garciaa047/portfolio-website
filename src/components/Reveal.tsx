import React from "react";

/**
 * Reveal: the scroll-choreography wrapper. Watches itself with an
 * IntersectionObserver and gains `.is-visible` once on entry; any
 * `.fx-up` / `.fx-fade` / `.fx-rule` / `.fx-node` descendants then play
 * (see app.css). Stagger children by setting `--fx-delay` inline.
 * Reduced-motion users (and browsers without IO) see everything
 * immediately.
 */
export function Reveal({
  as = "div",
  children,
  className = "",
  style,
  ...rest
}: {
  as?: "div" | "section" | "header" | "footer" | "article" | "aside";
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & Record<string, unknown>) {
  const ref = React.useRef<HTMLElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return React.createElement(
    as,
    {
      ref,
      className: `reveal${visible ? " is-visible" : ""}${
        className ? " " + className : ""
      }`,
      style,
      ...rest,
    },
    children,
  );
}

/** Inline helper: `--fx-delay` style for staggered children. */
export function fxDelay(ms: number): React.CSSProperties {
  return { ["--fx-delay" as string]: `${ms}ms` };
}

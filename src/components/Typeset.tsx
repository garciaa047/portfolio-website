import React from "react";

/**
 * TypesetTitle: splits the text into letters and
 * lets each one settle onto the page with a staggered letterpress
 * animation (`.ts-letter` in app.css). Screen readers get the plain
 * string via aria-label.
 */
export function TypesetTitle({
  text,
  style,
}: {
  text: string;
  style?: React.CSSProperties;
}) {
  let i = 0;
  const words = text.split(" ");
  return (
    <h1 aria-label={text} style={style}>
      {words.map((word, w) => (
        <React.Fragment key={w}>
          <span className="ts-word" aria-hidden="true">
            {Array.from(word).map((ch, c) => (
              <span
                key={c}
                className="ts-letter"
                style={{ ["--i" as string]: i++ }}
              >
                {ch}
              </span>
            ))}
          </span>
          {w < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </h1>
  );
}

/**
 * TypeLabel: a mono eyebrow that types itself out behind a blinking
 * red caret, like a log line being entered. Renders the full text
 * immediately for reduced-motion users.
 */
export function TypeLabel({
  text,
  startDelay = 0,
  className = "mono-label",
  style,
}: {
  text: string;
  startDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [n, setN] = React.useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? text.length
      : 0,
  );

  React.useEffect(() => {
    if (n >= text.length) return;
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        setN((k) => {
          if (k + 1 >= text.length) window.clearInterval(id);
          return k + 1;
        });
      }, 32);
    }, startDelay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, startDelay]);

  const done = n >= text.length;
  return (
    <span className={className} style={style} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      <span
        className={`type-caret${done ? " is-done" : ""}`}
        aria-hidden="true"
      />
    </span>
  );
}

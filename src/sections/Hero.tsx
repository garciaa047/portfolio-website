import React from "react";
import { LaptopMark } from "../components/marks/LaptopMark";
import { Button } from "../components/Button";
import { LinkArrow } from "../components/LinkArrow";
import { SchematicFrame } from "../components/Decor";
import { TypesetTitle, TypeLabel } from "../components/Typeset";
import { profile } from "../data";

/**
 * Hero: the title page. One typesetting sequence on load. The eyebrow
 * types itself behind a red caret, the name lands letter by letter, a red
 * stroke underlines it, then the tagline, catalog line, and buttons. The
 * laptop terminal (Fig. 1) fades up on the right in its drafting frame.
 */
export function Hero() {
  return (
    <section id="top" style={{ position: "relative", overflow: "hidden" }}>
      {/* Wiremesh / graph-paper backdrop, faded toward the edges. */}
      <div
        className="texture-backdrop wire-grid fade-radial"
        style={{ ["--fade-x" as string]: "72%", ["--fade-y" as string]: "38%" }}
      />

      <div
        className="hero-grid"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding:
            "calc(var(--space-10) + var(--space-6)) var(--gutter) var(--space-9)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
          gap: "var(--space-8)",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-5)",
          }}
        >
          <TypeLabel text={profile.role} startDelay={150} />

          <div>
            <TypesetTitle
              text={profile.name}
              style={{
                fontSize: "var(--text-5xl)",
                fontWeight: "var(--weight-medium)",
                letterSpacing: "var(--tracking-display)",
              }}
            />
            {/* The pen stroke beneath the name. */}
            <span
              className="hero-flourish"
              aria-hidden="true"
              style={{
                display: "block",
                width: 88,
                height: 3,
                marginTop: "var(--space-3)",
                background: "var(--annotation)",
                transform: "rotate(-0.6deg)",
                transformOrigin: "0 50%",
                borderRadius: 1,
              }}
            />
          </div>

          <p
            className="hero-enter"
            style={{
              ["--d" as string]: "780ms",
              fontSize: "var(--text-xl)",
              color: "var(--text-soft)",
              maxWidth: "var(--measure-narrow)",
              lineHeight: "var(--leading-normal)",
            }}
          >
            {profile.tagline}
          </p>

          {/* Mono meta line: the catalog details. */}
          <div
            className="hero-enter"
            style={{
              ["--d" as string]: "980ms",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "var(--space-2) var(--space-3)",
            }}
          >
            <MetaItem>{profile.university}</MetaItem>
            <Sep />
            <MetaItem>{profile.standing}</MetaItem>
            <Sep />
            <MetaItem>GPA {profile.gpa}</MetaItem>
          </div>

          <div
            className="hero-enter"
            style={{
              ["--d" as string]: "1180ms",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-5)",
              marginTop: "var(--space-2)",
              flexWrap: "wrap",
            }}
          >
            <Button onClick={() => goTo("projects")}>View projects</Button>
            <LinkArrow
              href={`${import.meta.env.BASE_URL}resume.pdf`}
              target="_blank"
              rel="noopener"
              direction="up-right"
            >
              View resume
            </LinkArrow>
          </div>
        </div>

        <div
          className="hero-enter"
          style={{
            ["--d" as string]: "550ms",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Plate />
        </div>
      </div>
    </section>
  );
}

/** How much of the plate's width the mark itself occupies. */
const MARK_RATIO = 0.6;
/** The plate's natural size; it shrinks below this when the column does. */
const PLATE_MAX = 470;

/**
 * Plate: the drafting frame, the mark, and the caption as one square unit.
 * The geometry all derives from the plate's measured width, so the frame
 * and the mark hold their proportions as the column narrows. The caption
 * stays at its type size.
 */
function Plate() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(PLATE_MAX);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: `min(100%, ${PLATE_MAX}px)`,
        aspectRatio: "1 / 1",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "var(--space-3)",
      }}
    >
      <SchematicFrame size="100%" style={{ top: 0, left: 0 }} />
      <LaptopMark size={Math.round(width * MARK_RATIO)} />
      <span
        style={{
          position: "relative",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--label-sm)",
          letterSpacing: "var(--tracking-mono)",
          color: "var(--text-muted)",
        }}
      >
        Fig. 1. Terminal, laptop
      </span>
    </div>
  );
}

function MetaItem({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--label-sm)",
        letterSpacing: "var(--tracking-mono)",
        textTransform: "uppercase",
        color: "var(--text-muted)",
      }}
    >
      {children}
    </span>
  );
}

function Sep() {
  return (
    <span aria-hidden="true" style={{ color: "var(--text-faint)" }}>
      /
    </span>
  );
}

/**
 * Jump to a section by hash, so the URL matches where you are and the jump
 * lands in history. The smooth scroll comes from `scroll-behavior` on the
 * root.
 */
function goTo(id: string) {
  if (window.location.hash === `#${id}`) {
    document.getElementById(id)?.scrollIntoView();
    return;
  }
  window.location.hash = id;
}

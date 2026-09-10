import React from "react";
import { Tag } from "./Tag";
import { LinkArrow } from "./LinkArrow";
import { CornerMarks } from "./Decor";
import { Annotation } from "./Apparatus";
import { NeuralNetMark } from "./marks/NeuralNetMark";
import { RobotArmMark } from "./marks/RobotArmMark";
import type { Project } from "../data";

const MARKS: Record<
  NonNullable<Project["figure"]>,
  (props: { size?: number }) => React.ReactElement
> = {
  "robot-arm": RobotArmMark,
  "neural-net": NeuralNetMark,
};

export interface ProjectCardProps extends Project {
  /** wide = flagship row with the plate beside the text;
      stack = plate above the text in a grid cell. */
  layout?: "wide" | "stack";
  /** Picks between a line-art still and its dark counterpart. */
  theme?: "light" | "dark";
}

/**
 * ProjectCard: a catalog entry for a single project, illustrated by a
 * numbered plate in a framed figure box with its caption. The plate holds
 * a still of the real thing where the project has one, and falls back to
 * an animated line-art mark otherwise.
 */
export function ProjectCard({
  index,
  slug,
  title,
  summary,
  tags = [],
  github,
  live,
  status,
  figure,
  still,
  stillDark,
  stillAlt,
  stillTone,
  figNo,
  figCaption,
  annotation,
  layout = "stack",
  theme = "light",
}: ProjectCardProps) {
  const [hover, setHover] = React.useState(false);
  const wide = layout === "wide";

  return (
    <article
      className={wide ? "flagship-grid" : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: wide ? "minmax(0, 1.35fr) minmax(0, 1fr)" : "1fr",
        gap: wide ? "var(--space-7)" : "var(--space-5)",
        alignItems: wide ? "center" : "stretch",
        padding: "var(--space-6)",
        overflow: "hidden",
        background: "var(--surface-raised)",
        border: "var(--border-hair)",
        borderRadius: "var(--radius-md)",
        boxShadow: hover ? "var(--shadow-paper)" : "var(--shadow-sm)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition:
          "var(--t-colors), var(--t-transform), box-shadow var(--dur-base) var(--ease-out)",
        height: "100%",
      }}
    >
      <CornerMarks opacity={hover ? 0.5 : 0.28} />

      {/* The figure plate. In stack layout it leads; in wide it trails
          (visually right), and on mobile the grid reorders it first. */}
      {(still || figure) && !wide && (
        <FigurePlate
          figure={figure}
          still={theme === "dark" && stillDark ? stillDark : still}
          stillAlt={stillAlt}
          stillTone={stillTone}
          figNo={figNo}
          figCaption={figCaption}
          hover={hover}
          size={168}
        />
      )}

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "var(--space-3)",
          }}
        >
          <span className="mono-label">No. {index}</span>
          {status && <StatusBadge>{status}</StatusBadge>}
        </div>

        <h3
          style={{
            fontSize: wide ? "var(--text-3xl)" : "var(--text-2xl)",
            fontWeight: "var(--weight-medium)",
          }}
        >
          <a
            href={`#/projects/${slug}`}
            style={{
              color: "var(--text-strong)",
              textDecoration: hover ? "underline" : "none",
              textDecorationThickness: 1,
              textUnderlineOffset: "0.18em",
              textDecorationColor: "var(--line-hair)",
            }}
          >
            {title}
          </a>
        </h3>

        <p
          style={{
            color: "var(--text-body)",
            fontSize: "var(--text-base)",
            lineHeight: "var(--leading-normal)",
            margin: 0,
            flex: 1,
            maxWidth: "var(--measure)",
          }}
        >
          {summary}
        </p>

        {annotation && (
          <Annotation>{annotation}</Annotation>
        )}

        {tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-2)",
            }}
          >
            {tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "var(--space-5)",
            marginTop: "var(--space-1)",
            paddingTop: "var(--space-4)",
            borderTop: "var(--border-hair)",
          }}
        >
          <LinkArrow href={`#/projects/${slug}`} direction="right">
            {slug === "doodle-classifier" ? "Try it live" : "Dossier"}
          </LinkArrow>
          {github && (
            <LinkArrow
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              direction="up-right"
            >
              Code
            </LinkArrow>
          )}
          {live && (
            <LinkArrow
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              direction="up-right"
            >
              Live
            </LinkArrow>
          )}
        </div>
      </div>

      {(still || figure) && wide && (
        <FigurePlate
          className="flagship-plate"
          figure={figure}
          still={theme === "dark" && stillDark ? stillDark : still}
          stillAlt={stillAlt}
          stillTone={stillTone}
          figNo={figNo}
          figCaption={figCaption}
          hover={hover}
          size={230}
        />
      )}
    </article>
  );
}

/** The framed figure box: still or mark, corner registration, caption. */
function FigurePlate({
  figure,
  still,
  stillAlt,
  stillTone = "photo",
  figNo,
  figCaption,
  hover,
  size,
  className,
}: {
  figure?: NonNullable<Project["figure"]>;
  still?: string;
  stillAlt?: string;
  stillTone?: "photo" | "line";
  figNo?: string;
  figCaption?: string;
  hover: boolean;
  size: number;
  className?: string;
}) {
  const Mark = figure ? MARKS[figure] : null;
  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        padding: "var(--space-4)",
        background: "var(--surface-page)",
        border: "var(--border-hair)",
        borderRadius: "var(--radius-sm)",
        transition: "var(--t-colors)",
      }}
    >
      <CornerMarks
        opacity={hover ? 0.7 : 0.3}
        color={hover ? "var(--annotation)" : "var(--line-strong)"}
      />
      {still ? (
        <StillImage
          src={still}
          alt={stillAlt}
          tone={stillTone}
          hover={hover}
        />
      ) : (
        Mark && <Mark size={size} />
      )}
      {(figNo || figCaption) && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--label-sm)",
            letterSpacing: "var(--tracking-mono)",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          {figNo}
          {figNo && figCaption ? ", " : ""}
          {figCaption}
        </span>
      )}
    </div>
  );
}

/**
 * A still of the real project. Simulator footage is desaturated until
 * hover, the treatment the dossier gives its clips, so it sits inside the
 * monochrome page. Line art is already ink on paper and is left alone.
 */
function StillImage({
  src,
  alt,
  tone,
  hover,
}: {
  src: string;
  alt?: string;
  tone: "photo" | "line";
  hover: boolean;
}) {
  const photo = tone === "photo";
  return (
    <img
      src={`${import.meta.env.BASE_URL}${src}`}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        borderRadius: photo ? "var(--radius-sm)" : undefined,
        border: photo ? "var(--border-hair)" : undefined,
        filter: photo && !hover ? "grayscale(0.75) contrast(1.03)" : "none",
        transition: "filter var(--dur-base) var(--ease-out)",
      }}
    />
  );
}

/** A living status: red pulse dot + red-ink label. */
function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--label-sm)",
        letterSpacing: "var(--tracking-label)",
        textTransform: "uppercase",
        color: "var(--annotation)",
        border: "1px solid var(--annotation-soft)",
        borderRadius: "var(--radius-sm)",
        padding: "2px var(--space-2)",
        background: "var(--annotation-faint)",
        whiteSpace: "nowrap",
      }}
    >
      <span className="pulse-dot" />
      {children}
    </span>
  );
}

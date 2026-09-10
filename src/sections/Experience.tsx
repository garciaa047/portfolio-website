import { SectionHeader } from "../components/SectionHeader";
import { Button } from "../components/Button";
import { Reveal, fxDelay } from "../components/Reveal";
import { experience } from "../data";

/**
 * Experience: a timeline hung on a vertical hairline. Each entry gets a
 * node that stamps in on scroll, red for the current post, a mono date
 * column, and the role and detail in serif.
 */
export function Experience() {
  return (
    <section
      id="experience"
      style={{
        maxWidth: "var(--container)",
        margin: "0 auto",
        padding: "var(--space-9) var(--gutter)",
      }}
    >
      <SectionHeader
        index="02"
        eyebrow="Curriculum vitae"
        title="Experience"
        lede="The full résumé, in one page."
      />

      <Reveal style={{ position: "relative" }}>
        {/* The timeline spine. */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 5,
            top: "var(--space-4)",
            bottom: "var(--space-4)",
            width: 1,
            background: "var(--line-hair)",
          }}
        />

        {experience.map((item, i) => (
          <div
            key={i}
            className="cv-row"
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "minmax(0, 0.5fr) minmax(0, 2fr)",
              gap: "var(--space-6)",
              padding: "var(--space-6) 0 var(--space-6) var(--space-6)",
              borderTop: i > 0 ? "var(--border-hair)" : undefined,
            }}
          >
            {/* Node on the spine. */}
            <span
              className="fx-node"
              aria-hidden="true"
              style={{
                ...fxDelay(i * 160),
                position: "absolute",
                left: 0,
                top: "calc(var(--space-6) + 0.45em)",
                width: 11,
                height: 11,
                borderRadius: 999,
                background: "var(--surface-page)",
                border: item.current
                  ? "2px solid var(--annotation)"
                  : "2px solid var(--text-muted)",
              }}
            />

            <div
              className="fx-up"
              style={{
                ...fxDelay(i * 160 + 60),
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <span className="mono-label">{item.period}</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--label-sm)",
                  letterSpacing: "var(--tracking-mono)",
                  color: "var(--text-muted)",
                }}
              >
                {item.org}
              </span>
            </div>
            <div
              className="fx-up"
              style={{
                ...fxDelay(i * 160 + 120),
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  flexWrap: "wrap",
                }}
              >
                <h3
                  style={{
                    fontSize: "var(--text-xl)",
                    fontWeight: "var(--weight-medium)",
                  }}
                >
                  {item.role}
                </h3>
                {item.current && (
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
                      borderRadius: "var(--radius-pill)",
                      padding: "2px var(--space-3)",
                      background: "var(--annotation-faint)",
                    }}
                  >
                    <span className="pulse-dot" />
                    Current
                  </span>
                )}
              </div>
              <p
                style={{
                  color: "var(--text-soft)",
                  lineHeight: "var(--leading-normal)",
                  maxWidth: "var(--measure)",
                }}
              >
                {item.detail}
              </p>
            </div>
          </div>
        ))}

        <div
          style={{
            borderTop: "var(--border-hair)",
            paddingTop: "var(--space-6)",
            marginTop: "var(--space-2)",
            marginLeft: "var(--space-6)",
          }}
        >
          <Button
            variant="secondary"
            onClick={() => window.open(`${import.meta.env.BASE_URL}resume.pdf`, "_blank", "noopener")}
          >
            Download résumé
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

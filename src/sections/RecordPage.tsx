import React from "react";
import { SectionHeader } from "../components/SectionHeader";
import { SubPageHeader } from "../components/SubPageHeader";
import { Tag } from "../components/Tag";
import { CornerMarks } from "../components/Decor";
import { Reveal, fxDelay } from "../components/Reveal";
import { achievements, skills, profile } from "../data";

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"];

/**
 * RecordPage: the particulars, off the main page. A catalog card, a
 * roman-numbered list of highlights, and the toolkit shelved by call
 * number. Reached from the nav, not from the reading flow.
 */
export function RecordPage({
  theme,
  onToggleTheme,
}: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <SubPageHeader
        backHref="#top"
        backLabel="Back to portfolio"
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "var(--space-9) var(--gutter) var(--space-10)",
        }}
      >
        <SectionHeader
          index="03"
          eyebrow="On the record"
          title="Achievements & skills"
        />

        <Reveal
          className="about-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
            gap: "var(--space-8)",
            alignItems: "start",
          }}
        >
          <div>
            {/* Achievements: a numbered list, set like a paper's findings. */}
            <span className="mono-label fx-up">Achievements</span>
            <ol
              style={{
                listStyle: "none",
                margin: "var(--space-4) 0 var(--space-8)",
                padding: 0,
              }}
            >
              {achievements.map((a, i) => (
                <li
                  key={i}
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "2.5rem 1fr",
                    gap: "var(--space-4)",
                    alignItems: "baseline",
                    padding: "var(--space-4) 0",
                  }}
                >
                  <span
                    className="fx-rule"
                    aria-hidden="true"
                    style={{
                      ...fxDelay(i * 120),
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 1,
                      background: "var(--line-hair)",
                    }}
                  />
                  <span
                    className="fx-up"
                    style={{
                      ...fxDelay(i * 120 + 60),
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--label-base)",
                      letterSpacing: "var(--tracking-mono)",
                      color: "var(--annotation)",
                    }}
                  >
                    {ROMAN[i]}.
                  </span>
                  <span
                    className="fx-up"
                    style={{
                      ...fxDelay(i * 120 + 100),
                      fontSize: "var(--text-lg)",
                      color: "var(--text-body)",
                      lineHeight: "var(--leading-snug)",
                    }}
                  >
                    {a}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="fx-up" style={fxDelay(200)}>
            <CatalogCard />
          </div>
        </Reveal>

        {/* Skills, shelved by call number. */}
        <Reveal style={{ marginTop: "var(--space-8)" }}>
          <span className="mono-label fx-up">Skills</span>
          <div style={{ marginTop: "var(--space-4)" }}>
            {skills.map((category, i) => (
              <div
                key={category.title}
                className="skills-row"
                style={{
                  position: "relative",
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 0.5fr) minmax(0, 2fr)",
                  gap: "var(--space-6)",
                  padding: "var(--space-5) 0",
                  alignItems: "baseline",
                }}
              >
                <span
                  className="fx-rule"
                  aria-hidden="true"
                  style={{
                    ...fxDelay(i * 120),
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 1,
                    background: "var(--line-hair)",
                  }}
                />
                <div
                  className="fx-up"
                  style={{
                    ...fxDelay(i * 120 + 60),
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-1)",
                  }}
                >
                  <span className="mono-label">{category.title}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--label-sm)",
                      letterSpacing: "var(--tracking-mono)",
                      color: "var(--text-faint)",
                    }}
                  >
                    {category.callNo}
                  </span>
                </div>
                <div
                  className="fx-up"
                  style={{
                    ...fxDelay(i * 120 + 100),
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--space-2)",
                  }}
                >
                  {category.skills.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </main>
    </div>
  );
}

/** A library catalog card with the author's particulars. */
function CatalogCard() {
  const rows: Array<[string, React.ReactNode]> = [
    ["Field", "Reinforcement learning · ML · Systems"],
    ["Institution", profile.university],
    ["Standing", `${profile.standing} · GPA ${profile.gpa}`],
    ["Located", profile.location],
  ];

  return (
    <aside
      className="ledger-lines"
      style={{
        position: "relative",
        background: "var(--surface-raised)",
        border: "var(--border-hair)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-paper)",
        overflow: "hidden",
      }}
    >
      <CornerMarks opacity={0.32} />

      {/* The card's spine label. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-3) var(--space-5)",
          borderBottom: "var(--border-hair)",
        }}
      >
        <span className="mono-label" style={{ fontSize: "var(--label-sm)" }}>
          Catalog card
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--label-sm)",
            letterSpacing: "var(--tracking-mono)",
            color: "var(--annotation)",
          }}
        >
          Q 325.6
        </span>
      </div>

      <div style={{ position: "relative", padding: "var(--space-5)" }}>
        {/* Author line, surname first, the way a card catalog files it. */}
        <div
          style={{
            paddingBottom: "var(--space-4)",
            borderBottom: "var(--border-hair)",
            marginBottom: "var(--space-4)",
          }}
        >
          <h3
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: "var(--weight-medium)",
              color: "var(--text-strong)",
            }}
          >
            Garcia, Anthony
          </h3>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              color: "var(--text-soft)",
              marginTop: "var(--space-1)",
            }}
          >
            {profile.role}
          </p>
        </div>

        <dl style={{ margin: 0, display: "grid", gap: "var(--space-3)" }}>
          {rows.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "108px 1fr",
                gap: "var(--space-3)",
                alignItems: "baseline",
              }}
            >
              <dt
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--label-sm)",
                  letterSpacing: "var(--tracking-label)",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </dt>
              <dd
                style={{
                  margin: 0,
                  fontFamily: "var(--font-serif)",
                  fontSize: "var(--text-base)",
                  color: "var(--text-body)",
                  lineHeight: "var(--leading-snug)",
                }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}

import { Globe } from "../components/Globe";
import { LinkArrow } from "../components/LinkArrow";
import { EmailLink } from "../components/EmailLink";
import { Reveal, fxDelay } from "../components/Reveal";
import { Asterism } from "../components/Apparatus";
import { profile } from "../data";

/**
 * Footer: the back matter. An asterism, the globe mark again with the
 * contact links, and a colophon line.
 */
export function Footer() {
  return (
    <footer
      style={{
        borderTop: "var(--border-hair)",
        background: "var(--surface-page)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "var(--space-8) var(--gutter) var(--space-9)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-7)",
        }}
      >
        <Reveal
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-7)",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <span className="fx-fade">
            <Asterism />
          </span>

          <div className="fx-up" style={fxDelay(100)}>
            <Globe size={120} detail="outline" whirl={false} speed={0.5} />
          </div>

          <div
            className="fx-up"
            style={{
              ...fxDelay(200),
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
              alignItems: "center",
            }}
          >
            <span className="mono-label">Correspondence</span>
            <h2
              style={{
                fontSize: "var(--text-2xl)",
                fontWeight: "var(--weight-medium)",
              }}
            >
              Let's talk about agents, environments, and everything between.
            </h2>
            <EmailLink direction="up-right" />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--label-sm)",
                color: "var(--text-faint)",
              }}
            >
              (read it as written, the brackets keep crawlers out)
            </span>
          </div>

          <div
            className="fx-up"
            style={{
              ...fxDelay(300),
              display: "flex",
              gap: "var(--space-5)",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {profile.links.map((l) => (
              <LinkArrow key={l.label} href={l.href}>
                {l.label}
              </LinkArrow>
            ))}
          </div>

          {/* Colophon. */}
          <div
            className="fx-up"
            style={{
              ...fxDelay(380),
              width: "100%",
              borderTop: "var(--border-hair)",
              paddingTop: "var(--space-5)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--space-3)",
            }}
          >
            <span className="mono-label">
              © {new Date().getFullYear()} {profile.name}
            </span>
            <span
              className="mono-label"
              style={{ fontSize: "var(--label-sm)", textAlign: "center" }}
            >
              Set in EB Garamond and Space Mono · Annotated in red ink
            </span>
            <span className="mono-label">{profile.location}</span>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}

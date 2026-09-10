import { Globe } from "./Globe";

/**
 * SubPageHeader: the sticky bar the standalone pages (dossiers,
 * studies, the record) share: the globe mark and a back link on the
 * left, the theme toggle on the right.
 */
export function SubPageHeader({
  backHref,
  backLabel,
  theme,
  onToggleTheme,
}: {
  backHref: string;
  backLabel: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "var(--border-hair)",
        background: "color-mix(in srgb, var(--surface-page) 85%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "var(--space-3) var(--gutter)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href={backHref}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <Globe size={28} graticule={false} whirl={false} detail="outline" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--label-sm)",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            ← {backLabel}
          </span>
        </a>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: "var(--radius-sm)",
            border: "var(--border-hair)",
            background: "transparent",
            color: "var(--text-soft)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-base)",
            lineHeight: 1,
          }}
        >
          {theme === "light" ? "☾" : "☀"}
        </button>
      </div>
    </header>
  );
}

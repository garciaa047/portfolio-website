import React from "react";
import { Globe } from "./Globe";

export interface NavItem {
  label: string;
  href: string;
}

export interface NavBarProps {
  brand?: string;
  items?: NavItem[];
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

/**
 * NavBar: fixed top bar. The globe mark and mono wordmark on the left,
 * tracked mono nav links and a theme toggle on the right. A red
 * reading-progress rule fills along its bottom edge as you move through
 * the page, and the section currently under the reading line gets a red
 * tick beneath its nav link.
 */
export function NavBar({
  brand = "Anthony Rizzo",
  items = [],
  theme,
  onToggleTheme,
}: NavBarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [active, setActive] = React.useState<string | null>(null);

  // Section ids watched for the reading rule. In-page anchors only.
  const sectionIds = React.useMemo(
    () =>
      items
        .map((i) => i.href)
        .filter((h) => h.startsWith("#") && !h.startsWith("#/"))
        .map((h) => h.slice(1)),
    [items],
  );

  React.useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      setScrolled(window.scrollY > 8);

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);

      const line = window.scrollY + window.innerHeight * 0.38;
      let current: string | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sectionIds]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderBottom: scrolled
          ? "var(--border-hair)"
          : "1px solid transparent",
        background: scrolled
          ? "color-mix(in srgb, var(--surface-page) 82%, transparent)"
          : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
        transition: "var(--t-colors)",
      }}
    >
      {/* The reading rule: red ink filling as the page is read. */}
      <span
        className="progress-rule"
        aria-hidden="true"
        style={{ transform: `scaleX(${progress})` }}
      />

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
          href="#top"
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
              fontSize: "var(--label-base)",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              color: "var(--text-strong)",
            }}
          >
            {brand}
          </span>
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-5)",
          }}
        >
          <ul
            className="nav-links"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-5)",
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {items.map((item) => (
              <li key={item.href}>
                <NavLink
                  {...item}
                  active={item.href === `#${active}`}
                />
              </li>
            ))}
          </ul>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  label,
  href,
  active,
}: NavItem & { active?: boolean }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      href={href}
      className={`nav-link${active ? " is-active" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--label-sm)",
        letterSpacing: "var(--tracking-label)",
        textTransform: "uppercase",
        color: hover ? "var(--text-strong)" : "var(--text-muted)",
        transition: "var(--t-colors)",
      }}
    >
      {label}
      <span className="nav-tick" aria-hidden="true" />
    </a>
  );
}

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: "light" | "dark";
  onToggle: () => void;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: "var(--radius-sm)",
        border: "var(--border-hair)",
        background: hover ? "var(--field-shade)" : "transparent",
        color: "var(--text-soft)",
        cursor: "pointer",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-base)",
        lineHeight: 1,
        transition: "var(--t-colors)",
      }}
    >
      {/* Glyphs, not emoji: sun/moon as typographic marks. */}
      {theme === "light" ? "☾" : "☀"}
    </button>
  );
}

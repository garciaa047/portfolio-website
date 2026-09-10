import React from "react";

export type Theme = "light" | "dark";

/**
 * Theme hook. Reads the initial theme set by the inline script in
 * index.html (so there's no flash), then keeps `data-theme` on the
 * document root and localStorage in sync.
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = React.useState<Theme>(() => {
    const current = document.documentElement.getAttribute("data-theme");
    return current === "dark" ? "dark" : "light";
  });

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore storage failures */
    }
  }, [theme]);

  const toggle = React.useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    [],
  );

  return [theme, toggle];
}

import React from "react";
import { NavBar } from "./components/NavBar";
import { Hero } from "./sections/Hero";
import { Projects } from "./sections/Projects";
import { Experience } from "./sections/Experience";
import { Footer } from "./sections/Footer";
import { RecordPage } from "./sections/RecordPage";
import { ProjectPage } from "./sections/ProjectPage";
import { useTheme } from "./useTheme";
import { nav, profile } from "./data";
import "./app.css";

/* The marks gallery is a local working page, a catalogue of every animated
   plate used for picking figures. `src/sections/MarksPage.tsx` is kept out of
   the repo (.git/info/exclude), so it does not exist in a fresh clone.
   `import.meta.glob` resolves against whatever is on disk at build time: the
   module when the file is there, an empty map when it is not. A plain import
   would fail the build instead. When it is absent the nav entry is dropped
   and `#/marks` goes back to the home page. */
const marksModule = Object.values(
  import.meta.glob<{
    MarksPage: React.ComponentType<{
      theme: "light" | "dark";
      onToggleTheme: () => void;
    }>;
  }>("./sections/MarksPage.tsx"),
)[0];

const MarksPage = marksModule
  ? React.lazy(() =>
      marksModule().then((m) => ({ default: m.MarksPage })),
    )
  : null;

type Route =
  | { name: "home" }
  | { name: "marks" }
  | { name: "record" }
  | { name: "project"; slug: string };

function getRoute(): Route {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash.startsWith("/marks"))
    return MarksPage ? { name: "marks" } : { name: "home" };
  if (hash.startsWith("/record")) return { name: "record" };
  const project = hash.match(/^\/projects\/([\w-]+)/);
  if (project) return { name: "project", slug: project[1] };
  return { name: "home" };
}

function useRoute() {
  const [route, setRoute] = React.useState<Route>(getRoute);
  React.useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

/** "Studies" points at the local-only gallery; hide it when it's absent. */
const navItems = MarksPage ? nav : nav.filter((i) => i.href !== "#/marks");

export function App() {
  const [theme, toggleTheme] = useTheme();
  const route = useRoute();

  // Landing on home via an in-page anchor, like "#projects" from a
  // dossier's back link. The section does not exist yet when the browser
  // tries to scroll to it, so finish the jump after render.
  React.useEffect(() => {
    if (route.name !== "home") return;
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    document.getElementById(id)?.scrollIntoView();
  }, [route.name]);

  // Gallery absent, as in a fresh clone. Send the stale link home rather
  // than leaving #/marks in the address bar over the front page. Keyed on
  // the route, because arriving by hash change does not remount.
  React.useEffect(() => {
    if (MarksPage) return;
    if (window.location.hash.replace(/^#/, "").startsWith("/marks")) {
      window.location.replace(`${window.location.pathname}#top`);
    }
  }, [route]);

  if (route.name === "marks" && MarksPage) {
    return (
      <React.Suspense fallback={null}>
        <MarksPage theme={theme} onToggleTheme={toggleTheme} />
      </React.Suspense>
    );
  }

  if (route.name === "record") {
    return <RecordPage theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (route.name === "project") {
    return (
      <ProjectPage
        slug={route.slug}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <NavBar
        brand={profile.name}
        items={navItems}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main>
        <Hero />
        <Projects theme={theme} />
        <Experience />
      </main>
      <Footer />
    </div>
  );
}

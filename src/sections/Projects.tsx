import { SectionHeader } from "../components/SectionHeader";
import { ProjectCard } from "../components/ProjectCard";
import { Reveal, fxDelay } from "../components/Reveal";
import { projects } from "../data";

/**
 * Projects: the work as catalog entries. Each runs full width with its
 * still beside the abstract, revealing on scroll with a small stagger.
 */
export function Projects({ theme }: { theme: "light" | "dark" }) {
  return (
    <section
      id="projects"
      style={{
        maxWidth: "var(--container)",
        margin: "0 auto",
        padding: "var(--space-9) var(--gutter)",
      }}
    >
      <SectionHeader
        index="01"
        eyebrow="Selected work"
        title="Projects"
        lede="Personal projects, built to push past what I already knew how to do."
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)",
        }}
      >
        {projects.map((p, i) => (
          <Reveal key={p.index}>
            <div className="fx-up" style={fxDelay(i * 140)}>
              <ProjectCard {...p} layout="wide" theme={theme} />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

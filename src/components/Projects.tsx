import { Folder, ExternalLink, Github, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { projects, personalInfo, type Project } from "@/data/portfolio";
import { AnimateOnScroll, StaggerContainer, StaggerItem } from "./AnimateOnScroll";

function LiveLink({ url }: { url: string }) {
  const isInternal = url.startsWith("/");
  if (isInternal) {
    return (
      <Link
        to={url}
        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors"
      >
        <Play size={12} />
        Try it live
      </Link>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-primary transition-colors"
      aria-label="Live demo"
    >
      <ExternalLink size={20} />
    </a>
  );
}

function StatusBadge({ status }: { status?: Project["status"] }) {
  if (status !== "in-progress") return null;
  return (
    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs font-mono rounded">
      In Progress
    </span>
  );
}

const Projects = () => {
  const featured = projects.find((p) => p.featured);
  const others = projects.filter((p) => p !== featured);

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll>
          <div className="flex items-center gap-3 mb-12">
            <Folder className="text-primary" size={24} />
            <h2 className="text-2xl md:text-3xl font-bold">Projects</h2>
          </div>
        </AnimateOnScroll>

        {/* Featured project — large hero card */}
        {featured && (
          <AnimateOnScroll variant="scale" delay={0.1}>
            <motion.div
              className="group bg-card border border-border rounded-xl p-8 mb-6 hover:border-primary/30 transition-all"
              whileHover={{ y: -4, boxShadow: "var(--glow)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-mono rounded">
                  Featured
                </span>
                <StatusBadge status={featured.status} />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold group-hover:text-primary transition-colors mb-3">
                {featured.title}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-3xl">
                {featured.description}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2 flex-1">
                  {featured.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 text-xs font-mono text-muted-foreground bg-secondary rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  {featured.github && (
                    <a
                      href={featured.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="GitHub"
                    >
                      <Github size={20} />
                    </a>
                  )}
                  {featured.live && <LiveLink url={featured.live} />}
                </div>
              </div>
            </motion.div>
          </AnimateOnScroll>
        )}

        {/* Other projects grid */}
        {others.length > 0 && (
          <StaggerContainer
            className="grid md:grid-cols-2 gap-6"
            staggerDelay={0.1}
          >
            {others.map((project) => (
              <StaggerItem key={project.title}>
                <motion.div
                  className="group h-full bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all"
                  whileHover={{ y: -4, boxShadow: "var(--glow)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {project.featured && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-mono rounded">
                            Featured
                          </span>
                        )}
                        <StatusBadge status={project.status} />
                      </div>
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-3">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 text-xs font-mono text-muted-foreground bg-secondary rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label="GitHub"
                        >
                          <Github size={20} />
                        </a>
                      )}
                      {project.live && <LiveLink url={project.live} />}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        <AnimateOnScroll delay={0.3}>
          <div className="mt-8 text-center">
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <span>View all projects on GitHub</span>
              <span className="font-mono">&rarr;</span>
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default Projects;

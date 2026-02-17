import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { experiences } from "@/data/portfolio";
import { AnimateOnScroll } from "./AnimateOnScroll";

const Experience = () => {
  return (
    <section id="experience" className="py-24 px-6 bg-card/30">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll>
          <div className="flex items-center gap-3 mb-12">
            <Briefcase className="text-primary" size={24} />
            <h2 className="text-2xl md:text-3xl font-bold">Experience</h2>
          </div>
        </AnimateOnScroll>

        <div className="relative">
          {/* Animated timeline line */}
          <motion.div
            className="absolute left-0 md:left-4 top-0 bottom-0 w-px bg-border"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "top" }}
          />

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <AnimateOnScroll
                key={index}
                variant="slideLeft"
                delay={index * 0.15}
              >
                <div className="relative pl-8 md:pl-12">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 md:left-4 top-6 w-2.5 h-2.5 rounded-full -translate-x-1/2 ${
                      exp.current
                        ? "bg-primary glow ring-4 ring-primary/20"
                        : "bg-muted-foreground"
                    }`}
                  />

                  <motion.div
                    className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{exp.title}</h3>
                        {exp.current && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-mono rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-sm text-muted-foreground">
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-primary font-medium mb-3">
                      {exp.company}
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      {exp.description}
                    </p>
                    {exp.technologies && (
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 text-xs font-mono text-muted-foreground bg-secondary rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;

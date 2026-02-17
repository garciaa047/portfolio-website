import { Code2, Layers, Brain, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { skillCategories } from "@/data/portfolio";
import { AnimateOnScroll, StaggerContainer, StaggerItem } from "./AnimateOnScroll";

const iconMap: Record<string, typeof Code2> = {
  Code2,
  Layers,
  Brain,
  GraduationCap,
};

const spanClasses: Record<string, string> = {
  wide: "md:col-span-2",
  tall: "md:row-span-2",
  large: "md:col-span-2 md:row-span-1",
};

const Skills = () => {
  return (
    <section id="skills" className="py-24 px-6 bg-card/30">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll>
          <div className="flex items-center gap-3 mb-12">
            <Code2 className="text-primary" size={24} />
            <h2 className="text-2xl md:text-3xl font-bold">
              Skills & Technologies
            </h2>
          </div>
        </AnimateOnScroll>

        <StaggerContainer
          className="grid md:grid-cols-3 gap-4"
          staggerDelay={0.1}
        >
          {skillCategories.map((category) => {
            const Icon = iconMap[category.icon] || Code2;
            return (
              <StaggerItem
                key={category.title}
                className={category.span ? spanClasses[category.span] : ""}
              >
                <motion.div
                  className="h-full bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all group"
                  whileHover={{ scale: 1.02, boxShadow: "var(--glow)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon
                      size={16}
                      className="text-primary opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                    <h3 className="font-mono text-primary text-sm tracking-wider">
                      {`// ${category.title}`}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default Skills;

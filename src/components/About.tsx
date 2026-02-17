import { Terminal } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { personalInfo } from "@/data/portfolio";
import { AnimateOnScroll } from "./AnimateOnScroll";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref}>
      {isInView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {value}{suffix}
        </motion.span>
      ) : (
        "0"
      )}
    </span>
  );
}

const About = () => {
  const stats = [
    { label: "Year", value: personalInfo.year },
    { label: "GPA", value: personalInfo.gpa },
    { label: "Projects", value: 2, suffix: "+" },
  ];

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll>
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="text-primary" size={24} />
            <h2 className="text-2xl md:text-3xl font-bold">About Me</h2>
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <AnimateOnScroll variant="slideLeft" delay={0.1}>
            <div className="space-y-4">
              {personalInfo.aboutParagraphs.map((paragraph, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
              <div className="pt-4">
                <a
                  href={`${import.meta.env.BASE_URL}${personalInfo.resumePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity font-medium"
                >
                  <span>Download Resume</span>
                  <span className="font-mono">&rarr;</span>
                </a>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="slideRight" delay={0.2}>
            <div className="bg-card border border-border rounded-xl p-6 font-mono text-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="space-y-1.5 text-muted-foreground">
                <p>
                  <span className="text-primary">const</span> developer ={" "}
                  {"{"}
                </p>
                <p className="pl-4">
                  name:{" "}
                  <span className="text-green-400">
                    "{personalInfo.name}"
                  </span>
                  ,
                </p>
                <p className="pl-4">
                  role:{" "}
                  <span className="text-green-400">"CS Student"</span>,
                </p>
                <p className="pl-4">
                  university:{" "}
                  <span className="text-green-400">
                    "{personalInfo.university}"
                  </span>
                  ,
                </p>
                <p className="pl-4">
                  year: <span className="text-yellow-400">{personalInfo.year}</span>,
                </p>
                <p className="pl-4">
                  gpa: <span className="text-yellow-400">{personalInfo.gpa}</span>,
                </p>
                <p className="pl-4">interests: [</p>
                {personalInfo.interests.map((interest, i) => (
                  <p key={i} className="pl-8">
                    <span className="text-green-400">"{interest}"</span>
                    {i < personalInfo.interests.length - 1 ? "," : ""}
                  </p>
                ))}
                <p className="pl-4">]</p>
                <p>
                  {"}"}<span className="animate-blink text-primary">|</span>
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Stats row */}
        <AnimateOnScroll delay={0.3}>
          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary font-mono">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default About;

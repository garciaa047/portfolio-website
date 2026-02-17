import { ArrowDown, Github, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { personalInfo, socialLinks } from "@/data/portfolio";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";
import { useCursorGlow } from "@/hooks/useCursorGlow";

const Hero = () => {
  const typedRole = useTypingAnimation(personalInfo.roles, 80, 50, 2000);
  const { ref, handleMouseMove } = useCursorGlow();

  const iconMap: Record<string, typeof Github> = { Github, Mail };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className="min-h-screen flex items-center justify-center relative px-6 pt-20 overflow-hidden"
    >
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-50" />

      {/* Cursor glow effect */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px circle at var(--glow-x, 50%) var(--glow-y, 50%), hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.06), transparent 40%)",
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="font-mono text-primary text-sm tracking-wider">
            &lt;hello world /&gt;
          </span>
        </motion.div>

        <motion.h1
          className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          I'm{" "}
          <span className="text-gradient">{personalInfo.name}</span>
        </motion.h1>

        <motion.div
          className="mt-6 text-lg md:text-xl text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className="font-mono text-primary">{typedRole}</span>
          <span className="animate-blink text-primary">|</span>
        </motion.div>

        <motion.p
          className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {personalInfo.tagline}
        </motion.p>

        <motion.div
          className="mt-8 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <a
            href="#projects"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all glow"
          >
            View Projects
          </a>
          <a
            href={`${import.meta.env.BASE_URL}${personalInfo.resumePath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
          >
            Download Resume
          </a>
        </motion.div>

        <motion.div
          className="mt-12 flex items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {socialLinks.map((link) => {
            const Icon = iconMap[link.icon];
            return (
              <a
                key={link.platform}
                href={link.url}
                target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={link.platform}
              >
                {Icon && <Icon size={22} />}
              </a>
            );
          })}
        </motion.div>

        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <a
            href="#about"
            className="text-muted-foreground hover:text-primary transition-colors animate-gentle-bounce block"
            aria-label="Scroll to about section"
          >
            <ArrowDown size={24} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

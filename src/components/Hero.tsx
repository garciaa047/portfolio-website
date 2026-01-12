import { ArrowDown, Github, Mail } from 'lucide-react';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative px-6 pt-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <span className="font-mono text-primary text-sm tracking-wider">
            &lt;hello world /&gt;
          </span>
        </div>

        <h1
          className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          I'm{' '}
          <span className="text-gradient">Anthony Garcia</span>
        </h1>

        <p
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up"
          style={{ animationDelay: '0.3s' }}
        >
          Computer Science Student at TMU passionate about building elegant solutions
          to complex problems. Currently exploring{' '}
          <span className="text-foreground">machine learning</span>,{' '}
          <span className="text-foreground">full-stack development</span>, and{' '}
          <span className="text-foreground">systems programming</span>.
        </p>

        <div
          className="mt-8 flex items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: '0.4s' }}
        >
          <a
            href="#projects"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all glow"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
          >
            Contact Me
          </a>
        </div>

        <div
          className="mt-12 flex items-center justify-center gap-6 animate-fade-up"
          style={{ animationDelay: '0.5s' }}
        >
          <a
            href="https://github.com/garciaa047"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Github size={22} />
          </a>
          <a
            href="mailto:AnthonyRosGarcia@gmail.com"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail size={22} />
          </a>
        </div>

        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          <a
            href="#about"
            className="text-muted-foreground hover:text-primary transition-colors animate-bounce block"
          >
            <ArrowDown size={24} />
          </a>
        </div>
      </div>

      {/* Background gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};

export default Hero;

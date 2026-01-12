import { Terminal } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Terminal className="text-primary" size={24} />
          <h2 className="text-2xl md:text-3xl font-bold">About Me</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              I'm a third-year Computer Science student at Toronto Metropolitan University
              with a strong interest in machine learning, full-stack development, and
              systems programming. I enjoy building projects from scratch to deeply
              understand how things work under the hood.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              My recent work includes implementing neural networks from scratch using
              only NumPy and building full-stack database management systems. I'm always
              looking for opportunities to apply my skills to real-world problems and
              continue growing as a developer.
            </p>
            <div className="pt-4">
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity font-medium"
              >
                <span>Download Resume</span>
                <span className="font-mono">→</span>
              </a>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 font-mono text-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="space-y-2 text-muted-foreground">
              <p><span className="text-primary">const</span> developer = {'{'}</p>
              <p className="pl-4">name: <span className="text-green-400">"Anthony Garcia"</span>,</p>
              <p className="pl-4">role: <span className="text-green-400">"CS Student"</span>,</p>
              <p className="pl-4">university: <span className="text-green-400">"Toronto Metropolitan University"</span>,</p>
              <p className="pl-4">year: <span className="text-yellow-400">3</span>,</p>
              <p className="pl-4">gpa: <span className="text-yellow-400">4.2</span>,</p>
              <p className="pl-4">interests: [</p>
              <p className="pl-8"><span className="text-green-400">"Machine Learning"</span>,</p>
              <p className="pl-8"><span className="text-green-400">"Full Stack Dev"</span>,</p>
              <p className="pl-8"><span className="text-green-400">"Systems Programming"</span></p>
              <p className="pl-4">]</p>
              <p>{'}'}<span className="animate-blink">|</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

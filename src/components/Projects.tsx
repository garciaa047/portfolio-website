import { Folder, ExternalLink, Github } from 'lucide-react';

const projects = [
  {
    title: 'Neural Network Doodle Classifier',
    description: 'A feedforward neural network built from scratch using only NumPy, achieving 90%+ test accuracy on doodle recognition. Features real-time prediction via a Tkinter GUI, custom data augmentation pipeline, and implements backpropagation, L2 regularization, and momentum optimization.',
    tech: ['Python', 'NumPy', 'Pandas', 'Pillow', 'Tkinter'],
    github: 'https://github.com/garciaa047/Neural-Network-Doodle-Recognition-System',
    featured: true,
  },
  {
    title: 'Soccer League Database Management System',
    description: 'A full-stack soccer league DBMS with a normalized relational schema (3NF/BCNF), CRUD operations, and a Flask-based web interface. Collaborated with a team to design 10+ database tables with proper entity relationships.',
    tech: ['Oracle SQL', 'Flask', 'Python', 'HTML/CSS'],
    github: 'https://github.com/garciaa047',
    featured: true,
  },
];

const Projects = () => {
  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <Folder className="text-primary" size={24} />
          <h2 className="text-2xl md:text-3xl font-bold">Projects</h2>
        </div>

        <div className="grid gap-6">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className={`group bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all hover:glow ${
                project.featured ? 'md:p-8' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {project.featured && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-mono rounded">
                        Featured
                      </span>
                    )}
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
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

                <div className="flex items-center gap-3">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github size={20} />
                  </a>
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://github.com/garciaa047"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <span>View all projects on GitHub</span>
            <span className="font-mono">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Projects;

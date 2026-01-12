import { Code2 } from 'lucide-react';

const skillCategories = [
  {
    title: 'Languages',
    skills: ['Python', 'Java', 'C', 'C++', 'SQL'],
  },
  {
    title: 'Frameworks & Libraries',
    skills: ['NumPy', 'Pandas', 'Flask', 'Tkinter', 'OpenCV', 'Pillow'],
  },
  {
    title: 'Concepts',
    skills: ['Data Structures & Algorithms', 'OOP', 'Database Normalization', 'Neural Networks'],
  },
  {
    title: 'Coursework',
    skills: ['Data Structures', 'Algorithms', 'Databases', 'Operating Systems', 'Computer Security'],
  },
];

const Skills = () => {
  return (
    <section id="skills" className="py-24 px-6 bg-card/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <Code2 className="text-primary" size={24} />
          <h2 className="text-2xl md:text-3xl font-bold">Skills & Technologies</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {skillCategories.map((category, index) => (
            <div
              key={category.title}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="font-mono text-primary text-sm mb-4 tracking-wider">
                {`// ${category.title}`}
              </h3>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;

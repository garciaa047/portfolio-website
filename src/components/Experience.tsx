import { Briefcase } from 'lucide-react';

const experiences = [
  {
    title: 'Junior Systems Engineer',
    company: 'Bimen Business Consultants',
    period: 'May 2025 - Aug 2025',
    description: 'Developed PowerShell automation scripts for document processing, supported technical infrastructure migrations, performed QA testing for software rollouts, and conducted on-site technical support including server maintenance and network cabling.',
    current: true,
  },
  {
    title: 'Intro to Commercial Web Development',
    company: 'Wireless Freedom',
    period: 'Oct 2022 - Apr 2023',
    description: 'Used Laravel to create locally hosted websites and implemented K-Nearest Neighbours algorithm to predict client purchases based on previous purchase history.',
    current: false,
  },
];

const Experience = () => {
  return (
    <section id="experience" className="py-24 px-6 bg-card/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <Briefcase className="text-primary" size={24} />
          <h2 className="text-2xl md:text-3xl font-bold">Experience</h2>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div key={index} className="relative pl-8 md:pl-12">
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 md:left-4 top-1.5 w-2 h-2 rounded-full -translate-x-1/2 ${
                    exp.current ? 'bg-primary glow' : 'bg-muted-foreground'
                  }`}
                />

                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-lg">{exp.title}</h3>
                    <span className="font-mono text-sm text-muted-foreground">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-primary font-medium mb-3">{exp.company}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;

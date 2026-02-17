import { Mail, MapPin, Github, ArrowUpRight } from "lucide-react";
import { personalInfo } from "@/data/portfolio";
import { AnimateOnScroll } from "./AnimateOnScroll";

const Contact = () => {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Let's work together
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              I'm always open to discussing new opportunities, interesting
              projects, or just having a chat about tech. Feel free to reach
              out!
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.1}>
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {/* Email */}
            <a
              href={`mailto:${personalInfo.email}`}
              className="group flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-primary/30 transition-all text-center"
            >
              <Mail
                size={24}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
              <div>
                <div className="text-sm font-medium mb-1">Email</div>
                <div className="text-xs text-muted-foreground">
                  {personalInfo.email}
                </div>
              </div>
              <ArrowUpRight
                size={14}
                className="text-muted-foreground/50 group-hover:text-primary transition-colors"
              />
            </a>

            {/* GitHub */}
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-primary/30 transition-all text-center"
            >
              <Github
                size={24}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
              <div>
                <div className="text-sm font-medium mb-1">GitHub</div>
                <div className="text-xs text-muted-foreground">
                  garciaa047
                </div>
              </div>
              <ArrowUpRight
                size={14}
                className="text-muted-foreground/50 group-hover:text-primary transition-colors"
              />
            </a>

            {/* Location */}
            <div className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-xl text-center">
              <MapPin size={24} className="text-muted-foreground" />
              <div>
                <div className="text-sm font-medium mb-1">Location</div>
                <div className="text-xs text-muted-foreground">
                  {personalInfo.location}
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default Contact;

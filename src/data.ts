/* All site content lives here. Every fact tracks the resume at
   public/resume.pdf: standing, project results, experience, skills,
   achievements. Update the resume and this file together. */

export const profile = {
  name: "Anthony Garcia",
  role: "Software developer · RL research",
  /* Stands in for an about section: who I am, in two lines. */
  tagline:
    "Computer science student at TMU, currently a software developer at RBC. I work in machine learning, mostly reinforcement learning, and want to do research.",
  university: "Toronto Metropolitan University",
  standing: "B.Sc. expected 2028",
  gpa: "4.19 / 4.33",
  location: "Toronto, ON",
  /* The address lives in lib/email.ts, assembled at runtime so it never
     appears in the markup. */
  github: "https://github.com/garciaa047",
  links: [{ label: "GitHub", href: "https://github.com/garciaa047" }],
};

export const nav = [
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Record", href: "#/record" },
  /* Local-only page, kept out of the repo (see App.tsx). This entry is
     filtered out of the nav wherever the page is absent. */
  { label: "Studies", href: "#/marks" },
];

export interface Project {
  index: string;
  /** URL slug for the project's dossier page, e.g. #/projects/<slug>. */
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  github?: string;
  live?: string;
  featured?: boolean;
  status?: string;
  /** Which animated plate illustrates this entry, if it has no still. */
  figure?: "robot-arm" | "neural-net";
  /** A still of the real thing, shown instead of the animated plate.
      Both were captured off the project's own dossier page. */
  still?: string;
  /** Alt text for the still. */
  stillAlt?: string;
  /** "photo" stills are rendered from a simulator and get the dossier's
      desaturate-until-hover treatment plus a hairline border. "line"
      stills are already in the site's ink-on-paper palette, so they sit
      on the plate unfiltered and unframed. */
  stillTone?: "photo" | "line";
  /** A "line" still is baked at one theme's colours, so it needs a dark
      counterpart; the card shows whichever matches the active theme. */
  stillDark?: string;
  /** Plate number and caption, e.g. "Fig. 2, two-link arm". */
  figNo?: string;
  figCaption?: string;
  /** Margin note in red ink. */
  annotation?: string;
}

export const projects: Project[] = [
  {
    index: "01",
    slug: "pandaplace",
    title: "PandaPlaceRL: robotic pick-and-place",
    summary:
      "A Franka Panda arm in MuJoCo learns pick-and-place from a sparse reward. SAC with hindsight experience replay and a six-stage curriculum. 96 to 100% success on three randomized suites, converging in about 400k steps.",
    tags: [
      "Python",
      "MuJoCo",
      "Gymnasium",
      "Stable-Baselines3",
      "PyTorch",
      "TensorBoard",
      "SAC",
      "HER",
      "Curriculum",
    ],
    github: "https://github.com/garciaa047/PandaPlaceRL",
    featured: true,
    status: "Solved",
    figure: "robot-arm",
    still: "projects/pandaplace-still.webp",
    stillTone: "photo",
    stillAlt:
      "The Panda arm in MuJoCo holding the cube at a goal above the table.",
    figNo: "Fig. 2",
    figCaption: "Trained policy, mid-place",
    annotation: "solved. The clips on its page are the trained policy itself.",
  },
  {
    index: "02",
    slug: "doodle-classifier",
    title: "Doodle classifier, built from scratch",
    summary:
      "A feedforward network in raw NumPy, manual backpropagation included. 96% test accuracy on five-class doodle recognition, 94.5 to 97.7% on every held-out class. No frameworks.",
    tags: ["Python", "NumPy", "Pillow", "Tkinter"],
    github:
      "https://github.com/garciaa047/Neural-Network-Doodle-Recognition-System",
    featured: true,
    figure: "neural-net",
    still: "projects/doodle-still.webp",
    stillDark: "projects/doodle-still-dark.webp",
    stillTone: "line",
    stillAlt:
      "The network classifying a drawn clock at 100%, with the pixels that decided it marked in red.",
    figNo: "Fig. 3",
    figCaption: "Live activations, clock at 100%",
    annotation: "the trained weights run live on its page. Draw, and watch it think.",
  },
];

// Taken from the resume (public/resume.pdf).
export const achievements: string[] = [
  "2nd place overall at the TechPowHer Hackathon, July 2026, out of 22 teams and 178 participants.",
  "Academic Excellence Renewable Scholarship: $3,000 a year for three years, renewed on a 4.15+ GPA.",
  "cGPA 4.19 / 4.33 in the B.Sc. Computer Science at Toronto Metropolitan University.",
  "96 to 100% success on sparse-reward pick-and-place with SAC, HER, and a six-stage curriculum.",
  "96% test accuracy from a neural network built from scratch in NumPy.",
  "Software Developer at RBC on a client-facing mortgage pre-approval platform.",
];

export interface SkillCategory {
  title: string;
  /** Shelf mark, in the style of a library catalog. */
  callNo: string;
  skills: string[];
}

export const skills: SkillCategory[] = [
  {
    title: "Languages",
    callNo: "QA 76.7",
    skills: ["Java", "Python", "TypeScript", "JavaScript", "SQL"],
  },
  {
    title: "Frameworks",
    callNo: "QA 76.76",
    skills: [
      "Spring Boot",
      "Angular",
      "MuJoCo",
      "Gymnasium",
      "Stable-Baselines3",
      "PyTorch",
      "NumPy",
      "Pandas",
      "Pillow",
      "Tkinter",
    ],
  },
  {
    title: "Tools & Concepts",
    callNo: "Q 325.6",
    skills: [
      "Reinforcement Learning",
      "Machine Learning",
      "Imitation Learning (behavior cloning)",
      "Neural Networks",
      "Research",
      "Git",
      "REST APIs",
      "Agile/Scrum",
      "Data Structures & Algorithms",
      "OOP",
    ],
  },
  {
    title: "Coursework",
    callNo: "QA 76",
    skills: [
      "Data Structures",
      "Algorithms",
      "Databases",
      "Operating Systems",
      "Computer Security",
    ],
  },
];

export interface ExperienceItem {
  period: string;
  role: string;
  org: string;
  detail: string;
  current?: boolean;
}

export const experience: ExperienceItem[] = [
  {
    period: "Jan 2027 to Apr 2027",
    role: "Machine Learning Software Engineer",
    org: "RBC Borealis",
    detail:
      "Incoming. Joining the Knowledge AI team behind RBC's firm-wide NLP assistant for internal policy questions.",
  },
  {
    period: "May 2026 to Dec 2026",
    role: "Software Developer",
    org: "Royal Bank of Canada (RBC)",
    detail:
      "Full-stack features on RBC's client-facing mortgage pre-approval platform, used by tens of thousands of clients. Angular and TypeScript on the front end, Java Spring Boot REST services with SQL behind it, plus Python and SQL tooling for the squad.",
    current: true,
  },
  {
    period: "May 2025 to Aug 2025",
    role: "Software Engineer",
    org: "Bimen Business Consultants",
    detail:
      "Helped build a React and Node.js warehouse management tool that lets a client accept, provision, and adjust stock against incoming orders, replacing a slow, error-prone Excel workflow. Also automated the filing of 500+ legal documents a day with PowerShell scripts and error alerts, saving 30 minutes a day.",
  },
  {
    period: "Oct 2022 to Apr 2023",
    role: "Web Developer (Volunteer)",
    org: "Wireless Freedom",
    detail:
      "Built a full-stack site in Laravel and a K-Nearest Neighbours model that predicts a client's next purchase from their history.",
  },
];

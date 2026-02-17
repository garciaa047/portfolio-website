// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkillCategory {
  title: string;
  icon: string;
  skills: string[];
  span?: "wide" | "tall" | "large";
}

export interface Project {
  title: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
  featured?: boolean;
  image?: string;
  status?: "in-progress" | "completed";
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
  technologies?: string[];
  current?: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
}

// ─── Personal Info ────────────────────────────────────────────────────────────

export const personalInfo = {
  name: "Anthony Garcia",
  role: "CS Student & Developer",
  university: "Toronto Metropolitan University",
  year: 3,
  gpa: 4.2,
  email: "AnthonyRosGarcia@gmail.com",
  location: "Toronto, ON",
  github: "https://github.com/garciaa047",
  resumePath: "resume.pdf",
  tagline:
    "Computer Science Student at TMU passionate about building elegant solutions to complex problems.",
  interests: ["Machine Learning", "Full-Stack Dev", "Systems Programming"],
  aboutParagraphs: [
    "I'm a third-year Computer Science student at Toronto Metropolitan University with a strong interest in machine learning, full-stack development, and systems programming. I enjoy building projects from scratch to deeply understand how things work under the hood.",
    "My recent work includes implementing neural networks from scratch using only NumPy and building full-stack database management systems. I'm always looking for opportunities to apply my skills to real-world problems and continue growing as a developer.",
  ],
  roles: ["CS Student", "ML Enthusiast", "Full-Stack Dev"],
};

// ─── Navigation ───────────────────────────────────────────────────────────────

export const navItems: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

// ─── Social Links ─────────────────────────────────────────────────────────────

export const socialLinks: SocialLink[] = [
  {
    platform: "GitHub",
    url: "https://github.com/garciaa047",
    icon: "Github",
  },
  {
    platform: "Email",
    url: "mailto:AnthonyRosGarcia@gmail.com",
    icon: "Mail",
  },
];

// ─── Skills ───────────────────────────────────────────────────────────────────

export const skillCategories: SkillCategory[] = [
  {
    title: "Languages",
    icon: "Code2",
    skills: ["Python", "Java", "C", "C++", "SQL"],
    span: "wide",
  },
  {
    title: "Frameworks & Libraries",
    icon: "Layers",
    skills: ["NumPy", "Pandas", "Flask", "Tkinter", "OpenCV", "Pillow", "MuJoCo", "Gymnasium", "Stable-Baselines3"],
    span: "large",
  },
  {
    title: "Concepts",
    icon: "Brain",
    skills: [
      "Data Structures & Algorithms",
      "OOP",
      "Database Normalization",
      "Neural Networks",
      "Reinforcement Learning",
    ],
  },
  {
    title: "Coursework",
    icon: "GraduationCap",
    skills: [
      "Data Structures",
      "Algorithms",
      "Databases",
      "Operating Systems",
      "Computer Security",
    ],
    span: "wide",
  },
];

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    title: "MARWS — MuJoCo Robotic Arm RL Workspace",
    description:
      "A custom Gymnasium environment built on MuJoCo for training a Franka Emika Panda robotic arm to perform pick-and-place tasks using reinforcement learning. Implements SAC with Hindsight Experience Replay (HER) via Stable-Baselines3 for sample-efficient goal-conditioned learning in continuous action spaces.",
    tech: ["Python", "MuJoCo", "Gymnasium", "Stable-Baselines3", "SAC", "HER"],
    github: "https://github.com/garciaa047/MARWS",
    featured: true,
    status: "in-progress",
  },
  {
    title: "Neural Network Doodle Classifier",
    description:
      "A feedforward neural network built from scratch using only NumPy, achieving 90%+ test accuracy on doodle recognition. Features real-time prediction via a Tkinter GUI, custom data augmentation pipeline, and implements backpropagation, L2 regularization, and momentum optimization.",
    tech: ["Python", "NumPy", "Pandas", "Pillow", "Tkinter"],
    github:
      "https://github.com/garciaa047/Neural-Network-Doodle-Recognition-System",
    live: "/projects/doodle-classifier",
    featured: true,
  },
  {
    title: "Soccer League Database Management System",
    description:
      "A full-stack soccer league DBMS with a normalized relational schema (3NF/BCNF), CRUD operations, and a Flask-based web interface. Collaborated with a team to design 10+ database tables with proper entity relationships.",
    tech: ["Oracle SQL", "Flask", "Python", "HTML/CSS"],
    github: "https://github.com/garciaa047",
    featured: true,
  },
];

// ─── Experience ───────────────────────────────────────────────────────────────

export const experiences: Experience[] = [
  {
    title: "Software Developer",
    company: "RBC",
    period: "May 2026 - Dec 2026",
    description:
      "Software development role at RBC.",
    technologies: [],
    current: true,
  },
  {
    title: "Junior Systems Engineer",
    company: "Bimen Business Consultants",
    period: "May 2025 - Aug 2025",
    description:
      "Developed PowerShell automation scripts for document processing, supported technical infrastructure migrations, performed QA testing for software rollouts, and conducted on-site technical support including server maintenance and network cabling.",
    technologies: ["PowerShell", "Windows Server", "Networking"],
    current: false,
  },
  {
    title: "Intro to Commercial Web Development",
    company: "Wireless Freedom",
    period: "Oct 2022 - Apr 2023",
    description:
      "Used Laravel to create locally hosted websites and implemented K-Nearest Neighbours algorithm to predict client purchases based on previous purchase history.",
    technologies: ["Laravel", "PHP", "Machine Learning"],
    current: false,
  },
];

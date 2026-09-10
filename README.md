# Portfolio

My personal portfolio website. Built with Vite, React, and TypeScript.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
npm run preview  # serve the production build
```

## Structure

```
src/
  App.tsx        hash routing and page composition
  data.ts        all site content: profile, projects, skills, experience
  sections/      Hero, Projects, Experience, Footer, and the
                 ProjectPage / RecordPage sub-pages
  components/    shared pieces (Globe, Button, Tag, ProjectCard) plus the
                 doodle/ and pandaplace/ project demos and marks/ line art
  tokens/        CSS custom properties for colour, type, spacing, motion
  styles.css     global entry that imports every token file
  lib/           doodle network loader, email assembly
public/
  nn/            trained doodle weights and manifest
  pandaplace/    exported rollouts, training curves, MuJoCo clips
  projects/      project card stills
  resume.pdf
```

Text and project details live in `src/data.ts`. It tracks `public/resume.pdf`,
so update both together.

## Deploying

Pushing to `main` or `master` runs `.github/workflows/deploy.yml`, which
typechecks, builds, and publishes to GitHub Pages. Set Settings > Pages >
Source to "GitHub Actions" once, and it is automatic after that.

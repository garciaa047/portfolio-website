# Portfolio Website

A personal portfolio website built to showcase my projects, skills, and experience as a Computer Science student at TMU.

```
https://garciaa047.github.io/portfolio-website/
```

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - UI component library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```sh
# Clone the repository
git clone <your-repo-url>

# Navigate to the project directory
cd website

# Install dependencies
npm install

# Start the development server
npm run dev
```

The site will be available at `http://localhost:8080`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # React components (Hero, About, Skills, Projects, etc.)
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
└── index.css       # Global styles
```

## Deployment

Build the project for production:

```sh
npm run build
```

The output will be in the `dist/` folder, ready to deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

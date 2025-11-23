# AGENT.md

> **Context for AI Agents**: This file provides the necessary context, conventions, and architectural details to work effectively on the Vibe CV project.

## Project Overview
**Vibe CV** is a personal, interactive CV website built with **Astro**, **React**, and **D3.js**.
- **Goal**: Showcase skills and experience in a visually engaging way (interactive graph).
- **Languages**: French (`/fr`) and English (`/en`).
- **Deployment**: GitHub Pages (via GitHub Actions).

## Setup & Commands
- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev` (Runs on `http://localhost:4321`)
- **Build for production**: `npm run build`
- **Preview build**: `npm run preview`

## Architecture & Key Files

### Data Sources (Single Source of Truth)
- **`src/data/cv.json`**: Contains ALL content (experience, projects, skills) for both languages (`fr`, `en`). **Always edit this file to update content.**
- **`src/data/skills-config.json`**: Configuration for the skills graph (categories, colors, mappings).

### Core Components
- **`src/pages/[lang]/skills.astro`**: The interactive skills graph page. Uses **D3.js** for force-directed graph visualization.
  - *Note*: Handles "Present" dates and calculates duration (min 1 month).
- **`src/components/Skills.astro`**: The skills list component. Links to the graph page with query params (e.g., `?skill=ReactJS`).
- **`src/components/Header.astro`**: Main navigation. Handles language switching and "Print" functionality.

### Styling
- **Framework**: Vanilla CSS (scoped in Astro components).
- **Variables**: Defined in `src/layouts/Layout.astro` (e.g., `--color-primary`, `--color-bg`).
- **Design**: "Vibe" aesthetic – dark mode, glassmorphism, neon accents.

## Conventions & Rules

### 1. Path Handling (Critical for GitHub Pages)
- **Always** use `import.meta.env.BASE_URL` for internal links and assets.
- Example:
  ```javascript
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const imagePath = `${base}/profile.jpg`;
  ```
- Production base path: `/vibe-cv/`

### 2. Multi-language Support
- Pages are routed via `src/pages/[lang]/...`.
- Components receive `lang` as a prop.
- Content is retrieved from `cv.json` using the `lang` key.

### 3. Skill Graph Logic
- **Nodes**: Generated from `cv.json` (projects/companies) and `skills-config.json` (skills).
- **Links**: Connect projects to the skills they use.
- **Highlighting**: URL params `?skill=Name` or `?category=Name` trigger auto-highlighting.

### 4. Deployment
- **Trigger**: Pushing a tag starting with `v` (e.g., `v1.0.0`).
- **Workflow**: `.github/workflows/deploy.yml` builds and deploys to `gh-pages`.

## GitFlow & Versioning (CRITICAL)
- **Commit/Push Policy**: **NEVER** commit or push changes without explicit user request. Always ask for confirmation after completing a task.
- **Versioning Strategy**: Use Semantic Versioning (`vX.Y.Z`).
  - **Patch (`v1.0.X`)**: for bug fixes.
  - **Minor (`v1.X.0`)**: for new features.
  - **Major (`vX.0.0`)**: for breaking changes.
- **Release Process**: When the user requests a release/deployment:
  1.  Determine the next version number based on the changes (fix vs feature).
  2.  Create a git tag: `git tag vX.Y.Z`
  3.  Push the tag: `git push origin vX.Y.Z` (This triggers the GitHub Actions deployment).

## Recent Changes (Context)
- **Vibe Coding**: Replaced technical stack for "Vibe CV" project with "Vibe Coding" and "AI-Assisted Dev".
- **Favicon**: Generated a custom "GT." favicon.
- **Duration Fix**: Fixed skill duration calculation to handle "Present" and ensure minimum 1 month.

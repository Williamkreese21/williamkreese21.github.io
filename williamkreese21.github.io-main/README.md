# William Kreese

Personal web platform for William Kreese, a photographer, cinema videographer, editor, and developer.
Live site: https://williamkreese21.github.io/

## Stack
- React 19 and TypeScript
- Vite 6
- Tailwind CSS 4
- React Router `HashRouter` for static GitHub Pages hosting
- HLS.js for the optional background video
- Lucide React for icons

## Local development
Requirements: Node.js 20 or newer and npm.

```bash
npm ci
npm run dev
```
Open http://localhost:3000. The production preview can be run with:

```bash
npm run build
npm run preview
```
## Verification

Run the same checks used by CI:

```bash
npm run quality
```

This runs:
- `tsc --noEmit` for TypeScript
- `htmllint index.html` for HTML validation
- `vite build` for the production artifact

## GitHub Pages deployment
The `Deploy GitHub Pages` workflow builds and deploys on every push to `main`. In the repository settings:

1. Open **Settings > Pages**.
2. Set **Build and deployment > Source** to **GitHub Actions**.
3. Push to `main` and wait for the workflow to finish.

The Vite configuration uses relative assets and the app uses `HashRouter`, so static hosting does not need server rewrites. Routes are available at `/#/`, `/#/about`, `/#/blog`, and `/#/esp`.
## SonarSource checks

The `SonarSource quality` workflow runs on pushes, pull requests, and manual dispatch. To enable the scan:

1. Create a SonarCloud project with key `williamkreese21` and organization `williamkreese21`.
2. Add a repository secret named `SONAR_TOKEN`.
3. Confirm the repository uses the default `main` branch.

The scan configuration is in `sonar-project.properties`. The workflow runs TypeScript, HTML, and production-build checks before SonarSource analysis.
## Routes

- `/` - landing page and system log section
- `/about` - profile and contact
- `/blog` - social links
- `/esp` - EsPiFF board section

## Resilience
The background HLS video is optional. Network, autoplay, or unsupported-format errors are logged and do not block rendering. A render error shows a reload message instead of a blank page, and the startup loader has a six-second fallback so a delayed client-side dependency cannot cover the application indefinitely.

## Project structure

```text
.
├── .github/workflows/       # GitHub Pages and SonarSource workflows
├── src/App.tsx              # App shell, routes, loader, and media handling
├── src/EspBoards.tsx        # EsPiFF page
├── src/index.css            # Global styles and Tailwind theme
├── index.html               # HTML entry point
├── sonar-project.properties # SonarCloud configuration
└── vite.config.ts           # Vite and GitHub Pages asset configuration
```
# William Kreese - Web Platform & Digital Hub

![William Kreese](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

Welcome to the official platform of **William Kreese** — a photographer, cinema videographer, editor, and passionate developer. This repository contains the source code for the interactive web application, designed with a focus on high-end visual aesthetics, smooth animations, and a seamless user experience.

---

## 🌟 Core Architecture & Tech Stack

This application is built focusing on performance, maintainability, and visual flair using modern web technologies:

- **Framework:** React 18 (Functional Components, Hooks)
- **Build Tool:** Vite (Ultra-fast Hot Module Replacement)
- **Styling:** Tailwind CSS (Utility-first, responsive, and custom glassmorphism)
- **Routing:** `react-router-dom` (Client-side routing with HashRouter for static deployment support)
- **Icons:** `lucide-react` (Clean, consistent SVG icons)
- **Animations:** Custom CSS transitions, Tailwind `animate-in`, and state-driven interactive effects (e.g., Hacker text effect).

---

## 📰 Page-by-Page Details & News

To provide a comprehensive overview of the application's structure, here is the detailed breakdown and latest updates ("news") for each of the core pages within the routing ecosystem:

### 1. Home Page (`/`)
- **Focus:** The landing experience. Designed to immediately grab attention with a modern, high-contrast visual hierarchy.
- **Key Features:** 
  - Dynamic "Hacker" text animation section that reveals text sequentially.
  - Quick, responsive layout.
- **Latest News/Updates:** The "Get Started" CTA button was recently removed to streamline the user experience, directing focus immediately to the content and navigation header. 

### 2. Projects Page (`/projects`)
- **Focus:** A curated gallery of software development, video editing, and design projects.
- **Key Features:**
  - Grid-based layout for optimal scanning on both desktop and mobile devices.
  - Interactive hover states (scale, translate) utilizing the custom `liquid-glass-card` CSS class for premium depth effects.
- **Latest News/Updates:** Primed to host high-quality thumbnails highlighting William's dual expertise in coding and cinema videography.

### 3. Blog Page (`/blog`)
- **Focus:** A space for articles, thoughts, tutorials, and technical write-ups.
- **Key Features:**
  - Clean typography optimized for long-form reading (using standard `inter` and `jakarta` sans-serif fallbacks).
  - High-contrast text rendering to ensure accessibility against the dark theme.
- **Latest News/Updates:** The foundation is laid out for upcoming CMS integration or Markdown-based local article rendering.

### 4. About Page (`/about`)
- **Focus:** The personal identity and biography section for William Kreese.
- **Key Features:**
  - Detailed bio outlining his roles: "photographer, cinema videographer, and editor."
  - Beautifully structured Social Links grid showcasing direct connections.
- **Latest News/Updates:** 
  - The bio was recently updated to strictly use American English styling ("cinema videographer").
  - The social grid was completely re-balanced (dàn đều) from a 3-column to a 2-column symmetric layout. 
  - GitHub takes the featured top slot, spanning full width, with Instagram and TikTok neatly split 50/50 below it.

### 5. EsPiFF Page (`/esp`)
- **Focus:** A specialized hardware/development section dedicated to ESP Boards.
- **Key Features:**
  - Distinctly separated from standard software projects, allowing deep dives into IoT, microcontrollers, and hardware tinkering.
- **Latest News/Updates:** The navigation link was globally rebranded from "ESP BOARDS" to **EsPiFF** to reflect a more unique, branded naming convention across both Desktop and Mobile navigation menus.

---

## 🎨 UI/UX Highlights

- **Liquid Glass Cards (`.liquid-glass-card`):** A custom CSS class heavily utilized across the app. It provides a frosted glass (glassmorphism) effect with dynamic borders and deep shadows, giving elements a tactile, premium feel without compromising readability.
- **Responsive Navigation:** A sticky, backdrop-blurred header that seamlessly collapses into a mobile-friendly hamburger menu (`Menu` / `X` toggles) on smaller screens.
- **Dark Mode Native:** The entire application is architected ground-up for a dark aesthetic, utilizing slate/dark backgrounds and high-contrast white text with brand color accents.

---

## 🚀 Getting Started (Development)

If you want to run this project locally, follow these steps:

### Prerequisites
- Node.js (v16.0 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository** (if hosted on GitHub):
   ```bash
   git clone https://github.com/williamkreese21/portfolio.git
   cd portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000` (or the port specified by Vite).

### Building for Production

To create an optimized production build:
```bash
npm run build
```
This will output static files into the `dist/` directory, ready to be deployed to Vercel, Netlify, GitHub Pages, or any static hosting provider.

---

## 📁 Directory Structure

```text
/
├── public/             # Static assets (images, icons)
├── src/                # Source code
│   ├── components/     # Reusable UI components (if any extracted)
│   ├── App.tsx         # Main application routing and core UI shell
│   ├── EspBoards.tsx   # EsPiFF specialized page component
│   ├── index.css       # Global stylesheet & Tailwind directives
│   └── main.tsx        # React DOM mounting point
├── index.html          # HTML Entry point
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

---

*Powered by William Kreese.*

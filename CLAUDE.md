# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vetscor is a Webflow-integrated JavaScript bundle that provides custom animations and interactions for a website. The code is built with Vite and deployed as a UMD bundle to be loaded alongside the Webflow-generated site.

## Development Commands

```bash
npm run dev       # Start Vite dev server (localhost)
npm run build     # Build production bundle to dist/
npm run preview   # Preview production build
npm run clean     # Remove dist folder
npm run lint:fix  # Run ESLint with auto-fix on src/
```

## Architecture

### Entry Point & Page Routing
- `src/main.js` - Entry point, runs `getPageInit()` on DOMContentLoaded
- `src/utils/utility.js` - Contains `getPageInit()` which routes to page-specific init functions based on `window.location.pathname`

### Page Modules
Each page has its own module in `src/pages/`:
- `homepage.js` - Homepage with GSAP slider implementation
- `about.js` - Chi Siamo page
- `corso.js` - Course detail pages (matches `/corsi/*` paths)
- `contatti.js` - Contact page
- `blog.js`, `blogArticle.js` - Blog functionality

### Core Libraries
- **GSAP** with Club GreenSock plugins: ScrollTrigger, CustomEase, SplitText, Draggable, InertiaPlugin
- **Lenis** (`@studio-freight/lenis`) - Smooth scroll
- **Barba.js** - Page transitions (currently commented out)
- **jQuery** - External dependency, excluded from bundle

### Key Patterns

**Custom GSAP Ease**: A custom ease `customEaseInOut` is registered globally in `utility.js` and used throughout.

**Webflow Integration**:
- Bundle outputs as UMD format with jQuery as external
- `resetWebflow()` in utility.js handles Webflow reinitialization after Barba transitions
- DOM elements use Webflow class naming conventions (e.g., `.navigation`, `.nav_m_hamburger_wrapper`)

**Lenis Scroll**: When using Lenis, access it via `window.lenis`. The navbar system integrates with Lenis scroll events for show/hide behavior.

## Build Output

The build produces a single `main.js` file in `dist/` with inline dynamic imports, suitable for loading via Webflow's custom code section.

# Portfolio New (Racer Edition)

An interactive racing-themed portfolio built with React, TypeScript, Vite, and React Three Fiber.

## Highlights

- Cinematic boot sequence with terminal-style startup
- 3D garage and race scenes
- Driver HUD + interactive hotspots
- Project cards and tech stack surfaced inside the garage UI
- Race-style flow: Boot -> Garage -> Countdown -> Race

## Stack

- React
- TypeScript
- Vite
- Zustand
- React Three Fiber / Three.js

## Local Setup

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Controls / Flow

- Wait for the boot screen to finish
- In garage:
  - Click hotspots to inspect profile, projects, stack, and links
  - Press Start Race Session to enter race flow

## Project Data Source

Edit the content in:

- `src/data/portfolio.ts`

This file controls:

- Driver details
- Skills list
- Project list and repository links

## Roadmap

- Add mobile-specific HUD refinements
- Add project filters by tag
- Add lap-history panel for race session
- Add optional dark/light display presets

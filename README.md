# ISRO Prototype – Digital Twin

An interactive React + TypeScript prototype that visualizes an ISRO-inspired Earth digital twin with a 3D globe, satellite activity, climate overlays, and India-focused weather views.

## Features

- 3D Earth visualization powered by `react-globe.gl` and `three`
- Simulated satellite constellation with animated orbits and telemetry arcs
- ISRO mission node panels with facility-focused navigation
- Multiple data layers:
  - Satellite radar
  - INSAT climate anomaly overlay
  - Jet/current stream visualization
  - India regional weather, heat, and wind overlays
- Day/night lighting mode and cloud rendering toggle
- Time-slider playback for projected data behavior
- Settings drawer with runtime visualization controls

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Three.js + react-globe.gl
- Leaflet + react-leaflet
- Recharts
- Framer Motion (`motion`)

## Project Structure

```text
src/
  App.tsx                      # App shell
  main.tsx                     # React entrypoint
  index.css                    # Global styles/theme
  components/
    DigitalTwin.tsx            # Main digital twin UI + visualization logic
```

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy `.env.example` to `.env` and set values:

```bash
cp .env.example .env
```

Required variables:

- `GEMINI_API_KEY`
- `APP_URL`

### 3) Run locally

```bash
npm run dev
```

By default, Vite runs on `http://0.0.0.0:3000`.

## Available Scripts

- `npm run dev` – Start dev server
- `npm run build` – Build production bundle
- `npm run preview` – Preview production build locally
- `npm run lint` – TypeScript type-check (`tsc --noEmit`)
- `npm run clean` – Remove generated build artifacts

## Notes

- The prototype relies on external map/texture tile endpoints for some globe/map assets.
- `script.ts` is a local utility script used to patch sections of `DigitalTwin.tsx`.

# HoopScript 

A minimalist basketball management simulation built for mobile. HoopScript focuses on the intersection of data-driven strategy and the "scripting" of a franchise's destiny. Built with **React Native** and **Expo**, it provides a fast, snappy, and statistically accurate experience for fans of the "front office" side of the game.

## Vision
Most basketball sims focus on the action on the court. **HoopScript** focuses on the logic behind the wins. It’s designed for the player who prefers spreadsheets and the draft room over the fast break. Every decision matters, from rotation minutes to late-round draft picks.

## Key Features

### Engine & Simulation
- **Dynamic Simulation Engine**: A sophisticated play-by-play engine (`gameSim.ts`) that calculates outcomes based on granular player attributes, fatigue, and coaching tendencies.
- **Narrative Engine**: Context-aware descriptions (`narrativeEngine.ts`) that bring every turnover, buzzer-beater, and blowout to life with descriptive commentary.
- **Procedural Roster Generation**: A "living world" (`rosterGenerator.ts`) that populates the league with unique players, each with distinct potential and career trajectories.

### League Operations
- **Full Season Lifecycle**: Manage your team through the regular season, trade deadline, and into the playoffs.
- **Playoff Ecosystem**: Interactive playoff brackets with full series tracking and championship history.
- **Draft & Lottery**: Experience the tension of the Draft Lottery and the strategic depth of the Rookie Draft.
- **Stat Tracking**: Comprehensive tracking of team and player statistics throughout the history of your save.

### User Experience
- **Minimalist UI**: A flat, 2D aesthetic designed for clarity and speed, using a signature **Terracotta (#B34726)** branding.
- **Snappy Performance**: Optimized for mobile with low overhead and quick simulation times.
- **Multiple Save Slots**: Manage different franchises or eras simultaneously.

## Tech Stack
- **Framework**: [Expo](https://expo.dev/) (SDK 55) / React Native
- **Language**: TypeScript
- **State & Storage**: React Hooks & AsyncStorage
- **Audio**: Expo Audio for immersive game atmosphere
- **Icons**: @expo/vector-icons
- **Fonts**: Custom typography (Oswald and Roboto Condensed)

## Project Structure
```text
src/
├── components/     # Reusable UI elements (TeamCards, Screens, etc.)
├── context/        # Global state providers (Audio, GameState)
├── data/           # Static league data (Teams, Names, Initial Rosters)
├── hooks/          # Custom business logic hooks
├── screens/        # Main navigation views (Draft, Standings, Sim, etc.)
├── styles/         # Centralized theme and global styling
└── utils/          # Core logic (Simulation, League Engine, Stats)
```

## Development Guidelines

### Styling Rules
To maintain the minimalist aesthetic and codebase health, we follow strict styling rules defined in `GEMINI.md`:
- **No Inline Styles**: All styles must be defined in `src/styles/globalStyles.ts` or `src/styles/theme.ts`.
- **Branding**: Use the centralized theme variables for colors (especially the **Terracotta #B34726**).
- **Typography**: Always use the project's custom fonts via the global style system.

### Getting Started
1. **Clone the repo**: `git clone https://github.com/yourusername/hoopscript.git`
2. **Install dependencies**: `npm install`
3. **Start the development server**: `npx expo start`

---
**Start Date** - April 5, 2026
**Current Version** - 1.0.1 (May 8, 2026)
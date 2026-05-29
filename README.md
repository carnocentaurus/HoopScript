# HoopScript 

A minimalist basketball management simulation built for mobile. HoopScript focuses on the intersection of data-driven strategy and the "scripting" of a franchise's destiny. Built with **React Native** and **Expo**, it provides a fast, snappy, and statistically accurate experience for fans of the "front office" side of the game.

## Vision
Most basketball sims focus on the action on the court. **HoopScript** focuses on the logic behind the wins. It’s designed for the player who prefers spreadsheets and the draft room over the fast break. Every decision matters, from rotation minutes to late-round draft picks.

## Key Features

### Engine & Tactical Depth
- **Dynamic RPS Simulation**: A play-by-play engine (`gameSim.ts`) built on a "Tactical Matrix." Offenses like **Pace & Space** can be neutralized by **Perimeter Lock**, creating a Rock-Paper-Scissors layer to every game.
- **Adaptive Coaching AI**: CPU coaches aren't static. High-IQ opponents will scout your tendencies and shift tactics mid-series during the playoffs (`leagueEngine.ts`).
- **Narrative Analysis**: Post-game reports go beyond the box score, explaining *why* you won or lost based on efficiency deltas and coaching IQ.
- **Scouting Reports**: Predict opponent strategies based on coach predictability and historical data.

### League Operations
- **Advanced Stat Tracking**: Granular tracking including **TS% (True Shooting)**, **Usage Rate**, and **Per-Possession efficiency**.
- **Playoff Ecosystem**: 2-2-1-1-1 series format with home-court advantage logic and championship history.
- **Draft & Lottery**: Authentic lottery odds based on the 2019 NBA model, followed by a multi-round procedural draft.
- **Roster Management**: Manage 15-man rosters with progression/regression cycles based on age and potential.

### User Experience
- **Minimalist UI**: A flat, 2D aesthetic designed for clarity and speed, using a signature **Terracotta (#B34726)** branding.
- **Snappy Performance**: Optimized for mobile with low overhead and quick simulation times.
- **Save Integrity**: Robust save slot system allowing multiple simultaneous league histories.

## Tech Stack
- **Framework**: [Expo](https://expo.dev/) (SDK 55) / React Native
- **Language**: TypeScript
- **State & Storage**: React Hooks & AsyncStorage
- **Audio**: Expo Audio for immersive game atmosphere
- **Icons**: @expo/vector-icons
- **Fonts**: Custom typography (Oswald, Roboto Condensed, and Inter)

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

- **Start Date** - April 5, 2026
- **Version 1.0.1** - May 8, 2026
- **Version 1.1.0** - May 28, 2026
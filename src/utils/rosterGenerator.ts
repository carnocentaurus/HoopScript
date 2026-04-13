import { Player, SeasonStats } from '../types/save';
import { LAST_NAMES } from '../data/names';

// Seeded random for deterministic ratings
const seededRandom = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = h * 16807 % 2147483647;
    return (h - 1) / 2147483646;
  };
};

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;

export const generateRoster = (city: string): Player[] => {
  const roster: Player[] = [];
  const rng = seededRandom(city);
  
  for (let i = 0; i < 15; i++) {
    const isStarter = i < 5;
    const pos = isStarter ? POSITIONS[i] : POSITIONS[Math.floor(rng() * 5)];
    
    // 1. Determine Archetype Factors based on Position
    let heightBase = 50;
    let speedBase = 50;
    let offBonus = 0;
    let defBonus = 0;

    switch (pos) {
      case "PG":
        heightBase = Math.floor(rng() * 20) + 10;
        speedBase = Math.floor(rng() * 20) + 75;
        offBonus = 5;
        break;
      case "SG":
        heightBase = Math.floor(rng() * 20) + 30;
        speedBase = Math.floor(rng() * 20) + 70;
        offBonus = 7;
        break;
      case "SF":
        heightBase = Math.floor(rng() * 20) + 50;
        speedBase = Math.floor(rng() * 20) + 50;
        break;
      case "PF":
        heightBase = Math.floor(rng() * 20) + 70;
        speedBase = Math.floor(rng() * 20) + 30;
        defBonus = 5;
        break;
      case "C":
        heightBase = Math.floor(rng() * 20) + 80;
        speedBase = Math.floor(rng() * 20) + 15;
        defBonus = 8;
        break;
    }

    // 2. Generate Base Ratings (Starters vs Bench)
    const baseOff = isStarter 
      ? Math.floor(rng() * 15) + 78 
      : Math.floor(rng() * 15) + 65;
      
    const baseDef = isStarter 
      ? Math.floor(rng() * 15) + 78 
      : Math.floor(rng() * 15) + 65;

    // 3. Final Calculations
    const finalOffense = Math.min(99, baseOff + offBonus);
    const finalDefense = Math.min(99, baseDef + defBonus);

    const stats: SeasonStats = {
      gamesPlayed: 0,
      gamesStarted: 0,
      pts: 0,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      tov: 0,
      threePM: 0,
      oreb: 0,
      dreb: 0,
      plusMinus: 0,
      fgm: 0,
      fga: 0,
      min: 0
    };

    const nameIndex = Math.floor(rng() * LAST_NAMES.length);

    roster.push({
      id: `${city}-${i}`, // Deterministic ID
      lastName: LAST_NAMES[nameIndex],
      number: Math.floor(rng() * 100),
      position: pos,
      isStarter,
      offense: finalOffense,
      defense: finalDefense,
      overall: Math.round((finalOffense + finalDefense) / 2),
      heightFactor: heightBase,
      speedFactor: speedBase,
      isRookie: rng() < 0.1,
      stats
    });
  }
  
  return roster;
};

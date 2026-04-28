import { Player, SeasonStats } from '../types/save';
import { LAST_NAMES } from '../data/names';
import { TEAM_ROSTERS } from '../data/rosters';

// Seeded random for deterministic ratings
const seededRandom = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = h * 16807 % 2147483647;
    // Ensure h is positive for the division
    const posH = h < 0 ? h + 2147483647 : h;
    return (posH - 1) / 2147483646;
  };
};

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;

export const generateRookie = (lastName?: string): Player => {
  const pos = POSITIONS[Math.floor(Math.random() * 5)];
  const age = 19;
  const name = lastName || LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  
  const baseOff = Math.floor(Math.random() * 20) + 65;
  const baseDef = Math.floor(Math.random() * 20) + 65;

  return {
    id: Math.random().toString(36).substr(2, 9),
    lastName: name,
    age,
    number: Math.floor(Math.random() * 100),
    position: pos,
    isStarter: false,
    offense: baseOff,
    defense: baseDef,
    overall: Math.round((baseOff + baseDef) / 2),
    heightFactor: Math.floor(Math.random() * 100),
    speedFactor: Math.floor(Math.random() * 100),
    isRookie: true,
    stats: {
      gamesPlayed: 0, gamesStarted: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, 
      threePM: 0, threePA: 0, oreb: 0, dreb: 0, plusMinus: 0, fgm: 0, fga: 0, min: 0,
      possessions: 0
    },
    usgRate: Math.floor(Math.random() * 15) + 15,
    tsPct: (Math.random() * 0.1) + 0.5,
    blkRate: (Math.random() * 3) + 0.5,
    stlRate: (Math.random() * 3) + 0.5,
    tovRate: (Math.random() * 10) + 10,
    targetMinutes: 15
  };
};

export const validateAndFixRoster = (roster: Player[]): Player[] => {
  // 1. Identify the best player for each starting position
  const positions = ["PG", "SG", "SF", "PF", "C"] as const;
  const starterIds = new Set<string>();

  positions.forEach(pos => {
    const bestAtPos = [...roster]
      .filter(p => p.position === pos && !starterIds.has(p.id))
      .sort((a, b) => b.overall - a.overall)[0];
    
    if (bestAtPos) {
      starterIds.has(bestAtPos.id);
      starterIds.add(bestAtPos.id);
    }
  });

  // 2. If we don't have 5 starters (rare but possible), fill with next best overall
  if (starterIds.size < 5) {
    const remaining = [...roster]
      .filter(p => !starterIds.has(p.id))
      .sort((a, b) => b.overall - a.overall);
    
    for (let i = 0; i < (5 - starterIds.size); i++) {
      if (remaining[i]) starterIds.add(remaining[i].id);
    }
  }

  // 3. Update roster with starter flags
  return roster.map(p => {
    const isStarter = starterIds.has(p.id);
    
    return {
      ...p,
      isStarter,
    };
  });
};

export const generateRoster = (city: string): Player[] => {
  const roster: Player[] = [];
  const rng = seededRandom(city);
  
  // Use data from TEAM_ROSTERS if available
  const teamData = TEAM_ROSTERS[city];

  for (let i = 0; i < 15; i++) {
    const isStarter = i < 5;
    const pos = isStarter ? POSITIONS[i] : POSITIONS[Math.floor(rng() * 5)];
    const age = Math.floor(rng() * 17) + 19; // 19 to 35
    
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

    let finalOffense: number;
    let finalDefense: number;
    let name: string;

    if (teamData && teamData[i]) {
      name = teamData[i].name;
      finalOffense = teamData[i].off;
      finalDefense = teamData[i].def;
    } else {
      // 2. Generate Base Ratings (Starters vs Bench)
      const baseOff = isStarter 
        ? Math.floor(rng() * 15) + 78 
        : Math.floor(rng() * 15) + 65;
        
      const baseDef = isStarter 
        ? Math.floor(rng() * 15) + 78 
        : Math.floor(rng() * 15) + 65;

      // 3. Final Calculations
      finalOffense = Math.min(99, baseOff + offBonus);
      finalDefense = Math.min(99, baseDef + defBonus);
      
      const nameIndex = Math.floor(rng() * LAST_NAMES.length);
      name = LAST_NAMES[nameIndex];
    }

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
      threePA: 0,
      oreb: 0,
      dreb: 0,
      plusMinus: 0,
      fgm: 0,
      fga: 0,
      min: 0,
      possessions: 0
    };

    roster.push({
      id: Math.random().toString(36).substr(2, 9),
      lastName: name,
      age,
      number: Math.floor(rng() * 100),
      position: pos,
      isStarter,
      offense: finalOffense,
      defense: finalDefense,
      overall: Math.round((finalOffense + finalDefense) / 2),
      heightFactor: heightBase,
      speedFactor: speedBase,
      isRookie: age === 19,
      stats,
      usgRate: isStarter ? (Math.floor(rng() * 10) + 20) : (Math.floor(rng() * 10) + 12),
      tsPct: (rng() * 0.1) + 0.5,
      blkRate: (rng() * 3) + 0.5,
      stlRate: (rng() * 3) + 0.5,
      tovRate: (rng() * 10) + 10,
      targetMinutes: isStarter ? 32 : 15
    });
  }

  return validateAndFixRoster(roster);
};

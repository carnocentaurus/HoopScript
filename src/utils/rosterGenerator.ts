import { Player, SeasonStats } from '../types/save';
import { NAME_REGIONS } from '../data/names';
import { TEAM_ROSTERS } from '../data/rosters';

// Name Registry to prevent collisions
const usedNames = new Set<string>();

export const clearNameRegistry = () => {
  usedNames.clear();
};

export const registerName = (name: string) => {
  usedNames.add(name);
};

const getSeededIndex = (seed: string, max: number): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % max;
};

const getRegionByLastName = (lastName: string) => {
  for (const [region, data] of Object.entries(NAME_REGIONS)) {
    if (data.lastNames.includes(lastName)) {
      return region as keyof typeof NAME_REGIONS;
    }
  }
  return 'AMERICAN'; // Fallback
};

export const generateUniqueName = (existingLastName?: string, seed?: string): string => {
  let region: keyof typeof NAME_REGIONS;
  let lastName: string;

  if (existingLastName) {
    lastName = existingLastName;
    region = getRegionByLastName(lastName);
  } else {
    const regions = Object.keys(NAME_REGIONS) as (keyof typeof NAME_REGIONS)[];
    region = regions[Math.floor(Math.random() * regions.length)];
    const pool = NAME_REGIONS[region].lastNames;
    lastName = pool[Math.floor(Math.random() * pool.length)];
  }

  const firstNamePool = NAME_REGIONS[region].firstNames;
  
  const firstNameIndex = seed 
    ? getSeededIndex(seed, firstNamePool.length) 
    : Math.floor(Math.random() * firstNamePool.length);

  let firstName = firstNamePool[firstNameIndex];
  let fullName = `${firstName} ${lastName}`;
  let attempts = 0;

  // Try different first names if full name is taken
  while (usedNames.has(fullName) && attempts < firstNamePool.length) {
    const nextIndex = (firstNameIndex + attempts + 1) % firstNamePool.length;
    firstName = firstNamePool[nextIndex];
    fullName = `${firstName} ${lastName}`;
    attempts++;
  }

  // If still not unique (highly unlikely with first names), add a suffix
  if (usedNames.has(fullName)) {
    let suffix = 2;
    while (usedNames.has(`${fullName} ${suffix}`)) {
      suffix++;
    }
    fullName = `${fullName} ${suffix}`;
  }

  usedNames.add(fullName);
  return fullName;
};

export const migrateSaveNames = (save: any) => {
  if (!save) return save;

  // 1. Clear registry and register all VALID full names first to avoid collisions
  clearNameRegistry();
  
  const collectValidNames = (roster: any[]) => {
    roster.forEach(p => {
      if (p.lastName && p.lastName.includes(" ")) {
        registerName(p.lastName);
      }
    });
  };

  // Collect from all possible rosters
  if (save.standings) {
    save.standings.forEach((t: any) => collectValidNames(t.roster || []));
  }
  if (save.history) {
    save.history.forEach((h: any) => {
      if (h.standings) {
        h.standings.forEach((t: any) => collectValidNames(t.roster || []));
      }
    });
  }
  if (save.draftState?.pool) {
    collectValidNames(save.draftState.pool);
  }

  // 2. Fix names that don't have a space
  const fixRosterNames = (roster: any[]) => {
    if (!roster) return [];
    return roster.map((p: any) => {
      if (p.lastName && !p.lastName.includes(" ")) {
        return {
          ...p,
          lastName: generateUniqueName(p.lastName)
        };
      }
      return p;
    });
  };

  if (save.standings) {
    save.standings = save.standings.map((t: any) => ({
      ...t,
      roster: fixRosterNames(t.roster)
    }));
  }

  if (save.history) {
    save.history = save.history.map((h: any) => ({
      ...h,
      standings: h.standings?.map((t: any) => ({
        ...t,
        roster: fixRosterNames(t.roster)
      }))
    }));
  }

  // Sync user roster
  const myTeam = save.standings?.find((t: any) => t.city === save.city);
  if (myTeam) {
    save.roster = myTeam.roster;
  }

  if (save.draftState?.pool) {
    save.draftState.pool = fixRosterNames(save.draftState.pool);
  }

  return save;
};

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
  const name = generateUniqueName(lastName);
  
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
      const seed = `${city}-${teamData[i].name}-${i}`;
      name = generateUniqueName(teamData[i].name, seed);
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
      
      name = generateUniqueName();
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

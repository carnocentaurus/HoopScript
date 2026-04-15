import { Player, GameSave, TeamStanding } from '../types/save';
import { generateRoster, generateRookie } from './rosterGenerator';
import { PlayerStat } from './gameSim';

export const ALL_CITIES = [
  "Toronto", "Boston", "New York", "Brooklyn", "Philadelphia",
  "Chicago", "Cleveland", "Detroit", "Indiana", "Milwaukee",
  "Atlanta", "Charlotte", "Miami", "Orlando", "Washington",
  "Denver", "Minnesota", "Oklahoma City", "Portland", "Utah",
  "San Francisco", "Phoenix", "Sacramento", "Los Angeles", "San Diego",
  "Dallas", "Houston", "Memphis", "New Orleans", "San Antonio"
];

export const updatePlayerStats = (player: Player, stats: PlayerStat): Player => {
  return {
    ...player,
    stats: {
      gamesPlayed: (player.stats.gamesPlayed || 0) + 1,
      gamesStarted: (player.stats.gamesStarted || 0) + (player.isStarter ? 1 : 0),
      pts: (player.stats.pts || 0) + stats.pts,
      reb: (player.stats.reb || 0) + stats.reb,
      ast: (player.stats.ast || 0) + stats.ast,
      stl: (player.stats.stl || 0) + stats.stl,
      blk: (player.stats.blk || 0) + stats.blk,
      tov: (player.stats.tov || 0) + stats.tov,
      threePM: (player.stats.threePM || 0) + stats.threePM,
      oreb: (player.stats.oreb || 0) + stats.oreb,
      dreb: (player.stats.dreb || 0) + stats.dreb,
      plusMinus: (player.stats.plusMinus || 0) + stats.plusMinus,
      fgm: (player.stats.fgm || 0) + stats.fgm,
      fga: (player.stats.fga || 0) + stats.fga,
      min: (player.stats.min || 0) + stats.min,
    }
  };
};

export const calculateTeamRatings = (roster: Player[]) => {
  // Sort roster by overall descending to ensure we have the best players at the top 
  // if isStarter flags aren't perfectly aligned, but we'll prioritize isStarter.
  const starters = roster.filter(p => p.isStarter);
  const others = roster.filter(p => !p.isStarter).sort((a, b) => b.overall - a.overall);
  
  // In case of incomplete rosters, we'll fall back to slicing
  const teamStarters = starters.length >= 5 ? starters : roster.slice(0, 5);
  const keyBench = starters.length >= 5 ? others.slice(0, 5) : roster.slice(5, 10);

  const calculateWeightedRating = (key: 'offense' | 'defense' | 'overall') => {
    const startersAvg = teamStarters.length > 0 
      ? teamStarters.reduce((sum, p) => sum + p[key], 0) / teamStarters.length 
      : 0;
    
    const keyBenchAvg = keyBench.length > 0 
      ? keyBench.reduce((sum, p) => sum + p[key], 0) / keyBench.length 
      : 0;

    return Math.round((startersAvg * 0.75) + (keyBenchAvg * 0.25));
  };

  return {
    offense: calculateWeightedRating('offense'),
    defense: calculateWeightedRating('defense'),
    overall: calculateWeightedRating('overall')
  };
};

export const generateInitialStandings = (): TeamStanding[] => {
  return ALL_CITIES.map((city, index) => ({
    city,
    conf: (index < 15 ? 'East' : 'West') as 'East' | 'West', 
    wins: 0,
    losses: 0,
    roster: generateRoster(city),
  }));
};

export const generateSchedule = (userCity: string): string[] => {
  const opponents = ALL_CITIES.filter(city => city !== userCity);
  let schedule: string[] = [];
  
  for (let i = 0; i < 82; i++) {
    schedule.push(opponents[i % opponents.length]);
  }
  
  return schedule.sort(() => Math.random() - 0.5);
};

export const processAging = (roster: Player[]): Player[] => {
  return roster.map(player => {
    let newAge = player.age + 1;
    let newOff = player.offense;
    let newDef = player.defense;

    // Progression (under 27)
    if (newAge < 27) {
      newOff += Math.floor(Math.random() * 4); 
      newDef += Math.floor(Math.random() * 4);
    } 
    // Prime (27-31)
    else if (newAge >= 27 && newAge <= 31) {
      newOff += Math.floor(Math.random() * 3) - 1; 
      newDef += Math.floor(Math.random() * 3) - 1;
    }
    // Regression (32+)
    else {
      const declineFactor = Math.floor((newAge - 31) / 2) + 1;
      newOff -= Math.floor(Math.random() * declineFactor) + 1;
      newDef -= Math.floor(Math.random() * declineFactor) + 1;
    }

    // Caps
    newOff = Math.max(40, Math.min(99, newOff));
    newDef = Math.max(40, Math.min(99, newDef));

    // Retirement
    const retireProb = newAge >= 39 ? 0.4 : (newAge >= 37 ? 0.1 : 0);
    if (Math.random() < retireProb || newAge > 42) {
      return generateRookie();
    }

    return {
      ...player,
      age: newAge,
      offense: newOff,
      defense: newDef,
      overall: Math.round((newOff + newDef) / 2),
      isRookie: false, 
      stats: {
        gamesPlayed: 0, gamesStarted: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, 
        threePM: 0, oreb: 0, dreb: 0, plusMinus: 0, fgm: 0, fga: 0, min: 0
      }
    };
  });
};

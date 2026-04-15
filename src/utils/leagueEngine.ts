import { Player, GameSave, TeamStanding, DraftPick, SeriesMatchup } from '../types/save';
import { generateRoster, generateRookie, validateAndFixRoster } from './rosterGenerator';
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

export const generateSchedule = (userCity: string): { opponents: string[], homeStatuses: boolean[] } => {
  const userIndex = ALL_CITIES.indexOf(userCity);
  const isEast = userIndex < 15;
  
  const conferenceOpponents = ALL_CITIES.filter((city, idx) => {
    const cityIsEast = idx < 15;
    return city !== userCity && cityIsEast === isEast;
  });

  const nonConferenceOpponents = ALL_CITIES.filter((city, idx) => {
    const cityIsEast = idx < 15;
    return cityIsEast !== isEast;
  });

  let opponents: string[] = [];

  // NBA-ish distribution: 
  // ~52 games against conference (approx 3-4 times each)
  // ~30 games against non-conference (2 times each)
  
  // 1. Add Conference Games (4 times vs each)
  conferenceOpponents.forEach(opp => {
    for (let i = 0; i < 4; i++) opponents.push(opp);
  });

  // 2. Add Non-Conference Games (2 times vs each)
  nonConferenceOpponents.forEach(opp => {
    for (let i = 0; i < 2; i++) opponents.push(opp);
  });

  // 3. Truncate/Pad to exactly 82 games
  if (opponents.length > 82) {
    opponents = opponents.slice(0, 82);
  } else {
    while (opponents.length < 82) {
      const extra = ALL_CITIES[Math.floor(Math.random() * ALL_CITIES.length)];
      if (extra !== userCity) opponents.push(extra);
    }
  }

  // 4. Create 41 Home and 41 Away statuses
  let homeStatuses: boolean[] = [
    ...Array(41).fill(true),
    ...Array(41).fill(false)
  ];

  // 5. Shuffle both together (Fisher-Yates)
  for (let i = 81; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap opponents
    [opponents[i], opponents[j]] = [opponents[j], opponents[i]];
    // Swap statuses
    [homeStatuses[i], homeStatuses[j]] = [homeStatuses[j], homeStatuses[i]];
  }

  return { opponents, homeStatuses };
};

export const processAging = (roster: Player[]): Player[] => {
  const agedRoster = roster.map(player => {
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

  return validateAndFixRoster(agedRoster);
};

// --- DRAFT LOGIC ---

// Approx 2019 NBA Lottery Odds (Percentage for #1 pick)
const LOTTERY_ODDS = [140, 140, 140, 125, 105, 90, 75, 60, 45, 30, 20, 15, 10, 5];

export const generateDraftOrder = (save: GameSave): string[] => {
  const standings = [...save.standings].sort((a, b) => a.wins - b.wins || b.losses - a.losses);
  
  // 1. Identify non-playoff teams (Bottom 14)
  // Non-playoff teams are those that didn't make the bracket
  const playoffTeamCities = new Set<string>();
  save.playoffBracket?.forEach(s => {
    playoffTeamCities.add(s.highSeed);
    playoffTeamCities.add(s.lowSeed);
  });

  const lotteryTeams = standings.filter(t => !playoffTeamCities.has(t.city)).slice(0, 14);
  const playoffTeams = standings.filter(t => playoffTeamCities.has(t.city));

  // 2. Run Lottery for top 4 picks
  const lotteryOrder: string[] = [];
  const pool: string[] = [];
  
  lotteryTeams.forEach((team, index) => {
    const tickets = LOTTERY_ODDS[index] || 5;
    for (let i = 0; i < tickets; i++) pool.push(team.city);
  });

  while (lotteryOrder.length < 4 && pool.length > 0) {
    const winner = pool[Math.floor(Math.random() * pool.length)];
    if (!lotteryOrder.includes(winner)) {
      lotteryOrder.push(winner);
    }
  }

  // 3. Combine with remaining teams
  const remainingLottery = lotteryTeams
    .filter(t => !lotteryOrder.includes(t.city))
    .map(t => t.city);
    
  const playoffOrder = playoffTeams.map(t => t.city);

  const round1 = [...lotteryOrder, ...remainingLottery, ...playoffOrder];
  
  // 4. Round 2 is just strict inverse of standings
  const round2 = standings.map(t => t.city);

  return [...round1, ...round2];
};

export const generateDraftPool = (count: number = 75): Player[] => {
  return Array.from({ length: count }, () => {
    const p = generateRookie();
    // Draftees should be slightly better on average than random rookies
    const bonus = Math.floor(Math.random() * 8);
    p.offense = Math.min(99, p.offense + bonus);
    p.defense = Math.min(99, p.defense + bonus);
    p.overall = Math.round((p.offense + p.defense) / 2);
    return p;
  }).sort((a, b) => b.overall - a.overall);
};


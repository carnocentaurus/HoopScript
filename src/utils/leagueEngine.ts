import { Player, GameSave, TeamStanding, DraftPick, SeriesMatchup, LotteryResult, OffensiveFocus, DefensiveFocus, ScoutReport, SeasonStats, Strategy, PlayerStat } from '../types/save';



/**
 * Determines a team's natural identity based on roster composition.
 */
export const getTeamIdentity = (roster: Player[]): Strategy => {
  const starters = roster.filter(p => p.isStarter);
  const team = starters.length >= 5 ? starters : roster.slice(0, 5);

  // Offensive Identity
  let offense = OffensiveFocus.PACE_SPACE;
  const guards = team.filter(p => p.position === 'PG' || p.position === 'SG');
  const bigs = team.filter(p => p.position === 'PF' || p.position === 'C');
  const star = [...team].sort((a, b) => b.overall - a.overall)[0];
  const secondStar = [...team].sort((a, b) => b.overall - a.overall)[1];

  const guardsOffense = guards.reduce((sum, p) => sum + p.offense, 0) / (guards.length || 1);
  const bigsOffense = bigs.reduce((sum, p) => sum + p.offense, 0) / (bigs.length || 1);

  if (star && secondStar && (star.overall - secondStar.overall > 8)) {
    offense = OffensiveFocus.ISO_STAR;
  } else if (bigsOffense > guardsOffense + 5) {
    offense = OffensiveFocus.ATTACK_PAINT;
  } else {
    offense = OffensiveFocus.PACE_SPACE;
  }

  // Defensive Identity
  let defense = DefensiveFocus.PERIMETER_LOCK;
  const perimeterDef = guards.reduce((sum, p) => sum + p.defense, 0) / (guards.length || 1);
  const interiorDef = bigs.reduce((sum, p) => sum + p.defense, 0) / (bigs.length || 1);

  if (interiorDef > perimeterDef + 3) {
    defense = DefensiveFocus.PROTECT_RIM;
  } else if (perimeterDef > interiorDef + 3) {
    defense = DefensiveFocus.PERIMETER_LOCK;
  } else {
    defense = Math.random() > 0.5 ? DefensiveFocus.DOUBLE_TEAM : DefensiveFocus.PROTECT_RIM;
  }

  return { offense, defense };
};

/**
 * Selects a strategy for the CPU, influenced by identity, coaching IQ, and context.
 */
export const selectCPUStrategy = (
  team: TeamStanding, 
  opponent?: TeamStanding, 
  isPlayoffs: boolean = false
): Strategy => {
  const identity = getTeamIdentity(team.roster);
  const coachingIQ = team.coachingIQ || 60;
  const predictability = team.predictability || 70;

  // 1. Determine base strategy (sticking to identity)
  let strategy = { ...identity };

  // 2. Playoff Intensity: Coaches are more likely to deviate from "predictability" to win
  const effectivePredictability = isPlayoffs ? predictability * 0.7 : predictability;

  // 3. Roll for Adaptation: High IQ coaches are better at identifying counters
  const roll = Math.random() * 100;
  if (roll > effectivePredictability && opponent) {
    const oppIdentity = getTeamIdentity(opponent.roster);
    
    // Adaptation Logic: Attempt to counter the opponent's likely focus
    if (roll < effectivePredictability + (coachingIQ / 2)) {
      // Offensive adaptation: exploit opponent's likely defensive weakness
      if (oppIdentity.defense === DefensiveFocus.PROTECT_RIM) strategy.offense = OffensiveFocus.PACE_SPACE;
      else if (oppIdentity.defense === DefensiveFocus.PERIMETER_LOCK) strategy.offense = OffensiveFocus.ATTACK_PAINT;
      else if (oppIdentity.defense === DefensiveFocus.DOUBLE_TEAM) strategy.offense = OffensiveFocus.ISO_STAR;

      // Defensive adaptation: counter opponent's likely offensive focus
      if (oppIdentity.offense === OffensiveFocus.ATTACK_PAINT) strategy.defense = DefensiveFocus.PROTECT_RIM;
      else if (oppIdentity.offense === OffensiveFocus.PACE_SPACE) strategy.defense = DefensiveFocus.PERIMETER_LOCK;
      else if (oppIdentity.offense === OffensiveFocus.ISO_STAR) strategy.defense = DefensiveFocus.DOUBLE_TEAM;
    } else {
      // Random variation (trying something new)
      const offenses = [OffensiveFocus.ATTACK_PAINT, OffensiveFocus.PACE_SPACE, OffensiveFocus.ISO_STAR];
      const defenses = [DefensiveFocus.PROTECT_RIM, DefensiveFocus.PERIMETER_LOCK, DefensiveFocus.DOUBLE_TEAM];
      strategy.offense = offenses[Math.floor(Math.random() * offenses.length)];
      strategy.defense = defenses[Math.floor(Math.random() * defenses.length)];
    }
  }

  return strategy;
};

export const generateScoutReport = (cpuStrategy: Strategy, opponentIQ: number, opponentPredictability: number): ScoutReport => {
  const accuracyThreshold = (80 - (opponentIQ / 2)); 
  const roll = Math.random() * 100;
  const isAccurate = roll < accuracyThreshold;

  const offenses = [OffensiveFocus.ATTACK_PAINT, OffensiveFocus.PACE_SPACE, OffensiveFocus.ISO_STAR];
  const defenses = [DefensiveFocus.PROTECT_RIM, DefensiveFocus.PERIMETER_LOCK, DefensiveFocus.DOUBLE_TEAM];

  let displayMode: 'single' | 'dual' = 'single';
  let uncertaintyHigh = false;

  // New threshold logic: predictability > 75 is single, otherwise dual
  if (opponentPredictability > 75) {
    displayMode = 'single';
    uncertaintyHigh = false;
  } else {
    displayMode = 'dual';
    uncertaintyHigh = opponentPredictability < 60;
  }

  const allStrategies: Strategy[] = [];
  offenses.forEach(o => {
    defenses.forEach(d => {
      allStrategies.push({ offense: o, defense: d });
    });
  });

  // Probability A is always the actual strategy (or what the AI decided to show)
  const probA = cpuStrategy;

  // Filter out Probability A from the pool for Probability B
  const availableForB = allStrategies.filter(s => 
    s.offense !== probA.offense || s.defense !== probA.defense
  );

  // IF only one strategy exists in the pool (impossible here but good for logic), force single
  if (availableForB.length === 0) {
    displayMode = 'single';
    uncertaintyHigh = false;
  }

  const secondStrategy = availableForB[Math.floor(Math.random() * availableForB.length)];

  // Determine Coaching Profile
  let coachingProfile = "Standard";
  if (opponentIQ >= 85) coachingProfile = "Elite Tactician";
  else if (opponentIQ >= 70) coachingProfile = "Modern Strategist";
  else if (opponentIQ <= 45) coachingProfile = "Traditionalist";

  if (opponentPredictability <= 40) coachingProfile = "Wild Card";
  else if (opponentPredictability >= 80) coachingProfile += " (Rigid)";

  // Determine Adjustment Tendency
  let adjustmentTendency: 'Low' | 'Moderate' | 'High' = 'Moderate';
  if (opponentIQ >= 80) adjustmentTendency = 'High';
  else if (opponentIQ <= 50) adjustmentTendency = 'Low';

  if (isAccurate) {
    return {
      city: "Opponent",
      predictedOffense: probA.offense,
      predictedDefense: probA.defense,
      actualStrategy: probA,
      coachingIQ: opponentIQ,
      predictability: opponentPredictability,
      uncertaintyHigh: uncertaintyHigh,
      displayMode: displayMode,
      possibleStrategies: displayMode === 'dual' ? [probA, secondStrategy] : undefined,
      coachingProfile,
      adjustmentTendency
    };
  } else {
    // If not accurate, we show a random strategy as Probability A
    const wrongProbA = availableForB[Math.floor(Math.random() * availableForB.length)];
    const availableForWrongB = allStrategies.filter(s => 
      s.offense !== wrongProbA.offense || s.defense !== wrongProbA.defense
    );
    const wrongProbB = availableForWrongB[Math.floor(Math.random() * availableForWrongB.length)];

    return {
      city: "Opponent",
      predictedOffense: wrongProbA.offense,
      predictedDefense: wrongProbA.defense,
      actualStrategy: probA,
      coachingIQ: opponentIQ,
      predictability: opponentPredictability,
      uncertaintyHigh: uncertaintyHigh,
      displayMode: displayMode,
      possibleStrategies: displayMode === 'dual' ? [wrongProbA, wrongProbB] : undefined,
      coachingProfile,
      adjustmentTendency
    };
  }
};
import { generateRoster, generateRookie, validateAndFixRoster, clearNameRegistry } from './rosterGenerator';
import { generateCoachingIQ } from './coachingUtils';

export const initializeNewLeague = (): TeamStanding[] => {
  clearNameRegistry();
  return generateInitialStandings();
};

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
      threePA: (player.stats.threePA || 0) + (stats.threePA || Math.round(stats.threePM * 2.8)),
      oreb: (player.stats.oreb || 0) + stats.oreb,
      dreb: (player.stats.dreb || 0) + stats.dreb,
      plusMinus: (player.stats.plusMinus || 0) + stats.plusMinus,
      fgm: (player.stats.fgm || 0) + stats.fgm,
      fga: (player.stats.fga || 0) + stats.fga,
      min: (player.stats.min || 0) + stats.min,
      possessions: (player.stats.possessions || 0) + (stats.possessions || 0)
    }
  };
};

export const calculateSeasonAverages = (stats: SeasonStats) => {
  const gp = Number(stats.gamesPlayed) || 0;
  
  // Guard clause for zero games played
  if (gp === 0) {
    return {
      pts: "0.0", reb: "0.0", ast: "0.0", stl: "0.0", blk: "0.0", tov: "0.0",
      fgPct: "0.0", threePct: "0.0", min: "0.0", tsPct: "0.0", usgRate: "0.0"
    };
  }

  const possessions = Number(stats.possessions) || (gp * 75); 
  return {
    pts: (Number(stats.pts) / gp).toFixed(1),
    reb: (Number(stats.reb) / gp).toFixed(1),
    ast: (Number(stats.ast) / gp).toFixed(1),
    stl: (Number(stats.stl) / gp).toFixed(1),
    blk: (Number(stats.blk) / gp).toFixed(1),
    tov: (Number(stats.tov) / gp).toFixed(1),
    fgPct: Number(stats.fga) > 0 ? ((Number(stats.fgm) / Number(stats.fga)) * 100).toFixed(1) : "0.0",
    threePct: Number(stats.threePA) > 0 ? ((Number(stats.threePM) / Number(stats.threePA)) * 100).toFixed(1) : "0.0",
    min: (Number(stats.min) / gp).toFixed(1),
    tsPct: Number(stats.fga) > 0 ? ((Number(stats.pts) / (2 * (Number(stats.fga) + 0.44 * (Number(stats.pts) * 0.1)))) * 100).toFixed(1) : "0.0",
    usgRate: possessions > 0 ? ((Number(stats.fga) + 0.44 * (Number(stats.pts) * 0.1) + Number(stats.tov)) / possessions * 100).toFixed(1) : "0.0"
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
  return ALL_CITIES.map((city, index) => {
    const roster = generateRoster(city).map(player => ({
      ...player,
      isRookie: false
    }));

    return {
      city,
      conf: (index < 15 ? 'East' : 'West') as 'East' | 'West', 
      wins: 0,
      losses: 0,
      streak: 0,
      roster,
      coachingIQ: generateCoachingIQ(),
      predictability: Math.floor(Math.random() * 100) + 1, // 1 to 100
      pace: Math.floor(Math.random() * 10) + 95, // 95 to 105
      totalPoints: 0,
      gamesPlayed: 0
    };
  });
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
        threePM: 0, threePA: 0, oreb: 0, dreb: 0, plusMinus: 0, fgm: 0, fga: 0, min: 0,
        possessions: 0
      }
    };
  });

  return validateAndFixRoster(agedRoster as Player[]);
};

export const generateFullBracket = (currentSave: GameSave): SeriesMatchup[] => {
  const bracket: SeriesMatchup[] = [];
  const conferences: ('East' | 'West')[] = ['East', 'West'];

  conferences.forEach(conf => {
    const teams = currentSave.standings
      .filter(t => t.conf === conf)
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 8);

    const matchups = [[0, 7], [3, 4], [1, 6], [2, 5]];
    
    matchups.forEach((pair, index) => {
      bracket.push({
        id: `${conf.charAt(0)}${index + 1}`,
        round: 1,
        highSeed: teams[pair[0]].city,
        lowSeed: teams[pair[1]].city,
        highSeedWins: 0,
        lowSeedWins: 0,
        isCompleted: false,
        conference: conf
      });
    });
  });
  return bracket;
};

export const calculateRank = (city: string, standings: any[]) => {
  if (!standings || standings.length === 0) return "15";
  const team = standings.find(t => t.city === city);
  if (!team) return "15";
  
  const confTeams = standings
    .filter(t => t.conf === team.conf)
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
    
  const index = confTeams.findIndex(t => t.city === city);
  return (index + 1).toString();
};

export const getTeamStrength = (city: string, standings: any[]) => {
  const teamData = standings.find(t => t.city === city);
  if (!teamData || !teamData.roster || teamData.roster.length === 0) return 75;

  const ratings = calculateTeamRatings(teamData.roster);
  return ratings.overall;
};

export const getHighSeedWinProb = (highSeed: string, lowSeed: string, standings: any[]) => {
  const highPower = getTeamStrength(highSeed, standings);
  const lowPower = getTeamStrength(lowSeed, standings);
  const highRank = parseInt(calculateRank(highSeed, standings));
  const lowRank = parseInt(calculateRank(lowSeed, standings));

  // Base 55% for higher seed (Home court + Closeness to top)
  // + 1% for each rank difference
  // + 1% for each OVR difference
  let prob = 0.55 + (highPower - lowPower) / 100 + (lowRank - highRank) * 0.01;
  return Math.max(0.2, Math.min(0.85, prob)); // Cap it between 20% and 85%
};

// --- DRAFT LOGIC ---

// Approx 2019 NBA Lottery Odds (Percentage for #1 pick)
const LOTTERY_ODDS = [140, 140, 140, 125, 105, 90, 75, 60, 45, 30, 20, 15, 10, 5];

export const generateDraftOrder = (save: GameSave): { fullOrder: string[], lotteryResults: LotteryResult[] } => {
  const standings = [...save.standings].sort((a, b) => a.wins - b.wins || b.losses - a.losses);
  
  // 1. Identify non-playoff teams (Bottom 14)
  const playoffTeamCities = new Set<string>();
  save.playoffBracket?.forEach(s => {
    playoffTeamCities.add(s.highSeed);
    playoffTeamCities.add(s.lowSeed);
  });

  const lotteryTeams = standings.filter(t => !playoffTeamCities.has(t.city)).slice(0, 14);
  const playoffTeams = standings.filter(t => playoffTeamCities.has(t.city));

  // 2. Run Lottery for top 4 picks
  const top4: string[] = [];
  const pool: string[] = [];
  
  lotteryTeams.forEach((team, index) => {
    const tickets = LOTTERY_ODDS[index] || 5;
    for (let i = 0; i < tickets; i++) pool.push(team.city);
  });

  while (top4.length < 4 && pool.length > 0) {
    const winner = pool[Math.floor(Math.random() * pool.length)];
    if (!top4.includes(winner)) {
      top4.push(winner);
    }
  }

  // 3. Combine with remaining teams
  const remainingLottery = lotteryTeams
    .filter(t => !top4.includes(t.city))
    .map(t => t.city);
    
  const lotteryOrder = [...top4, ...remainingLottery];
  
  const lotteryResults: LotteryResult[] = lotteryOrder.map((city, idx) => {
    const team = standings.find(t => t.city === city)!;
    const confStandings = standings
      .filter(t => t.conf === team.conf)
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
    const confRank = confStandings.findIndex(t => t.city === city) + 1;

    return {
      city,
      pick: idx + 1,
      rank: lotteryTeams.findIndex(t => t.city === city) + 1,
      conference: team.conf,
      confRank
    };
  });

  const playoffOrder = playoffTeams.map(t => t.city);
  const round1 = [...lotteryOrder, ...playoffOrder];
  const round2 = standings.map(t => t.city);

  return { 
    fullOrder: [...round1, ...round2], 
    lotteryResults 
  };
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

export const getLeagueLeadersData = (standings: TeamStanding[], currentSeason: number) => {
  const allPlayers: { player: Player, teamCity: string, teamWins: number, avgs: any }[] = [];
  
  standings.forEach(team => {
    team.roster.forEach(player => {
      const avgs = calculateSeasonAverages(player.stats);
      allPlayers.push({ player, teamCity: team.city, teamWins: team.wins, avgs });
    });
  });

  const getTop3 = (stat: string, isDescending: boolean = true) => {
    return [...allPlayers]
      .filter(p => Number(p.player.stats.gamesPlayed) > 0)
      .sort((a, b) => {
        const valA = Number(a.avgs[stat]);
        const valB = Number(b.avgs[stat]);
        return isDescending ? valB - valA : valA - valB;
      })
      .slice(0, 3);
  };

  // MVP Formula: PPG + RPG + APG + SPG + BPG - TOPG + (Team Wins * 0.2)
  const mvpRace = [...allPlayers]
    .filter(p => Number(p.player.stats.gamesPlayed) > 0)
    .map(p => {
      const score = Number(p.avgs.pts) + Number(p.avgs.reb) + Number(p.avgs.ast) + 
                    Number(p.avgs.stl) + Number(p.avgs.blk) - Number(p.avgs.tov) + 
                    (p.teamWins * 0.2);
      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // DPOY Formula: SPG * 2 + BPG * 2 + RPG
  const dpoyRace = [...allPlayers]
    .filter(p => Number(p.player.stats.gamesPlayed) > 0)
    .map(p => {
      const score = (Number(p.avgs.stl) * 2) + (Number(p.avgs.blk) * 2) + Number(p.avgs.reb);
      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // SMOY: Bench players (isStarter === false or gamesStarted < gamesPlayed / 2) sorted by MVP weighted score
  const smoyRace = [...allPlayers]
    .filter(p => Number(p.player.stats.gamesPlayed) > 0 && (!p.player.isStarter || p.player.stats.gamesStarted < p.player.stats.gamesPlayed / 2))
    .map(p => {
      const score = Number(p.avgs.pts) + Number(p.avgs.reb) + Number(p.avgs.ast) + 
                    Number(p.avgs.stl) + Number(p.avgs.blk) - Number(p.avgs.tov) + 
                    (p.teamWins * 0.2);
      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // ROTY: Rookies (isRookie === true) sorted by MVP score (only active after Season 1)
  const rotyRace = currentSeason >= 2 
    ? [...allPlayers]
        .filter(p => Number(p.player.stats.gamesPlayed) > 0 && p.player.isRookie)
        .map(p => {
          const score = Number(p.avgs.pts) + Number(p.avgs.reb) + Number(p.avgs.ast) + 
                        Number(p.avgs.stl) + Number(p.avgs.blk) - Number(p.avgs.tov);
          return { ...p, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : [];

  return {
    stats: {
      ppg: getTop3('pts'),
      rpg: getTop3('reb'),
      apg: getTop3('ast'),
      spg: getTop3('stl'),
      bpg: getTop3('blk'),
      topg: getTop3('tov')
    },
    awards: {
      mvp: mvpRace,
      dpoy: dpoyRace,
      smoy: smoyRace,
      roty: rotyRace
    }
  };
};

export interface TeamLeaderItem {
  city: string;
  value: string;
}

export interface TeamLeadersData {
  ppg: TeamLeaderItem[];
  rpg: TeamLeaderItem[];
  apg: TeamLeaderItem[];
  spg: TeamLeaderItem[];
  bpg: TeamLeaderItem[];
  topg: TeamLeaderItem[];
  fgPct: TeamLeaderItem[];
  threePct: TeamLeaderItem[];
}

export const getTeamLeadersData = (standings: TeamStanding[]): TeamLeadersData => {
  const teamStats = standings.map(t => {
    const teamTotals = t.roster.reduce((acc, p) => {
      acc.pts += Number(p.stats.pts || 0);
      acc.reb += Number(p.stats.reb || 0);
      acc.ast += Number(p.stats.ast || 0);
      acc.blk += Number(p.stats.blk || 0);
      acc.stl += Number(p.stats.stl || 0);
      acc.tov += Number(p.stats.tov || 0);
      acc.fgm += Number(p.stats.fgm || 0);
      acc.fga += Number(p.stats.fga || 0);
      acc.threePM += Number(p.stats.threePM || 0);
      acc.threePA += Number(p.stats.threePA || 0);
      acc.gp = Math.max(acc.gp, Number(p.stats.gamesPlayed || 0));
      return acc;
    }, { pts: 0, reb: 0, ast: 0, blk: 0, stl: 0, tov: 0, fgm: 0, fga: 0, threePM: 0, threePA: 0, gp: 0 });

    const gamesPlayed = t.gamesPlayed !== undefined ? Number(t.gamesPlayed) : teamTotals.gp;
    const totalPoints = t.totalPoints !== undefined ? Number(t.totalPoints) : teamTotals.pts;
    
    const ppgNum = gamesPlayed > 0 ? totalPoints / gamesPlayed : 0;
    const rpgNum = gamesPlayed > 0 ? teamTotals.reb / gamesPlayed : 0;
    const apgNum = gamesPlayed > 0 ? teamTotals.ast / gamesPlayed : 0;
    const spgNum = gamesPlayed > 0 ? teamTotals.stl / gamesPlayed : 0;
    const bpgNum = gamesPlayed > 0 ? teamTotals.blk / gamesPlayed : 0;
    const topgNum = gamesPlayed > 0 ? teamTotals.tov / gamesPlayed : 0;
    const fgPctNum = teamTotals.fga > 0 ? (teamTotals.fgm / teamTotals.fga) * 100 : 0;
    const threePctNum = teamTotals.threePA > 0 ? (teamTotals.threePM / teamTotals.threePA) * 100 : 0;
    const winsNum = t.wins;
    const lossesNum = t.losses;

    const ppgStr = gamesPlayed > 0 ? (totalPoints / gamesPlayed).toFixed(1) : '0.0';
    const rpgStr = gamesPlayed > 0 ? (teamTotals.reb / gamesPlayed).toFixed(1) : '0.0';
    const apgStr = gamesPlayed > 0 ? (teamTotals.ast / gamesPlayed).toFixed(1) : '0.0';
    const bpgStr = gamesPlayed > 0 ? (teamTotals.blk / gamesPlayed).toFixed(1) : '0.0';
    const topgStr = gamesPlayed > 0 ? (teamTotals.tov / gamesPlayed).toFixed(1) : '0.0';
    const spgStr = gamesPlayed > 0 ? (teamTotals.stl / gamesPlayed).toFixed(1) : '0.0';
    const fgPctStr = teamTotals.fga > 0 ? ((teamTotals.fgm / teamTotals.fga) * 100).toFixed(1) + '%' : '0.0%';
    const threePctStr = teamTotals.threePA > 0 ? ((teamTotals.threePM / teamTotals.threePA) * 100).toFixed(1) + '%' : '0.0%';
    const winsStr = String(t.wins);

    return {
      city: t.city,
      nums: {
        ppg: ppgNum,
        rpg: rpgNum,
        apg: apgNum,
        spg: spgNum,
        bpg: bpgNum,
        topg: topgNum,
        fgPct: fgPctNum,
        threePct: threePctNum,
        wins: winsNum,
        losses: lossesNum
      },
      strs: {
        ppg: ppgStr,
        rpg: rpgStr,
        apg: apgStr,
        spg: spgStr,
        bpg: bpgStr,
        topg: topgStr,
        fgPct: fgPctStr,
        threePct: threePctStr,
        wins: winsStr
      }
    };
  });

  const getTop3 = (key: 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'topg' | 'fgPct' | 'threePct'): TeamLeaderItem[] => {
    return [...teamStats]
      .sort((a, b) => b.nums[key] - a.nums[key])
      .slice(0, 3)
      .map(item => ({ city: item.city, value: item.strs[key] }));
  };

  return {
    ppg: getTop3('ppg'),
    rpg: getTop3('rpg'),
    apg: getTop3('apg'),
    spg: getTop3('spg'),
    bpg: getTop3('bpg'),
    topg: getTop3('topg'),
    fgPct: getTop3('fgPct'),
    threePct: getTop3('threePct')
  };
};

export const trimRosters = (standings: TeamStanding[]): TeamStanding[] => {
  return standings.map(team => {
    const trimmed = [...team.roster]
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 15);
    return { ...team, roster: trimmed };
  });
};



import { Player, SeasonAwards, GameSave, TeamStanding, AwardWinner } from '../types/save';
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

export const calculateAwards = (save: GameSave): SeasonAwards => {
  const allPlayers: { player: Player, teamCity: string, teamWins: number }[] = [];
  
  save.standings.forEach(team => {
    team.roster.forEach(p => {
      allPlayers.push({ player: p, teamCity: team.city, teamWins: team.wins });
    });
  });

  const getAvg = (p: Player, key: keyof typeof p.stats) => p.stats.gamesPlayed > 0 ? ((p.stats[key] || 0) as number) / p.stats.gamesPlayed : 0;

  // MVP Logic: Combined score (PTS+REB+AST+STL+BLK - TOV) weighted by team wins
  const mvp = allPlayers.sort((a, b) => {
    const scoreA = (getAvg(a.player, 'pts') + getAvg(a.player, 'reb') + getAvg(a.player, 'ast') + getAvg(a.player, 'stl') + getAvg(a.player, 'blk') - getAvg(a.player, 'tov')) * (1 + a.teamWins / 82);
    const scoreB = (getAvg(b.player, 'pts') + getAvg(b.player, 'reb') + getAvg(b.player, 'ast') + getAvg(b.player, 'stl') + getAvg(b.player, 'blk') - getAvg(b.player, 'tov')) * (1 + b.teamWins / 82);
    return scoreB - scoreA;
  })[0];

  // DPOY Logic: (STL + BLK + REB*0.2) + defense rating influence
  const dpoy = allPlayers.sort((a, b) => {
    const scoreA = (getAvg(a.player, 'stl') + getAvg(a.player, 'blk') + getAvg(a.player, 'reb') * 0.2) + (a.player.defense / 20);
    const scoreB = (getAvg(b.player, 'stl') + getAvg(b.player, 'blk') + getAvg(b.player, 'reb') * 0.2) + (b.player.defense / 20);
    return scoreB - scoreA;
  })[0];

  // ROTY Logic: Best stats among rookies
  const roty = allPlayers.filter(p => p.player.isRookie).sort((a, b) => {
    const scoreA = getAvg(a.player, 'pts') + getAvg(a.player, 'reb') + getAvg(a.player, 'ast');
    const scoreB = getAvg(b.player, 'pts') + getAvg(b.player, 'reb') + getAvg(b.player, 'ast');
    return scoreB - scoreA;
  })[0] || mvp; // Fallback if no rookies

  // 6MOTY Logic: Best stats among players who started < 50% of games
  const sixMan = allPlayers.filter(p => p.player.stats.gamesStarted < p.player.stats.gamesPlayed / 2).sort((a, b) => {
    const scoreA = getAvg(a.player, 'pts') + getAvg(a.player, 'reb') + getAvg(a.player, 'ast');
    const scoreB = getAvg(b.player, 'pts') + getAvg(b.player, 'reb') + getAvg(b.player, 'ast');
    return scoreB - scoreA;
  })[0] || allPlayers.sort((a, b) => b.player.overall - a.player.overall).find(p => !p.player.isStarter) || allPlayers[10];

  const createWinner = (p: any, value: number): AwardWinner => ({
    playerId: p.player.id,
    playerName: p.player.lastName,
    teamCity: p.teamCity,
    value: parseFloat(value.toFixed(1))
  });

  return {
    mvp: createWinner(mvp, (getAvg(mvp.player, 'pts') + getAvg(mvp.player, 'reb') + getAvg(mvp.player, 'ast'))),
    dpoy: createWinner(dpoy, (getAvg(dpoy.player, 'stl') + getAvg(dpoy.player, 'blk'))),
    roty: createWinner(roty, getAvg(roty.player, 'pts')),
    sixMan: createWinner(sixMan, getAvg(sixMan.player, 'pts')),
    ptsLeader: createWinner(allPlayers.sort((a, b) => getAvg(b.player, 'pts') - getAvg(a.player, 'pts'))[0], getAvg(allPlayers.sort((a, b) => getAvg(b.player, 'pts') - getAvg(a.player, 'pts'))[0].player, 'pts')),
    rebLeader: createWinner(allPlayers.sort((a, b) => getAvg(b.player, 'reb') - getAvg(a.player, 'reb'))[0], getAvg(allPlayers.sort((a, b) => getAvg(b.player, 'reb') - getAvg(a.player, 'reb'))[0].player, 'reb')),
    astLeader: createWinner(allPlayers.sort((a, b) => getAvg(b.player, 'ast') - getAvg(a.player, 'ast'))[0], getAvg(allPlayers.sort((a, b) => getAvg(b.player, 'ast') - getAvg(a.player, 'ast'))[0].player, 'ast')),
    stlLeader: createWinner(allPlayers.sort((a, b) => getAvg(b.player, 'stl') - getAvg(a.player, 'stl'))[0], getAvg(allPlayers.sort((a, b) => getAvg(b.player, 'stl') - getAvg(a.player, 'stl'))[0].player, 'stl')),
    blkLeader: createWinner(allPlayers.sort((a, b) => getAvg(b.player, 'blk') - getAvg(a.player, 'blk'))[0], getAvg(allPlayers.sort((a, b) => getAvg(b.player, 'blk') - getAvg(a.player, 'blk'))[0].player, 'blk')),
  };
};

export const generateInitialStandings = (): TeamStanding[] => {
  return ALL_CITIES.map((city, index) => ({
    city,
    conf: (index < 15 ? 'East' : 'West') as 'East' | 'West', // <--- CAST THIS HERE
    wins: 0,
    losses: 0,
    roster: generateRoster(city),
  }));
};

export const generateSchedule = (userCity: string): string[] => {
  const opponents = ALL_CITIES.filter(city => city !== userCity);
  let schedule: string[] = [];
  
  // Create 82 games by cycling through opponents
  for (let i = 0; i < 82; i++) {
    schedule.push(opponents[i % opponents.length]);
  }
  
  // Shuffle the schedule so it's not predictable
  return schedule.sort(() => Math.random() - 0.5);
};

export const processAging = (roster: Player[]): Player[] => {
  return roster.map(player => {
    let newAge = player.age + 1;
    let newOff = player.offense;
    let newDef = player.defense;

    // Progression (under 27)
    if (newAge < 27) {
      newOff += Math.floor(Math.random() * 4); // 0-3 gain
      newDef += Math.floor(Math.random() * 4);
    } 
    // Prime (27-31) - Small fluctuations
    else if (newAge >= 27 && newAge <= 31) {
      newOff += Math.floor(Math.random() * 3) - 1; // -1 to +1
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

    // Retirement (around 40)
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
      stats: { // Reset stats for next season
        gamesPlayed: 0, gamesStarted: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, 
        threePM: 0, oreb: 0, dreb: 0, plusMinus: 0, fgm: 0, fga: 0, min: 0
      }
    };
  });
};

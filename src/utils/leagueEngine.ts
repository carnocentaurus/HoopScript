import { Player, SeasonAwards, GameSave, TeamStanding, AwardWinner } from '../types/save';
import { generateRoster } from './rosterGenerator';
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
      gamesPlayed: player.stats.gamesPlayed + 1,
      gamesStarted: player.stats.gamesStarted + (player.isStarter ? 1 : 0),
      pts: player.stats.pts + stats.pts,
      reb: player.stats.reb + stats.reb,
      ast: player.stats.ast + stats.ast,
      stl: player.stats.stl + stats.stl,
      blk: player.stats.blk + stats.blk,
      fgm: player.stats.fgm + stats.fgm,
      fga: player.stats.fga + stats.fga,
      min: player.stats.min + stats.min,
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

  const getAvg = (p: Player, key: keyof typeof p.stats) => p.stats.gamesPlayed > 0 ? (p.stats[key] as number) / p.stats.gamesPlayed : 0;

  // MVP Logic: Combined score (PTS+REB+AST+STL+BLK) weighted by team wins
  const mvp = allPlayers.sort((a, b) => {
    const scoreA = (getAvg(a.player, 'pts') + getAvg(a.player, 'reb') + getAvg(a.player, 'ast') + getAvg(a.player, 'stl') + getAvg(a.player, 'blk')) * (1 + a.teamWins / 82);
    const scoreB = (getAvg(b.player, 'pts') + getAvg(b.player, 'reb') + getAvg(b.player, 'ast') + getAvg(b.player, 'stl') + getAvg(b.player, 'blk')) * (1 + b.teamWins / 82);
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
    roster: generateRoster(),
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
import { Player, GameSave } from '../types/save';

export interface GameResult {
  myScore: number;
  oppScore: number;
  otCount: number;
  myBestPlayer: PlayerStat;
  oppBestPlayer: PlayerStat;
  myTeamStats: PlayerStat[];
  oppTeamStats: PlayerStat[];
}

export interface PlayerStat {
  playerId: string;
  lastName: string;
  number: number;
  position: string;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  threePM: number;
  oreb: number;
  dreb: number;
  plusMinus: number;
  fgm: number;
  fga: number;
  overall: number;
}

export const randomNormal = (mean: number, stdDev: number): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
};

export const simulateGame = (myTeam: GameSave, opponent: any): GameResult => {
  const myStarters = myTeam.roster.filter(p => p.isStarter);
  const myRelevant = myStarters.length > 0 ? myStarters : myTeam.roster.slice(0, 5);
  const myOvr = myRelevant.reduce((sum, p) => sum + p.overall, 0) / myRelevant.length;

  const oppRoster = opponent.roster || [];
  const oppStarters = oppRoster.filter((p: any) => p.isStarter);
  const oppRelevant = oppStarters.length > 0 ? oppStarters : (oppRoster.length > 0 ? oppRoster.slice(0, 5) : []);
  const oppOvr = oppRelevant.length > 0
    ? oppRelevant.reduce((sum: number, p: any) => sum + p.overall, 0) / oppRelevant.length
    : 80;

  const ratingDiff = (myOvr - oppOvr) * 0.3;
  const myBase = 102 + ratingDiff;
  const oppBase = 102 - ratingDiff;

  let myScore = Math.round(randomNormal(myBase, 7));
  let oppScore = Math.round(randomNormal(oppBase, 7));

  myScore = Math.max(80, Math.min(125, myScore));
  oppScore = Math.max(80, Math.min(125, oppScore));

  let otCount = 0;
  while (myScore === oppScore) {
    otCount++;
    myScore += Math.round(randomNormal(7, 2));
    oppScore += Math.round(randomNormal(7, 2));
  }

  const teamMargin = myScore - oppScore;

  const myTeamStats = myRelevant.map((p: Player) => generatePlayerStats(p, myScore > oppScore, otCount, myScore, teamMargin));
  const oppTeamStats = oppRelevant.map((p: Player) => generatePlayerStats(p, oppScore > myScore, otCount, oppScore, -teamMargin));

  // Also include bench players in stats generation for a full box score
  const myBench = myTeam.roster.filter(p => !myRelevant.includes(p));
  const oppBench = oppRoster.filter((p: any) => !oppRelevant.includes(p));

  const myFullStats = [
    ...myTeamStats,
    ...myBench.map((p: Player) => generatePlayerStats(p, myScore > oppScore, otCount, myScore, teamMargin))
  ];
  const oppFullStats = [
    ...oppTeamStats,
    ...oppBench.map((p: Player) => generatePlayerStats(p, oppScore > myScore, otCount, oppScore, -teamMargin))
  ];

  myFullStats.sort((a, b) => b.pts - a.pts);
  oppFullStats.sort((a, b) => b.pts - a.pts);

  return {
    myScore,
    oppScore,
    otCount,
    myBestPlayer: myFullStats[0],
    oppBestPlayer: oppFullStats[0],
    myTeamStats: myFullStats,
    oppTeamStats: oppFullStats
  };
};

export const generatePlayerStats = (
  player: Player, 
  isWinner: boolean, 
  otCount: number, 
  teamScore: number = 100,
  teamMargin: number = 0
): PlayerStat => {
  const hFactor = player.heightFactor ?? 50;
  const sFactor = player.speedFactor ?? 50;
  const offRating = player.offense ?? 75;
  const defRating = player.defense ?? 75;

  const isStarter = player.isStarter;
  const minutesBudget = isStarter 
    ? Math.floor(randomNormal(32, 4)) + (otCount * 4)
    : Math.floor(randomNormal(12, 5));
  
  const min = Math.max(2, Math.min(minutesBudget, 48 + (otCount * 5)));
  const timeScale = min / 36;

  let baseFG = 0.42; 
  if (player.position === 'C') baseFG = 0.54;
  if (player.position === 'PF') baseFG = 0.48;
  
  const fgVariance = (Math.random() * 0.2) - 0.1; 
  const actualFG = baseFG + (offRating / 2000) + fgVariance;

  const scoreShare = (player.overall / 85) * timeScale * (isStarter ? 1.1 : 0.9);
  let pts = Math.floor(teamScore * (scoreShare / 5)) + Math.floor(Math.random() * 3);
  
  const ftm = Math.floor(Math.random() * (pts * 0.2));
  const remainingPts = pts - ftm;
  
  const threePointFreq = (player.position && player.position.includes('G')) ? 0.4 : 0.05;
  const threePM = Math.floor((remainingPts / 2.5) * threePointFreq);
  const estTwoPM = Math.floor((remainingPts - (threePM * 3)) / 2);
  
  const fgm = estTwoPM + threePM;
  const fga = Math.max(fgm + 1, Math.round(fgm / actualFG) + Math.floor(Math.random() * 3));

  const rebRate = (Math.sqrt(hFactor) / 35) + ((player.position === 'C') ? 0.1 : 0.02);
  const reb = Math.floor(min * rebRate + (Math.random() * 2));
  const oreb = Math.floor(reb * (0.2 + (Math.random() * 0.1)));
  const dreb = reb - oreb;

  const astRate = (Math.sqrt(sFactor) / 45) + ((player.position === 'PG') ? 0.12 : 0.01);
  const ast = Math.floor(min * astRate + (Math.random() * 2));

  // --- NEW STATS: STL, BLK, TOV ---
  // Steals: Speed and Defense driven. Guards get more.
  const posStlMod = (player.position && player.position.includes('G')) ? 0.045 : 0.025;
  const stlRate = posStlMod * (sFactor / 100) * (defRating / 75);
  const stl = Math.floor(min * stlRate + (Math.random() * 1.5));

  // Blocks: Height and Defense driven. Bigs get more.
  const posBlkMod = (player.position === 'C' || player.position === 'PF') ? 0.06 : 0.015;
  const blkRate = posBlkMod * (hFactor / 100) * (defRating / 75);
  const blk = Math.floor(min * blkRate + (Math.random() * 1.5));

  // Turnovers: Speed and Offense driven (high usage = more TOs). 
  // Ball handlers (PG) have higher base TO rate.
  const posTovMod = (player.position === 'PG') ? 0.08 : 0.05;
  const usageMod = (offRating / 75) * (pts / 20); // More points/usage usually means more TOs
  const tovRate = posTovMod * (1.5 - (offRating / 100)); // Better players have slightly lower TO rate per usage
  const tov = Math.max(0, Math.floor(min * tovRate * (1 + usageMod) + (Math.random() * 1.2)));

  // Plus Minus: Simplified based on team margin and player minutes
  const plusMinus = Math.round(teamMargin * (min / (48 + otCount * 5)) + (Math.random() * 4 - 2));

  return {
    playerId: player.id,
    lastName: player.lastName,
    number: player.number ?? 0,
    position: player.position,
    overall: player.overall ?? 75,
    min,
    pts: (estTwoPM * 2) + (threePM * 3) + ftm,
    reb,
    ast,
    stl,
    blk,
    tov,
    threePM,
    oreb,
    dreb,
    plusMinus,
    fgm,
    fga,
  };
};

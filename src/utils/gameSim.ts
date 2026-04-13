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
  const mySorted = [...myTeam.roster].sort((a, b) => b.overall - a.overall);
  const oppRoster = opponent.roster || [];
  const oppSorted = [...oppRoster].sort((a: any, b: any) => b.overall - a.overall);

  const myOvr = mySorted.slice(0, 8).reduce((sum, p) => sum + p.overall, 0) / 8;
  const oppOvr = oppSorted.length > 0
    ? oppSorted.slice(0, 8).reduce((sum: number, p: any) => sum + p.overall, 0) / 8
    : 80;

  const myBase = 110 + (myOvr - oppOvr);
  const oppBase = 110 + (oppOvr - myOvr);

  let myScore = Math.round(randomNormal(myBase, 10));
  let oppScore = Math.round(randomNormal(oppBase, 10));

  let otCount = 0;
  while (myScore === oppScore) {
    otCount++;
    const myOT = Math.round(randomNormal(9 + (myOvr - oppOvr) / 5, 2.5));
    const oppOT = Math.round(randomNormal(9 + (oppOvr - myOvr) / 5, 2.5));
    myScore += myOT;
    oppScore += oppOT;
    if (otCount > 4 && myScore === oppScore) {
      Math.random() > 0.5 ? myScore++ : oppScore++;
    }
  }

  const teamMargin = myScore - oppScore;

  const myTeamStats = mySorted.map(p => generatePlayerStats(p, myScore > oppScore, otCount, myScore, teamMargin));
  const oppTeamStats = oppSorted.map(p => generatePlayerStats(p, oppScore > myScore, otCount, oppScore, -teamMargin));

  myTeamStats.sort((a, b) => b.pts - a.pts);
  oppTeamStats.sort((a, b) => b.pts - a.pts);

  return {
    myScore,
    oppScore,
    otCount,
    myBestPlayer: myTeamStats[0],
    oppBestPlayer: oppTeamStats[0],
    myTeamStats,
    oppTeamStats
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
  
  const threePointFreq = player.position.includes('G') ? 0.4 : 0.05;
  const threePM = Math.floor((remainingPts / 2.5) * threePointFreq);
  const estTwoPM = Math.floor((remainingPts - (threePM * 3)) / 2);
  
  const fgm = estTwoPM + threePM;
  const fga = Math.max(fgm + 1, Math.round(fgm / actualFG) + Math.floor(Math.random() * 3));

  const rebRate = (Math.sqrt(hFactor) / 35) + (player.position === 'C' ? 0.1 : 0.02);
  const reb = Math.floor(min * rebRate + (Math.random() * 2));
  const oreb = Math.floor(reb * (0.2 + (Math.random() * 0.1)));
  const dreb = reb - oreb;

  const astRate = (Math.sqrt(sFactor) / 45) + (player.position === 'PG' ? 0.12 : 0.01);
  const ast = Math.floor(min * astRate + (Math.random() * 2));

  // --- NEW STATS: STL, BLK, TOV ---
  // Steals: Speed and Defense driven. Guards get more.
  const posStlMod = (player.position.includes('G')) ? 0.045 : 0.025;
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

import { Player, GameSave, OffensiveFocus, DefensiveFocus, Strategy } from '../types/save';
import { calculateTeamRatings } from './leagueEngine';

export const COUNTER_MATRIX: Record<OffensiveFocus, DefensiveFocus> = {
  [OffensiveFocus.ATTACK_PAINT]: DefensiveFocus.PROTECT_RIM,
  [OffensiveFocus.PACE_SPACE]: DefensiveFocus.PERIMETER_LOCK,
  [OffensiveFocus.ISO_STAR]: DefensiveFocus.DOUBLE_TEAM,
};

export interface GameResult {
  myScore: number;
  oppScore: number;
  otCount: number;
  myBestPlayer: PlayerStat;
  oppBestPlayer: PlayerStat;
  myTeamStats: PlayerStat[];
  oppTeamStats: PlayerStat[];
  quarterScores: { my: number, opp: number }[];
  counterResults: string[];
}

export interface PlayerStat {
  playerId: string;
  lastName: string;
  number: number;
  position: string;
  overall: number;
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
}

export const randomNormal = (mean: number, stdDev: number): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev + mean;
};

export const simulateGame = (
  myTeam: GameSave, 
  opponent: any, 
  myStrategy: Strategy, 
  oppStrategy: Strategy,
  myIQ: number = 60,
  oppIQ: number = 60
): GameResult => {
  const myRatings = calculateTeamRatings(myTeam.roster);
  const oppRoster = opponent.roster || [];
  const oppRatings = calculateTeamRatings(oppRoster);

  // Apply Counter Modifiers with Tactical Resilience
  // Base penalty is 15%. Each point of IQ reduces it slightly.
  // IQ 100 reduces penalty by 10% (from 15% down to 5%).
  const getPenalty = (iq: number) => 0.15 - ((iq / 100) * 0.10);
  
  let myMod = 1.0;
  let oppMod = 1.0;
  const counterResults: string[] = [];

  const myCountered = COUNTER_MATRIX[myStrategy.offense] === oppStrategy.defense;
  const oppCountered = COUNTER_MATRIX[oppStrategy.offense] === myStrategy.defense;

  if (myCountered) {
    const penalty = getPenalty(myIQ);
    myMod -= penalty;
    counterResults.push(`Opponent countered your ${myStrategy.offense} with ${oppStrategy.defense}. (Tactical hit: -${Math.round(penalty * 100)}%)`);
  } else {
    counterResults.push(`Your ${myStrategy.offense} found openings against their ${oppStrategy.defense}.`);
  }

  if (oppCountered) {
    const penalty = getPenalty(oppIQ);
    oppMod -= penalty;
    counterResults.push(`You successfully countered their ${oppStrategy.offense} with your ${myStrategy.defense}! (Impact: -${Math.round(penalty * 100)}%)`);
  } else {
    counterResults.push(`Opponent's ${oppStrategy.offense} challenged your ${myStrategy.defense}.`);
  }

  // Scouting Accuracy check if report exists
  if (myTeam.lastScoutReport && myTeam.lastScoutReport.city === opponent.city) {
    const s = myTeam.lastScoutReport;
    const accurateOff = s.predictedOffense === oppStrategy.offense;
    const accurateDef = s.predictedDefense === oppStrategy.defense;
    
    if (accurateOff && accurateDef) {
      counterResults.push("Your scouting report was 100% accurate.");
    } else if (accurateOff || accurateDef) {
      counterResults.push("Your scouting report was partially accurate.");
    } else {
      counterResults.push("The opponent coach completely changed their gameplan from our scouting report.");
    }
  }

  const myOvr = myRatings.overall * myMod;
  const oppOvr = oppRatings.overall * oppMod;

  const ratingDiff = (myOvr - oppOvr) * 0.6;
  const myBase = 102 + ratingDiff;
  const oppBase = 102 - ratingDiff;

  // Simulate by Quarters for Quarterly Adjustments logic
  const quarterScores: { my: number, opp: number }[] = [];
  let myTotal = 0;
  let oppTotal = 0;

  for (let q = 0; q < 4; q++) {
    const myQ = Math.round(randomNormal(myBase / 4, 4));
    const oppQ = Math.round(randomNormal(oppBase / 4, 4));
    myTotal += myQ;
    oppTotal += oppQ;
    quarterScores.push({ my: myQ, opp: oppQ });
  }

  let myScore = Math.max(80, Math.min(135, myTotal));
  let oppScore = Math.max(80, Math.min(135, oppTotal));

  let otCount = 0;
  while (myScore === oppScore) {
    otCount++;
    const myOT = Math.round(randomNormal(7, 2));
    const oppOT = Math.round(randomNormal(7, 2));
    myScore += myOT;
    oppScore += oppOT;
  }

  const teamMargin = myScore - oppScore;
  // ... (rest of stats generation remains same, but use updated scores)
  const myStarters = myTeam.roster.filter(p => p.isStarter);
  const myRelevant = myStarters.length > 0 ? myStarters : myTeam.roster.slice(0, 5);

  const oppStarters = oppRoster.filter((p: any) => p.isStarter);
  const oppRelevant = oppStarters.length > 0 ? oppStarters : (oppRoster.length > 0 ? oppRoster.slice(0, 5) : []);

  const myFullStats = myTeam.roster.map((p: Player) => generatePlayerStats(p, myScore > oppScore, otCount, myScore, teamMargin, myStrategy, oppStrategy, true));
  const oppFullStats = oppRoster.map((p: Player) => generatePlayerStats(p, oppScore > myScore, otCount, oppScore, -teamMargin, oppStrategy, myStrategy, false));

  myFullStats.sort((a, b) => b.pts - a.pts);
  oppFullStats.sort((a, b) => b.pts - a.pts);

  return {
    myScore,
    oppScore,
    otCount,
    myBestPlayer: myFullStats[0],
    oppBestPlayer: oppFullStats[0],
    myTeamStats: myFullStats,
    oppTeamStats: oppFullStats,
    quarterScores,
    counterResults
  };
};

export const generatePlayerStats = (
  player: Player, 
  isWinner: boolean, 
  otCount: number, 
  teamScore: number = 100,
  teamMargin: number = 0,
  ownStrategy: Strategy,
  oppStrategy: Strategy,
  isUser: boolean
): PlayerStat => {
  // ... (base values)
  const hFactor = player.heightFactor ?? 50;
  const sFactor = player.speedFactor ?? 50;
  const offRating = player.offense ?? 75;
  const defRating = player.defense ?? 75;

  // Strategic Modifiers on individual performance
  let efficiencyMod = 1.0;
  if (COUNTER_MATRIX[ownStrategy.offense] === oppStrategy.defense) {
    efficiencyMod -= 0.1;
  }

  // Focus specific boosts
  if (ownStrategy.offense === OffensiveFocus.ATTACK_PAINT && (player.position === 'C' || player.position === 'PF')) {
    efficiencyMod += 0.05;
  }
  if (ownStrategy.offense === OffensiveFocus.PACE_SPACE && (player.position.includes('G'))) {
    efficiencyMod += 0.05;
  }

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
  const actualFG = (baseFG + (offRating / 2000) + fgVariance) * efficiencyMod;

  const scoreShare = (player.overall / 85) * timeScale * (isStarter ? 1.1 : 0.9);
  let pts = Math.floor(teamScore * (scoreShare / 5)) + Math.floor(Math.random() * 3);
  
  const ftm = Math.floor(Math.random() * (pts * 0.2));
  const remainingPts = pts - ftm;
  
  const threePointFreq = (player.position && player.position.includes('G')) ? 0.4 : 0.05;
  const threePM = Math.floor((remainingPts / 2.5) * threePointFreq * (ownStrategy.offense === OffensiveFocus.PACE_SPACE ? 1.2 : 1.0));
  const estTwoPM = Math.floor((remainingPts - (threePM * 3)) / 2);
  
  const fgm = estTwoPM + threePM;
  const fga = Math.max(fgm + 1, Math.round(fgm / actualFG) + Math.floor(Math.random() * 3));

  const rebRate = (Math.sqrt(hFactor) / 35) + ((player.position === 'C') ? 0.1 : 0.02);
  const reb = Math.floor(min * rebRate + (Math.random() * 2));
  const oreb = Math.floor(reb * (0.2 + (Math.random() * 0.1)));
  const dreb = reb - oreb;

  const astRate = (Math.sqrt(sFactor) / 45) + ((player.position === 'PG') ? 0.12 : 0.01);
  const ast = Math.floor(min * astRate + (Math.random() * 2));

  const posStlMod = (player.position && player.position.includes('G')) ? 0.045 : 0.025;
  const stlRate = posStlMod * (sFactor / 100) * (defRating / 75);
  const stl = Math.floor(min * stlRate + (Math.random() * 1.5));

  const posBlkMod = (player.position === 'C' || player.position === 'PF') ? 0.06 : 0.015;
  const blkRate = posBlkMod * (hFactor / 100) * (defRating / 75);
  const blk = Math.floor(min * blkRate + (Math.random() * 1.5));

  const posTovMod = (player.position === 'PG') ? 0.08 : 0.05;
  const usageMod = (offRating / 75) * (pts / 20);
  const tovRate = posTovMod * (1.5 - (offRating / 100));
  const tov = Math.max(0, Math.floor(min * tovRate * (1 + usageMod) + (Math.random() * 1.2)));

  const plusMinus = Math.round(teamMargin * (min / (48 + otCount * 5)) + (Math.random() * 4 - 2));

  return {
    playerId: player.id,
    lastName: player.lastName,
    number: player.number ?? 0,
    position: player.position,
    overall: player.overall ?? 75,
    min, pts: (estTwoPM * 2) + (threePM * 3) + ftm,
    reb, ast, stl, blk, tov, threePM, oreb, dreb, plusMinus, fgm, fga,
  };
};

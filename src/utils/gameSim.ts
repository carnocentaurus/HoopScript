import { Player, GameSave, OffensiveFocus, DefensiveFocus, Strategy } from '../types/save';
import { calculateTeamRatings } from './leagueEngine';
import { randomNormal, weightedPlayerSelector, poissonCheck, shotSuccessCheck, getWeightedPlayer, getPositionalFGBias, POSITIONAL_PROFILES, identifyPOTG, calculateShotSuccessRate } from './statsMath';
import { calculateGameMinutes } from './rotationMath';

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
  myPOTGId: string;
  oppPOTGId: string;
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
  threePA: number;
  oreb: number;
  dreb: number;
  plusMinus: number;
  fgm: number;
  fga: number;
  possessions: number;
}

/**
 * Selects an active 5-man lineup based on minute-based probability.
 */
const getProbabilisticLineup = (roster: Player[], minuteMap: Record<string, number>): Player[] => {
  // Sort by minutes descending as a heuristic, then roll for eligibility
  const eligible = [...roster]
    .map(p => ({ p, prob: (minuteMap[p.id] || 0) / 48 }))
    .sort((a, b) => b.prob - a.prob);

  const lineup: Player[] = [];
  
  // High probability players (starters) get prioritized first
  for (const entry of eligible) {
    if (lineup.length < 5 && Math.random() < entry.prob) {
      lineup.push(entry.p);
    }
  }

  // Fill remaining slots if needed (fallback to guarantee 5)
  if (lineup.length < 5) {
    const remaining = eligible.filter(e => !lineup.find(lp => lp.id === e.p.id));
    for (const entry of remaining) {
      if (lineup.length < 5) lineup.push(entry.p);
    }
  }

  return lineup.slice(0, 5);
};

/**
 * Simulates a single possession in the game.
 * ONLY players in the active lineups can participate.
 */
const simulatePossession = (
  offLineup: Player[],
  defLineup: Player[],
  offStrategy: Strategy,
  defStrategy: Strategy,
  stats: Record<string, PlayerStat>,
  teamScore: { val: number },
  minuteMap: Record<string, number>,
  oppTeamDefRating: number,
  isClutchTime: boolean,
  pityMod: number = 1.0,
  focusFactor: number = 1.0
) => {
  // 1. Who Shoots? (Usage Rate * (Minutes / 48))
  const offPlayer = weightedPlayerSelector(offLineup, minuteMap);
  stats[offPlayer.id].possessions++;

  // 2. Turnover Check (Positional Weights)
  const tovPlayer = getWeightedPlayer(offLineup, 'TURNOVERS');
  if (poissonCheck((tovPlayer.tovRate || 12) / 100)) {
    stats[tovPlayer.id].tov++;
    // Check for Steal - Scale by defender's DEF rating
    const stealer = getWeightedPlayer(defLineup, 'STEALS');
    if (poissonCheck((stealer.defense * 0.02) / 100)) {
      stats[stealer.id].stl++;
    }
    return;
  }

  // 3. Determine Shot Type (2PT vs 3PT)
  const threeFreq = (POSITIONAL_PROFILES.THREE_PA[offPlayer.position] || 1.0) / 10;
  const isThreePointer = Math.random() < threeFreq;

  stats[offPlayer.id].fga++;
  if (isThreePointer) {
    stats[offPlayer.id].threePA++;
  }

  // Strategy & Positional Modifiers
  let tsMod = 1.0 * pityMod * focusFactor;
  let blkMod = 1.0;

  // Add Positional FG% Bias
  tsMod += getPositionalFGBias(offPlayer.position);

  if (COUNTER_MATRIX[offStrategy.offense] === defStrategy.defense) {
    tsMod -= 0.10;
  }

  if (defStrategy.defense === DefensiveFocus.PROTECT_RIM) {
    blkMod += 0.5;
    if (offStrategy.offense === OffensiveFocus.ATTACK_PAINT) tsMod -= 0.05;
  }

  // Block Check - Scale by defender's DEF rating
  const blocker = getWeightedPlayer(defLineup, 'BLOCKS');
  if (poissonCheck(((blocker.defense * 0.025) * blkMod) / 100)) {
    stats[blocker.id].blk++;
    return;
  }

  // Success Check - Rating-Driven Formula with Realism Logic
  let successProb = calculateShotSuccessRate(offPlayer.offense, isThreePointer, oppTeamDefRating);
  successProb *= tsMod;

  // Clutch Factor: 5% boost for 85+ OVR in final minutes
  if (isClutchTime && offPlayer.overall >= 85) {
    successProb *= 1.05;
  }

  if (shotSuccessCheck(successProb, 1.0)) {
    const points = isThreePointer ? 3 : 2;
    
    stats[offPlayer.id].pts += points;
    stats[offPlayer.id].fgm++;
    if (isThreePointer) {
      stats[offPlayer.id].threePM++;
    }
    teamScore.val += points;

    // Assist Check (~60% of shots are assisted, Positional Weights)
    if (Math.random() < 0.60) {
      const remainingOffense = offLineup.filter(p => p.id !== offPlayer.id);
      if (remainingOffense.length > 0) {
        const passer = getWeightedPlayer(remainingOffense, 'ASSISTS');
        stats[passer.id].ast++;
      }
    }
  } else {
    // Rebound Check (Positional Weights)
    const offRebProb = 0.25; 
    if (Math.random() < offRebProb) {
      const rebber = getWeightedPlayer(offLineup, 'REBOUNDING');
      stats[rebber.id].reb++;
      stats[rebber.id].oreb++;
    } else {
      const rebber = getWeightedPlayer(defLineup, 'REBOUNDING');
      stats[rebber.id].reb++;
      stats[rebber.id].dreb++;
    }
  }
};

const BASE_PACE = 102;

export const simulateGame = (
  myTeam: GameSave, 
  opponent: any, 
  myStrategy: Strategy, 
  oppStrategy: Strategy,
  myIQ: number = 60,
  oppIQ: number = 60
): GameResult => {
  const oppRoster = opponent.roster || [];
  const myRatings = calculateTeamRatings(myTeam.roster);
  const oppRatings = calculateTeamRatings(oppRoster);

  const myMinuteMap = calculateGameMinutes(myTeam.roster);
  const oppMinuteMap = calculateGameMinutes(oppRoster);

  const playerStats: Record<string, PlayerStat> = {};
  myTeam.roster.forEach(p => {
    playerStats[p.id] = {
      playerId: p.id, lastName: p.lastName, number: p.number, position: p.position,
      overall: p.overall, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0,
      threePM: 0, threePA: 0, oreb: 0, dreb: 0, plusMinus: 0, fgm: 0, fga: 0,
      min: myMinuteMap[p.id], possessions: 0
    };
  });
  oppRoster.forEach((p: any) => {
    playerStats[p.id] = {
      playerId: p.id, lastName: p.lastName, number: p.number, position: p.position,
      overall: p.overall, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0,
      threePM: 0, threePA: 0, oreb: 0, dreb: 0, plusMinus: 0, fgm: 0, fga: 0,
      min: oppMinuteMap[p.id], possessions: 0
    };
  });

  const myScore = { val: 0 };
  const oppScore = { val: 0 };

  const totalPossessions = BASE_PACE;

  let myPityMod = myRatings.offense < 75 ? 1.08 : 1.0;
  let oppPityMod = oppRatings.offense < 75 ? 1.08 : 1.0;
  
  let myFocusFactor = 1.0;
  let oppFocusFactor = 1.0;

  for (let i = 0; i < totalPossessions; i++) {
    // Participation Gate: Get active lineups for this possession
    const myLineup = getProbabilisticLineup(myTeam.roster, myMinuteMap);
    const oppLineup = getProbabilisticLineup(oppRoster, oppMinuteMap);

    // Scoring Floor Logic (Trending < 90 ORtg)
    if (i > 0 && i % 10 === 0) {
      const myProjected = (myScore.val / i) * totalPossessions;
      const oppProjected = (oppScore.val / i) * totalPossessions;
      if (myProjected < 80) myFocusFactor = 1.10;
      if (oppProjected < 80) oppFocusFactor = 1.10;
    }

    const isClutch = i >= totalPossessions - 10;

    simulatePossession(myLineup, oppLineup, myStrategy, oppStrategy, playerStats, myScore, myMinuteMap, oppRatings.defense, isClutch, myPityMod, myFocusFactor);
    simulatePossession(oppLineup, myLineup, oppStrategy, myStrategy, playerStats, oppScore, oppMinuteMap, myRatings.defense, isClutch, oppPityMod, oppFocusFactor);
  }

  const counterResults = [
    COUNTER_MATRIX[myStrategy.offense] === oppStrategy.defense ? `DEFENSIVE LOCK: Opponent's ${oppStrategy.defense} slowed your ${myStrategy.offense}.` : `OPEN LOOKS: Your ${myStrategy.offense} exploited their ${oppStrategy.defense}.`,
    COUNTER_MATRIX[oppStrategy.offense] === myStrategy.defense ? `STRATEGY WIN: You neutralized their ${oppStrategy.offense} with ${myStrategy.defense}!` : `CHALLENGE: Their ${oppStrategy.offense} broke through your ${myStrategy.defense}.`
  ];

  const myStats = myTeam.roster.map(p => playerStats[p.id]);
  const oppStats = oppRoster.map((p: any) => playerStats[p.id]);

  return {
    myScore: myScore.val,
    oppScore: oppScore.val,
    otCount: 0,
    myBestPlayer: [...myStats].sort((a, b) => b.pts - a.pts)[0],
    oppBestPlayer: [...oppStats].sort((a, b) => b.pts - a.pts)[0],
    myTeamStats: myStats,
    oppTeamStats: oppStats,
    myPOTGId: identifyPOTG(myStats),
    oppPOTGId: identifyPOTG(oppStats),
    quarterScores: [],
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
  return {
    playerId: player.id, lastName: player.lastName, number: player.number, position: player.position,
    overall: player.overall, min: 30, pts: 20, reb: 5, ast: 5, stl: 1, blk: 1, tov: 2,
    threePM: 2, threePA: 5, oreb: 1, dreb: 4, plusMinus: 0, fgm: 8, fga: 15, possessions: 100
  };
};

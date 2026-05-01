import { Player, GameSave, OffensiveFocus, DefensiveFocus, Strategy } from '../types/save';
import { calculateTeamRatings } from './leagueEngine';
import { randomNormal, weightedPlayerSelector, poissonCheck, shotSuccessCheck, getWeightedPlayer, getPositionalFGBias, POSITIONAL_PROFILES, identifyPOTG, calculateShotSuccessRate } from './statsMath';
import { calculateGameMinutes } from './rotationMath';
import { getNarrative } from './narrativeEngine';

export const COUNTER_MATRIX: Record<OffensiveFocus, DefensiveFocus> = {
  [OffensiveFocus.ATTACK_PAINT]: DefensiveFocus.PROTECT_RIM,
  [OffensiveFocus.PACE_SPACE]: DefensiveFocus.PERIMETER_LOCK,
  [OffensiveFocus.ISO_STAR]: DefensiveFocus.DOUBLE_TEAM,
};

export interface GameNarrative {
  analysisLines: string[];
}

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
  finalUserStrategy: Strategy;
  finalOppStrategy: Strategy;
  efficiencyDelta: number;
  wasUserCountered: boolean;
  wasOppCountered: boolean;
  gameNarrative: GameNarrative;
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
  // --- 1. TACTICAL PRE-PROCESSING ---
  
  // Find "The Star" for both teams (Highest OVR)
  const offStar = [...offLineup].sort((a, b) => b.overall - a.overall)[0];
  const defStar = [...defLineup].sort((a, b) => b.overall - a.overall)[0];

  // RPS Counter Logic
  const isCountered = COUNTER_MATRIX[offStrategy.offense] === defStrategy.defense;
  const isCountering = COUNTER_MATRIX[defStrategy.offense] === offStrategy.defense;
  
  let rpsEfficiencyMod = 1.0;
  if (isCountered) rpsEfficiencyMod = 0.90; // -10% Penalty
  else if (isCountering) rpsEfficiencyMod = 1.10; // +10% Bonus

  // --- 2. WHO SHOOTS? (Usage Selection) ---
  
  // Apply Iso-Star Usage Boost
  let activeMinuteMap = { ...minuteMap };
  if (offStrategy.offense === OffensiveFocus.ISO_STAR && offStar) {
    // Boost star's usage probability significantly
    activeMinuteMap[offStar.id] = (activeMinuteMap[offStar.id] || 20) * 1.25;
  }

  const offPlayer = weightedPlayerSelector(offLineup, activeMinuteMap);
  stats[offPlayer.id].possessions++;

  // --- 3. TURNOVER CHECK ---
  
  let tovProb = (offPlayer.tovRate || 12) / 100;
  
  // Defensive Suppression: Double Team targets the ball handler if they are the star
  if (defStrategy.defense === DefensiveFocus.DOUBLE_TEAM && offPlayer.id === offStar.id) {
    tovProb *= 1.15; // +15% Turnover rate
  }

  const tovPlayer = getWeightedPlayer(offLineup, 'TURNOVERS');
  if (poissonCheck(tovProb)) {
    stats[offPlayer.id].tov++; // Charge TO to the actual player with the ball
    
    const stealer = getWeightedPlayer(defLineup, 'STEALS');
    if (poissonCheck((stealer.defense * 0.02) / 100)) {
      stats[stealer.id].stl++;
    }
    return;
  }

  // --- 4. SHOT SELECTION ---
  
  let threeFreq = (POSITIONAL_PROFILES.THREE_PA[offPlayer.position] || 1.0) / 10;
  
  // Offensive Focus: Pace & Space (+25% 3PA for guards)
  if (offStrategy.offense === OffensiveFocus.PACE_SPACE && (offPlayer.position === 'PG' || offPlayer.position === 'SG')) {
    threeFreq *= 1.25;
  }
  // Offensive Focus: Attack Paint (PF/C shoot fewer 3s)
  if (offStrategy.offense === OffensiveFocus.ATTACK_PAINT && (offPlayer.position === 'PF' || offPlayer.position === 'C')) {
    threeFreq *= 0.7;
  }

  const isThreePointer = Math.random() < threeFreq;

  stats[offPlayer.id].fga++;
  if (isThreePointer) {
    stats[offPlayer.id].threePA++;
  }

  // --- 5. EFFICIENCY MODIFIERS ---
  
  let tsMod = 1.0 * pityMod * focusFactor * rpsEfficiencyMod;
  let blkMod = 1.0;

  // Defensive Suppression
  if (isThreePointer && defStrategy.defense === DefensiveFocus.PERIMETER_LOCK) {
    tsMod *= 0.85; // -15% Opponent 3P%
  }
  if (!isThreePointer && defStrategy.defense === DefensiveFocus.PROTECT_RIM) {
    tsMod *= 0.80; // -20% Opponent Finishing%
    blkMod *= 1.5;
  }
  if (defStrategy.defense === DefensiveFocus.DOUBLE_TEAM && offPlayer.id === offStar.id) {
    tsMod *= 0.75; // -25% Efficiency for Double Teamed Star
  }

  // Offensive Focus Penalties
  if (!isThreePointer && offStrategy.offense === OffensiveFocus.PACE_SPACE) {
    tsMod *= 0.90; // -10% Points in Paint for Pace & Space
  }

  // Positional Bias
  tsMod += getPositionalFGBias(offPlayer.position);

  // Block Check
  const blocker = getWeightedPlayer(defLineup, 'BLOCKS');
  if (poissonCheck(((blocker.defense * 0.025) * blkMod) / 100)) {
    stats[blocker.id].blk++;
    return;
  }

  // --- 6. SUCCESS CHECK ---
  
  let successProb = calculateShotSuccessRate(offPlayer.offense, isThreePointer, oppTeamDefRating);
  successProb *= tsMod;

  // Attack Paint Bonus: PF/C get a slight efficiency bump on 2s
  if (!isThreePointer && offStrategy.offense === OffensiveFocus.ATTACK_PAINT && (offPlayer.position === 'PF' || offPlayer.position === 'C')) {
    successProb *= 1.10;
  }

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

    // Assist Check
    if (Math.random() < 0.60) {
      const remainingOffense = offLineup.filter(p => p.id !== offPlayer.id);
      if (remainingOffense.length > 0) {
        const passer = getWeightedPlayer(remainingOffense, 'ASSISTS');
        stats[passer.id].ast++;
      }
    }
  } else {
    // Rebound Check
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
  userStrategy: Strategy, 
  cpuStrategy: Strategy,
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

  let currentMyStrategy = { ...userStrategy };
  let currentOppStrategy = { ...cpuStrategy };

  let totalCounterBonus = 0;
  let counteringPossessions = 0;

  for (let i = 0; i < totalPossessions; i++) {
    // MID-GAME ADJUSTMENT (Start of 3rd Quarter, approx possession 51)
    if (i === 51) {
      // User Coach Adjustment
      const myMargin = myScore.val - oppScore.val;
      if (myMargin <= -10 && (Math.random() * 100 < myIQ)) {
        currentMyStrategy.defense = COUNTER_MATRIX[currentOppStrategy.offense];
      }
      // Opponent Coach Adjustment
      const oppMargin = oppScore.val - myScore.val;
      if (oppMargin <= -10 && (Math.random() * 100 < oppIQ)) {
        currentOppStrategy.defense = COUNTER_MATRIX[currentMyStrategy.offense];
      }
    }

    // Participation Gate: Get active lineups for this possession
    const myLineup = getProbabilisticLineup(myTeam.roster, myMinuteMap);
    const oppLineup = getProbabilisticLineup(oppRoster, oppMinuteMap);

    // Scoring Floor Logic
    if (i > 0 && i % 10 === 0) {
      const myProjected = (myScore.val / i) * totalPossessions;
      const oppProjected = (oppScore.val / i) * totalPossessions;
      if (myProjected < 80) myFocusFactor = 1.10;
      if (oppProjected < 80) oppFocusFactor = 1.10;
    }

    const isClutch = i >= totalPossessions - 10;

    // Track strategy efficiency for delta
    if (COUNTER_MATRIX[currentMyStrategy.offense] === currentOppStrategy.defense) {
      totalCounterBonus -= 0.10;
    } else {
      totalCounterBonus += 0.05; // Small bonus for exploiting
    }
    counteringPossessions++;

    simulatePossession(myLineup, oppLineup, currentMyStrategy, currentOppStrategy, playerStats, myScore, myMinuteMap, oppRatings.defense, isClutch, myPityMod, myFocusFactor);
    simulatePossession(oppLineup, myLineup, currentOppStrategy, currentMyStrategy, playerStats, oppScore, oppMinuteMap, myRatings.defense, isClutch, oppPityMod, oppFocusFactor);
  }

  // --- OVERTIME LOGIC ---
  let otCount = 0;
  while (myScore.val === oppScore.val && otCount < 3) {
    otCount++;
    const otPossessions = 12; // Shorter period for OT
    for (let i = 0; i < otPossessions; i++) {
      const myLineup = getProbabilisticLineup(myTeam.roster, myMinuteMap);
      const oppLineup = getProbabilisticLineup(oppRoster, oppMinuteMap);
      simulatePossession(myLineup, oppLineup, currentMyStrategy, currentOppStrategy, playerStats, myScore, myMinuteMap, oppRatings.defense, true, myPityMod, myFocusFactor);
      simulatePossession(oppLineup, myLineup, currentOppStrategy, currentMyStrategy, playerStats, oppScore, oppMinuteMap, myRatings.defense, true, oppPityMod, focusFactor);
    }
  }

  // Force Tie-Breaker (No Ties Allowed)
  if (myScore.val === oppScore.val) {
    if (Math.random() > 0.5) {
      myScore.val += 2;
    } else {
      oppScore.val += 2;
    }
  }

  const efficiencyDelta = (totalCounterBonus / counteringPossessions) * 100;

  const wasUserCountered = COUNTER_MATRIX[currentMyStrategy.offense] === currentOppStrategy.defense;
  const wasOppCountered = COUNTER_MATRIX[currentOppStrategy.offense] === currentMyStrategy.defense;

  const counterResults = [
    wasUserCountered ? `TACTICAL LOSS: Opponent's ${currentOppStrategy.defense} neutralized your ${currentMyStrategy.offense}.` : `TACTICAL WIN: Your ${currentMyStrategy.offense} exploited their ${currentOppStrategy.defense}.`,
    wasOppCountered ? `DEFENSIVE LOCK: You neutralized their ${currentOppStrategy.offense} with ${currentMyStrategy.defense}!` : `DEFENSIVE HOLE: Their ${currentOppStrategy.offense} broke through your ${currentMyStrategy.defense}.`
  ];

  const myStats = myTeam.roster.map(p => playerStats[p.id]);
  const oppStats = oppRoster.map((p: any) => playerStats[p.id]);

  const userWon = myScore.val > oppScore.val;
  const tacticsSuccessful = efficiencyDelta > 0;
  
  // Calculate Team FG%
  const totalFGA = myStats.reduce((sum, p) => sum + p.fga, 0);
  const totalFGM = myStats.reduce((sum, p) => sum + p.fgm, 0);
  const fgPct = totalFGA > 0 ? (totalFGM / totalFGA) * 100 : 0;

  // Narrative Generation
  const { lossReason: autoLossReason } = getNarrative({
    userWon,
    tacticsSuccessful,
    coachIQ: myIQ,
    myScore: myScore.val,
    oppScore: oppScore.val
  });

  let lossReason = autoLossReason;

  const myBest = [...myStats].sort((a, b) => b.pts - a.pts)[0];
  const oppBest = [...oppStats].sort((a, b) => b.pts - a.pts)[0];

  if (!userWon) {
    if (tacticsSuccessful) {
      if (myRatings.overall < oppRatings.overall - 5) {
        lossReason = "The math worked, but their sheer talent was too much to overcome.";
      } else if (fgPct < 42) {
        lossReason = `You created the right looks, but the rims were unkind tonight (Final FG%: ${fgPct.toFixed(1)}%).`;
      } else {
        lossReason = "Crucial turnovers and missed opportunities at the stripe proved fatal.";
      }
    } else {
      lossReason = "A tactical adjustment is needed to counter their defensive pressure.";
    }
  }

  const gameNarrative: GameNarrative = {
    lossReason
  };

  return {
    myScore: myScore.val,
    oppScore: oppScore.val,
    otCount,
    myBestPlayer: myBest,
    oppBestPlayer: oppBest,
    myTeamStats: myStats,
    oppTeamStats: oppStats,
    myPOTGId: identifyPOTG(myStats),
    oppPOTGId: identifyPOTG(oppStats),
    quarterScores: [],
    counterResults,
    finalUserStrategy: currentMyStrategy,
    finalOppStrategy: currentOppStrategy,
    efficiencyDelta,
    wasUserCountered,
    wasOppCountered,
    gameNarrative
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

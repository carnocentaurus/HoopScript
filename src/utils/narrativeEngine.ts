import { Strategy, OffensiveFocus, DefensiveFocus } from '../types/save';

export type GameIntensity = 'clutch' | 'normal' | 'blowout';

export interface GameNarrative {
  analysisLines: string[];
  lossReason: string;
}

export interface NarrativeParams {
  userWon: boolean;
  tacticsSuccessful: boolean;
  coachIQ: number;
  myScore: number;
  oppScore: number;
}

export const getNarrative = (params: NarrativeParams): GameNarrative => {
  return { analysisLines: [], lossReason: "" };
};

export const getGameIntensity = (myPts: number, oppPts: number): GameIntensity => {
  const diff = Math.abs(myPts - oppPts);
  if (diff <= 5) return 'clutch';
  if (diff >= 10) return 'blowout'; // Updated from 15 to 10
  return 'normal';
};

export interface AnalysisParams {
  userWon: boolean;
  intensity: GameIntensity;
  userOffense: string;
  oppDefense: string;
  topScorer: { lastName: string, pts: number, fgm: number, fga: number, threePM: number, threePA: number };
  oppBestPlayer: { lastName: string, pts: number, fgm: number, fga: number, threePM: number, threePA: number };
  scoreDiff: number;
  isCountered: boolean;
  isCountering: boolean;
}

// Helper to grab a random line from a pool
const pick = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];

const TACTICAL_MAP: any = {
  OFFENSE: {
    [OffensiveFocus.ATTACK_PAINT]: { counteredBy: DefensiveFocus.PROTECT_RIM, exploits: DefensiveFocus.PERIMETER_LOCK },
    [OffensiveFocus.PACE_SPACE]: { counteredBy: DefensiveFocus.PERIMETER_LOCK, exploits: DefensiveFocus.DOUBLE_TEAM },
    [OffensiveFocus.ISO_STAR]: { counteredBy: DefensiveFocus.DOUBLE_TEAM, exploits: DefensiveFocus.PROTECT_RIM }
  }
};

/**
 * DETERMINES TACTICAL NARRATIVE WITH VARIATION
 */
export const getTacticalNarrative = (userOffense: string, oppDefense: string, starFG: number, starName: string): string => {
  const mapping = TACTICAL_MAP.OFFENSE[userOffense];
  
  const stalemates = [
    "Tactical Stalemate: Both teams played to their strengths, but neither side gained a clear schematic advantage.",
    "Gridlock: The tactical battle ended in a draw, forcing the players to win it on sheer talent.",
    "Matching Wits: Both coaching staffs anticipated the other's moves, resulting in a wash."
  ];

  if (!mapping) return pick(stalemates);

  if (oppDefense === mapping.counteredBy) {
    if (starFG > 55) {
      return pick([
        `Brute Force: They had the right scheme to stop your ${userOffense}, but ${starName} was simply too talented to be contained.`,
        `Skill Gap: Despite being tactically countered, ${starName} powered through their ${oppDefense} with elite shot-making.`,
        `Outplaying the Blueprint: The scheme was a failure, but ${starName} saved the day by ignoring the double-teams.`
      ]);
    }
    return pick([
      `Tactical Failure: Their ${oppDefense} successfully neutralized your ${userOffense}.`,
      `Out-Coached: We walked right into their ${oppDefense} and never found an answer.`,
      `System Shutdown: The coaching staff failed to adjust as the ${oppDefense} stifled our ${userOffense}.`
    ]);
  }

  if (oppDefense === mapping.exploits) {
    return pick([
      `Tactical Edge: Your ${userOffense} successfully exploited their ${oppDefense}.`,
      `Schematic Masterclass: We completely dismantled their ${oppDefense} by sticking to our ${userOffense} philosophy.`,
      `The Right Blueprint: Our scouts nailed it—their ${oppDefense} had no answer for our ${userOffense}.`
    ]);
  }

  return pick(stalemates);
};

/**
 * GENERATES DYNAMIC ANALYSIS
 */
export const getPostGameAnalysis = (params: AnalysisParams): string[] => {
  const { userWon, intensity, userOffense, oppDefense, topScorer, oppBestPlayer, scoreDiff } = params;
  const lines: string[] = [];

  const oppFGPercent = oppBestPlayer.fga > 0 ? (oppBestPlayer.fgm / oppBestPlayer.fga) * 100 : 0;
  const opp3PPercent = oppBestPlayer.threePA > 0 ? (oppBestPlayer.threePM / oppBestPlayer.threePA) * 100 : 0;
  const starFGPercent = topScorer.fga > 0 ? (topScorer.fgm / topScorer.fga) * 100 : 0;
  
  const isLockdown = oppFGPercent < 42 && opp3PPercent < 33;
  const isDefensiveBreach = oppFGPercent > 50;

  // 1. Tactical Reason
  lines.push(getTacticalNarrative(userOffense, oppDefense, starFGPercent, topScorer.lastName));

  // 2. Star Player Impact
  if (userWon) {
    lines.push(pick([
      `Maintained Pressure: ${topScorer.lastName} was the difference-maker, dropping ${topScorer.pts} points.`,
      `Leading the Charge: ${topScorer.lastName} took over when it mattered most, finishing with ${topScorer.pts} points.`,
      `Elite Execution: A dominant ${topScorer.pts}-point night from ${topScorer.lastName} secured the victory.`
    ]));
  } else {
    lines.push(pick([
      `${topScorer.lastName} carried the load with ${topScorer.pts} points, but we were outclassed as a unit.`,
      `Empty Stats: Despite ${topScorer.pts} points from ${topScorer.lastName}, the rest of the roster struggled to contribute.`,
      `Sole Provider: ${topScorer.lastName} gave us ${topScorer.pts} points, but we couldn't bridge the gap elsewhere.`
    ]));
  }

  // 3. Intensity/Differential
  if (intensity === 'clutch') {
    lines.push(pick([
      `Poise under pressure: ${userWon ? 'Winning' : 'Losing'} a ${scoreDiff}-point game came down to the final possessions.`,
      `Down to the Wire: This ${scoreDiff}-point nail-biter was decided by sheer mental toughness in the final minute.`,
      `Heart-Stopper: A grueling battle that ${userWon ? 'went our way' : 'slipped through our fingers'} by just ${scoreDiff} points.`
    ]));
  } else if (intensity === 'blowout') {
    if (userWon) {
      lines.push(pick([
        `Dominant performance: We maintained a ${scoreDiff}-point lead by dictating the pace.`,
        `Total Command: A ${scoreDiff}-point victory shows we were the superior team tonight.`,
        `Blowout: We overwhelmed them, finishing with a commanding ${scoreDiff}-point margin.`
      ]));
    } else {
      lines.push(pick([
        `Uphill battle: We conceded a ${scoreDiff}-point gap as they dictated the tempo.`,
        `Outclassed: We had no answer for their run, resulting in a ${scoreDiff}-point defeat.`,
        `System Collapse: A ${scoreDiff}-point loss points to a total breakdown in execution.`
      ]));
    }
  } else if (intensity === 'normal') {
    lines.push(pick([
      `Steady execution: A ${scoreDiff}-point margin reflected consistent play from both sides.`,
      `Controlled Finish: We ${userWon ? 'held them off' : 'were kept at bay'} for a ${scoreDiff}-point conclusion.`,
      `Consistent Gap: Neither team went on a major run, keeping the game within ${scoreDiff} points.`
    ]));
  }

  // 4. Defensive Result
  if (userWon) {
    if (isLockdown) {
      lines.push(pick([
        `Defensive Lockdown: Your scheme limited ${oppBestPlayer.lastName} to ${Math.round(oppFGPercent)}% shooting.`,
        `Clamped Down: ${oppBestPlayer.lastName} was in handcuffs tonight, finishing at a miserable ${Math.round(oppFGPercent)}%.`,
        `Defensive Masterclass: We took ${oppBestPlayer.lastName} completely out of the game.`
      ]));
    } else if (isDefensiveBreach) {
      lines.push(`Defensive Breach: Despite the win, ${oppBestPlayer.lastName} was an unstoppable force, shooting a clinical ${Math.round(oppFGPercent)}%.`);
    } else {
      lines.push(`Stifled Offense: We contained ${oppBestPlayer.lastName} just enough to secure the victory.`);
    }
  } else {
    if (isDefensiveBreach) {
      lines.push(`Defensive Breach: Despite the scheme, ${oppBestPlayer.lastName} was unstoppable, shooting a clinical ${Math.round(oppFGPercent)}%.`);
    } else {
      lines.push(`Deficit in Coverage: ${oppBestPlayer.lastName} found too many openings, finishing with ${oppBestPlayer.pts} points.`);
    }
  }

  return lines;
};
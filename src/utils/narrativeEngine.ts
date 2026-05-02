import { Strategy, OffensiveFocus, DefensiveFocus } from '../types/save';

export type GameIntensity = 'clutch' | 'normal' | 'blowout';

export interface NarrativeParams {
  userWon: boolean;
  tacticsSuccessful: boolean;
  coachIQ: number;
  myScore: number;
  oppScore: number;
  stats?: any;
}

export interface GameNarrative {
  analysisLines: string[];
  lossReason: string;
}

export const getGameIntensity = (myPts: number, oppPts: number): GameIntensity => {
  const diff = Math.abs(myPts - oppPts);
  if (diff <= 5) return 'clutch';
  if (diff >= 15) return 'blowout';
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

const TACTICAL_MAP: any = {
  OFFENSE: {
    [OffensiveFocus.ATTACK_PAINT]: { counteredBy: DefensiveFocus.PROTECT_RIM, exploits: DefensiveFocus.PERIMETER_LOCK },
    [OffensiveFocus.PACE_SPACE]: { counteredBy: DefensiveFocus.PERIMETER_LOCK, exploits: DefensiveFocus.DOUBLE_TEAM },
    [OffensiveFocus.ISO_STAR]: { counteredBy: DefensiveFocus.DOUBLE_TEAM, exploits: DefensiveFocus.PROTECT_RIM }
  }
};

/**
 * Determines the tactical narrative based on offense/defense matchup.
 */
export const getTacticalNarrative = (userOffense: string, oppDefense: string, starFG: number, starName: string): string => {
  const mapping = TACTICAL_MAP.OFFENSE[userOffense];
  if (!mapping) return "Tactical Stalemate: Both teams played to their strengths, but neither side gained a clear schematic advantage.";

  if (oppDefense === mapping.counteredBy) {
    if (starFG > 55) {
      return `Brute Force: They had the right scheme to stop your ${userOffense}, but ${starName} was simply too talented to be contained.`;
    }
    return `Tactical Failure: Their ${oppDefense} successfully neutralized your ${userOffense}.`;
  }

  if (oppDefense === mapping.exploits) {
    return `Tactical Edge: Your ${userOffense} successfully exploited their ${oppDefense}.`;
  }

  return `Tactical Stalemate: Both teams played to their strengths, but neither side gained a clear schematic advantage.`;
};

/**
 * Generates a multi-point analysis of why the game ended the way it did.
 */
export const getPostGameAnalysis = (params: AnalysisParams): string[] => {
  const { userWon, intensity, userOffense, oppDefense, topScorer, oppBestPlayer, scoreDiff, isCountered, isCountering } = params;
  const lines: string[] = [];

  const oppFGPercent = oppBestPlayer.fga > 0 ? (oppBestPlayer.fgm / oppBestPlayer.fga) * 100 : 0;
  const opp3PPercent = oppBestPlayer.threePA > 0 ? (oppBestPlayer.threePM / oppBestPlayer.threePA) * 100 : 0;
  const starFGPercent = topScorer.fga > 0 ? (topScorer.fgm / topScorer.fga) * 100 : 0;
  
  const isLockdown = oppFGPercent < 42 && opp3PPercent < 33;
  const isDefensiveBreach = oppFGPercent > 50;

  // 1. Tactical Reason (Governed by TACTICAL_MAP)
  lines.push(getTacticalNarrative(userOffense, oppDefense, starFGPercent, topScorer.lastName));

  // 2. Star Player Impact (Outcome Firewall)
  if (userWon) {
    lines.push(`Maintained Pressure: ${topScorer.lastName} was the difference-maker, dropping ${topScorer.pts} points on high efficiency.`);
  } else {
    lines.push(`${topScorer.lastName} carried the load with ${topScorer.pts} points, but we were outclassed as a unit.`);
  }

  // 3. Intensity/Differential (Outcome Firewall)
  if (intensity === 'clutch') {
    lines.push(`Poise under pressure: ${userWon ? 'Winning' : 'Losing'} a ${scoreDiff}-point game came down to the final possessions.`);
  } else if (intensity === 'blowout') {
    if (userWon) {
      lines.push(`Dominant performance: We maintained a ${scoreDiff}-point gap by controlling the tempo.`);
    } else {
      lines.push(`Uphill battle: We conceded a ${scoreDiff}-point gap as they dictated the tempo throughout.`);
    }
  } else {
    lines.push(`Steady execution: A ${scoreDiff}-point margin reflected ${userWon ? 'consistent play' : 'a struggle to bridge the gap'} across all four quarters.`);
  }

  // 4. Defensive Result (Efficiency Thresholds + Outcome Firewall)
  if (userWon) {
    if (isLockdown) {
      lines.push(`Defensive Lockdown: Your scheme limited their best player, ${oppBestPlayer.lastName}, to ${Math.round(oppFGPercent)}% shooting.`);
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

export const getNarrative = (params: NarrativeParams): GameNarrative => {
  return { analysisLines: [], lossReason: "" };
};

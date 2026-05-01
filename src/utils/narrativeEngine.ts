import { Strategy } from '../types/save';

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
  topScorer: { lastName: string, pts: number, fgm: number, fga: number };
  oppBestPlayer: { lastName: string, pts: number, fgm: number, fga: number };
  scoreDiff: number;
  isCountered: boolean;
  isCountering: boolean;
}

/**
 * Generates a multi-point analysis of why the game ended the way it did.
 */
export const getPostGameAnalysis = (params: AnalysisParams): string[] => {
  const { userWon, intensity, userOffense, oppDefense, topScorer, oppBestPlayer, scoreDiff, isCountered, isCountering } = params;
  const lines: string[] = [];

  // 1. Tactical Reason
  if (isCountering) {
    lines.push(`Tactical Edge: Your ${userOffense} strategy successfully exploited their ${oppDefense} defense.`);
  } else if (isCountered) {
    lines.push(`Tactical Loss: Your ${userOffense} was neutralized by their ${oppDefense} defense.`);
  } else {
    lines.push(`Tactical Stalemate: Both teams stuck to their schemes, but your ${userOffense} found enough room.`);
  }

  // 2. Star Player Impact
  if (userWon) {
    lines.push(`${topScorer.lastName} was the difference-maker, dropping ${topScorer.pts} points on high efficiency.`);
  } else {
    lines.push(`Despite ${topScorer.lastName}'s ${topScorer.pts} points, we couldn't overcome the opponent's momentum.`);
  }

  // 3. Intensity/Differential
  if (intensity === 'clutch') {
    lines.push(`Poise under pressure: ${userWon ? 'Winning' : 'Losing'} a ${scoreDiff}-point game came down to the final possessions.`);
  } else if (intensity === 'blowout') {
    lines.push(`Dominant performance: We ${userWon ? 'maintained' : 'allowed'} a ${scoreDiff}-point gap by controlling the tempo.`);
  } else {
    lines.push(`Steady execution: A ${scoreDiff}-point margin reflected consistent play across all four quarters.`);
  }

  // 4. Defensive Result
  const oppShooting = oppBestPlayer.fga > 0 ? Math.round((oppBestPlayer.fgm / oppBestPlayer.fga) * 100) : 0;
  if (userWon) {
    lines.push(`Defensive Lockdown: Your scheme limited their best player, ${oppBestPlayer.lastName}, to ${oppShooting}% shooting.`);
  } else {
    lines.push(`Defensive Hole: ${oppBestPlayer.lastName} broke through the coverage for ${oppBestPlayer.pts} points.`);
  }

  return lines;
};

export const getNarrative = (params: NarrativeParams): GameNarrative => {
  return { analysisLines: [] };
};

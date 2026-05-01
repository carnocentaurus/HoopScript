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
  lossReason?: string;
}

export const getGameIntensity = (myPts: number, oppPts: number): GameIntensity => {
  const diff = Math.abs(myPts - oppPts);
  if (diff <= 5) return 'clutch';
  if (diff >= 10) return 'blowout';
  return 'normal';
};

export const getNarrative = (params: NarrativeParams): GameNarrative => {
  return {};
};

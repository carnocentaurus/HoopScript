import { Player } from './rosterGenerator';

export interface GameResult {
  myScore: number;
  oppScore: number;
  myBestPlayer: PlayerStat;
  oppBestPlayer: PlayerStat;
}

export interface PlayerStat {
  lastName: string;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fgm: number;
  fga: number;
}

// Helper to generate a random stat line for a "Best Player"
export const generateBestPlayer = (lastName: string, isWinner: boolean): PlayerStat => {
  const pts = isWinner ? Math.floor(Math.random() * 15) + 20 : Math.floor(Math.random() * 10) + 15;
  const fga = Math.floor(pts / 2) + Math.floor(Math.random() * 5);
  return {
    lastName,
    min: Math.floor(Math.random() * 10) + 30,
    pts,
    reb: Math.floor(Math.random() * 12),
    ast: Math.floor(Math.random() * 10),
    stl: Math.floor(Math.random() * 4),
    blk: Math.floor(Math.random() * 3),
    fgm: Math.floor(fga * (Math.random() * 0.3 + 0.4)), // 40-70% FG
    fga,
  };
};
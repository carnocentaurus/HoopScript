import { Player } from './rosterGenerator';
import { GameSave } from '../types/save';

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

// 1. Box-Muller Transform: Generates numbers on a Bell Curve
const randomNormal = (mean: number, stdDev: number): number => {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
};

// 2. The Core Simulation Engine
export const simulateGame = (myTeam: GameSave, opponent: any): GameResult => {
  // Calculate Team OVR based on the top 8 players (rotation)
  const sortedRoster = [...myTeam.roster].sort((a, b) => b.rating - a.rating);
  const top8 = sortedRoster.slice(0, 8);
  const myOvr = top8.reduce((sum, p) => sum + p.rating, 0) / 8;
  
  // Dummy opponent OVR (we can make this dynamic later)
  const oppOvr = 82; 

  // Base score is 110. Better teams get a higher base average.
  const myBaseAverage = 110 + (myOvr - oppOvr);
  const oppBaseAverage = 110 + (oppOvr - myOvr);

  // Generate scores with a standard deviation of 10 points
  let myScore = Math.round(randomNormal(myBaseAverage, 10));
  let oppScore = Math.round(randomNormal(oppBaseAverage, 10));

  // Prevent ties (Overtime logic simplification)
  if (myScore === oppScore) {
    myScore += Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : 0;
    oppScore += myScore === oppScore ? Math.floor(Math.random() * 5) + 1 : 0;
  }

  const isMyWin = myScore > oppScore;

  // Generate Best Players
  const myBest = generateBestPlayer(sortedRoster[0].lastName, isMyWin);
  const oppBest = generateBestPlayer("Opponent", !isMyWin);

  return { myScore, oppScore, myBestPlayer: myBest, oppBestPlayer: oppBest };
};

// 3. Helper to generate a random stat line
export const generateBestPlayer = (lastName: string, isWinner: boolean): PlayerStat => {
  const pts = isWinner 
    ? Math.floor(Math.random() * 15) + 22 // Winners star scores 22-37
    : Math.floor(Math.random() * 10) + 18; // Losers star scores 18-28
  
  const fga = Math.floor(pts / 2) + Math.floor(Math.random() * 6);
  
  return {
    lastName,
    min: Math.floor(Math.random() * 8) + 32, // 32-40 mins
    pts,
    reb: Math.floor(Math.random() * 12),
    ast: Math.floor(Math.random() * 10),
    stl: Math.floor(Math.random() * 4),
    blk: Math.floor(Math.random() * 3),
    fgm: Math.floor(fga * (Math.random() * 0.2 + 0.45)), // 45-65% shooting
    fga,
  };
};
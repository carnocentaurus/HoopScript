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

const randomNormal = (mean: number, stdDev: number): number => {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
};

// Update: Pass the opponent object to access the city name
export const simulateGame = (myTeam: GameSave, opponent: any): GameResult => {
  const sortedRoster = [...myTeam.roster].sort((a, b) => b.rating - a.rating);
  const top8 = sortedRoster.slice(0, 8);
  const myOvr = top8.reduce((sum, p) => sum + p.rating, 0) / 8;
  
  // Later we can make this pull from the actual opponent's standing/strength
  const oppOvr = 82; 

  const myBaseAverage = 110 + (myOvr - oppOvr);
  const oppBaseAverage = 110 + (oppOvr - myOvr);

  let myScore = Math.round(randomNormal(myBaseAverage, 10));
  let oppScore = Math.round(randomNormal(oppBaseAverage, 10));

  if (myScore === oppScore) {
    myScore += Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : 0;
    oppScore += myScore === oppScore ? Math.floor(Math.random() * 5) + 1 : 0;
  }

  const isMyWin = myScore > oppScore;

  // Generate Best Players
  // myBest uses the top rated player from your generated roster
  const myBest = generateBestPlayer(sortedRoster[0].lastName, isMyWin);
  
  // oppBest now uses the opponent's city name (e.g., "Chicago Star")
  const oppName = opponent.city ? `${opponent.city} Star` : "Opponent";
  const oppBest = generateBestPlayer(oppName, !isMyWin);

  return { myScore, oppScore, myBestPlayer: myBest, oppBestPlayer: oppBest };
};

export const generateBestPlayer = (lastName: string, isWinner: boolean): PlayerStat => {
  const pts = isWinner 
    ? Math.floor(Math.random() * 15) + 22 
    : Math.floor(Math.random() * 10) + 18;
  
  const fga = Math.floor(pts / 2) + Math.floor(Math.random() * 6);
  
  return {
    lastName,
    min: Math.floor(Math.random() * 8) + 32,
    pts,
    reb: Math.floor(Math.random() * 12),
    ast: Math.floor(Math.random() * 10),
    stl: Math.floor(Math.random() * 4),
    blk: Math.floor(Math.random() * 3),
    fgm: Math.floor(fga * (Math.random() * 0.2 + 0.45)),
    fga,
  };
};
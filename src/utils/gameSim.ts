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

/**
 * @param myTeam The User's Save data
 * @param opponent The opponent object from the standings (including their unique roster)
 */

export const simulateGame = (myTeam: GameSave, opponent: any): GameResult => {
  // 1. Process My Team
  const mySorted = [...myTeam.roster].sort((a, b) => b.rating - a.rating);
  const myOvr = mySorted.slice(0, 8).reduce((sum, p) => sum + p.rating, 0) / 8;
  
  // 2. Process Opponent Team (Accessing the roster we just added to standings)
  const oppRoster = opponent.roster || [];
  const oppSorted = [...oppRoster].sort((a: any, b: any) => b.rating - a.rating);
  
  const oppOvr = oppSorted.length > 0
    ? oppSorted.slice(0, 8).reduce((sum: number, p: any) => sum + p.rating, 0) / 8
    : 80; 

  // 3. Score Engine (Bell Curve)
  const myBase = 110 + (myOvr - oppOvr);
  const oppBase = 110 + (oppOvr - myOvr);
  let myScore = Math.round(randomNormal(myBase, 10));
  let oppScore = Math.round(randomNormal(oppBase, 10));

  // 4. "Player of the Game" Logic (Randomness)
  // Instead of always index 0, we give the top 3 players a chance to be the star
  const getTopPerformer = (roster: any[]) => {
    if (roster.length === 0) return "Unknown";
    const roll = Math.random();
    if (roll > 0.4) return roster[0].lastName; // 60% chance it's the #1 star
    if (roll > 0.1) return roster[1]?.lastName || roster[0].lastName; // 30% chance it's the #2 guy
    return roster[2]?.lastName || roster[0].lastName; // 10% chance for the #3 guy
  };

  const isMyWin = myScore > oppScore;
  const myBest = generateBestPlayer(getTopPerformer(mySorted), isMyWin);
  
  // Fallback for names if roster is missing (only happens if storage isn't wiped)
  const oppName = oppSorted.length > 0 
    ? getTopPerformer(oppSorted) 
    : `${opponent.city} Star`;

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
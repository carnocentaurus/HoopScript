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
  number: number;
  position: string;
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
  const mySorted = [...myTeam.roster].sort((a, b) => b.rating - a.rating);
  const oppRoster = opponent.roster || [];
  const oppSorted = [...oppRoster].sort((a: any, b: any) => b.rating - a.rating);

  const myOvr = mySorted.slice(0, 8).reduce((sum, p) => sum + p.rating, 0) / 8;
  const oppOvr = oppSorted.length > 0
    ? oppSorted.slice(0, 8).reduce((sum: number, p: any) => sum + p.rating, 0) / 8
    : 80;

  const myBase = 110 + (myOvr - oppOvr);
  const oppBase = 110 + (oppOvr - myOvr);

  let myScore = Math.round(randomNormal(myBase, 10));
  let oppScore = Math.round(randomNormal(oppBase, 10));

  // --- OVERTIME LOGIC ---
  let otCount = 0;
  while (myScore === oppScore) {
    otCount++;
    // Simulate a 5-minute OT period (lower scores)
    myScore += Math.round(randomNormal(10 + (myOvr - oppOvr), 4));
    oppScore += Math.round(randomNormal(10 + (oppOvr - myOvr), 4));
    
    // Safety check to prevent infinite loops (rare but possible in sims)
    if (otCount > 10) {
        myScore > oppScore ? myScore++ : oppScore++;
    }
  }

  const getTopPerformer = (roster: Player[]) => {
    if (!roster || roster.length === 0) return null;
    const roll = Math.random();
    if (roll > 0.4) return roster[0];
    if (roll > 0.1) return roster[1] || roster[0];
    return roster[2] || roster[0];
  };

  const myWinner = getTopPerformer(mySorted);
  const oppWinner = getTopPerformer(oppSorted);

  return {
    myScore,
    oppScore,
    myBestPlayer: generateBestPlayer(myWinner!, myScore > oppScore, otCount),
    oppBestPlayer: generateBestPlayer(oppWinner!, oppScore > myScore, otCount)
  };
};

export const generateBestPlayer = (player: Player, isWinner: boolean, otCount: number): PlayerStat => {
  // Boost stats slightly if there was overtime
  const otBoost = otCount * 5;
  const pts = (isWinner ? Math.floor(Math.random() * 15) + 22 : Math.floor(Math.random() * 10) + 18) + (otCount * 2);
  
  const fga = Math.floor(pts / 2) + Math.floor(Math.random() * 6);
  
  return {
    lastName: player.lastName,
    number: player.number,
    position: player.position,
    min: Math.floor(Math.random() * 8) + 32 + (otCount * 5),
    pts,
    reb: Math.floor(Math.random() * 12) + Math.floor(otCount * 1.5),
    ast: Math.floor(Math.random() * 10) + Math.floor(otCount * 1.2),
    stl: Math.floor(Math.random() * 4),
    blk: Math.floor(Math.random() * 3),
    fgm: Math.floor(fga * (Math.random() * 0.2 + 0.45)),
    fga,
  };
};
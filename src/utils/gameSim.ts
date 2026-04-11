import { Player, GameSave } from '../types/save';

export interface GameResult {
  myScore: number;
  oppScore: number;
  otCount: number; // New field
  myBestPlayer: PlayerStat;
  oppBestPlayer: PlayerStat;
  myTeamStats: PlayerStat[];
  oppTeamStats: PlayerStat[];
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
  overall: number;
}

const randomNormal = (mean: number, stdDev: number): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
};

export const simulateGame = (myTeam: GameSave, opponent: any): GameResult => {
  const mySorted = [...myTeam.roster].sort((a, b) => b.overall - a.overall);
  const oppRoster = opponent.roster || [];
  const oppSorted = [...oppRoster].sort((a: any, b: any) => b.overall - a.overall);

  const myOvr = mySorted.slice(0, 8).reduce((sum, p) => sum + p.overall, 0) / 8;
  const oppOvr = oppSorted.length > 0
    ? oppSorted.slice(0, 8).reduce((sum: number, p: any) => sum + p.overall, 0) / 8
    : 80;

  const myBase = 110 + (myOvr - oppOvr);
  const oppBase = 110 + (oppOvr - myOvr);

  let myScore = Math.round(randomNormal(myBase, 10));
  let oppScore = Math.round(randomNormal(oppBase, 10));

  // --- REFINED OVERTIME LOGIC ---
  let otCount = 0;
  while (myScore === oppScore) {
    otCount++;
    
    // We use a much smaller standard deviation (2.5) for OT.
    // This keeps the game tight and prevents 20-point blowouts in a 5-min period.
    const myOT = Math.round(randomNormal(9 + (myOvr - oppOvr) / 5, 2.5));
    const oppOT = Math.round(randomNormal(9 + (oppOvr - myOvr) / 5, 2.5));
    
    myScore += myOT;
    oppScore += oppOT;

    // Safety: If still tied after 4 OTs, force a 1-point win to avoid infinite loops
    if (otCount > 4 && myScore === oppScore) {
      Math.random() > 0.5 ? myScore++ : oppScore++;
    }
  }

  // 1. Simulate Full Team Stats
  // Passes the exact otCount so generateBestPlayer can scale Minutes (MIN) correctly
  const myTeamStats = mySorted.map(p => generateBestPlayer(p, myScore > oppScore, otCount, myScore));
  const oppTeamStats = oppSorted.map(p => generateBestPlayer(p, oppScore > myScore, otCount, oppScore));

  // 2. Sort by points for the box score view
  myTeamStats.sort((a, b) => b.pts - a.pts);
  oppTeamStats.sort((a, b) => b.pts - a.pts);

  return {
    myScore,
    oppScore,
    otCount, // Now returning the specific count (1, 2, 3...)
    myBestPlayer: myTeamStats[0],
    oppBestPlayer: oppTeamStats[0],
    myTeamStats,
    oppTeamStats
  };
};

export const generateBestPlayer = (
  player: Player, 
  isWinner: boolean, 
  otCount: number, 
  teamScore: number = 100
): PlayerStat => {
  const hFactor = player.heightFactor ?? 50;
  const sFactor = player.speedFactor ?? 50;
  const offRating = player.offense ?? 75;

  // 1. ALLOCATE MINUTES (Total game is 48 mins + 5 per OT)
  // Starters: 28-38 mins | Bench: 5-18 mins
  const isStarter = player.isStarter;
  const minutesBudget = isStarter 
    ? Math.floor(randomNormal(32, 4)) + (otCount * 4)
    : Math.floor(randomNormal(12, 5));
  
  // Hard caps for realism
  const min = Math.max(2, Math.min(minutesBudget, 48 + (otCount * 5)));

  // 2. SCALE FACTOR (Minutes / 36)
  // This ensures stats are proportional to time on court
  const timeScale = min / 36;

  // 3. SCORING SHARE (Weighted by OVR and Minutes)
  const scoreShare = (player.overall / 85) * timeScale * (isStarter ? 1.1 : 0.9);
  let pts = Math.floor(teamScore * (scoreShare / 5)) + Math.floor(Math.random() * 3);
  
  // 4. FIELD GOAL LOGIC (Tied to PTS)
  const threePM = (player.position.includes('G')) ? Math.floor(pts * 0.35 / 3) : Math.floor(pts * 0.1 / 3);
  const ftm = Math.floor(pts * 0.2);
  const fgm = Math.max(0, Math.floor((pts - (threePM * 3) - ftm) / 2) + threePM);
  const fga = Math.max(fgm, Math.floor(fgm / (0.4 + (offRating / 1000))));

  // 5. PER-MINUTE REBOUNDS (Height + Position + Minutes)
  // A Center with 90 heightFactor gets ~0.35 reb per minute
  const rebRate = (hFactor / 300) + (player.position === 'C' ? 0.15 : 0.05);
  const reb = Math.floor(min * rebRate + (Math.random() * 3));

  // 6. PER-MINUTE ASSISTS (Speed + Position + Minutes)
  // A PG with 90 speedFactor gets ~0.25 ast per minute
  const astRate = (sFactor / 400) + (player.position === 'PG' ? 0.18 : 0.02);
  const ast = Math.floor(min * astRate + (Math.random() * 2));

  // 7. DEFENSIVE STATS
  const stl = Math.floor((min * 0.04) * (sFactor / 100) + (Math.random() * 1.5));
  const blk = Math.floor((min * 0.04) * (hFactor / 100) + (Math.random() * 1.5));

  return {
    lastName: player.lastName,
    number: player.number ?? 0,
    position: player.position,
    overall: player.overall ?? 75,
    min,
    pts: Math.max(0, pts),
    reb: Math.max(0, reb),
    ast: Math.max(0, ast),
    stl,
    blk,
    fgm,
    fga,
  };
};
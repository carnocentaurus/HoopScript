import { Player } from '../types/save';

/**
 * Generates a random number following a Normal (Gaussian) distribution.
 */
export const randomNormal = (mean: number, stdDev: number): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev + mean;
};

/**
 * Poisson-style probability check.
 */
export const poissonCheck = (probability: number): boolean => {
  return Math.random() < probability;
};

/**
 * Normal distribution check for shot success.
 */
export const shotSuccessCheck = (trueShootingPct: number, strategyMod: number = 1.0): boolean => {
  const baseProb = trueShootingPct * strategyMod;
  const actualProb = randomNormal(baseProb, 0.05);
  return Math.random() < actualProb;
};

export type StatType = 'REBOUNDING' | 'ASSISTS' | 'BLOCKS' | 'STEALS' | 'TURNOVERS' | 'THREE_PA' | 'VOLUME';

export const POSITIONAL_PROFILES: Record<StatType, Record<string, number>> = {
  REBOUNDING: { C: 4.5, PF: 3.5, SF: 1.2, SG: 0.6, PG: 0.4 },
  ASSISTS: { PG: 5.0, SG: 2.2, SF: 1.5, PF: 0.8, C: 0.5 },
  STEALS: { PG: 2.5, SG: 2.0, SF: 1.5, PF: 0.8, C: 0.6 },
  BLOCKS: { C: 5.0, PF: 3.2, SF: 1.2, SG: 0.3, PG: 0.1 },
  TURNOVERS: { PG: 3.0, SG: 2.0, SF: 1.5, PF: 1.0, C: 0.9 },
  THREE_PA: { PG: 4.0, SG: 3.5, SF: 2.0, PF: 0.5, C: 0.1 },
  VOLUME: { PG: 1.2, SG: 1.1, SF: 1.0, PF: 0.9, C: 0.8 }
};

const FG_BIAS: Record<string, number> = {
  C: 0.08, PF: 0.04, SF: 0.0, SG: -0.02, PG: -0.04
};

/**
 * Selects a player based on positional weights and overall rating.
 */
export const getWeightedPlayer = (players: Player[], statType: StatType): Player => {
  const weights = POSITIONAL_PROFILES[statType];
  
  const totalWeight = players.reduce((sum, p) => {
    const posWeight = weights[p.position] || 1.0;
    return sum + (posWeight * (p.overall / 70));
  }, 0);

  if (totalWeight <= 0) return players[Math.floor(Math.random() * players.length)];

  let roll = Math.random() * totalWeight;
  for (const player of players) {
    const pWeight = (weights[player.position] || 1.0) * (player.overall / 70);
    roll -= pWeight;
    if (roll <= 0) return player;
  }

  return players[0];
};

/**
 * Gets the FG percentage bias for a position.
 */
export const getPositionalFGBias = (position: string): number => {
  return FG_BIAS[position] || 0;
};

/**
 * Weighted selector for identifying which player takes an action (e.g., a shot).
 * Uses the player's usgRate combined with positional volume and minute scaling.
 */
export const weightedPlayerSelector = (players: Player[], playerMinutes: Record<string, number>): Player => {
  const volWeights = POSITIONAL_PROFILES['VOLUME'];
  const totalWeight = players.reduce((sum, p) => {
    const volMod = volWeights[p.position] || 1.0;
    const minMod = (playerMinutes[p.id] || 0) / 48; // Scale by minutes played
    return sum + ((p.usgRate || 20) * volMod * minMod);
  }, 0);
  
  if (totalWeight <= 0) return players[Math.floor(Math.random() * players.length)];

  let roll = Math.random() * totalWeight;
  
  for (const player of players) {
    const volMod = volWeights[player.position] || 1.0;
    const minMod = (playerMinutes[player.id] || 0) / 48;
    roll -= ((player.usgRate || 20) * volMod * minMod);
    if (roll <= 0) return player;
  }
  
  return players[0];
};

/**
 * Calculates the Hollinger Game Score for a player based on their game stats.
 * Formula: PTS + (0.4 * FG) - (0.7 * FGA) + (0.5 * REB) + (0.7 * AST) + STL + (0.7 * BLK) - TOV.
 */
export const calculateGameScore = (stats: {
  pts: number;
  fgm: number;
  fga: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
}): number => {
  return (
    stats.pts +
    (0.4 * stats.fgm) -
    (0.7 * stats.fga) +
    (0.5 * stats.reb) +
    (0.7 * stats.ast) +
    stats.stl +
    (0.7 * stats.blk) -
    stats.tov
  );
};

/**
 * Identifies the Player of the Game (POTG) from a team's roster based on Game Score.
 */
export const identifyPOTG = (teamStats: any[]): string => {
  if (!teamStats || teamStats.length === 0) return "";
  
  let bestScore = -Infinity;
  let potgId = "";

  teamStats.forEach(p => {
    const score = calculateGameScore(p);
    if (score > bestScore) {
      bestScore = score;
      potgId = p.playerId || p.id;
    }
  });

  return potgId;
};


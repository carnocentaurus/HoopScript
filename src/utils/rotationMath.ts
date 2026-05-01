import { Player } from '../types/save';

/**
 * Calculates a weighted rotation for bench players based on their rank (OVR).
 */
export const getBenchRotation = (
  bench: Player[], 
  totalBenchMinutes: number, 
  lowestStarterMins: number, 
  lowestStarterOVR: number
): Record<string, number> => {
  if (bench.length === 0) return {};

  const result: Record<string, number> = {};
  
  // Rank weights as requested: 10, 7, 5, 3, 1...
  const getRankWeight = (rank: number) => {
    if (rank === 0) return 10; // Sixth Man
    if (rank === 1) return 7;
    if (rank === 2) return 5;
    if (rank === 3) return 3;
    return 1; // Deep bench
  };

  const sortedBench = [...bench].sort((a, b) => b.overall - a.overall);
  const weights = sortedBench.map((_, i) => getRankWeight(i));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let minsRemaining = totalBenchMinutes;

  sortedBench.forEach((p, i) => {
    if (i === sortedBench.length - 1) {
      result[p.id] = Math.max(0, minsRemaining);
    } else {
      const rawWeight = weights[i] / totalWeight;
      let allocated = totalBenchMinutes * rawWeight;

      // Constraint: Do not exceed lowest starter unless OVR is higher
      if (p.overall <= lowestStarterOVR) {
        allocated = Math.min(allocated, lowestStarterMins);
      }

      result[p.id] = allocated;
      minsRemaining -= allocated;
    }
  });

  return result;
};

/**
 * Calculates dynamic minute distribution for a team's roster.
 * Total Minutes = 240.
 * Starters (1-5) = 151.2 Mins (distributed by OVR weight).
 * Bench (6+) = 88.8 Mins (distributed by Rank weight).
 */
export const calculateGameMinutes = (roster: Player[]): Record<string, number> => {
  const TOTAL_GAME_MINUTES = 240;
  const STARTER_TOTAL = 151.2;
  const BENCH_TOTAL = 88.8;

  // Identify starters (respect isStarter if exactly 5, otherwise top 5 OVR)
  let starters = roster.filter(p => p.isStarter);
  if (starters.length !== 5) {
    starters = [...roster].sort((a, b) => b.overall - a.overall).slice(0, 5);
  }

  const starterIds = new Set(starters.map(p => p.id));
  const bench = roster.filter(p => !starterIds.has(p.id));

  const result: Record<string, number> = {};

  // 1. Starters Logic (151.2 total) - Distribute by OVR weight
  const starterOVRSum = starters.reduce((sum, p) => sum + p.overall, 0);
  let starterMinsRemaining = STARTER_TOTAL;

  starters.sort((a, b) => b.overall - a.overall).forEach((p, i) => {
    if (i === starters.length - 1) {
      result[p.id] = Math.max(0, starterMinsRemaining);
    } else {
      const weight = p.overall / starterOVRSum;
      const allocated = STARTER_TOTAL * weight;
      result[p.id] = allocated;
      starterMinsRemaining -= allocated;
    }
  });

  // 2. Bench Logic (88.8 total) - Weighted Rank System
  if (bench.length > 0) {
    const lowestStarterMins = Math.min(...starters.map(s => result[s.id]));
    const lowestStarterOVR = Math.min(...starters.map(s => s.overall));
    
    const benchRotation = getBenchRotation(bench, BENCH_TOTAL, lowestStarterMins, lowestStarterOVR);
    Object.assign(result, benchRotation);
  }

  // Final Sum Check & Normalization to exactly 240
  const finalTotal = Object.values(result).reduce((sum, m) => sum + m, 0);
  const diff = TOTAL_GAME_MINUTES - finalTotal;

  if (Math.abs(diff) > 0.0001) {
    // Apply diff to the top player
    const topPlayerId = [...roster].sort((a, b) => b.overall - a.overall)[0].id;
    result[topPlayerId] = (result[topPlayerId] || 0) + diff;
  }

  return result;
};

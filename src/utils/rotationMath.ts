import { Player } from '../types/save';

/**
 * Calculates dynamic minute distribution for a team's roster using a strict 63/37 hierarchy.
 * Total Minutes = 240.
 * Starters (1-5) = 151.2 Mins.
 * Bench (6+) = 88.8 Mins.
 */
export const calculateGameMinutes = (roster: Player[]): Record<string, number> => {
  const TOTAL_GAME_MINUTES = 240;
  const STARTER_TOTAL = 151.2;
  const BENCH_TOTAL = 88.8;

  // Sort strictly by OVR descending to identify starters (top 5) and bench
  const sortedRoster = [...roster].sort((a, b) => b.overall - a.overall);

  const starters = sortedRoster.slice(0, 5);
  const bench = sortedRoster.slice(5);

  const result: Record<string, number> = {};

  // 1. Starters Logic (151.2 total) - Distribute by OVR weight
  const starterOVRSum = starters.reduce((sum, p) => sum + p.overall, 0);
  let starterMinsRemaining = STARTER_TOTAL;

  starters.forEach((p, i) => {
    if (i === starters.length - 1) {
      result[p.id] = Math.max(0, starterMinsRemaining);
    } else {
      const weight = p.overall / starterOVRSum;
      const allocated = STARTER_TOTAL * weight;
      result[p.id] = allocated;
      starterMinsRemaining -= allocated;
    }
  });

  // 2. Bench Logic (88.8 total) - Distribute by OVR weight
  if (bench.length > 0) {
    const benchOVRSum = bench.reduce((sum, p) => sum + p.overall, 0);
    let benchMinsRemaining = BENCH_TOTAL;

    bench.forEach((p, i) => {
      if (i === bench.length - 1) {
        result[p.id] = Math.max(0, benchMinsRemaining);
      } else {
        const weight = p.overall / benchOVRSum;
        const allocated = BENCH_TOTAL * weight;
        result[p.id] = allocated;
        benchMinsRemaining -= allocated;
      }
    }
    );
  }

  // Final Sum Check & Adjustment (Normalization to exactly 240)
  const finalTotal = Object.values(result).reduce((sum, m) => sum + m, 0);
  const diff = TOTAL_GAME_MINUTES - finalTotal;

  if (Math.abs(diff) > 0.0001) {
    const topPlayerId = sortedRoster[0].id;
    result[topPlayerId] += diff;
  }

  return result;
};

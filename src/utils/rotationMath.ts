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

  // Sorting strictly to identify starters and hierarchical bench
  const sortedRoster = [...roster].sort((a, b) => {
    // Priority: starters first, then by overall
    if (a.isStarter && !b.isStarter) return -1;
    if (!a.isStarter && b.isStarter) return 1;
    return b.overall - a.overall;
  });

  const starters = sortedRoster.slice(0, 5);
  const bench = sortedRoster.slice(5);

  const result: Record<string, number> = {};

  // 1. Starters Logic (151.2 total)
  const starterWeightSum = starters.reduce((sum, p) => sum + p.overall, 0);
  let starterMinsRemaining = STARTER_TOTAL;

  starters.forEach((p, i) => {
    if (i === starters.length - 1) {
      result[p.id] = Math.max(0, starterMinsRemaining);
    } else {
      // Allocate based on overall, aiming for ~34-36 for stars, ~26-28 for low-tier
      const weight = (p.overall / starterWeightSum);
      // Base is 30.24 (151.2 / 5). We vary it by performance.
      let allocated = (STARTER_TOTAL / 5) * (1 + (weight - 0.2) * 1.5); 
      
      // Clamp to realistic NBA starter minutes
      allocated = Math.max(24, Math.min(38, allocated));
      result[p.id] = allocated;
      starterMinsRemaining -= allocated;
    }
  });

  // 2. Bench Logic (88.8 total)
  if (bench.length > 0) {
    const benchWeightSum = bench.reduce((sum, p, i) => {
      // Positional decay: top bench (6th man) gets more weight
      return sum + (p.overall / (i + 1));
    }, 0);
    
    let benchMinsRemaining = BENCH_TOTAL;
    bench.forEach((p, i) => {
      if (i === bench.length - 1) {
        result[p.id] = Math.max(0, benchMinsRemaining);
      } else {
        const weight = (p.overall / (i + 1));
        let allocated = (BENCH_TOTAL * (weight / benchWeightSum));
        
        // Clamp 6th man to ~24, others to ~4-8
        if (i === 0) allocated = Math.min(28, Math.max(20, allocated));
        else allocated = Math.max(2, Math.min(18, allocated));
        
        result[p.id] = allocated;
        benchMinsRemaining -= allocated;
      }
    });
  }

  // Final Sum Check & Adjustment (Normalization to exactly 240)
  const finalTotal = Object.values(result).reduce((sum, m) => sum + m, 0);
  const diff = TOTAL_GAME_MINUTES - finalTotal;

  if (Math.abs(diff) > 0.0001) {
    // Distribute diff to the player with the most minutes
    const topPlayerId = sortedRoster[0].id;
    result[topPlayerId] += diff;
  }

  return result;
};

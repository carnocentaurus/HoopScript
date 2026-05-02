export const POSITION_ORDER: Record<string, number> = {
  'PG': 1,
  'SG': 2,
  'SF': 3,
  'PF': 4,
  'C': 5
};

/**
 * Sorts a roster or a list of player stats.
 * Starters: Sorted by POSITION_ORDER (PG -> C), then overall.
 * Bench: Sorted strictly by overall rating (highest first).
 */
export const sortRosterByPosition = <T extends { position: string, overall: number, isStarter?: boolean }>(players: T[]): T[] => {
  const starters = players.filter(p => p.isStarter);
  const bench = players.filter(p => !p.isStarter);

  const sortedStarters = [...starters].sort((a, b) => {
    const orderA = POSITION_ORDER[a.position] || 99;
    const orderB = POSITION_ORDER[b.position] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return b.overall - a.overall;
  });

  const sortedBench = [...bench].sort((a, b) => b.overall - a.overall);

  return [...sortedStarters, ...sortedBench];
};

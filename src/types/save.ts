export interface SeasonStats {
  gamesPlayed: number;
  gamesStarted: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fgm: number;
  fga: number;
  threePM: number;
  threePA: number;
  oreb: number;
  dreb: number;
  plusMinus: number;
  min: number;
  possessions?: number;
}

export interface BoxScore {
  gameId: string;
  opponent: string;
  date: number;
  isWin: boolean;
  score: string;
  playerStats: Record<string, PlayerGameStats>;
}

export interface PlayerGameStats {
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fgm: number;
  fga: number;
  threePM: number;
  threePA: number;
  min: number;
  plusMinus: number;
}

export interface Player {
  id: string;
  lastName: string;
  age: number;
  number: number;
  position: string;
  isStarter: boolean;
  offense: number;
  defense: number;
  overall: number;
  heightFactor: number;
  speedFactor: number;
  isRookie?: boolean;
  stats: SeasonStats;
  gameHistory?: BoxScore[];
  // Simulation Ratings
  usgRate: number;     // 5 to 35
  tsPct: number;      // 0.45 to 0.65
  blkRate: number;    // 0 to 10
  stlRate: number;    // 0 to 10
  tovRate: number;    // 5 to 25
  targetMinutes: number;
}

export interface TeamStanding {
  city: string;
  wins: number;
  losses: number;
  streak: number; // Positive for wins, negative for losses
  conf: 'East' | 'West';
  roster: Player[];
  coachingIQ: number;
  predictability: number;
  pace: number; // Team possessions per game
}

export interface PlayoffSeries {
  round: number;
  opponentCity: string;
  myWins: number;
  oppWins: number;
  isEliminated: boolean;
  isChampion: boolean;
}

export interface SeriesMatchup {
  id: string;
  round: number;
  highSeed: string;
  lowSeed: string;
  highSeedWins: number;
  lowSeedWins: number;
  isCompleted: boolean;
  conference: 'East' | 'West' | 'Finals';
}

export interface SeasonHistory {
  seasonIndex: number; // e.g., 1, 2, 3...
  year: number;
  champion: string;
  championRecord: string;
  championRank: string;
  userRecord: string; // e.g., "50-32"
  userRank: string;   // e.g., "3rd in West"
  standings?: TeamStanding[];
  playoffBracket?: SeriesMatchup[];
}

export interface DraftPick {
  round: number;
  overall: number; // 1 to 60
  teamCity: string;
  player?: Player;
}

export interface LotteryResult {
  city: string;
  rank: number;
  pick: number;
  conference?: 'East' | 'West';
  confRank?: number;
}

export interface DraftState {
  currentPickIndex: number;
  picks: DraftPick[];
  pool: Player[];
  isCompleted: boolean;
}

export enum OffensiveFocus {
  ATTACK_PAINT = 'Attack Paint',
  PACE_SPACE = 'Pace & Space',
  ISO_STAR = 'Iso-Star'
}

export enum DefensiveFocus {
  PROTECT_RIM = 'Protect Rim',
  PERIMETER_LOCK = 'Perimeter Lock',
  DOUBLE_TEAM = 'Double Team'
}

export interface Strategy {
  offense: OffensiveFocus;
  defense: DefensiveFocus;
}

export interface ScoutReport {
  city: string;
  predictedOffense: OffensiveFocus;
  predictedDefense: DefensiveFocus;
  actualStrategy: Strategy;
  coachingIQ: number;
  predictability: number;
  uncertaintyHigh: boolean;
  possibleStrategies?: Strategy[];
}

export interface GameSave {
  id: string;
  name: string;
  slotId: number;
  city: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  totalGames: number;
  rank: number;
  conference: 'East' | 'West';
  roster: Player[];
  schedule: string[];
  scheduleHomeStatus: boolean[]; // true if home, false if away
  standings: TeamStanding[];
  playoffs: PlayoffSeries | null;
  playoffBracket: SeriesMatchup[] | null;
  history: SeasonHistory[];
  startYear: number;
  currentYear: number;
  seasonCount: number;
  draftState?: DraftState | null;
  lotteryResults?: LotteryResult[] | null;
  lastView?: string;
  coachingIQ: number;
  predictability: number;
  currentStrategy: Strategy;
  lastScoutReport?: ScoutReport | null;
}

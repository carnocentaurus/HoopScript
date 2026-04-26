export interface SeasonStats {
  gamesPlayed: number;
  gamesStarted: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  threePM: number;
  oreb: number;
  dreb: number;
  plusMinus: number;
  fgm: number;
  fga: number;
  min: number;
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
}

export interface TeamStanding {
  city: string;
  wins: number;
  losses: number;
  conf: 'East' | 'West';
  roster: Player[];
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
}

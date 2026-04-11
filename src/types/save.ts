export interface Player {
  id: string;        // Added
  lastName: string;
  number: number;    // Added
  position: string;
  isStarter: boolean; // Added
  offense: number;
  defense: number;
  overall: number;
  heightFactor: number; // Added
  speedFactor: number;  // Added
}

export interface TeamStanding {
  city: string;
  wins: number;
  losses: number;
  conf: 'East' | 'West';
  roster?: Player[];
}

// Fixed PlayoffSeries definition
export interface PlayoffSeries {
  round: number;
  opponentCity: string;
  myWins: number;
  oppWins: number;
  isEliminated: boolean;
  isChampion: boolean;
}

// Added the missing SeriesMatchup interface
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
  standings: TeamStanding[];
  playoffs: PlayoffSeries | null;
  playoffBracket: SeriesMatchup[] | null;
  startYear: number;   // The year the user chose
  currentYear: number; // The year they are currently in
  seasonCount: number; // Starts at 1
}
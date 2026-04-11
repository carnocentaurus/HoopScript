export interface SeasonStats {
  gamesPlayed: number;
  gamesStarted: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fgm: number;
  fga: number;
  min: number;
}

export interface Player {
  id: string;
  lastName: string;
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

export interface AwardWinner {
  playerId: string;
  playerName: string;
  teamCity: string;
  value: number; // The stat or score that won it
}

export interface SeasonAwards {
  mvp: AwardWinner;
  dpoy: AwardWinner;
  roty: AwardWinner;
  sixMan: AwardWinner;
  ptsLeader: AwardWinner;
  rebLeader: AwardWinner;
  astLeader: AwardWinner;
  stlLeader: AwardWinner;
  blkLeader: AwardWinner;
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
  awards: SeasonAwards | null;
  startYear: number;
  currentYear: number;
  seasonCount: number;
}

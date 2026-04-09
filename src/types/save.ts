import { Player } from '../utils/rosterGenerator';

export interface LeagueTeam {
  city: string;
  wins: number;
  losses: number;
  conf: 'East' | 'West';
  roster: Player[];
}

export interface PlayoffSeries {
  round: number;
  opponentCity: string;
  myWins: number;    // Changed from mySeriesWins
  oppWins: number;   // Changed from oppSeriesWins
  isEliminated: boolean;
  isChampion: boolean;
}

export interface GameSave {
  slotId: number;
  city: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  totalGames: number;
  roster: Player[];
  conference: 'East' | 'West';
  rank: number;
  schedule: string[]; // List of city names for all 82 games
  standings: LeagueTeam[]; // Record of every team in the league
  playoffs: PlayoffSeries | null;
}
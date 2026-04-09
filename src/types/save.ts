import { Player } from '../utils/rosterGenerator';

export interface LeagueTeam {
  city: string;
  wins: number;
  losses: number;
  conf: 'East' | 'West';
  roster: Player[];
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
  // NEW FIELDS
  schedule: string[]; // List of city names for all 82 games
  standings: LeagueTeam[]; // Record of every team in the league
}
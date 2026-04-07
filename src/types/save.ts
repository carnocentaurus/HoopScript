import { Player } from '../utils/rosterGenerator';

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
}
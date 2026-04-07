import { LeagueTeam } from '../types/save';

export const ALL_CITIES = [
  "Toronto", "Boston", "New York", "Brooklyn", "Philadelphia",
  "Chicago", "Cleveland", "Detroit", "Indiana", "Milwaukee",
  "Atlanta", "Charlotte", "Miami", "Orlando", "Washington",
  "Denver", "Minnesota", "Oklahoma City", "Portland", "Utah",
  "San Francisco", "Phoenix", "Sacramento", "Los Angeles", "San Diego",
  "Dallas", "Houston", "Memphis", "New Orleans", "San Antonio"
];

export const generateInitialStandings = (): LeagueTeam[] => {
  return ALL_CITIES.map(city => ({
    city,
    wins: 0,
    losses: 0,
    conf: ALL_CITIES.indexOf(city) < 15 ? 'East' : 'West'
  }));
};

export const generateSchedule = (userCity: string): string[] => {
  const opponents = ALL_CITIES.filter(city => city !== userCity);
  let schedule: string[] = [];
  
  // Create 82 games by cycling through opponents
  for (let i = 0; i < 82; i++) {
    schedule.push(opponents[i % opponents.length]);
  }
  
  // Shuffle the schedule so it's not predictable
  return schedule.sort(() => Math.random() - 0.5);
};
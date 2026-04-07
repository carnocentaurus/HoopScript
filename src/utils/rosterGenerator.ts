const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const POSITIONS = ["PG", "SG", "SF", "PF", "C"];

export interface Player {
  id: string;
  lastName: string;
  number: number;
  rating: number;
  position: string;
  isStarter: boolean;
}

export const generateRoster = (): Player[] => {
  const roster: Player[] = [];
  
  for (let i = 0; i < 15; i++) {
    const isStarter = i < 5;
    roster.push({
      id: Math.random().toString(36).substr(2, 9),
      lastName: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)],
      number: Math.floor(Math.random() * 100), // 0-99
      rating: isStarter 
        ? Math.floor(Math.random() * 15) + 80  // Starters: 80-95
        : Math.floor(Math.random() * 15) + 65, // Bench: 65-80
      position: isStarter ? POSITIONS[i] : POSITIONS[Math.floor(Math.random() * 5)],
      isStarter,
    });
  }
  return roster;
};
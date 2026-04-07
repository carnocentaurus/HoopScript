import React, { useState, useEffect } from 'react';
import LoadingScreen from './src/screens/LoadingScreen';
import SelectSave from './src/screens/SelectSave';
import TeamSelection from './src/screens/TeamSelection';
import TeamOverview from './src/screens/TeamOverview';
import HomeScreen from './src/screens/HomeScreen';
import QuickSimScreen from './src/screens/QuickSimScreen'; // Ensure this is created
import { GameSave } from './src/types/save';
import { generateRoster } from './src/utils/rosterGenerator';
import { GameResult } from './src/utils/gameSim'; // We will refine this next

// Added 'quickSim' to the view states
type ViewState = 'loading' | 'saveSelection' | 'teamSelection' | 'teamOverview' | 'home' | 'quickSim';

export default function App() {
  const [view, setView] = useState<ViewState>('loading');
  const [saves, setSaves] = useState<(GameSave | null)[]>([null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [tempCity, setTempCity] = useState<string | null>(null);

  // Placeholder for the next opponent logic
  const [currentOpponent] = useState({
    city: "Chicago",
    record: "12-8",
    rank: "4th",
    isHome: false
  });

  useEffect(() => {
    const timer = setTimeout(() => setView('saveSelection'), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectSlot = (slotId: number) => {
    setActiveSlot(slotId);
    const existingSave = saves[slotId - 1]; // Array is 0-indexed, slots are 1-3
    if (existingSave) {
      setView('home');
    } else {
      setView('teamSelection');
    }
  };

  const handleTeamSelect = (city: string) => {
    setTempCity(city);
    setView('teamOverview');
  };

  const handleConfirmTeam = () => {
    if (!tempCity || activeSlot === null) return;

    const newSave: GameSave = {
      slotId: activeSlot,
      city: tempCity,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      totalGames: 82,
      rank: 15,
      // Simple logic: add more teams here as you expand
      conference: ['Toronto', 'Boston', 'New York', 'Brooklyn', 'Philadelphia'].includes(tempCity) ? 'East' : 'West', 
      roster: generateRoster()
    };

    const newSaves = [...saves];
    newSaves[activeSlot - 1] = newSave;
    setSaves(newSaves);
    setView('home');
  };

  // Logic to process the game result and update the save state
  const handleGameFinish = (result: GameResult) => {
    if (activeSlot === null) return;

    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];

    if (currentSave) {
      const isWin = result.myScore > result.oppScore;
      
      // Update W-L Record
      currentSave.wins += isWin ? 1 : 0;
      currentSave.losses += isWin ? 0 : 1;
      currentSave.gamesPlayed += 1;

      // Simple Rank Logic: Up 1 on win, down 1 on loss (capped 1-15)
      if (isWin && currentSave.rank > 1) currentSave.rank -= 1;
      if (!isWin && currentSave.rank < 15) currentSave.rank += 1;

      setSaves(updatedSaves);
      setView('home'); 
    }
  };

  // --- Rendering Logic ---

  if (view === 'loading') return <LoadingScreen />;
  
  if (view === 'saveSelection') {
    return <SelectSave saves={saves} onSelectSlot={handleSelectSlot} />;
  }

  if (view === 'teamSelection') {
    return <TeamSelection onSelectTeam={handleTeamSelect} />;
  }

  if (view === 'teamOverview' && tempCity) {
    return <TeamOverview city={tempCity} onConfirm={handleConfirmTeam} />;
  }

  if (view === 'home' && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    return activeSave ? (
      <HomeScreen 
        save={activeSave} 
        onQuickSim={() => setView('quickSim')} 
      />
    ) : null;
  }

  if (view === 'quickSim' && activeSlot !== null) {
    const activeSave = saves[activeSlot - 1];
    return activeSave ? (
      <QuickSimScreen 
        save={activeSave} 
        opponent={currentOpponent} 
        onFinish={handleGameFinish} 
      />
    ) : null;
  }

  return null;
}
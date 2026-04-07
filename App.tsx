import React, { useState, useEffect } from 'react';
import LoadingScreen from './src/screens/LoadingScreen';
import SelectSave from './src/screens/SelectSave';
import TeamSelection from './src/screens/TeamSelection';
import TeamOverview from './src/screens/TeamOverview';
import HomeScreen from './src/screens/HomeScreen';
import { GameSave } from './src/types/save';
import { generateRoster } from './src/utils/rosterGenerator';

type ViewState = 'loading' | 'saveSelection' | 'teamSelection' | 'teamOverview' | 'home';

export default function App() {
  const [view, setView] = useState<ViewState>('loading');
  const [saves, setSaves] = useState<(GameSave | null)[]>([null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [tempCity, setTempCity] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setView('saveSelection'), 3000);
  }, []);

  const handleSelectSlot = (slotId: number) => {
    setActiveSlot(slotId);
    const existingSave = saves.find(s => s?.slotId === slotId);
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
      conference: ['Toronto', 'Boston', 'New York'].includes(tempCity) ? 'East' : 'West', // Simplified logic
      roster: generateRoster()
    };

    const newSaves = [...saves];
    newSaves[activeSlot - 1] = newSave;
    setSaves(newSaves);
    setView('home');
  };

  if (view === 'loading') return <LoadingScreen />;
  if (view === 'saveSelection') return <SelectSave saves={saves} onSelectSlot={handleSelectSlot} />;
  if (view === 'teamSelection') return <TeamSelection onSelectTeam={handleTeamSelect} />;
  if (view === 'teamOverview' && tempCity) return <TeamOverview city={tempCity} onConfirm={handleConfirmTeam} />;
  if (view === 'home' && activeSlot) {
    const activeSave = saves[activeSlot - 1];
    return activeSave ? <HomeScreen save={activeSave} onQuickSim={() => console.log("Simulating...")} /> : null;
  }

  return null;
}
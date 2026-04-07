import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './src/screens/LoadingScreen';
import SelectSave from './src/screens/SelectSave';
import TeamSelection from './src/screens/TeamSelection';
import TeamOverview from './src/screens/TeamOverview';
import HomeScreen from './src/screens/HomeScreen';
import QuickSimScreen from './src/screens/QuickSimScreen';
import { GameSave } from './src/types/save';
import { generateRoster } from './src/utils/rosterGenerator';
import { GameResult } from './src/utils/gameSim';

type ViewState = 'loading' | 'saveSelection' | 'teamSelection' | 'teamOverview' | 'home' | 'quickSim';

const STORAGE_KEY = '@hoopscript_saves';

export default function App() {
  const [view, setView] = useState<ViewState>('loading');
  const [saves, setSaves] = useState<(GameSave | null)[]>([null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [tempCity, setTempCity] = useState<string | null>(null);

  // Loading States
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [isTimerDone, setIsTimerDone] = useState(false);

  const [currentOpponent] = useState({
    city: "Chicago",
    record: "12-8",
    rank: "4th",
    isHome: false
  });

  // 1. App Initialization: Load Data & Run Timer
  useEffect(() => {
    const loadSaves = async () => {
      try {
        const storedSaves = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedSaves) {
          setSaves(JSON.parse(storedSaves));
        }
      } catch (e) {
        console.error("Failed to load saves from storage", e);
      } finally {
        setIsStorageLoaded(true);
      }
    };

    loadSaves();

    const timer = setTimeout(() => {
      setIsTimerDone(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // 2. Wait for BOTH the 3-second timer and storage to finish loading
  useEffect(() => {
    if (isStorageLoaded && isTimerDone) {
      setView('saveSelection');
    }
  }, [isStorageLoaded, isTimerDone]);

  // Helper to save data to the phone
  const persistSaves = async (newSaves: (GameSave | null)[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSaves));
    } catch (e) {
      console.error("Failed to save data to storage", e);
    }
  };

  const handleSelectSlot = (slotId: number) => {
    setActiveSlot(slotId);
    const existingSave = saves[slotId - 1];
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
      conference: ['Toronto', 'Boston', 'New York', 'Brooklyn', 'Philadelphia'].includes(tempCity) ? 'East' : 'West',
      roster: generateRoster()
    };

    const newSaves = [...saves];
    newSaves[activeSlot - 1] = newSave;
    
    setSaves(newSaves);
    persistSaves(newSaves); // Write to device storage
    setView('home');
  };

  const handleGameFinish = (result: GameResult) => {
    if (activeSlot === null) return;

    const updatedSaves = [...saves];
    const currentSave = updatedSaves[activeSlot - 1];

    if (currentSave) {
      const isWin = result.myScore > result.oppScore;
      
      currentSave.wins += isWin ? 1 : 0;
      currentSave.losses += isWin ? 0 : 1;
      currentSave.gamesPlayed += 1;

      if (isWin && currentSave.rank > 1) currentSave.rank -= 1;
      if (!isWin && currentSave.rank < 15) currentSave.rank += 1;

      setSaves(updatedSaves);
      persistSaves(updatedSaves); // Write to device storage
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